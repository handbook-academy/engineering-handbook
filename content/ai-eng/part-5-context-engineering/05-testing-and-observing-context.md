---
title: "Testing and observing context"
description: "Snapshot the assembled context, regression-test the assembly logic, and capture traces that can answer why the model saw what it saw."
slug: 05-testing-and-observing-context
part: 5
chapter: 5
difficulty: intermediate
prerequisites:
  - 00-context-is-more-than-the-prompt
  - 01-context-assembly-and-routing
  - part-4-eval-fundamentals/02-your-first-eval-set
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Testing and observing context

A team ships on a Tuesday. The CI suite is green. By Wednesday morning, support is filing tickets: the assistant has stopped citing sources. Someone pulls up the test report and finds 47 prompt snapshots that were "updated" in last week's PRs, mostly with a single line of justification: *regenerated*. Nobody read the diffs. The cited-sources line had been quietly dropped from the system message six commits ago.

That story is the failure mode you're trying to prevent. Your context is the messages array your code assembled and sent to the model: system instructions, retrieved documents, conversation history, tool schemas, the user's turn. The model never echoes it back. Your logs probably don't store it. And once you wire it into a CI snapshot, the natural temptation is to treat the snapshot the same way you treat the model's reply, which is the bug.

The fix is to test the context in two completely separate places, with two different kinds of assertions, because your context lives across two layers that fail differently.

## Two layers, two test strategies

The first layer is your **assembly code**: the function that takes a user query, the retrieved chunks, the conversation history, and the prompt template, and returns a `messages` array. Given the same inputs, it returns the same output. It's plain deterministic Python. You can hash it, diff it, and run a thousand assertions against it for free, with no API calls.

The second layer is the **model's behavior** when you send that array. It's stochastic. The same input can return different outputs, the provider can patch the model behind your back, and "exact string match" is the wrong assertion for everything that lives on this side of the line.

![A vertical dashed line splits the canvas: on the left, an assembly code workspace with property tests, hash snapshot, and token-budget check feeding into a green CI banner; on the right, a stochastic model layer with a golden cohort, an aggregate score gate, and an LLM-as-judge feeding into a yellow pre-deploy banner; an arrow labeled "messages[]" crosses the boundary in the middle](images/05-two-layer-testing.png)
*Test the assembly with hashes and properties; test the model's behavior with cohort gates. The boundary is the moment your code calls the provider.*

The teams that get this wrong put both layers in one test: a snapshot that pickles the assembled messages *and* the model's reply, asserts both, and runs it on every PR. That suite produces noisy diffs from model patches, slow CI from real API calls, and a cultural habit of regenerating snapshots without reading them. Within a few months, it stops catching anything.[^1] Split the layers and each test does one job well.

## Snapshot the assembled messages, nothing more

The cheapest useful test you can write is a hash of the assembled context. Run your assembly function against a fixed input, serialize the messages array, take the SHA-256, and commit that hash to the repo. On the next PR, recompute the hash; if it differs, fail the build until a human reviews the diff.

```python
import hashlib
import json

def snapshot_context(name: str, messages: list[dict]) -> dict:
    """Serialize and hash assembled context for snapshot storage."""
    serialized = json.dumps(messages, sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(serialized.encode()).hexdigest()
    return {"name": name, "messages": messages, "sha256": digest}


def assert_snapshot(current: dict, stored: dict) -> None:
    """Fail if the assembled context changed without a deliberate update."""
    if current["sha256"] != stored["sha256"]:
        raise AssertionError(
            f"Context snapshot mismatch for '{current['name']}'. "
            "Run with --update-snapshots to accept the change."
        )
```

That's the whole mechanism. Freeday, an AI product team shipping multiple deploys per day, runs exactly this pattern: name plus messages plus hash, three fields, total CI time around two minutes. The hash gate decides whether to trigger their slow LLM eval suite at all, so most PRs never spend a token.[^2]

What this catches is the silent stuff. A retriever refactor that reorders documents. A template change that drops the system message. A new injection rule that quietly puts user content above the instructions. The hash flips, the diff lands in the PR, and someone has to read it. What it doesn't catch is whether the context is *correct*: a snapshot of a broken assembly will pass forever. That's not a flaw, it's the contract. The snapshot's job is to detect change, not to judge content.

One mistake to avoid: don't run the snapshot test against a live retriever or a live embedding API. CI flakes on network errors, your test data drifts, and the team disables the suite within a quarter. Pin the retrieved documents as a JSON fixture in the repo and feed that into the assembly function. Reserve the live-retrieval path for a slower integration tier.

## Property tests catch what hashes miss

A hash tells you something changed. A property test tells you what's *always supposed to be true*, regardless of input. Write a handful of these for any non-trivial assembly function and they'll outlive every prompt rewrite, model swap, and retriever upgrade you ship.

```python
def build_context(user_query: str, retrieved_docs: list[str]) -> list[dict]:
    system = "You are a helpful assistant. Answer using only the provided documents."
    context_block = "\n\n".join(f"[Doc {i+1}]: {d}" for i, d in enumerate(retrieved_docs))
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": f"{context_block}\n\nQuestion: {user_query}"},
    ]


def test_system_message_first():
    ctx = build_context("query", ["doc1"])
    assert ctx[0]["role"] == "system", "System message must be first"


def test_all_docs_included():
    ctx = build_context("q", ["alpha", "beta", "gamma"])
    user_content = ctx[-1]["content"]
    for doc in ["alpha", "beta", "gamma"]:
        assert doc in user_content, f"Missing doc: {doc}"


def test_token_budget(tokenizer, max_tokens=8000):
    ctx = build_context("q" * 100, ["d" * 4000] * 5)
    total = sum(len(tokenizer.encode(m["content"])) for m in ctx)
    assert total < max_tokens, f"Context exceeds budget: {total}"
```

These three assertions encode invariants that every version of `build_context` should respect. They survive prompt edits because they don't pin specific wording. They survive model upgrades because they don't call the model. And they catch the one class of bug that hash snapshots can't: the bug that's correct on the test input but breaks on a slightly different one. A common set worth writing for almost any assembly function:

- The system message exists and is first.
- Every retrieved document the caller passed in shows up somewhere in the user message.
- The total token count stays below the model's context limit on a worst-case input.
- Roles are all valid (`system`, `user`, `assistant`, `tool`).
- No two consecutive messages from the same role (most providers reject that).

## Don't snapshot model responses: gate on a cohort

If you've split assembly from behavior, the question becomes how to test behavior. The wrong answer is a snapshot of the model's reply. Provider models drift constantly: silent patches, alias repointings, version sunsets. A study by Ma et al. on five GPT-3.5 versions across 18 months found that 58.8% of prompt-and-model combinations dropped accuracy after at least one update, and 70.2% of those drops exceeded five percentage points.[^3] Even when overall accuracy improved, 10.9% of previously-correct predictions regressed, often at maximum model confidence. A single update of `gpt-3.5-turbo` dropped accuracy 9.6% for one prompt design while *raising* it 5.1% for another on the exact same task.

That's the world a response snapshot lives in. It will fail on the noise and miss the signal.

The right tool is a golden cohort: 50 to 300 representative inputs, evaluated on your current assembly plus your current model, with the aggregate score recorded as a baseline. When you change the assembly, re-run the cohort and compare aggregates with a tolerance gate (around 2% degradation is a common starting point). The assertion is statistical, so model drift doesn't whipsaw it; the cohort is large enough that one weird sample doesn't fail the build.

Two operational rules make cohort gates work over time. First, track the prompt version and the model version *together* in every cohort run, because the same model update affects different prompts differently. Second, slice the cohort by category (intent, language, document type, user tier) and gate on each slice independently, because aggregate accuracy can stay flat while a single slice quietly collapses 15%. Build that slicing in from day one; retrofitting it after an incident is painful.

[Your first eval set](../part-4-eval-fundamentals/02-your-first-eval-set.md) covers how to assemble the cohort itself. The job here is wiring the cohort into the loop: the snapshot hash gates whether the cohort even runs. If the assembled context is byte-identical to last time, the cohort hasn't seen anything new, and you save the API spend.

## In production, capture what the model actually saw

Tests prove things on canned inputs. Production runs on whatever your users send, and at 3 a.m. when an incident page fires, the only question that matters is: *what did the model see?* If your traces don't answer that, you're guessing.

The OpenTelemetry GenAI semantic conventions, at v1.41 in mid-2026, define exactly this. A `chat {model}` span carries the system instructions, the input messages, the tool definitions, and the output messages as structured attributes, alongside vendor-neutral usage counters that work across OpenAI, Anthropic, Google, and the rest.[^4] The convention is at "Development" status, so attribute names can still shift; pin to a specific version in your dashboards and follow the changelog.

```python
from opentelemetry import trace
import json

tracer = trace.get_tracer("my-app")

def trace_llm_call(messages: list[dict], model: str, capture_content: bool = False):
    with tracer.start_as_current_span(f"chat {model}") as span:
        span.set_attribute("gen_ai.operation.name", "chat")
        span.set_attribute("gen_ai.provider.name", "openai")
        span.set_attribute("gen_ai.request.model", model)
        if capture_content:
            span.set_attribute(
                "gen_ai.system_instructions",
                json.dumps([m for m in messages if m["role"] == "system"]),
            )
            span.set_attribute(
                "gen_ai.input.messages",
                json.dumps([m for m in messages if m["role"] != "system"]),
            )
        # set after the call returns
        span.set_attribute("gen_ai.usage.input_tokens", 120)
        span.set_attribute("gen_ai.usage.output_tokens", 45)
```

The flag matters. The spec says instrumentations *should not* capture content attributes by default, because messages are large and often contain user PII. Run with `capture_content=True` in dev and staging without ceremony. In production, sample (5% is a reasonable starting point) or store the content in object storage and put a reference on the span. The worst configuration is the one where you can't choose: content always on (compliance risk) or always off (no debugging).

Auto-instrumentation handles most of the boilerplate. Traceloop's OpenLLMetry wraps the OpenAI, Anthropic, and LangChain SDKs and emits these attributes automatically; it ships to any OTLP backend you already run, including Datadog, Honeycomb, and Grafana Tempo. Arize Phoenix, LangSmith, and Langfuse offer hosted backends with prompt-aware UIs on top. Pick one based on whether you already use LangChain (LangSmith), want self-hostable open source (Langfuse, Phoenix), or want LLM traces inside your existing observability stack (OpenLLMetry plus whatever you have).

## Pin the prompt version on every span

There's one more attribute you almost certainly want on every generation span, and the convention doesn't standardize it yet: which prompt version was in use. The reason is the question that gets asked in every incident review. *Was the regression in v12 or v13?* If your trace records `gpt-4o` and a token count but not the prompt version integer, the post-mortem is guesswork.

Both Langfuse and LangSmith solve this with an immutable-version-plus-mutable-label pattern. Each edit to a prompt creates a new integer version (immutable). Labels like `production`, `staging`, or `experiment-a` are mutable pointers to a specific version. Your application code references the label, never the integer; deploying a prompt change is reassigning `production` from v12 to v13, no code change needed. Rolling back is reassigning the label back to v12.

The key trick is what gets logged. The trace records the *integer* (v13) the request actually used, alongside the label (`production`). When the label gets reassigned mid-incident, your traces still tell the truth about which version each request hit. Combine that with `gen_ai.response.model` (which captures what the provider actually served, distinct from what you requested), and you can answer both halves of "why did the model see that?": your prompt version, and the provider's model version, on every span.

One gotcha worth knowing about. The Langfuse SDK caches fetched prompts in-process for 60 seconds by default with a stale-while-revalidate refresh. After you reassign the `production` label, already-running app instances keep serving the old version for up to the cache TTL, then return the stale version one more time while refreshing in the background. So a "deployed at 14:00" prompt change can still be serving the old version at 14:02. That's fine for most edits and a problem for security-critical ones; pass `cache_ttl_seconds=0` on those calls to bypass the cache, or use the Langfuse fallback prompt feature to guarantee availability.[^5]

## The loop, end to end

Once you wire all this together, debugging a regression follows a fixed shape. A user reports a bad answer. You pull the trace, read the exact `messages` array the model received, see the prompt version (v13) and the response model (`gpt-4o-2024-11-20`), and copy that input into your local repro. You add the failing case to the golden cohort, watch the cohort score drop below the gate, and that becomes a real test that any future fix has to pass. If the issue is in the assembly, the next PR's hash flips and a property test pinpoints the broken invariant. If the issue is in the model behavior, the cohort gate catches it and tells you whether to roll the prompt back to v12 or pin the model to a stable snapshot.

That loop is the whole point. Treat your context like the versioned, testable artifact it actually is, and "why did the model see that?" stops being a mystery and becomes a query against your traces.

## References

[^1]: Tian Pan, "Snapshot Tests Lie When Your Model Is Stochastic," tianpan.co, May 2, 2026. https://tianpan.co/blog/2026-05-02-snapshot-tests-lie-when-model-stochastic

[^2]: Nemanja Ninkovic, "Prompt snapshot testing," ninkovic.dev, May 2025. https://ninkovic.dev/blog/2025/prompt-snapshot-testing

[^3]: Wanqin Ma, Chenyang Yang, and Christian Kastner, "(Why) Is My Prompt Getting Worse? Rethinking Regression Testing for Evolving LLM APIs," CAIN 2024, ACM. https://arxiv.org/abs/2311.11123

[^4]: OpenTelemetry Authors, "Semantic conventions for generative client AI spans," OpenTelemetry Semantic Conventions v1.41.1, June 2026. https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/

[^5]: Langfuse, "Prompt Management: Core Concepts" and "SDK-level prompt caching changelog," langfuse.com, 2024-2025. https://langfuse.com/docs/prompt-management/data-model and https://langfuse.com/changelog/2024-02-05-sdk-level-prompt-caching

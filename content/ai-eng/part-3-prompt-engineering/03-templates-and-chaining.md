---
title: "Templates and chaining"
description: "Treating prompts as typed code, and the call you make every week: one big prompt or several small ones in a chain."
slug: 03-templates-and-chaining
part: 3
chapter: 3
difficulty: intermediate
prerequisites:
  - part-2-working-with-model-apis/00-calling-models
  - part-2-working-with-model-apis/02-structured-outputs
  - part-2-working-with-model-apis/07-prompt-caching
  - 00-anatomy-of-a-production-prompt
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Templates and chaining

A teammate reworded one line of a production prompt last quarter. "Output strictly valid JSON" became "Always respond using clean, parseable JSON." The change looked cosmetic. It didn't break the schema. It didn't trip any test. It just started producing trailing commas and the occasional missing required field on edge-case inputs, which silently broke every downstream parser for nine days before anyone noticed.[^1]

The on-call engineer's first question was the obvious one: *which version of the prompt is running, and how does it differ from last week?* The prompt was a string constant inside `app.py`. There was no diff, no PR, no rollback target. The fix took ninety seconds. Finding what to fix took most of an afternoon.

That incident is the whole argument for treating prompts the way you treat database queries. A hardcoded prompt string is SQL by string concatenation: no type safety, no diff history, no testability, no rollback. The fix is a small one. Make the prompt a function with typed inputs that returns the API payload, and put it under the same engineering discipline as everything else you ship.

## The prompt asset, not the prompt string

The first move is to stop thinking of "the prompt" as the text. The thing you're really versioning is a four-part bundle: the template text, the model identifier, the sampling parameters (`temperature`, `max_tokens`, `top_p`), and the schema for the expected output. A prompt running at temperature 0 and one running at 0.9 are different products even if the words match. Debugging a hallucination needs all four; you can't roll back what you didn't capture.[^2]

The minimum viable template is a Python function:

```python
from string import Template

SYSTEM = Template(
    "You are a $role. Respond in $language. Be concise."
)
USER = Template(
    "<document>$document</document>\n\n"
    "Summarize the document above in $max_sentences sentences."
)

MODEL_CONFIG = {
    "model": "claude-opus-4-8",
    "max_tokens": 512,
    "temperature": 0.0,
}

def build_summary_request(
    role: str, language: str, document: str, max_sentences: int
) -> dict:
    return {
        "system": SYSTEM.substitute(role=role, language=language),
        "messages": [{
            "role": "user",
            "content": USER.substitute(
                document=document, max_sentences=max_sentences
            ),
        }],
        **MODEL_CONFIG,
    }
```

Three things this gets you that a string constant doesn't. A missing variable raises `KeyError` at call time instead of silently producing a malformed prompt. The model config travels with the template, so a temperature change shows up as a code diff. And the function is testable: you can unit-test that `build_summary_request` produces the exact bytes you expect, without ever calling the model.

LangChain's `ChatPromptTemplate` and Mirascope's typed prompts wrap the same idea in more structure (input variable declarations, Pydantic-typed inputs, multi-message formatting), but they're elaborations on the same primitive. Pick whichever fits your stack. The non-negotiable is that the prompt is a function, not a string literal. Where the bundle gets stored (source control, database, dedicated registry) and how non-engineers iterate on it is the subject of [Prompt versioning](./04-prompt-versioning.md); for now, the rule is just: it's code.[^2]

## One big prompt or several small ones

Once your prompts are code, the next call is structural. You're given a task: take a long document, extract the entities and dates, classify the document type, and write a two-sentence summary highlighting the financial exposure. Two ways to ship this. Write one prompt that does all four jobs at once. Or write four prompts, run them in sequence, and pass each output to the next.

The single-prompt version is operationally simpler: one API call, one log line, one round-trip of latency. The chain is more code, more latency, and more tokens (each step pays its own per-call overhead). So the chain has to earn its complexity with something the monolith can't give you.

Three things it can give you. **Per-step error localization**, because when something goes wrong you know which step produced the bad output, instead of staring at a 4,000-token blob. **Independent retry**, because retrying a 200-token extraction is cheaper than re-running a 3,000-token mega-prompt. **Validation gates**, the load-bearing one: a programmatic check between steps that asserts the output is well-formed before the next step ever sees it.

Without a gate, the chain's worst failure mode is silent. Step 1 returns a malformed JSON string. Step 2 receives that string and treats it as ground truth, because LLMs don't throw exceptions on bad input; they produce plausible-looking output that incorporates the bad data. Step 3 receives step 2's confidently-wrong synthesis. A 2026 study on multi-agent pipelines documented this as systematic, not occasional: minor early-step errors get cited and reused downstream, eventually generating what the authors call "collective false consensus" across the chain.[^3] The output is wrong and coherent, which is the worst possible combination.

The fix is a parser between steps:

```python
import json
from dataclasses import dataclass

@dataclass
class StepResult:
    step: str
    output: str
    ok: bool

def call_llm(system: str, user: str) -> str:
    # Real: anthropic.Anthropic().messages.create(...)
    return '{"entities": ["Alice", "Bob"], "action": "signed contract"}'

def step_extract(document: str) -> StepResult:
    raw = call_llm(
        system="Extract entities and actions as JSON: "
               "{entities: [...], action: string}",
        user=document,
    )
    try:
        parsed = json.loads(raw)
        ok = isinstance(parsed.get("entities"), list) and "action" in parsed
    except json.JSONDecodeError:
        ok = False
    return StepResult(step="extract", output=raw, ok=ok)

def step_summarize(extracted_json: str) -> StepResult:
    raw = call_llm(
        system="Summarize the following JSON facts in 2 sentences.",
        user=extracted_json,
    )
    return StepResult(step="summarize", output=raw, ok=True)

def run_chain(document: str) -> list[StepResult]:
    r1 = step_extract(document)
    if not r1.ok:
        raise ValueError(f"Extract gate failed: {r1.output}")
    return [r1, step_summarize(r1.output)]
```

The `if not r1.ok` line is the whole point. It refuses to pass a string-that-failed-JSON-parse to a step that's about to treat it as facts. In production you'd retry the extract step with a refined prompt before raising, but the structural property is: nothing crosses a step boundary without being parsed and validated first.[^4]

[The five workflow patterns](../part-7-agent-engineering/01-the-five-workflow-patterns.md) catalogs the variations beyond linear chaining, including routing, parallelization, and evaluator-optimizer loops. Each pattern is the same primitive (typed step, gate, next step), assembled into different shapes.

## When chaining actually wins

The default, despite the appeal of clean decomposition, is one prompt. A single call is cheaper to build, cheaper to debug, and has a fraction of the latency. Chaining earns its complexity in a small set of cases:

- The task has two or more genuinely distinct stages with different output formats (extract structured facts, then write prose). One prompt has to switch reasoning modes inside a single forward pass; a chain can give each step the model's full attention.
- Intermediate outputs need a programmatic check, a human review, or conditional branching before the next step is safe to run.
- A monolith's accuracy is empirically lower than the chain's on your eval set. Not "we think it should be"; lower on the numbers.

And it loses, sometimes badly, in two cases the research is unusually clear about.

The first is reasoning-native models. The Wharton GAIL "Decreasing Value of Chain of Thought" study (June 2025) measured what explicit chain-of-thought prompting does on top of o3-mini, o4-mini, and Gemini Flash 2.5. Accuracy gains: +2.9%, +3.1%, and *minus* 3.3%. Latency overhead: 20 to 80%.[^5] These models already do internal step-by-step reasoning; bolting external chaining on top adds round-trips with no reasoning surface to improve. If you're using a reasoning model, ask it the question and let it think.

The second is artificial decomposition. If the task doesn't have distinct stages and you split it anyway because chains look tidier, the coordination overhead (serialize, pass, deserialize, reconstruct context) eats the gains. The signal in production: per-step accuracy is fine, end-to-end accuracy is no better than the monolith, latency and cost are 3x.[^4] The fix is to merge steps until each step is doing real work.

| Default | Escalate to chain when |
|---|---|
| One prompt | The task has 2+ distinct stages with different reasoning or output shapes |
| One prompt | Intermediate outputs need validation, branching, or human review |
| One prompt | Your eval set shows the chain beats the monolith end-to-end |

The chain length ceiling is 3 to 5 steps. Beyond that, cascade risk and state-management complexity compound faster than the gains. A chain growing because each new edge case spawns a new step is a chain accumulating complexity, not managing it.[^4]

The honest test is the comparison nobody runs: same task, same eval set, monolith vs chain, measured end-to-end. Per-step accuracy can be high while end-to-end is *lower* than the monolith because coordination overhead ate the gains. Most teams pick by instinct. The teams that pick well measure.

## The cache changes the cost math

Chains have one structural property monoliths don't: every step starts with a system prompt that's bit-for-bit identical to the last step's. If you structure that prefix correctly, every step after the first reads from the prompt cache at roughly 10% of the base input rate. Every step that doesn't, pays full price.[^6]

The rule, identical to the one in [Prompt caching](../part-2-working-with-model-apis/07-prompt-caching.md): stable content first, dynamic content last.

```python
from string import Template

STABLE_SYSTEM = """You are a financial analysis assistant.
Rules:
1. Always cite the source document.
2. Round all figures to two decimal places.
3. Flag any figures older than 12 months.
"""
# Bit-for-bit identical across every step and every session. Cached.

USER_TEMPLATE = Template(
    '<document source="$source" date="$date">$content</document>\n\n$question'
)
# All variability lives here, after the cached prefix.

def build_request(source: str, date: str, content: str, question: str) -> dict:
    return {
        "model": "claude-opus-4-8",
        "max_tokens": 512,
        "system": STABLE_SYSTEM,
        "messages": [{
            "role": "user",
            "content": USER_TEMPLATE.substitute(
                source=source, date=date, content=content, question=question
            ),
        }],
    }
```

The most expensive bug in this space is putting a per-request value (a timestamp, a session ID, today's date) at the top of the system prompt. One byte different, hash miss, full-price write on every single call. You'll see it immediately in the response usage object: `cache_read_input_tokens` is zero, `cache_creation_input_tokens` is non-zero on every request. If you can't move the variable to the user message, drop it from the prompt entirely and pass it through a tool call.

The "Don't Break the Cache" study (Lumer et al., January 2026) measured what disciplined cache placement does to a 10,000-token system prompt across 500 agent sessions on a multi-turn benchmark: 41 to 80% cost reduction and 13 to 31% better time-to-first-token, against the same chain with naive ordering.[^6] That gap is what your bill looks like depending on whether the engineer who wrote the chain knew this rule.

The opposite failure is the multi-turn chain that re-sends the full conversation history as the prefix of every step. Token count grows like a triangle number: turn 1 sends N tokens, turn 28 sends 28N, and the cumulative input across 30 turns is roughly N times 465. A 30-turn agentic session can cost 50 to 200 times a single-turn call, depending on cache locality and whether the TTL window kept the prefix warm.[^7] The fix is context windowing (keep the last K turns of history), summarize-and-truncate (replace old turns with a compressed summary), or explicit context compaction before re-inserting. The mechanics are in [Prompt caching](../part-2-working-with-model-apis/07-prompt-caching.md). What matters here is that the chain's cost model is set by the prefix structure long before any user types anything, so the place to design that structure is the same place you design the rest of the chain: in the template function that builds the request.

## References

[^1]: Tian Pan, "Prompt Versioning in Production: The Engineering Discipline Teams Learn the Hard Way", tianpan.co, April 2026, https://tianpan.co/blog/2026-04-09-prompt-versioning-production-llm
[^2]: Mirascope team, "4 Best Prompt Management Systems for LLM Developers in 2025", mirascope.com, 2025, https://mirascope.com/blog/prompt-management-system
[^3]: Anthropic, "Prompting best practices: Chain complex prompts", docs.anthropic.com, accessed June 2026, https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices
[^4]: Tian Pan, "The LLM Pipeline Monolith vs. Chain Trade-off: When Task Decomposition Helps and When It Hurts", tianpan.co, April 2026, https://tianpan.co/blog/2026-04-18-llm-pipeline-monolith-vs-chain
[^5]: Lennart Meincke, Ethan Mollick, Lilach Mollick, Dan Shapiro, "Prompting Science Report 2: The Decreasing Value of Chain of Thought in Prompting", arXiv:2506.07142, Wharton Generative AI Labs, June 2025, https://arxiv.org/abs/2506.07142
[^6]: Elias Lumer, Faheem Nizar, et al., "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks", arXiv:2601.06007, January 2026, https://arxiv.org/abs/2601.06007
[^7]: Tian Pan, "The Sliding-Window Tax: Why a 30-Turn Conversation Costs More Than 30x a Single Turn", tianpan.co, May 2026, https://tianpan.co/blog/2026-05-13-sliding-window-tax-long-conversations-cost-more-than-tokens

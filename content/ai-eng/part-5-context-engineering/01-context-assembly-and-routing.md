---
title: "Context assembly and routing"
description: "Why a 1M-token window doesn't make context free, and the route-then-assemble pipeline that decides what the model actually sees."
slug: 01-context-assembly-and-routing
part: 5
chapter: 1
difficulty: intermediate
prerequisites:
  - part-1-how-models-behave/01-tokens-and-context-windows
  - part-2-working-with-model-apis/07-prompt-caching
  - 00-context-is-more-than-the-prompt
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# Context assembly and routing

Two 2025 papers introduced numbers that should have killed a popular argument. NoLiMa (ICML 2025) tested 13 frontier models on long-context retrieval where the question and the needle share almost no literal wording: at just 32,000 tokens, 11 of the 13 fell below 50% of their short-context baseline accuracy. GPT-4o, one of the better performers, still dropped from 99.3% to 69.7% as the context filled up.[^1] A separate study of effective context windows found some task configurations breaking with as little as 100 tokens in context.[^1a]

The argument that died was "we have 1M context windows now, so context engineering is over." It isn't. The window got bigger; the model's ability to use the whole window didn't. A $3 GPT-4.1 call against a million tokens you didn't curate buys you a confidently wrong answer, slowly. Anthropic now ships this caveat in their own docs, calling the effect "context rot": as token count grows, accuracy and recall degrade.[^2]

So the engineering question isn't "what fits." It's "what should be in there." Context assembly is the act of deciding, before each call, exactly which tokens occupy the window. Routing is the upstream gate: classify the request first, then assemble for that request type. Two steps, in that order, on every call.

## Four tiers, one budget

Treat the window as a budget with four tiers, each with its own eviction rule. The model that's converged across production practitioners looks like this:[^3]

- **Tier 1, static anchors.** System prompt and tool schemas. These never evict. They sit at the top of the prompt, change rarely, and are the most cache-eligible content you've got. Cap them at roughly 15% of the window. A 40K-token system prompt on a 200K window has already burned 20% before the user has typed a word.
- **Tier 2, retrieved context.** RAG chunks, injected memories, just-fetched documents. Just-in-time, evict oldest first. Don't pre-load whole documents; keep handles and load excerpts on demand. A tool that returns 20K tokens of raw JSON to an agent with 22K tokens of headroom has stalled the task.
- **Tier 3, conversation history.** Rolling compression, oldest evicted first. History grows turn by turn forever if you let it. By turn 30 of an agent session, it'll be 80% of your budget.
- **Tier 4, scratch space.** Tool outputs already consumed, intermediate reasoning, chain-of-thought traces. Evict aggressively. Claude's API already strips extended thinking blocks between turns automatically, which is the right default.[^2]

A reasonable starting allocation: 15% / 40% / 25% / 20%. Adjust on your traffic, but commit to fractions before you ship. "Allocate appropriately" is not a rule.

![A vertical four-band stack showing context budget tiers from top to bottom: Tier 1 system prompt and tools at the top in a small light band, Tier 2 retrieved context in the largest middle-upper band, Tier 3 conversation history in a medium band, Tier 4 scratch space in the bottom band, with a downward arrow on the left labeled priority decreasing and eviction labels on the right](images/01-context-budget-stack.png)
*The four-tier budget. Top stays put; bottom gets evicted first.*

In code, this is a packing problem with priorities. Each tier gets its own ceiling; you fill from highest priority down, and you evict by tier-specific rules. The shape that survives most refactors:

```python
from dataclasses import dataclass

@dataclass
class ContextBudget:
    system_prompt_max: int
    retrieved_max: int
    history_max: int

def assemble(
    system_prompt: str,
    retrieved_chunks: list[str],
    history: list[dict],
    budget: ContextBudget,
    tokenize,  # callable: str -> int
) -> dict:
    if tokenize(system_prompt) > budget.system_prompt_max:
        raise ValueError("System prompt exceeds its hard budget")

    # Tier 2: retrieved chunks, take from highest-scored down
    kept_chunks, used = [], 0
    for chunk in retrieved_chunks:
        t = tokenize(chunk)
        if used + t <= budget.retrieved_max:
            kept_chunks.append(chunk)
            used += t

    # Tier 3: history, evict oldest first by walking backward
    kept_history, used = [], 0
    for msg in reversed(history):
        t = tokenize(str(msg))
        if used + t > budget.history_max:
            break  # oldest messages drop off
        kept_history.insert(0, msg)
        used += t

    return {"system": system_prompt, "retrieved": kept_chunks, "messages": kept_history}
```

Two things matter about this code beyond its logic. First, every tier has its own ceiling, set ahead of time. The history tier can't eat into the retrieved tier because they don't share a counter. Second, eviction is explicit and observable: log which chunks got dropped, log which history messages got cut. When the model gives a wrong answer next week, that log is how you find out the relevant turn was evicted three steps earlier.

## Where you put things matters as much as what you put

A second finding deserves its own section, because most engineers stuff retrieved chunks in the middle of the prompt and don't realize what they've done. Liu et al. (TACL 2024) ran a controlled study on multi-document QA with 20 retrieved documents. Accuracy was highest when the relevant document sat at position 1 or 20. It dropped by more than 30 percentage points when the same document sat at positions 5 through 15. The effect held across every model they tested, including ones marketed as "long-context."[^4] Chroma's 2025 study confirmed the same shape on newer frontier models.[^5]

Transformers attend in a U: the start and end of the context get more weight than the middle. So the assembly order isn't cosmetic. It's:

1. **System prompt and tools at the top.** Stable, cache-eligible, and in the high-attention zone.
2. **Compressed history in the middle.** It's where the lowest-signal content goes by design, because the middle is the lowest-attention zone.
3. **Retrieved chunks just before the user turn.** Recency wins; the last thing the model reads has the strongest pull.
4. **The user's latest message at the bottom.** Always last.

If you're loading 20 retrieved chunks, the worst place for the most relevant one is position 10. Sort retrieved chunks by relevance score, then place the top one nearest to the user turn: last in, first read. This is not a marginal trick. On the Liu et al. setup, it's the difference between 75% accuracy and 45%.

## Route first, then assemble

So far I've described one budget and one assembly order. In production you have several, because different request types need structurally different context. A factual lookup wants a tight knowledge-base retrieval recipe with little history. A casual greeting wants almost no retrieval at all. A code-edit request wants the full file plus recent edit history and zero generic docs.

A *context recipe* is the spec for one of these: which retrieval backend to query, which subset of tools to expose, how much history to keep, which system prompt variant to use. Routing is the upstream gate that picks the recipe before assembly runs. The architecture is two stages, in order: classify, then assemble.

Three routing mechanisms cover almost every case.

**Rule-based routing.** A regex or pattern match. Zero latency, fully deterministic. URL in the query routes to the web-fetch recipe. SQL keywords route to the database recipe. Use this as the first pass for high-frequency, well-defined intents. If a rule matches, you're done.

**Semantic routing.** Define each route by a handful of example utterances. Embed them once at startup. At request time, embed the query and pick the route with the highest cosine similarity above a threshold. Decision latency is roughly 100 ms with an API encoder, and the token cost is essentially zero (one embedding call, no LLM completion).[^6] The aurelio-labs `semantic-router` library is the reference implementation.[^7]

**LLM classification routing.** Send the query plus a list of route descriptions to a small model and ask it to pick. LangChain's `RunnableBranch` and LlamaIndex's `RouterQueryEngine` both follow this shape.[^8] Decision latency runs 200 to 2000 ms and you pay for the classifier call. Use it when route distinctions are nuanced enough that embedding similarity won't separate them. Think "complaint vs feature request" on a support product where the difference depends on tone, not vocabulary.

The default rule: start with semantic routing. It's an order of magnitude faster than the LLM version, costs almost nothing, and works fine when you have under ~20 routes with reasonably distinct semantics. Escalate to LLM routing only on the routes where semantic routing is measurably wrong on your traffic. Layer rule-based routing on top of either as a fast pre-filter for deterministic intents. Don't build all three at once; add them as you accumulate the failure cases that justify them.

A minimal semantic router, with the recipe attached to each route:

```python
from dataclasses import dataclass
from typing import Callable, Optional
import math

@dataclass
class Route:
    name: str
    utterances: list[str]
    recipe: dict  # e.g. {"retrieval": "kb_docs", "tools": ["search"], "history_turns": 4}

def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm = math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(x*x for x in b))
    return dot / (norm + 1e-9)

class SemanticRouter:
    def __init__(self, routes: list[Route], embed: Callable, threshold: float = 0.75):
        self.routes = routes
        self.embed = embed
        self.threshold = threshold
        self._index = {r.name: [embed(u) for u in r.utterances] for r in routes}

    def pick(self, query: str) -> Optional[Route]:
        q = self.embed(query)
        best, score = None, 0.0
        for r in self.routes:
            s = max(cosine(q, e) for e in self._index[r.name])
            if s > score:
                best, score = r, s
        return best if score >= self.threshold else None
```

Two details people get wrong here. The threshold isn't 0.75 because that's a magic number; it's the value you calibrate on a labeled set of 50-100 queries per route. Too low and unrelated queries match the wrong route; too high and real queries fall through. Second, returning `None` on no match is a feature, not a bug. The fallback recipe (small retrieval, default tools) catches the long tail. Routing every query into *some* category just guarantees a fraction of them get the wrong context.

## How this fails in production

The failure modes are predictable enough to enumerate, and each maps to a specific countermeasure.

**Silent truncation.** Older model APIs and naive frameworks drop the oldest messages when the window fills, without an error. The agent keeps going, but the file path it edited three turns ago is gone from its memory. Detect by logging `usage.input_tokens` per call; a sudden plateau at the model's hard ceiling with no error is the signal. Fix by using a model that errors loudly on overflow. Claude Sonnet 3.7+ returns `stop_reason: "model_context_window_exceeded"` instead of silently truncating[^2], and you should hit your soft budget before the hard one.

**Context poisoning.** A near-full context degrades the model's attention quality, it generates a plausible-sounding hallucination, and that hallucination gets appended to the history and treated as fact for every subsequent turn. The fix is validation gates between steps: don't accept agent-generated intermediate facts without a check, and trigger a fresh context window when quality signals (output validation failures, tool error rates) start to climb.[^3]

**Routing miscalibration.** Threshold too low routes unrelated queries into the wrong recipe; threshold too high drops real queries into the fallback. Both look like "the model is dumb" from the outside. Log every routing decision with the score, sample a few hundred per week, and adjust thresholds against ground truth. This is the cheapest production win in the whole pipeline; almost nobody does it.

**Tool schema bloat.** Exposing 30 tools to every request consumes 5-15K tokens in schemas before the user has said anything. Most requests need three of them. Use the same routing machinery you built for context recipes to expose only the relevant tool subset per request type. LlamaIndex's `ToolRetrieverRouterQueryEngine` is the canned version of this pattern.[^8]

> [!WARNING]
> The single most common pitfall is unbounded history growth. By turn 30 of an agent session, raw history can be 80% of your window, with retrieved context starved at the bottom. Set a hard ceiling on the history tier (the 25% in the rule of thumb) and trigger summarization when it's hit, not eviction. The next chapter, [Compression and context budgets](./02-compression-and-context-budgets.md), is the full treatment.

The habit that makes all of this tractable is logging the assembled context as a versioned artifact on every call: which route fired, which chunks made it in, which got evicted, the per-tier token counts. When a customer reports a wrong answer, you reconstruct what the model actually saw. Without that log, you're debugging a probability distribution by guessing.

## References

[^1]: Ali Modarressi et al., "NoLiMa: Long-Context Evaluation Beyond Literal Matching," ICML 2025 (PMLR 267). arXiv:2502.05167. https://proceedings.mlr.press/v267/modarressi25a.html
[^1a]: Norman Paulsen, "Context Is What You Need: The Maximum Effective Context Window for Real World Limits of LLMs," arXiv:2509.21361, September 2025. https://arxiv.org/abs/2509.21361
[^2]: Anthropic, "Context windows," Claude Developer Platform documentation, accessed June 2026. https://docs.anthropic.com/en/docs/build-with-claude/context-windows
[^3]: Tian Pan, "Tokens Are a Finite Resource: A Budget Allocation Framework for Complex Agents," TianPan.co, April 2026. https://tianpan.co/blog/2026-04-17-token-budget-allocation-complex-agents
[^4]: Nelson F. Liu et al., "Lost in the Middle: How Language Models Use Long Contexts," Transactions of the Association for Computational Linguistics (TACL), vol. 12, 2024 (accepted November 2023). arXiv:2307.03172. https://arxiv.org/abs/2307.03172
[^5]: Kelly Hong, Anton Troynikov, Jeff Huber, "Context Rot: How Increasing Input Tokens Impacts LLM Performance," Chroma Technical Report, July 2025. https://research.trychroma.com/context-rot
[^6]: truto.one, "How to Implement Semantic Routing for AI Agents to Select API Endpoints," April 2026. https://preview.truto.one/blog/how-to-implement-semantic-routing-for-ai-agents-to-select-api-endpoints/
[^7]: aurelio-labs, "Quickstart," Semantic Router documentation, accessed June 2026. https://docs.aurelio.ai/semantic-router/get-started/quickstart
[^8]: LlamaIndex, "Routers," developer documentation, accessed June 2026 (https://developers.llamaindex.ai/python/framework/module_guides/querying/router/); LangChain, "How to route between sub-chains," accessed June 2026 (https://python.langchain.com/docs/how_to/routing).

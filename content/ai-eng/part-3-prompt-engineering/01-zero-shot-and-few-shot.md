---
title: "Zero-shot and few-shot"
description: "When examples earn their tokens and when they don't. The decision rule, the over-prompting cliff, and how prompt caching rewrites the math."
slug: 01-zero-shot-and-few-shot
part: 3
chapter: 1
difficulty: beginner
prerequisites:
  - part-1-how-models-behave/01-tokens-and-context-windows
  - part-2-working-with-model-apis/00-calling-models
  - part-2-working-with-model-apis/07-prompt-caching
  - 00-anatomy-of-a-production-prompt
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Zero-shot and few-shot

A few-shot prompt with five 200-token examples adds 1,000 tokens to every request you make. At 10,000 requests per day on Claude Sonnet 4.6 ($3.00 per million input tokens, June 2026), those examples cost $30 a day, $10,950 a year. That's the bill before the model has read a single user word. Most teams add the examples, never measure if they help, and never notice the line item.

The folk wisdom says more examples are better. The empirical record from 2025 says the opposite past a small k: accuracy hill-climbs to a peak around 5 to 25 examples, then degrades, sometimes sharply.[^1][^2] And on modern instruction-tuned models, examples often don't lift reasoning at all; they just align format.[^3] So the question isn't "should I add examples." It's "do these specific examples earn their tokens, and if they do, can I stop paying for them on every request."

## The two ends of one knob

Zero-shot and few-shot aren't separate techniques. They're the two ends of one dial: how much of the task you specify with words versus how much you specify by demonstration. Tom Brown's GPT-3 paper named the points in 2020. Zero-shot is instructions only; one-shot is a single (input, output) demonstration; few-shot is k of them, with k usually 2 to 16.[^4]

The mechanism is the same in all cases. The model doesn't learn anything between requests. It runs one forward pass over your full prompt and the demonstrations sit in context next to the query, attended to in the same attention pattern. They steer the output by being there. That's why people call it in-context learning, and that's why every example you add gets paid for in tokens, every request, until you do something about it.

The right starting point is zero-shot. Modern instruction-tuned models (Claude 4+, GPT-5, Gemini 2.5+, Qwen2.5+) have absorbed enough task templates during RLHF that a clear instruction usually carries you. Anthropic's official guidance puts it bluntly: start with zero-shot, add examples when the output isn't right.[^5] OpenAI's docs say the same.[^6] You only escalate to few-shot when zero-shot is leaving real money on the table, in a measurable way.

## When to escalate, and what examples actually fix

Add examples when zero-shot fails in one of four specific ways. Not "the answers feel a bit off"; that's an instruction problem. Examples are the right tool when:

- **The output format is wrong.** You want a specific JSON shape, custom XML tags, a particular markdown structure. The model keeps drifting. Two or three examples nail this faster than any instruction can.
- **The label vocabulary is custom.** Your taxonomy is `Triaged / Watching / Escalated`, not the standard `Positive / Negative / Neutral` the model has seen a billion times. Examples teach the label space directly.
- **Tone or length is systematically off.** The model writes three paragraphs when you want one sentence, or formal when you want casual. Examples calibrate register more reliably than adjectives in the instruction.
- **There are edge cases instructions can't describe cleanly.** "When the input is ambiguous, classify as Neutral, not Unknown" is awkward in prose and obvious in a single example.

Notice what's not on this list: reasoning. For modern strong models, examples don't reliably make reasoning better. Cheng et al. (EMNLP 2025 Findings) tested this on Qwen2.5: adding traditional chain-of-thought exemplars didn't improve reasoning over zero-shot CoT. The models, they found, "tend to ignore the exemplars and focus primarily on the instructions."[^3] If your problem is "the model isn't thinking hard enough," few-shot is the wrong knob. That's the world of [Chain-of-thought, ReAct, self-consistency](02-chain-of-thought-react-self-consistency.md).

## The over-prompting cliff

Here's the part that surprises people. More examples isn't strictly better. Past a small peak, accuracy goes down, sometimes a lot.

Two independent 2025 studies pinned this down. Oskooei et al. ran 90,000-plus code translations across model sizes from 0 to 625 examples (up to 800k tokens of context). "Functional correctness consistently peaks with few-shot prompting (5 to 25 examples)" and degrades substantially past that. They named the effect the "many-shot paradox."[^1] Tang et al. confirmed it on a different task entirely, domain-specific text classification across GPT-4o, GPT-3.5-turbo, LLaMA-3.1-8B, and Gemma-3-4B, with a peak between 5 and 20 examples and a clear decline past it.[^2] The smaller the model, the lower the peak. LLaMA-3.2-3B, in their tests, collapsed to a single label past 100 examples.

![A hill-shaped accuracy curve rising from a zero-shot baseline at left, peaking at 5 to 25 examples in the middle, then descending into a labeled over-prompting zone on the right, with a small green band over the peak marking the Anthropic 3 to 5 recommendation](images/01-over-prompting-curve.png)
*Accuracy as a function of example count, across two independent 2025 studies. The peak sits between 5 and 25; past it, more examples hurt.*

So the practical default is small. Anthropic's guidance lands at 3 to 5 examples for most tasks.[^5] The ceiling, before you measure, is around 20. Past that, you're not improving the model; you're paying for tokens that hurt you. If you genuinely need a lot of examples (a long-tail label space, say), measure accuracy at k = 0, 3, 5, 10, 20 before you commit. The peak is real and it's lower than most engineers guess.

## Picking the examples: random, retrieved, or curated

Once you've decided on a small k, you need to pick which k. The choices, in order of effort:

- **Curated and static.** A hand-picked set of 3 to 5 examples that you ship with the prompt. Cheapest to operate, easiest to cache, and good enough for most format-and-tone tasks. This is the default.
- **TF-IDF retrieval.** For each request, retrieve the top-k most similar examples from a pool by classical lexical similarity. Deterministic and cheap. Tang et al. found TF-IDF retrieval competitive with semantic retrieval on domain-specific tasks.[^2]
- **Semantic retrieval (KATE-style).** Embed each candidate example, embed the query, take the top-k by cosine similarity. Liu et al. (2021) showed retrieval-based selection beat random by 41.9% relative on table-to-text generation and 45.5% relative on open-domain QA over GPT-3.[^7] Worth it when input variance is high and you have a labeled pool.

The retrieval version is straightforward:

```python
from dataclasses import dataclass

@dataclass
class Example:
    input_text: str
    output_text: str
    embedding: list[float]  # pre-computed

def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    return dot / (na * nb) if (na and nb) else 0.0

def select_examples(query_emb: list[float], pool: list[Example], k: int = 5) -> list[Example]:
    # Sort ascending so the most similar example ends up last in the list.
    return sorted(pool, key=lambda e: cosine(query_emb, e.embedding))[-k:]
```

Two non-obvious rules govern the pool itself. First, diversity matters as much as similarity. A pool of five examples that all demonstrate the same edge case teaches that case and nothing else. After kNN retrieval, check that you're covering all label classes and aren't shipping near-duplicates. Anthropic's docs warn explicitly: "Cover edge cases and vary enough that Claude doesn't pick up unintended patterns."[^5] Second, examples must come from the same distribution as production inputs. Examples written by you, in clean formal English, will steer the model wrong when production inputs arrive in informal user voice with typos and emoji.

## Ordering matters more than you'd think

Zhao et al. (ICML 2021) showed something uncomfortable about in-context learning: with the same model, the same examples, and the same query, accuracy can swing from near-chance to near-state-of-the-art depending on the order of the examples alone. Their calibration fix recovered up to 30 percentage points of absolute accuracy on classification tasks.[^8] The model has biases about what it sees in its context, and those biases steer the answer.

Two biases drive the swing. **Recency bias**: the model leans toward the label of the last example. **Majority-label bias**: the model leans toward whichever label appears most often. So three rules of thumb fall out:

1. **Balance label counts.** If you're showing five classification examples across three classes, don't make four of them "Positive." The model will inherit that prior.
2. **Scatter the labels.** Don't group all "Positive" examples together followed by all "Negative" examples. Alternate.
3. **Put the most relevant example last.** If you're using retrieval, the highest-similarity match goes at the bottom, closest to the query. The recency bias works for you instead of against you.

The one place to break the third rule is when ordering randomization would defeat prefix caching. Which brings us to the bill.

## What examples cost, and how caching changes the math

Without caching, every example is paid for on every request. Five 200-token examples = 1,000 tokens added to the prompt. At 10,000 requests per day on Sonnet 4.6 ($3.00 per million input, June 2026), that's $30 a day, $10,950 a year, just for the examples. Double the example count and you double the bill. The math is brutally linear: `daily_cost = (example_tokens / 1_000_000) * input_price * requests_per_day`.

Prefix caching breaks the linearity. The provider keeps the KV tensors of your stable prefix around between requests; subsequent requests within the cache TTL pay roughly 10% of the input price for that prefix instead of full freight. On Anthropic's 5-minute tier, writes cost 1.25x base ($3.75 per million on Sonnet 4.6) and reads cost 0.10x ($0.30 per million); on OpenAI it's automatic with a 10% read price; on Gemini you create an explicit cache resource.[^9][^10][^11] The full mechanics live in [Prompt caching](../part-2-working-with-model-apis/07-prompt-caching.md).

For our 1,000-token example block at 10,000 requests per day, with the cache warming once every 5 minutes (288 windows per day):

```python
EXAMPLE_TOKENS = 1_000
REQUESTS = 10_000
WINDOWS = 288  # 5-minute windows in a day

BASE  = 3.00 / 1_000_000   # Anthropic Sonnet 4.6 input, June 2026
WRITE = 3.75 / 1_000_000   # 5-min cache write
READ  = 0.30 / 1_000_000   # cache read

no_cache  = EXAMPLE_TOKENS * BASE * REQUESTS
with_cache = (EXAMPLE_TOKENS * WRITE * WINDOWS
              + EXAMPLE_TOKENS * READ * (REQUESTS - WINDOWS))

print(f"No cache:   ${no_cache:.2f}")    # $30.00
print(f"With cache: ${with_cache:.2f}")  # $3.99
```

That's an 87% cut on the example bill, achieved by adding one config field. The break-even is essentially immediate: the cache pays for its write surcharge after about two requests inside the TTL window. At any production traffic level, on a stable example block, caching is a strict win.

The catch is what "stable" means. The cache is keyed on a hash of the prefix bytes. Change one example, change the order, swap one word in your instructions, and the hash changes and you write a fresh cache. Which means there's a tension built into the chapter:

- **Static curated examples** cache beautifully. Same prefix every request, full 87% savings.
- **Per-request retrieved examples** defeat caching. Every query gets a different top-k, every prefix is unique, every request pays full freight. Lumer et al. (2026) found this in production: naive full-context caching of dynamic content can paradoxically *increase* latency, because you pay the cache write surcharge without ever hitting the cache.[^12]

The way out, when you want both retrieval quality and caching savings, is a hybrid prefix. Cache a stable bank of curated examples up front. Inject the retrieved examples after the cache breakpoint, in the user message, where they're paid at full input price but the much larger system prompt gets the cached read price. You don't get the full 87% savings, but you also don't lose all of them. Lumer et al. specifically recommend this shape: "placing dynamic content at the end of the system prompt... provides more consistent benefits than naive full-context caching."[^12]

## The default

Start with zero-shot. Measure. If the output format is wrong, the labels are custom, the tone drifts, or there's an edge case prose can't pin down, add 3 to 5 hand-picked examples in the system prompt. Balance the labels, scatter them, put the closest match last. Cap at 20 before measuring. If you reach for retrieval, keep a static bank cached and inject the retrieved examples after the cache breakpoint.

The instinct is to add examples by default and never remove them. They feel free. They aren't. Every example is a line on the bill that prints itself every request, and past a small k, it's a line that's also costing you accuracy. The discipline is to put examples on a budget, the same way you'd put any other production resource on a budget, and to revisit the budget when zero-shot quietly improves under you with the next model release.

## References

[^1]: Amirkia Rafiei Oskooei et al., "When Many-Shot Prompting Fails: An Empirical Study of LLM Code Translation", ICSE 2026 RECODE workshop, arXiv:2510.16809, https://arxiv.org/abs/2510.16809
[^2]: Yongjian Tang et al., "The Few-shot Dilemma: Over-prompting Large Language Models", arXiv:2509.13196, September 2025, https://arxiv.org/abs/2509.13196
[^3]: Xiang Cheng et al., "Revisiting Chain-of-Thought Prompting: Zero-shot Can Be Stronger than Few-shot", EMNLP 2025 Findings, arXiv:2506.14641, https://arxiv.org/abs/2506.14641
[^4]: Tom B. Brown et al., "Language Models are Few-Shot Learners", NeurIPS 2020, https://arxiv.org/abs/2005.14165
[^5]: Anthropic, "Use examples (multishot prompting) to guide Claude's behavior", Anthropic API Docs, https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting (fetched June 12 2026)
[^6]: OpenAI, "Prompt engineering", OpenAI Platform Docs, https://platform.openai.com/docs/guides/prompt-engineering (fetched June 12 2026)
[^7]: Jiachang Liu et al., "What Makes Good In-Context Examples for GPT-3?", DeeLIO 2022 workshop, arXiv:2101.06804, https://arxiv.org/abs/2101.06804
[^8]: Zihao Zhao, Eric Wallace, Shi Feng, Dan Klein, Sameer Singh, "Calibrate Before Use: Improving Few-Shot Performance of Language Models", ICML 2021, https://proceedings.mlr.press/v139/zhao21c.html
[^9]: Anthropic, "Prompt caching", Anthropic API Docs, https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching (fetched June 12 2026)
[^10]: OpenAI, "Prompt caching", OpenAI Platform Docs, https://platform.openai.com/docs/guides/prompt-caching (fetched June 12 2026)
[^11]: Google, "Context caching", Gemini API Docs, https://ai.google.dev/gemini-api/docs/caching (fetched June 12 2026)
[^12]: Elias Lumer et al., "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks", arXiv:2601.06007, January 2026, https://arxiv.org/abs/2601.06007

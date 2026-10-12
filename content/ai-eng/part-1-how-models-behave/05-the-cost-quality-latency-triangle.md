---
title: "The cost-quality-latency triangle"
description: "The book's recurring mental model: cost, quality, and latency are three axes you can't max at once. Name the one you sacrifice, then learn the levers that cheat it."
slug: 05-the-cost-quality-latency-triangle
part: 1
chapter: 5
difficulty: intermediate
prerequisites:
  - 00-the-model-landscape
  - 04-reasoning-models
tags: [llm, cost]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# The cost-quality-latency triangle

A voice assistant has about 800 milliseconds to start talking back before the conversation feels broken. A user asks it a genuinely hard question, the kind where a reasoning model would give a noticeably better answer. So the team routes hard questions to a reasoning model. Quality goes up on the eval set. Then the assistant ships, and every hard question produces 28 seconds of dead air while the model thinks before the first word comes out.[^1]

The team got exactly what they optimized for. They picked higher quality and got it. They just didn't notice they were trading away the one thing the product couldn't live without.

That trade is the subject of this chapter, and it has a shape. Every call to a hosted model exposes three things you can measure: what it costs, how good the answer is, and how long the user waits. You can push hard on any two of them. The third one moves the wrong way unless you change the structure of the system. Engineers call this the cost-quality-latency triangle, and it is the mental model the rest of this book keeps coming back to.

![A triangle with three labeled vertices reading High Quality at the top, Low Cost at bottom left, and Low Latency at bottom right; three shaded regions inside the triangle are labeled Realtime Chat near the bottom edge, High-Stakes Extraction near the top-left edge, and Batch Summarization near the top-right edge](images/05-triangle.png)
*You can sit on an edge of the triangle, not at all three corners at once; each product lives where its primary constraint pins it.*

## The three axes have real units

The triangle is only useful if each corner is a number you can put on a dashboard. All three are.

**Cost** is dollars per million tokens, written `$/MTok`, split into input and output. Providers bill input and output separately because generating text costs more compute than reading it, so output tends to run 3 to 10 times the input price. The spread across the market is enormous. As of June 2026, Google's Gemini 3.1 Flash-Lite costs $0.25 input and $1.50 output per million tokens.[^2] Anthropic's flagship Claude Fable 5 costs $10 input and $50 output.[^3] That is a 40x gap on input, before you even count multi-turn context piling up.

**Quality** is your eval pass rate on your task: the fraction of responses that meet a correctness bar you define. The word "your" is load-bearing. A model that scores 92% on one task can score 60% on another, so quality is never a single number stamped on a model. It is a model-task pairing, and you can't read it off a leaderboard. Building the eval set that produces this number is a discipline of its own, covered in Part 4 (Eval Fundamentals); for now, treat quality as a percentage you have measured, not a vibe.

**Latency** splits into two metrics that feel completely different to a user:

- **Time-to-first-token (TTFT):** milliseconds from sending the request to the first chunk streaming back. This is how long the user stares at a blank cursor.
- **Tokens-per-second (TPS):** how fast text fills in once it starts. Above roughly 200 TPS, a chat reader can't keep up anyway, so the renderer becomes the bottleneck, not the model.[^4]

For anything interactive, TTFT is the number that decides whether the product feels alive. Most teams never instrument it. They measure "latency" as milliseconds from send to last token, which buries TTFT inside a total that looks fine on the graph. The voice assistant at the top of this chapter is exactly that mistake: total latency barely moved because the reasoning happened during generation, but TTFT exploded from under a second to 28 seconds.[^1] [Reasoning models](./04-reasoning-models.md) covers why that hidden chain of thought inflates TTFT in the first place.

Here is the latency spread as of mid-2026, and it is the chart that makes the reasoning trap visceral:

![A horizontal bar chart of time-to-first-token at the 50th percentile, with bars sorted shortest to longest: Cerebras and Groq open-weight models near 0.2 seconds, frontier standard models near 0.7 to 1.1 seconds, and frontier max-reasoning modes at 28 and 67 seconds; a vertical dashed line at 2 seconds is labeled Interactive limit](images/05-ttft.png)
*Reasoning mode is not a slower setting, it is a different latency category; the jump from frontier-standard to max-reasoning is 30x to 60x, not a few percent.*

## Pick two, honestly

The compressed version of the triangle is "pick two." It is a useful lie. Here is the honest version.

For a single model tier, on a fixed task, with no structural tricks, the no-tradeoff corner does not exist. There is no model that is simultaneously the cheapest, the fastest, and the best on a hard task. You get to sit on an edge:

- **Cheap and fast:** a small model. Quality drops on anything hard.
- **Cheap and high-quality:** a big model on the batch API at half price. You give up interactive latency entirely, since batch runs async with up to 24-hour turnaround.[^5]
- **Fast and high-quality:** a big model with priority inference. Cost spikes.

That is the rule. Now here is where it bends, because pretending it never bends is how teams get fooled.

**The Pareto frontier shifts every generation.** "Pick two" describes one moment in time. Models improve all three axes at once across releases. GPT-5.4 mini at $0.75 input per million tokens, as of June 2026, delivers capability that cost frontier prices a year earlier.[^6] Frontier pricing dropped roughly 80% over 2024 to 2026.[^7] The triangle is a snapshot, not a law of physics. Re-check your model choice every few months; the edge you were stuck on may have moved.

**Your traffic is not one task.** A stream of a thousand requests a day is a mix of easy and hard. Roughly 80% of typical chatbot traffic is simple. Routing all of it to a frontier model because 20% needs the horsepower is paying flagship prices for queries a small model would nail. The triangle applies per request, not per product. [The model landscape](./00-the-model-landscape.md) lays out the tiers you are routing between.

**Quality has no global ranking.** A small model can hit 95% on a tight classification task and 40% on open-ended writing. "You need the big model for quality" is a claim that should always make you ask: quality on what, measured how? Without a task-specific eval, it is folklore.

So the working rule is sharper than "pick two." Before you choose a model, name the axis you are sacrificing, and say it out loud:

- Realtime chat sacrifices **cost**. You pay for a capable model that meets the TTFT budget.
- A nightly summarization pipeline sacrifices **latency**. You take the batch discount.
- High-stakes extraction sacrifices **cost**. You buy the quality you can't be wrong about.

If you can't name a sacrificeable axis, you don't have a model problem. You have a structural problem, and the back half of this chapter is the three ways to attack it.

## Three products, three corners

Numbers make the triangle concrete. Three real product shapes, mapped onto the corners, with June 2026 prices.

### Realtime chat: latency is the hard wall

A user-facing chat surface needs to feel instant. The constraint is TTFT under about 2 seconds, ideally under one. That budget alone disqualifies every reasoning mode (28 to 67 seconds TTFT) and forces a standard-tier model.[^1]

Claude Sonnet 4.6 at $3 input / $15 output per million tokens, with a TTFT P50 of 0.74 seconds, fits.[^3] An open-weight model on Groq or Cerebras fits even better on latency, near 0.2 seconds TTFT, if its quality clears your eval bar.[^4] What you do **not** do is reach for the reasoning tier when a query looks hard, because the latency cliff is invisible on a total-latency dashboard and brutal in the product.

The sacrifice: cost. You run a mid-tier model full-time rather than a cheap one, and you accept it. Latency cannot move.

### Batch summarization: latency is free to give away

A pipeline summarizes 50,000 support tickets every night. No human is waiting. The whole job can finish by morning.

Here latency is the cheap axis, so you spend it. Both OpenAI and Anthropic offer a batch API at a 50% discount for async work with up to 24-hour turnaround.[^5] Summarizing 50,000 tickets at, say, 2,000 input and 300 output tokens each on Claude Sonnet 4.6 runs about $0.50 per 1,000 tickets on input and $1.35 on output at standard prices; the batch discount halves it. You buy frontier-adjacent quality at small-model cost, purely by being willing to wait.

The sacrifice: latency, which costs you nothing because nobody is watching.

### High-stakes extraction: quality is non-negotiable

A pipeline pulls structured fields out of legal contracts: party names, effective dates, liability caps. A wrong date is a real problem, not a typo. Volume is low, a few hundred documents a day.

Quality is the wall. You pick the model with the highest eval pass rate on your extraction set, even if it's the $10/$50 flagship, because the cost of being wrong dwarfs the API bill. At a few hundred documents a day, the spend is rounding error against the downstream risk.

The sacrifice: cost. You overpay per call on purpose, because the alternative is a wrong liability cap in a signed contract.

## The levers that partially cheat the triangle

Naming your sacrifice gets you a long way. But three structural moves let you bend an edge without simply giving up an axis. None is free; each buys relief at a price.

### Prompt caching: cut cost, keep quality and latency

When you send the same long prefix on every request, a system prompt, tool definitions, a big chunk of retrieved context, you pay full input price to process it every single time. Prompt caching stops that. The provider stores the processed form of a stable prefix and charges you a fraction to reuse it. On Anthropic, a cache read costs 0.10x the base input price, a 90% discount on the cached portion; the one-time cache write costs 1.25x.[^8]

The output is byte-for-byte identical to an uncached call, so quality is untouched, and skipping the prefill can actually lower TTFT on long prompts.[^8] This is the rare lever with no quality or latency penalty. It attacks cost alone.

The math compounds hard with multi-turn context. A 10-turn agent carrying a 50,000-token system context, with a 200-token user message and 500-token response each turn on Claude Sonnet 4.6:

```python
# Claude Sonnet 4.6 prices, June 2026: $3.00 in / $15.00 out per MTok
# cache write 1.25x input, cache read 0.10x input

def without_cache(ctx, user, out, turns):
    inp = (ctx + user) * turns
    return inp * 3.00 / 1e6 + out * turns * 15.00 / 1e6

def with_cache(ctx, user, out, turns):
    # turn 1 writes the cache; later turns read it
    cost = ctx * 3.75 / 1e6 + user * 3.00 / 1e6 + out * 15.00 / 1e6
    for _ in range(turns - 1):
        cost += ctx * 0.30 / 1e6 + user * 3.00 / 1e6 + out * 15.00 / 1e6
    return cost

print(f"No cache:   ${without_cache(50_000, 200, 500, 10):.2f}")  # $1.58
print(f"With cache: ${with_cache(50_000, 200, 500, 10):.2f}")     # $0.40
```

That is a 74.5% cut on the same conversation, same model, same answers.[^8] The catch is architectural discipline: the cached prefix must be byte-identical across requests. A timestamp or a per-request ID anywhere before the cache breakpoint changes the hash and the cache never hits. The fix is a layout rule, stable content first (system prompt, tools, context), variable content last (the user's message). Prompt Caching in Part 2 covers the breakpoints, the per-model token minimums, and how to confirm a hit.

### Routing: cut cost by matching task to model

If 80% of your traffic is easy, sending all of it to a flagship is a category error. Routing fixes that. A gateway classifies each request by likely difficulty and sends it to the cheapest model that clears the quality bar for that difficulty. The standard pattern is cheap-then-expensive: try the cheap model first, escalate to a stronger one only when a lightweight check (schema validation, a confidence score, a fast second eval) says the cheap answer failed.

The escalation costs one extra call's latency when the cheap model misses. That is worth it when the escalation rate stays under about 20% and the price gap between tiers is large, say 5x to 10x.

```python
from dataclasses import dataclass

@dataclass
class RoutingPolicy:
    ttft_budget_ms: int
    quality_threshold: float

def select_model(complexity: str, policy: RoutingPolicy) -> str:
    if complexity == "simple":
        if policy.ttft_budget_ms < 300:
            return "groq/llama-4-70b"   # ~0.16s TTFT P50, June 2026
        return "claude-haiku-4-5"        # $1/$5 per MTok
    if complexity == "medium":
        return "claude-sonnet-4-6"       # $3/$15, ~0.74s TTFT P50
    # hard: only escalate to a reasoning-capable tier if latency allows
    if policy.ttft_budget_ms >= 10_000:
        return "claude-opus-4-8"         # $5/$25 per MTok
    return "claude-sonnet-4-6"           # best within a chat budget

chat = RoutingPolicy(ttft_budget_ms=2_000, quality_threshold=0.85)
assert select_model("hard", chat) == "claude-sonnet-4-6"  # opus too slow for 2s
```

Notice the hard-query branch refuses to promote to the reasoning tier when the TTFT budget is tight. That single guard is what the voice-assistant team missed. Treat TTFT as a hard constraint in the routing policy, not a soft goal, or reasoning models will silently blow your latency budget the moment a hard query arrives.[^1]

Routing is not free, either. It needs a classifier, per-tier eval validation, and ongoing eval on a sample of live traffic, because the eval set you built before launch will drift from production. As a rough floor, single-model is fine below a few hundred requests an hour; routing starts paying off when traffic is high and difficulty genuinely varies. Gateways and Routing in Part 2 covers the implementation, and at architecture scale the gateway itself (multi-provider load balancing, failover, cost monitoring) is a system-design problem covered in HLD Part 9.

### Distillation: cut cost and latency, pay upfront

Distillation trains a small student model to copy a big teacher on one narrow task. You prompt the teacher to generate a large dataset of demonstrations, then fine-tune the student on it. A well-distilled model can run roughly 130x cheaper and 130x faster than the frontier model it learned from, but only on the narrow task it was trained for.[^7] It learned a shortcut, not general intelligence, and it will produce confident nonsense on anything off-distribution.

This is the expensive lever, and the only one with real upfront cost. Training a 7B student from a frontier teacher runs $5,000 to $30,000 in compute before labor.[^7] Whether that pays off is one division:

```python
def breakeven_months(training_cost, teacher_monthly, student_monthly):
    savings = teacher_monthly - student_monthly
    return training_cost / savings if savings > 0 else None

# High volume, self-hosting saturated hardware:
print(breakeven_months(15_000, 14_000, 3_000))  # 1.4 months -> do it
# Medium scale, modest API bill:
print(breakeven_months(15_000, 1_200, 1_000))   # 75 months -> don't
```

The rule of thumb: breakeven under 6 months is a strong candidate, 6 to 12 months means think hard, over 12 months is almost always the wrong tool.[^7] Because frontier prices fell about 80% over 2024 to 2026, pure API-bill savings rarely justify distillation anymore. The cases that still hold in 2026 are the ones APIs can't serve at any price: sub-100ms latency that a network round-trip can't meet, and air-gapped or privacy-bound deployments in healthcare, finance, or on-device.[^7]

The trap is distilling an unstable task. A distilled model is frozen at training time. If your classification schema changes quarterly, each change is another $5,000-to-$30,000 retraining cycle, and the cost advantage evaporates. Distill only what is narrow, high-volume, and stable. Everything else stays on the teacher, where a prompt edit costs nothing.

> [!WARNING]
> **The most common way to break the triangle is to optimize quality and never instrument TTFT.** A routing rule that promotes hard queries to a reasoning tier looks like a pure win on the eval dashboard and on the total-latency graph, because total time barely moves. Meanwhile TTFT jumps 30x to 60x and the product feels frozen to every user with a hard question.[^1] Track TTFT as its own metric, per model and per route, before you let any reasoning-mode variant into a latency-sensitive surface.

Every product decision in this book lands somewhere on this triangle. When a choice feels hard, the move is always the same: write down the three numbers, name the axis you can afford to sacrifice, and check whether caching, routing, or distillation can buy back the one you can't.

## References

[^1]: Tian Pan, "Time-to-First-Token Is the Latency SLO You Aren't Instrumenting", tianpan.co, April 23 2026. https://tianpan.co/blog/2026-04-23-ttft-latency-slo-streaming-reasoning-models
[^2]: Google, "Gemini Developer API Pricing", ai.google.dev (last updated 2026-06-09). https://ai.google.dev/pricing
[^3]: Anthropic, "Claude API Pricing", anthropic.com (fetched June 2026). https://www.anthropic.com/pricing
[^4]: Digital Applied Team, "AI Model Latency Benchmarks 2026: TTFT and TPS across 30 model-provider pairings", digitalapplied.com, April 2026. https://www.digitalapplied.com/blog/ai-model-latency-benchmarks-2026-ttft-throughput
[^5]: OpenAI, "API Pricing", openai.com (fetched June 2026). https://openai.com/api/pricing/
[^6]: OpenAI, "API Pricing" (GPT-5.4 mini tier), openai.com (fetched June 2026). https://openai.com/api/pricing/
[^7]: Tian Pan, "Knowledge Distillation Economics: When Compressing a Frontier Model Actually Pays Off", tianpan.co, April 9 2026. https://tianpan.co/blog/2026-04-09-knowledge-distillation-economics-production-ai
[^8]: Anthropic, "Prompt Caching", docs.anthropic.com (fetched June 2026). https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

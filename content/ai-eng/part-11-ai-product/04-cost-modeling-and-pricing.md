---
title: "Cost modeling and pricing"
description: "Why marginal cost matters again. Cost-per-task (not per-token), the four pricing architectures, and the math that says when a feature is too expensive to ship."
slug: 04-cost-modeling-and-pricing
part: 11
chapter: 4
difficulty: intermediate
prerequisites:
  - part-1-how-models-behave/05-the-cost-quality-latency-triangle
  - part-2-working-with-model-apis/07-prompt-caching
  - part-2-working-with-model-apis/06-gateways-and-routing
tags: [llm, cost]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Cost modeling and pricing

In June 2025, a Cursor user got an invoice for $7,225 for a single month of agent loops.[^1] The same user, on the previous pricing model where premium model requests cost a flat $0.04 each, had been running large-context agent loops at what Cursor was effectively subsidizing. When the company switched to API-equivalent pass-through rates, the math the user was getting hadn't changed. The math the user was *paying for* had.

That's the new shape of unit economics for AI products. Marginal cost per request doesn't compress toward zero as you scale. Every query sends real tokens to a provider and incurs a real charge that scales almost linearly with context length and output length. Traditional SaaS gross margins run 70-90%; AI-forward companies are landing at 50-60%, with the gap explained almost entirely by inference spend.[^2]

This chapter is about three decisions: measuring cost in terms the business can act on, choosing a pricing model that doesn't quietly bleed margin to power users, and setting a numeric threshold for when a feature is just too expensive to ship at the price point you want. The deep mechanics of caching live in [Prompt caching](../part-2-working-with-model-apis/07-prompt-caching.md); routing implementations are in [Gateways and routing](../part-2-working-with-model-apis/06-gateways-and-routing.md). What we're doing here is the math on top.

## Cost-per-token is the wrong unit

Providers bill on tokens. Builders ship tasks. The conversion between them is where most cost analyses break.

The naive formula looks innocent:

```text
cost_per_call = (input_tokens * input_price + output_tokens * output_price) / 1e6
```

But a task isn't a single call. It's the system prompt re-sent on every turn, the accumulating conversation history, the tool schemas (which Anthropic bills as 290-497 input tokens of overhead per call depending on model and choice[^3]), the validator call when you check output quality, and the retries when validation fails. The right unit is reliability-adjusted cost per successful task:

```text
cost_per_task = sum(cost_per_call for all calls in the workflow) / p_success
```

A workflow with p_success = 0.85 inflates true cost-per-task by 18% over the naive single-call estimate. Zartis documented a case where $200/day in inference tokens was producing $20,000/day in analyst remediation cost (5 minutes per failure at $80/hour loaded cost across 10,000 daily tasks). The API dashboard showed the $200. The $20,000 was scattered across Jira tickets.[^4]

The other quiet drain in multi-turn workflows is context accumulation. A 10-turn chat with 200 tokens per turn re-sends 2,000 tokens of history on turn 10, 1,800 on turn 9, and so on. That's 11,000 hidden input tokens beyond what naively appears in the transcript. At Sonnet 4.6 input pricing ($3/MTok as of June 2026[^3]), that's $0.033 per 10-turn conversation in invisible overhead unless you instrument each call.

```python
def cost_per_task(system_prompt_tokens, user_tokens, output_tokens,
                  input_price_per_mtok, output_price_per_mtok,
                  cache_hit_rate=0.0, p_success=1.0):
    cache_read_price = input_price_per_mtok * 0.10  # Anthropic 10% cache read
    cached = system_prompt_tokens * cache_hit_rate
    uncached = system_prompt_tokens * (1 - cache_hit_rate) + user_tokens
    input_cost = (uncached * input_price_per_mtok + cached * cache_read_price) / 1e6
    output_cost = output_tokens * output_price_per_mtok / 1e6
    return (input_cost + output_cost) / p_success

# Customer support classifier on Haiku 4.5: $1/$5 per MTok, June 2026
print(f"${cost_per_task(500, 150, 80, 1.0, 5.0, cache_hit_rate=0.8, p_success=0.95):.6f}")
```

## Worked math at June 2026 prices

Three reference points anchor the rest of the chapter. All prices are standard-tier as of June 2026.[^3][^5]

**Customer support classifier on Haiku 4.5** ($1/$5 per MTok, 80% cache hit rate on a 500-token system prompt). Cost per call: $0.000690. With p_success = 0.95: $0.000726 per task. At 50,000 tasks/day, that's $36/day, roughly $1,100/month.

**Document summarization on GPT-5.4** ($2.50/$15 per MTok, no caching because each document is unique). 5,000 input tokens, 400 output tokens. Cost per call: $0.019. With p_success = 0.90: $0.021 per task. At 1,000 tasks/day, $640/month.

**Multi-turn agent with tools on Claude Fable 5** ($10/$50 per MTok, 5 turns averaging 2,000 context tokens plus 300 user tokens plus 497 tokens of tool overhead per turn, 500 output tokens per turn). Per-turn cost: $0.053. Five turns: $0.265. With p_success = 0.80: $0.331 per task. This is the regime where frontier-model agentic tasks get economically marginal against anything below ~$300/month ARPU at standard SaaS margins.

The batch API discount applies to all three providers: 50% off standard prices for asynchronous workloads with up to 24-hour turnaround.[^3][^5][^6] Document summarization in Example B drops from $0.021 to ~$0.011 per task on batch. The 24-hour SLA disqualifies batch for interactive features but unlocks it for nightly reports, bulk classification, and offline evals.

## The cross-subsidy problem

Tasks-per-user isn't normally distributed. The top 5-10% of users typically drives 50-80% of token spend.[^2] A flat-fee product designed for the median user can show positive margin at the median while losing money on the top decile.

```python
def margin_per_user(arpu, tasks_per_month, cost_per_task, infra_overhead=0.05):
    llm_cost = tasks_per_month * cost_per_task
    infra_cost = arpu * infra_overhead
    cogs = llm_cost + infra_cost
    margin = (arpu - cogs) / arpu if arpu > 0 else 0
    return {
        "llm_cogs": llm_cost,
        "gross_profit": arpu - cogs,
        "gross_margin_pct": round(margin * 100, 1),
    }

# $20/mo plan, median user at 50 tasks, $0.005/task: comfortable
print(margin_per_user(20.0, 50, 0.005))
# Same plan, P95 user at 500 tasks: still positive but thin
print(margin_per_user(20.0, 500, 0.005))
# Heavy user at 5,000 tasks: deeply negative
print(margin_per_user(20.0, 5000, 0.005))
```

The Requesty analysis of 1,000+ developers using AI coding agents (May 2026) makes the distribution real: average LLM cost per active user is $92/month, rising to $108 for Claude Code users. P95 users hit $291/month.[^1] A product charging $20/month per seat and serving P95 users at $291 in API spend is running deeply negative margins on those accounts no matter what flat-fee assumption it started with.

## Four pricing architectures

The pricing-model choice is structurally different from any prior SaaS pricing decision because the provider's cost varies continuously with user behavior while a flat seat fee delivers fixed revenue. Four architectures cover the production landscape.

**Per-seat (bundled flat fee).** All token costs absorbed by the vendor. Simplest to sell, fastest to adopt, zero billing friction. The failure mode is invisible margin compression: when usage spikes in a cohort, gross margin degrades silently. The $50/user/month plan that consumed $30 in LLM fees is a documented pattern.[^2] Per-seat works when you can tightly bound usage by product design (fixed output lengths, narrow scope) and LLM costs are below 10-15% of subscription revenue.

**Usage-based / metered overage.** A base subscription covers a token or task allowance; users pay per-unit beyond it. Provider cost structure maps to user bill. The failure mode is surprise billing: users who don't monitor usage get unexpectedly large invoices and churn or dispute. Cursor's June 2025 pricing change is the canonical case: switching from $0.04/request flat to API-equivalent pass-through generated significant backlash, including the $7,225 invoice that opened this chapter.[^1] Metered works when the unit is legible to the user (tokens, tasks, calls), the user has enough control over usage that a metered bill feels fair, and the product provides real-time spend visibility. GitHub Copilot moved all plans to usage-based credits in June 2026, reflecting industry convergence on this model for tools where heavy users impose disproportionate cost.

**Credit-based.** Users buy a pool of credits upfront; AI invocations deduct from the pool. Credits decouple the user-facing price unit from tokens. The failure mode is opacity: users don't understand why a longer conversation costs more credits, and the vendor's cost structure hides behind an arbitrary conversion factor. Token-mapped credits ship cost risk to customers and reduce adoption willingness.[^7] What works is value-mapped credits: 1 credit = 1 resolved support ticket, 1 approved document, 1 published draft. Lovable charges by credits mapped to "meaningful builds," not tokens.[^8]

**Outcome-based.** Charge only when a defined downstream outcome occurs. Intercom's Fin charges $0.99 per fully resolved conversation (no human intervention) after 50 free resolutions per month, on top of a $49/month base.[^9] The vendor absorbs LLM cost on all failed attempts. Outcome-based works when there's an observable binary outcome the platform already tracks, the vendor can reliably model the failure rate to price the outcome above break-even, and customer ROI is clearly tied to outcome count. Intercom required years of resolution-tracking infrastructure before this was viable.

The dominant pattern as of 2026 is hybrid. 56% of AI SaaS companies use a base subscription with a defined usage allowance plus metered overage or credit-wallet billing beyond it.[^2] For most AI-heavy products at $20-$99/month ARPU, hybrid is the right default because it's the only architecture that doesn't require either capping the feature to death or hoping power users stay marginal.

## When a feature is too expensive to ship

The decision rule has a clean form. A feature is shippable when its cost-per-task at P90 user behavior would not compress gross margin below the product's floor. The floor depends on the company's profile: 60-70% for SaaS-primary, 40-50% for AI-primary.[^2]

```python
def ship_decision(arpu, tasks_per_month, cost_per_task,
                  target_margin=0.60, infra_overhead=0.05):
    max_total_cogs = arpu * (1 - target_margin)
    max_llm_budget = max_total_cogs - arpu * infra_overhead
    max_cost_per_task = max_llm_budget / tasks_per_month if tasks_per_month > 0 else 0
    actual_cogs = cost_per_task * tasks_per_month + arpu * infra_overhead
    actual_margin = (arpu - actual_cogs) / arpu
    return {
        "max_cost_per_task_for_target_margin": round(max_cost_per_task, 6),
        "actual_margin_pct": round(actual_margin * 100, 1),
        "verdict": "SHIP" if actual_margin >= target_margin else "HOLD",
    }
```

When the math says HOLD, the interventions to apply, in order of cost:

1. **Model downgrade.** Replace the frontier model with a smaller one for tasks where the quality delta isn't user-visible. Haiku 4.5 is 5x cheaper than Sonnet 4.6 on input and output.[^3]
2. **Prompt caching.** Anthropic cache reads cost 10% of standard input rate; cache writes cost 125% (5-minute TTL) or 200% (1-hour TTL). A 500-token system prompt at 80% hit rate drops effective input cost from $1/MTok to $0.28/MTok on Haiku 4.5.[^3]
3. **Context compression.** Summarize old conversation turns instead of re-sending full transcripts. Cuts the context tax on multi-turn workflows.
4. **Model routing.** Send simple requests to a cheap model and complex requests to the frontier. A complexity classifier that routes 70% to a 5x-cheaper tier cuts overall LLM COGS by ~60% if quality holds.
5. **Batch API.** For non-interactive workloads, take the 50%-off batch tier.
6. **Rate limits and usage caps.** GitHub Copilot Free's 2,000 completions plus 50 chat messages per month is an explicit economic constraint, not a product decision.[^2]
7. **Reprice.** Raise the price or move to a higher tier. Intercom's pricing reset (~$15M ARR exposure) showed repricing is viable when done transparently.[^10]
8. **Don't ship.** A feature that's profitable at $99/month and unprofitable at $20/month is a pricing decision, not a capability limitation.

Intercom's most quoted internal datum: AI-suggested prompts in their early co-pilot consumed nearly 50% of operating cost while registering under 1% user adoption. Removing that single feature doubled product margin with no user-visible impact.[^10]

The "subsidized AGI" failure mode is worth naming because it leads teams to wrong conclusions. As of mid-2026, ChatGPT Pro at $200/month runs at -1,650% gross margin at full utilization; Claude Max 20x at $100/month runs at -900%.[^11] Every consumer AI subscription tier crosses into negative margin once a single power user exceeds 10-20% of advertised capacity. These companies are intentionally subsidizing usage to drive adoption. A startup without that balance sheet shouldn't replicate the model without explicit funding for the subsidy. Use provider API rates, not consumer subscription prices, when modeling your task-level economics.

## References

[^1]: Requesty, "The Coding Agent Economy", May 2026. https://www.requesty.ai/coding-agent-economy

[^2]: Tian Pan, "Pricing Your AI Product: Escaping the Compute Cost Trap", April 16, 2026. https://tianpan.co/blog/2026-04-16-pricing-ai-product-compute-cost-trap

[^3]: Anthropic, "Pricing", API Documentation, June 2026. https://docs.anthropic.com/en/docs/about-claude/pricing

[^4]: Zartis, "AI Agent Cost Optimisation: Why Token Cost Is the Wrong Number to Optimise", 2026. https://www.zartis.com/ai-agent-cost-optimisation-why-token-cost-is-the-wrong-number-to-optimise/

[^5]: OpenAI, "API Pricing", June 2026. https://openai.com/api/pricing/

[^6]: Google, "Gemini Developer API Pricing", June 2026. https://ai.google.dev/gemini-api/docs/pricing

[^7]: Apptension, "AI Unit Economics: Measure Cost Per Task, Not Tokens", 2026. https://apptension.com/guides/ai-unit-economics-cost-per-task-not-tokens

[^8]: Freemius, "AI App Pricing Patterns", 2026 (Lovable credit-mapping example).

[^9]: Intercom, "Fin AI Agent Pricing", June 2026. https://www.intercom.com/fin

[^10]: Chargebee, "How Intercom Built Its Outcome-Based Pricing Model for AI", December 2025. https://www.chargebee.com/blog/how-intercom-built-its-outcome-based-pricing-model-for-ai/

[^11]: Business Engineer, "The Subsidized AGI Economy", mid-2026. https://businessengineer.ai/p/the-subsidized-agi-economy

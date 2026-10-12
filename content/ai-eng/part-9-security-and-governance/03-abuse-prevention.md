---
title: "Abuse prevention"
description: "Rate limits, spend caps, per-tenant budgets, and the behavioral signals that catch automated abuse before it shows up on the bill."
slug: 03-abuse-prevention
part: 9
chapter: 3
difficulty: intermediate
prerequisites:
  - part-2-working-with-model-apis/00-calling-models
  - part-2-working-with-model-apis/06-gateways-and-routing
tags: [llm, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Abuse prevention

In May 2024, Sysdig's Threat Research Team published a post-mortem on a live attack they called LLMjacking. The attacker exploited a Laravel RCE on a victim's web server, lifted AWS credentials, and started running inference against Claude on Bedrock. The victim paid the bill. Worst-case rate at scale: over $46,000 per day for a single compromised account. The attacker resold access through a reverse proxy.[^1]

That number is what abuse prevention is for. AI endpoints look like ordinary HTTP APIs to your gateway, but the unit economics are different. A single unconstrained request can consume 50,000 tokens and a few cents in provider cost. A loop, a leaked key, or a deliberately crafted long-context payload turns into thousands of dollars an hour with no corresponding revenue. Three threat shapes drive the engineering: external abuse (scrapers, credential theft), internal overconsumption (runaway batch jobs, agent retry loops), and economic exploitation (OWASP's LLM10:2025 calls this "Denial of Wallet").[^2]

You defend against all three with the same three layers: provider rate limits, application-layer per-tenant controls, and behavioral abuse detection. Each catches a different class of attack and none substitutes for another.

## Provider limits don't isolate your tenants

The first thing to internalize: Anthropic's and OpenAI's rate limits protect *the provider's infrastructure from your organization*, not your tenants from each other. If one of your customers exhausts your shared org-level RPM allowance, every other customer sees 429s until the bucket refills.

Anthropic's documented algorithm is the token bucket: "your capacity is continuously replenished up to your maximum limit, rather than being reset at fixed intervals."[^3] OpenAI uses a rolling per-minute window with similar continuous semantics.[^4] Both providers enforce three independent dimensions on most chat endpoints: requests per minute (RPM), input tokens per minute (ITPM), and output tokens per minute (OTPM). One request with 100,000 input tokens stays under the RPM limit while crushing the ITPM allowance. You need all three.

Two operational things worth knowing about Anthropic's limits specifically (as of June 2026). First, `cache_read_input_tokens` don't count toward ITPM. An organization with a 2M ITPM cap and 80% cache hit rate can effectively process 10M total input tokens per minute.[^3] Second, workspaces inside an organization can carry their own limits below the org limit, which is the main mechanism for protecting one internal team from another's runaway job. Set workspace limits to 70-80% of the org cap to reserve burst headroom.

Tier ladders set the monthly spend ceiling. Anthropic ranges from Tier 1 ($500/month, $5 deposit to enter) to Tier 4 ($200,000/month, $400 deposit). OpenAI's tiers go from Tier 1 ($100/month) to Tier 5 ($200,000/month, $1,000 lifetime spend).[^3][^4] These ceilings are blast-radius caps, not budgets you should rely on. Even at Tier 1, $500 is way more than a free user should ever cost.

## Per-tenant budgets at the gateway

Application-layer per-tenant controls are where actual cost isolation lives. The minimum architecture: a token-aware rate limiter and a spend cap, both keyed by tenant.

Cost varies by model. A 2,000-token input with a 500-token Claude Sonnet 4.6 response is $0.0135 per call as of June 2026 ($3 per million input tokens, $15 per million output).[^5] At 1,000 calls a day from a single noisy tenant, that's $405 a month. Now imagine an attacker has scripted that tenant's API key. The math gets ugly fast. You set a per-tenant monthly budget that's the right multiple of expected usage (1.5x is a reasonable default for paying tiers; tighter for free).

```python
from dataclasses import dataclass

@dataclass
class SpendCapResult:
    allowed: bool
    estimated_cost: float
    remaining_budget: float
    reason: str | None = None

def check_spend_cap(
    current_spend: float,
    monthly_budget: float,
    input_tokens_est: int,
    output_tokens_est: int,
    input_price_per_mtok: float = 3.0,
    output_price_per_mtok: float = 15.0,
) -> SpendCapResult:
    est = (input_tokens_est / 1_000_000 * input_price_per_mtok +
           output_tokens_est / 1_000_000 * output_price_per_mtok)
    remaining = monthly_budget - current_spend
    if remaining <= 0:
        return SpendCapResult(False, est, remaining, "budget_exhausted")
    if est > remaining:
        return SpendCapResult(False, est, remaining, "would_exceed_budget")
    return SpendCapResult(True, est, remaining - est)
```

The pattern this code wraps is **optimistic reservation**: estimate cost from the known input token count plus the configured `max_tokens`, atomically increment the tenant's running spend counter in Redis (`INCRBYFLOAT` against a per-tenant key), dispatch the request, then reconcile against the actual `usage.input_tokens` and `usage.output_tokens` after the response returns. Pre-call latency stays at one Redis round-trip, around 0.8 ms in LiteLLM's measurements.[^6] The atomicity is the whole point: a non-atomic read-check-write loop lets two concurrent requests both see "$0.09 spent of $0.10" and both pass the check, and you've blown the budget.

Return HTTP 402 (Payment Required) when a budget trips. It's semantically correct and lets clients distinguish budget exhaustion from rate limiting cleanly. LiteLLM uses 400 with `error.type: "budget_exceeded"`; OpenAI and Anthropic conflate budget violations into 429.[^3][^4][^6]

![A horizontal flow diagram with a client request entering on the left, passing through three stacked filter boxes labeled behavioral detector, app-layer rate limiter and spend cap, and provider rate limit, before reaching an LLM provider on the right; failed requests exit downward with the error codes 403, 429 and 402, and provider 429, with each layer annotated with the class of attack it catches](images/03-three-layer-stack.png)
*Three layers, three classes of failure to catch. Each layer sees something the others can't.*

## Pick the right algorithm

Four standard rate-limit algorithms; for AI endpoints, two are right and two are wrong.

**Token bucket** is the default. Each tenant has a bucket with a maximum capacity and a refill rate. Each request consumes some weight from the bucket; an empty bucket returns 429. While idle, the bucket refills continuously. This handles legitimate bursty AI workloads (a user pasting a long document for analysis) without penalizing them. Anthropic uses it; that's the industry tell.[^3]

**Sliding-window counter** is the practical choice when strict per-tenant fairness matters more than burst tolerance. It stores two integer counters and a window timestamp per tenant, estimates the current rate as a weighted blend, and stays at O(1) memory. Use it for shared free tiers where one user shouldn't be able to spike past their fair share at any moment.

**Sliding-window log** is the exact-accuracy version: store every request timestamp in a Redis sorted set, expire old entries, count what remains. Reach for it only when exact per-identity accounting is mandatory and memory cost (which scales with attack volume during an actual attack) is acceptable.[^7]

**Fixed window** is the wrong choice for any public AI endpoint. The boundary amplification bug is well-documented: a script that sends N requests at 11:59:59.9 and N more at 12:00:00.1 doubles its effective rate at every reset. Don't use it.[^7]

Distributed coordination matters once you have more than one gateway instance. The standard pattern: keep a shared Redis cluster as the source of truth, sync local in-memory caches to it on a short interval. LiteLLM syncs every 10 ms, achieving roughly 2x throughput over per-request Redis round-trips at the cost of at most ten requests of drift at 100 RPS across three instances.[^6] That drift is acceptable for cost control. If you need exact accounting, use the Redis pipeline for every check (`ZREMRANGEBYSCORE`, `ZADD`, `ZCARD` in a `MULTI/EXEC` block) and accept the latency.

## What rate limits don't catch

Sophisticated abuse stays under the rate limit on purpose. A scraper or API reseller sets its rate to just below the threshold by definition; behavioral detection is what catches it. Five signals, in roughly descending value-per-effort:

- **Timing regularity.** Humans have variance: thinking pauses, reading time, navigation. Bots have a `time.sleep()` interval. A coefficient of variation (stddev/mean of inter-request times) below 0.1 over a 10-minute window is a strong bot signal for conversational endpoints.
- **Diurnal pattern absence.** Real users follow a daily curve, business hours or evenings. A key with flat 24/7 utilization at near its rate-limit ceiling is the textbook LLMjacking signature. Run a CUSUM detector on hourly token burn against a 14-day rolling baseline per tenant.[^1]
- **Output-token length anomaly.** Each product has a typical output distribution. Exfiltration attacks and model-extraction attempts produce anomalously long structured outputs. Flag sessions where the last five outputs exceed three standard deviations above the tenant's 30-day moving average.
- **Model enumeration.** The Sysdig analysis caught attackers sending `InvokeModel` with `max_tokens_to_sample: -1` to enumerate accessible models without burning expensive tokens.[^1] A sequence of `ValidationException` or `AccessDenied` responses across model IDs from one identity is a reconnaissance signature.
- **Client-fingerprint tells.** The OAI Reverse Proxy advertises a distinctive user-agent. Maintain a blocklist. Clients that never vary their user-agent across sessions, omit headers present in real SDKs, or use non-standard TLS fingerprints are all signals.

The Arcjet engineering analysis (February 2026) frames this as the volumetric-versus-behavioral split: volumetric controls (rate limits, spend caps) prevent cost overruns from any source; behavioral controls catch patterns under volumetric thresholds.[^8] Use both. Layer them so volumetric is a hard stop and behavioral is an anomaly trigger that escalates through soft actions: a CAPTCHA, a manual review queue, a temporary suspension. Hard-blocking on a behavioral signal alone is too noisy.

## The infinite-loop case

The most expensive abuse usually comes from inside the building. An agent retries a failing tool call. The retry fails. The retry of the retry fails. The agent thinks, generates more tokens, tries again. Most agent frameworks ship without per-session iteration or cost caps by default.

A November 2025 incident with a LangChain dual-agent reportedly burned $47,000 over 11 days from one runaway loop.[^9] OWASP catalogs this exact pattern under LLM10:2025.[^2] The fix is two caps in series, not one: a maximum iteration count *and* a maximum spend per session. Iteration alone misses long-context loops where one iteration spends a hundred dollars. Spend alone misses fast loops where iteration count would catch them sooner.

LiteLLM's Agent Gateway exposes `max_iterations` and `max_budget_per_session`; LangGraph exposes `recursion_limit`. Set both. Alert when any single `session_id` accumulates more than 50 LLM calls in a 30-minute rolling window or more than $5 in a single session. Those numbers are starting points; tune them against your distribution.

## Detecting credential theft

The Sysdig LLMjacking post-mortem is the most detailed published account of what credential abuse looks like in CloudTrail logs, and the operational lessons translate directly:[^1]

- Enable model invocation logging by default. Sysdig found attackers actively check `GetModelInvocationLoggingConfiguration` and skip keys with logging enabled. Logging is itself an active deterrent.
- Set IAM SCPs to restrict `InvokeModel` to known IP ranges or VPC endpoints, not the whole internet.
- Set a conservative monthly spend ceiling at account creation. Even on Tier 1, the default is $500; for keys that should never see production traffic, lower it.
- Rotate keys quarterly. Never commit them to version control. Use Secrets Manager or Vault with rotation enabled.
- Monitor for the reconnaissance signatures: `max_tokens_to_sample: -1`, `ValidationException` patterns across model IDs, sudden geolocation shifts on the source IP.

For Bedrock specifically, AWS introduced automatic per-IAM-principal cost attribution in April 2026, which means you no longer need a separate Application Inference Profile (AIP) just for attribution if you have IAM-role-per-tenant.[^10] For SaaS with many tenants sharing one role, AIPs with custom tags (`tenant_id`, `project`) remain the recommended pattern and feed straight into Cost Explorer dashboards. Attribution is not enforcement, though. Pair AIPs with CloudWatch alarms on `InvokeModel` volume that trigger Lambda actions (suspend key, notify customer) when a tenant crosses a threshold.

## Build vs. buy the gateway

The decision rule is approximately: build your own Redis-backed limiter and spend cap until you have more than three distinct tenant classes or more than $1,000 a month in AI spend. Above that threshold, reach for a gateway product (LiteLLM, Bifrost, or a commercial alternative) when any of three things become true: you need per-model-per-tenant limits, you operate multi-provider and need unified governance across them, or compliance requires audit logs of per-request spend attribution. LiteLLM's published overhead is 3 to 8 ms per request in production deployments.[^6] Bifrost reports 11 microseconds in the single-node in-memory case.[^11] Both are well below the latency floor of any LLM call, so the choice is about features and operational model, not performance.

For more on the gateway architecture broadly, see [Gateways and routing](../part-2-working-with-model-apis/06-gateways-and-routing.md). The token-bucket and sliding-window mechanics in this chapter extend cleanly into the [HLD rate-limiter case study](../../hld/part-8-case-studies/02-rate-limiter.md) for the architecture-scale view.

The next chapter, [PII and privacy](./04-pii-and-privacy.md), covers what you do with the prompts and outputs the gateway is now logging at scale.

## References

[^1]: Alessandro Brucato (Sysdig Threat Research Team), "LLMjacking: Stolen Cloud Credentials Used in New AI Attack," Sysdig Blog, 6 May 2024, https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack

[^2]: OWASP GenAI Security Project, "LLM10:2025 Unbounded Consumption," 2025, https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/

[^3]: Anthropic, "Rate limits," Claude API Documentation, accessed June 2026, https://docs.anthropic.com/en/api/rate-limits

[^4]: OpenAI, "Rate limits," OpenAI API Documentation, accessed June 2026, https://platform.openai.com/docs/guides/rate-limits

[^5]: usagebox.com, "Claude API Billing in 2026: Opus 4.7 / Sonnet 4.6 / Haiku 4.5 Limits," May 2026, https://usagebox.com/articles/api-usage-billing-claude-limits

[^6]: BerriAI, "Budgets, Rate Limits," LiteLLM Proxy Documentation, accessed June 2026, https://docs.litellm.ai/docs/proxy/users

[^7]: Cassie Gatton, "Rate Limiting Algorithms: Token Bucket vs Sliding Window vs Fixed Window," Arcjet Blog, 24 March 2026, https://blog.arcjet.com/rate-limiting-algorithms-token-bucket-vs-sliding-window-vs-fixed-window/

[^8]: Cassie Gatton, "Detecting Bots, Scraping, and AI-driven Abuse at the Application Layer," Arcjet Blog, 10 February 2026, https://blog.arcjet.com/detecting-bots-scraping-and-ai-driven-abuse-at-the-application-layer/

[^9]: Tian Pan, "Token Spend Is a Security Signal Your SOC Isn't Watching," tianpan.co, 23 April 2026, https://tianpan.co/blog/2026-04-23-token-spend-security-signal-soc

[^10]: AWS Machine Learning Blog, "Manage multi-tenant Amazon Bedrock costs using application inference profiles," July 2025; "Introducing granular cost attribution for Amazon Bedrock," April 2026, https://aws.amazon.com/blogs/machine-learning/manage-multi-tenant-amazon-bedrock-costs-using-application-inference-profiles/

[^11]: Kamya Shah, "Budget and Rate Limit Architecture for Multi-Tenant LLM Platforms," Maxim AI / Bifrost Engineering Blog, 3 June 2026, https://www.getmaxim.ai/articles/budget-and-rate-limit-architecture-for-multi-tenant-llm-platforms/

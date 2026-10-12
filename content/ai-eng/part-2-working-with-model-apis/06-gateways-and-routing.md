---
title: "Gateways and routing"
description: "One API in front of many providers, cheap-then-expensive cascades, provider failover, and the rule for when a gateway earns its operational cost."
slug: 06-gateways-and-routing
part: 2
chapter: 6
difficulty: intermediate
prerequisites:
  - 00-calling-models
  - 04-errors-retries-fallbacks
  - 05-choosing-models-and-reading-benchmarks
tags: [llm, http-api, api-gateway]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Gateways and routing

It's a Tuesday afternoon and OpenAI is having a bad hour. Their status page is yellow. Your app is calling `gpt-4o` directly through the official SDK, and every request is timing out. You have an Anthropic key in the same vault. You have a working Bedrock account. You can't use either of them without shipping code, because your call sites all import `openai`, hard-code the model name, and parse OpenAI's response shape downstream. By the time you've branched, opened a PR, and rolled out, the incident is over.

That's the failure mode a gateway exists to prevent. A gateway is a single OpenAI-compatible endpoint that sits in front of every provider you care about. Your app calls it like it's calling OpenAI. Behind the scenes, it picks a backend, translates the request if needed, normalizes the response, and hands you the result. When OpenAI is down, the gateway routes to Anthropic. When the cheap model would do, it picks the cheap model. None of that logic lives in your application code.

## The pattern: one endpoint, many backends

The mechanism is a reverse proxy with three jobs. It speaks OpenAI's `/v1/chat/completions` schema on the front, it speaks each provider's native API on the back, and it owns a routing policy in the middle that decides where each request goes.[^1] You point your existing OpenAI SDK at the gateway's URL, swap in a gateway API key, and stop touching your code:

```python
from openai import OpenAI

# Same SDK. Same call shape. Different base_url.
client = OpenAI(
    base_url="https://your-gateway.example.com/v1",
    api_key="GATEWAY_KEY",
)

response = client.chat.completions.create(
    model="gpt-4o",  # logical name; gateway decides the real backend
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].message.content)
print("served by:", response.model)  # which backend actually answered
```

The `model` field in the response tells you which backend really served the request. Log it. Without that line you can't debug a fallback that silently switched providers, and you can't audit which model touched which prompt. That's the first habit to build, before any routing rule gets fancier than "always use OpenAI."

There are two shapes of gateway, and they have meaningfully different trust profiles. **Self-hosted** gateways like LiteLLM Proxy run inside your own infrastructure as a FastAPI service plus a Postgres database for auth and spend tracking, and optionally Redis for sharing rate-limit state across replicas.[^1] No prompts ever leave your VPC. **Hosted** gateways like OpenRouter or Cloudflare AI Gateway run as a managed SaaS; they're zero-ops but every prompt flows through a third party.[^2] OpenRouter charges 5.5% on credit purchases and passes inference pricing through at cost; Cloudflare's core features are free, with a 5% fee only on Unified Billing.[^2][^3] Pick self-hosted when data residency is a hard requirement, or you have the ops bandwidth and want zero per-request markup. Pick hosted when you don't, which describes most teams.

## Cheap-then-expensive: try the small model first

The most useful routing rule the gateway gives you isn't failover. It's cost. Most application traffic is easy: short queries, simple summaries, classifications a small model handles fine. Sending all of it to a flagship is paying frontier prices for queries Haiku or Llama-3-8B would nail. The pattern is a cascade: try the cheap model first, escalate to the expensive one only when the cheap one fails.

In LiteLLM, that's two lines of config:

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "cheap",
            "litellm_params": {
                "model": "groq/llama3-8b-8192",
                "api_key": "GROQ_KEY",
            },
        },
        {
            "model_name": "expensive",
            "litellm_params": {
                "model": "openai/gpt-4o",
                "api_key": "OPENAI_KEY",
            },
        },
    ],
    routing_strategy="cost-based-routing",
    fallbacks=[{"cheap": ["expensive"]}],
    num_retries=2,
    cooldown_time=30,
)
```

`cost-based-routing` picks the cheapest healthy deployment by default. `fallbacks=[{"cheap": ["expensive"]}]` says: if the cheap model exhausts its retries or hits a non-retryable error, promote the request to the expensive model and run it again.[^1] Two important error classes get their own buckets. `context_window_fallbacks` triggers when the prompt is too long for the cheap model's context, and `content_policy_fallbacks` triggers when one provider's safety filter rejects content another would accept.[^4] Set `enable_pre_call_checks: true` and the router will skip the cheap model upfront when it can already see the prompt won't fit, saving the wasted round trip.

The cascade isn't free. When the cheap model misses, you pay the full latency of two model calls instead of one, and your worst-case latency budget has to cover the slow path. As a rough rule, the cascade pays off when the escalation rate stays under about 20% and the price gap between tiers is at least 5x. Above 20% escalation you're paying the cheap-model round trip on a majority of requests for nothing. Below a 5x price gap, the wins don't cover the latency tax. Either way, the only way to know is to measure on your own traffic, which is what [errors, retries, and fallbacks](./04-errors-retries-fallbacks.md) sets up the foundation for.

## Failover: three tiers, in order

Failover is the cascade's defensive cousin. The cascade asks "can a cheaper model do this." Failover asks "this provider is broken, who else can answer." A production gateway runs three tiers of failover, in order, and you should know all three because they fail differently.

![A vertical three-tier diagram showing how a gateway escalates a failing request: tier one retries the same deployment with backoff, tier two switches to a sibling deployment of the same model in a different region or provider, tier three promotes the request to a different model family entirely; each tier is annotated with the error classes that trigger it](images/06-failover-tiers.png)
*Three tiers, escalating in cost and risk: in-deployment retry, sibling failover, cross-model promotion. Most outages get caught at tier one or two; tier three changes the answer.*

**Tier one is in-deployment retry.** The cheap retry layer for transient failures: 429s, 5xx, network blips. LiteLLM defaults to `num_retries=3` with exponential backoff before it gives up on a deployment.[^1] Most provider hiccups never make it past this tier; the user never knows.

**Tier two is sibling failover.** Multiple deployments of the same model behind the same logical name. You declare them with `order: 1` and `order: 2` in `litellm_params`. The router exhausts every `order=1` deployment (with their own retries) before promoting to `order=2`.[^1] The classic shape is `gpt-4o` running on both OpenAI and Azure: same model, different infrastructure, independent failure modes. When OpenAI is down, Azure picks up. The output is the same model, so evals and audit trails stay intact.

```python
LITELLM_CONFIG = {
    "model_list": [
        {
            "model_name": "gpt-4o",
            "litellm_params": {
                "model": "openai/gpt-4o",
                "api_key": "OPENAI_KEY",
                "order": 1,           # primary
            },
        },
        {
            "model_name": "gpt-4o",
            "litellm_params": {
                "model": "azure/gpt-4o",
                "api_base": "https://my-azure.openai.azure.com/",
                "api_key": "AZURE_KEY",
                "order": 2,           # regional backup
            },
        },
        {
            "model_name": "gpt-4o-fallback",
            "litellm_params": {
                "model": "anthropic/claude-sonnet-4-5",
                "api_key": "ANTHROPIC_KEY",
            },
        },
    ],
    "router_settings": {
        "fallbacks": [{"gpt-4o": ["gpt-4o-fallback"]}],
        "cooldown_time": 5,
        "allowed_fails": 3,
    },
}
```

When a deployment fails more than `allowed_fails` times in a minute, LiteLLM cools it down for `cooldown_time` seconds (defaults: 3 fails, 5 seconds).[^1] In a multi-replica deployment, share that cooldown state through Redis; otherwise every replica independently rediscovers the dead provider, and you'll briefly hammer it with traffic from every instance at once.

**Tier three is cross-model fallback.** This is the dangerous one. The `fallbacks` block above promotes failed `gpt-4o` requests to Claude when every same-model option is exhausted. The user gets an answer, the gateway stays up, but the model identity changed mid-stream. Different models give different outputs; an eval suite that assumes `gpt-4o` outputs is now scoring Claude. An audit log that says "gpt-4o answered" is wrong. This is why logging `response.model` is non-negotiable. For paths where model identity matters for compliance or evals, omit cross-model fallbacks entirely and let the request fail loudly. Best-effort paths can keep tier three; reproducibility paths cannot.

## When a gateway earns its complexity

A gateway is real infrastructure. Self-hosted LiteLLM means a FastAPI service plus PostgreSQL plus optional Redis, all of which need deploying, scaling, monitoring, and upgrading every time a provider ships a breaking change. Hosted gateways skip the ops but add a third party to your prompt path and a per-request markup. Both options are a tax. The question is whether the tax is worth it.

The honest rule is this: a gateway earns its keep when at least two of the following are true.[^5]

- **You call more than one provider.** One provider is a wrapper. Two is a divergence problem; each new provider doubles the surface area of bespoke retry, key, and schema code.
- **A provider outage hurts the business.** If you'd page someone at 3am because OpenAI is down, you need failover. Bespoke failover code drifts; gateway failover is configuration.
- **You can't answer "what did that cost per customer" in 30 seconds.** Per-request cost attribution is something every gateway does for free, and almost no team builds well by hand.

Skip the gateway entirely if you call exactly one provider, you're prototyping, or you have data residency rules that no third-party gateway satisfies. The "infrastructure you don't need is a tax" rule applies hard at this stage.[^5]

The latency math is reassuring. LiteLLM's published benchmark on four 4-CPU instances at 1170 RPS shows median proxy overhead of 2 ms, p95 at 8 ms, p99 at 13 ms.[^6] Portkey's documented latency addition is 20-40 ms.[^7] Compared with the hundreds of milliseconds to multi-second tail of provider API calls, the gateway is in the noise. The thing that hurts performance isn't the gateway; it's choosing the wrong routing strategy. LiteLLM's docs explicitly mark `usage-based-routing` as "bad for perf" because it adds Redis round-trips on every request.[^1] Use `simple-shuffle` or `latency-based-routing` for the hot path; reserve usage-based routing for the rare case where RPM/TPM fairness is contractually required.

> [!WARNING]
> **Silent model substitution is the gateway failure mode that breaks evals.** A request that should have gone to `gpt-4o` gets answered by Claude because the fallback chain fired. The eval set sees a mix of model outputs and your scores drift for reasons no one can trace. Always log the served model from `response.model` (OpenRouter) or the `x-litellm-model-id` header (LiteLLM), and alert when it doesn't match what was requested. For paths where the model identity is part of the contract, like regulated audits or model-locked evals, disable cross-model fallback on that path even if it means returning errors during outages.

The first gateway you adopt should match how you already work. If you're on Cloudflare, AI Gateway is free at the core tier and one DNS hop from your existing edge.[^3] If you want broad provider coverage and full control, LiteLLM Proxy has the deepest provider list (100+) and the strongest open-source community.[^1] If you need SOC 2, ISO 27001, SSO, and audit logs without running it yourself, Portkey or OpenRouter cover that ground.[^2][^7] You don't have to pick perfectly; the whole point of the pattern is that swapping gateways is a config change, not a rewrite. The mistake to avoid isn't picking the wrong gateway. It's writing your own retry-fallback-key-rotation-cost-tracking layer, calling it "thin," and watching it grow into a worse version of one of these tools two quarters later.

## References

[^1]: BerriAI, "LiteLLM Proxy: Load Balancing and Routing", docs.litellm.ai, https://docs.litellm.ai/docs/routing (fetched June 2026)
[^2]: OpenRouter, "Frequently Asked Questions", openrouter.ai, https://openrouter.ai/docs/faq (fetched June 2026)
[^3]: Cloudflare, "AI Gateway Pricing", developers.cloudflare.com, https://developers.cloudflare.com/ai-gateway/reference/pricing/ (last updated May 19, 2026)
[^4]: BerriAI, "LiteLLM Fallbacks", docs.litellm.ai, https://docs.litellm.ai/docs/proxy/reliability (fetched June 2026)
[^5]: LLM Gateway, "LLM Gateway vs Direct API: When the Provider SDK Stops Scaling", llmgateway.io, https://llmgateway.io/blog/llm-gateway-vs-direct-api (April 2026)
[^6]: BerriAI, "LiteLLM Benchmarks", docs.litellm.ai, https://docs.litellm.ai/docs/benchmarks (fetched June 2026)
[^7]: Portkey AI, "What is Portkey?", portkey.ai, https://portkey.ai/docs/introduction/what-is-portkey (last modified January 28, 2026)


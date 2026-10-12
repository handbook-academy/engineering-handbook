---
title: "Guardrails"
description: "Input filters, output validators, content moderation models, and the streaming-versus-validation problem nobody warns you about."
slug: 02-guardrails
part: 9
chapter: 2
difficulty: intermediate
prerequisites:
  - 00-prompt-injection
  - 01-agent-security-and-the-lethal-trifecta
  - part-2-working-with-model-apis/01-streaming
tags: [llm, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Guardrails

Anthropic ran a public red-team exercise in February 2025: 339 jailbreakers, around 3,700 hours of effort, 800,000 chat interactions over seven days, all aimed at one Claude 3.5 Sonnet deployment guarded by their Constitutional Classifiers. Without the classifiers, 86% of synthetic advanced jailbreaks succeeded against the same model. With them, jailbreak success fell to 4.4%. Production over-refusal climbed by 0.38%, which wasn't statistically significant. The compute tax was 23.7%.[^1]

That's what guardrails are for, and that's roughly the shape of what they buy you: most attacks blocked, most of the time, at a meaningful but tolerable cost. They are not a fix for prompt injection. They are application-layer filters that sit outside the model's weights and refuse the easy attacks before they hit anything important.

## Three placements, one architecture

A guardrail is deterministic code (a regex, a schema validator) or a separate classifier (a moderation API, a guard model) applied at one of three points in your request pipeline.

- **Input rail.** Runs on the raw user message before any generation. Blocks or rewrites, returns an error to the client.
- **Output rail.** Runs on the model's response before the user sees it. Same pass/block/rewrite menu, but with a much harder timing problem (more on that below).
- **Tool-call guard.** Runs on tool arguments before they hit external systems. Cheapest place to enforce business policy: "this account can't send wire transfers over $10K", "this support agent can't issue refunds without a ticket ID."

![A horizontal flow diagram showing user message entering an input rail box on the left, then flowing into a central LLM cylinder, then through an output rail box, then to the user on the right; the LLM also has a downward arrow into a tool guard box that connects to an external API icon, with the input and output rails highlighted in indigo and the tool guard highlighted in coral as the most leveraged check](images/02-guard-placement.png)
*Three places guards live. The tool-call guard is the highest-leverage one in agentic systems, because it's where business policy actually binds.*

The minimum viable stack on most chat applications is one input rail and one output rail using a moderation API. Here it is end to end:

```python
from openai import OpenAI

def check_and_complete(user_input: str) -> str | None:
    client = OpenAI()

    mod = client.moderations.create(
        model="omni-moderation-latest",
        input=user_input,
    )
    if mod.results[0].flagged:
        return None

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_input}],
    )
    output = resp.choices[0].message.content

    out_mod = client.moderations.create(
        model="omni-moderation-latest",
        input=output,
    )
    if out_mod.results[0].flagged:
        return None
    return output
```

OpenAI's `omni-moderation-latest` is free at every usage tier, supports text and images, and covers 13 categories: harassment, hate, illicit, self-harm, sexual, violence, plus thresholded and minor variants of each.[^2] Returning `None` from both rails on failure means the caller shows one generic refusal without leaking which guard fired, which matters because attackers tune payloads against specific guards.

## Pick the right model for the position

There are three serious choices for the moderation classifier itself, and they map cleanly onto three deployment realities.

**OpenAI Moderation (`omni-moderation-latest`).** The default for anything that already calls OpenAI. Free, 13 categories, multimodal. The September 2024 upgrade improved multilingual performance by roughly 42% over the previous text-moderation model on OpenAI's internal eval, with the largest gains in low-resource languages: 6.4x on Telugu, 5.6x on Bengali, 4.6x on Marathi.[^3] If you're shipping in English on a moderate-budget product, this is what you reach for first.

**Llama Guard 3-8B.** The standard open-source option. Llama-3.1-8B fine-tuned on the MLCommons taxonomy plus a 14th category for code interpreter abuse. Reaches F1=0.939 on Meta's internal English response-classification test, against GPT-4 at F1=0.805 on the same eval (July 2024).[^4] Multilingual F1 ranges from 0.834 (Thai) to 0.943 (French) across eight supported languages. There's a 1B INT4 variant that runs on commodity Android hardware at 30+ tokens/sec.[^5] Use Llama Guard when you need on-prem deployment for data residency, when you want the MLCommons taxonomy specifically, or when high volume makes the moderation API call cost matter.

**Azure AI Content Safety.** Reach for it inside the Azure ecosystem. Severity levels (safe, low, medium, high) per category give you graduated responses out of the box; Prompt Shields adds explicit jailbreak detection; the Groundedness Detection preview catches one class of hallucination. The S0 tier supports 1,000 requests per 10 seconds with a 10,000-character input limit per call (as of January 2026).[^6]

There's no published three-way head-to-head benchmark, so don't over-index on a single F1 number. What matters is that all three reach roughly the same neighborhood (F1 in the 0.85 to 0.94 range on standard test sets) and they all break in roughly the same places.

## What slips through

The honest answer is: more than the marketing suggests. Five well-documented evasion classes show up against every commercial guard.

The most embarrassing is **character injection**. The Mindgard / Lancaster University study (April 2025) measured 100% attack success rate for emoji smuggling against Azure Prompt Shield, Meta Prompt Guard, and NeMo Guard Jailbreak Detect. Bidirectional text scored 99.23% ASR; zero-width characters, homoglyphs, diacritics, and full-width text each landed somewhere between 44% and 76% ASR.[^7] The mechanism is simple: the LLM's tokenizer was trained on web-scale text and decodes these encodings as plain English. The guard classifier, often a smaller BERT-class model, was not trained on the same distribution. So the guard sees garbage, the model sees an instruction, and you have a bypass. The mitigation is a Unicode NFKC normalization pass plus zero-width stripping before the guard runs. ProtectAI's v2 model also reduced character-injection ASR from 77.3% to 20.26% by training specifically on these encodings.[^7]

The other four are similar in spirit: low-resource language attacks (especially languages outside the eight Llama Guard supports), semantic paraphrasing through synonym substitution (TextFooler and similar tools land 35-65% ASR on guard models), cross-chunk attacks in streaming (more on those next), and gradient-optimized adversarial suffixes. None of these have known general fixes; all of them argue for a defense-in-depth posture rather than a single guard model treated as a wall.

There are also categories where guard models are inherently weak. Llama Guard 3 explicitly flags S5 (defamation), S8 (intellectual property), and S13 (elections) as needing "more complex systems" because they require current factual world knowledge to evaluate.[^4] Context-dependent harm (medical drug-dose questions from clinicians, security research, fiction containing violence) produces elevated false positives on every guard that operates on surface features alone.

## Streaming versus validation: the unsay problem

Here's the tension nobody warns you about until you ship. Streaming sends tokens to the client as they're generated, so the user sees the response building in real time. A standard content classifier needs the *full* response to make a decision. Those two requirements directly conflict.

You have three architectural choices, and the right one depends on how bad it is for harmful content to be visible even briefly.

**Buffer-then-check.** Hold every token until generation finishes, run the guard, then release or block. The user sees nothing until the guard passes. This eliminates streaming's first-token-latency advantage entirely, which on a 2-second response means a roughly 2-second wait for the first character. It's the right call for medical, legal, or CBRN-adjacent applications where leakage of harmful surface content is the dominant risk.

**Stream-first with async rollback.** Send tokens immediately, run the guard in parallel, and if it trips, inject a retraction message into the stream. This is the option NVIDIA's NeMo Guardrails ships under `stream_first: true`. Their own documentation states the consequence plainly: "objectionable text might have already been sent to the user. It's the responsibility of the caller to manage this situation."[^8] Tokens already on screen cannot be unseen. Some users will have already read or copied them.

**Chunk-based progressive validation.** Buffer tokens into fixed-size chunks (NeMo's default is 200 tokens, with a 50-token sliding context window across chunk boundaries), validate each chunk, yield it if safe, and stop the stream if not.[^8] This is the practical default for conversational applications where latency matters and content risk is moderate. The limit: a harmful instruction split deliberately across the boundary ("mix compound A" in chunk N, "with compound B to make X" in chunk N+1) can slip past the context window if the attacker is careful. Smaller chunks (64 to 128 tokens) shrink the exposure window for stream-first deployments at the cost of more guard inference calls.

A harder option is emerging: **forecasting guards** that predict whether *future* tokens are likely to be unsafe based on the prefix already generated, rather than waiting for harmful tokens to actually appear. The StreamGuard work from SB Intuitions (April 2026) reports 92.6% on-time intervention (blocking before or as the unsafe sentence ends) at F1=97.5 with 4.9% miss rate, at 9.5 ms decision latency on an H100.[^9] That latency is just below per-token generation latency for an 8B model, which means the guard keeps pace with generation without becoming the bottleneck.

```python
def stream_with_chunk_guard(user_input: str, chunk_size: int = 200):
    buffer: list[str] = []
    token_count = 0

    for delta in generate_stream(user_input):
        buffer.append(delta)
        token_count += 1

        if token_count >= chunk_size:
            text_chunk = "".join(buffer)
            if guard_check(text_chunk) == "unsafe":
                yield None
                return
            yield text_chunk
            buffer = []
            token_count = 0

    if buffer:
        text_chunk = "".join(buffer)
        if guard_check(text_chunk) != "unsafe":
            yield text_chunk
        else:
            yield None
```

The caller handles `None` by clearing the rendered chunk and showing an error. That's the rollback contract.

## The latency budget is real

A useful rule of thumb: budget 10% of your end-to-end response time for safety-related work. On a 2-second p95 chat experience that's about 200 ms. A naive serialized stack of content moderation (10-50 ms), PII detection (20-80 ms), schema validation, and a toxicity classifier can hit 200 to 400 ms by itself.[^10] An LLM-as-validator call (using a separate model to score the response) adds 200-800 ms per turn. Chain a few of those across an agent's many internal LLM calls and you've doubled user-perceived latency before generation even starts.

The fixes are the obvious ones: run independent guards in parallel, put fast pre-filters (regex blocklists, small encoder classifiers) ahead of expensive guard models so they short-circuit cheap rejections, and only guard LLM calls that touch untrusted input. Internal orchestration calls between trusted-data services don't need a content moderation pass. They get one anyway in most teams' first pipeline.

## Tool-call guards are the highest-leverage layer

Content moderation gets the airtime, but in agentic systems the most valuable guard is on tool arguments, not on text. Validating that a `send_email` call's recipient is on an allowlist, that a `delete_file` path is inside the workspace, that a refund amount is below a per-tier cap, that an SQL query has no unparameterized user input, all of these are deterministic checks against business policy, and all of them block far more damage per millisecond than any text classifier.

This is the layer where your egress allowlist from [the lethal trifecta](./01-agent-security-and-the-lethal-trifecta.md) actually lives. It's also where the bulk of your auditable policy lives. A content classifier that says "this message looks unsafe" is probabilistic. A tool guard that says "this account doesn't have refund authority above $500" is a deterministic rule, easy to test, easy to log, easy to defend in compliance review.

## What to actually deploy

For a typical chat product on day one: an OpenAI Moderation input rail, an OpenAI Moderation output rail, Unicode normalization on inputs before the rail, and tool-call validation on every external action. That's the floor. It blocks the easy attacks and costs almost nothing.

When you outgrow that, the order of escalations is: add a stronger guard model (Llama Guard 3 or Azure Content Safety with severity tuning) before adding more layers; add chunk-based streaming validation when latency complaints get serious; tune thresholds against your own production traffic distribution rather than the vendor's eval set; treat the `flagged` boolean as a debug signal and route policy decisions through `category_scores` so you can recalibrate when models update without a deploy.

What you don't deploy is a serialized stack of five guards each adding 100 ms because every vendor's blog post sells one. The Constitutional Classifiers result, 95% jailbreak block rate at 0.38% over-refusal increase, came from one well-trained pair of input and output classifiers, not from a stack of seven.[^1] Concentration of effort on the right two layers beats sprinkling weak ones across the pipeline.

The next chapter, [Abuse prevention](./03-abuse-prevention.md), covers the infrastructure layer that keeps an attacker from running a million guard-bypassing attempts in a row.

## References

[^1]: Anthropic Safeguards Research Team, "Constitutional Classifiers: Defending against universal jailbreaks," Anthropic Research, 3 February 2025, https://www.anthropic.com/research/constitutional-classifiers; Sharma et al., arXiv:2501.18837, https://arxiv.org/abs/2501.18837

[^2]: OpenAI, "Moderation," OpenAI API Documentation, accessed June 2026, https://platform.openai.com/docs/guides/moderation

[^3]: OpenAI, "Upgrading the Moderation API with our new multimodal moderation model," 26 September 2024, https://openai.com/index/upgrading-the-moderation-api-with-our-new-multimodal-moderation-model

[^4]: Meta AI, "Llama Guard 3-8B Model Card," GitHub/PurpleLlama, July 2024, https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard3/8B/MODEL_CARD.md

[^5]: SB Intuitions, "Compact and Efficient Safeguard for Human-AI Conversations," arXiv:2411.17713, November 2024, https://arxiv.org/html/2411.17713v1

[^6]: Microsoft, "What is Azure AI Content Safety?", Microsoft Learn, last updated January 2026, https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview

[^7]: William Hackett et al., "Bypassing Prompt Injection and Jailbreak Detection in LLM Guardrails," arXiv:2504.11168, April 2025, https://arxiv.org/html/2504.11168v2

[^8]: Aditi Bodhankar, "Stream Smarter and Safer: How NVIDIA NeMo Guardrails Enhance LLM Output Streaming," NVIDIA Developer Blog, 23 May 2025, https://developer.nvidia.com/blog/?p=100628

[^9]: Pride Kavumba et al., "Predict, Don't React: Value-Based Safety Forecasting for LLM Streaming (StreamGuard)," arXiv:2604.03962, April 2026, https://arxiv.org/html/2604.03962

[^10]: Tianpan, "Designing AI Safety Layers That Don't Kill Your Latency," April 2026, https://tianpan.co/blog/2026-04-16-safety-layer-latency-guardrails-design

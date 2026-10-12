---
title: "AI UX"
description: "Streaming as a trust signal, not a transport detail. The three failure modes (blank screen, mid-stream stall, unverifiable claim) and what to build for each."
slug: 00-ai-ux
part: 11
chapter: 0
difficulty: intermediate
prerequisites:
  - part-2-working-with-model-apis/01-streaming
  - part-2-working-with-model-apis/00-calling-models
  - part-6-retrieval-augmented-generation/05-citations-and-grounding
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# AI UX

Three things break trust in an AI product, and they're not the things you'd guess from looking at an API dashboard. The screen sits blank for three seconds before the first token. The cursor freezes mid-answer for two seconds while the user assumes the system crashed. The model states a fact confidently and the user has no way to check it. Each one has a different cause and a different fix. None of them shows up as an error in your logs.

This chapter is the UX layer above streaming, uncertainty, and citations. The mechanics of Server-Sent Events, the lifecycle of a streaming request, the API shape for citations all live in [Streaming](../part-2-working-with-model-apis/01-streaming.md) and [Citations and grounding](../part-6-retrieval-augmented-generation/05-citations-and-grounding.md). Here we ask the question those chapters don't: once the bytes are flowing, what does a user actually need to see, and why?

## Streaming is a trust signal, not a transport detail

A streamed response feels about 40% faster than a buffered response with identical total latency.[^1] The effect comes almost entirely from time-to-first-token. A first character at 300ms tells the user the system is alive, working, and theirs; a blank screen for the same 300ms tells them nothing. Once tokens are appearing, they're already reading. That's the whole win.

The number that follows is uncomfortable for most teams: a typical English reader consumes about 4.8 tokens per second.[^2] A modern frontier API streams at 80 to 100 tokens per second, and Groq-class hardware reaches 480-525.[^3] Once the first token has rendered, every later token arrives faster than the user can read. Generating tokens at 10x reading speed adds zero UX value. What matters from token two onward is that arrival stays steady. Stutter is the killer, not throughput.

This breaks the dashboard most teams build. Mean time-per-output-token (TPOT) is a scalar that averages a stream into one number. A clean stream and a stream with a 2-second freeze in the middle can produce identical TPOT. The user calls one of them broken; the dashboard calls both green. The right metric is per-stream inter-token latency as a histogram, alerted on the P99 of the worst gap inside each stream, not the mean across streams.[^4]

![A horizontal time axis with four parallel timelines. Each shows an ideal token-delivery line as a smooth diagonal and an actual delivery line that diverges in a different way: case A matches ideal exactly, case B starts late then runs parallel, case C runs at half the slope throughout, case D matches ideal then flatlines for two seconds before resuming](images/00-streaming-failure-modes.png)
*Four streams that all "feel slow" to users but require four different fixes; the middle pause in case D is the failure your TPOT dashboard cannot see.*

Three numbers anchor the SLO conversation. Interactive chat: TTFT under 500ms at P95. IDE completion: under 100ms at P95. Long-form generation: up to 3 seconds is forgivable if the stream that follows stays smooth.[^1] These are user-perception thresholds, not infrastructure aspirations.

A failure mode worth naming because it shows up everywhere: streams that don't actually stream. NGINX `proxy_buffering on` is the default and it accumulates tokens on the proxy until either the buffer fills or the response completes, then flushes them in one burst. The bytes are streaming end-to-end on your servers; the user sees a blank screen and then the entire response arrives at once. The fix is `proxy_buffering off`, `gzip off`, `proxy_read_timeout 86400s`, and the response header `X-Accel-Buffering: no`. Heartbeat events every 15-30 seconds prevent proxy timeouts during long generation. CDN paths usually need an explicit streaming passthrough rule.[^1]

## When fake streaming is the right answer

The catch with real streaming is that you're emitting tokens before you can validate the complete output. If the response has to pass schema validation, content moderation, or a safety check before display, real streaming forces a hard choice: ship unvalidated content and roll it back if validation fails, or buffer the full response and animate it character by character on the client. The second pattern is fake streaming, and for short responses it's almost always the right call.

The decision rule is simple. If the validated output will land in under 1-2 seconds, fake-stream it. The user sees a typing animation that feels exactly like real streaming, and you've already validated the full text before the first character renders. Above 2 seconds, the buffered wait becomes its own UX problem and you need the real stream plus a rollback path on validation failure.

The other case where the streaming pattern breaks entirely is reasoning models. Claude Opus 4.7 with extended thinking has a P50 TTFT of 28 seconds and a P95 of 67 seconds.[^3] A typing cursor sitting blank for 67 seconds reads as a crash. The pattern that's emerging, with no industry consensus yet as of mid-2026, is to swap the cursor for a structured status indicator ("thinking, this may take up to a minute") and, when the API exposes them, surface reasoning tokens in a collapsible panel so the wait feels productive. The Claude.ai client is the closest thing to a reference implementation.

## Communicating uncertainty without destroying trust

Models produce confidently-stated outputs whose probability of correctness can't be read from the surface of the text. That's a structural fact, not a bug. The product question is what the UI should show.

The instinct most teams reach for first is a numeric confidence score. A November 2024 study at NUS (N=252) found that miscalibrated confidence is worse than no confidence at all.[^5] Overconfident AI causes misuse: users follow wrong advice they would have caught on their own. Underconfident AI causes disuse: users reject correct advice. Only 26-29% of users could detect miscalibration on their own, and disclosure of the miscalibration ("this system tends to be overconfident") reduced misuse but increased disuse, leaving overall task accuracy unchanged. The headline: don't display a numeric confidence score unless you have a pipeline that produces calibrated estimates. Most teams don't.

Self-reported confidence is the weakest signal of all. As of June 2026, models assigned up to 26% higher confidence to their own responses than to others' across six open-weight LLMs and three benchmarks.[^6] Asking a model "how confident are you in that answer" returns a number, and the number doesn't predict correctness. It tells you about the model, not about its output.

What does work, surprisingly well, is verbalized hedging in the model's own words. The 2024 FAccT paper from Kim et al. (N=404, pre-registered) found that first-person hedges ("I'm not sure, but...") significantly reduced participants' tendency to agree with incorrect AI answers and lifted task accuracy. Third-person hedges ("It's not clear, but...") trended in the same direction but didn't reach significance.[^7] Precise wording matters: the same uncertainty content delivered in a different voice doesn't land the same way.

The other intervention with empirical backing is per-claim visual factuality markup. The IBM Research study (N=208, 2025) compared six display designs and found that phrase-level highlight-all coloring was the most preferred, the most trusted, and the easiest to validate.[^8] The catch the authors flag explicitly: this only helps if your factuality scorer is reliable. A green badge on wrong text is worse than no badge, because users now anchor on the badge instead of their own judgment.

The default that earns its keep without exotic infrastructure: bake first-person hedges into the prompt and reserve numeric confidence and color markup for cases where you can prove the underlying signal is calibrated. Hedging costs nothing and helps; markup is a real engineering investment that backfires if rushed.

## Citations are a navigation affordance, not a trust badge

Citation hallucination is no longer a theoretical concern. Roughly one in 277 peer-reviewed papers in 2025 contained at least one fabricated AI-generated reference, up from one in 2,828 in 2023.[^9] Stanford researchers documented hallucination rates above 17% on leading AI legal-research tools.[^10] The stakes for unverifiable AI claims have moved from "users might be misled" to "users have already acted on lies the model invented."

Citations fix the verification problem at the UX layer. Inline references that link a claim to the exact passage that supports it convert the user's relationship with the output from "I have to trust this" to "I can check this in two seconds." Perplexity built its product identity on this affordance: it visits about 10 pages per query and surfaces 3-4 cited sources per response, each clickable, each opening the original.[^11] The design principle is that citations are a navigation affordance, not a quality stamp. The user's job is to spot-check; your job is to make spot-checking trivial.

The mechanism matters because not all citations are equal. Prompt-based citation, where you ask the model to insert `[source 3]` markers as it writes, can produce fabricated pointers: a plausible-looking character range that points to nothing. The model is generating the pointer the same way it generates everything else, which means the same hallucination mechanism applies. The Anthropic Citations API closes that loophole at the API level. The model generates claims with annotations; the API extracts the cited text from the actual document at the indices the model returned. The model cannot fabricate a citation that points to text the document doesn't contain.[^12]

```python
import anthropic

def query_with_citations(doc_text: str, question: str) -> list[dict]:
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {"type": "text", "media_type": "text/plain", "data": doc_text},
                    "citations": {"enabled": True},
                },
                {"type": "text", "text": question},
            ],
        }],
    )
    results = []
    for block in response.content:
        if block.type == "text" and getattr(block, "citations", None):
            for c in block.citations:
                results.append({
                    "claim": block.text,
                    "cited_text": c.cited_text,
                    "start": c.start_char_index,
                    "end": c.end_char_index,
                })
    return results
```

Two things about this API are worth knowing for product decisions. The `cited_text` field doesn't count toward output tokens, so adding citations is structurally cost-neutral relative to plain prose generation. And as of June 2026, the Citations API is incompatible with structured outputs in the same call: you have to pick one. For RAG pipelines using providers without an equivalent feature, the production-ready alternative is two-pass generation (write the answer, then ask the model to annotate it with source pointers) followed by NLI-based verification that each citation actually entails the claim it supports.[^13] You pay roughly one extra LLM call per response in exchange for a guarantee the model can't fabricate a pointer.

## What this means for the surface you're building

The three failures that opened this chapter map cleanly to three product decisions. For the blank screen: stream by default, fake-stream when validation forces it, and replace the cursor with a structured status indicator for any model whose TTFT exceeds five seconds. For the mid-stream stall: instrument inter-token latency as a per-stream histogram, alert on intra-stream P99 gaps rather than aggregate TPOT, and configure the proxy stack to actually pass tokens through. For the unverifiable claim: bake first-person hedges into the system prompt for all uncertainty-prone responses, use API-level citations when grounding documents are available, and skip numeric confidence scores until you can prove the calibration. Each one is independent. Each one fails its own way. The product that gets all three right is the one users come back to.

## References

[^1]: Tian Pan, "Streaming AI Applications in Production: What Nobody Warns You About", April 2026. https://tianpan.co/blog/2025-11-07-streaming-ai-applications-production

[^2]: Liu, Jiachen et al., "Andes: Defining and Enhancing Quality-of-Experience in LLM-Based Text Streaming Services", arXiv:2404.16283v2, December 2024. https://arxiv.org/html/2404.16283v2

[^3]: Digital Applied, "AI Model Latency Benchmarks 2026: TTFT and Throughput", April 2026 (10,000 probes per provider pairing). https://www.digitalapplied.com/blog/ai-model-latency-benchmarks-2026-ttft-throughput

[^4]: Tian Pan, "Inter-Token Jitter: The Streaming UX Failure Your p95 Dashboards Can't See", April 27, 2026. https://tianpan.co/blog/2026-04-27-inter-token-jitter-streaming-ux-blind-spot

[^5]: Li, Jingshu et al., "Overconfident and Unconfident AI Hinder Human-AI Collaboration", National University of Singapore, arXiv:2402.07632v2, 2024. https://arxiv.org/html/2402.07632v2

[^6]: Xiong et al., "Large Language Models Are Overconfident in Their Own Responses", arXiv:2606.03437, June 2026. https://huggingface.co/papers/2606.03437

[^7]: Kim, Sunnie S. Y. et al., "I'm Not Sure, But...: Examining the Impact of Large Language Models' Uncertainty Expression on User Reliance and Trust", FAccT 2024, arXiv:2405.00623. https://arxiv.org/abs/2405.00623

[^8]: Do, Hyo Jin et al. (IBM Research), "Highlight All the Phrases: Enhancing LLM Transparency through Visual Factuality Indicators", arXiv:2508.06846, 2025. https://arxiv.org/html/2508.06846

[^9]: Columbia University School of Nursing news, "AI Blamed For Rise In Fabricated Citations Found In Recent Research Papers", May 2026. https://www.nursing.columbia.edu/news/ai-blamed-rise-fabricated-citations-found-recent-research-papers

[^10]: Forbes Business Council, "What Business Leaders Need To Know When AI Fabricates Legal Citations", May 2026. https://www.forbes.com/councils/forbesbusinesscouncil/2026/05/27/what-business-leaders-need-to-know-when-ai-fabricates-legal-citations/

[^11]: Stackmatix, "The Multi-Source Citation Strategy for AI Search", 2025 (Perplexity citation behavior as of 2024). https://www.stackmatix.com/blog/perplexity-optimization-multi-source-citation

[^12]: Anthropic, "Citations", API Documentation, June 2026. https://docs.anthropic.com/en/docs/build-with-claude/citations

[^13]: Medium / Data Science Collective, "Anthropic-Style Citations with Any LLM", March 2025. https://medium.com/data-science-collective/anthropic-style-citations-with-any-llm-2c061671ddd5

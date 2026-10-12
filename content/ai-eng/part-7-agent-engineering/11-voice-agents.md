---
title: "Voice agents"
description: "The 800ms budget that defines voice agents, the cascaded vs native trade-off, and why barge-in is the hardest correctness problem in the stack."
slug: 11-voice-agents
part: 7
chapter: 11
difficulty: intermediate
prerequisites:
  - part-2-working-with-model-apis/01-streaming
  - 02-the-agent-loop
  - 03-tool-design
tags: [llm, agents]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Voice agents

Across every language conversation analysts have studied, the median gap between one person finishing a sentence and the next person starting is about 200 milliseconds. Push it past 500 and the listener reads it as thinking. Push it past 800 and they read the speaker as broken or robotic.[^1] That number is the entire reason voice agents are hard. You have under 800 milliseconds, end to end, to detect the user stopped talking, transcribe what they said, run an LLM, synthesize speech, and start playing audio back. Miss it and the call feels wrong in a way users can't articulate but won't tolerate.

Everything in this chapter, the architecture choice, the endpointing trick, the interruption protocol, the transport, traces back to fitting inside that budget.

## Where the 800 milliseconds go

Voice-to-first-audio splits across roughly six stages. Here are the production numbers as of 2025-2026, p50 and p95.[^2]

| Stage | What's happening | p50 | p95 |
|---|---|---|---|
| End-of-turn detection | Deciding the user is done | 200-300 ms | 400 ms |
| Final ASR transcript | STT settles on the last words | 50-150 ms | 250 ms |
| LLM time-to-first-token | Prompt assembled, model starts | 200-400 ms | 700 ms |
| TTS first chunk | First token to audible audio | 100-200 ms | 350 ms |
| Network jitter | WebRTC or PSTN transport | 30-80 ms | 150 ms |
| **Total** | | **~600-850 ms** | **~1,450 ms** |

That total only fits if every stage streams and the stages overlap. The TTS doesn't wait for the LLM to finish; it starts synthesizing the first sentence while later tokens are still being decoded. The audio player doesn't wait for the full TTS output; it plays chunks as they arrive. A pipeline where each stage blocks the next blows the budget by two or three times before the user has said a word. This isn't an optimization. It's the architecture.

![A horizontal bar chart with two stacked bars. The top bar is labeled "Streaming, overlapping" at about 800 milliseconds, divided into five colored segments labeled End-of-turn, ASR, LLM TTFT, TTS first, Network. The bottom bar is labeled "Sequential, blocking" at about 2500 milliseconds with the same five segments laid end to end without overlap. A coral arrow points at the gap between the two totals.](images/11-latency-budget.png)
*The same five stages, two architectures. Streaming and overlapping fits in 800 ms; sequential blocking misses by 3x.*

## Two architectures, one trade-off

There are two ways to build the pipeline above. Each gives up something the other keeps.

The **cascaded pipeline** chains discrete services. Voice activity detection (VAD) decides when the user stops talking, a streaming speech-to-text (STT) model transcribes, an LLM generates text, a streaming text-to-speech (TTS) model synthesizes audio, the audio plays back. Frameworks like Pipecat (Daily, May 2024) and LiveKit Agents are the production-standard implementations.[^3] Each stage is a separate process you can swap, log, and test in isolation. You can read the full transcript at the STT-to-LLM boundary, run a guardrail there, inject [retrieval](../part-6-retrieval-augmented-generation/00-when-you-actually-need-rag.md), enforce a compliance rule, all in plain text.

The **native speech-to-speech (S2S)** path sends raw audio into a single multimodal model that emits raw audio back. OpenAI's `gpt-realtime-2` (GA 2025) is the production reference.[^4] No intermediate text exists. The model can use acoustic cues (tone, hesitation, emotion) that disappear the moment audio becomes a transcript. Two serialization hops, STT output and TTS input, are gone, which is where the latency floor improves.

The trade-off is direct. Cascaded gives you observability and control; native gives you the lower latency floor and acoustic awareness. Most production deployments in healthcare, finance, and customer support pick cascaded because their compliance teams need text logs of every turn and their RAG layer has to live between STT and LLM. Teams shipping consumer voice apps where latency is the whole product pick native.[^5]

```text
Cascaded:    [VAD] -> [STT] -> [text boundary] -> [LLM] -> [TTS]
                                    ^
                                    log here, retrieve here, guardrail here

Native S2S:  audio -----> [multimodal model] -----> audio
                              (no text boundary)
```

Default: start cascaded. Escalate to native only when latency is the binding constraint and you can live without intermediate text. A well-tuned cascaded pipeline with co-located services and sub-100 ms STT partials gets close enough to native for most workloads to never notice the difference.[^6]

## Endpointing: the cutting-off vs dead-air problem

End-of-turn detection (endpointing) is the highest-leverage knob in the whole pipeline. Set it wrong and you've already spent half your latency budget before the model sees a token, or you've cut the user off mid-sentence reading their credit card number.

Three approaches dominate.

- **Silence-based VAD.** Fires when audio energy stays below a threshold for some duration, default 500 ms. Fast and cheap, but it cuts users off the moment they pause to think. In OpenAI's Realtime API this is `turn_detection.type = "server_vad"` with knobs for `threshold`, `prefix_padding_ms`, and `silence_duration_ms`.[^7]
- **Semantic endpointing.** A small classifier scores the audio or transcript for the probability the turn is actually complete. OpenAI exposes this as `type: "semantic_vad"` with an `eagerness` knob (`low`, `medium`, `high`). Low eagerness lets users finish complex thoughts; high chunks aggressively. AssemblyAI's Universal-Streaming uses a hybrid: an end-of-turn token predicted during transcription, with a confidence threshold (default 0.7), a 160 ms minimum silence when confident, and a 2,400 ms fallback for edge cases.[^8]
- **Text-only semantic models.** LiveKit open-sourced `livekit/turn-detector`, a Qwen2.5-0.5B distilled to INT8 ONNX, classifying the last 6 turns of transcribed text for end-of-utterance probability. Fourteen languages, true positive rates above 99% on the top ones, runs CPU-only under 500 MB.[^9]

The mistake almost everyone makes first is leaving silence-based VAD on for entity capture. The user starts reading a 16-digit card number, pauses naturally between groups, and the agent fires after the first four digits. Switching to semantic endpointing on those flows cut LiveKit's failures on structured data by 39.23% relative.[^9] Don't apply it everywhere though. For fast Q&A, semantic endpointing's caution feels sluggish; silence-based with a short threshold wins.

The right rule is per-flow: semantic endpointing with low eagerness during entity capture and patient-listening segments; silence-based or high-eagerness semantic for snappy back-and-forth.

## Barge-in: truncate to what the user actually heard

This is the part that has no analogue in text agents and bites every team that ships a voice product. The agent is mid-response. The user starts speaking. Three things must happen, atomically, in the right order:

1. Stop TTS playback immediately.
2. Cancel the in-flight LLM generation.
3. **Truncate the conversation history to what the user actually heard, not what got generated.**

The third one is the trap. If the agent said "Your balance is $500 and your next payment is due on the 15th" and the user interrupted at "and your next", the model's next turn must see the assistant message ending at "and your next" and nothing after. Leave the full message in history and the next response will reference a payment date the user never heard, which surfaces as the user saying "what? you said something about a date?" and the agent saying something incoherent in reply.

OpenAI's Realtime API handles this differently depending on transport. With WebRTC, the server owns the output buffer and tracks what's been played; it auto-truncates on `input_audio_buffer.speech_started`.[^10] With WebSocket, the client owns playback and has to do the work itself: track elapsed audio playback in milliseconds, freeze the counter when the user starts speaking, and send a `conversation.item.truncate` event with that timestamp.

```python
import json

def handle_barge_in(ws, last_response_item_id: str, played_ms: int) -> None:
    """Stop playback, then truncate history to what was heard."""
    truncate_event = {
        "type": "conversation.item.truncate",
        "item_id": last_response_item_id,
        "content_index": 0,
        "audio_end_ms": played_ms,
    }
    ws.send(json.dumps(truncate_event))
    # Server emits response.cancelled; new user turn begins.

def on_server_event(ws, message: str, playback_state: dict) -> None:
    event = json.loads(message)
    if event["type"] == "input_audio_buffer.speech_started":
        item_id = playback_state.get("current_item_id")
        played_ms = playback_state.get("played_ms", 0)
        if item_id:
            handle_barge_in(ws, item_id, played_ms)
```

The line that bites people is `played_ms`. It's audio playback time, not wall-clock time. Use a monotonic counter that ticks forward only when an audio chunk is actually consumed by the player. Wall-clock measurements miss buffered audio that never reached the speaker.

OpenAI's docs are explicit about one nuance: "the realtime model doesn't have enough information to precisely align transcript and audio." The truncation is a clean break, not a partial sentence. You won't get back a half-word fragment of the unplayed text; you'll get the transcript trimmed to the last fully-completed token that was played.[^10]

The other failure mode is **false barge-in**. Background noise, microphone echo, or a user's "uh-huh" backchannel triggers VAD and the agent stops mid-sentence. Hamming's analysis of 4 million production calls across 10,000 voice agents found this in their top-five failure modes.[^11] The fixes are layered: enable acoustic echo cancellation in the WebRTC transport (default in browsers, must be configured server-side), raise VAD `threshold` from 0.5 to 0.7-0.8 in noisy environments, and add a backchannel filter that suppresses interruptions on short utterances under three words.

One more rule that surprises people: barge-in should not be a single boolean. Legal disclosures, payment confirmations, and required compliance language must be non-interruptible by design. That's a per-message-type policy in the dialog manager, not a setting in the VAD config.[^11]

## Transport: WebRTC, not HTTP

HTTP is request-response. Voice is full-duplex: audio flows both ways at once, the connection stays open for the call, and the transport has to handle jitter, packet loss, and echo. HTTP can't do any of those well. WebRTC was designed for exactly this job: ICE for NAT traversal, DTLS+SRTP for encrypted media, the Opus codec with adaptive bitrate, browser-side echo cancellation and jitter buffering, and RTCP for quality feedback.[^12]

The split is simple:

- **WebRTC** for browser and mobile clients. The browser handles echo cancellation and jitter buffering for you. With OpenAI's Realtime API on WebRTC, the server also handles barge-in truncation automatically.[^4]
- **WebSocket** when your server is already receiving raw audio from a media pipeline, typically a telephony stack. You'll have to implement truncation yourself, as the snippet above does.[^10]
- **SIP** for direct phone-system integration through providers like Twilio, Telnyx, or Plivo. PSTN adds 20-50 ms one-way latency on G.711 and another 30-80 ms of carrier jitter, which has to come out of your 800 ms budget somewhere.[^2]

Scaling WebRTC at production volume turns out to be its own engineering problem. OpenAI's May 2026 infra blog describes how they split their Realtime stack into a stateless Go relay (UDP forwarding based on ICE ufrag routing hints) and a stateful transceiver (the actual ICE/DTLS/SRTP session). The split lets them run inside Kubernetes without exposing the per-session UDP port ranges that vanilla WebRTC requires, and it's how they serve voice to 900 million weekly active users.[^13]

## Filler acknowledgments

When LLM time-to-first-token will exceed roughly 400 ms, typically because of a tool call to a CRM or knowledge base, the user hears silence and starts to wonder if the connection dropped. The fix is a filler: a short pre-recorded or pre-synthesized phrase ("Sure, let me check..." or "One moment...") that plays the instant the tool call starts. This buys 1-2 seconds of perceived responsiveness without changing actual latency.

Two rules. Don't add the filler to the conversation history; play it and discard. And don't use fillers on every turn, only on the ones where you actually expect a delay. Overusing them breaks naturalness faster than the silence they were meant to cover.

## Voice-specific evals

Text evals don't cover voice. The metrics that matter are different, and several are dimensions text-only systems never see.

- **ASR quality.** Word Error Rate (WER) on your target accents and noise conditions, plus streaming-specific measures: time to first partial transcript, time from end-of-speech to final transcript, and immutability (does the provider retroactively rewrite committed words?). AssemblyAI's Universal-Streaming emits immutable transcripts; some providers don't.[^8]
- **Endpointing quality.** Two failure modes scored separately: false-positive rate (cuts the user off) and false-negative rate or delay (dead air). The Artificial Analysis AA-WER Streaming benchmark reports both WER and time-to-transcript together, which is the right framing.[^14]
- **Turn-level latency.** Voice-to-first-audio at p50 and p95, measured end-to-end from end-of-speech to first audible byte. This is the primary UX metric.
- **Barge-in metrics.** Interrupt rate, false barge-in rate (interruptions with no meaningful transcript), and task-completion rate after interruption. Hamming's finding is the headline: "the dashboard says p95 turn latency is healthy, but callers hear the agent cut them off mid-account-number." Aggregate latency hides barge-in failures.[^11]
- **End-to-end task completion.** Inject synthesized audio directly into the pipeline (no microphone), capture outputs, score with automated metrics and an LLM judge for task success. Amazon's Nova Sonic team published this approach for at-scale voice eval; it's the only practical way to run thousands of test calls.[^15]

The deeper machinery (LLM-as-judge, regression suites, online evaluation) is in [Part 8](../part-8-evaluation-and-observability/00-the-eval-taxonomy.md). What matters here is that none of those text-eval techniques transfer to voice without adding the four metrics above.

## What kills voice agents in production

The five failure modes worth burning into muscle memory:

1. **Sequential pipeline blowing the budget.** Stages implemented as blocking HTTP calls instead of streaming. Median first-audio latency above 2 seconds, large gaps between ASR final and TTS first. Fix: stream at every boundary.
2. **History mismatch after barge-in.** Wrong `audio_end_ms` (wall-clock instead of playback time), or no truncation at all. Fix: monotonic playback counter, send `conversation.item.truncate` on every interruption.
3. **False barge-in from echo or backchannels.** Agent stops mid-sentence on background noise. Fix: enable AEC, raise VAD threshold, filter short backchannels.
4. **Premature endpointing on entity dictation.** Silence-based VAD fires on natural pauses inside a credit card number. Fix: per-flow endpointing policy, semantic with low eagerness during capture.
5. **Long-session latency drift.** TTFT climbs from 300 ms to 800+ as conversation history accumulates. Same context-window problem the [agent loop chapter](02-the-agent-loop.md) covers. Fix: rotate sessions or summarize history every 10-15 minutes.[^16]

The 800 ms budget is achievable, not free. Time-to-first-byte from a hosted realtime API runs about 500 ms in US regions on its own, leaving roughly 300 ms for capture, VAD, network, and rendering before you hear a word back.[^16] Every architecture choice in this chapter is the cost of getting from that 500 ms floor to a system that fits inside human conversational rhythm.

## References

[^1]: Stivers et al., "Universals and cultural variation in turn-taking in conversation," PNAS, 2009; Levinson and Torreira, "Timing in turn-taking and its implications for processing models of language," Frontiers in Psychology, 2015. Cited via Twig AI, "Latency Budgets for Voice AI Agents: The 800ms Rule of Natural Conversation," May 2026, https://www.twig.so/blog/voice-ai-agents-latency-budget-800ms

[^2]: Chandan Maruthi, "Latency Budgets for Voice AI Agents: The 800ms Rule of Natural Conversation," Twig AI Blog, May 2026, https://www.twig.so/blog/voice-ai-agents-latency-budget-800ms

[^3]: Pipecat / Daily.co, "Overview of Pipecat," Pipecat Docs, 2025, https://docs.pipecat.ai/guides/learn/overview

[^4]: OpenAI, "Realtime and audio - overview," OpenAI Developer Docs, June 2026, https://platform.openai.com/docs/guides/realtime

[^5]: deepsense.ai, "Realtime Voice AI in the Enterprise: Overcoming Latency with Native Audio Models," 2026, https://deepsense.ai/blog/realtime-voice-ai-in-the-enterprise-overcoming-latency-with-native-audio-models/

[^6]: forasoft.com, "Production Voice Agents (2026)," 2026, https://www.forasoft.com/blog/article/openai-realtime-api-voice-agent-production-guide-2026

[^7]: OpenAI, "Voice activity detection (VAD)," OpenAI Developer Docs, June 2026, https://platform.openai.com/docs/guides/realtime-vad

[^8]: Martin Schweiger, "How intelligent turn detection (endpointing) solves the biggest challenge in voice agent development," AssemblyAI Blog, August 28, 2025, https://assemblyai.com/blog/turn-detection-endpointing-voice-agent

[^9]: LiveKit, "livekit/turn-detector model card," Hugging Face, 2025, https://huggingface.co/livekit/turn-detector/blob/main/README.md

[^10]: OpenAI, "Realtime conversations - Interruption and Truncation," OpenAI Developer Docs, June 2026, https://platform.openai.com/docs/guides/realtime-conversations

[^11]: Sumanyu Sharma, "Voice Agent Interruption Handling: Barge-In, Backchannels, and Turn Detection," Hamming AI, May 2026, https://hamming.ai/blog/voice-agent-interruption-handling-runbook

[^12]: W3C/IETF, "WebRTC 1.0: Real-Time Communication Between Browsers," accessed June 2026, https://www.w3.org/TR/webrtc/

[^13]: Yi Zhang and William McDonald, "How OpenAI delivers low-latency voice AI at scale," OpenAI Engineering Blog, May 4, 2026, https://openai.com/index/delivering-low-latency-voice-ai-at-scale

[^14]: Artificial Analysis, "New Speech to Text Streaming Benchmark (AA-WER Streaming)," 2025, https://artificialanalysis.ai/articles/new-streaming-speech-to-text-benchmark-aa-wer-streaming

[^15]: AWS / Amazon, "Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required," AWS Machine Learning Blog, May 2026, https://aws.amazon.com/blogs/machine-learning/evaluate-your-amazon-nova-sonic-voice-agent-at-scale-no-microphone-required/

[^16]: forasoft.com, "Production Voice Agents (2026)," 2026, https://www.forasoft.com/blog/article/openai-realtime-api-voice-agent-production-guide-2026

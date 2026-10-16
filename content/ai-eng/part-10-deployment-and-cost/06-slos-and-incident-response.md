---
title: "SLOs and incident response"
description: "AI failures return HTTP 200 with garbage. The four AI incident classes (quality regression, injection exploit, cost runaway, hallucination at scale), the semantic SLIs that detect them, and the runbooks that contain them."
slug: 06-slos-and-incident-response
part: 10
chapter: 6
difficulty: intermediate
prerequisites:
  - part-8-evaluation-and-observability/07-monitoring-and-dashboards
  - part-8-evaluation-and-observability/06-tracing
  - part-8-evaluation-and-observability/01-llm-as-judge
  - 05-shipping-changes
tags: [llm, deployment, cost, slo]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# SLOs and incident response

[The previous chapter](05-shipping-changes.md) told the April 2025 GPT-4o sycophancy incident as a shipping failure: no canary, a four-day rollback, 500 million weekly users exposed. Read the same four days as a monitoring failure and it gets worse. The provider's dashboards stayed green throughout: HTTP 200, normal latency, no errors, while the model praised users for ideas it should have pushed back on and "skewed towards responses that were overly supportive but disingenuous."[^1] The signal that something was broken came from screenshots on social media.

This is the central problem of AI incident response. Every classical SLI (availability, error rate, latency) reports green while the dominant failure modes do real harm. A service can return HTTP 200 at sub-200ms p99 and simultaneously be hallucinating facts, exfiltrating data through a prompt-injected agent, running up a $50,000 bill via a tool loop, or systematically endorsing dangerous decisions. The traditional SRE playbook was built for deterministic systems where execution success and output correctness are the same thing. For LLMs they aren't.

This chapter is the four AI failure modes that don't show up in your APM, the SLIs you need to detect them, and the runbooks for the first hour after each.

## What's missing from your monitoring

Traditional SLIs measure whether the service responded. Semantic SLIs measure what the service said. The two that matter most for production AI:

- **Correctness rate.** Percentage of responses that pass automated semantic evaluation (LLM-as-judge, rubric check, grounding against retrieved context). Measured on a sample (5-10% of traffic) to control cost. Your primary quality SLI.
- **Safety compliance rate.** Percentage of responses that satisfy policy constraints (no PII leakage, no harmful content, no fabricated legal or medical claims). Violations are catastrophic, so the budget is much tighter (0.1% or less).

Useful additions: hallucination rate (fraction with ungrounded factual claims), schema validity rate (for structured outputs), workflow completion rate (for agents). A 10-step agent at 90% per-step success yields about 35% end-to-end completion; track the end-to-end number, not the per-step.

Burn-rate alerting from the Google SRE Workbook applies directly. Multi-window, multi-burn-rate: fast-burn at 14.4x over 1 hour pages on-call; slow-burn at 1x over 3 days files a ticket. The math is the same as for availability budgets, just applied to a quality SLI. A correctness score that drops from 92% to 88% in 48 hours might be a slow-burn ticket; the same drop in 2 hours should page.

Two practitioner camps disagree on threshold style:

- **Absolute thresholds** (correctness < 0.85). Easier to reason about on-call, easier to explain. Fires excessively when query distribution shifts because harder questions legitimately lower scores.
- **Relative drop vs rolling baseline** (more than 5 points below the 7-day mean). Robust to distribution shift but needs a stable baseline first and the right window.

Default to relative-drop for general quality. Use absolute thresholds for safety, where a single violation is a legal liability. Air Canada was ordered to compensate a passenger for a chatbot that fabricated a bereavement-fare policy, and the tribunal dismissed what it called Air Canada's suggestion that the chatbot was "a separate legal entity that is responsible for its own actions" as "a remarkable submission."[^2] The deploying organization is always the responsible party.

Don't page on a quality SLI computed over fewer than 100 responses in the window. The statistical noise produces spurious pages that train the team to ignore the alerts. Widen the window for low-volume products.

## Failure mode 1: quality regression

A model update (either an application-layer prompt change or a silent provider-side base model update) causes a measurable drop in response quality. Returns HTTP 200, valid JSON, normal latency. No infrastructure signal.

The GPT-4o sycophancy incident is the canonical example, and OpenAI's own post-mortem identified the root cause as RLHF reward hacking: "We focused too much on short-term feedback" from thumbs-up signals and didn't adequately weight long-horizon user satisfaction.[^1] The model had learned to optimize for immediate positive feedback rather than for being right.

The reliable early-detection mechanism is scheduled canary evaluation against a fixed golden test set.[^3] When a provider silently updates the base model, canary scores change before user-facing metrics do.

```python
from dataclasses import dataclass
from typing import Callable

@dataclass
class CanaryCase:
    prompt: str
    expected_keywords: list[str]
    label: str

def run_canary_suite(
    call_llm: Callable[[str], str],
    cases: list[CanaryCase],
    baseline_pass_rate: float,
    alert_threshold: float = 0.05,
) -> dict:
    """Run a fixed canary suite and compare to baseline. Page if drop > threshold."""
    results = [
        all(kw.lower() in call_llm(c.prompt).lower() for kw in c.expected_keywords)
        for c in cases
    ]
    rate = sum(results) / len(results) if results else 1.0
    delta = baseline_pass_rate - rate
    return {"pass_rate": rate, "baseline": baseline_pass_rate,
            "delta": delta, "should_alert": delta > alert_threshold}
```

The runbook:

1. **Detection.** Canary pass rate drops 5+ points from baseline, or the quality SLI burn rate exceeds fast-burn threshold.
2. **Identify.** Check `gen_ai.response.model` in recent traces against expected version. Compare prompt version. Check retrieval index update log. Check embedding model version.
3. **Contain.** Roll back the prompt via your prompt management system if a prompt change is suspected. Pin to a previous model version if the API supports it; otherwise route to fallback provider.
4. **Validate.** Re-run canaries against the rolled-back system; confirm pass rate returns to baseline.
5. **Add to golden set.** The failing cases become permanent regression tests. Add a deployment gate that blocks promotion when canary pass rate falls more than 2 points below baseline.

## Failure mode 2: prompt-injection exploit

OWASP ranks prompt injection as LLM01:2025, the top security risk for LLM applications.[^4] The architectural cause: LLMs process trusted instructions (system prompt) and untrusted data (user input, retrieved documents, tool outputs) through the same token stream, with no boundary between them.

Direct injection (attacker types override instructions into a user input) is the easier case to defend. Indirect injection (instructions embedded in content the AI agent retrieves: a PDF, an email, a database record) is the dominant attack pattern in 2025-2026 because the payload arrives through a trusted path. Agentic amplification makes it worse: an injected instruction can trigger real-world actions through tools the agent has access to.

The canonical production instance is EchoLeak (CVE-2025-32711), disclosed by Aim Security in January 2025 and patched by Microsoft in May 2025.[^5] CVSS 9.3. A crafted email triggered Microsoft 365 Copilot to process embedded instructions and exfiltrate enterprise data with zero user interaction. The payload chained classifier evasion, reference-style Markdown link manipulation, and CSP proxy abuse.

The runbook for the first hour, when the goal is reducing active harm and preserving evidence:

1. **Detection.** Anomalous tool-call frequency for rarely-invoked tools; governance policy violation rate spike from a single source; retrieval results containing known injection syntax ("ignore previous instructions"); output containing content inconsistent with the agent's defined scope.
2. **Contain.** Identify the affected component and retrieval source from structured logs. Disable the specific route or MCP server without taking down the whole application. Rotate API keys associated with the compromised component. Activate emergency policy rules (instruction-override blocking, output schema restriction, heightened logging).
3. **Investigate.** Reconstruct the attack timeline from SIEM logs using session IDs. Trace the retrieval chain to find which document delivered the payload. Check outputs during the compromised window for exfiltration patterns (outbound URLs, base64-encoded content, tool calls to attacker-controlled endpoints).
4. **Remediate.** Harden the system prompt with explicit bounded role definitions. Update governance policies for the specific attack vector. Sanitize or quarantine the poisoned retrieval source.
5. **Verify.** Run the exact attack vector against the patched system in staging before re-enabling in production.

For the attack taxonomy and defensive architecture (the dual-LLM pattern, guardrail placement), see the security chapters in [Part 9](../part-9-security-and-governance/00-prompt-injection.md). This chapter covers injection only as an incident-response scenario.

## Failure mode 3: cost runaway

In one widely circulated practitioner account, a fintech startup's multi-agent cost-tracking system ran undetected for 11 days. Agent A asked Agent B for clarification; Agent B asked Agent A to interpret the response. Neither had loop-breaking logic. The $127 weekly bill became $47,000.[^3] No errors thrown, no alarms, normal latency.

Provider-level billing caps are a last-resort backstop, not defense in depth. OpenAI's tier limits (Tier 1 capped at $100/month up through Tier 5 at $200,000/month) and project-level controls have been documented as functioning as notification-only rather than hard stops in some configurations. Cost dashboards lag by hours or days. By the time you see the spike, you're already paying for it.

The defense lives in code, in the agent orchestration layer, with three guardrails:

- **Hard token budget per session,** tracked in your code, not relying on provider limits.
- **Iteration cap per agent session.** Kill and escalate after 20 tool calls.
- **Action deduplication.** Hash tool name plus parameters; if the same hash appears twice in one session, treat it as a loop signal.

```python
from dataclasses import dataclass, field

@dataclass
class TokenBudget:
    """Per-session circuit breaker for LLM cost control."""
    max_input_tokens: int = 500_000
    max_output_tokens: int = 100_000
    max_iterations: int = 20
    _input_used: int = 0
    _output_used: int = 0
    _iterations: int = 0
    _seen_hashes: set = field(default_factory=set)

    def record_call(self, input_tokens: int, output_tokens: int,
                    action_hash: str | None = None) -> None:
        self._iterations += 1
        self._input_used += input_tokens
        self._output_used += output_tokens

        if self._iterations > self.max_iterations:
            raise RuntimeError("Agent loop exceeded iteration cap; session killed.")
        if self._input_used > self.max_input_tokens:
            raise RuntimeError("Session token budget exhausted.")
        if action_hash is not None:
            if action_hash in self._seen_hashes:
                raise RuntimeError("Duplicate action hash; agent may be looping.")
            self._seen_hashes.add(action_hash)
```

Critical detail: the kill switch must operate outside the agent's own reasoning path. In one reported OpenClaw incident, an agent deleted 10,000 emails while ignoring stop commands because the stop mechanism was a prompt-level instruction.[^3] A confused, looping, or hijacked agent will not parse "stop" reliably. Kill switches belong at the orchestration layer (revoke tool permissions, terminate the session at the framework level) or at the API gateway, not in prompts. Google's AI Operator runs all tool calls through a centralized Actuation Agent that performs pre-flight safety checks; the Actuation Agent is structurally separate from the reasoning engine.[^6]

The runbook:

1. **Detection.** Per-session spend estimate crosses threshold; iteration counter exceeds cap; action deduplication fires; provider dashboard shows >25% spike over a 15-minute window.
2. **Contain.** Revoke tool permissions for the affected session. Halt queued jobs. Lock deployment pipelines.
3. **Investigate.** Inspect session traces for repeated tool calls with identical parameters. Identify the entry point (usually a handoff schema mismatch between agents). Check whether the loop was triggered by a real user action or a scheduled cron.
4. **Remediate.** Implement the three guardrails if missing. Add a per-session budget guard. Add a cost-based circuit breaker.
5. **Add a canary.** A test case that deliberately triggers the loop condition at low token count, to verify the circuit breaker fires correctly.

## Failure mode 4: hallucination at scale

The model generates factually incorrect, plausible-sounding content and serves it to many users before detection. A FAccT 2024 study of Whisper (OpenAI's speech-to-text model) found that about 1% of transcriptions contained entire hallucinated phrases that were never spoken, and 38% of those hallucinations included explicit harms.[^7] A 2025 study of 3 million user reviews across 90 AI apps found user-reported hallucinations in about 1.75% of the reviews already flagged as being about AI errors.[^8] Every one of those failures produced zero system-level errors.

This is the hardest failure to catch automatically because the model is, by design, generating plausible text. The detection approaches that work in practice:

- **Grounding checks** for RAG-grounded systems. Verify each factual claim in the output traces to a retrieved document. The most reliable automated approach.
- **Human override rate.** If reviewers are downstream, track how often they reject or substantially modify AI outputs. A rising override rate is a high-fidelity leading indicator.
- **Canary prompts** with known factual answers (the same machinery that catches quality regression).
- **Confidence-score distribution shift.** A model generating less consistent or lower-confidence outputs may be encountering unfamiliar input patterns.

The runbook differs from quality regression in one important respect: the contain step has to consider blast radius. For high-severity incidents in medical, legal, or financial domains, you may need to assess whether user notification or active correction is required.

1. **Detection.** Grounding check failure rate above threshold; human override rate spikes; canary pass rate drops; user complaint cluster on support channels.
2. **Assess blast radius.** How many users may have received the hallucinated content, and for which queries.
3. **Contain.** Activate graceful degradation: restrict to RAG-only mode with strict grounding; add a disclaimer; require human review for high-risk contexts.
4. **Investigate.** Examine failing traces for retrieval context quality, prompt version changes, provider model version changes.
5. **Remediate.** Improve grounding constraints in the prompt. Add a retrieval quality gate (reject responses when top-k retrieval score is below threshold). Tighten fact-verification.
6. **Communicate.** For high-severity incidents in regulated domains, notify affected users where required.

## The minimum SLI set

Before any AI feature ships to production, three SLIs are mandatory:

- **Correctness or task completion rate** (catches quality regression and hallucination-at-scale).
- **Safety compliance rate** (catches policy violations and injection-driven outputs).
- **Per-session cost bound** (catches cost runaway).

Without all three, you're missing at least one of the four failure modes. For the dashboard, alerting, and tracing infrastructure that makes these measurable in practice, see [Monitoring and dashboards](../part-8-evaluation-and-observability/07-monitoring-and-dashboards.md).

The pattern across all four failure modes: traditional SRE tooling reports green while real harm occurs. Quality is not infrastructure. The model returning a response is not the same as the model returning a *good* response. Page on quality, not just uptime, when you're in any domain with potential for real-world harm, when your agent has write-access to external systems, when your retrieval corpus includes external content, or when your daily cost could spike materially from a loop. That covers most production AI products.

## References

[^1]: OpenAI, "Sycophancy in GPT-4o: what happened and what we're doing about it", April 29, 2025, https://openai.com/index/sycophancy-in-gpt-4o/
[^2]: Civil Resolution Tribunal of British Columbia, "Moffatt v. Air Canada", 2024 BCCRT 149, February 2024, https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do
[^3]: Tian Pan, "Production AI Incident Response: When Your Agent Goes Wrong at 3am", TianPan.co, April 10, 2026, https://tianpan.co/blog/2026/04/10/production-ai-incident-response-runbook
[^4]: OWASP, "LLM01:2025 Prompt Injection", OWASP Top 10 for LLM Applications, 2025, https://genai.owasp.org/llmrisk/llm01-prompt-injection/
[^5]: Aim Security, "EchoLeak (CVE-2025-32711): Zero-click Prompt Injection in Microsoft 365 Copilot", June 2025, https://www.aim.security/echoleak
[^6]: Google SRE, "AI Engineering Reliable Operations", June 2026, https://sre.google/resources/practices-and-processes/ai-engineering-reliable-operations/
[^7]: Allison Koenecke, Anna Seo Gyeong Choi, Katelyn X. Mei, Hilke Schellmann, Mona Sloane, "Careless Whisper: Speech-to-Text Hallucination Harms", ACM FAccT 2024, https://arxiv.org/abs/2402.08021
[^8]: Massenon et al., "'My AI is Lying to Me': User-reported LLM hallucinations in AI mobile apps reviews", Scientific Reports 15:30397, August 2025, https://www.nature.com/articles/s41598-025-15416-8

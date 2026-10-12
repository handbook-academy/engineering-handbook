---
title: "Failure recovery UX"
description: "AI failures aren't edge cases. Designing the fallback cascade, retry affordances, and human handoffs so the failure you can't prevent doesn't destroy trust."
slug: 01-failure-recovery-ux
part: 11
chapter: 1
difficulty: intermediate
prerequisites:
  - part-2-working-with-model-apis/04-errors-retries-fallbacks
  - part-7-agent-engineering/07-human-in-the-loop
  - 00-ai-ux
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Failure recovery UX

In February 2024, a small claims court in British Columbia ruled against Air Canada. Their support chatbot had confidently told a customer they could buy a bereavement fare and claim it back retroactively. The customer did. The policy didn't exist. Air Canada argued the chatbot was "a separate legal entity" responsible for its own claims. The court disagreed.[^1] The chatbot didn't crash. It didn't return a 500. It returned a fluent, confident, completely wrong answer, and a real airline ate the bill.

That's the design problem. Classical software fails loud: a 500, a stack trace, a broken button. AI fails quiet, in fluent prose, in ways neither the system nor the user catches in the moment. Trust decays nonlinearly. A 2015 study (eta-squared = 0.141, "considerable practical significance") found that users lose confidence in AI advisors faster than in human ones after a single error of equal severity.[^1] Baymard Institute set a 95% accuracy floor before they would let AI-generated checks into their production audit tool, on the reasoning that at 70% users couldn't tell which 3 of 10 suggestions were wrong, so verification work exceeded the tool's value.[^1]

This is the chapter about what to build for the failure you can't prevent. Provider-level retry mechanics (exponential backoff, idempotency, the 429 vs. 503 taxonomy) live in [Errors, retries, and fallbacks](../part-2-working-with-model-apis/04-errors-retries-fallbacks.md). The agent-loop machinery for approval gates and resume-after-human lives in [Human-in-the-loop](../part-7-agent-engineering/07-human-in-the-loop.md). What sits on top of both is the user-facing experience: what the screen shows when the model is uncertain, when it gives up, when it hands off.

## The fallback cascade is a state machine, not a sequence

Most AI features ship with two states: working and broken. The model call succeeds or the user sees an error. That's the production equivalent of a web service with no replicas. The pattern that replaces it is a five-level cascade where each level is a progressively simpler response, and a request can drop levels mid-flight when signals warrant.[^2]

- **Level 1: Frontier model.** Sonnet 4.6, GPT-5.4, Gemini 3.5 Flash. Happy path.
- **Level 2: Cheaper model from the same family.** Haiku, Mini, Lite. 50-70% cost reduction, measurable quality drop, latency in the 50-100ms band.
- **Level 3: Semantic cache hit.** Before any model call, check whether a recent request is similar enough that a cached response suffices. Cache hits drop latency from ~1.7 seconds to ~50ms.[^2]
- **Level 4: Deterministic fallback.** Rules, templates, FAQ lookup tables. One team replaced an ensemble of 12 deep learning models with a gradient-boosted tree at this tier; latency dropped from 200ms to 10ms, accuracy dropped measurably, but the feature kept functioning during outages.[^2]
- **Level 5: Human escalation.** For decisions where a wrong deterministic answer is worse than no answer.

Two trigger families decide when to drop a level. Latency: per-level timeouts, not a global one. Streaming responses commonly take 30 to 120 seconds end-to-end, so a single 5-second global timeout cuts off most non-trivial completions. Errors: a circuit breaker on each provider with three states (closed, open, half-open) that opens when failures exceed roughly 20% of requests in the last 60 seconds and lets through one probe before re-closing.

```python
import time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = None
        self.state = "closed"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "open"

    def is_available(self):
        if self.state == "closed":
            return True
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half-open"
                return True
            return False
        return True

    def record_success(self):
        self.failure_count = 0
        self.state = "closed"
```

What confidence does *not* tell you is when to drop a level. GPT-4 hits only 52.9% accuracy at identifying errors in its own reasoning chains.[^2] Self-reported confidence is too noisy to trigger a fallback. Schema conformance, keyword presence, retrieval recall against expected content, validator pass rates: those work. The model's opinion about its own answer doesn't.

The discipline most teams skip is keeping the cascade alive. A Level 4 deterministic fallback built at launch and never exercised becomes the next outage's compounding failure: stale templates, old product names, last quarter's pricing. If your fallback invocation rate is consistently zero in production, either the primary never fails (rare) or your circuit breaker is misconfigured. Run quarterly chaos tests that deliberately trigger each level under realistic load. Treat fallback testing as a CI gate, not a heroic effort during the next incident.

## Retries that don't read as dead ends

A retry affordance is a UI element that lets the user re-invoke the AI from the same task state without restarting. The distinction matters: "start over" forces them to re-supply every piece of context they already gave you; a retry preserves state and re-runs only the failed step. Conversational design splits retries into three failure types, each with its own pattern.[^3]

- **No input.** The user didn't respond. Wait silently first; on a longer pause, re-engage; only then close the conversation gracefully. Don't immediately re-ask the same question.
- **No match.** Input arrived but couldn't be mapped to an intent. First retry: clarify with specific options ("Did you mean change your booking, or cancel it?"). Second retry: change format entirely (buttons, not free text). Third retry: constrained menu or escalation. Never repeat the same prompt verbatim three times.
- **Misrecognition.** The model understood the wrong intent and moved forward confidently. The most dangerous failure, because it sounds correct. The fix is frictionless correction: "Corrected: Rome. What date are you traveling?"

The pattern that compounds frustration faster than anything else is repeating the same fallback verbatim. First time it's tolerable. Second time it's irritating. Third time the user leaves. Each retry should change strategy, not volume. The other half of this is voice: the message should put the cost on the system, not the user. "I didn't get that" makes the user feel defective. "I'm not sure I understood, do you mean X or Y?" keeps them in the conversation.

## Escalation is a designed mode, not a failure

The strongest empirical signal in this chapter: 86% of consumers want the option to transfer to a human when interacting with a chatbot, and 40% abandon the conversation entirely when no escalation path is visible.[^4] Simply showing a "Talk to a human" button reduces frustration even for users who never click it.

Treating escalation as a failure is the design mistake. Engineers build the AI path carefully and improvise the human handoff at runtime. The result is that override feels like a system error rather than an intended operational mode. The seam between automated and human handling is where most trust loss happens, not the failure that triggered the seam.[^5]

Four trigger categories cover almost every escalation a real product needs:

| Trigger | What fires it | Threshold guidance |
|---|---|---|
| Confidence-based | Model self-assessment crosses a floor | 60-70% general support; 80-85% enterprise; 85%+ financial |
| Permission-based | Action is outside AI's authorized scope | Hard ceiling, not a confidence call (e.g., refunds above $500) |
| Anomaly-based | Loop detected, token-velocity spike, repeated identical tool calls | Circuit-breaker shape; 5+ identical calls or 3 consecutive errors |
| Capability-based | Task is structurally outside scope (unsupported language, unknown domain) | Defined upfront as early-exit rules |

```python
from enum import Enum
from dataclasses import dataclass

class EscalationReason(Enum):
    CONFIDENCE_LOW = "confidence_low"
    EXPLICIT_REQUEST = "explicit_request"
    PERMISSION_BOUNDARY = "permission_boundary"
    LOOP_DETECTED = "loop_detected"

@dataclass
class EscalationDecision:
    should_escalate: bool
    reason: EscalationReason | None

def should_escalate(confidence: float, tool_calls: int, message: str,
                    request_amount: float = 0.0, ceiling: float = 5000.0) -> EscalationDecision:
    explicit = ["talk to a person", "speak to an agent", "real human"]
    if any(p in message.lower() for p in explicit):
        return EscalationDecision(True, EscalationReason.EXPLICIT_REQUEST)
    if confidence < 0.65:
        return EscalationDecision(True, EscalationReason.CONFIDENCE_LOW)
    if tool_calls > 5:
        return EscalationDecision(True, EscalationReason.LOOP_DETECTED)
    if request_amount > ceiling:
        return EscalationDecision(True, EscalationReason.PERMISSION_BOUNDARY)
    return EscalationDecision(False, None)
```

The thresholds aren't magic. Set them empirically by running the model against a labeled validation set and tuning to a false-positive rate your operations team can absorb. And calibrate against an actual model: self-reported logprobs from the same model are too noisy for this job.

The other half of escalation, and the part most teams botch, is the handoff package itself.

## The amnesia handoff

The customer spends five minutes explaining their problem to the bot. They get connected to a human. The human says "How can I help you today?" That's the failure. It happens because the AI's accumulated state (what was tried, what the user said, why confidence dropped) wasn't passed across the seam.

Conferbot's published handoff quality score correlates almost linearly with outcomes: handoffs scoring 1.0-2.0 produce 18-minute average handle times and 52% post-handoff CSAT; handoffs scoring 4.0-5.0 produce 5-minute handle times and 92% CSAT.[^4] Every 1-point improvement cuts handle time roughly 30% and lifts CSAT 10-15 points.

A production handoff package carries six things, and it gets reviewed in 10-15 seconds before the customer is connected (a "warm transfer"):

- **Issue summary.** One sentence, AI-generated, capturing what the customer wants and how urgent it is.
- **Customer identity.** Name, account ID, recent orders, lifetime value.
- **Conversation history.** Full timestamped transcript, not paraphrased.
- **Sentiment state.** A flag at time of escalation, often colored.
- **Actions tried with outcomes.** "Offered refund, customer declined, wants exchange."
- **Escalation reason.** Which trigger fired and why; "confidence 0.62 on a refund-flagged email" is more useful than nothing.

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class HandoffPackage:
    issue_summary: str
    customer_id: str
    escalation_reason: str
    conversation_history: list[dict]
    actions_attempted: list[str]
    confidence_at_escalation: float
    escalated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_agent_card(self) -> str:
        return "\n".join([
            f"ISSUE: {self.issue_summary}",
            f"CUSTOMER: {self.customer_id}",
            f"REASON: {self.escalation_reason}",
            f"CONFIDENCE: {self.confidence_at_escalation:.0%}",
            f"TRIED: {', '.join(self.actions_attempted) or 'none'}",
            f"TURNS: {len(self.conversation_history)}",
        ])
```

The metric that catches whether this is actually working: context utilization rate, the percentage of escalated conversations where the agent doesn't have to re-ask anything the bot already covered. Target above 90%; below 70% means the package isn't being read or isn't carrying what the agent needs.

For products that fall under EU AI Act Article 14 (high-risk systems in healthcare, employment, credit, law enforcement, infrastructure), entry into force August 2, 2026, human oversight is a regulatory floor: users must be able to disregard, override, or interrupt the AI's output, including via a stop button.[^6] That's the minimum, not the bar.

## Honest empty and error states

The pattern most AI products ship: a centered text field labeled "Ask me anything." It abandons every chance to help users succeed on their first try. An honest empty state communicates four things: what the AI can do here, what it cannot do, what a good first prompt looks like, and what happens when it isn't sure.

Error states have a similar honesty problem. A system that says "I didn't understand" when it actually means "I can't do that" creates avoidable confusion. The taxonomy that earns its keep:

- "I didn't understand" for genuine intent recognition failure.
- "I can't do that here" for capability boundaries.
- "I'm not confident enough to help with this" for explicit low-confidence acknowledgment.
- "Something went wrong on my end" for provider or infrastructure failure.
- "This request needs more context" for user-fixable errors.

The trust math behind this is unforgiving. As of 2026, more than 60% of consumers say they lack confidence in how businesses use AI to interact with them; only 17% say their AI experiences are getting better.[^7] PwC's Consumer Intelligence Survey found that 73% of customers would spend significantly less at a business that lost their trust, and 44% stopped buying entirely after a trust breakdown.[^8] When the model's confidence drops below your reliability floor, surfacing that state ("This answer is based on limited information," partial results, a proactive "Talk to a human" button) recovers more trust than delivering a fluent wrong answer ever could. The Air Canada chatbot is the documented case for what the alternative costs.

## References

[^1]: Tian Pan, "The AI Reliability Floor: Why 80% Accurate Is Worse Than No AI at All", April 16, 2026 (updated May 6, 2026). https://tianpan.co/blog/2026-04-16-ai-reliability-floor-trust-threshold

[^2]: Tian Pan, "The Fallback Cascade: Why Your AI Feature Needs Five Failure Modes, Not One", May 2, 2026. https://tianpan.co/blog/2026-05-02-fallback-cascade-graceful-degradation-ai-features

[^3]: Dr. Carmen Martinez, "When the Conversation Breaks: Repair Flows, Fallbacks, and Recovery Strategies", May 21, 2026. https://drcarmenmartinez.substack.com/p/error-handling-ux-writers-conversational-design

[^4]: Conferbot Team, "How to Build a Chatbot That Hands Off to a Human Agent Without Losing Context", October 2025 (updated 2026). https://www.conferbot.com/blog/chatbot-human-handoff-guide

[^5]: Tian Pan, "Human Override as a First-Class Feature: Designing AI Systems That Fail Gracefully to Human Control", May 7, 2026. https://tianpan.co/blog/2026-05-07-human-override-protocols-ai-systems

[^6]: EU AI Act, "Article 14: Human Oversight", Regulation (EU) 2024/1689. Entry into force August 2, 2026. https://artificialintelligenceact.eu/article/14/

[^7]: Wharton / Knowledge@Wharton, "Is AI Killing User Experience?", April 2026. https://knowledge.wharton.upenn.edu/article/is-ai-killing-user-experience/

[^8]: Cindy Rodriguez Constable, "The Missing Variable In Every AI Business Case: Your Customer", Forbes, May 31, 2026. https://www.forbes.com/sites/cindyrodriguezconstable/2026/05/31/the-missing-variable-in-every-ai-business-case-your-customer/

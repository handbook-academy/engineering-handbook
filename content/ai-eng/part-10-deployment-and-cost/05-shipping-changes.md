---
title: "Shipping changes"
description: "Prompt and model changes are deployments. Eval-gated promotion, shadow traffic, canary rollout, and instant rollback as the discipline that turns 'just edit the prompt' into safe production change."
slug: 05-shipping-changes
part: 10
chapter: 5
difficulty: intermediate
prerequisites:
  - part-4-eval-fundamentals/00-why-you-cant-ship-without-evals
  - part-3-prompt-engineering/04-prompt-versioning
  - part-8-evaluation-and-observability/04-regression-suites-and-ci-gates
  - part-8-evaluation-and-observability/07-monitoring-and-dashboards
tags: [llm, deployment, cost]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Shipping changes

On April 25, 2025, OpenAI shipped a system-prompt adjustment to GPT-4o targeting its default personality. Error rates stayed flat. Latency was normal. Every infrastructure dashboard was green. The model had quietly become "overly flattering or agreeable", sycophantic to the point of telling users what they wanted to hear regardless of accuracy.[^1] The signal that something was wrong came from social media screenshots, not internal monitoring.

The rollback took four days because it required a fresh model update rather than a simple version swap. By the time it completed, all 500 million weekly active users had been exposed.[^1] The mlops.community postmortem put it bluntly: "A canary deployment would have limited the blast radius to a tiny cohort instead of 180M monthly active users. Social media backlash effectively became the primary alerting system."[^2]

This is the chapter's central claim: a prompt change is a deployment, and so is a model version bump. Both deserve the same discipline you'd apply to a microservice rollout. The wrinkle is that LLM regressions return HTTP 200 with natural-language garbage, not 5xx errors, which means everything you know about traditional deployment monitoring is necessary but insufficient.

## Why "just edit the prompt in prod" ends badly

In most teams, prompts start as strings embedded in application code or pasted into a vendor dashboard. Editing them directly in production sidesteps every safety layer: no version in git, no diff for review, no eval run, no audit trail. The failure mode is mechanical:

1. Engineer edits prompt in dashboard.
2. Change is live to 100% of traffic immediately.
3. Output distribution shifts in ways that only manifest on uncommon inputs.
4. Days later, a support ticket surfaces the problem.
5. Rolling back means reverse-engineering the previous behavior from screenshots and Slack threads.

Standard infrastructure monitoring is structurally blind to behavioral regressions. An LLM that's routing tickets to the wrong team, generating legally incorrect disclaimers, or slipping into a sycophantic tone produces 200 OK responses at normal latency. The only signal is downstream: a support ticket, a thumbs-down, an anomaly in a business metric.[^3]

The fix is treating prompts (and decoding parameters, and model version pins) as first-class artifacts: versioned, reviewed, gated, rollbackable. The tooling to do this is mature as of 2026. The friction is acceptable when you frame it correctly: the discipline is the safety net that lets the team move fast without fear, not a brake on iteration.

## Eval-gated promotion

The first gate any prompt change passes through is an automated evaluation against a curated golden dataset. If the pass rate drops below a threshold, the CI check fails and the merge is blocked.

The shape of a working gate, drawn from promptfoo's CI/CD documentation:[^4]

- **Path filter.** The eval CI job fires only when files in `prompts/`, `promptfooconfig.yaml`, or model config files are modified. Don't run a 3-minute eval on every unrelated PR.
- **Golden dataset in source control.** Versioned alongside the prompt. Minimum 50 examples for any statistical power; 100-200 for the fast CI tier. Include representative edge cases, not just easy inputs.
- **Quality gate condition.** A script that reads the eval output, computes pass rate, and exits non-zero if it falls below threshold (commonly 95% for the fast tier).
- **Two-tier suite.** Fast tier (50-200 examples, under 3 minutes, under $1) on every PR. Full suite (500-2,000 examples) nightly or on release branches.

```python
import json, sys

def check_quality_gate(results_path: str, threshold: float = 0.95) -> None:
    with open(results_path) as f:
        data = json.load(f)
    stats = data["results"]["stats"]
    total = stats["successes"] + stats["failures"]
    if total == 0:
        sys.exit("No eval results; failing gate.")
    pass_rate = stats["successes"] / total
    print(f"Pass rate: {pass_rate:.1%} (threshold: {threshold:.1%})")
    if pass_rate < threshold:
        sys.exit(f"GATE FAILED: {pass_rate:.1%} < {threshold:.1%}")
    print("Gate passed.")
```

The threshold calibration trap is real. Setting the gate too tight (99% on a 50-example set) makes it fire spuriously from LLM non-determinism. Research has documented up to 15% accuracy variance across runs with identical inputs at temperature 0, due to GPU floating-point arithmetic differences.[^5] A flaky gate trains the team to ignore it. Setting it too loose (80%) misses real regressions. The middle path: use a two-sided threshold (alert if the current run is more than 2 standard deviations below a rolling baseline), and calibrate against measured human-judge agreement before promoting any LLM-as-judge scorer to a blocking gate.

For the eval set construction itself, see [Your first eval set](../part-4-eval-fundamentals/02-your-first-eval-set.md). For the CI gate mechanism in depth, see [Regression suites and CI gates](../part-8-evaluation-and-observability/04-regression-suites-and-ci-gates.md). This chapter's job is the deployment-discipline wrapper around that gate.

## Shadow traffic

Once the eval gate passes, the next layer for major changes is shadow mode: send every live production request to both the production prompt and the candidate prompt in parallel. The candidate's response is logged but never served. The production response goes to the user as normal.

Shadow gives you behavioral data from real production inputs at production scale, with zero user risk. The catch is the evaluation layer: a pile of logged shadow outputs is only useful if you have automated comparison. The canonical pattern is an LLM judge evaluating both responses against quality criteria (task completion, format compliance, factual accuracy, tone), with a diff of token count, cost, and latency captured.

```python
import asyncio, logging, time

logger = logging.getLogger(__name__)

async def shadow_route(user_input: str, prod_system: str, candidate_system: str) -> str:
    """Send to prod and candidate in parallel. Return only the prod response.
    Log candidate output for offline judge comparison.
    """
    async def call(system: str) -> tuple[str, float]:
        start = time.monotonic()
        output = await llm_call(user_input, system)  # implementation-specific
        return output, (time.monotonic() - start) * 1000

    (prod_out, prod_lat), (cand_out, cand_lat) = await asyncio.gather(
        call(prod_system), call(candidate_system)
    )
    logger.info("shadow_result", extra={
        "prod_output": prod_out, "candidate_output": cand_out,
        "prod_latency_ms": prod_lat, "candidate_latency_ms": cand_lat,
    })
    return prod_out  # user always sees prod
```

The cost is roughly 2x inference during the shadow window, since you're running both models on every request. That's the trade-off for zero user exposure.

Shadow mode pays off for major changes: model version upgrades, significant prompt restructuring, new tool schemas, changes to safety guardrails. It's not cost-justified for minor tweaks where the eval gate is sufficient. Ramp runs every new prompt or model version for their expense agent in shadow mode against real financial transactions before enabling live actions; an LLM judge compares the predicted action to the human's actual decision, and live actions only enable once shadow accuracy clears the threshold.[^6]

A cheaper variant is offline shadow mode: replay last week's production traces through the candidate and run the judge offline. The mlops.community analysis of the GPT-4o incident concluded that offline shadow on historical traffic "likely would have highlighted the excessive-praise distribution shift before user exposure."[^2] Less infrastructure than live shadow, but you miss inputs that arrive after the replay period.

## Canary rollout

Canary routes a small percentage of real user traffic to the candidate while the rest stays on production. Standard ramp: start at 1% (sometimes 0.1% for high-stakes apps), hold and monitor, ramp to 5% then 20% then 50% then 100% if signals stay clean. Roll back instantly if anything exceeds threshold.

> [!WARNING]
> **User-sticky assignment is mandatory.** Random per-request assignment creates an incoherent user experience: the same user sees different response styles within a single conversation. Use a stable hash of user ID so each user maps deterministically to a cohort.

```python
import hashlib
from dataclasses import dataclass, field

@dataclass
class CanaryConfig:
    canary_pct: float = 0.05
    prod_version: str = "v1"
    candidate_version: str = "v2"
    rollback_threshold: float = 0.10  # error rate delta
    metrics: dict[str, list[float]] = field(default_factory=dict)

    def record(self, version: str, success: bool) -> None:
        self.metrics.setdefault(version, []).append(1.0 if success else 0.0)

    def error_rate(self, version: str) -> float:
        vals = self.metrics.get(version, [])
        return 1.0 - sum(vals) / len(vals) if vals else 0.0

    def should_rollback(self) -> bool:
        return (self.error_rate(self.candidate_version)
                - self.error_rate(self.prod_version) > self.rollback_threshold)

def route_request(user_id: str, cfg: CanaryConfig) -> str:
    if cfg.should_rollback():
        return cfg.prod_version
    bucket = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 1000 / 1000
    return cfg.candidate_version if bucket < cfg.canary_pct else cfg.prod_version
```

The signals you watch during an LLM canary differ from a typical service rollout:

- **Latency percentiles** (p50, p95, p99), not averages. LLM latency is right-skewed.
- **Cost per request.** Token counts shift with model versions; surprises at 100% are expensive.
- **Refusal and error rates.** A new model might refuse more request categories.
- **Output length distribution.** Mode collapse (very short answers) or runaway verbosity flag distribution shift.
- **User feedback signals.** Thumbs-down rate, regeneration requests, session abandonment, all measured per cohort.

Automated rollback is not optional. Set explicit thresholds: if p99 latency rises by more than 40%, refusal rate jumps by more than 5%, or cost per request exceeds budget, route 100% back to production without human intervention. An on-call engineer should not be needed at 2am to fix a behavioral regression.

LaunchDarkly AI Configs (GA June 13, 2024) make this a runtime config change rather than a redeploy.[^7] Model ID, system prompt, and decoding parameters are JSON flag variations; a percentage rollout rule controls cohort assignment; Release Guardian initiates rollback automatically. Portkey supports the same pattern at the gateway layer.

## Instant rollback

Rollback is a deployment prerequisite, not a post-incident activity. The Anthropic Managed Agents cookbook lays out the model: every `agents.update()` produces an immutable version number; production callers pin to a specific version with `agent={"type": "agent", "id": AGENT_ID, "version": 1}`; rollback is re-pointing the production config to the previous version ID. No redeploy. No code change.[^8]

The rule from the cookbook: "production callers always pin to an explicit version, not the bare agent ID. New versions stay invisible until you promote one."[^8]

The bare agent ID is the new "edit prompt in dashboard." It's the same anti-pattern, automated through an API call. If your application code passes the bare ID, any `agents.update()` call by anyone with workspace access immediately affects all running sessions, with no review gate.

What standard rollback metrics miss: HTTP error rates, p99 latency, and exception counts cannot detect behavioral regressions. A sycophantic GPT-4o produced 200 OK at normal latency. The rollback signal must come from behavioral metrics: LLM judge scores per cohort, thumbs-down rate, refusal rate, output length distribution. This is why canary precedes rollback rather than replaces it: without the canary cohort to detect the regression, by the time you know about it, 100% of users are already affected.

Rollback readiness is a deployment checklist item:

- The previous version ID is recorded in the PR description.
- A runbook for re-pointing production to the previous version exists and is exercised in staging before the canary goes live.
- Behavioral metrics are configured to detect the regression.

## The pipeline

Stitched together, the pipeline for a prompt or model change looks like this:

1. **PR with prompt diff** triggers the fast eval CI gate (path-filtered, 50-200 examples, under 3 minutes, 95% threshold).
2. **PR review** with the eval result diff posted as a comment.
3. **Merge** promotes the prompt to a new immutable version.
4. **Shadow mode** for major changes (model version bumps, big prompt rewrites, schema changes).
5. **Canary at 1%** with user-sticky assignment and behavioral metrics dashboards.
6. **Ramp to 100%** if signals stay clean, with automated rollback thresholds active throughout.
7. **Rollback ready** at every stage: previous version ID known, runbook tested.

The dissent worth taking seriously, from Hamel Husain (who has taught 2,000+ engineers AI evals): not every change needs full discipline. An internal productivity tool may not need a canary; a customer-facing financial agent absolutely does. The cost of over-engineering is slower iteration; the cost of under-engineering is a production incident. Calibrate to stakes, but every change needs at minimum a versioned prompt and a tested rollback plan.[^9]

The two anti-patterns to watch for, beyond the obvious "edit prompt in dashboard":

- **SDK version bumps as silent model rollouts.** Upgrading `openai` 1.x.y to 1.x.z without running evals can ship a new default system prompt or token budget. The eval gate path filter `prompts/**` doesn't cover `pyproject.toml`. Add dependency manifests to the path filter, and tag eval runs with the SDK version.[^10]
- **Reward signal myopia.** The eval suite passes, the canary metrics look fine, but the model has been optimized for short-term thumbs-up rather than long-horizon satisfaction. This is what got GPT-4o. Include longitudinal metrics (multi-session retention, downstream task completion) in the eval design.

The discipline isn't expensive once it's wired up. The eval gate is one CI workflow file. Shadow routing is one async helper. Canary assignment is one hash function. The cost of *not* having any of this is something like four days of rollback exposure to half a billion users. The math isn't close.

## References

[^1]: OpenAI, "Sycophancy in GPT-4o: what happened and what we're doing about it", April 29, 2025, https://openai.com/index/sycophancy-in-gpt-4o/
[^2]: Han Lee, "When Prompt Deployment Goes Wrong: MLOps Lessons from ChatGPT's Sycophantic Rollback", mlops.community, May 6, 2025, https://home.mlops.community/en/public/blogs/when-prompt-deployment-goes-wrong-mlops-lessons-from-chatgpts-sycophantic-rollback
[^3]: Tian Pan, "Releasing AI Features Without Breaking Production: Shadow Mode, Canary Deployments, and A/B Testing for LLMs", TianPan.co, April 2026, https://tianpan.co/blog/2026-04-09-llm-gradual-rollout-shadow-canary-ab-testing
[^4]: promptfoo, "CI/CD Integration for LLM Evaluation and Security", official documentation, June 2026, https://www.promptfoo.dev/docs/integrations/ci-cd/
[^5]: Tian Pan, "LLM Non-Determinism in Production Evaluations", TianPan.co, 2026 (cited in [^3])
[^6]: Alex Strick van Linschoten, "What 1,200 Production Deployments Reveal About LLMOps in 2025", ZenML, December 2025, https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025
[^7]: LaunchDarkly, "Introducing AI Model and AI Prompt Flags (GA)", June 13, 2024, https://launchdarkly.com/blog/introducing-ai-model--ai-prompt-flags/
[^8]: Anthropic, "Managed Agents tutorial: prompt versioning and rollback", Anthropic Cookbook, April 2026, https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback
[^9]: Hamel Husain, "AI Evals FAQ", hamel.dev, 2026, https://hamel.dev/blog/posts/evals-faq/
[^10]: Tian Pan, "The SDK Upgrade Tax: When a Dependency Bump Becomes a Model Deployment", TianPan.co, April 2026, https://tianpan.co/blog/2026-04-28-llm-sdk-upgrade-tax-prompt-behavior-eval-gate

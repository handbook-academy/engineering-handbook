---
title: "Experimentation"
description: "A/B testing AI features when variance is 2-5x higher than deterministic features, the treatment can drift mid-experiment, and 'no significant effect' usually means underpowered."
slug: 03-experimentation
part: 11
chapter: 3
difficulty: advanced
prerequisites:
  - part-4-eval-fundamentals/02-your-first-eval-set
  - part-8-evaluation-and-observability/05-online-evaluation-and-ab-testing
  - 02-ai-product-metrics
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Experimentation

The model team can show you ten qualitative wins side by side. The growth team runs the change as a two-week A/B test, gets p=0.31, and the readout says "no significant effect." Both teams are right.[^1] The experiment is wrong.

That mismatch happens because classical frequentist A/B math rests on two assumptions that hold for button-color tests but break for LLM features: per-user variance is small relative to the treatment effect, and each measurement is a roughly independent draw from the user's behavior distribution. LLM features violate both, and the practical consequence is that a standard sample-size calculator fed deterministic-feature variance returns a number that's wrong by 2-5x. The team needs that much more sample size or duration to reach the same statistical power.[^1]

This chapter is about how to design A/B tests for AI features that don't lie to you, how to read inconclusive results honestly, and when offline evals are enough vs. when you need a live experiment.

## Why LLM variance is structurally higher

A January 2026 study (12 LLMs, 10 prompts, N=12,000 outputs) gave the cleanest empirical decomposition: for output quality, prompts explain 36.43% of variance and model choice explains 40.94%. For output quantity, within-LLM sampling variance explains 33.70% on its own. The authors warn explicitly that "single-sample evaluations risk conflating sampling noise with genuine prompt or model effects."[^2] Even at temperature 0, nondeterminism persists because of provider batching, model snapshots, and matrix-multiplication ordering at the hardware level.[^3]

The implication is concrete. On a 64-case eval set, GPT-4 accuracy varied between 65% and 75% across consecutive identical runs back in 2023.[^4] An observed movement from 73% to 76% on that set is entirely inside the noise band of a single stochastic model. Comparing two prompt variants on the same 64-case set without multiple runs is unreliable, full stop.

Sample-size math makes the gap visible. Detecting a 3-point lift on an 82% baseline (alpha=0.05, power=0.80) takes roughly 2,400 examples per arm. A 5-point lift takes ~870. A 10-point lift takes ~210.[^1] A typical hand-curated eval set has 50-200 examples, which puts the minimum detectable effect at N=100 around 11-12 percentage points. A team that runs 100 examples and sees a 3-point improvement hasn't demonstrated anything statistical.

```python
import math
from scipy.stats import norm

def sample_size(p1, p2, alpha=0.05, power=0.80):
    z_a = norm.ppf(1 - alpha / 2)
    z_b = norm.ppf(power)
    var = p1 * (1 - p1) + p2 * (1 - p2)
    return math.ceil((z_a + z_b)**2 * var / (p1 - p2)**2)

def mde(n_per_arm, p_baseline, alpha=0.05, power=0.80):
    z_a = norm.ppf(1 - alpha / 2)
    z_b = norm.ppf(power)
    var = p_baseline * (1 - p_baseline)
    return (z_a + z_b) * math.sqrt(2 * var / n_per_arm)

# 3pp lift on 82% baseline: ~2,394 per arm
print(sample_size(0.82, 0.85))
# At N=100, you can only detect 11.4pp lifts
print(f"{mde(100, 0.82):.1%}")
```

## Designing the experiment

A prompt change, a model swap, a temperature adjustment, and a retrieval-config change are all legitimate A/B treatments, but only one at a time. If you change the prompt and the model simultaneously you can't attribute the outcome to either.[^5] Statsig's framework distinguishes three treatment types and recommends separate experiments for each: prompt variations, model selection, parameter changes.[^5]

The randomization unit should almost always be the user, not the session or the request. User-level randomization avoids the carryover where a user sees treatment on Monday and control on Wednesday and forms mixed expectations. Khan Academy randomizes at the chat thread level, accepting cross-thread inconsistency in exchange for more statistical power, but GrowthBook flags this as the exception, not the starting point: match the unit of randomization to the unit of experience.[^6] For B2B products where users share accounts, cluster randomization at the organization level is required, which drastically reduces effective N and demands careful power planning.

Pre-register the success metric, and pick from the right tier:

| Tier | Metric type | Why |
|---|---|---|
| 1 | Downstream business outcomes (conversion, renewal, completion) | Most trustworthy, hardest to game, lowest sensitivity |
| 2 | Behavioral proxies (acceptance rate, retry rate, copy rate) | Mid-sensitivity, reveals preference without explicit feedback |
| 3 | Quality ratings (thumbs, stars) | Self-selected sample, positivity bias, conflated failure modes |
| Guardrail | Safety floors (hallucination rate, toxicity, PII leakage) | Constraints to enforce, not metrics to optimize |

The Intercom case is the warning every team needs to hear. A prompt variant with a *lower* offline eval score produced *better* business A/B results. Pedro Tabacof, principal ML scientist at Intercom: "He spent some time tweaking the prompt to bring that metric back up, and then we launched the A/B test. The business numbers weren't great. Later I A/B tested the original version, the one with the lower eval score, and got better business results."[^6] Offline evals filter regressions; production data makes the call.

The mature pattern is a three-phase pipeline: offline evals to filter obvious regressions before any live exposure, live experiment starting at 1-5% with guardrail monitoring, and production monitoring after rollout because models drift over time even without explicit changes.[^6]

## Variance reduction earns its keep

CUPED (Controlled-experiment Using Pre-Experiment Data) subtracts the predictable component of post-experiment variance using a pre-experiment covariate. The variance reduction is `Var(Y) * (1 - rho^2)`, where rho is the correlation between pre- and post-period metrics for the same users. At rho = 0.7, typical for established engagement metrics, that's a 51% variance reduction, halving the required experiment duration.[^7]

```python
import statistics

def cuped_adjust(y_post, x_pre):
    mean_x = statistics.mean(x_pre)
    mean_y = statistics.mean(y_post)
    n = len(y_post)
    cov = sum((y_post[i] - mean_y) * (x_pre[i] - mean_x) for i in range(n)) / (n - 1)
    var_x = statistics.variance(x_pre)
    theta = cov / var_x
    y_adj = [y_post[i] - theta * (x_pre[i] - mean_x) for i in range(n)]
    reduction = 1 - statistics.variance(y_adj) / statistics.variance(y_post)
    return y_adj, reduction
```

CUPED has two requirements: at least 7-14 days of pre-experiment history per user, and a meaningful correlation (rho > 0.3 is worth applying). It doesn't help for new-user cohorts or for changes so substantial that past behavior no longer predicts future behavior. Tian Pan documents a case where CUPED moved a p-value from 0.116 (not significant) to 0.000 (clearly significant) with no change to sample size or effect size.[^7]

For ranking and retrieval features, interleaving is the other big lever. Airbnb's interleaving framework (built 2021) showed 50x sensitivity improvement vs. A/B for search ranking experiments, with 82% directional alignment between interleaving and corresponding A/B results.[^8] Use it as a fast first gate: if interleaving picks a clear winner, run an A/B for absolute effect size; if interleaving is inconclusive, iterate before the full A/B. The catch is that interleaving breaks for rankers that depend on set-level optimization, and it measures relative preference, not absolute business impact.

## Treatment drift, novelty, anchoring

Three biases hit AI A/B tests harder than deterministic ones.

**Treatment drift.** LLM providers update models continuously without versioning guarantees. Anthropic's August 2025 postmortem documented routing errors affecting up to 16% of Claude Sonnet 4 requests with no API change.[^9] GPT-4's code-execution direct rate dropped from 52% to 10% in the three months from March to June 2023 with no version change.[^9] If your control is "old prompt on model X" and the provider patches model X on day 4 of your 14-day experiment, the treatment is no longer what it was at randomization. Log the model version per inference call as a standard column. If a silent update lands asymmetrically across arms, discard the experiment.

**Novelty.** Every new AI surface generates elevated engagement in the first days because it's new, and AI features show more severe novelty than UI changes because the output varies per request. Research tracking users over eight months found that some AI features show significant usage *declines* over time after initially strong adoption.[^10] A two-week experiment is often entirely inside the novelty spike. Segment treatment effect by days-since-first-exposure; if lift is concentrated in days 1-3 and flat or negative by day 14, that's novelty, not signal.

**Anchoring.** When users first interact with an AI feature, they form a baseline expectation. Treatment users who happen to see a particularly fluent first response anchor to it and evaluate later responses against that high anchor; control users with a lower anchor perceive equivalent outputs more positively. Anchoring bias remained statistically significant in LLM experiments even with chain-of-thought prompting and explicit anti-anchoring instructions.[^10] Don't use within-subjects designs where users see both old and new outputs sequentially.

## Reading a null result honestly

Roughly one-third of all experiments come back non-significant.[^11] A p-value above 0.05 doesn't mean no effect. It means the data is consistent with no effect under the null. Three scenarios produce that same readout, and they require different actions:

1. **True null.** The treatment really produces no lift. Action: accept and don't ship.
2. **Underpowered.** The experiment ran with insufficient N to detect the lift the treatment actually produces. Action: check the confidence interval. If it includes both your target MDE and zero, you're underpowered. Extend or scale.
3. **Variance inflation.** The treatment has real lift but within-LLM variance masks it at current N. Action: apply CUPED, use paired analysis, or run a larger experiment.

The confidence interval is the tool that distinguishes them. A "no significant effect" with CI [-0.5%, +4.5%] is consistent with a 4-point improvement; you're underpowered. A "no significant effect" with CI [-0.2%, +0.3%] is strong evidence the treatment doesn't exceed 0.3 points; the null is plausible. Spotify's Confidence team makes the mechanism precise: a calculator that assumes a fixed-sample test while the actual analysis uses always-valid confidence sequences can underestimate required N by a third or more, producing a green checkmark from the calculator and an inconclusive readout from the analysis, with no indication that the two were never in agreement.[^12]

The peeking problem is real and easy to fall into. Checking a fixed-horizon test 20 times at nominal alpha=5% inflates the false-positive rate to roughly 40%.[^1] The fix is sequential testing (always-valid p-values, mSPRT, or O'Brien-Fleming boundaries) from the start, with the stopping rule documented before the experiment begins. O'Brien-Fleming boundaries add only a few percent to maximum required N versus a fixed-sample test, while always-valid confidence sequences need about 50% more observations for the same power.[^12] Pick your trade.

The post-hoc null checklist:

- Was randomization correct (sample-ratio mismatch check passed)?
- Was the metric instrumented before the experiment started, not retrofitted?
- Was N at least the planned target?
- Did the CI exclude the target MDE?

If all four are yes, the null is credible. If any are no, fix the instrumentation and re-run rather than re-interpreting the result.

## When offline evals are enough

Nextdoor's published case (December 2023) is the cleanest data point on offline-vs-production divergence for AI features. They A/B-tested ChatGPT-generated email subject lines against their rule-based baseline (first few words of the post). Raw ChatGPT produced only 56% of the baseline CTR despite generating "more informative" subject lines.[^13] The reason: the generated lines read as marketing copy, hurting authenticity. Their fix was a reward model trained on prior A/B click data, used to select among N ChatGPT-generated candidates. Final result: +1% sessions, +0.4% WAU, +1% ads revenue against the rule-based baseline.

The lesson is that a plausible-seeming quality improvement doesn't imply better business metrics, and offline evals can't tell you which is which.

The default rule: offline evals gate, production A/B ships. The exception is when traffic genuinely can't support an adequately powered A/B test, in which case you fall back to offline evals with explicit power analysis and honest uncertainty estimates, reporting the MDE you can detect rather than a "no effect" that you can't actually claim. Aggressive safety domains (medical, legal, financial) maintain higher offline bars before any live exposure, but production data still makes the final call. The teams that get this right treat offline evals as regression filters, not ship criteria.

## References

[^1]: Tian Pan, "Variance Eats the Experiment: Why A/B Power Math Breaks for LLM Features", April 2026. https://tianpan.co/blog/2026-04-27-ab-test-power-stochastic-features

[^2]: Haase et al., "Within-Model vs. Between-Prompt Variability in Large Language Models for Creative Tasks", arXiv:2601.21339, January 2026. https://arxiv.org/abs/2601.21339

[^3]: Nicholson, "Quantifying Non-Deterministic Drift in Large Language Models", arXiv:2601.19934, January 2026. https://arxiv.org/abs/2601.19934

[^4]: Anthropic, "A Statistical Approach to Model Evaluations", November 2024. https://anthropic.com/research/statistical-approach-to-model-evals

[^5]: Statsig, "Beyond Prompts: A Data-Driven Approach to LLM Optimization", March 2025. https://www.statsig.com/blog/beyond-prompts-llm-optimization

[^6]: Graham McNicoll, GrowthBook, "How to A/B Test AI Features", June 10, 2026. https://blog.growthbook.io/how-to-a-b-test-ai-a-practical-guide/

[^7]: Tian Pan, "A/B Testing AI Features When the Treatment Is Non-Deterministic", April 19, 2026. https://tianpan.co/blog/2026-04-19-ab-testing-llm-features-non-deterministic

[^8]: Airbnb Engineering, "Beyond A/B Test: Speeding Up Airbnb Search Ranking Experimentation through Interleaving", October 2022. https://medium.com/airbnb-engineering/beyond-a-b-test-speeding-up-airbnb-search-ranking-experimentation-through-interleaving-7087afa09c8e

[^9]: Chishti, Oyinloye, Li, "Test Before You Deploy: Governing Updates in the LLM Supply Chain", arXiv:2604.27789, April 2026. https://arxiv.org/html/2604.27789v1

[^10]: Tian Pan, "The AI A/B Test That Lied: Novelty, Carryover, and Anchoring Bias in LLM Experiments", May 7, 2026. https://tianpan.co/blog/2026-05-07-ai-ab-test-novelty-carryover-anchoring-bias

[^11]: Statsig, "Interpreting Non-Significant A/B Test Results", August 27, 2024. https://www.statsig.com/blog/interpreting-non-significant-ab-test-results

[^12]: Mårten Schultzberg, Spotify Confidence, "What Makes a Good Sample Size Calculator?", May 27, 2026. https://confidence.spotify.com/blog/good-sample-size-calculator

[^13]: Zeng et al., Nextdoor, "Let AI Entertain You: Increasing User Engagement with Generative AI and Rejection Sampling", arXiv:2312.12457, December 2023. https://arxiv.org/abs/2312.12457

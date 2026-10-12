---
title: "LLM-as-judge"
description: "Build a second-LLM judge you can trust: binary pass/fail over Likert, prompt patterns, and the human-agreement loop you must run before deploying it."
slug: 01-llm-as-judge
part: 8
chapter: 1
difficulty: intermediate
prerequisites:
  - part-4-eval-fundamentals/00-why-you-cant-ship-without-evals
  - part-4-eval-fundamentals/02-your-first-eval-set
  - part-4-eval-fundamentals/03-assertions-and-unit-tests
  - part-3-prompt-engineering/00-anatomy-of-a-production-prompt
tags: [llm, observability]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# LLM-as-judge

A team three months into shipping their support assistant has a dashboard with eight scores. Helpfulness 3.7. Tone 4.1. Accuracy 3.9. Clarity 4.0. Completeness 3.5. Safety 4.8. Persuasiveness 3.2. Empathy 3.8. The scores barely move week to week. Nobody can explain the difference between a 3 and a 4. The PM asks, "Did this prompt change make the product better?" and nobody can answer. The dashboard is a beautiful, expensive piece of theatre.

That dashboard is what a Likert-scale LLM-as-judge produces by default, and it's why most teams give up on judges within a quarter. The fix isn't a different model. It's a different question. Replace eight 1-to-5 scores with one binary critique that ships only after you've measured how often it agrees with a human you trust. That's the chapter.

An LLM-as-judge is just a second model call sitting outside your main pipeline. You hand it the input and the output, you describe what "good" looks like, and it returns a verdict. The appeal is scale. Once calibrated, a judge can grade thousands of traces a day in the time it takes a human reviewer to read three. The hazard is that a judge is a model judging a model. It can be wrong, biased, and confidently inconsistent in ways you'll never see unless you go looking. Deterministic checks from [assertions and unit tests for LLM output](../part-4-eval-fundamentals/03-assertions-and-unit-tests.md) catch what they can. The judge exists for everything else: tone, faithfulness to a source, did-this-actually-help, the failure modes that are real but don't fit a regex.

## Binary verdicts beat Likert scores

The first decision is what shape the verdict takes. The shape that fails in production is the 1-to-5 (or 1-to-10) Likert scale, and it fails for three concrete reasons documented across teams that have run it.

- **Annotators can't tell a 3 from a 4.** When two of your own engineers label the same response, one says 3 and the other says 4, and neither can articulate the difference. The judge inherits the same fuzziness. Hamel Husain, working with 30+ companies on judge eval design through 2024, found this disagreement is universal and unfixable without collapsing the scale.[^1]
- **The number isn't actionable.** A 3 doesn't tell you what to fix. A "fail" with a written critique tells you exactly what to fix.
- **Eight scores across eight dimensions is metric sprawl.** The team in the opener has eight numbers nobody trusts. One binary number, well-validated, is worth more than eight fuzzy ones.

The replacement is a single binary question framed around the actual product outcome. Not "rate the helpfulness 1-5", but "did the assistant resolve the user's issue, yes or no?" The judge returns `pass` or `fail` plus a one-paragraph rationale. Cohen's kappa against a human becomes computable; pass rates become trackable; regressions become visible.

Two exceptions earn an escape hatch. First, when you genuinely need to rank N candidates against each other (RLHF data collection, A/B testing where "better" matters more than "acceptable"), pairwise comparison ("is A better than B?") is the right primitive, also binary. Second, when ordinal ranking is the actual product (a re-ranker, a recommender), G-Eval-style scoring with token probabilities can survive, but you'll still validate against human labels the same way.[^2] Outside those two, default to binary pass/fail.[^3]

## Anatomy of a judge prompt

A judge prompt that works has five parts, and skipping any of them costs you agreement points you'll later have to claw back through iteration.

1. **A role declaration.** "You are an expert evaluator." Plain, not flowery. The role anchors the model's persona before it sees the criteria.
2. **One precisely-stated criterion.** Not eight. The single property the domain expert cares about most: "Did the SQL query answer the user's natural-language question correctly?" If you can't pick one, you don't yet understand what you're evaluating.
3. **Few-shot examples with critiques.** Four to eight examples covering both passes and fails, each with a written rationale. The critique is the load-bearing part. It's not decoration; it's how the judge learns to generalize. Skimping on critiques is the single most common reason judges plateau at 70% agreement.
4. **A chain-of-thought instruction.** "Reason step by step before rendering a verdict." The Zheng et al. study at NeurIPS 2023 found that adding a chain-of-thought prompt with a reference answer dropped GPT-4's failure rate on math grading from 70% (14 of 20 cases) to 15% (3 of 20).[^4] Reason-then-verdict is the floor; verdict-only is the ceiling on what your judge can do.
5. **A structured output format.** JSON with two keys: `rationale` (string) and `verdict` (`"pass"` or `"fail"`). Parse it, store both, and let your dashboards aggregate the verdicts while engineers read the rationales when something looks off.

Here's the builder, sharp enough to copy into a project:

```python
import json

def build_judge_prompt(
    criteria: str,
    examples: list[dict],
    input_text: str,
    output_text: str,
) -> list[dict]:
    """Binary pass/fail judge with CoT rationale and few-shot critiques."""
    system = (
        "You are an expert evaluator. For each interaction, reason step by "
        "step, then output a JSON object with keys 'rationale' (string) and "
        f"'verdict' (either 'pass' or 'fail'). Criteria: {criteria}"
    )
    messages = [{"role": "system", "content": system}]
    for ex in examples:
        messages.append({
            "role": "user",
            "content": f"Input: {ex['input']}\nOutput: {ex['output']}",
        })
        messages.append({
            "role": "assistant",
            "content": json.dumps({
                "rationale": ex["rationale"],
                "verdict": ex["verdict"],
            }),
        })
    messages.append({
        "role": "user",
        "content": f"Input: {input_text}\nOutput: {output_text}",
    })
    return messages
```

Two practical notes on the model. Use the strongest judge you can afford, even if it's stronger than your application model; Husain's rule is "use the most powerful model I can afford in my cost/latency budget", and that budget is independent of your primary model.[^1] Below 7B parameters, open-source judges fail to produce parseable JSON consistently, which makes them unusable in CI. And don't fret about self-preference bias when the judge model and the application model are the same family: it exists (GPT-4 favored itself by 10% over human raters in the LMSYS study), but it's small enough that high human agreement papers over it.[^4] The biases that actually bite, position bias and verbosity bias, get their own treatment in [judge failure modes](./02-judge-failure-modes.md); the short version is run pairwise calls twice with positions swapped, and tell the judge in plain English not to favor longer answers.

## The validation loop is the chapter

A judge you haven't validated against a human is not a judge. It's an opinion generator with a confidence problem. The loop that turns the first into the second is small enough to fit on a whiteboard and rigorous enough to publish: collect a sample, label it by hand, run the judge on the same sample, measure agreement, refine the prompt, repeat until you can deploy.

![A five-node circular loop showing the iterative process of validating an LLM judge against a human expert: collect a sample of 30-200 interactions, expert labels them pass/fail with critiques, run the LLM judge on the same sample, compute Cohen's kappa and percent agreement, then either refine the judge prompt and loop back or exit to deployment when agreement crosses the threshold.](images/01-validation-loop.png)
*The validation loop. You stay in the cycle until agreement is high enough for the stakes; for Honeycomb's Query Assistant, that took three iterations to reach over 90% agreement. The loop never fully ends, model swaps, prompt changes, and user behavior drift all send you back to step one.*

**Step 1: collect 30 to 200 traces.** Pull from real production traffic if you have it; from synthetic prompts run through your application if you don't. Stratify so the sample looks like the distribution you actually serve, not a curated greatest-hits set. Husain's operational floor is 30; you're done collecting when you've stopped seeing new failure modes in the labels.[^1]

**Step 2: have the principal domain expert label every example.** Pass or fail, plus a one-to-three sentence critique explaining why. Not a junior reviewer, not a crowd. The person whose taste defines the product. The critiques are doing two jobs: they become the ground truth for the judge, and they double as your future few-shot examples. If the expert struggles to write the critiques, the criteria themselves aren't yet clear, which is the moment to discover it rather than three weeks into deployment.

**Step 3: run the judge on the same sample.** Same inputs, same outputs, same prompt. Save both the verdict and the rationale.

**Step 4: measure agreement.** Two numbers, not one.

```python
from collections import Counter

def percent_agreement(human: list[str], judge: list[str]) -> float:
    """Fraction of items where human and judge agree."""
    assert len(human) == len(judge)
    return sum(h == j for h, j in zip(human, judge)) / len(human)

def cohen_kappa(human: list[str], judge: list[str]) -> float:
    """Agreement adjusted for chance. kappa = (p_o - p_e) / (1 - p_e)."""
    assert len(human) == len(judge)
    n = len(human)
    classes = list(set(human) | set(judge))
    p_o = percent_agreement(human, judge)
    h_counts = Counter(human)
    j_counts = Counter(judge)
    p_e = sum((h_counts[c] / n) * (j_counts[c] / n) for c in classes)
    return 1.0 if p_e == 1.0 else (p_o - p_e) / (1 - p_e)
```

Percent agreement is what you report to stakeholders. Cohen's kappa is what tells you the truth. Kappa adjusts for chance: if 90% of your outputs pass, a judge that always says "pass" gets 90% raw agreement and a kappa near zero. Eugene Yan's 2024 survey of judge papers cites a real example where a llama-3-8b judge hit 80% agreement with humans but only 0.62 kappa, meaning it was barely better than guessing on the failure cases that actually matter.[^2] Use the Landis-Koch convention for kappa: 0.41 to 0.60 is moderate, 0.61 to 0.80 is substantial, above 0.80 is almost perfect.

**Step 5: read the disagreements.** Where human said pass and judge said fail (or vice versa), look at the rationale. Is the judge missing context the criteria don't mention? Is the human applying a standard the criteria don't capture? Both happen, often in the same iteration. Shankar et al. at UIST 2024 named this *criteria drift*: the act of grading examples is itself how the expert sharpens what "good" means, so the criteria you wrote in iteration one will be wrong by iteration two, and that's not a bug.[^5] Update the criteria. Update the few-shot examples. Run again.

## When is the judge ready to deploy?

There's no universal threshold, and anyone who quotes you one is selling something. The honest version is a floor and a ceiling pinned to the stakes of your system.

The floor: don't deploy a judge whose Cohen's kappa against your expert is below 0.6. That's the Landis-Koch boundary between moderate and substantial agreement, and below it the judge is too unreliable to trust as a primary signal. For most production work, target around 0.6 to 0.8 kappa, or roughly 80% to 90% raw agreement on a balanced binary task.

The ceiling: be realistic about what's achievable. Thakur et al., evaluating GPT-4 against humans on TriviaQA in 2024, measured GPT-4's kappa at 0.84, LLaMA-3-70B at 0.79, against a human-human kappa of 0.97 on the same task.[^6] Even on a task where the right answer is unambiguous and a reference exists, the best API-scale judge sits a hair below human-human agreement. On subjective tasks (helpfulness, tone, coherence) the gap is wider. Waiting for kappa above 0.95 will keep you out of production indefinitely.

A working rubric:

| Use case | Target kappa | Notes |
|---|---|---|
| Internal dashboards, batch eval | > 0.6 | Good enough to track relative changes between prompt versions. |
| Production monitoring of customer-facing app | > 0.7 | Aim for around 90% percent agreement; Honeycomb's Query Assistant hit this in three iterations.[^1] |
| High-stakes domains (medical, legal, financial) | > 0.8 | And keep human review in the loop indefinitely. The judge augments, never replaces. |

When you cross your threshold, the judge ships, but the loop never fully closes. A new model snapshot, a prompt change in your application, a shift in user behavior: all three invalidate the calibration. Re-measure on a fresh sample every quarter, every model swap, and every time the judge's pass rate makes a sudden move that the application didn't earn.

## When not to use a judge at all

A judge is the wrong tool when something cheaper does the same job. If you can express the property as a regex, a JSON schema, a SQL parse, or a unit test, do that instead. Code assertions are deterministic, free, and run in milliseconds; judges are probabilistic, cost real money per call, and run in seconds. The pyramid in [assertions and unit tests for LLM output](../part-4-eval-fundamentals/03-assertions-and-unit-tests.md) catches everything you can write down. The judge is for what's left over: tone, faithfulness, did-the-user-actually-get-what-they-asked-for. The failure modes that matter and don't fit a regex.

A judge is also the wrong tool inline. Judges add a full LLM round-trip of latency to every request, which is fine on an async eval pipeline and unacceptable on a user-facing path. Run judges out-of-band, on sampled production traces, with their results flowing into your dashboards and alerting. The applied-llms.org collective (Husain, Yan, Liu, Shankar, and others summarizing a year of production lessons across companies in June 2024) put it bluntly: LLM-as-judge isn't a silver bullet, and it's especially weak inline, on tasks needing precise numeric verification, or when you have no domain expert to validate against.[^3] Off-the-shelf metrics from frameworks (DeepEval's general "answer relevancy", Ragas's "faithfulness") are useful as a starting baseline, but they're evaluating general properties, not your product's success criteria. They can't replace the validation loop. They can, at best, be the starting prompt that you then validate against your own human labels and iterate from there.

The judge that earns its place in your stack is the one you built, validated, and re-validate. Not the one a framework gave you out of the box.

At architecture scale, [the eval and observability pipeline](../../hld/part-9-ai-ml-system-design/05-llm-evaluation-observability.md) covers how the judge plugs into trace storage, async scorer workers, and the annotation queue your domain expert lives in.

## References

[^1]: Hamel Husain, "Creating an LLM-as-a-Judge That Drives Business Results," hamelhusain.substack.com, October 29, 2024, https://hamelhusain.substack.com/p/llm-judge
[^2]: Eugene Yan, "Evaluating the Effectiveness of LLM-Evaluators (aka LLM-as-Judge)," eugeneyan.com, August 2024, https://eugeneyan.com/writing/llm-evaluators/
[^3]: Bryan Bischof, Hamel Husain, Charles Frye, Jason Liu, Shreya Shankar, et al., "What We've Learned From a Year of Building with LLMs," applied-llms.org, June 2024, https://applied-llms.org/
[^4]: Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena," NeurIPS 2023 Datasets and Benchmarks Track, https://arxiv.org/abs/2306.05685
[^5]: Shreya Shankar, J. D. Zamfirescu-Pereira, Bjorn Hartmann, Aditya G. Parameswaran, Ian Arawjo, "Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences," UIST 2024, https://arxiv.org/abs/2404.12272
[^6]: Aman Singh Thakur, Kartik Choudhary, Venkat Srinik Ramayapally, Sankaran Vaidyanathan, Dieuwke Hupkes, "Judging the Judges: Evaluating Alignment and Vulnerabilities in LLMs-as-Judges," arXiv:2406.12624, June 2024, https://arxiv.org/abs/2406.12624


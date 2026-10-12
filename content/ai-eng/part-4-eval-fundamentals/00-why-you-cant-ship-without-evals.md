---
title: "Why you can't ship without evals"
description: "The vibes-driven failure mode, evals as the AI engineer's CI, and the maturity ladder that gets you off the whack-a-mole loop."
slug: 00-why-you-cant-ship-without-evals
part: 4
chapter: 0
difficulty: beginner
prerequisites:
  - part-0-start-here/02-thinking-in-probabilistic-systems
  - part-2-working-with-model-apis/00-calling-models
  - part-3-prompt-engineering/00-anatomy-of-a-production-prompt
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Why you can't ship without evals

In March 2024, Hamel Husain published a postmortem of Lucy, the conversational AI assistant Rechat had built for real estate professionals. Lucy worked in demos. In production, the team hit a wall. They'd fix one failure mode and another would surface; they'd add instructions to the system prompt and the prompt would balloon into something nobody fully understood. The phrase Husain used was "a game of whack-a-mole." The diagnosis was simpler: "limited visibility into the AI system's effectiveness across tasks beyond vibe checks."[^1]

That's the failure mode this chapter is about. It has a name now, "vibes-driven development," and it's the single most common reason LLM products stall after the demo. The fix is also named, and it's borrowed straight from regular software engineering: write tests, run them on every change, block deploys when they fail. We call those tests *evals*, and the rest of Part 4 is about how to build them. This chapter is about why you can't postpone them.

## The whack-a-mole loop is structural, not incompetence

The Rechat team wasn't sloppy. They were running into the default state of every LLM product without an eval suite. Four mechanisms compound, and any one of them is enough to ship a regression nobody catches.

The first is **demo selection bias.** A developer tests the prompts they wrote, plus the ones users showed them during onboarding. Those prompts are nothing like the production distribution. The demo works because it was selected to work.

The second is **silent model drift.** API providers update the model behind an endpoint without changing the API signature. OpenAI's gpt-3.5-turbo was updated at least twice in 2023 with no client-visible signal. Wanqin Ma and colleagues measured ten such update pairs and found that 58.8% of prompt-and-model combinations dropped accuracy after the update, and 70.2% of those drops exceeded 5 percentage points (as of February 2024).[^2] The bracing detail: 63.8% of individual regressions happened on inputs where the previous model was highly confident. The breaks weren't at the decision boundary; they were spread across the distribution. Without a regression suite, every one of those breaks ships invisibly.

The third is **whack-a-mole prompt engineering.** LLMs don't have isolated instruction channels. Every line you add to a system prompt to fix one failure mode reshapes the output distribution everywhere else. With no measurement, you're guessing whether the fix helped overall or just shifted the failures somewhere you weren't looking. Rechat's prompts grew "long and unwieldy, attempting to cover numerous edge cases" precisely because nobody could confirm the additions were a net win.[^1]

The fourth is **no regression floor.** There's no baseline to roll back to, no number to defend, no signal that today's deploy is better or worse than last week's. The team finds out something broke when users say so.

Shreya Shankar's CSCW 2024 ethnography of 18 ML engineers running production pipelines crystallized the result in one line that became the title of the paper: "We have no idea how models will behave in production until production."[^3] That's the state evals exist to fix.

## Evals are the AI engineer's CI

Continuous integration in regular software does three things: it maintains a test suite that defines correct behavior, it runs the suite on every change, and it blocks merges that fail. The eval-as-CI pattern carries the same shape over to LLM systems. An **eval suite** is a curated set of input-and-expected-behavior pairs plus grading logic. It runs on every pull request that touches a prompt, a model version, a retrieval component, or a pipeline knob. A failed eval blocks deployment, the same way a failed unit test does.

Anthropic's engineering team made the parallel explicit in January 2026: automated evals "can be run on every commit" and form "the first line of defense against quality problems." Teams with a working eval suite assess and adopt a new model in days; teams without one face weeks of manual testing per upgrade.[^4]

![A two-column illustration contrasting a closed loop labeled vibes-driven on the left, where Ship to users feeds User complaints feeds Fix one thing feeds Break another thing and arrows back to User complaints, with an open directed cycle on the right labeled eval-driven, where Code change feeds Eval suite CI feeds Green or Red gate feeds Production monitor feeds back New test cases into the eval suite, with one coral arrow on the right marking the failures-become-tests feedback loop](images/00-vibes-vs-evals.png)
*The vibes-driven side is a loop with no exit; the eval-driven side is a directed cycle where every production failure becomes a permanent test case.*

A production setup splits the suite in two. **Regression evals** test behaviors that already work; they should pass at close to 100%, and a drop signals something broke. **Capability evals** test behaviors the system isn't yet good at; they start at a low pass rate and exist to track improvement. When a capability eval graduates to a high pass rate, you promote it into the regression suite so the gain becomes a floor.[^4]

The simplest possible CI gate is a script that loads a JSONL test set, runs it through your model, and exits non-zero when the pass rate drops below a threshold. That's all CI needs to fail a build:

```python
import json
import sys
from typing import Callable

def regression_gate(
    dataset_path: str,
    eval_fn: Callable[[dict], bool],
    threshold: float = 0.95,
) -> None:
    with open(dataset_path) as f:
        cases = json.load(f)

    passed = sum(1 for c in cases if eval_fn(c))
    rate = passed / len(cases)
    print(f"Regression: {passed}/{len(cases)} passed ({rate:.1%})")

    if rate < threshold:
        print(f"FAIL: {rate:.1%} below threshold {threshold:.1%}")
        sys.exit(1)
    print("PASS: regression suite within bounds.")
```

The 95% threshold is intentionally below 100% because LLM calls at temperature greater than zero aren't deterministic; the threshold itself is a product decision. The non-zero exit is what makes it CI: GitHub Actions, GitLab pipelines, and every other runner treat that as a failed step and block the merge.

## The eval-maturity ladder

You don't build the whole system on day one, and you shouldn't try. The progression has stages, and the order matters because each stage depends on the one below it.

**Rung one: trace logging.** Before any evaluation is possible, you need to be able to replay what happened. Log every LLM call: timestamp, pinned model version, full prompt, response, latency, any tool calls and their results, a hashed user id, a session id. If you can't reconstruct what the model received and produced for a given user complaint, you can't grade it, and no eval framework on top will save you. Husain's first concrete step in the Rechat playbook was building a Shiny annotation tool over the trace store; everything else followed.[^1]

**Rung two: assertion-based unit tests.** Cheap, fast, deterministic. Regex checks, schema validation, structural assertions like "the response never contains a UUID" or "the JSON parses." These run in milliseconds, cost nothing, and catch the loudest class of failures. Rechat ran "hundreds" of them.[^1] Five to twenty is enough to start; you add more as new failure modes show up in production traces.

```python
import re
from dataclasses import dataclass
from typing import Callable

@dataclass
class EvalCase:
    input_text: str
    assertions: list[Callable[[str], bool]]

UUID_PATTERN = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    re.IGNORECASE,
)

def no_uuid_in_response(response: str) -> bool:
    return len(UUID_PATTERN.findall(response)) == 0

def run_assertions(cases: list[EvalCase], model_fn: Callable[[str], str]) -> float:
    passed = 0
    for case in cases:
        response = model_fn(case.input_text)
        if all(a(response) for a in case.assertions):
            passed += 1
    return passed / len(cases)
```

The UUID assertion is the canonical Rechat example: Lucy was leaking internal listing IDs into user-facing responses, and a one-line regex caught every regression of that bug forever.[^1]

**Rung three: LLM-as-judge.** Many failures aren't structural. "The response was rude," "the answer hallucinated a date," "the tone shifted toward marketing copy" can't be regexed. You hand the response to a stronger model with a prompt that asks for a binary verdict and a one-sentence critique. Use binary labels, not Likert scales; binary forces clearer thinking and produces sharper inter-annotator agreement.[^5] You'll need at least 100 human-labeled examples to calibrate the judge, because LLM judges have biases (they prefer longer responses, fluent text, and outputs that match their own style). If the judge's true-positive and true-negative rates against your human labels drop below roughly 0.80, the judge is the problem and you revise its prompt or switch judge models.

**Rung four: A/B testing in production.** Real users, real outcomes, statistical significance. The metric is behavioral: task completion, retention, the support-ticket rate. This is the only rung that tells you whether quality wins translated into user wins, and it's also the slowest and most expensive: days to weeks per experiment, and only meaningful when traffic volume can clear the noise floor.[^4]

The temptation, especially for teams who've heard of LLM-as-judge before they've heard of error analysis, is to skip rungs. Don't. A judge built before you've done error analysis on real traces tends to grade the wrong things; an A/B test run before your regression suite is green just measures noise. Husain's field number from teaching over 2,000 engineers and PMs is blunt: 60% to 80% of AI product development time should go to error analysis and evaluation (as of January 2026).[^5] If you're spending less than that, you're shipping vibes.

## The discipline starts before the first user

The argument people lose most often, including teams who know all of the above, is the timing one. "We'll add evals later, after the demo works." Later is already too late. By the time you have enough production failures to know what to test, you've burned the trust of the early users who hit them, and you have no baseline from before the regressions to compare against. Anthropic's own Claude Code team retrofitted evals after launching on vibes-and-feedback, and they describe it explicitly as the harder path; they got there, but they spent more to get there than a team starting with evals from day one would have.[^4]

The minimum viable bar is small. 20 to 50 examples drawn from real anticipated failures, plus 5 to 10 assertion-based unit tests, plus a CI step that runs them on every prompt change, is enough to ship a feature to a small set of real users.[^4] You can build it in an afternoon. What you cannot do is keep deferring it, because the silent-update problem doesn't wait for your roadmap. The next time your provider rotates the model behind an endpoint, you find out one of two ways: from your CI in minutes, or from your users in weeks. The discipline is what decides which.

At architecture scale, [Observability for AI Systems](../../hld/part-9-ai-ml-system-design/05-llm-evaluation-observability.md) covers the whiteboard view of trace instrumentation that this chapter assumes you have. The how of building each rung lives in the rest of Part 4: [Look at your data](./01-look-at-your-data.md) for figuring out what to test, [Your first eval set](./02-your-first-eval-set.md) for the labeled-set discipline, [Assertions and unit tests](./03-assertions-and-unit-tests.md) for the structural layer, and [LLM-as-judge](../part-8-evaluation-and-observability/01-llm-as-judge.md) for the semantic layer.

## References

[^1]: Hamel Husain, "Your AI Product Needs Evals," Hamel's Substack, March 29, 2024. https://hamelhusain.substack.com/p/evals
[^2]: Wanqin Ma, Chenyang Yang, Christian Kastner, "(Why) Is My Prompt Getting Worse? Rethinking Regression Testing for Evolving LLM APIs," Conference on AI Engineering (CAIN 2024), April 2024. arXiv:2311.11123. https://arxiv.org/abs/2311.11123
[^3]: Shreya Shankar, Rolando Garcia, Joseph M. Hellerstein, Aditya G. Parameswaran, "'We Have No Idea How Models will Behave in Production until Production': How Engineers Operationalize Machine Learning," ACM CSCW 2024. https://arxiv.org/abs/2403.16795
[^4]: Mikaela Grace, Jeremy Hadfield, Rodrigo Olivares, Jiri De Jonghe, "Demystifying Evals for AI Agents," Anthropic Engineering Blog, January 9, 2026. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
[^5]: Hamel Husain and Shreya Shankar, "LLM Evals: Everything You Need to Know," hamel.dev, January 15, 2026. https://hamel.dev/blog/posts/evals-faq


---
title: "The eval taxonomy"
description: "Four axes that decide which kind of evaluation answers your question: offline vs online, component vs end-to-end, reference-based vs reference-free, automatic vs judge vs human."
slug: 00-the-eval-taxonomy
part: 8
chapter: 0
difficulty: intermediate
prerequisites:
  - part-4-eval-fundamentals/00-why-you-cant-ship-without-evals
  - part-4-eval-fundamentals/03-assertions-and-unit-tests
  - part-6-retrieval-augmented-generation/00-when-you-actually-need-rag
tags: [llm, observability]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# The eval taxonomy

People say "we need evals" the way they say "we need monitoring," as if it's one thing. It isn't. An eval that tells you whether a prompt change is safe to merge looks nothing like an eval that tells you your retriever silently broke last Tuesday, and neither looks like the eval that tells you whether real users got their actual job done.

Four questions, four different tools. Pick the wrong one and you'll measure the wrong thing at high precision and conclude the system is fine while it's quietly on fire. The taxonomy is just four axes that name the choice each time. Two minutes of map reading saves weeks of building the wrong infrastructure.

The four axes are independent. You combine them per use case:

- **Offline or online.** Am I testing before deploy, or watching live traffic?
- **Component or end-to-end.** Am I scoring one stage of the pipeline, or the final output?
- **Reference-based or reference-free.** Do I have a gold answer to compare against, or not?
- **Automatic, judge, or human.** Who's grading?

The rest of the chapter walks each axis with the rule that decides it, then shows how a real eval setup mixes all four.

## Offline vs online: am I testing, or watching?

Offline evals run before deploy, against a curated dataset you control. Inputs are fixed, runs are reproducible, and you can rerun the suite a hundred times on a laptop. This is the world of CI: a regression suite gates merges, a benchmark dataset compares two prompts, a backtest replays last month's traces against today's code.

Online evals run against live production traffic, either synchronously in the request path (a guardrail that blocks a bad output) or asynchronously on sampled traces (a monitor that flags regressions). There's usually no gold answer, because nobody wrote one for this user's question. You measure with reference-free signals: a judge model, a thumbs-down rate, an abandoned session.

Neither replaces the other. They answer different questions:

- **Offline** answers *"is this change safe to ship?"* Fast, cheap, repeatable. Misses everything outside your dataset.
- **Online** answers *"is the live system still good?"* Captures the real distribution and novel failures. No ground truth, so it depends on judges or proxy signals you have to trust.

The default rule: **offline first, online when users are real.** Build a small CI eval set during development (Hamel Husain and Shreya Shankar suggest a hundred-plus examples as a meaningful CI minimum, as of January 2026[^1]). Add online evals once production traffic is flowing and you need to detect drift the offline set won't see, like a model rotation behind your provider's endpoint or a new query pattern.

The trap is treating them as separate systems. They're a loop. A production failure spotted by your online monitor goes into the offline dataset as a new regression case, and the next CI run protects against that exact failure forever. If your offline set never grows from production data, it's a museum.

## Component vs end-to-end: where am I pointing the eval?

End-to-end evals treat the system as a black box. You send an input, score the final output. Done.

Component evals target one subsystem in isolation: just the retriever in a RAG pipeline, just the tool-selection step of an agent, just the summarizer in a multi-stage workflow. The retriever gets information-retrieval metrics like Recall@k against a labeled query-document set. The generator gets faithfulness checks. The tool-selector gets accuracy on a labeled "which tool would you call here" set.

End-to-end is simpler. It also masks the most common RAG failure on the planet: the retriever returns irrelevant documents, the generator fluently invents a plausible answer anyway, and your end-to-end score holds steady while retrieval quietly degrades. The generator is trained to sound confident regardless of what's in the context window. It will cover for a broken retriever every time.

That's why component evals exist. Jason Liu's "There Are Only 6 RAG Evals" framework (May 2025) decomposes the problem into three relationships you can measure independently: context given query (is retrieval finding the right stuff?), answer given context (is the model staying inside the context?), and answer given query (does the answer address the original question?).[^2] If end-to-end drops, the three component scores tell you which stage broke.

The default rule: **end-to-end first to set a quality baseline, component evals when error analysis points at a specific stage.** The exception is RAG specifically, where retrieval failures are statistically so common that many practitioners invert the rule and start with retriever metrics. If your system has a retriever, instrument [Recall@k from day one](../part-6-retrieval-augmented-generation/07-evaluating-retrieval.md); skipping it just delays the eventual debugging.

For agents, the layered version is end-to-end task success first ("did the agent finish the user's job?"), then step-level diagnostics on failing trajectories: which tool call, which parameter extraction, which state transition went wrong.[^1] Each of those is its own component eval.

## Reference-based vs reference-free: do I have a gold answer?

Reference-based evals compare the model's output to a known-correct answer. Exact match for classification. ROUGE or BLEU for lexical overlap. Learned metrics like BERTScore or COMET for semantic similarity. The advantage is that the score is deterministic and cheap once the references exist.

Reference-free evals score without a gold answer. The mechanism is either a judge model that reads the question and the response and decides quality, a self-consistency check (does the model agree with itself across runs?), or a domain-specific assertion (does the response include the customer's order number?).

The catch with reference-based evals for open-ended LLM output is that "the reference" is a fiction. Eugene Yan documented three structural problems with reference-based metrics for summarization in March 2024: the references themselves are a labeling bottleneck, they may be lower quality than what the model produces (Fabbri et al. 2021 and Zhang et al. 2024 both found generated summaries beating CNN/DailyMail reference summaries), and the variance across acceptable answers is wide enough that good and bad outputs land in overlapping score ranges.[^3] In WMT23, four of the top seven translation metrics were reference-free, which tells you which way the field is moving.[^3]

Husain is blunter. Generic reference-based metrics like BERTScore, ROUGE, and cosine similarity "are not useful for evaluating LLM outputs in most AI applications," with one exception: search and retrieval, where cosine similarity does measure something meaningful.[^1]

The decision rule is narrower than it looks:

- **Reference-based** when the answer is bounded: classification, extraction, math, code that compiles, SQL that returns rows. The reference is the truth and exact match is the eval.
- **Reference-free** when the output is open-ended (summaries, dialogue, agent trajectories) or when the reference would be lower quality than the model.

There's a third option people forget: even open-ended tasks often have *deterministic constraints* you can codify directly. "The reply must include the customer's order number." "The JSON must validate against this schema." "The code must pass these unit tests." That's not a reference and it's not a judge; it's an assertion, and it beats both. If you can write the rule, write the rule.

## Automatic, judge, or human: who's grading?

This is the axis with the steepest cost gradient and the most ways to go wrong.

**Automatic** evals are deterministic code. Regex, JSON schema validators, exact-match comparators, code-execution checks. They run in milliseconds, cost effectively zero per eval, and they're 100% reproducible. They're the right default for anything you can express as a boolean predicate on output structure or content.

**LLM-as-judge** uses a model to grade. You write a prompt describing the criterion, hand it the question and the response (and optionally a reference), and ask for a verdict. Lianmin Zheng et al.'s MT-Bench paper (NeurIPS 2023) is the empirical anchor for the technique: GPT-4 reaches over 80% agreement with human experts on multi-turn open-ended questions, matching the 81% human-human agreement rate.[^4] That result is why every modern eval platform ships a judge tier. OpenAI's Graders API (2025) formalizes it as four grader types: `string_check`, `text_similarity`, `score_model` (the LLM-as-judge), and a Python grader for arbitrary domain logic.[^5]

**Human** evaluation is the gold standard and the calibration anchor for everything else. A domain expert reads the trace, brings tacit knowledge no automated grader can articulate, and defines what "good" actually means for the business. Husain's recommendation is to appoint a "benevolent dictator" (one expert who makes all the calls) rather than averaging across crowd workers whose disagreements add noise.[^1] The cost is the obvious problem: roughly $1 per label for a domain expert versus around $0.08 for a crowd worker and under $0.003 for an LLM-generated label (single-source estimate, April 2026).[^6]

The cost difference matters because it forces a layering decision.

![A vertical ladder showing five eval techniques arranged from cheapest at the bottom to most expensive at the top: assertion at the bottom, then text-match grader, then LLM-as-judge, then human review, with A/B test at the top, with a small engineer figure standing on the LLM-as-judge rung, and an arrow pointing up labeled signal fidelity and an arrow pointing down labeled speed, with a column of growing coin stacks beside the ladder showing rising cost](images/00-the-eval-cost-ladder.png)
*The cost ladder forces the order: cheap evaluators first, expensive ones only for failure modes the cheap ones can't catch.*

The order on the ladder is also the order to build. Start with assertions. Add a judge for failure modes you can't express as boolean predicates. Reserve human review for calibrating the judge and for high-stakes calls. A/B testing only when you need to know if a quality win moved a real user metric.

The judge tier is where this axis gets dangerous, because a judge feels like an automatic eval but behaves like an unreliable human. Zheng et al. measured three biases that trip every team that doesn't check for them. Position bias: Claude-v1 favors the first response in pairwise comparisons 75% of the time; GPT-4 is consistent across position swaps only 65% of the time on similar-quality pairs (June 2023).[^4] Verbosity bias: GPT-3.5 and Claude-v1 both fail a "repetitive list" attack 91.3% of the time, preferring a padded longer response over a concise correct one.[^4] Self-enhancement bias: GPT-4 favors its own outputs by roughly 10 percentage points of win rate compared to human assessment.[^4]

The mitigations are mechanical. Run every pairwise eval in both orderings and only count a win when the same response is preferred both ways. Prefer binary pass/fail over Likert scales, which forces clearer criteria and detects regressions on smaller samples.[^1] And before you trust a judge, validate it against at least 100 human-labeled examples and measure its true-positive and true-negative rates. If both are below roughly 80%, fix the prompt or switch judge models.[^1]

A judge prompt that fits this rule is short, returns JSON, and demands a binary verdict:

```python
import json

def build_judge_prompt(question: str, response: str, criterion: str) -> list[dict]:
    system = (
        "You are a strict quality evaluator. Respond only with a JSON object: "
        '{"pass": true|false, "reason": "..."}.'
    )
    user = (
        f"Criterion: {criterion}\n\n"
        f"Question: {question}\n\n"
        f"Response: {response}\n\n"
        "Does the response meet the criterion? Reply with JSON only."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]

def parse_judge_output(raw: str) -> dict:
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        return {"pass": False, "reason": "parse_error"}
```

That's the scaffold. The hard work isn't the code; it's writing a criterion specific enough that two humans would agree on the verdict, and re-validating the judge whenever the prompt, the model, or the task changes. Shankar et al. (UIST 2024) call the underlying problem "criteria drift": users need criteria to grade outputs, but grading outputs is what teaches them what their criteria actually are.[^7] A judge calibrated once and trusted forever silently rots.

## Reading the map: which combination answers which question

The four axes combine. Most production systems run several of these combinations side by side, each pointed at a different question:

| Question | Offline / Online | Component / E2E | Reference | Grader |
|---|---|---|---|---|
| Is this prompt change safe to merge? | offline | end-to-end | mixed | automatic + judge |
| Did my retriever silently regress? | offline | component | reference-based | automatic (Recall@k) |
| Are users still satisfied this week? | online | end-to-end | reference-free | judge + implicit signals |
| Is the new model better than the old one? | online | end-to-end | reference-free | A/B test (human via behavior) |
| Does the agent pick the right tool? | offline | component | reference-based | automatic (exact match) |
| Are we hallucinating in production? | online | component (faithfulness) | reference-free | judge |

Each row is a different infrastructure decision. The CI gate for the first row is a Python script that runs in seconds; the answer for the second-to-last row is a multi-week experiment with traffic splits and statistical-power calculations. Conflating them is how teams ship LLM-as-judge in CI (slow, expensive per merge) or try to gate deploys on A/B tests (impossibly slow). The taxonomy is the map; the rows above are the routes.

The thing the map doesn't show, and that every later chapter in this part insists on, is that none of this is built before error analysis. Husain and Shankar's field number from teaching over 2,000 engineers is that 60% to 80% of AI product development time should go to error analysis and evaluation (as of January 2026).[^1] You read traces, you cluster failures, *then* you decide which axis combinations actually answer your team's open questions. Building eval infrastructure in the abstract produces high-precision measurements of the wrong thing.

At architecture scale, [Observability for AI Systems](../../hld/part-9-ai-ml-system-design/05-llm-evaluation-observability.md) covers the trace-instrumentation and metrics-pipeline view of the same problem. The chapters that follow drill into specific cells of this map: [LLM-as-judge](./01-llm-as-judge.md) on building a judge you can trust, [Judge failure modes](./02-judge-failure-modes.md) on the bias mitigations, [Evaluating RAG and agents](./03-evaluating-rag-and-agents.md) on the component-eval patterns, and [Online evaluation and A/B testing](./05-online-evaluation-and-ab-testing.md) on what the live-traffic side actually looks like in production.

## References

[^1]: Hamel Husain and Shreya Shankar, "LLM Evals: Everything You Need to Know," hamel.dev, January 15, 2026. https://hamel.dev/blog/posts/evals-faq
[^2]: Jason Liu, "There Are Only 6 RAG Evals," jxnl.co, May 19, 2025. https://jxnl.co/writing/2025/05/19/there-are-only-6-rag-evals/
[^3]: Eugene Yan, "Task-Specific LLM Evals that Do and Don't Work," eugeneyan.com, March 2024. https://eugeneyan.com/writing/evals/
[^4]: Lianmin Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena," arXiv:2306.05685, NeurIPS 2023. https://arxiv.org/abs/2306.05685
[^5]: OpenAI, "Graders," OpenAI Platform documentation, 2025. https://platform.openai.com/docs/guides/graders
[^6]: Tianpan, "Why Every Label Source Has a Hidden Tax," tianpan.co, April 2026. https://tianpan.co/blog/2026-04-19-annotation-economy-label-sourcing-eval
[^7]: Shreya Shankar et al., "Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences," arXiv:2404.12272, UIST 2024. https://arxiv.org/abs/2404.12272

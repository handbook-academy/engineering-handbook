---
title: "Choosing models and reading benchmarks"
description: "Public leaderboards don't predict your product's quality. Shortlist by tier, test on your own eval set, decide. That's the whole workflow."
slug: 05-choosing-models-and-reading-benchmarks
part: 2
chapter: 5
difficulty: beginner
prerequisites:
  - part-1-how-models-behave/00-the-model-landscape
  - part-1-how-models-behave/05-the-cost-quality-latency-triangle
tags: [llm, http-api]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Choosing models and reading benchmarks

In February 2026, OpenAI publicly retired SWE-bench Verified, one of the most-cited coding benchmarks in the industry. Two findings forced their hand. First, 59.4% of the audited "failures" were tests rejecting code that actually worked. Second, GPT-5.2 reproduced the exact gold-patch diff for several Django tasks when given only a one-line problem description, which is memorization, not problem-solving.[^1] The top six models on that leaderboard were separated by 1.3 percentage points.[^2] Teams were reading noise as signal and shipping based on it.

That's the chapter in one paragraph. The leaderboard you check before picking a model is, for any specific product task, a worse predictor than 50 examples from your own data. Here's why, and here's the workflow that replaces it.

## The leaderboard measures a different distribution than your product

Every public leaderboard, from LMArena to MMLU to GPQA Diamond, scores models on a fixed pool of questions. Arena prompts skew toward general conversation, casual coding, and travel itineraries. MMLU is undergraduate multiple choice. GPQA Diamond is expert-level science. Your product is contract clauses, or medical notes, or a specific kind of customer-support routing. Those distributions barely overlap.

![Two overlapping bell curves on a shared horizontal axis labeled prompt difficulty and domain specificity; the wider, flatter curve on the left is labeled Arena prompt distribution and the narrower, taller curve on the right is labeled Your product task, with a small shaded overlap zone where both curves meet](images/05-distribution-gap.png)
*A leaderboard rank averages over the left curve; your product lives on the right curve. The narrow overlap is the only zone where the public number transfers.*

Arena's own topic-cluster analysis shows the rank reordering across domains: GPT-4 and Llama-2-70b-chat are nearly tied on travel itineraries, but the gap between them stretches up to 43 percentage points on coding and reasoning clusters.[^3] A model that ranked second globally outperforms the first on your specific domain often enough that ranking by global average is, statistically, close to a coin flip in the top decile.

The Arena has a structural problem on top of the distribution problem. Singh et al. ("The Leaderboard Illusion", 2025) documented that Meta privately tested at least 27 unreleased Llama-4 variants in Chatbot Arena before publishing, keeping only the best score.[^4] OpenAI and Google each received roughly 20% of all Arena battles; the 83 open-weight models combined got 29.7%. Even small extra battle volume yielded relative score gains of up to 112% on Arena-Hard, so closed providers who can selectively disclose are systematically advantaged.[^4] The Arena adjusted policies after publication, but selective disclosure is still partly possible.

Use Arena scores to filter out clearly bad models, the bottom quartile. Don't use them to rank within the top decile. The confidence intervals on adjacent ranks overlap, and the optimization pressure from selective disclosure points the leaderboard at the leaderboard's own dynamics, not at your product.

## The workflow: shortlist, test, decide

The replacement for "check the leaderboard" is three stages with explicit gates between them. Each stage answers one question, and you don't move on until the answer is in.

**Stage 1: shortlist by tier characteristics, not by scores.** Read the provider's docs. Pick 2 to 4 candidates that satisfy your hard constraints: context window large enough for your inputs, structured-output support if you need JSON, pricing within your budget envelope, rate limits compatible with your traffic shape. The tier framing from [The model landscape](../part-1-how-models-behave/00-the-model-landscape.md) is enough here. Default to mid-tier candidates. Add one frontier and one small as bracketing options if the task difficulty is genuinely unclear.

**Stage 2: build a 50-to-200 example eval set from your data.** Not benchmark questions. Not synthesized prompts that "look like" your task. Real inputs from your real product, each with a deterministic check or an LLM-judge rubric that says pass or fail. Hamel Husain and Shreya Shankar are blunt about why generic eval libraries don't substitute: "Generic evaluation metrics are everywhere... These metrics measure abstract qualities that may not matter for your use case."[^5] You're predicting how well a model handles your distribution; only your distribution can produce that prediction.

The eval set is its own discipline, and it's covered in depth across [why evals](../part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md) and [your first eval set](../part-4-eval-fundamentals/02-your-first-eval-set.md). The minimum viable version for this workflow: 50 representative examples, binary pass/fail, version-controlled in your repo, runnable in under 10 minutes.

**Stage 3: run the shortlist, score it, decide.** Send the same prompt to each candidate. Record pass rate, p50 and p95 latency, and dollar cost per pass. Pick the candidate that wins on whichever axis your product has named as primary. Commit the decision in writing, with the eval-run timestamp and the model's pinned version string.

The skeleton fits in a few dozen lines of Python. The point of showing it is that there's no magic; the workflow is just a loop and a scorer.

```python
# Run the same prompt across candidates, score against your gold answers.
# Replace the API calls and the scorer with your real ones.

CANDIDATES = [
    {"provider": "openai",    "model": "gpt-5.3-instant"},
    {"provider": "anthropic", "model": "claude-fable-5"},
    {"provider": "openai",    "model": "gpt-5.5"},
]

def score(output: str, gold: str) -> bool:
    # Domain-specific. Could be schema validation, regex, LLM judge.
    return gold.lower().strip() in output.lower()

def evaluate(eval_set, candidates):
    results = {}
    for c in candidates:
        passes = 0
        for example in eval_set:
            out = call_model(c, example["prompt"])  # your API wrapper
            if score(out, example["gold"]):
                passes += 1
        results[c["model"]] = passes / len(eval_set)
    return results

# eval_set is 50-200 dicts: {"prompt": "...", "gold": "..."}
print(evaluate(eval_set, CANDIDATES))
```

A useful sanity check on top of this: when your task ranking and the public leaderboard disagree, the public number is the one to throw out, not yours. The check is one division:

```python
def check_inversion(public_a, public_b, your_a, your_b):
    public_winner = "A" if public_a > public_b else "B"
    your_winner   = "A" if your_a   > your_b   else "B"
    if public_winner != your_winner:
        return f"INVERSION: leaderboard says {public_winner}, your task says {your_winner}. Trust your task."
    return f"AGREEMENT: both pick {your_winner}. Still verify the margin clears confidence intervals."

# GPQA Diamond top-four are within 1.3 pp of each other (May 2026):
# the leaderboard rank below is noise; your 5-point gap on contracts is signal.
print(check_inversion(0.936, 0.942, 0.84, 0.79))
```

When the leaderboard and your eval set disagree, the leaderboard is averaging over a distribution that isn't yours, often inflated by contamination on top.

## Contamination, in one paragraph

Public benchmarks live on the public internet. Their questions and answers get posted on GitHub, Stack Overflow, Hugging Face, blog tutorials, and forum threads, and that text gets crawled into the next pre-training run. The model then sees the test set during training and memorizes pieces of it, which inflates the score without improving the underlying capability. Microsoft Research's MMLU-CF rebuilt MMLU as a contamination-free version, and GPT-4o dropped from over 85% on the original to 73.4% on the reconstructed set, a roughly 12-point gap attributable to leakage.[^6] Detection is hard: simple n-gram overlap checks are bypassed by paraphrasing, and the Evasive Augmentation Learning technique demonstrated up to 15% benchmark gains while evading n-gram filters.[^7] OpenAI's SWE-bench retirement was the cleanest public proof: GPT-5.2 reproduced verbatim gold patches from short task descriptions, which is label-level memorization.[^1] The practical consequence: when a benchmark is older than a model's training cutoff and the top scores have stopped moving, treat the numbers as ceiling-bound and uninformative. Use contamination-resistant alternatives where they exist (MMLU-CF instead of MMLU, SWE-bench Pro instead of Verified), or skip public benchmarks entirely and trust your eval set.

## When to switch models

Once you've shipped, the question shifts from "which model" to "should we move." The rule that survives contact with production: switch only when error analysis on your own traces, not a leaderboard headline, identifies the model as the failure locus, and your eval set confirms the candidate model improves the relevant failure category. Husain's framing: "Does error analysis suggest that your model is the problem?"[^5]

Most production failures are prompt failures or data-quality failures wearing a model-failure costume. A team that swaps models every time a competitor announces a new SOTA spends its quarter rewriting integrations and inheriting fresh regressions, not improving its product. Pin model versions where the provider supports them: `gpt-5.5-2026-04-12`, not `gpt-5.5`. Re-run the eval set on every version bump. Treat unpinned model strings as a silent dependency, like a `latest` tag in production.

The escalation rule from [The escalation ladder](../part-0-start-here/03-the-escalation-ladder.md) applies in reverse here: before climbing to a more expensive model, exhaust the cheaper rungs. Better prompt, better context, better retrieval, better tools. If error analysis after those points at the model, then switch. At architecture scale, [HLD Part 9 covers gateway and routing topology](../../hld/part-9-ai-ml-system-design/) for fleet-level model selection.

The leaderboard isn't useless, but its job is small. It tells you which models are clearly out of contention. Beyond that, the only honest signal is the one you measure on your own data, and the workflow above is how you produce it.

## References

[^1]: OpenAI, "Why SWE-bench Verified no longer measures frontier coding capabilities", openai.com, February 23 2026. https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
[^2]: kilocode.substack.com, "Because Your Benchmark Score Doesn't Pay the Bill", May 2026. https://open.substack.com/pub/kilocode/p/kilobench-because-your-benchmark
[^3]: Chiang, W.-L. et al., "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference", arXiv:2403.04132, 2024. https://arxiv.org/abs/2403.04132
[^4]: Singh, S. et al. (Cohere Labs, Princeton, MIT), "The Leaderboard Illusion", arXiv:2504.20879, April 2025. https://arxiv.org/abs/2504.20879
[^5]: Husain, H. and Shankar, S., "LLM Evals: Everything You Need to Know", hamel.dev, January 15 2026. https://hamel.dev/blog/posts/evals-faq
[^6]: Zhao, Q. et al. (Microsoft Research), "MMLU-CF: A Contamination-free Multi-task Language Understanding Benchmark", arXiv:2412.15194, December 2024. https://arxiv.org/abs/2412.15194
[^7]: Xu, C. et al., "Benchmark Data Contamination of Large Language Models: A Survey", arXiv:2406.04244, 2024. https://arxiv.org/abs/2406.04244


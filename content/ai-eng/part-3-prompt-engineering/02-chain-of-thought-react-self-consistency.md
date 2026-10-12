---
title: "Chain-of-thought, ReAct, self-consistency"
description: "The three techniques that survived the 2023 prompting literature, and the reasoning-model inversion that flips the rules: when to use each, and when to delete them."
slug: 02-chain-of-thought-react-self-consistency
part: 3
chapter: 2
difficulty: intermediate
prerequisites:
  - part-1-how-models-behave/04-reasoning-models
  - 01-zero-shot-and-few-shot
tags: [llm]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Chain-of-thought, ReAct, self-consistency

The advice that's been pasted into every AI talk for three years, "just tell it to think step by step," is now actively wrong on a growing share of the models your team is calling. On Gemini Flash 2.5 with explicit chain-of-thought prompting, accuracy on PhD-level questions dropped 3.3 percentage points and response times stretched 20 to 80 percent longer than the same prompt without the suffix.[^1] Same model. Same questions. Worse answer, slower, paying more.

That isn't the whole story, though. On a non-reasoning model like Claude Sonnet 4.6 or GPT-4o running the same arithmetic word problems, "let's think step by step" still works the way the 2022 papers said it did. The technique didn't break. The model class split in two, and one half stopped needing it.

This chapter is the three prompting techniques that survived the 2023 to 2024 research cycle, what each one does to a model, and the rule that decides which class of model gets which technique. Get the rule right and you keep the gains where they're real. Get it wrong and you pay a latency tax for nothing.

## The two model classes, and why the same prompt does opposite things

A standard instruction-tuned model, GPT-4.1 or Claude Sonnet 4.6 or Gemini 2.0 Flash, has no built-in scratchpad. When you ask it a multi-step math problem, the only working memory it has is the tokens it's already written. A direct answer means a single forward pass with no place to derive an intermediate result. A chain-of-thought prompt buys the model that scratchpad by asking it to write the steps out loud first.[^2]

A reasoning model, OpenAI's o-series or Claude with adaptive thinking or DeepSeek-R1, does the opposite. It was trained with reinforcement learning to run its own chain of thought internally, in hidden tokens before the visible answer. Those tokens explore alternatives, backtrack, and verify. By the time you see the response, the reasoning is already done.[^3] The full mechanism lives in [Reasoning models](../part-1-how-models-behave/04-reasoning-models.md); what matters here is what it does to your prompt.

When you tell a reasoning model to "think step by step," you're telling a model that's already mid-thought to think in a particular way. That instruction enters the model's internal planning process and constrains it. Few-shot exemplars do the same thing harder: they anchor the model on a reasoning shape your examples imply, often a worse one than the model would have explored on its own.[^4][^5]

![A side-by-side comparison: on the left a standard model with a chain-of-thought prompt producing a long visible reasoning chain that ends in an answer; on the right a reasoning model where the same prompt collides with a hidden internal reasoning process and produces a worse, slower answer.](images/02-cot-inversion.png)
*The same prompt helps one class and hurts the other. The model class is the load-bearing decision, not the prompt.*

The identification step is the meta-rule. Before you choose a prompting technique, name the class. If the model card mentions "o-series", "extended thinking", "adaptive thinking", "DeepSeek-R1", or "Gemini 2.5 thinking", it's a reasoning model; everything else is standard.[^4]

## Chain-of-thought: the scratchpad trick

Wei et al. published the original chain-of-thought (CoT) paper at NeurIPS 2022. The idea was small and the result was large: if you show the model a few worked examples that include the reasoning steps, it imitates the format and writes its own steps before answering. On GSM8K math word problems, an 8-shot CoT prompt on the 540B PaLM model beat a fine-tuned GPT-3 with a verifier.[^2] A year later, Kojima et al. showed you don't even need the examples. Appending "Let's think step by step" to a prompt, with no exemplars at all, captures most of the gain. That's zero-shot CoT.[^6]

A typical few-shot prompt looks like this:

```python
import anthropic

client = anthropic.Anthropic()

examples = [
    {
        "question": "Roger has 5 tennis balls. He buys 2 cans of 3 balls each. How many does he have?",
        "cot": "Roger starts with 5 balls. Each can has 3 balls; 2 cans is 2 * 3 = 6. Total: 5 + 6 = 11.",
        "answer": "11",
    },
]

messages = []
for ex in examples:
    messages.append({"role": "user", "content": ex["question"]})
    messages.append({"role": "assistant", "content": f"{ex['cot']}\n\nAnswer: {ex['answer']}"})
messages.append({"role": "user", "content": "Janet has 15 apples. She gives away 7. How many remain?"})

# Use a STANDARD model here. Do not paste this pattern into claude-opus-4-8 or o3.
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=messages,
)
```

Two things matter about where CoT actually helps. First, model scale: the original paper found CoT only emerges as a reliable win past roughly 100 billion parameters; smaller models produce reasoning chains that don't improve answers.[^2] Second, task type. Sprague et al.'s 2024 meta-analysis covered 100+ CoT papers across 20 datasets and 14 models, and the result was unambiguous: CoT delivers strong gains on tasks involving math or symbolic reasoning, and almost nothing elsewhere. On MMLU, direct generation matches CoT accuracy unless the question or response contains an equals sign, which is the meta-analysis's blunt summary that CoT mostly helps because it lets the model execute symbolic steps.[^7]

So the standard-model rule is narrow. Use zero-shot CoT for multi-step math, logic, or symbolic problems. Escalate to few-shot CoT when the chains come out inconsistent or in the wrong format. For factual retrieval, classification, or sentiment, skip it. CoT adds tokens, which means latency and bill, and on Wharton's 2025 measurements non-reasoning models with CoT ran 35 to 600 percent longer than the same prompt without it.[^1] A free trick that costs you 5 to 15 seconds is not free.

The reasoning-model rule is shorter. Don't. OpenAI's official guidance, as of June 2026, is verbatim: "Avoid chain-of-thought prompts. Since these models perform reasoning internally, prompting them to 'think step by step' or 'explain your reasoning' is unnecessary."[^4] Anthropic's prompting guide says the same in different words: "A prompt like 'think thoroughly' often produces better reasoning than a hand-written step-by-step plan."[^5] Wharton's empirical numbers back the policy: o3-mini gained 2.9 percent and o4-mini gained 3.1 percent from explicit CoT prompts at a 20 to 80 percent latency cost; Gemini Flash 2.5 lost 3.3 percent.[^1] None of those are wins.

The fix when a reasoning model under-performs isn't more prompting scaffolding. It's tightening the problem statement, naming the success criteria, and turning up the `reasoning.effort` (OpenAI) or `effort` (Anthropic) parameter. The chapter on [Reasoning models](../part-1-how-models-behave/04-reasoning-models.md) covers the effort knob in full.

## Self-consistency: vote, don't trust the single chain

CoT has a brittle failure mode. If the first arithmetic step is wrong, every step after it is conditioned on the wrong number, and the model marches confidently to a wrong answer. Greedy decoding doesn't backtrack.

Wang et al. fixed it at ICLR 2023 with one of the cheapest accuracy boosts on the books. Run the same CoT prompt several times with temperature above zero, extract the final answer from each run, and majority-vote.[^8] Different sampled chains hit different errors at different steps; the wrong answers scatter, the right answer concentrates.

```python
from collections import Counter
import re

def extract_final_answer(text: str) -> str:
    """Pull the last number out of a CoT response."""
    matches = re.findall(r"\b\d+(?:\.\d+)?\b", text)
    return matches[-1] if matches else ""

def majority_vote(responses: list[str]) -> str:
    answers = [extract_final_answer(r) for r in responses]
    counter = Counter(a for a in answers if a)
    return counter.most_common(1)[0][0] if counter else ""

# Usage: call the model k times at temperature ~0.7, collect responses,
# then run majority_vote(responses). The final answer is the consensus.
```

The gains on standard models are real and they're large. On PaLM 540B, self-consistency over CoT improved GSM8K accuracy by 17.9 points, SVAMP by 11.0, and AQuA by 12.2.[^8] Those are 2023 benchmark numbers on a 2022 model, but the technique reproduces across model families and scales.

The price is linear in the number of samples. The original paper used k=40, which means 40 calls for one answer and 40x the cost. Production teams should start at k=5 to 10, measure on their own eval, and only push higher when accuracy gains pay back. Most of the win saturates well before 40, and follow-on work on early stopping, where you stop sampling once a clear majority emerges, recovers most of the gain at a fraction of the cost.[^9]

Self-consistency has hard limits. It needs a single extractable final answer: a number, a label, a structured field. It does nothing for open-ended generation, where there's no "vote" between two essays. It also fails when the model is wrong in a consistent way; the majority can converge on the same wrong answer the greedy chain would have picked. And on reasoning models, the marginal accuracy benefit is small enough that paying for k samples to a model that already explores multiple internal paths is rarely justified. The cleaner escalation on a reasoning model is to raise its effort level, not to call it five times.[^1]

## ReAct: the pattern that became the agent loop

The third technique solved a different problem. CoT works when the model already knows the facts. When it doesn't, a CoT chain confabulates: the model fills in plausible-sounding numbers and dates, and the rest of the reasoning is rigorous nonsense.

Yao et al.'s ICLR 2023 paper proposed interleaving reasoning steps with tool calls. The model alternates blocks: a `Thought` saying what to do next, an `Action` invoking a tool like a Wikipedia search or a calculator, and an `Observation` containing the tool's result. Each observation grounds the next thought in a real fact. The loop ends when the model emits `Finish[answer]`.[^10]

On the original benchmarks, ReAct beat both pure CoT and pure action-prediction baselines. On ALFWorld, a text-based household-task benchmark, ReAct's success rate was 34 percentage points higher than the strongest reinforcement learning baseline. On WebShop, a product-search task, the gap was 10 points, with only one or two in-context examples.[^10]

That's the history. Here's what's left of it in production.

The text-based `Thought / Action / Observation` format is mostly a relic. It existed because 2022 models didn't have structured tool-calling APIs, so the only way to get a model to call a tool was to teach it the convention through few-shot examples. Modern models have native function calling, covered in [Function and tool calling](../part-2-working-with-model-apis/03-function-and-tool-calling.md), and the provider's API handles the interleaving. You define your tools as JSON schemas, the model returns structured tool-call objects, your code runs them, and you feed the results back as tool messages. There's no `Thought:` prefix to format and no parser to babysit. For a reasoning model, the internal chain of thought already plays the role of the visible `Thought` blocks, and a plain function-calling loop matches or beats the original ReAct trajectory.[^4][^10]

What survived is the architecture, not the syntax: interleave reasoning with grounded actions, and don't let the model pretend it knows facts it has to look up. Every agent framework you'll touch (LangGraph's `create_react_agent`, OpenAI's Agents SDK, Anthropic's tool-use loop) is a descendant of this idea, packaged as a graph instead of a prompt.

One failure mode crosses over from the original paper to modern agents: the action loop. If a tool returns the same result for the same query and the model doesn't update its plan, it can call the tool again, and again, with the same arguments. The fix is mechanical, not magical. Bound the loop. LangGraph exposes `recursion_limit`; OpenAI lets you cap turns; whatever framework you're on, set a hard ceiling (10 to 15 steps is a reasonable starting point) and make repeated identical calls a stop condition. A bounded loop that gives up is cheaper than an unbounded one that runs your bill into four digits before someone notices.

## Which technique for which model class

Three techniques, two model classes, one table:

| Technique | Standard model | Reasoning model |
|---|---|---|
| **Zero-shot CoT** ("think step by step") | Default for math, logic, symbolic tasks. Skip for retrieval and classification. | Don't add it. Per OpenAI and Anthropic's own guidance, it interferes with internal reasoning.[^4][^5] |
| **Few-shot CoT** | Use when zero-shot chains come out inconsistent. Watch for distribution mismatch between exemplars and real queries. | Don't add. Anchors the model on a worse decomposition than it would have explored.[^4][^11] |
| **Self-consistency** | Use at k=5 to 10 when accuracy on closed-form answers matters more than cost. Saturates well before k=40. | Raise `reasoning.effort` instead. The model already samples internally. |
| **ReAct (text format)** | Use only on small or older models without native function calling. | Don't. Use the function-calling API. |
| **ReAct (architecture)** | The interleave pattern lives on as the agent loop. Use it whenever the model needs grounded facts it doesn't have. | Same. The internal chain replaces the visible `Thought` blocks. |

If your team has one habit to internalize from this chapter, it's the identification step. Before you reach for any of these techniques, name the model class out loud. The rules are crisp once that's settled. The most expensive prompting mistake of 2026 is treating every model the same way and wondering why the same prompt that won you 18 points on Sonnet just lost you 3 on Flash 2.5.

## References

[^1]: Meincke, L., Mollick, E.R., Mollick, L., Shapiro, D., "The Decreasing Value of Chain of Thought in Prompting," Wharton Generative AI Labs Technical Report, June 8, 2025. https://gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/

[^2]: Wei, J. et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS 2022. https://arxiv.org/abs/2201.11903

[^3]: DeepSeek-AI, Guo, D. et al., "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning," Nature vol. 645, 633-638 (2025). https://arxiv.org/abs/2501.12948

[^4]: OpenAI, "Reasoning best practices," OpenAI Platform Documentation, as of June 2026. https://platform.openai.com/docs/guides/reasoning-best-practices

[^5]: Anthropic, "Prompting best practices," Anthropic Documentation, as of June 2026. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices

[^6]: Kojima, T., Gu, S.S., Reid, M., Matsuo, Y., Iwasawa, Y., "Large Language Models are Zero-Shot Reasoners," NeurIPS 2022. https://arxiv.org/abs/2205.11916

[^7]: Sprague, Z. et al., "To CoT or not to CoT? Chain-of-thought helps mainly on math and symbolic reasoning," ICLR 2025. https://arxiv.org/abs/2409.12183

[^8]: Wang, X. et al., "Self-Consistency Improves Chain of Thought Reasoning in Language Models," ICLR 2023. https://arxiv.org/abs/2203.11171

[^9]: "Early-stopping Self-Consistency for Multi-step Reasoning," ICLR 2024. https://iclr.cc/virtual/2024/poster/17848

[^10]: Yao, S. et al., "ReAct: Synergizing Reasoning and Acting in Language Models," ICLR 2023. https://arxiv.org/abs/2210.03629

[^11]: Nori, H. et al., "Exploration of Run-Time Strategies for Medical Challenge Problems and Beyond," arXiv:2411.03590, November 2024. https://arxiv.org/abs/2411.03590

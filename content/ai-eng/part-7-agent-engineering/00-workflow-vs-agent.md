---
title: "Workflow vs agent"
description: "If you can write the control flow in Python, it's a workflow. If the model decides at runtime, it's an agent. Most production wins are workflows."
slug: 00-workflow-vs-agent
part: 7
chapter: 0
difficulty: intermediate
prerequisites:
  - part-0-start-here/03-the-escalation-ladder
  - part-2-working-with-model-apis/03-function-and-tool-calling
  - part-3-prompt-engineering/03-templates-and-chaining
tags: [llm, agents]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Workflow vs agent

In January 2026, Eric Ma, who leads Research Data Science at Moderna, audited every LLM application his team had built. He measured each one against a single test from Anthropic's *Building Effective Agents*: does the model decide what happens next, or does Python? His verdict: "We don't have agents. I would not classify any of our applications as agents."[^1] Moderna ships LLM features in production at a regulated pharma company. Zero of them are what most people mean when they say "agent."

That's not a Moderna quirk. The MAP study (Pan et al., December 2025, accepted as Oral at ICML 2026) audited 86 deployed agent systems across 26 domains. 68% execute at most 10 steps before a human steps in. 74% rely on humans for evaluation. Most aren't open-ended loops; they're orchestrated pipelines with humans on either end.[^2] The agent hype curve and the production reality curve are different shapes.

This chapter is the line that separates them, and the rule that follows from it.

## The Python test

Anthropic's definition is the one the field has settled on: a **workflow** orchestrates LLM calls and tools through predefined code paths. An **agent** lets the model dynamically direct its own process and tool use, deciding what to do next from the environment's response.[^3] Both are "agentic systems"; only one is an agent.

That definition is correct but abstract. The version you can apply in five seconds:

> If you can write the control flow in Python before you see the input, it's a workflow. If the LLM's output decides what runs next, it's an agent.

Look at the same task two ways. Here's a workflow that classifies a support ticket and dispatches it:

```python
def handle_ticket(ticket: str) -> str:
    intent = llm_classify(ticket, options=["billing", "technical", "other"])
    if intent == "billing":
        return billing_handler(ticket)
    if intent == "technical":
        return technical_handler(ticket)
    return general_handler(ticket)
```

The LLM classifies. Python branches. The set of paths is enumerable; you can list every code line that might run. You can unit-test it. You can put a latency SLA on it.

Here's the same task as an agent:

```python
def handle_ticket(ticket: str, tools: dict, max_steps: int = 10) -> str:
    history = [{"role": "user", "content": ticket}]
    for _ in range(max_steps):
        response = llm_with_tools(history, tools=list(tools.keys()))
        if response.tool_call is None:
            return response.text          # model decided it's done
        result = tools[response.tool_call.name](**response.tool_call.args)
        history.append({"role": "tool", "content": result})
    return "max_steps reached"
```

The `for` loop is still in Python, but it's a safety ceiling, not the schedule. The stopping condition (`tool_call is None`) is a model output. The number of iterations, the tools called, and the order they're called in: all decided at runtime, by the model. Two requests to the same function can take wildly different paths.

That's the whole structural difference. It's not about how many LLM calls you make, or whether you use tools, or whether the system "feels intelligent." A prompt chain with five LLM calls in a row is a workflow. A single-call loop where the model picks one of two tools is an agent. **The decision point is who owns the `if`.**

![A side-by-side diagram: on the left, a Python code block with an LLM call inside and a clean if/else branching to three handler boxes; on the right, an LLM at the center of a circular loop with arrows fanning out to multiple tool boxes and curving back, with a small dashed max-steps ring around it. A bold caption above the left reads "Python owns the decision" and above the right "Model owns the decision".](images/00-control-flow-ownership.png)
*Same task, two architectures. The difference isn't the number of LLM calls; it's who decides what runs next.*

## The rule

> **Default to a workflow. Reach for an agent only when you can't enumerate the steps in advance, the system can recover from mid-task failures, and the cost and latency of a runaway loop are acceptable.**

That's Anthropic's framing, almost word for word: "find the simplest solution possible, and only increasing complexity when needed."[^3] It sits inside the broader escalation principle from [The escalation ladder](../part-0-start-here/03-the-escalation-ladder.md): climb the cheapest rung that solves the problem and stop there. Workflows are the rung below agents on that ladder.

The rule is opinionated for a reason. There's a number behind it.

## The compounding-error math

If a single LLM step is correct 95% of the time, and steps are independent, then a 10-step pipeline is correct `0.95^10 = 60%` of the time. A 20-step pipeline drops to 36%. A 100-step run is correct 0.6% of the time. Chip Huyen states the calculation directly in *AI Engineering*: "If the model's accuracy is 95% per step, over 10 steps, the accuracy will drop to 60%, and over 100 steps, the accuracy will be only 0.6%."[^4]

That's the floor, not the ceiling. Real agent errors aren't independent; they compound semantically. A wrong tool call early in the trace contaminates the context, and the model keeps reasoning from a poisoned premise. The arithmetic curve is the *best case*.

This isn't theoretical. Sierra AI's tau-bench (June 2024) measured GPT-4o on realistic customer-support agent tasks. Single-run pass rate (`pass^1`): under 50%. Run the *same* task eight times with eight different customers (`pass^8`): around 25% in retail. The Sierra team's blunt summary: "there is only a 25% chance that the agent will resolve 8 cases of the same issue with different customers."[^5] State-of-the-art models, structured tasks, and one in four customers gets a consistent answer.

The benchmark-to-production gap is wider than the benchmarks suggest. SWE-bench Verified scores jumped from 4.4% in 2023 to 71.7% in 2024.[^6] Then METR (March 2026) checked whether maintainers would actually merge those passing PRs. Roughly half wouldn't, even after adjusting for noise in merge decisions.[^7] Passing the test isn't the same as being right.

Workflows sidestep most of this because the step count is bounded and the path is enumerable. You can harden each step independently and test the chain as a whole. Agents can't offer that, by construction.

## Five workflows cover most production wins

Anthropic's post names [five composable workflow patterns](./01-the-five-workflow-patterns.md) that show up in almost every production system worth studying.[^3] The next chapter covers them in depth; here's the map:

- **Prompt chaining** runs a fixed sequence of LLM calls, each consuming the previous output. Use when a task decomposes cleanly into stages: outline, draft, edit; classify, extract, format.
- **Routing** classifies the input and dispatches to a specialized prompt or model. Use when input categories are stable and you can route easy queries to a cheaper model and hard ones to a stronger one.
- **Parallelization** fans out independent subtasks (sectioning) or runs the same task N times and votes (voting). Use for guardrails, multi-perspective review, or confidence boosts.
- **Orchestrator-workers** has an LLM break a task into subtasks and delegate to worker LLMs at runtime. The outer loop is still code; the decomposition isn't. This is where Anthropic's own SWE-bench coding agent lives.
- **Evaluator-optimizer** pairs a generator LLM with an evaluator LLM in a loop, iterating until the evaluator approves. Use for translation, complex search, anywhere feedback is genuinely actionable.

A real product is usually two or three of these stitched together. Moderna's highest-value LLM applications, the ones the Ma audit found, are prompt chaining and orchestrator-workers running over scientific literature and archived forms.[^1] No agents. Real revenue.

[The agent loop itself](./02-the-agent-loop.md) (ReAct, Reflexion, planning, reflection) gets its own chapter, because it's the architecture you reach for when these five aren't enough.

## When the rule says "agent"

Don't read the workflows-first posture as "agents are wrong." Some problems genuinely require runtime path selection, and trying to hard-code them produces brittle Rube Goldberg pipelines that fail on the first input the developer didn't anticipate.

The signal that you've hit a real agent task:

- **The step count depends on the input** in a way you can't enumerate. A coding agent fixing a bug might touch one file or fifteen; you don't know until the model reads the codebase. Anthropic's own SWE-bench agent is exactly this case.[^3]
- **Mid-task failures need replanning, not retries.** When step three fails, the right next step depends on *why* it failed. If you can't write that recovery logic in advance, the model has to.
- **The environment is sandboxed and reversible.** Agents writing to production databases without rollback paths are how teams discover compounding errors at 3am. Read-only or sandboxed first; write actions only behind explicit confirmation.
- **Latency and cost budgets allow for a loop.** Agents multiply your LLM bill by step count and add seconds to every request. If you're serving an interactive chat with a 2-second SLA, an agent isn't viable; if you're processing tickets in a batch overnight, it might be.

If any of those four is missing, you want a workflow with human escalation on the inputs that don't fit, not an agent. The orchestrator-workers pattern is often the right middle ground: an LLM picks the subtasks at runtime, but the outer loop's stopping condition stays in Python.

## The honest dissent

The workflows-first rule is a current-moment recommendation, not a permanent law. As base models get stronger, the threshold shifts. OpenAI's *Practical Guide to Building Agents* (April 2025) takes a softer stance: agents "are uniquely suited to workflows where traditional deterministic and rule-based approaches fall short."[^8] LangChain's Harrison Chase pushed back hard, calling the guide "misguided" and arguing that workflow systems "maintain value as their underlying models get upgrades" while end-to-end agents tend to need rewrites.[^9]

Hyung Won Chung at OpenAI made the longer-arc counter-argument: adding workflow structure scores short-term wins but tends to lose ground as models scale up.[^9] That's the Bitter Lesson applied to system architecture: structure you put in by hand will eventually be eaten by a stronger model. He's probably right on a long enough timeline. He's not right today, on the production data we have.

The MAP study, the Moderna audit, and the tau-bench numbers all point the same direction: in mid-2026, on the models you can actually call from production code, workflows ship and agents struggle. When that changes, the rule will change with it. Until then, the default is unambiguous.

If your team is reaching for an agent because it sounds like the serious answer, that's the moment to ask whether you can write the control flow in Python first. Most of the time, you can.

At architecture scale, [AI system design](../../hld/part-9-ai-ml-system-design/) in HLD Part 9 covers the infrastructure that sits below this distinction: sandboxed execution environments, tool registries, and observability for agent traces.

## References

[^1]: Eric J. Ma and Hugo Bowne-Anderson, "Episode 66: The Agent Paradox - Why Moderna's Most Productive AI Systems Aren't Agents," Vanishing Gradients podcast, January 8, 2026. https://hugobowne.substack.com/p/episode-66-the-agent-paradox-why
[^2]: Melissa Z. Pan, Negar Arabzadeh, et al., "Measuring Agents in Production," arXiv:2512.04123v4, December 2025 (revised June 2026), accepted as Oral at ICML 2026. https://arxiv.org/abs/2512.04123
[^3]: Erik Schluntz and Barry Zhang (Anthropic), "Building Effective Agents," Anthropic Engineering Blog, December 19, 2024. https://www.anthropic.com/engineering/building-effective-agents
[^4]: Chip Huyen, "Agents," huyenchip.com, January 7, 2025; adapted from *AI Engineering: Building Applications with Foundation Models*, O'Reilly, 2025. https://huyenchip.com/2025/01/07/agents.html
[^5]: Karthik Narasimhan et al. (Sierra AI), "tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains," arXiv:2406.12045, June 2024. https://arxiv.org/abs/2406.12045
[^6]: Stanford HAI, "The 2025 AI Index Report: Technical Performance," Stanford University, 2025. https://hai.stanford.edu/ai-index/2025-ai-index-report/technical-performance
[^7]: METR, "Many SWE-bench-Passing PRs Would Not Be Merged into Main," METR Notes, March 10, 2026. https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/
[^8]: OpenAI, "A Practical Guide to Building Agents," OpenAI Business Guides, April 2025. https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents
[^9]: swyx (Shawn Wang), "In the Matter of OpenAI vs LangGraph," Latent Space, April 20, 2025. https://www.latent.space/p/oai-v-langgraph

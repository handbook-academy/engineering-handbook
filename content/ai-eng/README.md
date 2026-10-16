# The AI Engineering Handbook

**How to build and run production AI products as a software engineer.**

86 chapters across 12 parts · ~192,000 words · 87 figures · 5 Mermaid diagrams · 200 Python examples · 757 footnoted citations

Read it here on GitHub, or on the website at [ai-eng.handbook.academy](https://ai-eng.handbook.academy).

---

## What this book covers

An AI engineer builds products on top of foundation models. They don't train them. This book draws that boundary at the model API and stays on the product side of it: how models behave, how to call them reliably, how to assemble the context they see, how to retrieve, how to build agents, how to evaluate and observe all of it, how to secure it, and how to run it at a cost the business can live with.

It's not an ML course. Tokenization, attention, and sampling only appear where they turn into a cost, latency, or quality knob you can actually turn. Training from scratch and architecture research are out of scope. Fine-tuning gets one decision chapter, [The customization menu](part-10-deployment-and-cost/02-the-customization-menu.md), because most teams should climb every cheaper rung first.

## How it relates to the HLD Handbook

[HLD Part 9, AI & ML System Design](../hld/part-9-ai-ml-system-design/) is the whiteboard: how to design an AI system at scale. This book is the editor: how to build and operate one. Chapters here link to the matching HLD chapter when the architecture-scale view helps.

## How to read it

Go in order the first time. The sequence is deliberate.

- **Part 0** sets the mental model. [The escalation ladder](part-0-start-here/03-the-escalation-ladder.md) (prompt, context, retrieval, tools, agent, fine-tune) is the decision rule the rest of the book keeps returning to.
- **Parts 1 to 3** teach the raw material: model behavior, the APIs, and prompts.
- **Part 4 comes before RAG and agents on purpose.** Every later part assumes you have an eval set. If you only read one part, read this one.
- **Parts 5 to 7** build the system: context, retrieval, agents.
- **Parts 8 to 11** run it: deeper evaluation, observability, security, production operations, and product.

Each chapter takes the shape its topic needs. Most open with a real incident or a failing example, explain the mechanism, and end with something you can apply: a checklist, a decision rule, or a runnable snippet.

## Conventions

- **Code is Python.** Snippets target Python 3.10+ and the official provider SDKs (openai, anthropic, pydantic, httpx).
- **Perishable facts carry dates.** Prices, model names, context limits, and benchmark scores move fast. The rule is that each one carries an "as of" date and a footnoted source. When a number has gone stale, open a PR with the new source.
- **Figures live next to the chapter** in each part's `images/` folder, with descriptive alt text and a one-line caption. Mermaid is used only where a flowchart teaches better than a picture.
- **Warnings** use GitHub's `> [!WARNING]` callout for the production traps that cost teams real money or incidents.
- **Frontmatter** follows the schema checked by `scripts/check-frontmatter.mjs`: `slug` matches the filename, `part` and `chapter` match the path, and `prerequisites` point at other chapters in this book.

## The curriculum

### Part 0: Start Here (4 chapters)

What an AI engineer is, the software baseline, thinking in probabilistic systems, and the escalation ladder the whole book follows: prompt, context, retrieval, tools, agent, fine-tune.

| # | Chapter | Level |
|---|---|---|
| 0.0 | [What an AI engineer is (and isn't)](part-0-start-here/00-what-an-ai-engineer-is.md) | beginner |
| 0.1 | [The software baseline](part-0-start-here/01-the-software-baseline.md) | beginner |
| 0.2 | [Thinking in probabilistic systems](part-0-start-here/02-thinking-in-probabilistic-systems.md) | beginner |
| 0.3 | [The escalation ladder](part-0-start-here/03-the-escalation-ladder.md) | beginner |

### Part 1: How Models Behave (7 chapters)

The model landscape, tokens and context windows, sampling, embeddings, reasoning models, the cost-quality-latency triangle, and just enough ML to make good system decisions.

| # | Chapter | Level |
|---|---|---|
| 1.0 | [The model landscape](part-1-how-models-behave/00-the-model-landscape.md) | beginner |
| 1.1 | [Tokens and context windows](part-1-how-models-behave/01-tokens-and-context-windows.md) | beginner |
| 1.2 | [Sampling and temperature](part-1-how-models-behave/02-sampling-and-temperature.md) | beginner |
| 1.3 | [Embeddings](part-1-how-models-behave/03-embeddings.md) | beginner |
| 1.4 | [Reasoning models](part-1-how-models-behave/04-reasoning-models.md) | beginner |
| 1.5 | [The cost-quality-latency triangle](part-1-how-models-behave/05-the-cost-quality-latency-triangle.md) | intermediate |
| 1.6 | [Just enough ML](part-1-how-models-behave/06-just-enough-ml.md) | beginner |

### Part 2: Working with Model APIs (8 chapters)

Calling models reliably: streaming, structured outputs, tool calling, errors and fallbacks, model selection, gateways and routing, and prompt caching economics.

| # | Chapter | Level |
|---|---|---|
| 2.0 | [Calling models](part-2-working-with-model-apis/00-calling-models.md) | beginner |
| 2.1 | [Streaming](part-2-working-with-model-apis/01-streaming.md) | beginner |
| 2.2 | [Structured outputs](part-2-working-with-model-apis/02-structured-outputs.md) | beginner |
| 2.3 | [Function and tool calling](part-2-working-with-model-apis/03-function-and-tool-calling.md) | intermediate |
| 2.4 | [Errors, retries, fallbacks](part-2-working-with-model-apis/04-errors-retries-fallbacks.md) | intermediate |
| 2.5 | [Choosing models and reading benchmarks](part-2-working-with-model-apis/05-choosing-models-and-reading-benchmarks.md) | beginner |
| 2.6 | [Gateways and routing](part-2-working-with-model-apis/06-gateways-and-routing.md) | intermediate |
| 2.7 | [Prompt caching](part-2-working-with-model-apis/07-prompt-caching.md) | beginner |

### Part 3: Prompt Engineering (5 chapters)

Production prompts: anatomy, few-shot, chain-of-thought and the reasoning-model inversion, templates and chaining, and prompt versioning with rollback.

| # | Chapter | Level |
|---|---|---|
| 3.0 | [Anatomy of a production prompt](part-3-prompt-engineering/00-anatomy-of-a-production-prompt.md) | beginner |
| 3.1 | [Zero-shot and few-shot](part-3-prompt-engineering/01-zero-shot-and-few-shot.md) | beginner |
| 3.2 | [Chain-of-thought, ReAct, self-consistency](part-3-prompt-engineering/02-chain-of-thought-react-self-consistency.md) | intermediate |
| 3.3 | [Templates and chaining](part-3-prompt-engineering/03-templates-and-chaining.md) | intermediate |
| 3.4 | [Prompt versioning](part-3-prompt-engineering/04-prompt-versioning.md) | intermediate |

### Part 4: Eval Fundamentals (4 chapters)

The minimum eval loop, taught before RAG and agents on purpose: look at your data, build your first 50-example eval set, and wire assertions into CI. Nothing after this part ships without evals.

| # | Chapter | Level |
|---|---|---|
| 4.0 | [Why you can't ship without evals](part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md) | beginner |
| 4.1 | [Look at your data](part-4-eval-fundamentals/01-look-at-your-data.md) | beginner |
| 4.2 | [Your first eval set](part-4-eval-fundamentals/02-your-first-eval-set.md) | beginner |
| 4.3 | [Assertions and unit tests for LLM output](part-4-eval-fundamentals/03-assertions-and-unit-tests.md) | beginner |

### Part 5: Context Engineering (6 chapters)

Building the full world the model sees: context assembly and routing, compression and budgets, memory and state, tool context, and testing what was actually assembled.

| # | Chapter | Level |
|---|---|---|
| 5.0 | [Context is more than the prompt](part-5-context-engineering/00-context-is-more-than-the-prompt.md) | intermediate |
| 5.1 | [Context assembly and routing](part-5-context-engineering/01-context-assembly-and-routing.md) | intermediate |
| 5.2 | [Compression and context budgets](part-5-context-engineering/02-compression-and-context-budgets.md) | intermediate |
| 5.3 | [Memory and state](part-5-context-engineering/03-memory-and-state.md) | intermediate |
| 5.4 | [Tool context and metadata](part-5-context-engineering/04-tool-context-and-metadata.md) | intermediate |
| 5.5 | [Testing and observing context](part-5-context-engineering/05-testing-and-observing-context.md) | intermediate |

### Part 6: Retrieval (RAG) (9 chapters)

Retrieval done right: when you actually need RAG, chunking, vector and hybrid search, reranking, query understanding, citations, retrieval evaluation, and production indexing.

| # | Chapter | Level |
|---|---|---|
| 6.0 | [When you actually need RAG](part-6-retrieval-augmented-generation/00-when-you-actually-need-rag.md) | intermediate |
| 6.1 | [Document processing and chunking](part-6-retrieval-augmented-generation/01-document-processing-and-chunking.md) | intermediate |
| 6.2 | [Embeddings and vector search](part-6-retrieval-augmented-generation/02-embeddings-and-vector-search.md) | intermediate |
| 6.3 | [Hybrid search and reranking](part-6-retrieval-augmented-generation/03-hybrid-search-and-reranking.md) | intermediate |
| 6.4 | [Query understanding](part-6-retrieval-augmented-generation/04-query-understanding.md) | intermediate |
| 6.5 | [Citations and grounding](part-6-retrieval-augmented-generation/05-citations-and-grounding.md) | intermediate |
| 6.6 | [Advanced retrieval](part-6-retrieval-augmented-generation/06-advanced-retrieval.md) | advanced |
| 6.7 | [Evaluating retrieval](part-6-retrieval-augmented-generation/07-evaluating-retrieval.md) | intermediate |
| 6.8 | [Production RAG](part-6-retrieval-augmented-generation/08-production-rag.md) | advanced |

### Part 7: Agent Engineering (13 chapters)

Workflows versus agents, tool design, MCP and its security model, memory, human-in-the-loop, long-running agents, multi-agent systems, agent archetypes, voice agents, and choosing a framework.

| # | Chapter | Level |
|---|---|---|
| 7.0 | [Workflow vs agent](part-7-agent-engineering/00-workflow-vs-agent.md) | intermediate |
| 7.1 | [The five workflow patterns](part-7-agent-engineering/01-the-five-workflow-patterns.md) | intermediate |
| 7.2 | [The agent loop](part-7-agent-engineering/02-the-agent-loop.md) | intermediate |
| 7.3 | [Tool design](part-7-agent-engineering/03-tool-design.md) | intermediate |
| 7.4 | [MCP: Model Context Protocol](part-7-agent-engineering/04-mcp-model-context-protocol.md) | intermediate |
| 7.5 | [MCP security](part-7-agent-engineering/05-mcp-security.md) | intermediate |
| 7.6 | [Agent memory and task state](part-7-agent-engineering/06-agent-memory-and-task-state.md) | intermediate |
| 7.7 | [Human-in-the-loop](part-7-agent-engineering/07-human-in-the-loop.md) | intermediate |
| 7.8 | [Long-running agents](part-7-agent-engineering/08-long-running-agents.md) | advanced |
| 7.9 | [Multi-agent systems](part-7-agent-engineering/09-multi-agent-systems.md) | advanced |
| 7.10 | [Agent archetypes](part-7-agent-engineering/10-agent-archetypes.md) | intermediate |
| 7.11 | [Voice agents](part-7-agent-engineering/11-voice-agents.md) | intermediate |
| 7.12 | [Choosing a framework](part-7-agent-engineering/12-choosing-a-framework.md) | intermediate |

### Part 8: Evaluation and Observability (9 chapters)

The deep spine: LLM-as-judge and its failure modes, component evals for RAG and agents, regression gates in CI, online evaluation, tracing, monitoring, and the data flywheel.

| # | Chapter | Level |
|---|---|---|
| 8.0 | [The eval taxonomy](part-8-evaluation-and-observability/00-the-eval-taxonomy.md) | intermediate |
| 8.1 | [LLM-as-judge](part-8-evaluation-and-observability/01-llm-as-judge.md) | intermediate |
| 8.2 | [Judge failure modes](part-8-evaluation-and-observability/02-judge-failure-modes.md) | intermediate |
| 8.3 | [Evaluating RAG and agents](part-8-evaluation-and-observability/03-evaluating-rag-and-agents.md) | intermediate |
| 8.4 | [Regression suites and CI gates](part-8-evaluation-and-observability/04-regression-suites-and-ci-gates.md) | intermediate |
| 8.5 | [Online evaluation and A/B testing](part-8-evaluation-and-observability/05-online-evaluation-and-ab-testing.md) | intermediate |
| 8.6 | [Tracing](part-8-evaluation-and-observability/06-tracing.md) | intermediate |
| 8.7 | [Monitoring and dashboards](part-8-evaluation-and-observability/07-monitoring-and-dashboards.md) | intermediate |
| 8.8 | [Feedback & the data flywheel](part-8-evaluation-and-observability/08-feedback-and-the-data-flywheel.md) | intermediate |

### Part 9: Security and Governance (7 chapters)

Prompt injection, the lethal trifecta and agent security, guardrails, abuse prevention, PII and privacy, compliance, and red-teaming your own system.

| # | Chapter | Level |
|---|---|---|
| 9.0 | [Prompt injection](part-9-security-and-governance/00-prompt-injection.md) | intermediate |
| 9.1 | [Agent security and the lethal trifecta](part-9-security-and-governance/01-agent-security-and-the-lethal-trifecta.md) | intermediate |
| 9.2 | [Guardrails](part-9-security-and-governance/02-guardrails.md) | intermediate |
| 9.3 | [Abuse prevention](part-9-security-and-governance/03-abuse-prevention.md) | intermediate |
| 9.4 | [PII and privacy](part-9-security-and-governance/04-pii-and-privacy.md) | advanced |
| 9.5 | [Compliance and audit](part-9-security-and-governance/05-compliance-and-audit.md) | advanced |
| 9.6 | [Red-teaming](part-9-security-and-governance/06-red-teaming.md) | advanced |

### Part 10: Production AI (8 chapters)

Operating AI in production: hosted versus self-hosted, the customization menu, cost and latency engineering, eval-gated rollouts, SLOs, incident response, and AI infrastructure patterns.

| # | Chapter | Level |
|---|---|---|
| 10.0 | [Hosted vs self-hosted](part-10-deployment-and-cost/00-hosted-vs-self-hosted.md) | intermediate |
| 10.1 | [Self-hosting essentials](part-10-deployment-and-cost/01-self-hosting-essentials.md) | intermediate |
| 10.2 | [The customization menu](part-10-deployment-and-cost/02-the-customization-menu.md) | intermediate |
| 10.3 | [Cost engineering](part-10-deployment-and-cost/03-cost-engineering.md) | intermediate |
| 10.4 | [Latency engineering](part-10-deployment-and-cost/04-latency-engineering.md) | intermediate |
| 10.5 | [Shipping changes](part-10-deployment-and-cost/05-shipping-changes.md) | intermediate |
| 10.6 | [SLOs and incident response](part-10-deployment-and-cost/06-slos-and-incident-response.md) | intermediate |
| 10.7 | [AI infrastructure patterns](part-10-deployment-and-cost/07-ai-infrastructure-patterns.md) | intermediate |

### Part 11: AI Product Engineering (6 chapters)

AI UX, failure recovery, product metrics beyond accuracy, experimentation, cost modeling and pricing, and feedback loops that compound.

| # | Chapter | Level |
|---|---|---|
| 11.0 | [AI UX](part-11-ai-product/00-ai-ux.md) | intermediate |
| 11.1 | [Failure recovery UX](part-11-ai-product/01-failure-recovery-ux.md) | intermediate |
| 11.2 | [AI product metrics](part-11-ai-product/02-ai-product-metrics.md) | intermediate |
| 11.3 | [Experimentation](part-11-ai-product/03-experimentation.md) | advanced |
| 11.4 | [Cost modeling and pricing](part-11-ai-product/04-cost-modeling-and-pricing.md) | intermediate |
| 11.5 | [Feedback and growth loops](part-11-ai-product/05-feedback-and-growth-loops.md) | advanced |

## Contributing

Corrections are the most valuable contribution: a stale price, a renamed API parameter, a benchmark that's been superseded, a snippet that no longer runs against the current SDK. See [CONTRIBUTING.md](../../CONTRIBUTING.md) and [STYLE_GUIDE.md](../../STYLE_GUIDE.md). Run `npm run check:all` before opening a PR.

## License

[CC BY-SA 4.0](../../LICENSE), the same as every handbook in this repository.

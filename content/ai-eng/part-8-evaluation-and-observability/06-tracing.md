---
title: "Tracing"
description: "Spans for LLM calls, retrieval, and agent loops; the gen_ai.* OpenTelemetry conventions; why vendor-proprietary tracing locks you in."
slug: 06-tracing
part: 8
chapter: 6
difficulty: intermediate
prerequisites:
  - part-7-agent-engineering/02-the-agent-loop
  - part-5-context-engineering/05-testing-and-observing-context
tags: [llm, observability]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Tracing

A user reports that your support agent gave them a confidently wrong answer about refund windows. You open your logs. You see the request came in at 14:03:22, the response went out at 14:03:31, and the model was `gpt-4o`. Nine seconds, one model name, and a refund hallucination. That's everything you have.

Was the retriever pulling stale docs? Did the rewriter mangle the user's question before retrieval? Did the agent take three tool-call iterations or seven? Did one of those tool calls return an error the model silently papered over? You can't answer any of that from a flat log line. The model produced one visible output, but it ran through a tree of operations to get there, and the tree is what failed.

A trace makes the tree legible. Each operation in the request becomes a **span**: a typed, timestamped record with a name, a duration, a parent, and a set of attributes. Spans nest. The root span is the user's request. Its children are the LLM call, the retrieval step, each tool execution. Open the trace in any backend and you see a waterfall: which step ran when, how long it took, what tokens it consumed, what arguments it passed to the next step. The hallucination becomes findable.

## The span tree for an LLM app

For a RAG agent, the tree has a predictable shape. One root span wraps the agent invocation. Below it, child spans cover each loop iteration: a retrieval call, an LLM call, a tool execution, and so on. If the agent loops three times, you get three sets of children under the root.

![A horizontal waterfall trace view: a wide indigo bar at the top labeled "invoke_agent rag-pipeline" spans the full width; below it, a shorter slate-blue bar labeled "retrieval" sits on the left, followed by a longer indigo bar labeled "chat gpt-4o" starting where retrieval ended; below those, a coral bar labeled "execute_tool refund_lookup" highlights the moment the model called a tool; small attribute callouts point to "input_tokens: 312", "data_source.id: docs-v3", "tool.name: refund_lookup"](images/06-rag-trace-tree.png)
*A trace is a typed waterfall: the parent agent span wraps every retrieval, LLM call, and tool execution it triggered, with attributes that name what each step did.*

The mapping from operation to span is what the OpenTelemetry GenAI semantic conventions standardize.[^1] Each kind of operation in your AI app gets a specific span name and a specific set of attributes:

- **LLM calls** become `chat {model}` spans with `gen_ai.operation.name = "chat"`, `gen_ai.provider.name`, `gen_ai.request.model`, and the usage counters. Span kind is `CLIENT` (the model runs in another process).
- **Retrieval steps** become `retrieval {data_source}` spans with `gen_ai.operation.name = "retrieval"` and `gen_ai.data_source.id`. The retrieved documents and the query text are opt-in attributes.
- **Tool executions** become `execute_tool {tool_name}` spans with `gen_ai.tool.name`, `gen_ai.tool.type`, and `gen_ai.tool.call.id`. Span kind is `INTERNAL`.
- **Agent invocations** become `invoke_agent {agent_name}` spans that wrap everything else. The kind is `INTERNAL` for in-process agents and `CLIENT` when you call a remote agent service.

The names matter. Backends use them to render the waterfall, group by operation type, and compute aggregate metrics. If you call your span `"step 3"`, you've thrown away that machinery.

In code, each span is a Python context manager. Nesting comes free from the `with` block: any span started inside another becomes its child via OTel's context propagation.

```python
from opentelemetry import trace

tracer = trace.get_tracer("rag-agent")

def rag_pipeline(query: str) -> str:
    with tracer.start_as_current_span("invoke_agent rag-pipeline") as agent:
        agent.set_attribute("gen_ai.operation.name", "invoke_agent")
        agent.set_attribute("gen_ai.agent.name", "rag-pipeline")

        with tracer.start_as_current_span("retrieval docs-v3") as ret:
            ret.set_attribute("gen_ai.operation.name", "retrieval")
            ret.set_attribute("gen_ai.data_source.id", "docs-v3")
            docs = ["..."]  # actual vector search

        with tracer.start_as_current_span("chat gpt-4o") as llm:
            llm.set_attribute("gen_ai.operation.name", "chat")
            llm.set_attribute("gen_ai.provider.name", "openai")
            llm.set_attribute("gen_ai.request.model", "gpt-4o")
            answer = "..."  # actual LLM call
            llm.set_attribute("gen_ai.usage.input_tokens", 312)
            llm.set_attribute("gen_ai.usage.output_tokens", 97)

        return answer
```

That's the whole instrumentation pattern. In practice you wrap it in a small helper, or you use auto-instrumentation (OpenLLMetry, OpenInference) that monkey-patches your provider SDK at import time and emits these spans without you touching the call site.

## Where the agent loop nesting bites you

The agent loop is the place this model gets interesting. An agent runs a think-act-observe cycle until it decides it's done; each iteration produces an LLM call and zero or more tool calls. The natural instrumentation is to keep the `invoke_agent` span open for the whole run and let each iteration's spans nest under it.

For an agent that returns in a few seconds, that's fine. For a long-running agent, the parent span never closes until the run does. Two things break. The OTLP exporter has a batch timeout, and a span open longer than the timeout gets dropped or truncated; you end up with orphan child spans and no root.[^2] And you can't see partial progress in your backend until the agent stops, because most backends only render a trace once it's complete.

The fix is to flatten one level. Emit the parent agent span as a short wrapper that records the run's identity (`gen_ai.agent.name`, `gen_ai.agent.id`, the user-visible task), then start a fresh child span per iteration. Each iteration closes when its LLM call and tool calls are done, exports, and shows up in your backend in real time. The agent run is still queryable as a tree because every iteration shares the same `traceId`; you've just stopped pretending it's one operation.

The same async-context warning from any distributed-tracing tutorial applies, more painfully here than elsewhere: if you spawn a tool call into a thread pool or an `asyncio.create_task` without propagating context, the child span starts a brand-new trace. Two backends, two views, no parent. Use `contextvars.copy_context()` for thread pools and pass the current context explicitly when you fire off background tasks.

## Why vendor-proprietary tracing is a trap

Every LLM platform ships a tracing SDK. LangChain has callback handlers that ship to LangSmith. Anthropic has tracing hooks. OpenAI's Traces API has its own. Each one autoconfigures in two lines, recognizes your framework's calls, and produces a usable view in their UI. For a prototype, the friction is near zero, and the UI is often nicer than what you'd build yourself.

Use them for the prototype. Then move to OTel before real users' data flows through.

The reason is portability, and you only feel the cost of getting it wrong on the day you want to switch. A vendor SDK exports to one backend over a private wire format with private attribute names. Switching means re-instrumenting every call site in your codebase, and the longer you wait, the more callback-dependent code there is to rewrite. Worse, your AI app doesn't run alone: it sits next to a web server, a database, queues, background workers, all of which are likely already on OTel. With a proprietary AI SDK, the database query that fed your retrieval call lives in one trace system, and the LLM call that consumed its output lives in another. You can't see the full request as a single tree, which is the whole point of tracing.

OTel solves this with one wire format (OTLP) and one attribute schema (`gen_ai.*`) that every serious backend now ingests. Langfuse exposes an OTLP endpoint at `/api/public/otel/v1/traces` and maps the conventions onto its data model.[^3] Arize Phoenix is OTel-native through the `phoenix.otel` wrapper. LangSmith added an OTLP endpoint in December 2024 and went generally available with end-to-end OTel support in March 2025, after years of being callback-only.[^4] Datadog, Honeycomb, Grafana Tempo, and any vanilla OTel backend take the same OTLP traffic. You instrument once, route to whichever backend you want, switch backends with a config change, and your database spans share a tree with your LLM spans for free.

```python
import base64, os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

# Same instrumentation, different backend: change the endpoint, not the spans.
auth = base64.b64encode(
    f"{os.environ['LANGFUSE_PUBLIC_KEY']}:{os.environ['LANGFUSE_SECRET_KEY']}".encode()
).decode()

exporter = OTLPSpanExporter(
    endpoint="https://cloud.langfuse.com/api/public/otel/v1/traces",
    headers={"Authorization": f"Basic {auth}"},
)
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)
```

The dissent worth taking seriously: the `gen_ai.*` namespace was at semantic conventions version 1.41.1 as of mid-2026 and every attribute in it carried `Development` stability, not `Stable`.[^1] Names can still shift. Existing instrumentations from before semconv v1.36.0 emit the older `gen_ai.system` attribute instead of the current `gen_ai.provider.name`, and the spec explicitly tells those instrumentations not to upgrade automatically. Set `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental` to opt in to the latest names, or normalize at the OTel Collector with an attribute processor. This is the price of being early; it's smaller than the lock-in cost of skipping the standard.

## What goes on the span, and what doesn't

The conventions split attributes into three requirement levels: required, recommended, and opt-in. Required attributes go on every span (`gen_ai.operation.name`, `gen_ai.provider.name`). Recommended attributes go on every span where the value is available (`gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.finish_reasons`, `gen_ai.request.temperature`). Opt-in attributes are the ones you decide about deliberately, because they carry user content: `gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.system_instructions`, `gen_ai.tool.call.arguments`, `gen_ai.tool.call.result`, `gen_ai.retrieval.query.text`, `gen_ai.retrieval.documents`.

Treat the opt-ins as a privacy decision, not a debugging convenience. Sending a user's prompt to a third-party trace backend is the same data flow as sending it to a third-party API, with the same compliance implications under GDPR, HIPAA, or whatever residency rules you operate under. The default for production is off. If you need the content for an investigation, sample it (1-5% is a defensible starting point), redact at the OTel Collector with a processor, or store the content in your own object storage and put only a reference on the span. The [testing and observing context](../part-5-context-engineering/05-testing-and-observing-context.md) chapter covers the development-mode pattern where capture is on for staging and gated for production.

The recommended attributes are the ones that pay off without privacy risk. Token counts on every span give you cost attribution per request, per user, per route. Finish reasons let you spot a sudden spike in `length` (truncated outputs) or `content_filter`. Latency on the LLM span versus the retrieval span tells you whether your p99 problem is the model or the vector store. Those are the queries you'll actually run at 3 a.m. when the agent that gave the wrong refund answer becomes a real ticket, and the trace is the artifact you open first.

## References

[^1]: OpenTelemetry, "Semantic conventions for generative client AI spans" (semconv 1.41.1, status: Development), opentelemetry.io, accessed June 2026. https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/

[^2]: OpenTelemetry, "Semantic Conventions for GenAI agent and framework spans" (semconv 1.41.1), opentelemetry.io, accessed June 2026. https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/

[^3]: Langfuse, "OpenTelemetry (OTEL) for LLM Observability," langfuse.com/docs, accessed June 2026. https://langfuse.com/docs/opentelemetry/get-started

[^4]: LangChain Team, "Introducing OpenTelemetry support for LangSmith," blog.langchain.com, December 9, 2024. https://blog.langchain.com/opentelemetry-langsmith/

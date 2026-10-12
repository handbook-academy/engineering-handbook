---
title: "AI infrastructure patterns"
description: "The four AI-specific infrastructure components: vector stores in production, semantic caching, durable agent job queues, and embedding pipelines. Everything generic cross-links to HLD."
slug: 07-ai-infrastructure-patterns
part: 10
chapter: 7
difficulty: intermediate
prerequisites:
  - part-6-retrieval-augmented-generation/02-embeddings-and-vector-search
  - part-6-retrieval-augmented-generation/08-production-rag
  - part-7-agent-engineering/08-long-running-agents
  - part-7-agent-engineering/06-agent-memory-and-task-state
tags: [llm, deployment, cost]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# AI infrastructure patterns

Your RAG system is serving answers from two weeks ago and you have no idea. Your semantic cache is happily returning user A's account balance to user B because their questions had cosine similarity 1.0. Your agent is re-sending the same email five times because the worker crashed mid-run and the retry started from scratch. Your IVFFlat index recall has quietly drifted from 0.98 to 0.85 over the last week of writes, and nothing in your monitoring noticed.

This chapter is the four pieces of infrastructure that have AI-specific failure modes worth understanding. Not Postgres. Not Redis. Not Kafka. Those have mature generic guides; the HLD Handbook owns them. What's here is the AI-specific delta on top: vector stores, semantic caches, agent job queues, and embedding pipelines.

The unifying tension across all four is freshness versus cost. Every component trades how quickly new data appears against how much compute or storage it takes to make that happen. The unifying anti-pattern is treating these as drop-in replacements for their generic siblings; the AI-specific failure modes don't show up in the generic monitoring.

## Vector stores in production

A vector store persists embeddings, exposes an approximate-nearest-neighbor query interface, and maintains an index that trades recall for query speed. The operational lifecycle differs from a relational database in three places worth knowing.

**Index types and their operational profiles.**

pgvector HNSW (as of v0.8.2, February 2026) supports inserts without a full rebuild. Parameters that matter operationally: `m` (default 16, edges per node, higher is better recall but more RAM), `ef_construction` (default 64, build accuracy), and `hnsw.ef_search` (default 40, query-time scan width, set per connection).[^1]

pgvector IVFFlat is online-friendly for inserts but its centroids are computed once at build time. As writes accumulate and the data distribution shifts, centroids become unrepresentative and recall degrades. Practitioner reports describe IVFFlat recall dropping from 0.98 to 0.85 within a week at 100K new embeddings per week, recovering only after `REINDEX INDEX CONCURRENTLY`. Schedule rebuilds after every 100K new rows or whenever the dataset doubles.[^1]

Pinecone's serverless architecture sidesteps user-facing index management entirely. Writes hit a WAL on S3, are acknowledged in under 100ms, and become queryable within seconds via an in-memory memtable. Compaction (L0 to L1 to L2 slabs) is asynchronous and transparent. Algorithm selection (Ananas for small slabs, PQFS for medium, IVF for large) is per-slab and automatic; you don't tune it.[^2]

**The 2,000-dimension limit.** pgvector HNSW indexes are limited to 2,000 dimensions on the `vector` type and 4,000 on `halfvec`. OpenAI's text-embedding-3-large outputs up to 3,072 dimensions. Teams using it must either truncate via the `dimensions` API parameter, store as `halfvec(3072)` and cast at query time, or accept no HNSW index at all and fall back to sequential scan (O(n) over the full table).[^1] This is a documented constraint, not a configuration oversight.

**Dimension-change migration.** Changing embedding models means the entire vector column must be rebuilt. `vector(1536)` and `vector(1024)` are incompatible types. The standard pattern is dual-column: add a new column with the new dimension, populate it incrementally, build a new HNSW index on it while the old column serves traffic, then swap at the application layer and drop the old column. Treat embedding model upgrades as breaking schema migrations.

The decision rule: pgvector for teams already running PostgreSQL with fewer than ~5M vectors at moderate QPS. Escalate to a dedicated vector database (Pinecone serverless, Qdrant) when vectors exceed 10M, query SLA requires sub-20ms p95, write throughput exceeds a few thousand vectors per second, or you need multi-tenant per-tenant indexes without cross-tenant leakage. Timescale's May 2025 benchmark on 50M 768-dim vectors showed pgvectorscale at 471 QPS at 99% recall vs Qdrant's 41 QPS, but pgvectorscale's index build took 11 hours vs Qdrant's 3.3 hours.[^3]

For the underlying mechanics of HNSW, IVFFlat, and the embedding/index decisions, see [Embeddings and vector search](../part-6-retrieval-augmented-generation/02-embeddings-and-vector-search.md). This chapter covers only the production operational concerns.

## Semantic caching

Semantic caching differs from exact-match key-value caching in one fundamental way: the cache key isn't a byte-identical string but the result of an ANN lookup against stored prompt embeddings. The lookup pipeline:

1. Embed the incoming query
2. Search the cache's vector index for the nearest stored prompt embedding
3. Compare distance to a threshold
4. On hit: return the stored LLM response without calling the model. On miss: call the LLM, then store the new prompt embedding plus response plus metadata

Concrete latency numbers from the GPT Semantic Cache paper (arXiv 2411.05276, December 2024): cache hits at threshold 0.8 returned in approximately 13ms vs roughly 866ms for the LLM API call. Cache hit rates ranged 61.6%-68.8% across FAQ-style categories, with positive hit accuracy 92.5%-97.3%.[^4] Redis documentation claims 30%+ token spend reduction on FAQ workloads without measurable quality regression.[^5]

> [!WARNING]
> **The threshold problem is the central engineering challenge.** UC Berkeley's vCache paper (arXiv 2502.03771, February 2025) demonstrated that correct and incorrect cache hits have highly overlapping similarity distributions: means of 0.84 vs 0.85 on the SemCacheClassification benchmark.[^6] No single static threshold cleanly separates them across all prompts. Set it too loose and you serve wrong answers; too tight and your hit rate collapses.

The practitioner default in production tools (GPTCache, RedisVL, LiteLLM) is a static global threshold, typically 0.8 cosine for narrow domains and 0.9-0.95 for general QA. The documented failure mode: as query distribution grows more diverse, error rate increases monotonically with no stable static threshold. vCache proposes per-embedding dynamic thresholds learned from observed (similarity, correctness) pairs, achieving up to 2x higher hit rate at equivalent error rates and 6x lower errors on the SemCacheLMArena benchmark.[^6]

A working RedisVL implementation:

```python
from redisvl.extensions.cache.llm import SemanticCache
from redisvl.utils.vectorize import HFTextVectorizer

# distance_threshold uses Redis COSINE units [0-2]; 0.1 = strict, 0.5 = loose
llmcache = SemanticCache(
    name="llmcache",
    redis_url="redis://localhost:6379",
    distance_threshold=0.1,
    vectorizer=HFTextVectorizer("redis/langcache-embed-v2"),
)

def ask_with_cache(question: str, llm_fn) -> str:
    results = llmcache.check(prompt=question)
    if results:
        return results[0]["response"]
    answer = llm_fn(question)
    llmcache.store(prompt=question, response=answer)
    return answer
```

The other failure mode that bites every team: cross-tenant cache pollution. Two prompts with high embedding similarity but user-specific correct answers get conflated. "What is my account balance?" from user A matches the same query from user B with cosine 1.0; the cache returns A's answer to B. The fix is mandatory: scope cache entries with metadata filters (tenant_id, user_id, locale, model version) as TAG fields. Redis Search combines ANN lookup with TAG filters in a single query.[^5]

Don't use semantic caching when the query distribution is highly diverse and queries rarely repeat (enterprise document Q&A, multi-turn agent state), or when responses must reflect real-time data, or when responses depend on user-specific state not exposed as filterable metadata.

## Queues for long-running agent jobs

A typical web request completes in under a second. An agent job (multi-step reasoning, tool calls, human-in-the-loop confirmation, LLM inference with retries) can run for minutes to hours. Standard job queues (Celery + Redis, BullMQ + Redis) provide task dispatch and retry but store no durable workflow state: if the worker crashes mid-execution, the task restarts from the beginning. For an agent that has already made three LLM calls, executed two tool calls, and is waiting for a human approval, restarting wastes money and may re-execute side-effecting tools.

The AI-specific requirement is **durable execution**: reconstruct exactly where the agent was after any failure (crashes, deploys, network partitions) without rerunning completed steps. Generic queue mechanics are covered in the HLD Handbook; what changes for AI is checkpoint granularity.

**Temporal** is the production-grade answer.[^7] The core primitive is a Workflow (a function decorated with `@workflow.defn`) that runs as a long-lived state machine. Non-deterministic operations (LLM calls, tool invocations, environment reads) are wrapped as Activities. Every Activity result appends to an immutable Event History. If a worker crashes, the replacement worker replays the Event History to reconstruct workflow state, re-executing only incomplete Activities and skipping completed ones.

The pattern for AI agents:

- LLM calls and tool invocations run as Activities (retried automatically on failure).
- Conversation history, current tool selection, and confirmation state live in Workflow instance variables (durable across restarts).
- User input arrives via Signals (async messages to a running Workflow).
- Conversation state is exposed via Queries (synchronous reads from a running Workflow).

```python
from temporalio import workflow, activity
from dataclasses import dataclass
from datetime import timedelta

@dataclass
class AgentInput:
    goal: str

@activity.defn
async def call_llm(prompt: str) -> str:
    # Non-deterministic call wrapped as Activity. Result persists to Event History;
    # crash recovery reads the result instead of re-calling the model.
    raise NotImplementedError  # replace with actual LLM call

@workflow.defn
class AgentWorkflow:
    def __init__(self) -> None:
        self._inbox: list[str] = []

    @workflow.run
    async def run(self, inp: AgentInput) -> str:
        await workflow.wait_condition(lambda: bool(self._inbox))
        user_msg = self._inbox.pop(0)
        return await workflow.execute_activity(
            call_llm, user_msg,
            start_to_close_timeout=timedelta(seconds=30),
        )

    @workflow.signal
    async def user_message(self, msg: str) -> None:
        self._inbox.append(msg)
```

Two operational details worth knowing. **Continue-As-New** is required for long-running agents because Event Histories grow without bound; when message count exceeds a threshold, generate a 2-sentence summary via an LLM Activity, pass it as the starting state of a new Workflow Execution, and close the old one. **Task queue isolation** prevents a burst of cheap embedding tasks from starving expensive long-running agent Workflows; separate task queues per agent type, autoscale workers via Kubernetes HPA keyed to queue depth (LLM workers are I/O-bound, not CPU-bound).

For simpler stateless tasks (fire-and-forget embedding jobs, sequential chains), Celery + Redis is fine. The operational failure to avoid: configure `task_acks_late=True`, `task_reject_on_worker_lost=True`, and a dead-letter queue. Without those, a Celery worker that crashes mid-task silently restarts the task, potentially re-executing side-effecting tools. For the queue mechanics themselves (broker setup, retry backoff, DLQ patterns), see HLD's [Message queues and streaming](../../hld/part-2-building-blocks/08-message-queues-streaming.md) chapter.

## Embedding pipelines

An embedding pipeline transforms source documents into vector representations and upserts them into a vector store. The InfoWorld framing is exactly right: "Embedding pipelines are fundamentally a data engineering problem, not an entirely new AI discipline. It's still ETL at its core, but with embeddings and vector stores as the destination instead of a warehouse."[^8]

Three stages, mapped onto ETL: ingestion (fetch raw documents, detect changes), chunking (split, normalize), indexing (embed each chunk, upsert into the vector store).

**Batch vs incremental.** Batch re-embeds the entire corpus on a schedule. Simple to implement; freshness lag equals the batch interval. At OpenAI text-embedding-3-small pricing ($0.02 per 1M tokens, June 2026) and ~500 tokens per chunk, embedding 1M documents costs around $10 per run; 10M documents, $100 per run. Acceptable when source documents change infrequently.

Incremental uses a Change Data Capture mechanism to detect which documents changed since the last run and re-embeds only those. Requires a document manifest (content hash plus timestamp plus embedding model version). Reported numbers: 2-5 seconds of staleness, 60% cost reduction vs full re-indexing.[^9]

```python
import hashlib
from dataclasses import dataclass
from typing import Optional

EMBEDDING_MODEL_VERSION = "text-embedding-3-small-v1"

@dataclass
class ManifestEntry:
    doc_id: str
    content_hash: str
    model_version: str
    last_embedded_at: float

def compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()

def needs_re_embedding(doc_id: str, content: str, manifest: dict) -> bool:
    """True if document is new, changed, or was embedded with a different model."""
    entry: Optional[ManifestEntry] = manifest.get(doc_id)
    if entry is None:
        return True
    if entry.content_hash != compute_hash(content):
        return True
    if entry.model_version != EMBEDDING_MODEL_VERSION:
        return True
    return False
```

**Model versioning is the silent correctness problem.** Every chunk in the vector store must be tagged with the embedding model name and version that produced it. When you upgrade models, vectors from the old model aren't geometrically comparable to vectors from the new one. A hybrid index containing both generations produces silent recall degradation: the new model's query vector won't cluster near the old model's document vectors. From the InfoWorld article: "Vectors produced by different versions are not comparable in a reliable way. You cannot safely search across them as if they are interchangeable."[^8]

The migration discipline is the same as for vector store dimension changes: add a new vector column, run the new model over all documents asynchronously, build a new index on the new column, flip the query layer, drop the old column. The old column serves live traffic during the migration window.

Production embedding pipeline components, all decoupled via queues:

- **Source connector** watching document stores (S3, Confluence, Postgres, Git) for changes
- **Manifest store** tracking hash + model version + last-embedded-at per document
- **Chunking service** with versioned chunking config; config changes trigger re-chunking
- **Embedding service** that batches calls (OpenAI supports up to 2,048 inputs per request)
- **Vector store writer** that does bulk upserts (`COPY` for initial load, `INSERT ON CONFLICT DO UPDATE` for incremental)
- **Queue between stages** so a temporarily-unavailable embedding service doesn't drop documents

The architectural decision that causes the most production incidents: coupling the embedding pipeline to the online query path. If batch ingestion stalls, retrieval should stay available. Monitor pipeline health metrics separately from query-path metrics: embedding throughput (chunks/min), last successful run timestamp, pending queue depth. Alert when `last_embedded_at` for the newest documents hasn't advanced in more than 2x the expected pipeline interval.

## Where this leaves you

The four components have one thing in common: their generic siblings work fine in isolation, but the AI-specific failure modes (silently mixed embedding versions, false-positive cache hits, agents losing state mid-run, IVFFlat recall drift) are invisible to standard monitoring. You won't get an HTTP 500 when your semantic cache crosses tenants, when your IVFFlat index degrades, or when your embedding pipeline stalls. You'll get HTTP 200 with subtly wrong content, which is the same pattern as every other failure mode in [SLOs and incident response](06-slos-and-incident-response.md).

Build the AI-specific monitoring before you ship: vector recall spot-checks, cache hit-correctness audit (sample cached responses and compare to fresh LLM calls), embedding pipeline freshness alerts, and durable workflow state inspection. The generic monitoring stack will catch zero of these.

For the foundational generic infrastructure (queue mechanics, Redis caching, Postgres scaling, Kafka, Kubernetes), the [HLD Handbook](../../hld/) is the reference. This chapter is intentionally narrow: only the AI-specific delta. That delta is small but load-bearing, and most of the production incidents in 2025-2026 happened in that small overlap.

## References

[^1]: pgvector contributors, "pgvector CHANGELOG and README", versions 0.5.0 through 0.8.2, August 2023 to February 2026, https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md
[^2]: Pinecone, "How Pinecone Works: Architecture and Engineering Deep Dive", 2025-2026, https://www.pinecone.io/how-pinecone-works/
[^3]: Timescale, "pgvector vs Qdrant: 50M Vector Benchmark", May 2025, https://www.timescale.com/blog/pgvector-vs-qdrant
[^4]: Sajal Regmi and Chetan Phakami Pun, "GPT Semantic Cache: Reducing LLM Costs via Semantic Embedding Caching", arXiv:2411.05276, December 2024, https://arxiv.org/html/2411.05276v3
[^5]: Redis, "Redis semantic cache", official documentation, 2025-2026, https://redis.io/docs/latest/develop/use-cases/semantic-cache/
[^6]: Luis Gaspar Schroeder et al., "vCache: Verified Semantic Prompt Caching", arXiv:2502.03771, February 2025, https://arxiv.org/html/2502.03771v3
[^7]: Temporal, "How To Build a Durable AI Agent with Temporal and Python", official tutorial, July 2025, https://learn.temporal.io/tutorials/ai/durable-ai-agent/
[^8]: Chisom Nwokwu, "Embedding pipelines are the new ETL", InfoWorld, June 2026, https://www.infoworld.com/article/4181232/embedding-pipelines-are-the-new-etl.html
[^9]: markaicode.com, "Vector Database Architecture with LlamaIndex: Production Blueprint for High-Throughput RAG", 2026, https://markaicode.com/architecture/vector-database-architecture-with-llamaindex/

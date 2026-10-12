---
title: "Production RAG"
description: "The five operational concerns that turn a RAG prototype into a system you can run: incremental indexing, the reindex tax, multi-tenant isolation, metadata filtering, and per-stage latency budgets."
slug: 08-production-rag
part: 6
chapter: 8
difficulty: advanced
prerequisites:
  - 02-embeddings-and-vector-search
  - 03-hybrid-search-and-reranking
  - 07-evaluating-retrieval
tags: [llm, rag]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# Production RAG

Your RAG answered correctly yesterday. Today it contradicts itself. Nothing obvious changed, except your embedding provider quietly shipped a model update overnight, and your index is now a Frankenstein of two incompatible vector spaces.[^1]

That's the lesson production teaches that the prototype never does. A RAG index isn't a pipeline you run once at setup; it's a stateful database that drifts, accumulates orphans, leaks across tenants, and silently degrades whenever something upstream moves. Five concerns separate a demo from a system you can actually operate: keeping the index current as documents change, surviving an embedding-model upgrade, isolating tenants safely, filtering metadata without destroying recall, and budgeting latency per stage. They interact. Pick the wrong default on any one of them and the others compound.

## Incremental indexing: hash before you embed

A naive indexing pipeline re-embeds every document on every run. It's fine on a 200-document demo and ruinous on a 10M-chunk corpus, where you're paying the embedding API to do the same work over and over. The fix is one cheap line: hash the chunk's normalized text first, and only call the API if the hash changed.

```python
import hashlib
import re

def compute_chunk_hash(text: str) -> str:
    """Normalize and hash a chunk for change detection."""
    normalized = re.sub(r'\s+', ' ', text.strip().lower())
    return hashlib.sha256(normalized.encode()).hexdigest()

def should_reembed(chunk_id: str, new_hash: str, hash_store: dict) -> bool:
    return hash_store.get(chunk_id) != new_hash
```

Normalize before hashing or you'll re-embed every doc that picked up trailing whitespace from a CMS save. With this guard, a typical enterprise pipeline only re-processes 10 to 15% of content per run instead of 100%, because most documents don't actually change between runs.[^2] Store the hashes either in a Redis sidecar keyed by chunk ID or as metadata on the vector record itself. The metadata-on-vector option is one fewer system to operate; the Redis option keeps the vector payload thin.

Three modes, with one default:

- **Real-time (event-driven).** The CMS or repo emits a webhook on change; the pipeline processes that document only. Staleness near zero, but you have to instrument the source. Reserve for content where seconds matter (live pricing, on-call runbooks).
- **Micro-batch (every 5 to 15 minutes).** The default. Hash-diff against the store, process the deltas, commit. Good blast radius, predictable cost.
- **Scheduled batch (hourly or nightly).** Same hash logic, larger window. Use for internal tools where users tolerate hours of staleness in exchange for batched API discounts.

The rule is: pick micro-batch first; escalate to real-time only when the product genuinely depends on it.

The failure mode nobody warns you about is **orphan accumulation**. When a document is deleted or re-chunked, the old vectors stay in the index unless you sweep them. Over months the orphan share creeps up, the HNSW graph grows nodes that point at nothing, and p95 retrieval latency drifts upward without an obvious cause. After every pipeline run, compute `orphan_ids = indexed_ids - current_chunk_ids` and delete in batches. Run it with `dry_run=True` first so you can sanity-check the size of the set before you actually delete.

## The reindex tax: why an embedding upgrade isn't free

Every embedding model defines its own coordinate system. A vector from `text-embedding-3-large` and a vector from `text-embedding-ada-002` aren't comparable, even nominally, because the two models organized their high-dimensional space using completely different geometries. Mixing them in one index doesn't error; it just returns nonsense. Half your corpus lives in one space, queries arrive in another, and cosine similarity returns whatever the math happens to compute.

So every embedding-model upgrade forces a full re-embed of the entire corpus that the new queries will be compared against. That's the reindex tax, and it's the most underestimated cost in production RAG. Raw embedding cost is the cheap part: a 10M-token corpus on `text-embedding-3-small` costs about $0.20 at $0.02 per million tokens (as of mid-2026, with a 50% Batch API discount available).[^3] A 1B-token enterprise corpus is $20. The expensive part is the migration window, where you're either serving stale results or running two indexes in parallel.

The pattern that works is **blue-green migration**, borrowed from web ops. Build the new index next to the old one, validate it against a fixed set of golden queries, then atomically swap traffic with an alias.

![A horizontal flow showing the old index serving live traffic on the left while a new index builds in parallel on the right, a golden-query checker comparing both indexes in the middle, and a coral alias arrow at the top swinging from old to new at the moment of cutover](images/08-blue-green-reindex.png)
*Build the new index in parallel; validate against golden queries; swap one alias to cut over.*

The query path reads a feature flag and routes to whichever index the flag points at. Rollback is flipping the flag, not redeploying code:

```python
import os

EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
EMBED_DIMENSIONS = int(os.getenv("EMBED_DIMENSIONS", "1536"))
USE_V2_EMBEDDINGS = os.getenv("USE_V2_EMBEDDINGS", "false").lower() == "true"

def get_query_index() -> str:
    return "index_v2" if USE_V2_EMBEDDINGS else "index_v1"
```

Before the swap, run a golden-query overlap check: take 50 to 200 known-good queries, run them against both indexes, measure result-set overlap at top-10. One documented `ada-002` to `text-embedding-3-large` migration reported 82% overlap as their go signal.[^4] Lower overlap isn't necessarily bad (a better model *should* surface different documents on edge queries) but it's a signal to inspect the diffs by hand before flipping the flag. Keep both indexes live for 24 to 48 hours after cutover so you can roll back without re-embedding.

A smaller reindex lever worth knowing: the `text-embedding-3` family supports a `dimensions` parameter that truncates embeddings via Matryoshka representation learning. Passing `dimensions=256` instead of the default 1536 cuts vector storage and ANN search cost by more than 80% with sub-1% recall loss in practitioner benchmarks.[^5] That's not free quality, but for most RAG workloads it's the right place to spend a percent of recall.

What forces a full reindex: changing the embedding model, changing the chunking strategy, or changing both. What doesn't: adding a new metadata field on existing vectors, updating a document's content (only the changed chunks re-embed thanks to the hash guard).

## Multi-tenant isolation: filter before retrieval, not after

The most common multi-tenant RAG bug looks like this in tutorials and even in production code:

```python
# DO NOT DO THIS
results = vector_db.query(embedding=q, top_k=10)
results = [r for r in results if r.metadata["tenant_id"] == user.tenant_id]
```

That's security theater. By the time the filter runs, documents from other tenants have already been ranked, scored, and (in the worst case) included in the LLM's context. Even if you strip them from the response, the model has already conditioned its answer on them. Adversarial documents are even worse: prompt injection attacks against post-filtered RAG systems succeed about 80% of the time, because hostile instructions execute at the LLM layer before any application filter fires.[^6]

The rule is simple: **enforce isolation before the vector search runs.** Three patterns deliver that, and the right one depends on tenant count and authorization complexity.

**Per-tenant namespaces (structural isolation).** Give each tenant a physically separate namespace, collection, or shard. The query path passes `tenant_id` to select *which* index to search, never as a filter inside one shared index. No filter expression can be misconfigured to leak across tenants because there's nothing to misconfigure. Pinecone supports up to 100,000 namespaces per index on the Enterprise plan and 25,000 on Standard (released December 2024).[^7] Weaviate handles this through dedicated shards per tenant, and Milvus exposes a database/collection/partition-key hierarchy where databases give you full RBAC and physical resource groups.[^8] Default this when you have under ~10K tenants and hard data-siloing requirements.

**PostgreSQL row-level security (kernel enforcement).** When you're already on pgvector, RLS pushes the tenant check below your application code into the database kernel:

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON documents
  USING (tenant_id = current_setting('app.tenant_id'));
```

Each query is preceded by `SET app.tenant_id = 'acme'`. If a future code change drops the application-level filter, the database still refuses to return rows from other tenants. RLS reportedly cuts isolation infrastructure cost by up to 30% versus separate per-tenant databases on shared workloads.[^9] The trap is connection pool contamination: if a pooled connection is returned with `app.tenant_id` still set from the previous request, the next request executes against the wrong tenant's data, silently. Always reset session variables (`DISCARD ALL`) before returning a connection to the pool, and add a pre-query assertion that `current_setting('app.tenant_id')` matches the authenticated principal.

**Pre-filter ACL with an authorization service.** When tenant count exceeds 100K or authorization runs at the document level (not the tenant level), you fetch the allowed document IDs first, then constrain the vector search:

```python
allowed_doc_ids = auth_service.get_authorized_documents(user_id)
results = vector_db.query(
    embedding=query_embedding,
    where={"doc_id": {"$in": allowed_doc_ids}},
    limit=10,
)
```

The `$in` clause starts breaking around 50K IDs (most vector DBs reject or degrade on huge `$in` expressions), so pair this with a real authorization framework (Cerbos, Permit.io) that keeps policy logic out of your application code.

One vulnerability cuts across all three patterns: **filter injection.** If the `tenant_id` value in your filter expression comes from the request body, an adversary can pass `{"$ne": "their-tenant"}` and rewrite a tenant-scoping filter into an all-tenant query. The `tenant_id` value must come from the authenticated session, never from user-supplied input. Validate it server-side and reject anything that doesn't match the authenticated principal.

There's also a subtler trap in agent-based retrieval, the **confused deputy.** When an agent retrieves on behalf of a user, the agent's service credentials usually have broader access than the user does. Without scoped credentials, the user receives documents they were never authorized to see, and no authorization check ever fires because every check passed for the agent. Pass a user-scoped token through the entire retrieval chain instead of letting the agent retrieve under its own identity.

## Metadata filtering: the HNSW recall cliff

Once tenant isolation is solved structurally, you still have legitimate metadata filters: `doc_type = "policy"`, `language = "fr"`, `published_after = 2025-01-01`. These look harmless. They aren't, on a graph-based ANN index.

Two strategies, neither one obvious:

- **Post-filter.** Run ANN search, then apply the filter to the results. If the filter passes 5% of documents, retrieving the top 100 leaves you with about 5 hits, well below your top-10 target. To get 10 useful results you have to fetch hundreds, blowing the latency budget.
- **Pre-filter.** Compute the matching set first, then search only over it. For small filtered sets (under ~10K documents) brute-force is genuinely fast because the array fits in cache. For large filtered sets it scales linearly and gets unacceptably slow.

The real problem is graph disconnection. HNSW is a navigable small-world graph; you traverse from an entry point through nearest neighbors. If the standard pre-filter strategy skips non-matching nodes during traversal, the graph can disconnect: there's no path from the entry point to the region that contains your filter-matching results. This degrades worst when the filter is *negatively correlated* with the query vector. Consider a query for "diamond rings" with a price filter under $50. Cheap items live far from "diamond rings" in embedding space, so the path the graph wants to take never goes near the filter-passing region.[^10]

Weaviate 1.27 (November 2024) and Elasticsearch 9.1 ship **ACORN**, an algorithm that solves this with two-hop expansion: when traversal lands on a filter-failing node, ACORN looks at that node's neighbors directly, keeping connectivity intact without counting the failing node as a candidate. On the negatively-correlated filter case at 20% selectivity, ACORN delivered up to 10x higher throughput at the same recall versus the prior strategy; the ACORN paper reports 2x to 1000x improvement at fixed recall depending on selectivity.[^10][^11] Modern vector DBs detect when ACORN helps and switch back to standard HNSW automatically when selectivity is high.

The takeaway: don't write off filtering as "obviously cheap." Test your real filter selectivity against your real corpus, and if your DB doesn't support ACORN-style filtered search, prefer structural isolation (separate namespaces) over high-cardinality filter expressions for anything resembling authorization.

## Per-stage latency budgets

A 2-second p95 SLA isn't a single number; it's a budget you allocate across four serial stages. Engineers who don't budget by stage discover the bottleneck only at p95 under load, in production, on the worst possible day.

| Stage | p50 target | p95 target | Notes |
|---|---|---|---|
| Query embedding | 30-50ms | 80-120ms | Cache hit: 3-15ms; local model: 5-20ms |
| Vector retrieval | 15-30ms | 50-150ms | Grows with corpus size and filter complexity |
| Reranking (optional) | 50-150ms | 200-400ms | Eats up to 65% of retrieval budget when present |
| LLM generation | 500-1000ms | 1500-2000ms | Dominates p95; TTFT is what users feel |
| **End-to-end** | **~600ms** | **~2.5s** | Common enterprise RAG target |

Sources for the per-stage ranges: practitioner architecture analyses for PyTorch and Anthropic-based RAG pipelines, which put a typical vector DB query at 50-300ms of added latency, enough to push a voice pipeline past the roughly 200ms turn-gap that reads as natural conversation.[^12]

Two things in this table surprise people. First, generation eats 80% of the budget, so retrieval and embedding together can't exceed about 300ms before you start clipping the SLA. Second, a cross-encoder reranker sounds cheap but quietly consumes most of the non-generation headroom. Top-20 candidates through a BERT-sized reranker is 200-400ms p95. If the retrieval budget can't absorb that, the reranker either has to be parallelized, downsized to MiniLM-L6, or dropped on queries where it doesn't earn its keep.

The optimization levers per stage:

- **Embedding:** cache query embeddings in Redis keyed by the normalized query string with a 1-hour TTL; >80% hit rate cuts the p95 stage time from 80ms to 15ms.[^13] Or use a local sentence-transformers model and eliminate the network round trip entirely, trading GPU memory for latency floor.
- **Retrieval:** tune HNSW's `ef` parameter (search expansion factor); lower `ef` is faster at the cost of recall. Track recall on your golden-query set so you don't tune the SLA into garbage results.
- **Reranking:** cap the candidate set at top-20 before reranking, skip reranking on keyword-heavy queries where ANN already nails it, and reach for a smaller cross-encoder when latency matters more than the marginal recall gain.
- **Generation:** stream tokens. A 500ms time-to-first-token feels fast to a user even when total generation runs to 2 seconds. Never block the streaming path on post-retrieval work; do citations and faithfulness checks in parallel.

Two architectural rules sit on top of the per-stage budget. **Ingestion never sits on the query path.** Documents are processed asynchronously through a queue (Redis Streams, Kafka). The query path reads only from the committed index and never blocks on an embedding API call. Violating this rule guarantees latency spikes whenever a burst of document changes hits the pipeline.

**Set per-stage circuit breakers.** At 500 QPS, a single slow embedding provider or a reranker under GPU pressure degrades every request. Pick a hard timeout per stage with a defined fallback: embedding exceeds 200ms, fall back to cached or approximate; reranking exceeds 300ms, return ANN results directly. Failing one stage should degrade gracefully, not cascade into the SLA.

For the dashboards and per-stage p50/p95 monitoring that make this budget enforceable, the architecture-scale view lives in [Vector Search at Scale](../../hld/part-9-ai-ml-system-design/02-vector-search-at-scale.md) on the HLD side. The principle in this chapter is the budget; the principle there is the telemetry that proves the budget holds under real traffic.

## References

[^1]: Tian Pan, "Embedding Models in Production: Versioning and Index Drift," tianpan.co, April 2026. https://tianpan.co/blog/2026-04-09-embedding-models-production-versioning-index-drift

[^2]: Hou C., "Incremental Re-indexing and the Embedding Pipeline Nobody Talks About," Prompt/Deploy, April 2026. https://prompt-deploy.beehiiv.com/p/incremental-re-indexing-and-the-embedding-pipeline-nobody-talks-about

[^3]: OpenAI, "API Pricing: Embeddings," developers.openai.com, accessed June 2026. https://developers.openai.com/api/docs/pricing

[^4]: Hou C., "Incremental Re-indexing and the Embedding Pipeline Nobody Talks About," Prompt/Deploy, April 2026; the same walkthrough documents an `ada-002` to `text-embedding-3-large` migration using 82% golden-query overlap as the cutover signal. https://prompt-deploy.beehiiv.com/p/incremental-re-indexing-and-the-embedding-pipeline-nobody-talks-about

[^5]: Markaicode, "Reduce embedding cost with OpenAI's `dimensions` parameter," markaicode.com, 2026. https://markaicode.com/integrate/reduce-embedding-cost-openai/

[^6]: Tian Pan, "Vector Store Access Control: The Row-Level Security Problem Most RAG Teams Skip," tianpan.co, April 2026. https://tianpan.co/blog/2026-04-17-vector-store-access-control-rag-rls

[^7]: Pinecone, "Namespaces and multitenancy," Pinecone docs and December 2024 release notes. https://docs.pinecone.io/

[^8]: Robert Guo, "Designing Multi-Tenancy RAG with Milvus: Best Practices for Scalable Enterprise Knowledge Bases," Zilliz Blog, December 2024. https://zilliz.com/blog/build-multi-tenancy-rag-with-milvus-best-practices-part-one

[^9]: Markaicode, "PostgreSQL for RAG: cost and isolation patterns," markaicode.com, 2026. https://markaicode.com/usecases/postgresql-for-rag/

[^10]: Weaviate Engineering, "How we speed up filtered vector search with ACORN," Weaviate Blog, November 2024. https://weaviate.io/blog/speed-up-filtered-vector-search

[^11]: Patel et al., "ACORN: Performant and Predicate-Agnostic Search Over Vector Embeddings and Structured Data," arXiv:2403.04871, 2024. https://arxiv.org/abs/2403.04871

[^12]: Practitioner architecture analyses of PyTorch- and Anthropic-based RAG pipelines, markaicode.com, 2026, reporting 50-300ms typical vector-store query overhead in voice pipelines. Secondary sources; treat the ranges as directional. https://markaicode.com/

[^13]: Markaicode, "RAG architecture with Grafana: cache hit rate and observability," markaicode.com, 2026. https://markaicode.com/architecture/rag-architecture-with-grafana/


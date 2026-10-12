---
title: "Hybrid search and reranking"
description: "Why BM25 still beats vector search on exact terms, how to fuse them with RRF, and when a reranker earns its latency."
slug: 03-hybrid-search-and-reranking
part: 6
chapter: 3
difficulty: intermediate
prerequisites:
  - 02-embeddings-and-vector-search
  - part-1-how-models-behave/03-embeddings
tags: [llm, rag, search]
date_created: 2026-06-12
date_updated: 2026-08-31
---

# Hybrid search and reranking

A user types `E7-492-B` into your support search. It's a firmware error code that started showing up in three documents you indexed last Tuesday. Your dense retriever returns five articles about thermostat batteries. None of them mention the code. The exact string sits in your index, untouched, ranked 47th.

This is the failure mode that killed pure vector RAG in production. A bi-encoder compresses every chunk into a 1,024-dimensional vector. That compression is great at "skincare routine" matching "moisturizer guide". It's terrible at preserving a token that appeared 0 times in the encoder's training data. The encoder embeds `E7-492-B` somewhere near phonetically similar tokens with no semantic relationship to the document, and cosine similarity does the rest.[^1]

The fix isn't a better embedding model. It's a second retriever that doesn't compress at all.

## Why BM25 still wins on exact terms

BM25 is a 1994 keyword ranking function from City University London that, after 32 years of "this will be replaced any day now," still runs in roughly every production search system you've used.[^2] The reason is a property dense vectors can't replicate: zero representation drift. Every distinct token in your corpus gets its own entry in an inverted index. A new SKU, a new error code, a new person's name: index it on Tuesday, retrieve it perfectly on Wednesday.

The score for one term in one document is short enough to write on a napkin:

```python
import math

def bm25_score(tf, df, n_docs, dl, avgdl, k1=1.2, b=0.75):
    """One term, one document. Sum across query terms for the full score."""
    idf = math.log((n_docs - df + 0.5) / (df + 0.5) + 1)
    tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avgdl))
    return idf * tf_norm
```

Two parameters carry the whole design. `k1=1.2` saturates term frequency: the 10th time a word appears in a document scores far less than the 1st, so a spammy page that repeats your query 50 times can't dominate. `b=0.75` length-normalizes: a 50-page document doesn't get a free hit just because it's long enough to incidentally contain rare terms.[^3] The defaults have held for two decades; you almost never tune them.

What BM25 can't do is synonymy. Search "car"; miss "automobile". Search "skincare routine"; miss the article titled "moisturizer guide for sensitive skin." A May 2026 Elasticsearch case study on a 1,000-product catalog measured the gap directly: BM25 alone scored Recall@10 = 0.43 across mixed-intent queries; adding dense retrieval and fusing the two pushed it to 0.75.[^4] The relevant documents existed in the index. BM25 just couldn't see them through the vocabulary mismatch.

So you run both. BM25 catches the exact tokens; the dense retriever catches the paraphrases. Then you have a new problem: how to merge two ranked lists.

## Reciprocal Rank Fusion: the cheapest thing that works

The naive approach is to add the scores. This breaks. BM25 produces unbounded positive numbers whose scale depends on the corpus; cosine similarity is bounded in `[-1, 1]`. A typical BM25 hit might score 12.4 while a typical cosine hit scores 0.84. Average them and BM25 wins by default, even when it shouldn't.[^5]

You can normalize, weight, and recalibrate. Or you can throw away the scores entirely and just use the ranks. That's Reciprocal Rank Fusion, introduced by Cormack, Clarke, and Buttcher at SIGIR 2009 and still the default in Elasticsearch, OpenSearch, Qdrant, Pinecone, and Azure AI Search 17 years later.[^6][^7]

The formula is one line:

```python
from typing import Dict, List

def rrf_fuse(ranked_lists: List[List[str]], k: int = 60) -> List[tuple]:
    """Fuse N ranked lists by rank position alone. Cormack et al., SIGIR 2009."""
    scores: Dict[str, float] = {}
    for ranked in ranked_lists:
        for rank, doc_id in enumerate(ranked, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

A document ranked first in both lists scores `2/61 = 0.0328`. First in one list, missing from the other, scores `1/61 = 0.0164`. The constant `k=60` comes straight from the original paper and has stayed the default everywhere ever since; you only tune it if you've already squeezed out every other gain.[^7]

![A side-by-side comparison showing two ranked retrieval lists merging via reciprocal rank fusion, with BM25 results on the left, dense vector results on the right, both feeding into a central fused list ordered by RRF score; one document appears in both lists and rises to the top of the merged list, illustrating how documents that rank well in both retrieval modes get amplified](images/03-rrf-fusion.png)
*Two ranked lists merge by rank position alone. The document that scores well in both retrievers wins.*

The Elasticsearch team published a `linear` retriever in May 2025 that goes the other way: normalize the scores with min-max, then weight them.[^5] It can outperform RRF on workloads where score magnitude carries real signal: a query term that appears verbatim and frequently produces an outlier BM25 score that RRF flattens to "rank 1, score 1/61". The catch is calibration. Score distributions shift every time you bulk-load documents; a legal discovery platform reported a 30% recall drop after importing 200K new files because BM25 scores surged while cosine stayed stable, and the old fusion weights silently became wrong.[^8] If you don't have a held-out evaluation set and a job that reruns the grid search nightly, RRF is the safer default. It's robust to score drift by construction.

## When hybrid hurts

"Always use hybrid" is the consensus advice, and it's wrong on at least one important class of corpus.

NirantK at Superlinked ran an 8-condition ablation on 1,854 queries over six bank 10-K filings: 2,942 pages, 8,766 relevance judgments, all numbers published.[^9] On that corpus, vector-only NDCG@10 was 0.396. Hybrid RRF (BM25 + vector) was 0.358. Hybrid was *worse*. The financial 10-K text is dense, technical, and semantically uniform; the rare-token signal that BM25 thrives on barely exists, so adding BM25 to the fusion only added noise. RRF treats every list equally and a low-quality ranking dilutes a high-quality one because every document in the bad list still contributes a non-zero score.

The lesson isn't "skip hybrid." It's "measure on your data." If your corpus has product codes, person names, error strings, version numbers, or any vocabulary your encoder was never trained on, hybrid will help, often by 15 to 35 points of recall.[^8] If your corpus is uniformly dense prose where exact-token queries are rare, run the ablation before you ship; the second retriever may be a tax with no benefit.

## Rerankers and the diminishing-returns curve

Hybrid retrieval gives you a candidate list. Most of it is noise. The standard production pattern keeps 25 to 50 candidates, then runs a third stage that scores each one against the query directly.

A cross-encoder reranker is a different shape from the bi-encoder you used for retrieval. The bi-encoder embeds query and document independently, then compares the vectors; that's why it's fast enough to run on millions of documents. The cross-encoder concatenates `[CLS] query [SEP] document [SEP]` and runs one full transformer forward pass per pair. Attention heads see both at once, which lets them detect term overlap, negation, and fine-grained mismatch that cosine similarity smooths over. The cost is O(k) forward passes per query, which is why you only run it on a short candidate list, never on the corpus.[^10]

The quality lift is large enough to dominate every other architectural choice in the Superlinked ablation. Vector-only scored 0.396 NDCG@10. Hybrid RRF scored 0.358. Adding a cross-encoder reranker (mxbai-rerank-large) over the hybrid pool jumped to 0.600, a bigger gain than any retrieval tweak.[^9] Across MTEB and BEIR benchmarks, typical reranker gains run +5 to +15 NDCG@10 points, often the difference between a usable RAG system and one that gets the right answer.[^11]

Now the twist. More candidates is not better.

A November 2024 paper from Jacob, Lindgren, Zaharia, and collaborators ran cross-encoders on candidate sets from 10 up to 1,000 and found a clear non-monotonic curve: quality climbs from 10 to roughly 50-100 candidates, then *degrades* as you add more.[^10] Past the threshold, rerankers "frequently assign high scores to documents with no lexical or semantic overlap with the query." The model was trained on negatives that were plausible-but-wrong; deeply unrelated documents are out of distribution, and the model's confidence becomes uncalibrated noise.

![A line chart showing reranker quality measured in NDCG at 10 on the y-axis against the number of candidates passed to the cross-encoder on the x-axis, ranging from 10 to 500; the curve rises sharply from 10 to a peak around 50 candidates, plateaus through 100, then declines noticeably past 200, with a horizontal dotted line marking the no-reranker baseline below the peak](images/03-reranker-curve.png)
*Reranker quality peaks around 50 to 100 candidates and degrades past it. Passing 500 candidates makes the system worse, not better.*

The practical rule that comes out of this: pass 25 to 50 candidates from your hybrid retrieval to the reranker, return the top 5 to 10 to the LLM. Push to 100 only when recall matters more than latency (legal discovery, compliance search). Never pass the full corpus; that's an O(N) forward pass that defeats the entire point of having a fast first stage.[^12]

```python
# pip install cohere; COHERE_API_KEY in env
from typing import List
import cohere

def rerank_top_k(query: str, candidates: List[str], top_n: int = 5) -> List[dict]:
    """Pass 25-50 candidates from hybrid retrieval. Diminishing returns past ~100."""
    co = cohere.Client()
    response = co.rerank(
        query=query,
        documents=candidates,
        model="rerank-v3.5",
        top_n=top_n,
    )
    return [
        {"index": r.index, "score": r.relevance_score, "text": candidates[r.index]}
        for r in response.results
    ]
```

## Picking a reranker

The reranker market shifts every quarter, so treat any specific recommendation as perishable. The shape of the choice is more stable than the leaderboard.

| Model | Hosting | Pricing (mid-2026) | Context | Best for |
|---|---|---|---|---|
| Cohere rerank-v3.5 | Managed API | $2.00 / 1K queries (up to 100 docs each) | 4,096 tokens | Latency-sensitive English-first apps; fastest in November 2025 ELO benchmarks[^13] |
| Voyage rerank-2.5 | Managed API | $0.05 / 1M tokens (~$0.0025/request) | 32,768 tokens | Quality-sensitive workloads; long documents; "best balance" in the same benchmark[^14] |
| BGE-reranker-v2-m3 | Self-host | Open-weight | 8,192 tokens | Multilingual, on-prem, no per-query cost; 100+ languages[^15] |

Voyage's longer context window matters more than it looks. A 4K-token cap means you either truncate documents that exceed it (potentially losing the relevant span) or chunk them and rerank chunks separately (extra complexity). For long PDFs, transcripts, or code files, the 32K window is the bigger lever than a benchmark point or two.

The latency budget for a 110M-parameter cross-encoder on a single T4 GPU is roughly 45 to 65 ms for 20 candidates, climbing to 100 to 300 ms on CPU.[^16] Managed APIs sit around 50 to 100 ms p50.[^17] In an 800 ms total RAG budget, that's livable. In a 200 ms budget, you skip the reranker and accept the recall hit, or you run a smaller distilled model.

## The LLM-reranker temptation

There's a third option that keeps coming up: skip the cross-encoder, send the candidates to GPT-4o or Claude with a prompt asking for a ranked list. ZeroEntropy's July 2025 benchmark made the trade-off concrete. Listwise LLM reranking scored 0.78 NDCG@10 versus 0.74 for a cross-encoder, a real but modest 5% gain, at 9x the cost and 35x the latency.[^12]

That math kills it for almost every production use case. A coding assistant doing 10,000 reranks a day moves from a $30 cross-encoder bill to a $270 LLM bill, and from 60 ms to 2 seconds of added latency per query. Reserve LLM listwise reranking for the final 5-to-1 cut on extremely high-value queries (medical literature search, legal discovery) where the marginal quality gain is worth the math. For everything else, cross-encoder.

## The 2026 default stack

The architecture that's converged across Elasticsearch, Pinecone, Weaviate, and most production teams I've seen looks like this:

1. **BM25** over an inverted index, returning top 50 to 100.
2. **Dense retrieval** over an HNSW index, returning top 50 to 100.
3. **RRF fusion** with `k=60`, producing a 25-to-50-document candidate list.
4. **Cross-encoder reranker** on the candidate list, returning top 5 to 10.
5. **LLM** receives the 5 to 10 reranked passages as context.

> [!WARNING]
> The most common mistake is asymmetric retrieval depth. If vector search returns 200 candidates and BM25 returns 20, the dense list dominates RRF by sheer count, and your exact-match queries silently regress. Pull the same `k` from both retrievers, or pull more from BM25 if your traffic skews toward exact-token queries (product codes, names, identifiers).

The practice that makes any of this debuggable is logging the per-stage candidates on every query: which docs BM25 returned, which docs the dense retriever returned, what the fused order was, what the reranker did to it. When a customer reports that search missed an obvious result, you reconstruct exactly which stage dropped it. Without that log, you're guessing whether the encoder, the fusion, or the reranker is at fault, and the answer is usually the one you didn't suspect.

At architecture scale, [RAG Pipelines](../../hld/part-9-ai-ml-system-design/01-rag-pipelines.md) and [Vector Search at Scale](../../hld/part-9-ai-ml-system-design/02-vector-search-at-scale.md) cover the whiteboard view of how this stack distributes across shards, coordinating nodes, and reranker fleets serving thousands of queries per second.

## References

[^1]: "BM25, Vector and Reranking Reference 2026," digitalapplied.com, May 2026. https://www.digitalapplied.com/blog/hybrid-search-bm25-vector-reranking-reference-2026
[^2]: "Okapi BM25," Wikipedia, accessed June 2026. https://en.wikipedia.org/wiki/Okapi_BM25
[^3]: "BM25 Okapi Ranking Calculator," metricgate.com, April 2026. https://metricgate.com/docs/bm25-okapi-ranking/
[^4]: Rengifo, J., "How to measure and improve Elasticsearch search recall: from 0.43 to 0.75 with hybrid search," Elasticsearch Labs, May 4, 2026. https://www.elastic.co/search-labs/blog/elasticsearch-relevance-tuning-improve-recall
[^5]: Bailis, P., "Hybrid search revisited: introducing the linear retriever in Elasticsearch!" Elasticsearch Labs, May 28, 2025. https://www.elastic.co/search-labs/blog/linear-retriever-hybrid-search
[^6]: Cormack, G.V., Clarke, C.L.A., Buttcher, S., "Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods," Proc. 32nd ACM SIGIR, 2009. https://dl.acm.org/doi/10.1145/1571941.1572114
[^7]: Elasticsearch Reference, "Reciprocal Rank Fusion (RRF) retriever," Elastic, accessed June 2026. https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html
[^8]: Mark, "Hybrid Retrieval Architecture Best Practices for Production AI Systems [2026]," Markaicode, May 2026. https://markaicode.com/architecture/hybrid-retrieval-architecture-best-practices-2026/
[^9]: NirantK / Superlinked, "Find the best retrieval strategy for your RAG," Superlinked docs, 2025. https://superlinked.com/docs/examples/benchmark
[^10]: Jacob, M., Lindgren, E., Zaharia, M., Carbin, M., Khattab, O., Drozdov, A., "Drowning in Documents: Consequences of Scaling Reranker Inference," arXiv:2411.11767, November 2024. https://arxiv.org/abs/2411.11767
[^11]: "Reranking and Cross-Encoders for RAG: BGE, Cohere, Jina (2026)," LocalAIMaster, May 2026. https://localaimaster.com/blog/reranking-cross-encoders-guide
[^12]: "Should You Use LLMs for Reranking? A Deep Dive into Pointwise, Listwise, and Cross-Encoders," ZeroEntropy Blog, July 2025. https://zeroentropy.dev/articles/should-you-use-llms-for-reranking-a-deep-dive-into-pointwise-listwise-and-cross-encoders/
[^13]: Muratbekova, U., "Best Reranker for RAG: We tested the top models," Agentset Blog, November 7, 2025. https://agentset.ai/blog/best-reranker
[^14]: Voyage AI, "Pricing," docs.voyageai.com, accessed June 2026. https://docs.voyageai.com/docs/pricing
[^15]: BAAI, "bge-reranker-v2-m3 model card," HuggingFace, March 2024. https://huggingface.co/BAAI/bge-reranker-v2-m3
[^16]: Mark, "PyTorch RAG Architecture: 4-Component Latency Budgets for Production," Markaicode, May 2026. https://markaicode.com/architecture/pytorch-rag-architecture/
[^17]: Mark, "Scalable Hybrid Retrieval Architecture: Production System Design for High Traffic [2026]," Markaicode, May 2026. https://markaicode.com/architecture/scalable-hybrid-retrieval-architecture/

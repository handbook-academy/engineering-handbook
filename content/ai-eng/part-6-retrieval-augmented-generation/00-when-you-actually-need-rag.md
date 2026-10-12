---
title: "When you actually need RAG"
description: "RAG vs long context vs fine-tune as a cost decision: long context pays per query, RAG pays once to index. The default rule, the exceptions, and when RAG is the wrong answer."
slug: 00-when-you-actually-need-rag
part: 6
chapter: 0
difficulty: intermediate
prerequisites:
  - part-1-how-models-behave/01-tokens-and-context-windows
  - part-1-how-models-behave/03-embeddings
  - part-2-working-with-model-apis/07-prompt-caching
  - part-5-context-engineering/00-context-is-more-than-the-prompt
tags: [llm, rag]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# When you actually need RAG

You have a 600,000-token corpus and a question. On GPT-5.4 at June 2026 prices, sending the whole corpus into the context window costs about $1.51 per query. Retrieving the five most relevant chunks (around 3,000 tokens) and answering from those costs about $0.015. Same question, same model. The bill differs by two orders of magnitude.[^1][^2][^3]

That gap is the entire reason this chapter exists. Frontier models now ship million-token context windows, and people keep declaring RAG dead every time a new long-context model lands. The window is real; the cost shape didn't change. Long context pays per query proportional to corpus size. Retrieval-augmented generation (RAG, the pattern of fetching relevant chunks at query time and stuffing those into the prompt) pays once to index and then pays only for what it retrieves. Fine-tuning pays a large one-time training cost and bakes knowledge into the weights. The decision between them is mostly economic, and it falls out of three numbers: how big is the corpus, how often does it change, and how many queries will hit it.

## The three cost shapes

Run the math on a 600K-token knowledge base, GPT-5.4 pricing, a 500-token question and 400-token answer:

```python
# Cost per query: long context vs RAG (GPT-5.4, June 2026 pricing)
GPT54_INPUT  = 2.50   # $/MTok
GPT54_OUTPUT = 15.00  # $/MTok
EMBED_SMALL  = 0.02   # $/MTok, text-embedding-3-small

def long_context(corpus_tokens, prompt_tokens, output_tokens):
    inp = (corpus_tokens + prompt_tokens) / 1_000_000 * GPT54_INPUT
    out = output_tokens / 1_000_000 * GPT54_OUTPUT
    return inp + out

def rag(retrieved_tokens, prompt_tokens, output_tokens, query_tokens):
    embed = query_tokens / 1_000_000 * EMBED_SMALL
    inp = (retrieved_tokens + prompt_tokens) / 1_000_000 * GPT54_INPUT
    out = output_tokens / 1_000_000 * GPT54_OUTPUT
    return embed + inp + out

lc  = long_context(600_000, 500, 400)        # ~$1.51
r   = rag(3_000, 500, 400, 50)               # ~$0.015
print(f"LC ${lc:.4f}  RAG ${r:.4f}  ratio {lc/r:.0f}x")
```

LightOn ran a similar comparison at enterprise scale in November 2025 (1,000 requests per day against a 600K-token base) and landed on RAG being 8 to 82 times cheaper than long context for typical workloads, with better latency too.[^1] The range collapses with prompt caching: cached reads on Claude Sonnet 4.6 cost $0.30 per million tokens versus $3.00 standard, a 90% discount on the input portion that only kicks in when the corpus is identical across requests.[^2] If your corpus is static and the same prompt repeats, caching closes most of the gap. If the corpus moves at all, you eat full input price every time it shifts.

The index cost on the RAG side is almost a rounding error. Embedding a 600K-token corpus with `text-embedding-3-small` at $0.02 per million tokens costs $0.012; a managed vector database for a startup-scale workload (around a million queries per month) runs about $68 per month including embeddings and storage.[^3][^4] The break-even versus long context arrives in the first day of any meaningful query volume.

![A horizontal cost-per-query comparison showing three strategies. The long-context bar is dramatically tall and labeled $1.51. The RAG bar is a thin sliver at the bottom labeled $0.015. The fine-tune bar is short with a stacked block above it showing the one-time training cost.](images/00-cost-shapes.png)
*Three cost shapes. Long context bills the full corpus on every query; RAG bills retrieved chunks plus a near-zero index amortization; fine-tune bills a large training step once, then cheaper inference forever.*

## The default rule

**Use RAG when the corpus exceeds 100K tokens, or when it changes more often than once a month.** That's the rule. Below the threshold, on a static corpus, long context with prompt caching wins on accuracy and developer overhead. Above either threshold, retrieval wins on cost shape and operational sanity.

The 100K number is practical, not magic. Below it, a single frontier model context can swallow the whole corpus with headroom and you can lean on prompt caching to amortize the input cost across queries. Above it, you're either paying full input price on every call (untenable past a few hundred queries a month) or accepting accuracy degradation from spreading attention thin across hundreds of thousands of tokens.

The 30-day update threshold is about indexing economics in the other direction. If your corpus mutates daily, fine-tuning is off the table because retraining cycles can't keep up. Long context is fine on freshness but expensive on volume. RAG handles delta updates cleanly: re-embed only the changed documents, write them to the index, queries see the new content in the next request.

Three axes drive the rest of the decision:

- **Corpus size.** Under 50K tokens fits comfortably in a system prompt with caching. 50K to 200K is the gray zone where caching efficiency and query volume decide. Over 200K, RAG is the default unless you have a strong reason otherwise.
- **Update frequency.** Static for years means fine-tuning is on the table. Monthly or slower means long context with caching stays cheap. Weekly or faster makes RAG mandatory.
- **Query type.** Lookup queries ("what's our PTO policy?") are RAG-shaped. Holistic queries ("summarize the themes across this 100-page contract") are long-context-shaped because they can't be decomposed into chunks.

Here's the same logic as runnable code:

```python
from dataclasses import dataclass
from enum import Enum

class Strategy(Enum):
    RAG = "rag"
    LONG_CONTEXT = "long_context"
    FINE_TUNE = "fine_tune"

@dataclass
class CorpusProfile:
    size_tokens: int
    update_frequency_days: int
    queries_per_month: int
    fraction_holistic: float  # queries needing whole-doc synthesis

def decide(p: CorpusProfile) -> Strategy:
    fits_in_context = p.size_tokens < 200_000
    updates_often = p.update_frequency_days < 30
    holistic_heavy = p.fraction_holistic > 0.5

    if updates_often and p.size_tokens > 200_000:
        return Strategy.RAG
    if fits_in_context and holistic_heavy and p.queries_per_month < 500:
        return Strategy.LONG_CONTEXT
    if not updates_often and p.size_tokens < 50_000:
        return Strategy.FINE_TUNE
    return Strategy.RAG

print(decide(CorpusProfile(1_000_000, 7, 5_000, 0.2)))   # RAG
print(decide(CorpusProfile(80_000, 180, 100, 0.8)))       # LONG_CONTEXT
print(decide(CorpusProfile(20_000, 365, 10_000, 0.1)))    # FINE_TUNE
```

## What the accuracy data actually says

The "RAG is dead" crowd usually points to one paper: Google DeepMind's EMNLP 2024 study showing long context outperforms RAG by 7.6% on Gemini-1.5-Pro and 13.1% on GPT-4o across LongBench and InfiniteBench when "resourced sufficiently".[^5] That number is real. It's also half the story.

The same paper proposed a hybrid called Self-Route: ask RAG first with permission to decline, escalate to long context only when the model says it can't answer from the retrieved chunks. For Gemini-1.5-Pro, 81.74% of queries were answerable via RAG; the system matched long-context accuracy within 2.2 percentage points while using 38.4% of the tokens.[^5] The headline number says long context wins; the engineering takeaway is that you can buy back almost all of that win at a third of the cost.

The LaRA benchmark (ICML 2025, 2,326 test cases across novels, financial statements, and academic papers) sharpened the picture further. At 32K context, long context beats RAG by 2.4% on average. At 128K the trend reverses for open-source models: RAG wins by 3.68%.[^6] Proprietary models with stronger long-context handling (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) still favor long context at both lengths, but the gap depends as much on model strength as on window size. Two task categories diverge sharply:

- **Comparison and synthesis tasks**: long context wins by 14 to 15 percentage points. Comparing two contracts, summarizing themes, "what changed between v1 and v2" are not retrieval-shaped problems. They need the whole document at once.
- **Hallucination detection**: RAG wins decisively across all model sizes. When the question is "does this claim appear in the source?", retrieving the relevant passage and grounding the model on it beats trusting the model to find the needle in 128K tokens.[^6]

There's a second reason to control what enters the context, and it's older than the cost argument. Liu et al. showed in 2024 that GPT-3.5-Turbo's multi-document QA accuracy drops by more than 20 percentage points when the relevant document sits in the middle of a 20-document prompt versus at the start or end. At its worst, mid-context performance (52.9% at position 10 of 20) fell below closed-book performance (56.1%), meaning the model literally did better answering with no documents at all than with the right document buried in the middle.[^7] GPT-4 shows the same U-shape at higher absolute accuracy. RAG sidesteps this by letting you pick what enters the window and where: top-ranked chunks at the start (primacy) or the end (recency), never buried in the middle.

## When RAG is the wrong answer

The default rule has four real exceptions, and shipping RAG when one of these applies is how teams burn months on infrastructure they didn't need.

**Small, stable corpora.** A 30K-token style guide that hasn't changed in a year doesn't need a vector database. Drop it in the system prompt, turn on prompt caching, ship. Anthropic's $0.30 per million cached read on Sonnet 4.6 makes the per-query cost negligible once the prefix is warm.[^2] You skip chunking, embedding pipelines, retrieval evaluation, and a vector store on call.

**Holistic reasoning over a single document.** "Summarize the themes in this 100-page contract" or "what changed between these two specifications" cannot be decomposed into chunk retrieval. The whole document is the input. Liu et al. found reader performance saturates around 20 retrieved documents and adding more yields ~1.5% gain at large context cost.[^7] If your task needs the whole document, retrieve nothing; load it.

**Behavior, not knowledge, is the problem.** If the model produces wrong-format output, lacks a domain-specific tone, or fails at a task well-represented in training data, RAG adds retrieval noise without solving the root cause. Fine-tuning is the right tool. The signal: your eval failures cluster on style, structure, or task adherence, not on missing facts. (OpenAI wound down its hosted fine-tuning platform for new users in May 2026, so for GPT-series models you'll need to use Anthropic, Google, or open-source alternatives.[^8])

**Very low query volume on a static corpus.** Under ten queries a month against a frozen corpus, the operational overhead of running a vector database, embedding pipeline, and monitoring exceeds anything you save on per-query cost. Just send the corpus.

A useful counter-example for the "RAG is always wrong" position: Claude Code's grep-based code navigation works because code is lexically queryable. Function names, type signatures, and import paths are exact strings. Enterprise knowledge bases (PDFs, scanned reports, multilingual content, diagrams) are not. As LightOn put it: you can't grep a diagram.[^1] Lexical search wins when the query and the document share vocabulary; embedding-based retrieval wins when they don't.

## Two failure modes the decision rule won't catch

Two patterns show up in production after the strategy decision is made, and they're worth flagging before you commit to RAG on a borderline case.

The first is multi-hop reasoning. Standard RAG (embed query, retrieve top-k chunks, generate) breaks when the answer to step one is needed to formulate the query for step two. The retriever sees only the original question; it can't fetch "the nationality of the performer of song X" if the performer's name isn't in the question. This is the most common RAG failure on multi-hop QA benchmarks and the largest single category Self-Route routes to long context.[^5] If your queries chain reasoning across documents, plain retrieve-then-generate isn't enough; you'll need iterative retrieval or a hybrid escalation path.

The second is treating "the corpus updates daily" as an indexing-only problem. Re-embedding cost itself is small. Operating a vector database where 10% of the corpus mutates daily is not. Index write amplification, delete-and-insert audit logs, and ingestion latency add up to 30 to 50% on top of raw compute at enterprise scale.[^4] Sizing for peak ingestion, instead of sizing only for peak query, is what separates a RAG system that works on day 90 from one that needs an emergency reindex at 3am.

Both of these are problems you solve in [Chunking and indexing](./01-document-processing-and-chunking.md) and [Retrieval strategies](./02-embeddings-and-vector-search.md) once the strategy decision is settled. They aren't reasons to avoid RAG when the corpus and update shape say you need it; they're reasons to size and design it honestly.

At architecture scale, [AI system design](../../hld/part-9-ai-ml-system-design/01-rag-pipelines.md) in HLD Part 9 covers the enterprise RAG case study: ingestion pipelines, vector store sizing, observability, the whiteboard view of everything below the strategy decision this chapter just made.

## References

[^1]: Amelie Chatelain, "RAG is Dead, Long Live RAG: Retrieval in the Age of Agents," LightOn Engineering Blog, November 2025, https://lighton.ai/fr-blog-posts/rag-is-dead-long-live-rag-retrieval-in-the-age-of-agents
[^2]: Anthropic, "Claude Pricing - API," verified June 2026, https://claude.com/pricing
[^3]: OpenAI, "API Pricing," verified June 2026, https://openai.com/api/pricing/ and "text-embedding-3-small model page," https://developers.openai.com/api/docs/models/text-embedding-3-small
[^4]: markaicode.com, "DeepSeek vs Weaviate Cost: The Hidden $340/Month Vector Pipeline Tax," 2026, https://markaicode.com/pricing/deepseek-vs-weaviate-cost/
[^5]: Zhuowan Li et al., "Retrieval Augmented Generation or Long-Context LLMs? A Comprehensive Study and Hybrid Approach," EMNLP 2024 Industry Track (Google DeepMind), https://arxiv.org/abs/2407.16833
[^6]: Kuan Li et al., "LaRA: Benchmarking Retrieval-Augmented Generation and Long-Context LLMs," ICML 2025 (Alibaba-NLP), https://arxiv.org/abs/2502.09977
[^7]: Nelson F. Liu et al., "Lost in the Middle: How Language Models Use Long Contexts," TACL 12:157-173, 2024, https://arxiv.org/abs/2307.03172
[^8]: OpenAI, "Introducing vision to the fine-tuning API" (note dated May 8, 2026, announcing wind-down of the fine-tuning platform), https://openai.com/index/introducing-vision-to-the-fine-tuning-api/


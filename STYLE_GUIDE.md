# Style Guide

This style guide defines **how we write** in The Engineering Handbook (HLD, DSA, AI Engineering, and any future curricula in this repo). Every chapter is checked against these rules in CI and in human review.

If you are a contributor, read this once, then keep it open in a tab while you write.

## Table of Contents

- [Core Principles](#core-principles)
- [Voice and Tone](#voice-and-tone)
- [Structure](#structure)
- [Trade-off Tables](#trade-off-tables)
- [Formatting](#formatting)
- [Frontmatter Schema](#frontmatter-schema)
- [DSA-specific deviations](#dsa-specific-deviations)
- [AI Engineering-specific deviations](#ai-engineering-specific-deviations)
- [Diagrams](#diagrams)
- [Code Blocks](#code-blocks)
- [Links and Citations](#links-and-citations)
- [Numbers and Units](#numbers-and-units)
- [Punctuation and Typography](#punctuation-and-typography)
- [Accessibility](#accessibility)
- [Anti-Patterns](#anti-patterns)

## Core Principles

1. **Teach reasoning, not facts.** A reader should come away knowing *how to decide*, not just what the answer is.
2. **Opinionated by default.** Pick a recommendation and justify it. "It depends" is a cop-out unless you say what it depends on.
3. **Concrete over abstract.** "Redis handles 100K ops/sec on a single node" beats "Redis is very fast."
4. **Honest about complexity.** Say "this is genuinely hard, here is why" instead of "simply do X."
5. **8th-grade reading level in prose.** Short sentences. One idea per paragraph. Jargon defined on first use. Do not dumb down the technical content.
6. **Teach the subject, not the document.** Prose explains the topic. Do not announce how a table is structured, flag which row a skim reader might miss, stamp the date on a paragraph, or narrate your own editorial decisions. If a structural point needs making, make it once, in prose that advances understanding. Meta-commentary is not rigor.

## Voice and Tone

### Active voice

> The load balancer distributes requests.

Not:

> Requests are distributed by the load balancer.

### Second person

> You will notice the tail latency diverges from the mean around p95.

Not:

> One might observe that the tail latency...

### Opinionated

> Use Kafka when you need ordered partitioned streams. Use SQS when you do not.

Not:

> Kafka and SQS are both options for message queues.

### Honest about trade-offs

> This approach falls over at roughly 100K QPS because each request acquires a distributed lock, and lock contention becomes the bottleneck.

Not:

> This approach scales well.

## Structure

Every teaching chapter (Parts 0 to 7, 9, 10, and 11) follows this skeleton:

```text
1. Frontmatter
2. # Title (H1)
3. > TL;DR blockquote
4. ## Learning Objectives (checklist)
5. ## Intuition
6. ## Theory (with ### sub-sections)
7. ## Real-World Example
8. ## Trade-offs (table)            # conditional; see Trade-off Tables below
9. ## Common Pitfalls (with callout)
10. ## Exercise (with <details> hint and solution)
11. ## Key Takeaways
12. ## Further Reading
13. ## Flashcards
```

Case studies (Part 8) follow a 10-step template. See [`content/hld/part-8-case-studies/00-url-shortener.md`](content/hld/part-8-case-studies/00-url-shortener.md) for the canonical example:

```text
1. Problem Statement
2. Clarifying Questions
3. Functional and Non-Functional Requirements
4. Capacity Estimation
5. API Design
6. Data Model
7. High-Level Architecture
8. Detailed Deep Dives (pick 3)
9. Trade-offs Table                 # conditional; see Trade-off Tables below
10. Scaling and Bottlenecks
+ Follow-up Questions
+ Common Pitfalls
+ Failure Modes
+ Key Takeaways
+ Further Reading
+ Flashcards
```

## Trade-off Tables

A trade-off table earns its place only when the chapter presents **three or more substitutable alternatives** for the same design decision. The five-column format silently promises row-level equivalence; a table that breaks that promise sends the reader to the wrong choice.

**Rule 1: The section is conditional.** Include `## Trade-offs` only when (1) the chapter has ≥3 substitutable alternatives, (2) a reader would use the table to pick between rows, and (3) every row is a legitimate option. If any fails, pick a different heading:

| If the rows are... | Use this heading instead |
|---|---|
| Complementary controls (run all, layered) | `## Defense in depth` |
| Independent decisions grouped together (binary tables are fine here) | `## Design decisions` |
| Tools or vendors, not architectures | `## Tool selection` |
| Choice driven by use case | `## When to use which` |
| A methodology, or an asymmetric pair where one option needs connective reasoning that does not fit cells | Prose, optionally with a Mermaid flowchart |

Tables are the preferred format whenever the comparison is symmetric (every option has a Pros cell, a Cons cell, a Best-when cell, and an Our-pick cell that maps cleanly). A symmetric binary decision belongs in a 2-row table under `## Design decisions` or a similar heading, not in prose. Prose is the right format only when the decision is asymmetric (one option has unique failure modes that do not fit the table schema) or when the content is a methodology rather than a comparison.

**Rule 2: Anti-pattern rows are banned.** No cell may contain "Never", "Avoid", "Almost never", "Only for legacy", "Don't use", or equivalents, including softer forms like "Avoid on greenfield" or "Almost never in practice". Move the warning to `## Common Pitfalls` as a `> [!WARNING]` callout with a specific failure mode, a primary-source citation, and the concrete alternative to use:

```markdown
> [!WARNING]
> **Last-writer-wins silently drops concurrent writes.** Two replicas accepting
> writes to the same key within the replication window produce one timestamp-winning
> write; the other is discarded with no user-visible signal
> ([Shapiro et al., 2011](https://doi.org/10.1007/978-3-642-24550-3_29)).
> For collaborative documents, shared files, or carts, use an OR-Set, an RGA/Yjs
> document, or explicit dual-copy divergence instead.
```

**Rule 3: Fix the row, do not annotate the table.** If a row could be misapplied, sharpen the columns until the risk is visible in the row itself: tighten the Cons cell with a specific failure mode, narrow the "Best when" condition, or make "Our pick" more opinionated. If sharpening does not remove the risk, move the row to a `> [!WARNING]` callout in `## Common Pitfalls` per Rule 2. A caption below the table is a last resort, used only when the risk is genuinely orthogonal to the row structure (for example, a calibration note about an order-of-magnitude figure). In that case write one italicised sentence naming the concrete failure mode. Default is no caption. Do not write meta-commentary about how the table might read on a skim, do not stamp the table with dates, and do not announce what was removed or renamed. Those belong to the commit message, not the content.

**Rule 4: Use the default schema, or replace it with something better.** The default is:

```markdown
| Approach | Pros | Cons | Best when | Our pick |
|----------|------|------|-----------|----------|
| ...      | ...  | ...  | ...       | ...      |
```

Start here. The default is fine whenever pros and cons genuinely differ per row. See the consistency-level comparison in [`content/hld/part-3-distributed-systems-theory/01-consistency-deep-dive.md`](content/hld/part-3-distributed-systems-theory/01-consistency-deep-dive.md).

Replace it with decision-specific columns whenever the topic has clearer axes: throughput, latency, ordering, cost, coordination, write-amplification, whatever actually separates the rows. Cut any column whose values are roughly the same across rows; keep an "Our pick" column. Three chapters model the pattern:

- [`content/hld/part-2-building-blocks/08-message-queues-streaming.md`](content/hld/part-2-building-blocks/08-message-queues-streaming.md): `Throughput | Ordering | Replay | Ops burden | Cost model | Our pick`.
- [`content/hld/part-4-data-systems/00-storage-engines.md`](content/hld/part-4-data-systems/00-storage-engines.md): numeric write-amplification and compression-ratio columns.
- [`content/hld/part-8-case-studies/27-unique-id-generator.md`](content/hld/part-8-case-studies/27-unique-id-generator.md): `Bit-width | Coordination | B-tree locality | Our pick`.

## Formatting

### Headings

- `# H1` exactly once per file, matching frontmatter `title`.
- `## H2` for major sections.
- `### H3` for sub-sections.
- Do not skip levels (no jumping `##` straight to `####`).
- Sentence case, not Title Case: `## Common pitfalls`, not `## Common Pitfalls` for non-template headings. (Template section names above are the exception.)

### Callouts (GitHub alerts)

Use only the five GitHub-native alert types:

```markdown
> [!NOTE]
> Useful background information.

> [!TIP]
> Pro tip from production experience.

> [!IMPORTANT]
> Key information the reader must not miss.

> [!WARNING]
> A common mistake or easy-to-miss caveat.

> [!CAUTION]
> A dangerous thing to do in production.
```

Do not invent custom callouts. Do not use emoji as section markers.

### Tables

Always include a header. Left-align text columns, right-align numeric columns where it aids comparison.

```markdown
| Approach | Pros | Cons | Best When |
|----------|------|------|-----------|
| A | ... | ... | ... |
```

Tables longer than ~10 rows should be split or summarised.

### Lists

- Bullet lists use `-` (hyphen). Do not mix `*` and `-` in one file.
- Numbered lists use `1.` for every item (Markdown auto-numbers). This keeps diffs clean.
- Nested lists indent by two spaces.

## Frontmatter Schema

Every content file must have valid YAML frontmatter:

```yaml
---
title: "Caching Strategies"                # required, string
description: "Deep dive into caching..."   # required, 1-sentence, < 160 chars
part: 2                                    # required, integer 0-11
module: "2.3"                              # required, string "X.Y"
difficulty: intermediate                   # required, one of: beginner | intermediate | advanced
prerequisites:                             # required, array (can be empty)
  - 0.1-os-essentials
  - 1.1-latency-and-throughput
date_created: 2026-04-29                   # required, ISO-8601 date
date_updated: 2026-04-29                   # required, ISO-8601 date
tags: [cache, performance]                 # optional, array — see canonical tags below
technologies: [Redis, Memcached]           # optional, array — must be on the allowlist in scripts/technologies.json
---
```

Prerequisite slugs use the format `X.Y-slug-with-dashes` where `X.Y` matches the target chapter's `module` field and `slug-with-dashes` is the filename without `.md` extension.

### Canonical tags

`tags:` is for **topic concepts**, not tool names. Tool names belong in `technologies:` instead. Keep tags to the ~40 canonical values below; this is what lets the tag cloud and search filters stay useful.

Never invent ad-hoc tags (e.g. `slack`, `whisper`, `bloom-filter`). Case studies already declare `theme:`; do not duplicate that in `tags:`.

| Category | Canonical tags |
|---|---|
| **Distributed systems** | `consistency`, `replication`, `partitioning`, `consensus`, `transactions`, `idempotency`, `fanout` |
| **Data storage** | `sql`, `nosql`, `cache`, `storage-engines`, `vector-search`, `time-series`, `search`, `geospatial` |
| **Messaging** | `queue`, `stream-processing`, `cdc` |
| **Networking** | `http-api`, `real-time`, `cdn`, `dns`, `load-balancing` |
| **Architecture** | `microservices`, `event-driven`, `serverless`, `api-gateway`, `multi-tenant` |
| **Traffic** | `rate-limiting`, `identifier` |
| **Reliability** | `observability`, `resilience`, `deployment`, `slo` |
| **Security** | `authn-authz`, `encryption`, `zero-trust` |
| **AI / ML** | `llm`, `rag`, `ml-systems`, `ai-safety`, `agents` |
| **Media** | `video` |
| **Cross-cutting** | `cost` |

### Part 8 case-study themes

Every chapter in `content/hld/part-8-case-studies/` must declare one additional field, `theme:`, that groups it into a pedagogical bucket. The theme is editorial only: it never changes the chapter's URL, its Part 8 number, or any cross-reference. It lets the Part 8 landing page and the README surface the 56 case studies as a menu rather than a queue.

| Theme | What belongs here | Examples |
|---|---|---|
| `core-primitives` | The interview classics. One canonical primitive per chapter, rebuilt from scratch. | url-shortener, rate-limiter, key-value-store, chat-system, distributed-cache |
| `consumer-products` | End-user products composed from multiple primitives. | netflix, ride-hailing, food-delivery, video-conferencing |
| `ai-systems` | LLM- or ML-centric systems where inference, retrieval, or agent behaviour is the core design challenge. | chatgpt, enterprise-rag, coding-agent, semantic-cache, recommendation-system |
| `financial-systems` | Correctness-critical systems with regulatory or audit requirements. | payment-system, stock-exchange, brokerage-trading, fraud-detection |
| `infrastructure-platforms` | Platforms that other engineers build on: observability, CI/CD, API edge, routing. | api-gateway, cicd-platform, observability-platform, dns-service, metrics-pipeline |

If a new case study does not fit cleanly into one theme, prefer the closest match and raise the ambiguity in the PR description. Do not invent new themes without discussion; `scripts/check-frontmatter.mjs` enforces the allowlist.

## DSA-specific deviations

DSA chapters under `content/dsa/` follow a different shape from HLD chapters. Most rules in this guide (voice, citations, Mermaid, prose hygiene) apply unchanged; the deviations are in the chapter shape, identifier conventions, and code-sample layout.

**Chapter shape.** Practice-first: open with a one-screen cheat-sheet table (operations, time, space, gotcha), then a deep dive on the data structure or pattern, then a sequence of "prompt cards" — each one a representative LeetCode problem with a custom worked example, a `<details>`-wrapped solution walkthrough, and a "Common mistakes" block. The canonical reference is [`content/dsa/part-1-linear-data-structures/00-arrays.md`](content/dsa/part-1-linear-data-structures/00-arrays.md).

**Frontmatter.** DSA chapters use `slug`, `part`, `chapter`, `prerequisites`, `date_updated`, `languages`, `canonical_test`, `widgets`, and `ladder` (with `core`, `stretch`, `star` keys). They do **not** use HLD's `module`, `tags`, or `technologies` fields. `slug` must equal the filename without `.md`. `languages` is a non-empty subset of `[python, java, cpp, go]`. `canonical_test` is either null or a `LC-NNNN` ID present in [`_problem-registry.yml`](content/dsa/_problem-registry.yml).

**Code samples.** Each LeetCode problem the chapter teaches lives in a sibling directory `<chapter-slug>/lc-NNN/` with four solution files (`sol.py`, `sol.java`, `sol.cpp`, `sol.go`) plus a `cases.json` for tests. Inline the Python solution in the chapter as a fenced block; link the Java/C++/Go siblings on a single "Other languages" line. Solutions must be self-contained, idiomatic, and pass the cases in `cases.json`.

**Identifier conventions.** Problems are referenced by `LC-NNN` (e.g. `LC-088`, `LC-189`) and registered in [`content/dsa/_problem-registry.yml`](content/dsa/_problem-registry.yml). Interactive widgets are referenced by `w-NN-<slug>` for canonical pattern widgets (e.g. `w-15-lru-cache`) or `e-LCNNN-<slug>` for editorial widgets, and registered in [`content/dsa/_widget-registry.yml`](content/dsa/_widget-registry.yml). On GitHub, widget callouts link to the YAML spec; the rendered widget itself lives on the website.

**Editorials and patterns.** Long-form per-LC editorials live under `content/dsa/editorials/`, and pattern decision references (one per major pattern family) live under `content/dsa/patterns/`. Both have thinner frontmatter schemas — see existing files for the shape.

## AI Engineering-specific deviations

AI Engineering chapters under `content/ai-eng/` keep this guide's voice, citation, and accessibility rules. They differ in chapter shape, frontmatter, and diagrams.

**Chapter shape.** No fixed skeleton. Each chapter takes the structure its topic needs: most open with a real incident or a failing example, explain the mechanism, and end with something the reader can apply (a checklist, a decision rule, or a runnable snippet). The HLD template sections (TL;DR, Learning Objectives, Flashcards) are not used. Chapters aim for one concept each and stay short; length is earned, never padded.

**Scope line.** If a topic answers "what would I draw on the whiteboard?", it belongs in [HLD Part 9](content/hld/part-9-ai-ml-system-design/) and the AI Engineering chapter links to it. If it answers "what would I open in my editor?", it belongs in `content/ai-eng/`.

**Frontmatter.** AI Engineering chapters use `title`, `description`, `slug`, `part`, `chapter`, `difficulty`, `prerequisites`, `tags`, `date_created`, and `date_updated`. They do **not** use HLD's `module` or `technologies` fields. `slug` must equal the filename without `.md`; `part` and `chapter` must match the directory and filename prefix. `prerequisites` use the DSA path form: `part-N-slug/NN-chapter-slug` across parts, or `NN-chapter-slug` within the same part, and must resolve to a real chapter. `tags` use the canonical list above.

```yaml
---
title: "MCP security"
description: "The four attack classes MCP creates..."
slug: 05-mcp-security
part: 7
chapter: 5
difficulty: intermediate
prerequisites:
  - 04-mcp-model-context-protocol
  - 03-tool-design
tags: [llm, agents, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---
```

**Figures, not a Mermaid quota.** The three-diagram minimum does not apply. Teaching figures are minimalist PNG images stored next to the chapter at `content/ai-eng/<part-dir>/images/<NN>-<name>.png`, usually one to three per chapter, only where they teach. Every figure needs descriptive alt text that states what the figure shows, followed by a one-line italic caption. Mermaid is the exception, at most one per chapter, used when a flowchart teaches better than a picture.

**Code.** Program code is Python, targeting 3.10+ and the official provider SDKs. SQL, YAML, JSON, and shell blocks appear only where the topic itself is configuration or a query.

**Perishable facts.** Prices, model names, context limits, and benchmark scores carry an "as of" date and a footnoted source. Prefer the provider's own docs or pricing page over a blog summary.

**Warnings.** Use GitHub's `> [!WARNING]` callout for production traps that cost money or cause incidents.

## Diagrams

We use **Mermaid** and **Excalidraw** only. ASCII box diagrams (the `+--+ | +--+` style drawn with box-drawing characters) are **not allowed** in teaching chapters or case studies. They drift out of sync with Mermaid on the same page, break when rendered in proportional fonts, require manual re-alignment on every edit, and offer no information Mermaid cannot express better. If you inherit one from an older chapter, convert it to Mermaid or delete it.

Every teaching chapter needs **at least three Mermaid diagrams**: one high-level architecture overview, one sequence or state diagram showing dynamic behavior, and one more of the author's choosing (decision tree, data model, deployment topology, etc.). Case studies (Part 8) need at least four.

Every diagram has a one-sentence italic caption directly below it, explaining the takeaway. Example:

```markdown
\```mermaid
flowchart LR
    Client --> LB[Load Balancer]
    LB --> S1[Server 1]
    LB --> S2[Server 2]
\```

*The load balancer distributes requests across a stateless server pool; adding capacity is a matter of launching more servers.*
```

### Mermaid (the default for everything)

Mermaid renders on GitHub natively (since Feb 2022) and on the rendered site via a lazy-loaded client-side bundle.

```markdown
\```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant Server
    Client->>LB: HTTP request
    LB->>Server: forward
    Server-->>LB: response
    LB-->>Client: response
\```
```

Pick the diagram type that matches the idea:

| Type | Use for |
|------|---------|
| `flowchart LR` or `flowchart TD` | High-level architecture, request path, component layout |
| `sequenceDiagram` | Protocol flows (TCP handshake, API round-trip, consensus rounds) |
| `stateDiagram-v2` | State machines (connection states, message lifecycle, job status) |
| `erDiagram` | Data models, table relationships |
| `graph LR` | Decision trees, dependency graphs |
| `gantt` | Timelines (failure recovery phases, rollout stages) |

Guidance for readable Mermaid:

- Name nodes with human labels, not variable names: `LB[Load Balancer]`, not `LB[LB]`.
- Use `subgraph` to group related components (e.g. "Data plane", "Control plane").
- Label edges where the edge is not self-evident: `Client -->|GET /api| LB`.
- Keep diagrams under ~15 nodes. If you need more, split into two diagrams or move to Excalidraw.

### Excalidraw (for diagrams Mermaid cannot express)

Use Excalidraw when the diagram genuinely does not fit Mermaid's vocabulary: multi-region deployment topologies, free-form annotations over a photograph of a whiteboard, threat models with trust boundaries, or dense multi-service architectures with >15 nodes.

Commit both the source and the exported image:

- `diagrams/<chapter-slug>.excalidraw` (the source, so others can edit)
- `diagrams/<chapter-slug>.svg` (the rendered output, referenced in the Markdown)

Reference in Markdown as:

```markdown
![Multi-region deployment topology](../../diagrams/url-shortener.svg)

*Each region runs a full stack; a global load balancer routes users to their nearest healthy region.*
```

Always include descriptive `alt` text (first argument) and a caption (italic line below). The `alt` text is for screen readers and search; the caption is for readers.

## Code Blocks

Always specify a language tag for syntax highlighting:

```markdown
\```python
def example():
    pass
\```
```

Languages we use frequently: `bash`, `python`, `javascript`, `typescript`, `go`, `rust`, `java`, `yaml`, `json`, `sql`, `http`, `nginx`, `dockerfile`, `mermaid`.

Keep code blocks under ~40 lines. If longer, extract to a file under `examples/` and link to it.

## Links and Citations

### Internal links

Use relative paths with the on-disk directory name and the zero-padded filename:

```markdown
See [CAP and PACELC](../part-1-core-fundamentals/04-cap-and-pacelc.md).
See [Consistency Models](../part-1-core-fundamentals/03-consistency-models.md) for the prerequisite framing.
```

This format works when browsing the repo on GitHub. At site build time, the
generator rewrites these links to their public URLs (e.g. `/core-fundamentals/cap-and-pacelc/`).
If a cross-chapter link points at a file that does not exist, the build fails;
fix the typo or the stale reference.

**Cross-reference rule (strict):** When referring to another chapter in prose, use a clickable markdown link whose link text is the actual **chapter title**. Never use opaque identifiers.

| Wrong | Right |
|---|---|
| `Part 1 Chapter 3 covered session guarantees.` | `[Consistency Models](../part-1-core-fundamentals/03-consistency-models.md) covered session guarantees.` |
| `See Chapter 3.6.` | `See [Idempotency and Exactly-Once](./06-idempotency-exactly-once.md).` |
| `[Chapter 1.5](../part-1-core-fundamentals/05-back-of-envelope-estimation.md)` | `[Back-of-Envelope Estimation](../part-1-core-fundamentals/05-back-of-envelope-estimation.md)` |
| `(see 8.4)` | `(see [Notification System](./04-notification-system.md))` |
| `You covered B-trees in [Data Structures](...).` | `[Data Structures for Systems](...) covers B-trees.` |
| `You learned quorums in [Quorums](...).` | `[Quorums and Replication](...) introduced quorum math.` |

Rules:

1. **Link text = chapter title.** Not `Chapter 1.5`, not `Part 2 Ch. 4`, not `8.4`. The title tells the reader where they are going without forcing them to memorise the module-number grid.
2. **Always link.** If a chapter is worth referencing, it is worth one link. Bare prose references like "as we saw in Part 2" with no link are equally bad; either link it or cut it.
3. **Module-number prefix is optional.** If a specific chapter deserves emphasis on its position (e.g. in `## Further Reading`), `[1.4 CAP and PACELC](...)` is acceptable. In running prose, prefer the title alone.
4. **Same-part links use `./filename.md`; cross-part links use `../part-N-name/filename.md`.**
5. **The chapter is the subject of recap verbs, not the reader.** Write `[Other Chapter] covers X` / `introduced X` / `showed X`. Do NOT write `You covered X in [Other Chapter]` / `You learned X in [Other Chapter]` / `You saw X in [Other Chapter]`. The reader did not author the earlier material; the handbook did. Second-person "you" is reserved for actions the reader performs now (`you will be able to...`, `choose W and R such that...`).
6. **External-book references** like "Designing Data-Intensive Applications, Ch. 6" or "Pro Git, Chapter 10.2" are legitimate external citations and do NOT follow this rule, because they point at a book, not a handbook chapter.

CI enforcement: `scripts/check-cross-references.mjs` (if present) greps for `Part [0-9]+ Chapter`, `\bChapter [0-9]+\.[0-9]+`, `\[Chapter [0-9]`, and `You (covered|learned|saw|met) .* \[.*\]\(.*\.md\)` and fails the build on matches inside `content/`.

### External links

Always use the full URL (not shortened). Prefer primary sources (engineering blog, paper, RFC) over secondary (Medium summaries).

```markdown
See [How Discord stores trillions of messages](https://discord.com/blog/how-discord-stores-trillions-of-messages).
```

### Citation format

Throughout prose, cite inline: `[Author, Year]` or `[Company Engineering, Year]`. Full references live in the "Further Reading" section.

### Verify URLs

All external URLs are checked by `lychee` in CI. A PR with a broken link will fail CI and will not merge.

## Numbers and Units

- Use SI units for storage (KB, MB, GB, TB, PB) with the decimal interpretation unless specifically discussing memory pages (then KiB, MiB).
- Always include units: `100 GB`, not `100G`.
- Use thousands separators: `1,000,000 QPS`, not `1000000`.
- Keep significant figures honest. `~100K ops/sec` is better than `99,847 ops/sec` unless you actually measured that.

When citing a specific number, cite the source:

> Redis handles approximately 100K ops/sec on a single node ([Redis benchmarks, 2023](https://redis.io/docs/management/optimization/benchmarks/)).

## Punctuation and Typography

### Quotes

Use straight quotes (`"` and `'`), not curly quotes (`"` `"` `'` `'`). Most editors auto-substitute curly quotes; turn that off.

### Ellipsis

Use three ASCII periods: `...` not `…` (U+2026).

## Accessibility

- Every image has descriptive `alt` text.
- Every diagram (Mermaid or Excalidraw) has a one-sentence italic caption directly below it, explaining the takeaway. See the [Diagrams](#diagrams) section.
- Tables have a header row.
- Avoid "click here" link text; make the link text descriptive.
- Run the site through Lighthouse accessibility audit; target 100.

## Anti-Patterns

Common mistakes to avoid in content:

| Anti-Pattern | Why it's bad |
|--------------|-------------|
| "Obviously, ..." or "Simply, ..." | Nothing is obvious to every reader. |
| "In 2023, ..." without citation | Unverifiable claim. |
| Walls of text without diagrams | Readers skim. Diagrams anchor the mental model. |
| ASCII box diagrams (`+---+ \| \|` style) | Drift out of sync, break in proportional fonts, redundant with Mermaid. Use Mermaid or Excalidraw instead. |
| "You can use Kafka, RabbitMQ, SQS, Pulsar..." without recommending one | Pick one. Readers came here for decisions. |
| Emoji mid-sentence for emphasis | Use bold, not emoji. |
| Long Markdown tables (>10 rows) | Split or summarise. |
| Copying numbers without citation | Breaks reader trust. |
| `## Trade-offs` row with "Never" / "Avoid" / "Almost never" in any cell | Breaks the row-level-equivalence contract. See [Trade-off Tables](#trade-off-tables), Rule 2. |
| Meta-commentary below a table ("Row N is the skim-reader trap", "This table is current as of ...", "This section was previously titled ...") | Talks about the document, not the subject. Fix the row or move it to a Warning callout. See [Trade-off Tables](#trade-off-tables), Rule 3. |
| Same fact restated in TL;DR, table, prose, pitfall, key takeaway, and flashcard | Every fact earns its place once or twice. Five restatements is overfit, not rigor. |

If you catch yourself writing one of these, stop and fix it. If you see one in review, leave a comment.

---

**When in doubt**, read the closest existing chapter to what you are writing and match its style. Consistency across the book is more valuable than individual stylistic flourish.

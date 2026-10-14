<div align="center">

<img src="logo.svg" alt="Handbook Academy" width="160" />

# The Engineering Handbook

**Open-source engineering curricula under one CC BY-SA 4.0 license. HLD, DSA, and AI Engineering today; more to come.**

HLD Handbook: 159 chapters + 22 trade-off pages · 181 pages · ~773,000 words · 719 Mermaid diagrams · 3,100+ citations
DSA Handbook: 120 chapters across 15 parts · 37 pattern decision pages · 5 long-form editorials · ~470,000 words · 226 Mermaid diagrams · sibling Python / Java / C++ / Go solutions for 155 LeetCode problems · 46 interactive widget specs
AI Engineering Handbook: 86 chapters across 12 parts · ~192,000 words · 87 figures · 200 Python examples · 750+ citations

[![License: CC BY-SA 4.0](https://img.shields.io/badge/license-CC%20BY--SA%204.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI](https://github.com/handbook-academy/engineering-handbook/actions/workflows/content-ci.yml/badge.svg)](https://github.com/handbook-academy/engineering-handbook/actions)
[![GitHub stars](https://img.shields.io/github/stars/handbook-academy/engineering-handbook?style=social)](https://github.com/handbook-academy/engineering-handbook/stargazers)

**Read free at [handbook.academy](https://handbook.academy)** — landing page links to every book · HLD at [hld.handbook.academy](https://hld.handbook.academy) · DSA at [dsa.handbook.academy](https://dsa.handbook.academy) *(public beta)* · AI Engineering at [ai-eng.handbook.academy](https://ai-eng.handbook.academy)

[Start reading](#start-reading) · [HLD curriculum](#the-full-hld-curriculum) · [DSA curriculum](#the-full-dsa-curriculum) · [AI Engineering curriculum](#the-full-ai-engineering-curriculum) · [Trade-offs](#trade-offs-library-22-pages) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [What this is](#what-this-is)
- [Reading the handbooks online](#reading-the-handbooks-online)
- [What's in this repo](#whats-in-this-repo)
- [Why this exists](#why-this-exists)
- [Who this is for](#who-this-is-for)
- [How these handbooks compare](#how-these-handbooks-compare)
- [Start reading](#start-reading)
- [The full HLD curriculum](#the-full-hld-curriculum) — 12 parts + 22-page Trade-offs Library
- [The full DSA curriculum](#the-full-dsa-curriculum) — 15 parts + 37 pattern decision pages + editorials + 46 widgets
- [The full AI Engineering curriculum](#the-full-ai-engineering-curriculum) — 12 parts, 86 chapters, 87 figures
- [Study plans](#study-plans)
- [Project statistics](#project-statistics)
- [Quality standards](#quality-standards)
- [Contributing](#contributing)
- [Project structure](#project-structure)
- [Development setup](#development-setup)
- [Governance](#governance)
- [FAQ](#faq)
- [License](#license)
- [Citation](#citation)
- [Acknowledgments](#acknowledgments)
- [Community](#community)

---

## What this is

This repository hosts **three sibling open-source engineering handbooks** under `content/`, sharing the same CC BY-SA 4.0 license, the same contribution workflow, and the same CI quality bar:

- **The HLD Handbook** (`content/hld/`) — an opinionated, end-to-end textbook on high-level software design, distributed systems, and modern infrastructure. 159 teaching chapters across 12 parts plus a 22-page Trade-offs Library — 181 pages, ~773,000 words, 719 Mermaid diagrams, 3,100+ citations. Equivalent in scope to a **~2,400-page book** — longer than *Designing Data-Intensive Applications* and Alex Xu's *System Design Interview* volumes 1+2 combined. Covers TCP/IP and the OS contract through to LLM serving, multi-agent orchestration, and post-quantum crypto.
- **The DSA Handbook** (`content/dsa/`) — a practice-first data-structures-and-algorithms curriculum aimed at coding interviews and competitive programming. 120 chapters across 15 parts plus 37 pattern decision pages, 5 long-form LC editorials, and 46 interactive widget specs. ~470,000 words, 226 Mermaid diagrams. Each chapter teaches a structure or pattern, then walks the canonical LeetCode problems, with sibling `sol.py` / `sol.java` / `sol.cpp` / `sol.go` files for 155 problems. Python is inlined in the chapter; the other three languages are linked.
- **The AI Engineering Handbook** (`content/ai-eng/`) — how to build and run production AI products on top of foundation models, for software engineers who don't train models. 86 chapters across 12 parts: model behavior, model APIs, prompting, evals (taught before RAG and agents on purpose), context engineering, retrieval, agents, observability, security, production operations, and AI product. ~192,000 words, 87 figures, 200 Python examples, 750+ dated citations. HLD Part 9 is the whiteboard view of AI systems; this book is the editor view.

> **More curricula are planned.** This repo is structured as an umbrella so additional handbooks (e.g. operating systems, databases) can land alongside HLD, DSA, and AI Engineering over time, sharing the same workflow and license.

Every concept in every handbook is taught **inline** as a full-length article: introduction, first-principles explanation, diagrams, worked examples, trade-offs, production gotchas, citations to primary sources. No stubs. No "coming soon." No external blog redirects. No bullet outlines that tell you to go somewhere else to actually learn.

Every `.md` file under `content/` also renders natively on GitHub — all 950 Mermaid diagrams and 87 figures display in the GitHub UI, all footnotes work, all cross-references resolve. The websites add search, dark mode, per-chapter diagram zoom, social cards, OG images, the interactive DSA widgets, and fast client-side navigation.

All three handbooks are continuously updated. Every chapter's frontmatter declares `date_created` and `date_updated`, so you can see exactly how fresh each page is. We care about numbers being right today, not right in 2022.

## Reading the handbooks online

Each book has its own subdomain. The umbrella landing page links to all of them:

| Site | URL | What it serves |
|------|-----|----------------|
| **Landing page** | [handbook.academy](https://handbook.academy) | Pick a book. |
| **HLD Handbook** | [hld.handbook.academy](https://hld.handbook.academy) | The full HLD curriculum. |
| **DSA Handbook** | [dsa.handbook.academy](https://dsa.handbook.academy) | The full DSA curriculum, with interactive widgets. |
| **AI Engineering Handbook** | [ai-eng.handbook.academy](https://ai-eng.handbook.academy) | The full AI Engineering curriculum, plus a frameworks reference page. |

Each subdomain serves one book at the root — URLs do not nest. HLD chapters live at `hld.handbook.academy/curriculum/...`, not `handbook.academy/hld/...`. Same for DSA and AI Engineering.

## What's in this repo

This repository is the **canonical content source** for every book. PRs to any handbook are welcome.

- **[`content/hld/`](content/hld/)** — 159 HLD chapters across 12 parts + 22 trade-off decision pages. The chapter template is intro → first principles → diagrams → worked example → trade-offs → production gotchas → references. See [STYLE_GUIDE.md](STYLE_GUIDE.md).
- **[`content/dsa/`](content/dsa/)** — 120 DSA chapters across 15 parts. The chapter template is practice-first: cheat-sheet table, deep dive on the structure or pattern, prompt cards for representative LeetCode problems, and `<details>` solution + common-mistakes blocks. Code samples live as sibling files (`sol.py`, `sol.java`, `sol.cpp`, `sol.go`) under each chapter's directory. See [STYLE_GUIDE.md § DSA-specific deviations](STYLE_GUIDE.md#dsa-specific-deviations) and [`content/dsa/part-1-linear-data-structures/00-arrays.md`](content/dsa/part-1-linear-data-structures/00-arrays.md) as the canonical example.
- **`content/dsa/editorials/`** — long-form LeetCode editorials covering hard problems with multiple approaches.
- **`content/dsa/patterns/`** — pattern decision references that compare interchangeable approaches (e.g. recursion vs iteration, BFS vs DFS, sliding window vs prefix sum).
- **`content/dsa/widgets/`** — 46 YAML specs for the interactive widgets that render on the DSA website. On GitHub these are callouts that link to the spec; on the website the widget renders.
- **`content/dsa/_problem-registry.yml`** — canonical `LC-NNN` ID registry; the website source-of-truth for every LeetCode problem the curriculum touches.
- **[`content/ai-eng/`](content/ai-eng/)** — 86 AI Engineering chapters across 12 parts. No fixed skeleton: each chapter opens with a real incident or failing example, explains the mechanism, and ends with something you can apply. Figures live in each part's `images/` folder. See [`content/ai-eng/README.md`](content/ai-eng/README.md) and [STYLE_GUIDE.md § AI Engineering-specific deviations](STYLE_GUIDE.md#ai-engineering-specific-deviations).

## Why this exists

The open-source curricula for system design and DSA have a shape, and that shape is frustrating:

- **Link dumps** — curated lists that point at dozens of scattered blog posts, LeetCode discuss threads, and talks. Great for discovery, useless as a learning path. You end up with 60 tabs open and no through-line.
- **Teaser-and-redirect repos** — READMEs with a few hundred words on each topic that nudge you toward a paid course hosted elsewhere. The GitHub repo is the marketing page; the actual teaching is behind a $150-$400+/year paywall.
- **Monolithic READMEs frozen in time** — a single 5,000-line `README.md` that was great in 2021 but hasn't kept up with the modern stack. No LLM serving, no CRDTs, no post-quantum crypto, no FinOps. And nobody wants to review a PR against a 5,000-line file.
- **Surface-level outlines** — bullet-point summaries that tell you *what* exists without explaining *why* you'd pick one approach over another. You learn the vocabulary without the judgment.
- **Interview-only prep** — focused on passing a specific 45-minute screen, not on actually operating systems at scale or actually understanding the algorithm.

These handbooks fix all of that:

- **100% inline content.** Every chapter is a full teaching article written from scratch, living in this repo as plain Markdown. Nothing is a stub. Nothing redirects you elsewhere to learn.
- **Progressive curricula.** HLD has 159 teaching chapters across 12 parts plus a 22-page Trade-offs Library, sequenced from prerequisites (Part 0) to Staff+ topics. DSA has 120 chapters across 15 parts, from arrays to bitmask DP, with each part introducing a tighter pattern family. Each chapter declares its prerequisites, learning objectives, estimated reading time, and difficulty tier.
- **Research-backed.** Every HLD chapter ends with a **Further Reading & References** section citing primary sources — SIGMOD and OSDI papers, RFCs, IETF drafts, engineering postmortems, official docs, canonical books. **3,100+ citations** across HLD. DSA chapters cite the original papers behind each algorithm where they exist (Floyd, Tarjan, Knuth-Morris-Pratt, Aho-Corasick).
- **Opinionated.** Every topic picks a recommended approach and explains *why*. Where reasonable people disagree, the trade-offs are made explicit — HLD has a dedicated 22-page Trade-offs Library; DSA has 37 pattern decision pages that compare interchangeable approaches (recursion vs iteration, BFS vs DFS, sliding window vs prefix sum, and so on).
- **Modern (2025+).** HLD covers LLM serving, RAG pipelines, AI agents, multi-agent orchestration, CRDTs, edge computing, FinOps, post-quantum cryptography, platform engineering, local-first software, differential privacy, MCP. DSA covers the modern competitive-programming toolkit: monotonic stacks/deques, Morris traversal, suffix arrays, Aho-Corasick, bitmask DP, randomised algorithms.
- **Practice-first for DSA.** Every DSA chapter ships with sibling code samples in **Python, Java, C++, and Go** for the canonical LeetCode problems it teaches. Python is inlined in the chapter; the other three languages are one click away. 155 LeetCode problems are covered in this format.
- **Interactive on the website.** The DSA book's 46 widget specs render as live, animated visualisations on `dsa.handbook.academy` (sliding windows that you can drag, monotonic stacks that animate the pop sequence, etc.). On GitHub the widget callouts link to the YAML spec.

## Who this is for

These handbooks are written for:

- **SDE1 engineers preparing for SDE2 interviews.** Read **DSA Parts 0-9** for coding-round fluency, then **HLD Part 0 + Part 1 + Part 11**, plus 8-10 targeted case studies from HLD Part 8, plus the top-5 most-cited trade-off pages.
- **SDE2s preparing for Senior/Staff.** The full **HLD Parts 3-7** are the core "you need to know this to design anything meaningful" material. Parts 6 (Reliability) and 7 (Security) separate Senior candidates from Staff candidates. **DSA Part 14** covers narration and trade-off articulation in the algorithmic round.
- **Software engineers building AI features.** The **AI Engineering Handbook** is for you if you call model APIs and need the feature to be reliable, measurable, secure, and affordable. Read Parts 0-4 first; Part 4 (evals) is the one to never skip.
- **Senior/Staff engineers refreshing or filling gaps.** **HLD Part 9** (AI/ML systems) and the Trade-offs Library are valuable even if you've been doing this for 15 years. Modern LLM serving and vector search weren't a thing when most of us learned backend.
- **Self-taught engineers without a CS degree** who want the vocabulary and the reasoning that bootcamps and YouTube don't teach. **HLD Part 0** is explicit prerequisites: TCP/IP, the OS contract, database internals, API design. **DSA Part 0** is the foundations — Big-O, recursion, bit manipulation — before pattern-matching becomes useful.
- **Career switchers** moving from adjacent roles (frontend → backend, backend → infra, SWE → MLE) who need to build system-level intuition fast.
- **Competitive programmers and ICPC/Codeforces contestants** who want a structured reference for the algorithmic toolkit (KMP, Aho-Corasick, suffix arrays, segment trees, Dijkstra, Bellman-Ford, DP variants).
- **Teachers and course creators** who want to build curriculum without writing thousands of pages from scratch. The CC BY-SA 4.0 license explicitly allows this.
- **Anyone operating a production system at non-trivial scale** who wants a reference shelf that covers the full stack — from packet-level networking to multi-tenant SaaS isolation models.

**These handbooks are NOT for:**

- **Absolute beginners with no programming experience.** HLD Part 0 assumes you can read code and have built at least one CRUD app. DSA Part 0 assumes you can write a `for` loop and a recursive function. If you're brand new, start with [The Odin Project](https://www.theodinproject.com/) or [CS50](https://cs50.harvard.edu/), then come back.
- **People who want low-level language-specific tutorials.** We don't teach Rust syntax or Go's goroutines — we teach concepts that apply across languages.

## How these handbooks compare

|                                           | This repo (HLD + DSA) | Typical OSS system-design repos | Typical OSS DSA repos | Paid courses (\$150-\$400+/yr) | O'Reilly-style books |
| ----------------------------------------- | :-------------------: | :-----------------------------: | :-------------------: | :----------------------: | :------------------: |
| Free and open-source                      |          Yes          |               Yes               |          Yes          |            No            |          No          |
| 100% inline content (no external redirects)|         Yes          |               No                |          No           |            Yes           |          Yes         |
| Both HLD + DSA in one curriculum          |          Yes          |               No                |          No           |          Rarely          |          No          |
| 150+ HLD chapters, 100+ DSA chapters      |          Yes          |               No                |          No           |     Only their sliver    |   Usually one topic  |
| 56 end-to-end HLD case studies            |          Yes          |          5-15 typical           |           —           |       15-25 typical      |        Varies        |
| Sibling code in Python / Java / C++ / Go  |          Yes          |                —                |       Rarely all 4    |        Sometimes         |        Rarely        |
| Interactive widgets on the DSA site       |          Yes          |                —                |          No           |        Sometimes         |          No          |
| Dedicated Trade-offs Library (22 pages)   |          Yes          |               No                |           —           |            No            |          No          |
| 37 DSA pattern decision pages             |          Yes          |                —                |          No           |            No            |          No          |
| Covers LLMs, RAG, agents, multimodal AI   |          Yes          |           Rarely modern         |           —           |        Sometimes         |        Rarely        |
| Opinionated decisions, not just options   |          Yes          |               No                |          No           |        Sometimes         |        Varies        |
| 3,100+ primary-source citations           |          Yes          |               No                |           —           |            No            |          Yes         |
| Community-editable, PRs welcome           |          Yes          |               Yes               |          Yes          |            No            |          No          |
| Updated continuously                      |          Yes          |          Often frozen           |     Often frozen      |          Varies          |    Every 3-5 years   |

## Start reading

> **For the best reading experience, visit [hld.handbook.academy](https://hld.handbook.academy)** for HLD or **[dsa.handbook.academy](https://dsa.handbook.academy)** for DSA — free, no sign-up, full search, dark mode, per-chapter diagram zoom, and the live DSA widgets. The links below open the source on GitHub, where Mermaid diagrams also render natively.

Pick one:

**I want a quick HLD taste.** Read these three in order — they give you the vocabulary and the first real worked example:

1. [Scalability: Growing a System Without Breaking It](content/hld/part-1-core-fundamentals/00-scalability.md)
2. [Back-of-the-Envelope Estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md)
3. [Design a URL Shortener (TinyURL / bit.ly)](content/hld/part-8-case-studies/00-url-shortener.md)

**I want a quick DSA taste.** Read these three to see the chapter shape and the sibling-code workflow:

1. [Arrays: static, dynamic, multi-dimensional](content/dsa/part-1-linear-data-structures/00-arrays.md)
2. [Two pointers: opposite ends](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md)
3. [Sliding window: variable size](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md)

**I'm preparing for an SDE2 interview in the next 6 weeks.** Follow the [SDE1 → SDE2 study plan](#sde1--sde2--6-week-interview-prep).

**I'm a Senior engineer refreshing my distributed-systems foundations.** Read [HLD Part 3 — Distributed Systems Theory](#part-3--distributed-systems-theory-11-chapters) straight through.

**I want to build AI features.** Read these three from the AI Engineering Handbook, then follow [the AI Engineering curriculum](#the-full-ai-engineering-curriculum) in order:

1. [What an AI engineer is (and isn't)](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md)
2. [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md)
3. [Why you can't ship without evals](content/ai-eng/part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md)

**I want to learn AI-systems design.** Read [HLD Part 9 — AI & ML System Design](#part-9--ai--ml-system-design-15-chapters) + the 8 AI case studies in [Part 8](#part-8--case-studies-56-chapters) (chapters 30-37).

**I want to grind interview algorithms.** Open [the DSA curriculum](#the-full-dsa-curriculum). Read Parts 0-2 in order, then jump into the pattern parts (3-9) as the problems you encounter call for them.

**I want to read every book cover-to-cover.** Start at [HLD Part 0](#part-0--prerequisites-5-chapters) for the systems track, [DSA Part 0](#the-full-dsa-curriculum) for the algorithms track, and [AI Engineering Part 0](#the-full-ai-engineering-curriculum) for the AI track. At one 25-minute chapter per day, the whole repo is roughly a year of reading.

---

## The full HLD curriculum

**181 pages across 12 parts + a 22-page Trade-offs Library.** Each part below is collapsed by default — click to expand the chapter list. Linking to a specific part from elsewhere in the README auto-expands it on GitHub.

| # | Part | Chapters | Difficulty | Reading time |
|---|------|---------:|------------|-------------:|
| 0 | [Prerequisites](#part-0--prerequisites-5-chapters) | 5 | Beginner | ~3 hrs |
| 1 | [Core Fundamentals](#part-1--core-fundamentals-7-chapters) | 7 | Beginner-Intermediate | ~4 hrs |
| 2 | [Building Blocks](#part-2--building-blocks-16-chapters) | 16 | Intermediate | ~10 hrs |
| 3 | [Distributed Systems Theory](#part-3--distributed-systems-theory-11-chapters) | 11 | Intermediate-Advanced | ~9 hrs |
| 4 | [Data Systems](#part-4--data-systems-10-chapters) | 10 | Intermediate-Advanced | ~8 hrs |
| 5 | [Architecture Patterns](#part-5--architecture-patterns-11-chapters) | 11 | Intermediate | ~8 hrs |
| 6 | [Reliability & Operations](#part-6--reliability--operations-11-chapters) | 11 | Intermediate-Advanced | ~8 hrs |
| 7 | [Security at Scale](#part-7--security-at-scale-10-chapters) | 10 | Intermediate-Advanced | ~7 hrs |
| 8 | [Case Studies](#part-8--case-studies-56-chapters) | 56 | Intermediate-Advanced | ~45 hrs |
| 9 | [AI & ML System Design](#part-9--ai--ml-system-design-15-chapters) | 15 | Intermediate-Advanced | ~11 hrs |
| 10 | [Emerging Patterns](#part-10--emerging-patterns-1-chapter) | 1 | Intermediate-Advanced | ~45 min |
| 11 | [Interview Framework](#part-11--interview-framework-6-chapters) | 6 | Intermediate | ~4 hrs |
| T | [Trade-offs Library](#trade-offs-library-22-pages) | 22 | Intermediate | ~8 hrs |

<details>
<summary><strong>Part 0 — Prerequisites (5 chapters)</strong> — networking, OS, data structures, databases, API design</summary>

### Part 0 — Prerequisites (5 chapters)

> **Audience:** engineers without a CS degree, or anyone who wants to confirm their foundations before moving on.
> **Difficulty:** Beginner. **Total reading time:** ~3 hours.

Foundational topics that the rest of the handbook assumes. If you can explain TCP's three-way handshake, the difference between a process and a thread, a B-tree's internal structure, and why idempotent PUT is better than non-idempotent POST for a retry-prone endpoint — you can skip this part.

1. [Networking Fundamentals for System Design](content/hld/part-0-prerequisites/00-networking-fundamentals.md) — OSI and TCP/IP layers, TCP vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS resolution, TLS handshake, what "the network is unreliable" really means in practice.
2. [Operating System Essentials for System Design](content/hld/part-0-prerequisites/01-os-essentials.md) — Processes vs threads, context switching cost, virtual memory, page cache, filesystem I/O, epoll/kqueue/IOCP, why `O_DIRECT` matters for databases.
3. [Data Structures for Distributed Systems](content/hld/part-0-prerequisites/02-data-structures-for-systems.md) — Hash tables, B-trees, LSM-trees, skip lists, Bloom filters, tries, HyperLogLog, Count-Min Sketch, and when each shows up in real systems.
4. [Database Fundamentals for System Design](content/hld/part-0-prerequisites/03-database-fundamentals.md) — Transactions, isolation levels (read-committed to serializable), indexes, query planners, joins, and why your ORM hides things from you that you need to see.
5. [API Design Basics: REST, GraphQL, gRPC, and the Hard Parts](content/hld/part-0-prerequisites/04-api-design-basics.md) — Resource modeling, idempotency, versioning, pagination, rate-limit headers, error envelopes, HATEOAS in theory vs practice.

</details>

<details>
<summary><strong>Part 1 — Core Fundamentals (7 chapters)</strong> — scalability, latency, availability, consistency, estimation, trade-off thinking</summary>

### Part 1 — Core Fundamentals (7 chapters)

> **Audience:** everybody — read this part even if you know the topic, because the vocabulary here is used for the rest of the book.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~4 hours.

The vocabulary and the reasoning habits that every later chapter assumes. "Scalability," "consistency," "trade-off," and "back-of-envelope" get defined here rigorously so they mean something specific when we use them later.

1. [Scalability: Growing a System Without Breaking It](content/hld/part-1-core-fundamentals/00-scalability.md)
2. [Latency and Throughput: The Two Numbers That Matter](content/hld/part-1-core-fundamentals/01-latency-and-throughput.md)
3. [Availability and Reliability: Nines, SLOs, and Staying Up](content/hld/part-1-core-fundamentals/02-availability-and-reliability.md)
4. [Consistency Models: What Readers Actually See](content/hld/part-1-core-fundamentals/03-consistency-models.md)
5. [Back-of-the-Envelope Estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md)
6. [How to Approach a System Design Question](content/hld/part-1-core-fundamentals/05-how-to-approach-design-questions.md)
7. [Trade-off Thinking](content/hld/part-1-core-fundamentals/06-trade-off-thinking.md)

</details>

<details>
<summary><strong>Part 2 — Building Blocks (16 chapters)</strong> — load balancers, caches, queues, CDNs, databases, sharding, pub/sub, rate limiting, blob storage, geo, edge</summary>

### Part 2 — Building Blocks (16 chapters)

> **Audience:** anyone who'll assemble backend systems. This part is the Lego brick inventory.
> **Difficulty:** Intermediate. **Total reading time:** ~10 hours.

Deep dives on the pieces you assemble to build real systems: load balancers, caches, queues, CDNs, databases (SQL and NoSQL), partitioning, replication, pub/sub, rate limiters, service discovery, blob storage, geospatial indexes, and edge compute.

1. [Load Balancers: Spreading Traffic, Absorbing Failure](content/hld/part-2-building-blocks/00-load-balancers.md)
2. [Reverse Proxies and API Gateways: The Smart Edge](content/hld/part-2-building-blocks/01-reverse-proxies-api-gateways.md)
3. [Content Delivery Networks: Moving Bytes Closer to Users](content/hld/part-2-building-blocks/02-cdns.md)
4. [Caching: From Browser to Database](content/hld/part-2-building-blocks/03-caching.md)
5. [SQL Databases: The Boring Technology That Wins](content/hld/part-2-building-blocks/04-sql-databases.md)
6. [NoSQL Databases: Picking the Right Non-Relational Tool](content/hld/part-2-building-blocks/05-nosql-databases.md)
7. [Database Partitioning and Sharding: When One Node Is Not Enough](content/hld/part-2-building-blocks/06-database-partitioning-sharding.md)
8. [Database Replication: Keeping Copies in Sync](content/hld/part-2-building-blocks/07-database-replication.md)
9. [Message Queues and Streaming: Decoupling at Scale](content/hld/part-2-building-blocks/08-message-queues-streaming.md)
10. [Pub/Sub: Fan-Out and Event-Driven Systems](content/hld/part-2-building-blocks/09-pub-sub.md)
11. [Real-Time Communication: WebSockets, SSE, and Long Polling](content/hld/part-2-building-blocks/10-real-time-communication.md)
12. [Rate Limiting: Protecting Systems from Themselves](content/hld/part-2-building-blocks/11-rate-limiting.md)
13. [Service Discovery and Service Mesh: Finding and Talking to Services](content/hld/part-2-building-blocks/12-service-discovery-mesh.md)
14. [Blob and Object Storage: Storing the Big Stuff](content/hld/part-2-building-blocks/13-blob-object-storage.md)
15. [Geospatial Indexing: Geohash, Quadtree, R-tree, S2, and H3](content/hld/part-2-building-blocks/14-geospatial-indexing.md)
16. [Edge Computing (Cloudflare Workers, Lambda@Edge, Deno Deploy)](content/hld/part-2-building-blocks/15-edge-computing.md)

</details>

<details>
<summary><strong>Part 3 — Distributed Systems Theory (11 chapters)</strong> — consensus, consistency, clocks, CRDTs, transactions</summary>

### Part 3 — Distributed Systems Theory (11 chapters)

> **Audience:** SDE2+ preparing for Senior/Staff. If you haven't internalized linearizability vs serializability, read this.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~9 hours.

The theory that makes distributed systems *distributed*: consensus (Raft/Paxos), the full consistency spectrum, CAP/PACELC in 2025 framing, logical clocks, CRDTs, distributed transactions (2PC/Saga), exactly-once delivery, failure detection, consistent hashing, and Merkle-tree anti-entropy.

1. [Consensus Protocols: How Distributed Systems Agree](content/hld/part-3-distributed-systems-theory/00-consensus-protocols.md)
2. [Consistency Deep Dive: Linearizability, Serializability, and the Spectrum Between](content/hld/part-3-distributed-systems-theory/01-consistency-deep-dive.md)
3. [Quorums and Replication: The Math of R + W > N](content/hld/part-3-distributed-systems-theory/02-quorums-and-replication.md)
4. [CAP and PACELC: The Tradeoff That Keeps Confusing People](content/hld/part-3-distributed-systems-theory/03-cap-and-pacelc.md)
5. [Clocks and Ordering: Lamport, Vector, and Hybrid Logical Clocks](content/hld/part-3-distributed-systems-theory/04-clocks-and-ordering.md)
6. [CRDTs: Conflict-Free Replicated Data Types](content/hld/part-3-distributed-systems-theory/05-crdts.md)
7. [Distributed Transactions: 2PC, Saga, and When to Avoid Both](content/hld/part-3-distributed-systems-theory/06-distributed-transactions.md)
8. [Idempotency and Exactly-Once: The Honest Truth About Delivery Guarantees](content/hld/part-3-distributed-systems-theory/07-idempotency-exactly-once.md)
9. [Failure Detection: Deciding a Node Is Dead](content/hld/part-3-distributed-systems-theory/08-failure-detection.md)
10. [Consistent Hashing: Keys to Nodes Without Global Reshuffles](content/hld/part-3-distributed-systems-theory/09-consistent-hashing.md)
11. [Merkle Trees and Anti-Entropy: Keeping Replicas in Sync Cheaply](content/hld/part-3-distributed-systems-theory/10-merkle-trees-anti-entropy.md)

</details>

<details>
<summary><strong>Part 4 — Data Systems (10 chapters)</strong> — storage engines, OLTP/OLAP, warehouses/lakes, streams, search, time-series, graph, vector, KV</summary>

### Part 4 — Data Systems (10 chapters)

> **Audience:** anyone who owns a data pipeline or picks a database.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~8 hours.

Every flavor of data system you might pick, and when each actually fits. Storage engines (B-tree vs LSM), OLTP vs OLAP, warehouses/lakes/lakehouses, streaming vs batch, CDC, search, time-series, graph, vector, and key-value.

1. [Storage Engines: B-Trees, LSM-Trees, and Why Your Database Feels the Way It Does](content/hld/part-4-data-systems/00-storage-engines.md)
2. [OLTP vs OLAP: Row Stores, Column Stores, and Matching Shape to Workload](content/hld/part-4-data-systems/01-oltp-vs-olap.md)
3. [Data Warehouses and Data Lakes: Structure, Schema, and the Lakehouse](content/hld/part-4-data-systems/02-data-warehouses-lakes.md)
4. [Stream vs Batch Processing: Lambda, Kappa, and the End of That Debate](content/hld/part-4-data-systems/03-stream-vs-batch.md)
5. [Change Data Capture: Streaming the Database's Inner Monologue](content/hld/part-4-data-systems/04-change-data-capture.md)
6. [Search Systems: Inverted Indexes, BM25, and Running Elasticsearch in Production](content/hld/part-4-data-systems/05-search-systems.md)
7. [Time-Series Databases: Metrics, Events, and Retention at Scale](content/hld/part-4-data-systems/06-time-series-databases.md)
8. [Graph Databases: Property Graphs, Cypher, and When Joins Are the Problem](content/hld/part-4-data-systems/07-graph-databases.md)
9. [Vector Databases: Embeddings, ANN Indexes, and the Retrieval Layer for AI](content/hld/part-4-data-systems/08-vector-databases.md)
10. [Key-Value Stores: Redis, Memcached, DynamoDB, and Picking the Right Hash Table](content/hld/part-4-data-systems/09-key-value-stores.md)

</details>

<details>
<summary><strong>Part 5 — Architecture Patterns (11 chapters)</strong> — monolith vs micro, event-driven, CQRS, ES, serverless, BFF, strangler, hex, multi-region, multi-tenant, CRDT apps</summary>

### Part 5 — Architecture Patterns (11 chapters)

> **Audience:** engineers making architecture-level decisions or leading service migrations.
> **Difficulty:** Intermediate. **Total reading time:** ~8 hours.

The architectural shapes you choose between when you design anything bigger than a single service: monolith vs microservices, event-driven, CQRS, event sourcing, serverless, BFF, strangler fig, hexagonal/clean, multi-region, multi-tenancy, CRDT-based apps.

1. [Monolith vs Microservices: Team Topology, Conway's Law, and the Distributed System Tax](content/hld/part-5-architecture-patterns/00-monolith-vs-microservices.md)
2. [Event-Driven Architecture: Notifications, State Transfer, and Choreography](content/hld/part-5-architecture-patterns/01-event-driven-architecture.md)
3. [CQRS: Separating Reads from Writes Without Losing Your Mind](content/hld/part-5-architecture-patterns/02-cqrs.md)
4. [Event Sourcing: Events as the Source of Truth](content/hld/part-5-architecture-patterns/03-event-sourcing.md)
5. [Serverless: Functions, Cold Starts, and When FaaS Actually Saves Money](content/hld/part-5-architecture-patterns/04-serverless.md)
6. [Backend for Frontend: Per-Client API Aggregation Done Right](content/hld/part-5-architecture-patterns/05-backend-for-frontend.md)
7. [Strangler Fig: Incremental Migration Without a Big Bang](content/hld/part-5-architecture-patterns/06-strangler-fig.md)
8. [Hexagonal and Clean Architecture: Keeping Business Logic Independent](content/hld/part-5-architecture-patterns/07-hexagonal-clean-architecture.md)
9. [Multi-Region Architecture: Active-Passive, Active-Active, and CRDTs](content/hld/part-5-architecture-patterns/08-multi-region-architecture.md)
10. [Multi-Tenancy: Silo, Pool, and the SaaS Isolation Spectrum](content/hld/part-5-architecture-patterns/09-multi-tenancy.md)
11. [CRDT Applications (Yjs, Automerge, Local-First Software)](content/hld/part-5-architecture-patterns/10-crdt-applications.md)

</details>

<details>
<summary><strong>Part 6 — Reliability & Operations (11 chapters)</strong> — observability, SLOs, resilience, scaling, deploys, chaos, incidents, FinOps, platform</summary>

### Part 6 — Reliability & Operations (11 chapters)

> **Audience:** anyone on-call, anyone who signs SLAs, anyone paying a cloud bill.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~8 hours.

The engineering that separates "it compiles" from "it runs reliably at 3 a.m. on a long weekend": observability, SLOs, resilience patterns, auto-scaling, deployments, chaos engineering, incident response, health checks, FinOps, platform engineering.

1. [Observability: Metrics, Logs, Traces, and the OpenTelemetry Standard](content/hld/part-6-reliability-and-operations/00-observability.md)
2. [SLI, SLO, SLA, and Error Budgets: Making Reliability Quantitative](content/hld/part-6-reliability-and-operations/01-sli-slo-sla-error-budgets.md)
3. [Resilience Patterns: Timeouts, Retries, Circuit Breakers, and Bulkheads](content/hld/part-6-reliability-and-operations/02-resilience-patterns.md)
4. [Graceful Degradation: When Partial Service Beats No Service](content/hld/part-6-reliability-and-operations/03-graceful-degradation.md)
5. [Auto-Scaling and Capacity Planning: From HPA to Predictive Scaling](content/hld/part-6-reliability-and-operations/04-auto-scaling-capacity.md)
6. [Deployment Strategies: Blue-Green, Canary, Rolling, and Feature Flags](content/hld/part-6-reliability-and-operations/05-deployment-strategies.md)
7. [Chaos Engineering: Breaking Things on Purpose](content/hld/part-6-reliability-and-operations/06-chaos-engineering.md)
8. [Incident Management: From Detection to Blameless Postmortem](content/hld/part-6-reliability-and-operations/07-incident-management.md)
9. [Health Checks and Readiness: Telling the Truth About Whether You're Up](content/hld/part-6-reliability-and-operations/08-health-checks-readiness.md)
10. [Cost Optimization and FinOps](content/hld/part-6-reliability-and-operations/09-cost-optimization-finops.md)
11. [Platform Engineering: IDPs, Golden Paths, and DX](content/hld/part-6-reliability-and-operations/10-platform-engineering.md)

</details>

<details>
<summary><strong>Part 7 — Security at Scale (10 chapters)</strong> — AuthN/Z, OAuth/OIDC, JWT, mTLS, secrets, DDoS/WAF, compliance, supply chain, privacy, PQC</summary>

### Part 7 — Security at Scale (10 chapters)

> **Audience:** Senior/Staff engineers, platform teams, security-adjacent builders.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~7 hours.

Security architecture for real systems, not a CISSP crib sheet: AuthN vs AuthZ, OAuth2/OIDC, JWT (and why you probably shouldn't), mTLS, secrets management, DDoS/WAF, compliance (GDPR/DPDP/CCPA), software supply chain, privacy-preserving systems, post-quantum cryptography.

1. [Authentication vs Authorization: Identity, Permissions, and Access Models](content/hld/part-7-security-at-scale/00-authn-authz.md)
2. [OAuth 2.0 and OpenID Connect: Delegated Authorization and Identity Done Right](content/hld/part-7-security-at-scale/01-oauth2-oidc.md)
3. [JWT Deep Dive: Signed Tokens, Claims, and the Revocation Problem](content/hld/part-7-security-at-scale/02-jwt-deep-dive.md)
4. [mTLS and Service-to-Service Authentication: SPIFFE, Service Mesh, and Zero Trust](content/hld/part-7-security-at-scale/03-mtls-service-auth.md)
5. [Secrets Management: Vault, KMS, and the End of Secrets in Config Files](content/hld/part-7-security-at-scale/04-secrets-management.md)
6. [DDoS Protection and WAFs: Mitigating Volumetric and Application Attacks](content/hld/part-7-security-at-scale/05-ddos-waf.md)
7. [Data Residency and Compliance Architecture (GDPR, DPDP, CCPA, Right-to-Erasure)](content/hld/part-7-security-at-scale/06-data-residency-compliance.md)
8. [Supply Chain Security: SBOM, SLSA, Sigstore, and Defending Against xz-utils](content/hld/part-7-security-at-scale/07-supply-chain-security.md)
9. [Privacy-Preserving Systems (Differential Privacy, Federated Learning)](content/hld/part-7-security-at-scale/08-privacy-preserving-systems.md)
10. [Post-Quantum Cryptography: Migrating to ML-KEM, ML-DSA, and a Crypto-Agile Future](content/hld/part-7-security-at-scale/09-post-quantum-crypto.md)

</details>

<details>
<summary><strong>Part 8 — Case Studies (56 chapters)</strong> — 56 end-to-end designs, grouped by theme; the centerpiece of interview prep</summary>

### Part 8 — Case Studies (56 chapters)

> **Audience:** interview prep candidates, engineers building adjacent systems, anyone who learns best from worked examples.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~45 hours.

56 end-to-end system designs, each following a consistent structure: requirements (functional + non-functional), back-of-envelope numbers, high-level architecture, data model, deep-dive components, scalability and reliability considerations, and real-world references. Grouped thematically below for easier navigation.

<details>
<summary><strong>Core primitives (chapters 00-03)</strong> — the four designs you see in every interview</summary>

1. [Design a URL Shortener (TinyURL / bit.ly)](content/hld/part-8-case-studies/00-url-shortener.md)
2. [Design a Pastebin (Paste Sharing Service)](content/hld/part-8-case-studies/01-pastebin.md)
3. [Design a Distributed Rate Limiter](content/hld/part-8-case-studies/02-rate-limiter.md)
4. [Design a Distributed Key-Value Store (Dynamo / Cassandra / Riak)](content/hld/part-8-case-studies/03-key-value-store.md)

</details>

<details>
<summary><strong>Messaging & social (chapters 04-09)</strong> — notifications, chat, feeds, photos, crawlers, autocomplete</summary>

1. [Design a Notification System (Push, SMS, Email at Scale)](content/hld/part-8-case-studies/04-notification-system.md)
2. [Design a Chat System (WhatsApp / Messenger / Signal)](content/hld/part-8-case-studies/05-chat-system.md)
3. [Design a Social Media Feed (Twitter / Instagram / LinkedIn)](content/hld/part-8-case-studies/06-social-media-feed.md)
4. [Design a Photo Sharing Service (Instagram)](content/hld/part-8-case-studies/07-photo-sharing.md)
5. [Design a Web Crawler (Googlebot-style)](content/hld/part-8-case-studies/08-web-crawler.md)
6. [Design Search Autocomplete (Typeahead Suggestions)](content/hld/part-8-case-studies/09-search-autocomplete.md)

</details>

<details>
<summary><strong>Media & consumer products (chapters 10-17)</strong> — video, ride-hailing, maps, file sync, editing, cache, recommenders</strong></summary>

1. [Design a Video Streaming Service (YouTube / Twitch / TikTok)](content/hld/part-8-case-studies/10-video-streaming.md)
2. [Design Netflix (End-to-End)](content/hld/part-8-case-studies/11-netflix.md)
3. [Design a Ride-Hailing Service (Uber / Lyft)](content/hld/part-8-case-studies/12-ride-hailing.md)
4. [Design Google Maps (Routing and Tile Rendering)](content/hld/part-8-case-studies/13-google-maps.md)
5. [Design a File Sync Service (Dropbox / Google Drive)](content/hld/part-8-case-studies/14-file-sync.md)
6. [Design Collaborative Editing (Google Docs / Figma / Notion)](content/hld/part-8-case-studies/15-collaborative-editing.md)
7. [Design a Distributed Cache (Memcached / Redis Cluster)](content/hld/part-8-case-studies/16-distributed-cache.md)
8. [Design a Recommendation System (Netflix / YouTube / TikTok)](content/hld/part-8-case-studies/17-recommendation-system.md)

</details>

<details>
<summary><strong>Commerce & financial (chapters 18-21)</strong> — ticketing, payments, stock exchange, food delivery</summary>

1. [Design a Ticketing System (BookMyShow / Ticketmaster)](content/hld/part-8-case-studies/18-ticketing-system.md)
2. [Design a Payment System (Stripe / PayPal)](content/hld/part-8-case-studies/19-payment-system.md)
3. [Design a Stock Exchange (Matching Engine)](content/hld/part-8-case-studies/20-stock-exchange.md)
4. [Design a Food Delivery Service (DoorDash / Swiggy)](content/hld/part-8-case-studies/21-food-delivery.md)

</details>

<details>
<summary><strong>Data & infrastructure (chapters 22-29)</strong> — metrics, ad-click, logs, proximity, leaderboards, IDs, hotels, schedulers</summary>

1. [Design a Metrics Pipeline (Prometheus / InfluxDB / Thanos)](content/hld/part-8-case-studies/22-metrics-pipeline.md)
2. [Design Ad-Click Aggregation (Real-Time Stream Processing)](content/hld/part-8-case-studies/23-ad-click-aggregation.md)
3. [Design a Logging Platform (ELK / Loki / Splunk)](content/hld/part-8-case-studies/24-logging-platform.md)
4. [Design a Proximity Service (Nearby Friends / Yelp)](content/hld/part-8-case-studies/25-proximity-service.md)
5. [Design a Real-Time Leaderboard](content/hld/part-8-case-studies/26-leaderboard.md)
6. [Design a Unique ID Generator (Snowflake, ULID, TSID, UUIDv7)](content/hld/part-8-case-studies/27-unique-id-generator.md)
7. [Design a Hotel Reservation System (Booking.com / Airbnb)](content/hld/part-8-case-studies/28-hotel-reservation.md)
8. [Design a Distributed Job Scheduler (Airflow / Temporal / Distributed Cron)](content/hld/part-8-case-studies/29-job-scheduler.md)

</details>

<details>
<summary><strong>AI systems (chapters 30-37)</strong> — ChatGPT, RAG, coding agents, AI search, voice, moderation, semantic cache, model routing</summary>

1. [Design ChatGPT (Conversational AI at Scale)](content/hld/part-8-case-studies/30-chatgpt-conversational-ai.md)
2. [Design an Enterprise RAG System](content/hld/part-8-case-studies/31-enterprise-rag.md)
3. [Design a Coding Agent (Claude Code / GitHub Copilot / Cursor)](content/hld/part-8-case-studies/32-coding-agent.md)
4. [Design Perplexity (AI Search with Citations)](content/hld/part-8-case-studies/33-perplexity-ai-search.md)
5. [Design a Voice Agent (Alexa / Siri-Class Realtime)](content/hld/part-8-case-studies/34-voice-agent.md)
6. [Design a Content Moderation System at Scale](content/hld/part-8-case-studies/35-content-moderation-at-scale.md)
7. [Design a Semantic Cache for LLM Applications](content/hld/part-8-case-studies/36-semantic-cache.md)
8. [Design a Model Router and Gateway (OpenRouter / LiteLLM)](content/hld/part-8-case-studies/37-model-router-gateway.md)

</details>

<details>
<summary><strong>Infra services (chapters 38-39)</strong> — feature flags, DNS</summary>

1. [Design a Feature Flag Service (LaunchDarkly / Harness FME / Unleash)](content/hld/part-8-case-studies/38-feature-flag-service.md)
2. [Design a DNS Service (Cloudflare 1.1.1.1 / Google 8.8.8.8)](content/hld/part-8-case-studies/39-dns-service.md)

</details>

<details>
<summary><strong>Consumer products II (chapters 40-49)</strong> — dating, auctions, SaaS, video conf, email, live comments, fraud, fitness, online judge, price tracking</summary>

1. [Design a Dating App (Tinder / Hinge / Bumble)](content/hld/part-8-case-studies/40-dating-app.md)
2. [Design an Online Auction (eBay / Catawiki)](content/hld/part-8-case-studies/41-online-auction.md)
3. [Design a Multi-Tenant SaaS Platform](content/hld/part-8-case-studies/42-multi-tenant-saas.md)
4. [Design a Video Conferencing System (Zoom / Google Meet)](content/hld/part-8-case-studies/43-video-conferencing.md)
5. [Design an Email Service at Gmail Scale (1.8B Users, 300B Messages/Day)](content/hld/part-8-case-studies/44-gmail-scale-email.md)
6. [Design Live Comments at Scale (FB Live / YouTube Live / Twitch Chat)](content/hld/part-8-case-studies/45-live-comments.md)
7. [Design a Fraud Detection System (Stripe Radar / PayPal / Feedzai)](content/hld/part-8-case-studies/46-fraud-detection.md)
8. [Design a Fitness Tracking Service (Strava / MapMyRun)](content/hld/part-8-case-studies/47-strava-fitness.md)
9. [Design an Online Judge (LeetCode / Codeforces / HackerEarth)](content/hld/part-8-case-studies/48-online-judge.md)
10. [Design a Price Tracking Service (CamelCamelCamel / Honey / Keepa)](content/hld/part-8-case-studies/49-price-tracking.md)

</details>

<details>
<summary><strong>Developer & ops platforms (chapters 50-55)</strong> — API gateway, CI/CD, observability, search engine, brokerage, chat-at-scale</summary>

1. [Design an API Gateway at Scale (Kong / AWS API Gateway / Apigee / Envoy)](content/hld/part-8-case-studies/50-api-gateway.md)
2. [Design a CI/CD Platform (GitHub Actions / GitLab CI / CircleCI)](content/hld/part-8-case-studies/51-cicd-platform.md)
3. [Design an Observability Platform (Datadog / New Relic / Honeycomb)](content/hld/part-8-case-studies/52-observability-platform.md)
4. [Design a Search Engine (Google-Scale / Brave Search)](content/hld/part-8-case-studies/53-search-engine.md)
5. [Design a Brokerage Platform (Robinhood / E*TRADE / Interactive Brokers)](content/hld/part-8-case-studies/54-brokerage-trading.md)
6. [Design Channel-Scale Chat (Discord / Slack)](content/hld/part-8-case-studies/55-channel-scale-chat.md)

</details>

</details>

<details>
<summary><strong>Part 9 — AI & ML System Design (15 chapters)</strong> — LLM serving, RAG, vector search, agents, LLMOps, safety, recommenders, multimodal</summary>

### Part 9 — AI & ML System Design (15 chapters)

> **Audience:** anyone building with or around LLMs, agents, or production ML.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~11 hours.

Modern AI-systems architecture, treated with the same rigor as Part 3: LLM serving, RAG, vector search, agent architectures, multi-agent orchestration, LLM evaluation, LLMOps, cost optimization, safety, ML fundamentals, feature stores, recommenders, real-time AI, multimodal, and the data infra underneath all of it.

1. [LLM Serving Architecture (vLLM, TGI, TensorRT-LLM)](content/hld/part-9-ai-ml-system-design/00-llm-serving-architecture.md)
2. [RAG Pipelines (Retrieval-Augmented Generation)](content/hld/part-9-ai-ml-system-design/01-rag-pipelines.md)
3. [Vector Search at Scale (HNSW, IVF-PQ, DiskANN)](content/hld/part-9-ai-ml-system-design/02-vector-search-at-scale.md)
4. [AI Agent Architectures (ReAct, Reflection, Planning, Tool Use, Memory)](content/hld/part-9-ai-ml-system-design/03-ai-agent-architectures.md)
5. [Multi-Agent Orchestration (LangGraph, OpenAI Agents SDK, AutoGen, Swarm)](content/hld/part-9-ai-ml-system-design/04-multi-agent-orchestration.md)
6. [LLM Evaluation and Observability (Ragas, LangSmith, TruLens, LLM-as-Judge)](content/hld/part-9-ai-ml-system-design/05-llm-evaluation-observability.md)
7. [LLMOps and Prompt Engineering (Versioning, Guardrails, Red-Teaming)](content/hld/part-9-ai-ml-system-design/06-llmops-prompt-engineering.md)
8. [LLM Cost Optimisation (Semantic Cache, Model Routing, Cascading, Prompt Caching)](content/hld/part-9-ai-ml-system-design/07-llm-cost-optimization.md)
9. [LLM Safety and Guardrails (OWASP LLM Top 10, Prompt Injection, PII, Jailbreaks)](content/hld/part-9-ai-ml-system-design/08-llm-safety-guardrails.md)
10. [ML System Design Fundamentals](content/hld/part-9-ai-ml-system-design/09-ml-system-design-fundamentals.md)
11. [Feature Stores and Model Serving (Feast, Tecton, KServe, BentoML, MLflow)](content/hld/part-9-ai-ml-system-design/10-feature-stores-model-serving.md)
12. [Recommendation Systems Deep Dive (DLRM, Two-Tower, Embedding Retrieval, Cold Start)](content/hld/part-9-ai-ml-system-design/11-recommendation-systems.md)
13. [Realtime AI and Voice Agents (Streaming Inference, WebRTC, LiveKit, Deepgram)](content/hld/part-9-ai-ml-system-design/12-realtime-ai-voice-agents.md)
14. [Multimodal AI Systems (CLIP, Whisper, LayoutLM, Document AI)](content/hld/part-9-ai-ml-system-design/13-multimodal-ai-systems.md)
15. [Data Infrastructure for AI (Embedding Pipelines, Chunking, Unstructured ETL, MCP)](content/hld/part-9-ai-ml-system-design/14-data-infrastructure-for-ai.md)

</details>

<details>
<summary><strong>Part 10 — Emerging Patterns (1 chapter)</strong> — green/sustainable computing; growing list of forward-looking topics</summary>

### Part 10 — Emerging Patterns (1 chapter)

> **Audience:** Staff+ engineers and architects thinking past 2026.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~45 minutes.

Forward-looking topics that are adjacent to everything else. Currently one chapter, with more planned (WebAssembly at the edge, unikernels, confidential computing, on-device AI).

1. [Green Computing (Carbon-Aware Scheduling, PUE, Sustainable Systems)](content/hld/part-10-emerging-patterns/00-green-computing.md)

</details>

<details>
<summary><strong>Part 11 — Interview Framework (6 chapters)</strong> — RESHADED/PEDALS/ADEPT, requirements, diagrams, trade-offs, company flavors, RFCs</summary>

### Part 11 — Interview Framework (6 chapters)

> **Audience:** anyone preparing for or giving system-design interviews.
> **Difficulty:** Intermediate. **Total reading time:** ~4 hours.

How to run a 45-minute system-design interview, from both sides of the whiteboard. Compares RESHADED / PEDALS / ADEPT frameworks, teaches requirements scoping, diagramming, trade-off articulation, company-specific flavors, and RFC/design-doc authoring for Staff-level work.

1. [Interview Frameworks Compared (RESHADED, PEDALS, ADEPT)](content/hld/part-11-interview-framework/00-frameworks-compared.md)
2. [Requirements Scoping: Functional, Non-Functional, and MoSCoW](content/hld/part-11-interview-framework/01-requirements-scoping.md)
3. [Diagramming Skills for System Design Interviews](content/hld/part-11-interview-framework/02-diagramming-skills.md)
4. [Trade-off Articulation: Saying 'It Depends' Well](content/hld/part-11-interview-framework/03-trade-off-articulation.md)
5. [Company-Specific Interview Flavors (Amazon, Google, Meta, Netflix)](content/hld/part-11-interview-framework/04-company-specific-flavors.md)
6. [Design Doc Authoring: RFCs, ADRs, and the Staff Engineer's Written Output](content/hld/part-11-interview-framework/05-design-doc-authoring.md)

</details>

<details>
<summary><strong>Trade-offs Library (22 pages)</strong> — the canonical "X vs Y" decision pages cross-referenced from every part</summary>

### Trade-offs Library (22 pages)

> **Audience:** everyone — these pages are referenced from every other part.
> **Difficulty:** Intermediate. **Total reading time:** ~8 hours.

The 22 most-asked architectural-choice questions, each answered in a dedicated decision-comparison page: flowchart, comparison table, "when to pick A" vs "when to pick B" sections, real-world examples, and citations.

1. [Strong vs Eventual Consistency](content/hld/trade-offs/01-strong-vs-eventual-consistency.md)
2. [ACID vs BASE](content/hld/trade-offs/02-acid-vs-base.md)
3. [SQL vs NoSQL](content/hld/trade-offs/03-sql-vs-nosql.md)
4. [Latency vs Throughput](content/hld/trade-offs/04-latency-vs-throughput.md)
5. [CAP and PACELC Applied](content/hld/trade-offs/05-cap-and-pacelc.md)
6. [Cache Strategies: Cache-Aside vs Write-Through vs Write-Behind](content/hld/trade-offs/06-cache-strategies.md)
7. [Batch vs Stream Processing](content/hld/trade-offs/07-batch-vs-stream.md)
8. [Load Balancer vs Reverse Proxy vs API Gateway](content/hld/trade-offs/08-load-balancer-vs-proxy-vs-gateway.md)
9. [REST vs gRPC vs GraphQL](content/hld/trade-offs/09-rest-vs-grpc-vs-graphql.md)
10. [Polling vs Long-Polling vs SSE vs WebSockets vs Webhooks](content/hld/trade-offs/10-polling-vs-websockets.md)
11. [Rate Limiting Algorithms: Token Bucket vs Sliding Window](content/hld/trade-offs/11-rate-limiting-algorithms.md)
12. [Optimistic vs Pessimistic Concurrency Control](content/hld/trade-offs/12-optimistic-vs-pessimistic-locking.md)
13. [Partitioning Schemes: Range, Hash, Consistent Hash, Directory](content/hld/trade-offs/13-partitioning-schemes.md)
14. [B-tree vs LSM-tree Storage](content/hld/trade-offs/14-btree-vs-lsm.md)
15. [Monolith vs Microservices](content/hld/trade-offs/15-monolith-vs-microservices.md)
16. [Replication Topologies: Leader-Follower, Multi-Leader, Leaderless](content/hld/trade-offs/16-replication-topologies.md)
17. [Distributed Transactions: 2PC vs Saga vs TCC](content/hld/trade-offs/17-distributed-transactions.md)
18. [Push vs Pull (Fan-out, Messaging, Feed)](content/hld/trade-offs/18-push-vs-pull.md)
19. [Lambda vs Kappa Architecture](content/hld/trade-offs/19-lambda-vs-kappa.md)
20. [Vertical vs Horizontal Scaling](content/hld/trade-offs/20-vertical-vs-horizontal-scaling.md)
21. [Normalization vs Denormalization](content/hld/trade-offs/21-normalization-vs-denormalization.md)
22. [Single-Region vs Multi-Region Deployment](content/hld/trade-offs/22-single-vs-multi-region.md)

</details>

---

## The full DSA curriculum

**120 chapters across 15 parts, plus 37 pattern decision pages, 5 long-form editorials, and 46 interactive widget specs.** Each chapter is centered on a specific data structure or algorithmic pattern, taught with worked LeetCode problems. Sibling `sol.py` / `sol.java` / `sol.cpp` / `sol.go` files live under each problem directory; the Python solution is inlined in the chapter, the others are linked. Editorials, pattern decision diagrams, and widget YAML specs are siblings under `content/dsa/`.

Each part below is collapsed by default — click to expand the chapter list. Linking to a specific part from elsewhere in the README auto-expands it on GitHub.

| # | Part | Chapters | Difficulty | Reading time |
|---|------|---------:|------------|-------------:|
| 0 | [Foundations](#part-0--foundations-7-chapters) | 7 | Beginner | ~3 hrs |
| 1 | [Linear Data Structures](#part-1--linear-data-structures-8-chapters) | 8 | Beginner | ~5 hrs |
| 2 | [Search & Sort](#part-2--search--sort-8-chapters) | 8 | Beginner-Intermediate | ~5 hrs |
| 3 | [Two Pointers, Sliding Window, Prefix Sums](#part-3--two-pointers-sliding-window-prefix-sums-6-chapters) | 6 | Intermediate | ~4 hrs |
| 4 | [Stack & Queue Patterns](#part-4--stack--queue-patterns-5-chapters) | 5 | Intermediate | ~3 hrs |
| 5 | [Linked Lists](#part-5--linked-lists-6-chapters) | 6 | Intermediate | ~4 hrs |
| 6 | [Trees & Heaps](#part-6--trees--heaps-11-chapters) | 11 | Intermediate-Advanced | ~7 hrs |
| 7 | [Recursion & Backtracking](#part-7--recursion--backtracking-7-chapters) | 7 | Intermediate-Advanced | ~5 hrs |
| 8 | [Graphs](#part-8--graphs-13-chapters) | 13 | Intermediate-Advanced | ~9 hrs |
| 9 | [Dynamic Programming](#part-9--dynamic-programming-15-chapters) | 15 | Advanced | ~10 hrs |
| 10 | [Greedy](#part-10--greedy-5-chapters) | 5 | Intermediate-Advanced | ~3 hrs |
| 11 | [Bit Manipulation](#part-11--bit-manipulation-4-chapters) | 4 | Intermediate | ~2 hrs |
| 12 | [Strings & Pattern Matching](#part-12--strings--pattern-matching-6-chapters) | 6 | Intermediate-Advanced | ~4 hrs |
| 13 | [Design the Data Structure](#part-13--design-the-data-structure-7-chapters) | 7 | Intermediate-Advanced | ~5 hrs |
| 14 | [Interview Framework](#part-14--interview-framework-12-chapters) | 12 | All levels | ~5 hrs |
| P | [Pattern decision pages](#dsa-pattern-decision-pages-37-pages) | 37 | Intermediate | ~10 hrs |
| E | [Long-form editorials](#dsa-long-form-editorials-5-pages) | 5 | Intermediate | ~2 hrs |
| W | [Interactive widget specs](#dsa-interactive-widget-specs-46-yaml-files) | 46 | — | reference |

<details>
<summary><strong>Part 0 — Foundations (7 chapters)</strong> — Big-O, recursion, bit ops, interview math, language idioms, choosing your language</summary>

### Part 0 — Foundations (7 chapters)

> **Audience:** anyone starting interview prep, or returning after a long pause.
> **Difficulty:** Beginner. **Total reading time:** ~3 hours.

The mental models and language fluency that everything else assumes. Big-O, the recursion mental model, bit-manipulation primer, the math you actually need for interviews, language idioms across Python / Java / C++ / Go, and how to pick which language to interview in.

1. [How to use this handbook](content/dsa/part-0-foundations/00-how-to-use.md)
2. [Computational complexity and Big-O](content/dsa/part-0-foundations/01-complexity-big-o.md)
3. [The recursion mental model](content/dsa/part-0-foundations/02-recursion-mental-model.md)
4. [Bit manipulation primer](content/dsa/part-0-foundations/03-bit-manipulation-primer.md)
5. [Math for interviews](content/dsa/part-0-foundations/04-math-for-interviews.md)
6. [Language idioms across Python, Java, C++, Go](content/dsa/part-0-foundations/05-language-idioms.md)
7. [Choosing your interview language](content/dsa/part-0-foundations/06-choosing-your-language.md)

</details>

<details>
<summary><strong>Part 1 — Linear Data Structures (8 chapters)</strong> — arrays, dynamic-array internals, strings, hash maps, stacks, queues, matrices</summary>

### Part 1 — Linear Data Structures (8 chapters)

> **Audience:** everyone — these are the structures that show up in 70% of all interview problems.
> **Difficulty:** Beginner. **Total reading time:** ~5 hours.

The contiguous-memory and bucket-based data structures: arrays (static / dynamic / multi-dimensional), the amortized-O(1) doubling rule that makes a `vector` work, strings as encoded byte arrays, hash maps and hash sets, the load-factor / collision math behind them, stacks and queues with the call-stack analogy, and matrix manipulation tricks (rotate-in-place, spiral, transpose).

1. [Arrays: static, dynamic, multi-dimensional](content/dsa/part-1-linear-data-structures/00-arrays.md)
2. [Dynamic array internals](content/dsa/part-1-linear-data-structures/01-dynamic-array-internals.md)
3. [Strings: encoding, immutability, builders](content/dsa/part-1-linear-data-structures/02-strings.md)
4. [Hash maps and hash sets](content/dsa/part-1-linear-data-structures/03-hash-maps.md)
5. [Hash collisions and the load factor](content/dsa/part-1-linear-data-structures/04-hash-collisions.md)
6. [Stacks and the call stack analogy](content/dsa/part-1-linear-data-structures/05-stacks.md)
7. [Queues, deques, and circular buffers](content/dsa/part-1-linear-data-structures/06-queues-deques.md)
8. [Matrix manipulation](content/dsa/part-1-linear-data-structures/07-matrix-manipulation.md)

</details>

<details>
<summary><strong>Part 2 — Search & Sort (8 chapters)</strong> — linear/binary search, comparison & linear-time sorts, heap sort, quickselect</summary>

### Part 2 — Search & Sort (8 chapters)

> **Audience:** every interviewee — binary search alone shows up in roughly a quarter of all problems.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~5 hours.

How to find things and how to order things. Linear search and when it's actually the right answer; the canonical binary search written without off-by-one bugs; the lower_bound / upper_bound / peak / rotated-array variants; the comparison-sort family (insertion, merge, quicksort with the production hybrids like Timsort and Introsort); heap sort and why `n log n` is the comparison-sort lower bound; the linear-time sorts (counting, radix, bucket); and quickselect for the top-k problems.

1. [Linear search and what it's good for](content/dsa/part-2-search-sort/00-linear-search.md)
2. [Binary search: the canonical version](content/dsa/part-2-search-sort/01-binary-search-canonical.md)
3. [Binary search variants: lower_bound, upper_bound, peaks, and rotated arrays](content/dsa/part-2-search-sort/02-binary-search-variants.md)
4. [Comparison sorts I: insertion sort and merge sort](content/dsa/part-2-search-sort/03-comparison-sorts-1.md)
5. [Comparison sorts II: quicksort, partition, and the production hybrids](content/dsa/part-2-search-sort/04-comparison-sorts-2.md)
6. [Heap sort and the n log n lower bound](content/dsa/part-2-search-sort/05-heap-sort.md)
7. [Linear-time sorts: counting, radix, bucket](content/dsa/part-2-search-sort/06-linear-sorts.md)
8. [Quickselect: linear-time selection](content/dsa/part-2-search-sort/07-quickselect.md)

</details>

<details>
<summary><strong>Part 3 — Two Pointers, Sliding Window, Prefix Sums (6 chapters)</strong> — the array-walking patterns that turn O(n²) into O(n)</summary>

### Part 3 — Two Pointers, Sliding Window, Prefix Sums (6 chapters)

> **Audience:** anyone whose nested-loop solutions keep timing out.
> **Difficulty:** Intermediate. **Total reading time:** ~4 hours.

Three closely related patterns that all amount to "walk the array smarter": opposite-ends two pointers (Container With Most Water, 3Sum), same-direction two pointers, fixed and variable sliding windows, prefix sums and difference arrays, and the prefix-sum + hash-map combo for "subarray sum equals K"-shaped problems.

1. [Two pointers: opposite ends](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md)
2. [Two pointers: same direction](content/dsa/part-3-pointers-window-prefix/01-two-pointers-same-direction.md)
3. [Sliding window: fixed size](content/dsa/part-3-pointers-window-prefix/02-sliding-window-fixed.md)
4. [Sliding window: variable size](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md)
5. [Prefix sums and difference arrays](content/dsa/part-3-pointers-window-prefix/04-prefix-sums.md)
6. [The prefix-sum + hash-map combo](content/dsa/part-3-pointers-window-prefix/05-prefix-sum-hash.md)

</details>

<details>
<summary><strong>Part 4 — Stack & Queue Patterns (5 chapters)</strong> — monotonic stack/deque, min/max stack, expression parsing, queue-from-stacks</summary>

### Part 4 — Stack & Queue Patterns (5 chapters)

> **Audience:** anyone struggling with Next-Greater-Element and sliding-window-maximum problems.
> **Difficulty:** Intermediate. **Total reading time:** ~3 hours.

Stack and queue *as algorithmic patterns*, not just data structures. Monotonic stacks (Daily Temperatures, Largest Rectangle in Histogram), monotonic deques (Sliding Window Maximum), min/max stacks (O(1) min query under push/pop), expression parsing (Shunting-Yard / RPN), and the queue-from-stacks amortization argument.

1. [Monotonic stack](content/dsa/part-4-stack-queue-patterns/00-monotonic-stack.md)
2. [Monotonic deque](content/dsa/part-4-stack-queue-patterns/01-monotonic-deque.md)
3. [Min and max stacks](content/dsa/part-4-stack-queue-patterns/02-min-max-stack.md)
4. [Expression evaluation and parsing](content/dsa/part-4-stack-queue-patterns/03-expression-evaluation.md)
5. [Queue from stacks](content/dsa/part-4-stack-queue-patterns/04-queue-from-stacks.md)

</details>

<details>
<summary><strong>Part 5 — Linked Lists (6 chapters)</strong> — pointer rewiring, reversal, k-group reversal, Floyd's cycle, merging, LRU cache</summary>

### Part 5 — Linked Lists (6 chapters)

> **Audience:** anyone who's drawn boxes-and-arrows on a whiteboard and gotten lost.
> **Difficulty:** Intermediate. **Total reading time:** ~4 hours.

Linked lists are pointer surgery. Sentinel-node patterns, the canonical iterative reversal (and the recursive cousin), reverse-in-groups-of-k, Floyd's tortoise-and-hare cycle detection (and why the cycle-start formula works), merging sorted lists, and the LRU cache as the canonical hash-map + doubly-linked-list combo.

1. [Linked list fundamentals: sentinels, pointer rewiring, doubly-linked design](content/dsa/part-5-linked-lists/00-linked-list-fundamentals.md)
2. [Reversal patterns](content/dsa/part-5-linked-lists/01-reversal-patterns.md)
3. [Reverse in groups of k](content/dsa/part-5-linked-lists/02-reverse-in-groups-k.md)
4. [Cycle detection (Floyd's tortoise and hare)](content/dsa/part-5-linked-lists/03-cycle-detection.md)
5. [Merging linked lists](content/dsa/part-5-linked-lists/04-merging-linked-lists.md)
6. [LRU cache: hash map plus doubly linked list](content/dsa/part-5-linked-lists/05-lru-cache.md)

</details>

<details>
<summary><strong>Part 6 — Trees & Heaps (11 chapters)</strong> — traversals, Morris, BFS, heaps, BST, AVL/RB, tries, tree DP, segment trees</summary>

### Part 6 — Trees & Heaps (11 chapters)

> **Audience:** anyone past the linear-data-structure phase of prep.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~7 hours.

The hierarchical structures and the priority queue. Binary tree fundamentals, the three depth-first traversals (pre/in/post — both recursive and iterative), Morris traversal for O(1) space, level-order BFS, heaps and priority queues (heapify in O(n)), binary search trees, AVL rotations, a red-black overview, tries, the tree-DP primer (post-order with side state), and an introduction to segment trees for range queries.

1. [Binary tree fundamentals](content/dsa/part-6-trees-heaps/00-binary-tree-fundamentals.md)
2. [Tree traversals: pre, in, post](content/dsa/part-6-trees-heaps/01-tree-traversals.md)
3. [Morris traversal: O(1)-space inorder by threading](content/dsa/part-6-trees-heaps/02-morris-traversal.md)
4. [Level-order traversal: BFS on trees](content/dsa/part-6-trees-heaps/03-level-order-traversal.md)
5. [Heaps and priority queues](content/dsa/part-6-trees-heaps/04-heaps-priority-queues.md)
6. [Binary search trees](content/dsa/part-6-trees-heaps/05-binary-search-trees.md)
7. [AVL trees and rotations](content/dsa/part-6-trees-heaps/06-avl-rotations.md)
8. [Red-black trees: an overview](content/dsa/part-6-trees-heaps/07-red-black-overview.md)
9. [Tries](content/dsa/part-6-trees-heaps/08-tries.md)
10. [Tree DP primer: post-order with side state](content/dsa/part-6-trees-heaps/09-tree-dp.md)
11. [Segment trees](content/dsa/part-6-trees-heaps/10-segment-tree.md)

</details>

<details>
<summary><strong>Part 7 — Recursion & Backtracking (7 chapters)</strong> — recursion patterns, the template, subsets/perms, N-Queens, Sudoku, randomized algos</summary>

### Part 7 — Recursion & Backtracking (7 chapters)

> **Audience:** anyone whose subset/permutation/combination solutions feel like guesswork.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~5 hours.

Backtracking is just DFS with state-restoration discipline. The recursion patterns (linear, tree, divide-and-conquer); the backtracking template you can adapt to any constraint problem; subsets, combinations, and permutations; N-Queens with pruning; Sudoku with constraint propagation and forward checking; word search on a grid; and Fisher-Yates, reservoir sampling, and rejection sampling for randomized algorithms.

1. [Recursion patterns: linear, tree, and divide-and-conquer](content/dsa/part-7-recursion-backtracking/00-recursion-patterns.md)
2. [The backtracking template](content/dsa/part-7-recursion-backtracking/01-backtracking-template.md)
3. [Subsets, combinations, permutations](content/dsa/part-7-recursion-backtracking/02-subsets-combinations-permutations.md)
4. [N-Queens: pruning and constraint propagation](content/dsa/part-7-recursion-backtracking/03-n-queens.md)
5. [Sudoku solver: constraint propagation and forward checking](content/dsa/part-7-recursion-backtracking/04-sudoku-solver.md)
6. [Word search and grid backtracking](content/dsa/part-7-recursion-backtracking/05-word-search.md)
7. [Randomized algorithms: Fisher-Yates, reservoir sampling, rejection sampling](content/dsa/part-7-recursion-backtracking/06-randomized-algorithms.md)

</details>

<details>
<summary><strong>Part 8 — Graphs (13 chapters)</strong> — BFS/DFS, components, topo, cycles, bipartite, union-find, Dijkstra, Bellman-Ford, MSTs</summary>

### Part 8 — Graphs (13 chapters)

> **Audience:** anyone preparing for FAANG-tier interviews — graph problems are the differentiator.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~9 hours.

The graph chapters are interview-grade end-to-end. Adjacency-list vs adjacency-matrix representations; BFS and DFS as orthogonal traversal templates; connected components and flood fill (Number of Islands); topological sort via Kahn's queue and via DFS post-order reverse; cycle detection on directed and undirected graphs; bipartite checking; union-find with path compression and union-by-rank; Dijkstra's algorithm; Bellman-Ford and negative cycles; and minimum spanning trees via both Kruskal and Prim.

1. [Graph representation](content/dsa/part-8-graphs/00-graph-representation.md)
2. [Breadth-first search](content/dsa/part-8-graphs/01-bfs.md)
3. [Depth-first search](content/dsa/part-8-graphs/02-dfs.md)
4. [Connected components and flood fill](content/dsa/part-8-graphs/03-connected-components.md)
5. [Topological sort: Kahn's algorithm](content/dsa/part-8-graphs/04-topological-sort-kahn.md)
6. [Topological sort: DFS post-order reverse](content/dsa/part-8-graphs/05-topological-sort-dfs.md)
7. [Cycle detection in graphs](content/dsa/part-8-graphs/06-cycle-detection-graphs.md)
8. [Bipartite check](content/dsa/part-8-graphs/07-bipartite-check.md)
9. [Union-Find: parent forests, path compression, and union by rank](content/dsa/part-8-graphs/08-union-find.md)
10. [Dijkstra's shortest-path algorithm](content/dsa/part-8-graphs/09-dijkstra.md)
11. [Bellman-Ford and negative cycles](content/dsa/part-8-graphs/10-bellman-ford.md)
12. [Minimum spanning tree: Kruskal's algorithm](content/dsa/part-8-graphs/11-mst-kruskal.md)
13. [Minimum spanning trees: Prim's algorithm](content/dsa/part-8-graphs/12-mst-prim.md)

</details>

<details>
<summary><strong>Part 9 — Dynamic Programming (15 chapters)</strong> — memo↔tab, 1D/grid/interval/tree/bitmask, knapsack, LCS, edit distance, LIS, palindromes</summary>

### Part 9 — Dynamic Programming (15 chapters)

> **Audience:** the part most candidates fear most. Read this if "DP problems just don't click."
> **Difficulty:** Advanced. **Total reading time:** ~10 hours.

The most demanding part of the handbook. Build DP up from recursion (top-down memoization) and re-derive the bottom-up tabulation; 1D-state DPs (Climbing Stairs, House Robber, decision DP); the string-prefix decision DPs (Decode Ways, Word Break); 0/1 and unbounded knapsacks; longest-common-subsequence and edit distance; LIS in O(n²) and the patience-sort O(n log n) variant; palindrome DP; interval DP (matrix chain, burst balloons); grid DP; tree DP; and the bitmask DP family for "all subsets" problems.

1. [Dynamic Programming: From Recursion to Memoization](content/dsa/part-9-dynamic-programming/00-dp-recursion-to-memo.md)
2. [DP: bottom-up tabulation](content/dsa/part-9-dynamic-programming/01-dp-bottom-up-tabulation.md)
3. [Dynamic programming on a 1D state](content/dsa/part-9-dynamic-programming/02-dp-1d.md)
4. [Decode Ways and Word Break: string-prefix decision DP](content/dsa/part-9-dynamic-programming/03-dp-decode-word-break.md)
5. [0/1 knapsack](content/dsa/part-9-dynamic-programming/04-knapsack-01.md)
6. [Unbounded knapsack: when items can be picked over and over](content/dsa/part-9-dynamic-programming/05-knapsack-unbounded.md)
7. [Longest common subsequence](content/dsa/part-9-dynamic-programming/06-lcs.md)
8. [Edit distance](content/dsa/part-9-dynamic-programming/07-edit-distance.md)
9. [Longest Increasing Subsequence: the quadratic DP](content/dsa/part-9-dynamic-programming/08-lis-quadratic.md)
10. [LIS: patience sort](content/dsa/part-9-dynamic-programming/09-lis-patience-sort.md)
11. [Palindrome DP](content/dsa/part-9-dynamic-programming/10-palindrome-dp.md)
12. [Interval DP: matrix chain and burst balloons](content/dsa/part-9-dynamic-programming/11-interval-dp.md)
13. [Grid DP: forward fills, backward survives](content/dsa/part-9-dynamic-programming/12-grid-dp.md)
14. [Tree DP: states that travel up the call stack](content/dsa/part-9-dynamic-programming/13-tree-dp.md)
15. [Bitmask DP](content/dsa/part-9-dynamic-programming/14-bitmask-dp.md)

</details>

<details>
<summary><strong>Part 10 — Greedy (5 chapters)</strong> — when local choices win, intervals, activity selection, Huffman, jump games</summary>

### Part 10 — Greedy (5 chapters)

> **Audience:** anyone who's been burned by a greedy that "looked right" and got Wrong Answer.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~3 hours.

When local choices yield global optima, and how to prove it. Greedy thinking framed against DP; interval scheduling (the sorting comparator *is* the algorithm); activity selection and the task-scheduler family; Huffman encoding; and Jump Games / Gas Station as canonical "scan once, maintain a running invariant" problems.

1. [Greedy thinking: when local choices win, and when they don't](content/dsa/part-10-greedy/00-greedy-thinking.md)
2. [Interval scheduling: the comparator is the algorithm](content/dsa/part-10-greedy/01-interval-scheduling.md)
3. [Activity selection and the task-scheduler family](content/dsa/part-10-greedy/02-activity-selection.md)
4. [Huffman encoding](content/dsa/part-10-greedy/03-huffman-encoding.md)
5. [Jump games and gas station](content/dsa/part-10-greedy/04-jump-games-gas-station.md)

</details>

<details>
<summary><strong>Part 11 — Bit Manipulation (4 chapters)</strong> — the bit-ops cookbook, XOR patterns, bitmask techniques, performance tricks</summary>

### Part 11 — Bit Manipulation (4 chapters)

> **Audience:** anyone preparing for low-level / performance-oriented interviews (HFT, embedded, kernel, GPU).
> **Difficulty:** Intermediate. **Total reading time:** ~2 hours.

The bit-ops cookbook (set/clear/toggle, lowest-set-bit, popcount); XOR patterns (Single Number I/II/III, Missing Number); bitmask techniques as compact subset state; and bit-level performance tricks for the "your code is correct, just make it 10× faster" interview round.

1. [Bit operations cookbook](content/dsa/part-11-bit-manipulation/00-bit-operations-cookbook.md)
2. [XOR patterns](content/dsa/part-11-bit-manipulation/01-xor-patterns.md)
3. [Bitmask techniques](content/dsa/part-11-bit-manipulation/02-bitmask-techniques.md)
4. [Bit tricks for performance](content/dsa/part-11-bit-manipulation/03-bit-tricks-performance.md)

</details>

<details>
<summary><strong>Part 12 — Strings & Pattern Matching (6 chapters)</strong> — naive matching, Rabin-Karp, KMP, Z-array, Aho-Corasick, suffix arrays</summary>

### Part 12 — Strings & Pattern Matching (6 chapters)

> **Audience:** anyone interviewing where strings are a focus area (search infra, NLP infra, IDEs, compiler tooling).
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~4 hours.

Substring search beyond the naive O(n·m) baseline. Rabin-Karp with rolling hashes; KMP and the failure function (and why it generalizes the prefix-function); the Z-algorithm; Aho-Corasick for matching many patterns in one pass; and an introduction to suffix arrays for "all substring" queries.

1. [Naive string matching](content/dsa/part-12-strings-pattern-matching/00-naive-string-matching.md)
2. [Rabin-Karp and rolling hashes](content/dsa/part-12-strings-pattern-matching/01-rabin-karp.md)
3. [KMP and the failure function](content/dsa/part-12-strings-pattern-matching/02-kmp.md)
4. [Z-algorithm](content/dsa/part-12-strings-pattern-matching/03-z-algorithm.md)
5. [Aho-Corasick: many patterns, one pass](content/dsa/part-12-strings-pattern-matching/04-aho-corasick.md)
6. [Suffix arrays: a sorted index of every suffix](content/dsa/part-12-strings-pattern-matching/05-suffix-array.md)

</details>

<details>
<summary><strong>Part 13 — Design the Data Structure (7 chapters)</strong> — LRU/LFU, min stacks, hit counter, trie autocomplete, Twitter feed, game state</summary>

### Part 13 — Design the Data Structure (7 chapters)

> **Audience:** SDE2+ candidates — "design X" is the staple senior-coding-round question type.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~5 hours.

The bridge between DSA and HLD: how to compose primitives into APIs that meet a per-operation complexity contract. The full LRU treatment with concurrency and multi-tier framing; LFU via frequency-bucketed doubly-linked lists; min stacks and max-frequency stacks; hit counters and rate limiters; trie-backed autocomplete; Twitter-feed design; and a game-state design vignette.

1. [LRU cache: design framing, concurrency, and multi-tier deployment](content/dsa/part-13-design-the-data-structure/00-lru-cache.md)
2. [LFU cache: hash map plus frequency-bucketed doubly linked lists](content/dsa/part-13-design-the-data-structure/01-lfu-cache.md)
3. [Min stack and max-frequency stack](content/dsa/part-13-design-the-data-structure/02-min-stack-maxfreq.md)
4. [Hit counter and rate limiter](content/dsa/part-13-design-the-data-structure/03-hit-counter-rate-limiter.md)
5. [Trie autocomplete](content/dsa/part-13-design-the-data-structure/04-trie-autocomplete.md)
6. [Twitter feed design](content/dsa/part-13-design-the-data-structure/05-twitter-feed.md)
7. [Game state design](content/dsa/part-13-design-the-data-structure/06-game-state-design.md)

</details>

<details>
<summary><strong>Part 14 — Interview Framework (12 chapters)</strong> — pattern recognition, clarifying questions, communicating, complexity, mocks, per-company tracks</summary>

### Part 14 — Interview Framework (12 chapters)

> **Audience:** anyone within a month of an actual interview window.
> **Difficulty:** All levels. **Total reading time:** ~5 hours.

The meta-skills that turn a correct solution into a passing one. Pattern-recognition drills; the first-five-minutes clarifying-questions script; how to narrate while you code; how to discuss complexity convincingly; running productive mock interviews; the most common pitfalls; Amazon Leadership Principles (brief and narration); the Meta AI-assisted round (format, prompting tactics, common failures); and the per-company tracks index that points at company-specific reading lists.

1. [Pattern recognition: the fastest skill to develop](content/dsa/part-14-interview-framework/00-pattern-recognition.md)
2. [The first five minutes: clarifying questions](content/dsa/part-14-interview-framework/01-clarifying-questions.md)
3. [Communicating during the interview](content/dsa/part-14-interview-framework/02-communicating.md)
4. [Complexity discussions](content/dsa/part-14-interview-framework/03-complexity-discussions.md)
5. [The mock interview process](content/dsa/part-14-interview-framework/04-mock-interview-process.md)
6. [Common pitfalls](content/dsa/part-14-interview-framework/05-common-pitfalls.md)
7. [Amazon Leadership Principles, briefly](content/dsa/part-14-interview-framework/06-amazon-lps-brief.md)
8. [Amazon Leadership Principles narration](content/dsa/part-14-interview-framework/07-amazon-lps-narration.md)
9. [Meta's AI round: the format](content/dsa/part-14-interview-framework/08-meta-ai-round-format.md)
10. [Meta's AI round: prompting tactics](content/dsa/part-14-interview-framework/09-meta-ai-round-prompting.md)
11. [Meta's AI round: common failures](content/dsa/part-14-interview-framework/10-meta-ai-round-failures.md)
12. [Per-company tracks: index and how to use](content/dsa/part-14-interview-framework/11-per-company-tracks-index.md)

</details>

### DSA pattern decision pages (37 pages)

> **Audience:** anyone deciding "which pattern fits this problem?" mid-interview.
> **Difficulty:** Intermediate. **Total reading time:** ~10 hours total; each page is a 15-30 min decision aid.

Each page is a focused decision-comparison: a Mermaid decision tree, a "pick A vs pick B" table, archetype problems on each side, and references. Click to expand the full list.

<details>
<summary><strong>All 37 pattern decision pages</strong></summary>

1. [Recursion vs Iteration](content/dsa/patterns/P-01-recursion-vs-iteration.md)
2. [Memoization vs Tabulation](content/dsa/patterns/P-02-memoization-vs-tabulation.md)
3. [Hash Map vs Sorted Map](content/dsa/patterns/P-03-hash-map-vs-sorted-map.md)
4. [Array vs Linked List](content/dsa/patterns/P-04-array-vs-linked-list.md)
5. [Stack vs Queue vs Deque](content/dsa/patterns/P-05-stack-vs-queue-vs-deque.md)
6. [Heap vs Sorted Array vs BST](content/dsa/patterns/P-06-heap-vs-sorted-array-vs-bst.md)
7. [Two-Heap Median Archetypes](content/dsa/patterns/P-06b-two-heap-median-archetypes.md)
8. [k-Way Merge: Cursor Heap](content/dsa/patterns/P-06c-k-way-merge-cursor-heap.md)
9. [BFS vs DFS on Graphs](content/dsa/patterns/P-07-bfs-vs-dfs-graphs.md)
10. [Shortest-Paths Decision Tree](content/dsa/patterns/P-08-shortest-paths-decision-tree.md)
11. [Kruskal vs Prim](content/dsa/patterns/P-09-kruskal-vs-prim.md)
12. [Quicksort vs Mergesort vs Heapsort](content/dsa/patterns/P-10-quicksort-vs-mergesort-vs-heapsort.md)
13. [Binary Search vs Linear Scan](content/dsa/patterns/P-11-binary-search-vs-linear-scan.md)
14. [Two Pointers vs Sliding Window](content/dsa/patterns/P-12-two-pointers-vs-sliding-window.md)
15. [Iterative vs Morris vs Recursive Traversal](content/dsa/patterns/P-13-iterative-vs-morris-vs-recursive-traversal.md)
16. [Trie vs Hash Map vs Sorted Set](content/dsa/patterns/P-14-trie-vs-hash-map-vs-sorted-set.md)
17. [Union-Find vs DFS](content/dsa/patterns/P-15-union-find-vs-dfs.md)
18. [Topological Sort: Kahn vs DFS](content/dsa/patterns/P-16-topological-sort-kahn-vs-dfs.md)
19. [Greedy vs DP](content/dsa/patterns/P-17-greedy-vs-dp.md)
20. [Backtracking vs DP](content/dsa/patterns/P-18-backtracking-vs-dp.md)
21. [Recursion vs DP](content/dsa/patterns/P-19-recursion-vs-dp.md)
22. [When to Use Bit Manipulation](content/dsa/patterns/P-20-when-bit-manipulation.md)
23. [BFS vs DFS on Trees](content/dsa/patterns/P-21-bfs-vs-dfs-trees.md)
24. [Quickselect vs Heap for Top-K](content/dsa/patterns/P-22-quickselect-vs-heap-top-k.md)
25. [Sliding Window Archetypes](content/dsa/patterns/P-23-sliding-window-archetypes.md)
26. [Two-Pointer Archetypes](content/dsa/patterns/P-24-two-pointer-archetypes.md)
27. [Prefix-Sum Archetypes](content/dsa/patterns/P-25-prefix-sum-archetypes.md)
28. [Monotonic Stack Archetypes](content/dsa/patterns/P-26-monotonic-stack-archetypes.md)
29. [Monotonic Deque Archetypes](content/dsa/patterns/P-27-monotonic-deque-archetypes.md)
30. [In-Place Linked-List Reversal](content/dsa/patterns/P-28-in-place-linked-list-reversal.md)
31. [Cyclic-Sort Archetypes](content/dsa/patterns/P-29-cyclic-sort-archetypes.md)
32. [Top-K: Heap or Quickselect](content/dsa/patterns/P-30-top-k-heap-or-quickselect.md)
33. [Merge-Intervals Archetypes](content/dsa/patterns/P-31-merge-intervals-archetypes.md)
34. [Tree-DP Archetypes](content/dsa/patterns/P-32-tree-dp-archetypes.md)
35. [Bitmask-DP Archetypes](content/dsa/patterns/P-33-bitmask-dp-archetypes.md)
36. [Backtracking Template & Pruning](content/dsa/patterns/P-34-backtracking-template-pruning.md)
37. [Sweep-Line Archetypes](content/dsa/patterns/P-35-sweep-line-archetypes.md)

</details>

### DSA long-form editorials (5 pages)

> **Audience:** anyone who's solved an "easy" problem and wants the senior-engineer-level analysis behind it.
> **Difficulty:** Intermediate. **Total reading time:** ~2 hours total.

Five canonical interview problems treated as full editorial-style essays: every approach (brute force → optimized → optimal), the proof of correctness, the edge cases, the production framing, and the follow-up variants.

<details>
<summary><strong>All 5 long-form editorials</strong></summary>

1. [LC-001 — Two Sum](content/dsa/editorials/LC-001-two-sum.md) (full editorial under [LC-001-two-sum/](content/dsa/editorials/LC-001-two-sum/))
2. [LC-003 — Longest Substring Without Repeating Characters](content/dsa/editorials/LC-003-longest-substring-without-repeating-characters.md) (full editorial under [LC-003-longest-substring-without-repeating-characters/](content/dsa/editorials/LC-003-longest-substring-without-repeating-characters/))
3. [LC-005 — Longest Palindromic Substring](content/dsa/editorials/LC-005-longest-palindromic-substring.md) (full editorial under [LC-005-longest-palindromic-substring/](content/dsa/editorials/LC-005-longest-palindromic-substring/))
4. [LC-011 — Container With Most Water](content/dsa/editorials/LC-011-container-with-most-water.md) (full editorial under [LC-011-container-with-most-water/](content/dsa/editorials/LC-011-container-with-most-water/))
5. [LC-015 — 3Sum](content/dsa/editorials/LC-015-3sum.md) (full editorial under [LC-015-3sum/](content/dsa/editorials/LC-015-3sum/))

</details>

### DSA interactive widget specs (46 YAML files)

> **Audience:** contributors authoring or editing the website's interactive widgets.
> **Format:** YAML; rendered as interactive animations on [dsa.handbook.academy](https://dsa.handbook.academy).

Each widget is described as keyframe data plus narration in YAML. The website's renderer turns each spec into an interactive (play/pause/scrub/step) animation alongside the chapter prose. Click to expand the full list.

<details>
<summary><strong>Editorial-tied widgets (5)</strong></summary>

1. [e-LC001 — Two Sum walkthrough](content/dsa/widgets/e-LC001-two-sum.yml)
2. [e-LC003 — Longest Substring walkthrough](content/dsa/widgets/e-LC003-longest-substring.yml)
3. [e-LC005 — Longest Palindrome walkthrough](content/dsa/widgets/e-LC005-longest-palindrome.yml)
4. [e-LC011 — Container With Most Water walkthrough](content/dsa/widgets/e-LC011-container.yml)
5. [e-LC015 — 3Sum walkthrough](content/dsa/widgets/e-LC015-3sum.yml)

</details>

<details>
<summary><strong>Pattern widgets (41)</strong></summary>

1. [w-01 — Recursion call stack](content/dsa/widgets/w-01-recursion-call-stack.yml)
2. [w-02 — Hash table](content/dsa/widgets/w-02-hash-table.yml)
3. [w-03 — Matrix rotation](content/dsa/widgets/w-03-matrix-rotation.yml)
4. [w-04 — Binary search](content/dsa/widgets/w-04-binary-search.yml)
5. [w-05 — Sorting visualizer](content/dsa/widgets/w-05-sorting-visualizer.yml)
6. [w-06 — Quicksort partition](content/dsa/widgets/w-06-quicksort-partition.yml)
7. [w-07 — Quickselect](content/dsa/widgets/w-07-quickselect.yml)
8. [w-08 — Two-pointer 3Sum](content/dsa/widgets/w-08-two-pointers-3sum.yml)
9. [w-09 — Sliding window expansion](content/dsa/widgets/w-09-sliding-window-expansion.yml)
10. [w-10 — Prefix-sum cumulative](content/dsa/widgets/w-10-prefix-sum-cumulative.yml)
11. [w-11 — Monotonic stack](content/dsa/widgets/w-11-monotonic-stack.yml)
12. [w-12 — Amortized queue via stacks](content/dsa/widgets/w-12-amortized-queue-via-stacks.yml)
13. [w-12 — Monotonic deque](content/dsa/widgets/w-12-monotonic-deque.yml)
14. [w-13 — Linked-list pointer rewiring](content/dsa/widgets/w-13-linked-list-pointer-rewiring.yml)
15. [w-14 — Floyd cycle](content/dsa/widgets/w-14-floyd-cycle.yml)
16. [w-15 — LRU cache](content/dsa/widgets/w-15-lru-cache.yml)
17. [w-16 — Tree traversal animator](content/dsa/widgets/w-16-tree-traversal-animator.yml)
18. [w-17 — Morris thread](content/dsa/widgets/w-17-morris-thread.yml)
19. [w-18 — Heap operations](content/dsa/widgets/w-18-heap-operations.yml)
20. [w-19 — BST rotations](content/dsa/widgets/w-19-bst-rotations.yml)
21. [w-20 — Trie](content/dsa/widgets/w-20-trie.yml)
22. [w-21 — Segment tree](content/dsa/widgets/w-21-segment-tree.yml)
23. [w-22 — Backtracking tree](content/dsa/widgets/w-22-backtracking-tree.yml)
24. [w-23 — N-Queens](content/dsa/widgets/w-23-n-queens.yml)
25. [w-24 — Sudoku grid](content/dsa/widgets/w-24-sudoku-grid.yml)
26. [w-25 — Graph BFS](content/dsa/widgets/w-25-graph-bfs.yml)
27. [w-26 — Graph DFS](content/dsa/widgets/w-26-graph-dfs.yml)
28. [w-27 — Topological sort (Kahn)](content/dsa/widgets/w-27-topological-sort-kahn.yml)
29. [w-28 — Union-Find](content/dsa/widgets/w-28-union-find.yml)
30. [w-29 — Dijkstra](content/dsa/widgets/w-29-dijkstra.yml)
31. [w-30 — MST: Kruskal & Prim](content/dsa/widgets/w-30-mst-kruskal-prim.yml)
32. [w-31 — DP table fill](content/dsa/widgets/w-31-dp-table-fill.yml)
33. [w-32 — Knapsack fill](content/dsa/widgets/w-32-knapsack-fill.yml)
34. [w-33 — LIS via patience](content/dsa/widgets/w-33-lis-patience.yml)
35. [w-34 — Bitmask DP](content/dsa/widgets/w-34-bitmask-dp.yml)
36. [w-35 — Prefix-sum + hash combo](content/dsa/widgets/w-35-prefix-sum-hash-combo.yml)
37. [w-36 — Interval scheduling](content/dsa/widgets/w-36-interval-scheduling.yml)
38. [w-37 — Bellman-Ford](content/dsa/widgets/w-37-bellman-ford.yml)
39. [w-38 — KMP](content/dsa/widgets/w-38-kmp.yml)
40. [w-39 — Huffman encoding](content/dsa/widgets/w-39-huffman-encoding.yml)
41. [w-40 — Z-array](content/dsa/widgets/w-40-z-array.yml)

</details>

Widgets are catalogued in [`content/dsa/widgets/_widget-registry.yml`](content/dsa/widgets/_widget-registry.yml); see [`content/dsa/widgets/README.md`](content/dsa/widgets/README.md) for authoring conventions.

---

## The full AI Engineering curriculum

**86 chapters across 12 parts, with 87 figures.** The book teaches a software engineer to build and run production AI products on top of foundation models: prompting, context, retrieval, agents, evaluation, observability, security, cost, and product. It doesn't teach model training. Code is Python, figures sit in each part's `images/` folder, and every perishable number (prices, model names, benchmark scores) carries an "as of" date and a footnoted source. Start with the book's own [README](content/ai-eng/README.md) for how to read it.

Read the parts in order the first time. Part 4 (Eval Fundamentals) deliberately comes before RAG and agents, because everything after it assumes you have an eval set.

| # | Part | Chapters | Difficulty | Reading time |
|---|------|---------:|------------|-------------:|
| 0 | [Start Here](#part-0--start-here-4-chapters) | 4 | Beginner | ~1 hr |
| 1 | [How Models Behave](#part-1--how-models-behave-7-chapters) | 7 | Beginner-Intermediate | ~2 hrs |
| 2 | [Working with Model APIs](#part-2--working-with-model-apis-8-chapters) | 8 | Beginner-Intermediate | ~2 hrs |
| 3 | [Prompt Engineering](#part-3--prompt-engineering-5-chapters) | 5 | Beginner-Intermediate | ~2 hrs |
| 4 | [Eval Fundamentals](#part-4--eval-fundamentals-4-chapters) | 4 | Beginner | ~1 hr |
| 5 | [Context Engineering](#part-5--context-engineering-6-chapters) | 6 | Intermediate | ~2 hrs |
| 6 | [Retrieval (RAG)](#part-6--retrieval-rag-9-chapters) | 9 | Intermediate-Advanced | ~3 hrs |
| 7 | [Agent Engineering](#part-7--agent-engineering-13-chapters) | 13 | Intermediate-Advanced | ~4 hrs |
| 8 | [Evaluation and Observability](#part-8--evaluation-and-observability-9-chapters) | 9 | Intermediate | ~3 hrs |
| 9 | [Security and Governance](#part-9--security-and-governance-7-chapters) | 7 | Intermediate-Advanced | ~2 hrs |
| 10 | [Production AI](#part-10--production-ai-8-chapters) | 8 | Intermediate | ~2 hrs |
| 11 | [AI Product Engineering](#part-11--ai-product-engineering-6-chapters) | 6 | Intermediate-Advanced | ~2 hrs |

<details>
<summary><strong>Part 0 — Start Here (4 chapters)</strong> — what an AI engineer is, the software baseline, probabilistic systems, the escalation ladder</summary>

### Part 0 — Start Here (4 chapters)

> **Audience:** everyone, including experienced engineers new to building on LLMs.
> **Difficulty:** Beginner. **Total reading time:** ~1 hour.

What an AI engineer is, the software baseline, thinking in probabilistic systems, and the escalation ladder the whole book follows: prompt, context, retrieval, tools, agent, fine-tune.

1. [What an AI engineer is (and isn't)](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md)
1. [The software baseline](content/ai-eng/part-0-start-here/01-the-software-baseline.md)
1. [Thinking in probabilistic systems](content/ai-eng/part-0-start-here/02-thinking-in-probabilistic-systems.md)
1. [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md)

</details>

<details>
<summary><strong>Part 1 — How Models Behave (7 chapters)</strong> — model tiers, tokens, sampling, embeddings, reasoning models, the cost-quality-latency triangle</summary>

### Part 1 — How Models Behave (7 chapters)

> **Audience:** anyone who calls a model API and wants to predict its bill, latency, and failure modes.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~2 hours.

The model landscape, tokens and context windows, sampling, embeddings, reasoning models, the cost-quality-latency triangle, and just enough ML to make good system decisions.

1. [The model landscape](content/ai-eng/part-1-how-models-behave/00-the-model-landscape.md)
1. [Tokens and context windows](content/ai-eng/part-1-how-models-behave/01-tokens-and-context-windows.md)
1. [Sampling and temperature](content/ai-eng/part-1-how-models-behave/02-sampling-and-temperature.md)
1. [Embeddings](content/ai-eng/part-1-how-models-behave/03-embeddings.md)
1. [Reasoning models](content/ai-eng/part-1-how-models-behave/04-reasoning-models.md)
1. [The cost-quality-latency triangle](content/ai-eng/part-1-how-models-behave/05-the-cost-quality-latency-triangle.md)
1. [Just enough ML](content/ai-eng/part-1-how-models-behave/06-just-enough-ml.md)

</details>

<details>
<summary><strong>Part 2 — Working with Model APIs (8 chapters)</strong> — streaming, structured outputs, tool calling, retries, gateways, prompt caching</summary>

### Part 2 — Working with Model APIs (8 chapters)

> **Audience:** engineers wiring their first LLM feature into a real service.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~2 hours.

Calling models reliably: streaming, structured outputs, tool calling, errors and fallbacks, model selection, gateways and routing, and prompt caching economics.

1. [Calling models](content/ai-eng/part-2-working-with-model-apis/00-calling-models.md)
1. [Streaming](content/ai-eng/part-2-working-with-model-apis/01-streaming.md)
1. [Structured outputs](content/ai-eng/part-2-working-with-model-apis/02-structured-outputs.md)
1. [Function and tool calling](content/ai-eng/part-2-working-with-model-apis/03-function-and-tool-calling.md)
1. [Errors, retries, fallbacks](content/ai-eng/part-2-working-with-model-apis/04-errors-retries-fallbacks.md)
1. [Choosing models and reading benchmarks](content/ai-eng/part-2-working-with-model-apis/05-choosing-models-and-reading-benchmarks.md)
1. [Gateways and routing](content/ai-eng/part-2-working-with-model-apis/06-gateways-and-routing.md)
1. [Prompt caching](content/ai-eng/part-2-working-with-model-apis/07-prompt-caching.md)

</details>

<details>
<summary><strong>Part 3 — Prompt Engineering (5 chapters)</strong> — prompt anatomy, few-shot, chain-of-thought, templates, versioning</summary>

### Part 3 — Prompt Engineering (5 chapters)

> **Audience:** anyone who owns a production prompt.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~2 hours.

Production prompts: anatomy, few-shot, chain-of-thought and the reasoning-model inversion, templates and chaining, and prompt versioning with rollback.

1. [Anatomy of a production prompt](content/ai-eng/part-3-prompt-engineering/00-anatomy-of-a-production-prompt.md)
1. [Zero-shot and few-shot](content/ai-eng/part-3-prompt-engineering/01-zero-shot-and-few-shot.md)
1. [Chain-of-thought, ReAct, self-consistency](content/ai-eng/part-3-prompt-engineering/02-chain-of-thought-react-self-consistency.md)
1. [Templates and chaining](content/ai-eng/part-3-prompt-engineering/03-templates-and-chaining.md)
1. [Prompt versioning](content/ai-eng/part-3-prompt-engineering/04-prompt-versioning.md)

</details>

<details>
<summary><strong>Part 4 — Eval Fundamentals (4 chapters)</strong> — look at your data, your first eval set, assertions in CI</summary>

### Part 4 — Eval Fundamentals (4 chapters)

> **Audience:** everyone. If you read one part, read this one.
> **Difficulty:** Beginner. **Total reading time:** ~1 hour.

The minimum eval loop, taught before RAG and agents on purpose: look at your data, build your first 50-example eval set, and wire assertions into CI. Nothing after this part ships without evals.

1. [Why you can't ship without evals](content/ai-eng/part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md)
1. [Look at your data](content/ai-eng/part-4-eval-fundamentals/01-look-at-your-data.md)
1. [Your first eval set](content/ai-eng/part-4-eval-fundamentals/02-your-first-eval-set.md)
1. [Assertions and unit tests for LLM output](content/ai-eng/part-4-eval-fundamentals/03-assertions-and-unit-tests.md)

</details>

<details>
<summary><strong>Part 5 — Context Engineering (6 chapters)</strong> — context assembly, compression, memory, tool metadata, context testing</summary>

### Part 5 — Context Engineering (6 chapters)

> **Audience:** engineers whose prompts have grown into pipelines.
> **Difficulty:** Intermediate. **Total reading time:** ~2 hours.

Building the full world the model sees: context assembly and routing, compression and budgets, memory and state, tool context, and testing what was actually assembled.

1. [Context is more than the prompt](content/ai-eng/part-5-context-engineering/00-context-is-more-than-the-prompt.md)
1. [Context assembly and routing](content/ai-eng/part-5-context-engineering/01-context-assembly-and-routing.md)
1. [Compression and context budgets](content/ai-eng/part-5-context-engineering/02-compression-and-context-budgets.md)
1. [Memory and state](content/ai-eng/part-5-context-engineering/03-memory-and-state.md)
1. [Tool context and metadata](content/ai-eng/part-5-context-engineering/04-tool-context-and-metadata.md)
1. [Testing and observing context](content/ai-eng/part-5-context-engineering/05-testing-and-observing-context.md)

</details>

<details>
<summary><strong>Part 6 — Retrieval (RAG) (9 chapters)</strong> — chunking, vector + hybrid search, reranking, citations, retrieval evals, production indexing</summary>

### Part 6 — Retrieval (RAG) (9 chapters)

> **Audience:** anyone building search or question answering over their own documents.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~3 hours.

Retrieval done right: when you actually need RAG, chunking, vector and hybrid search, reranking, query understanding, citations, retrieval evaluation, and production indexing.

1. [When you actually need RAG](content/ai-eng/part-6-retrieval-augmented-generation/00-when-you-actually-need-rag.md)
1. [Document processing and chunking](content/ai-eng/part-6-retrieval-augmented-generation/01-document-processing-and-chunking.md)
1. [Embeddings and vector search](content/ai-eng/part-6-retrieval-augmented-generation/02-embeddings-and-vector-search.md)
1. [Hybrid search and reranking](content/ai-eng/part-6-retrieval-augmented-generation/03-hybrid-search-and-reranking.md)
1. [Query understanding](content/ai-eng/part-6-retrieval-augmented-generation/04-query-understanding.md)
1. [Citations and grounding](content/ai-eng/part-6-retrieval-augmented-generation/05-citations-and-grounding.md)
1. [Advanced retrieval](content/ai-eng/part-6-retrieval-augmented-generation/06-advanced-retrieval.md)
1. [Evaluating retrieval](content/ai-eng/part-6-retrieval-augmented-generation/07-evaluating-retrieval.md)
1. [Production RAG](content/ai-eng/part-6-retrieval-augmented-generation/08-production-rag.md)

</details>

<details>
<summary><strong>Part 7 — Agent Engineering (13 chapters)</strong> — workflows vs agents, tool design, MCP, memory, HITL, multi-agent, voice, frameworks</summary>

### Part 7 — Agent Engineering (13 chapters)

> **Audience:** engineers deciding whether they need an agent, and building one when they do.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~4 hours.

Workflows versus agents, tool design, MCP and its security model, memory, human-in-the-loop, long-running agents, multi-agent systems, agent archetypes, voice agents, and choosing a framework.

1. [Workflow vs agent](content/ai-eng/part-7-agent-engineering/00-workflow-vs-agent.md)
1. [The five workflow patterns](content/ai-eng/part-7-agent-engineering/01-the-five-workflow-patterns.md)
1. [The agent loop](content/ai-eng/part-7-agent-engineering/02-the-agent-loop.md)
1. [Tool design](content/ai-eng/part-7-agent-engineering/03-tool-design.md)
1. [MCP: Model Context Protocol](content/ai-eng/part-7-agent-engineering/04-mcp-model-context-protocol.md)
1. [MCP security](content/ai-eng/part-7-agent-engineering/05-mcp-security.md)
1. [Agent memory and task state](content/ai-eng/part-7-agent-engineering/06-agent-memory-and-task-state.md)
1. [Human-in-the-loop](content/ai-eng/part-7-agent-engineering/07-human-in-the-loop.md)
1. [Long-running agents](content/ai-eng/part-7-agent-engineering/08-long-running-agents.md)
1. [Multi-agent systems](content/ai-eng/part-7-agent-engineering/09-multi-agent-systems.md)
1. [Agent archetypes](content/ai-eng/part-7-agent-engineering/10-agent-archetypes.md)
1. [Voice agents](content/ai-eng/part-7-agent-engineering/11-voice-agents.md)
1. [Choosing a framework](content/ai-eng/part-7-agent-engineering/12-choosing-a-framework.md)

</details>

<details>
<summary><strong>Part 8 — Evaluation and Observability (9 chapters)</strong> — LLM-as-judge, judge bias, RAG/agent evals, CI gates, A/B tests, tracing, dashboards</summary>

### Part 8 — Evaluation and Observability (9 chapters)

> **Audience:** teams past their first eval set who need evals they can trust in CI and production.
> **Difficulty:** Intermediate. **Total reading time:** ~3 hours.

The deep spine: LLM-as-judge and its failure modes, component evals for RAG and agents, regression gates in CI, online evaluation, tracing, monitoring, and the data flywheel.

1. [The eval taxonomy](content/ai-eng/part-8-evaluation-and-observability/00-the-eval-taxonomy.md)
1. [LLM-as-judge](content/ai-eng/part-8-evaluation-and-observability/01-llm-as-judge.md)
1. [Judge failure modes](content/ai-eng/part-8-evaluation-and-observability/02-judge-failure-modes.md)
1. [Evaluating RAG and agents](content/ai-eng/part-8-evaluation-and-observability/03-evaluating-rag-and-agents.md)
1. [Regression suites and CI gates](content/ai-eng/part-8-evaluation-and-observability/04-regression-suites-and-ci-gates.md)
1. [Online evaluation and A/B testing](content/ai-eng/part-8-evaluation-and-observability/05-online-evaluation-and-ab-testing.md)
1. [Tracing](content/ai-eng/part-8-evaluation-and-observability/06-tracing.md)
1. [Monitoring and dashboards](content/ai-eng/part-8-evaluation-and-observability/07-monitoring-and-dashboards.md)
1. [Feedback & the data flywheel](content/ai-eng/part-8-evaluation-and-observability/08-feedback-and-the-data-flywheel.md)

</details>

<details>
<summary><strong>Part 9 — Security and Governance (7 chapters)</strong> — prompt injection, the lethal trifecta, guardrails, abuse, PII, compliance, red-teaming</summary>

### Part 9 — Security and Governance (7 chapters)

> **Audience:** anyone shipping an LLM feature that touches user data or tools.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~2 hours.

Prompt injection, the lethal trifecta and agent security, guardrails, abuse prevention, PII and privacy, compliance, and red-teaming your own system.

1. [Prompt injection](content/ai-eng/part-9-security-and-governance/00-prompt-injection.md)
1. [Agent security and the lethal trifecta](content/ai-eng/part-9-security-and-governance/01-agent-security-and-the-lethal-trifecta.md)
1. [Guardrails](content/ai-eng/part-9-security-and-governance/02-guardrails.md)
1. [Abuse prevention](content/ai-eng/part-9-security-and-governance/03-abuse-prevention.md)
1. [PII and privacy](content/ai-eng/part-9-security-and-governance/04-pii-and-privacy.md)
1. [Compliance and audit](content/ai-eng/part-9-security-and-governance/05-compliance-and-audit.md)
1. [Red-teaming](content/ai-eng/part-9-security-and-governance/06-red-teaming.md)

</details>

<details>
<summary><strong>Part 10 — Production AI (8 chapters)</strong> — hosted vs self-hosted, fine-tuning decisions, cost and latency engineering, rollouts, SLOs</summary>

### Part 10 — Production AI (8 chapters)

> **Audience:** engineers who own an AI feature's bill, latency, and on-call.
> **Difficulty:** Intermediate. **Total reading time:** ~2 hours.

Operating AI in production: hosted versus self-hosted, the customization menu, cost and latency engineering, eval-gated rollouts, SLOs, incident response, and AI infrastructure patterns.

1. [Hosted vs self-hosted](content/ai-eng/part-10-deployment-and-cost/00-hosted-vs-self-hosted.md)
1. [Self-hosting essentials](content/ai-eng/part-10-deployment-and-cost/01-self-hosting-essentials.md)
1. [The customization menu](content/ai-eng/part-10-deployment-and-cost/02-the-customization-menu.md)
1. [Cost engineering](content/ai-eng/part-10-deployment-and-cost/03-cost-engineering.md)
1. [Latency engineering](content/ai-eng/part-10-deployment-and-cost/04-latency-engineering.md)
1. [Shipping changes](content/ai-eng/part-10-deployment-and-cost/05-shipping-changes.md)
1. [SLOs and incident response](content/ai-eng/part-10-deployment-and-cost/06-slos-and-incident-response.md)
1. [AI infrastructure patterns](content/ai-eng/part-10-deployment-and-cost/07-ai-infrastructure-patterns.md)

</details>

<details>
<summary><strong>Part 11 — AI Product Engineering (6 chapters)</strong> — AI UX, failure recovery, product metrics, experimentation, pricing, feedback loops</summary>

### Part 11 — AI Product Engineering (6 chapters)

> **Audience:** engineers and PMs deciding what an AI feature should do and whether it's working.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~2 hours.

AI UX, failure recovery, product metrics beyond accuracy, experimentation, cost modeling and pricing, and feedback loops that compound.

1. [AI UX](content/ai-eng/part-11-ai-product/00-ai-ux.md)
1. [Failure recovery UX](content/ai-eng/part-11-ai-product/01-failure-recovery-ux.md)
1. [AI product metrics](content/ai-eng/part-11-ai-product/02-ai-product-metrics.md)
1. [Experimentation](content/ai-eng/part-11-ai-product/03-experimentation.md)
1. [Cost modeling and pricing](content/ai-eng/part-11-ai-product/04-cost-modeling-and-pricing.md)
1. [Feedback and growth loops](content/ai-eng/part-11-ai-product/05-feedback-and-growth-loops.md)

</details>

---

## Study plans

You don't need one — pick any chapter and start reading. These are here if you prefer a pre-built route, typically because you're preparing for a specific interview window or filling a specific gap.

### SDE1 → SDE2 — 6-week interview prep

Goal: pass a 45-60 minute system-design screen at a mid-to-senior level. Roughly 8-10 hours of reading per week.

| Week  | Focus                       | Chapters                                                                              |
| ----- | --------------------------- | ------------------------------------------------------------------------------------- |
| **1** | Foundations                 | [Part 0](#part-0--prerequisites-5-chapters) + [Part 1](#part-1--core-fundamentals-7-chapters) (12 chapters, ~7 hrs) |
| **2** | Building blocks I           | Part 2 chapters 0-7: load balancers, proxies, CDN, cache, SQL, NoSQL, partitioning, replication |
| **3** | Building blocks II          | Part 2 chapters 8-15: queues, pub/sub, real-time, rate limiting, service mesh, blob storage, geo, edge |
| **4** | Case studies (core)         | Pick 5 from Part 8 chapters 0-9: URL shortener, rate limiter, chat, feed, web crawler, autocomplete |
| **5** | Case studies (your target)  | Pick 5 more from Part 8 relevant to your target company (see [Company-Specific Flavors](content/hld/part-11-interview-framework/04-company-specific-flavors.md)) |
| **6** | Interview mechanics         | [Part 11](#part-11--interview-framework-6-chapters) + top 5 most-cited pages in [Trade-offs Library](#trade-offs-library-22-pages) |

### SDE2 → Senior — 3-month deep dive

Goal: operate at Senior level, own cross-team architecture, pass loops at Senior+ bars.

| Phase   | Focus                                           | Duration  |
| ------- | ----------------------------------------------- | --------- |
| **1**   | Foundations + building blocks                   | 3 weeks — [Parts 0-2](#part-0--prerequisites-5-chapters) (28 chapters) |
| **2**   | Distributed theory + data + architecture        | 4 weeks — [Parts 3, 4, 5](#part-3--distributed-systems-theory-11-chapters) (32 chapters) |
| **3**   | Case studies (all 56)                           | 4 weeks — [Part 8](#part-8--case-studies-56-chapters) |
| **4**   | Reliability, security, AI, frontier, interview  | 2 weeks — [Parts 6, 7, 9, 10, 11](#part-6--reliability--operations-11-chapters) + [Trade-offs Library](#trade-offs-library-22-pages) |

### Full curriculum — Staff+ preparation (6 months)

Read everything in order. Use the end-of-chapter questions for active recall. Average one 25-minute chapter per day gets you through the whole thing in about 6 months, with buffer for harder chapters and re-reading.

### AI/ML-only track (4 weeks)

If you already know the fundamentals and want to become fluent specifically in AI-systems design:

| Week | Focus                | Chapters |
| ---- | -------------------- | -------- |
| 1    | LLM serving + RAG    | [Part 9](#part-9--ai--ml-system-design-15-chapters) chapters 0-3 |
| 2    | Agents + evaluation  | [Part 9](#part-9--ai--ml-system-design-15-chapters) chapters 3-9 |
| 3    | AI case studies      | [Part 8](#part-8--case-studies-56-chapters) chapters 30-37 (ChatGPT, RAG, coding agent, Perplexity, voice, moderation, semantic cache, model router) |
| 4    | ML fundamentals      | [Part 9](#part-9--ai--ml-system-design-15-chapters) chapters 9-14 + [Recommendation System case study](content/hld/part-8-case-studies/17-recommendation-system.md) |

### AI Engineering track (6 weeks)

If you build on model APIs and want the full production toolkit. Roughly 4-5 hours of reading per week, plus time to try the snippets.

| Week | Focus | Chapters |
| ---- | ----- | -------- |
| 1 | Mental model + model behavior | [AI Engineering Parts 0-1](#part-0--start-here-4-chapters) (11 chapters) |
| 2 | APIs + prompts | [Parts 2-3](#part-2--working-with-model-apis-8-chapters) (13 chapters) |
| 3 | Evals + context | [Parts 4-5](#part-4--eval-fundamentals-4-chapters) (10 chapters) |
| 4 | Retrieval | [Part 6](#part-6--retrieval-rag-9-chapters) (9 chapters) |
| 5 | Agents | [Part 7](#part-7--agent-engineering-13-chapters) (13 chapters) |
| 6 | Run it in production | [Parts 8-11](#part-8--evaluation-and-observability-9-chapters) (30 chapters; skim, then return as each problem comes up) |

Pair it with the HLD [AI/ML-only track](#aiml-only-track-4-weeks) when you also need the architecture-scale view.

### Interview-triage track (one weekend)

If you have a loop on Monday:

- Saturday morning: [How to Approach a System Design Question](content/hld/part-1-core-fundamentals/05-how-to-approach-design-questions.md) + [Back-of-the-Envelope Estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md) + [Requirements Scoping](content/hld/part-11-interview-framework/01-requirements-scoping.md) + [Diagramming Skills](content/hld/part-11-interview-framework/02-diagramming-skills.md)
- Saturday afternoon: 3 case studies in your domain
- Sunday morning: 3 more case studies + [Trade-off Articulation](content/hld/part-11-interview-framework/03-trade-off-articulation.md)
- Sunday evening: [Company-Specific Interview Flavors](content/hld/part-11-interview-framework/04-company-specific-flavors.md) for your target

---

## Project statistics

| Metric                              | HLD Handbook | DSA Handbook | AI Engineering Handbook | Repo total |
| ----------------------------------- | -----------: | -----------: | ----------------------: | ---------: |
| Parts                               | 12 + Trade-offs Library | 15 | 12 | 39 + library |
| Teaching chapters                   | 159          | 120          | 86                      | 365        |
| Decision/pattern pages              | 22 trade-offs | 37 patterns | —                       | 59         |
| Long-form editorials                | —            | 5            | —                       | 5          |
| Interactive widget specs            | —            | 46           | —                       | 46         |
| Sibling code samples (per language) | —            | 155 problems × 4 langs ≈ 620 files | 200 inline Python examples | 620 files + 200 inline |
| **Total Markdown pages**            | **181**      | **162**      | **86**                  | **429**    |
| Total words                         | ~773,000     | ~470,000     | ~192,000                | ~1,435,000 |
| Mermaid diagrams                    | **719**      | **226**      | **5**                   | **950**    |
| Figures (PNG)                       | —            | —            | **87**                  | **87**     |
| Citations to primary sources        | **3,100+**   | hundreds     | **750+**                | 4,250+     |
| Estimated total reading time        | ~110 hours   | ~60 hours    | ~26 hours               | ~196 hours |
| Equivalent printed book page count  | ~2,400 pages | ~1,500 pages | ~600 pages              | ~4,500 pages |

For comparison, the HLD book alone is longer than *Designing Data-Intensive Applications* (~600 pages) + Alex Xu's *System Design Interview* Vol. 1 (~300 pages) + Vol. 2 (~340 pages) combined. The DSA book is comparable in length to *Cracking the Coding Interview* (~700 pages) plus *Elements of Programming Interviews* (~480 pages). The AI Engineering book is deliberately shorter: one concept per chapter, about the length of Chip Huyen's *AI Engineering* (~530 pages).

## Quality standards

Every chapter in this repository passes 7 automated CI checks on every PR. The validators run against every book and dispatch on a per-book schema:

1. **[markdownlint](https://github.com/DavidAnson/markdownlint)** — Markdown style and structure conformance.
2. **[typos](https://github.com/crate-ci/typos)** — source-code spell-check with a project-specific allowlist for technical terms.
3. **Citation integrity** — every `[^1]`-style footnote has a corresponding `[^1]: source` definition; every citation is a real URL; no orphan citations.
4. **Frontmatter validation** — HLD chapters declare `title`, `difficulty`, `prerequisites`, `date_created`, `date_updated`, `reading_time_minutes`, `tags` (canonical taxonomy), and `technologies` (curated allowlist). DSA chapters declare `title`, `slug`, `part`, `chapter`, `difficulty`, `languages` (subset of `python`/`java`/`cpp`/`go`), `canonical_test`, `widgets`, and `ladder` (referencing `LC-NNN` IDs in `_problem-registry.yml`). AI Engineering chapters declare `title`, `description`, `slug`, `part`, `chapter`, `difficulty`, `prerequisites` (resolved against real chapter paths), `tags`, `date_created`, and `date_updated`. Editorials and pattern decision pages have their own thinner schemas. See [`scripts/check-frontmatter.mjs`](scripts/check-frontmatter.mjs) for the per-book branches.
5. **Mermaid diagram validation** — all 950 diagrams across every book must parse with `@mermaid-js/mermaid-cli` on CI so broken syntax doesn't ship.
6. **[Vale](https://vale.sh/)** — prose-style linter for voice, passive voice, weasel words, and banned phrases. Custom rules in `.vale.ini`.
7. **[lychee](https://github.com/lycheeverse/lychee)** — external link checker run weekly; flags rotted URLs so citations stay valid.

CI configuration lives in [`.github/workflows/content-ci.yml`](.github/workflows/content-ci.yml). Validator scripts are in [`scripts/`](scripts/).

Beyond automation, every chapter is reviewed for:

- Internal consistency (terminology matches Part 1 definitions)
- Difficulty calibration (a "Beginner" chapter doesn't assume Staff-level context)
- Diagram quality (Mermaid or purpose-drawn figures, not screenshots; captioned; descriptive alt text)
- Citation quality (primary sources preferred over summarizing blog posts)

---

## Contributing

**Contributions of all sizes are welcome, from a typo fix to a full chapter.** Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow. A short summary:

### Contribution paths

| Time       | What you can do                                              | Issue required? |
| ---------- | ------------------------------------------------------------ | :-------------: |
| 5 min      | Fix a typo or dead link                                      | No              |
| 15 min     | Add a missing citation or update an out-of-date number       | No              |
| 30 min     | Add a real-world example or clarify a confusing paragraph    | No              |
| 1 hour     | Create a Mermaid diagram for an existing chapter             | Optional        |
| 2-4 hours  | Review a chapter for technical accuracy and leave feedback   | Yes             |
| 4-8 hours  | Write a full chapter from an outline                         | **Yes, required** |
| Translator | Translate one chapter or the full handbook into your language | Yes             |

### How to contribute

1. **Read the [STYLE_GUIDE.md](STYLE_GUIDE.md)** for voice, structure, diagram conventions, and citation format.
2. **Open an issue first** for anything bigger than 30 minutes of work — this ensures you don't duplicate in-flight work.
3. **Fork, branch, edit.** Use descriptive branch names like `fix/raft-quorum-math` or `add/mcp-protocol-chapter`.
4. **Run validators locally (optional):**

   ```bash
   npm install
   npm run check:all
   ```

   If you skip this, CI will run them on your PR anyway and tell you what to fix.
5. **Submit a pull request** using the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Small fix? A one-sentence description is fine. Full chapter? Describe the pedagogical approach and list your primary sources.
6. **Respond to review.** A maintainer will review within 7 days (usually faster). For content chapters, expect at least one round of technical review.

### What makes a great contribution

- **Correctness.** If you're citing a number, cite the primary source. If you're claiming a property (like "Raft guarantees linearizability"), cite the paper.
- **Clarity.** Write for the difficulty tier declared in the chapter's frontmatter. Don't introduce Part-7 concepts in a Part-0 chapter.
- **Opinion with evidence.** If you think the chapter should recommend something different, make the case with citations, not vibes.
- **Pedagogical structure.** Intro → first principles → diagram → worked example → trade-offs → production gotchas → references. Deviate only when the topic genuinely demands it.

### Reviewers wanted

If you have **operated one of the systems we cover in Part 8** (payment processing, real-time chat, feeds, video streaming, etc.) — your review is worth more than a month of solo research. Open an issue with your expertise area and which chapter you'd like to review.

### Private/sensitive concerns

- **Security issues in validator scripts or CI:** open a [private security advisory](https://github.com/handbook-academy/engineering-handbook/security/advisories/new).
- **Code of conduct concerns:** email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Legal or licensing questions:** email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Direct contact:** [@invincible04](https://github.com/invincible04).

---

## Project structure

```text
engineering-handbook/
├── content/                           # Three open-source books (CC BY-SA 4.0)
│   ├── hld/                           # HLD Handbook — 181 pages
│   │   ├── part-0-prerequisites/          # 5 chapters
│   │   ├── part-1-core-fundamentals/      # 7 chapters
│   │   ├── part-2-building-blocks/        # 16 chapters
│   │   ├── part-3-distributed-systems-theory/  # 11 chapters
│   │   ├── part-4-data-systems/           # 10 chapters
│   │   ├── part-5-architecture-patterns/  # 11 chapters
│   │   ├── part-6-reliability-and-operations/  # 11 chapters
│   │   ├── part-7-security-at-scale/      # 10 chapters
│   │   ├── part-8-case-studies/           # 56 chapters
│   │   ├── part-9-ai-ml-system-design/    # 15 chapters
│   │   ├── part-10-emerging-patterns/     # 1 chapter
│   │   ├── part-11-interview-framework/   # 6 chapters
│   │   └── trade-offs/                    # 22 decision pages
│   ├── dsa/                           # DSA Handbook — 120 chapters
│   │   ├── part-0-foundations/        # 7 chapters
│   │   ├── part-1-linear-data-structures/  # 8 chapters
│   │   ├── part-2-search-sort/        # 8 chapters
│   │   ├── part-3-pointers-window-prefix/  # 6 chapters
│   │   ├── part-4-stack-queue-patterns/  # 5 chapters
│   │   ├── part-5-linked-lists/       # 6 chapters
│   │   ├── part-6-trees-heaps/        # 11 chapters
│   │   ├── part-7-recursion-backtracking/  # 7 chapters
│   │   ├── part-8-graphs/             # 13 chapters
│   │   ├── part-9-dynamic-programming/  # 15 chapters
│   │   ├── part-10-greedy/            # 5 chapters
│   │   ├── part-11-bit-manipulation/  # 4 chapters
│   │   ├── part-12-strings-pattern-matching/  # 6 chapters
│   │   ├── part-13-design-the-data-structure/  # 7 chapters
│   │   ├── part-14-interview-framework/  # 12 chapters
│   │   ├── editorials/                # Per-LC long-form editorials
│   │   ├── patterns/                  # Pattern decision references
│   │   ├── widgets/                   # YAML specs for interactive widgets
│   │   ├── _problem-registry.yml      # Canonical LC-NNN registry
│   │   └── _widget-registry.yml       # Canonical w-NN/e-LCNNN registry
│   └── ai-eng/                        # AI Engineering Handbook — 86 chapters
│       ├── README.md                  # How to read the book + full chapter index
│       ├── part-0-start-here/         # 4 chapters
│       ├── part-1-how-models-behave/  # 7 chapters
│       ├── part-2-working-with-model-apis/  # 8 chapters
│       ├── part-3-prompt-engineering/  # 5 chapters
│       ├── part-4-eval-fundamentals/  # 4 chapters
│       ├── part-5-context-engineering/  # 6 chapters
│       ├── part-6-retrieval-augmented-generation/  # 9 chapters
│       ├── part-7-agent-engineering/  # 13 chapters
│       ├── part-8-evaluation-and-observability/  # 9 chapters
│       ├── part-9-security-and-governance/  # 7 chapters
│       ├── part-10-deployment-and-cost/  # 8 chapters
│       └── part-11-ai-product/        # 6 chapters (each part has an images/ folder)
│
├── writing-guides/                    # Author handbooks (CC BY-SA 4.0)
│   ├── case-study-template.md         # Skeleton for Part 8 case studies
│   └── trade-off-template.md          # Skeleton for trade-off decision pages
│
├── scripts/                           # Content validators used by CI
│   ├── check-citations.mjs            # Footnote integrity
│   ├── check-frontmatter.mjs          # YAML frontmatter schema (per-book)
│   ├── check-mermaid.mjs              # Mermaid syntax validator
│   ├── content-stats.mjs              # Word / diagram / citation counts
│   ├── technologies.json              # Curated technology name taxonomy (HLD)
│   └── update-frontmatter-dates.mjs   # Bulk-touch date_updated on edited files
│
├── .github/
│   ├── workflows/
│   │   ├── content-ci.yml             # PR validation pipeline (every book)
│   │   └── stale.yml                  # Issue/PR hygiene
│   ├── ISSUE_TEMPLATE/                # Correction / Request / Writing templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   ├── dependabot.yml
│   └── release.yml
│
├── STYLE_GUIDE.md                     # Voice, structure, diagram conventions
├── CONTRIBUTING.md                    # Full contribution workflow
├── CODE_OF_CONDUCT.md                 # Contributor Covenant v2.1
├── CONTRIBUTORS.md                    # All-contributors list
├── SECURITY.md                        # Security disclosure process
├── CITATION.cff                       # Citation metadata (Zenodo, academic tools)
├── LICENSE                            # CC BY-SA 4.0 (everything in this repo)
├── package.json                       # Dev dependencies for validators
├── lychee.toml                        # Link-check configuration
├── .vale.ini                          # Prose style rules
├── .markdownlint.json                 # Markdown style rules
└── .typos.toml                        # Spell-check allowlist
```

---

## Development setup

You don't need anything installed to contribute content — edit Markdown, push, let CI validate. But if you want to run the checks locally before pushing:

### Prerequisites

- [Node.js 20+](https://nodejs.org/) (the `.nvmrc` file pins the exact version)
- [npm](https://www.npmjs.com/) (ships with Node)
- Optional: [Vale](https://vale.sh/) for prose-style linting
- Optional: [lychee](https://github.com/lycheeverse/lychee) for link checking

### Setup

```bash
git clone https://github.com/handbook-academy/engineering-handbook.git
cd engineering-handbook
nvm use                    # pins Node version from .nvmrc
npm install                # installs markdownlint, @mermaid-js/mermaid-cli, etc.
```

### Common commands

```bash
# Run all 7 content checks (same as CI)
npm run check:all

# Individual checks
npm run lint               # markdownlint
npm run check:citations    # footnote integrity
npm run check:frontmatter  # YAML schema
npm run check:mermaid      # Mermaid diagram syntax
npm run check:typos        # spell-check
npm run check:links        # lychee link check (slow; runs weekly)

# Optional
npm run prose              # Vale prose-style linter (requires Vale installed)
npm run stats              # word / diagram / citation counts
```

### Editor

Use **[Markdownlab](https://markdownlab.vercel.app)** ([source](https://github.com/invincible04/markdownlab)) for editing chapters. It's a browser-based Markdown editor with live preview, Mermaid rendering, and the same callouts/footnotes/admonitions this handbook uses — no install, no setup.

**Open any chapter directly in the editor** by prefixing its GitHub URL with `https://markdownlab.vercel.app/`:

```text
https://markdownlab.vercel.app/https://github.com/handbook-academy/engineering-handbook/blob/main/content/hld/part-1-core-fundamentals/00-scalability.md
```

That URL opens the chapter in Markdownlab pre-loaded and ready to edit. Paste your edits back into a fork → branch → PR.

The repo includes `.editorconfig`, `.nvmrc`, `.markdownlint.json`, `.vale.ini`, and `.typos.toml` so any editor that reads them picks up project settings automatically.

---

## Governance

**Benevolent maintainer model.** The project is currently solo-maintained by [@invincible04](https://github.com/invincible04). Major architectural decisions (curriculum scope, licensing, CI strategy) are made by the maintainer after consultation with active contributors via Issues/Discussions.

**Decision process:**

- **Typo / dead link / factual correction:** any maintainer can merge.
- **New chapter or major rewrite:** requires an issue with pedagogical rationale and at least one maintainer approval.
- **Curriculum scope change (new part, renamed part, reordering):** requires a Discussion thread open for at least 7 days before merge.
- **License change:** requires all-contributors consent; CC BY-SA 4.0 for everything in this repository is a stable commitment.

**Becoming a maintainer.** Sustained, high-quality contributions over 3+ months can result in a maintainer invitation. This includes merge rights on your areas of expertise and a vote on curriculum-scope decisions.

See [CODEOWNERS](.github/CODEOWNERS) for the current maintainer routing.

---

## FAQ

<details>
<summary><strong>Is this really free?</strong></summary>

Yes, and specifically: everything in this repository — every book's content, writing guides, style guide, validator scripts — is released under **CC BY-SA 4.0**. Anyone (including us) can share and adapt it, but adaptations must carry the same license. That means the chapter text cannot be paywalled by anybody — not by us, not by a future company, not by anyone who forks this repo. You can always read every book free at [handbook.academy](https://handbook.academy).
</details>

<details>
<summary><strong>Can I use this to build a paid course?</strong></summary>

Yes. CC BY-SA 4.0 allows commercial use provided you:

1. Attribute the original ("Adapted from The Engineering Handbook, CC BY-SA 4.0, https://github.com/handbook-academy/engineering-handbook")
2. License your derivative under the same CC BY-SA 4.0 terms
3. Indicate what you changed

You can teach courses, run boot camps, build YouTube channels, or sell books derived from this content — under share-alike. What you *can't* do is take the content, strip the attribution, and relicense it as proprietary.
</details>

<details>
<summary><strong>Can I translate it into my language?</strong></summary>

**Please do.** Translations are explicitly welcomed. Open an issue saying which language you'd like to translate into and which chapters you plan to start with. Translations live in parallel directories (e.g. `content-hi/` for Hindi, `content-zh/` for Chinese) under the same repository, or as a linked sister repo — your call.
</details>

<details>
<summary><strong>How is this different from `donnemartin/system-design-primer`?</strong></summary>

`system-design-primer` is a link-dump README that points at scattered blog posts and talks. It's great as a discovery tool. The HLD Handbook in this repo is inline content — every topic is taught fully within these pages. They're complementary: `system-design-primer` for breadth of resources, this handbook for depth of teaching.
</details>

<details>
<summary><strong>How is this different from Alex Xu's books?</strong></summary>

Alex Xu's books are excellent and we cite them in nearly every case study. The differences:

- **Scope:** ~640 pages (Vols 1+2) vs ~2,400 equivalent pages of HLD here.
- **Freshness:** Xu Vol. 2 was published in 2022 and doesn't cover LLMs, RAG, agents, CRDTs, post-quantum crypto, MCP, etc. This handbook does.
- **Format:** Xu is case-study-focused. This handbook has 56 case studies *plus* 103 foundational HLD chapters that teach the building blocks.
- **License:** Xu's books are copyrighted and paid. This handbook is CC BY-SA 4.0.
- **Community:** Xu's books are one-author; this handbook accepts PRs.
- **Bonus:** this repo also includes a 120-chapter DSA curriculum and an 86-chapter AI Engineering curriculum.

</details>

<details>
<summary><strong>How is the DSA book different from NeetCode / LeetCode editorials / "Cracking the Coding Interview"?</strong></summary>

- **Structured by pattern, not by problem.** Every DSA chapter is a *teaching* chapter on a structure or pattern (e.g. monotonic stack, sliding-window-variable, segment tree). LeetCode problems show up as worked examples *inside* the chapter, not as the unit of study.
- **Four languages, side by side.** Each canonical problem ships with `sol.py`, `sol.java`, `sol.cpp`, `sol.go` siblings. You read the chapter in Python, then click through to your interview language without re-deriving the logic.
- **37 pattern decision pages.** When a problem could be solved by recursion *or* iteration, BFS *or* DFS, sliding window *or* prefix sum — there's a pattern decision page that compares them and tells you which to reach for first. This is the part NeetCode skips.
- **Interactive widgets.** On `dsa.handbook.academy`, the relevant chapters render live, animated visualisations for sliding windows, monotonic stacks, Morris traversal, quickselect partitioning, and so on. Useful when the words on the page aren't enough.
- **Open and editable.** CTCI is paywalled and frozen at one author's voice. This is CC BY-SA 4.0 and accepts PRs.

</details>

<details>
<summary><strong>How does the AI Engineering book relate to HLD Part 9?</strong></summary>

They split one subject at the whiteboard. HLD Part 9 answers "how would I design this AI system at scale?": serving topology, vector store architecture, the case studies. The AI Engineering Handbook answers "how do I build and operate it?": the prompt, the eval set, the retrieval pipeline, the agent loop, the trace, the bill. Chapters in each book link to the matching chapter in the other.
</details>

<details>
<summary><strong>How is the AI Engineering book different from Chip Huyen's *AI Engineering* or provider docs?</strong></summary>

Huyen's book is the most complete treatment of the field, and the AI Engineering Handbook cites it where it draws the role's boundary. The differences: this book is free, CC BY-SA 4.0, and accepts PRs, so a stale price or a renamed API parameter can be fixed the week it changes. It is also more opinionated about defaults (a workflow before an agent, pgvector before a dedicated vector database, the cheapest rung of the escalation ladder before fine-tuning) and puts evals before RAG and agents. Provider docs tell you how one API works; this book tells you which of them to reach for, and how to tell whether it's working.
</details>

<details>
<summary><strong>Is this the same as the websites at hld.handbook.academy, dsa.handbook.academy, and ai-eng.handbook.academy?</strong></summary>

The **content** is identical. The websites add a polished reading UI: full-text search, dark mode, syntax-highlighted code blocks, per-chapter diagram zoom, social cards, OG images, fast client-side navigation, and — on the DSA site — the live interactive widgets. Same content, better reading experience — and still free, with no sign-up.
</details>

<details>
<summary><strong>Why don't you include an "Awesome" list of external resources?</strong></summary>

We cite primary sources inline where they're relevant. A separate "awesome" list would duplicate that work and go stale faster. If a resource is worth reading, it's cited in a chapter's References section.
</details>

<details>
<summary><strong>I want to submit a chapter on [topic X]. How?</strong></summary>

Open an issue first with the [writing template](.github/ISSUE_TEMPLATE) explaining:

1. Which part this chapter belongs in
2. Why it belongs (not already covered? modern emerging topic? missing from Part X?)
3. Proposed outline (1-2 paragraphs)
4. Your primary sources

A maintainer will respond with scope feedback within a week. Once approved, fork → draft → PR. For Part 8 chapters use [`writing-guides/case-study-template.md`](writing-guides/case-study-template.md); for trade-off pages use [`writing-guides/trade-off-template.md`](writing-guides/trade-off-template.md). All other chapters follow the skeleton documented in [STYLE_GUIDE.md](STYLE_GUIDE.md).
</details>

<details>
<summary><strong>How do I cite this in an academic paper?</strong></summary>

Use the BibTeX entry in the [Citation](#citation) section below, or the `CITATION.cff` file (which academic tools like Zotero and Zenodo can parse directly).
</details>

---

## License

Everything in this repository — the 429 chapters and decision pages across all three books, writing guides, style guide, validator scripts, templates, and configuration — is licensed under **[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](LICENSE)**.

**What CC BY-SA 4.0 means in practice:**

You can:

- Read it, share it, print it, screenshot it — forever.
- Build courses, boot camps, YouTube channels, or books derived from it.
- Translate it into any language.
- Use it commercially.

You must:

- **Attribute** the original (link back to this repo).
- Release derivatives under the **same CC BY-SA 4.0 license** (share-alike).
- Not relicense the content as proprietary or impose additional restrictions.

Nobody can paywall the chapter text itself under CC BY-SA 4.0. You can build anything on top of it, as long as the text itself stays open. Read every handbook free at **[handbook.academy](https://handbook.academy)** — no sign-up, no paywall, ever.

---

## Citation

If you reference this project in academic work, blog posts, books, or courses:

### BibTeX

```bibtex
@misc{engineering-handbook,
  author       = {Soni, Aayush},
  title        = {The Engineering Handbook: Open-Source Engineering Curricula (HLD + DSA + AI Engineering)},
  year         = {2026},
  publisher    = {GitHub},
  url          = {https://github.com/handbook-academy/engineering-handbook},
  note         = {HLD: 159 chapters + 22 trade-off pages, ~773K words. DSA: 120 chapters across 15 parts, ~470K words, 155 LeetCode problems with 4-language solutions. AI Engineering: 86 chapters across 12 parts, ~192K words, 87 figures. CC BY-SA 4.0.}
}
```

### Prose

> *"The Engineering Handbook (HLD + DSA + AI Engineering)" by Aayush Soni, https://github.com/handbook-academy/engineering-handbook, CC BY-SA 4.0.*

### Machine-readable

The [`CITATION.cff`](CITATION.cff) file in this repository is a [Citation File Format](https://citation-file-format.github.io/) descriptor. GitHub's "Cite this repository" button, Zenodo, Zotero, and academic reference managers can parse it directly.

---

## Acknowledgments

This project stands on the shoulders of many, and we cite primary sources liberally throughout. A few that shaped the handbook most:

**Canonical books — HLD:**

- **Martin Kleppmann** — [Designing Data-Intensive Applications](https://dataintensive.net/) is the foundation underneath most of HLD Parts 3-4.
- **Alex Xu** — [System Design Interview](https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF) Volumes 1 and 2 defined the interview case-study format we build on in HLD Part 8.
- **Chip Huyen** — [Designing Machine Learning Systems](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) and [AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) shape HLD Part 9.
- **Betsy Beyer et al. (Google)** — [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/) and [The SRE Workbook](https://sre.google/workbook/table-of-contents/) are behind HLD Part 6.
- **Mark Richards & Neal Ford** — [Fundamentals of Software Architecture](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/) and [Software Architecture: The Hard Parts](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/) for HLD Part 5.

**Canonical books — AI Engineering:**

- **Chip Huyen** — [AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) is the field's most complete reference; it frames the AI-engineer-versus-ML-engineer split in Part 0.
- **Shawn Wang (swyx)** — ["The Rise of the AI Engineer"](https://www.latent.space/p/ai-engineer) named the role and drew the API line the book is organized around.
- **Hamel Husain and Shreya Shankar** — their writing on evals and error analysis shapes Parts 4 and 8.
- **Simon Willison** — his prompt-injection and "lethal trifecta" writing underpins Part 9.
- **Anthropic** — ["Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents) is the source of the workflow-versus-agent split in Part 7.

**Canonical books — DSA:**

- **Cormen, Leiserson, Rivest, Stein (CLRS)** — [Introduction to Algorithms](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) is the bedrock for proofs, complexity arguments, and the algorithms in DSA Parts 2, 8, 9, and 12.
- **Robert Sedgewick & Kevin Wayne** — [Algorithms, 4th Edition](https://algs4.cs.princeton.edu/home/) shapes the data-structure exposition in DSA Parts 1, 5, 6, and 8.
- **Jon Bentley** — [Programming Pearls](https://www.amazon.com/Programming-Pearls-2nd-Jon-Bentley/dp/0201657880) is the spirit behind the prompt cards.
- **Steven & Felix Halim** — [Competitive Programming](https://cpbook.net/) for the contest-driven techniques in DSA Parts 9, 11, and 12.
- **Adnan Aziz, Tsung-Hsien Lee, Amit Prakash** — [Elements of Programming Interviews](https://elementsofprogramminginterviews.com/) for the problem-shaping that influenced the DSA prompt cards.
- **Gayle Laakmann McDowell** — [Cracking the Coding Interview](https://www.crackingthecodinginterview.com/) for setting the bar on interview-style explanations.

**Open-source references:**

- **Donne Martin** — [system-design-primer](https://github.com/donnemartin/system-design-primer).
- **NeetCode** — [neetcode.io](https://neetcode.io/) and the NeetCode 150 problem list for the DSA practice ladder template.
- **LeetCode community** — for the canonical problem corpus and the editorial conventions we adapt.
- **The Kubernetes, CNCF, and OpenTelemetry communities** — for cloud-native and observability standards.
- **The Apache projects** (Kafka, Cassandra, Hadoop, Spark, Flink) — for foundational distributed-systems code and docs.

**Papers, RFCs, and postmortems:**

- **SIGMOD / VLDB / OSDI / SOSP / NSDI** papers — the bedrock of distributed systems.
- **IETF / W3C / IANA** — for networking and web standards.
- **Every engineer who has written a public postmortem.** Real outages taught us everything about graceful degradation, blast radius, and the limits of testing.

We teach the same concepts in our own words, with our own diagrams, and we cite the originals.

---

## Community

- **[GitHub Discussions](https://github.com/handbook-academy/engineering-handbook/discussions)** — design questions, feedback, sharing what you're building.
- **[GitHub Issues](https://github.com/handbook-academy/engineering-handbook/issues)** — corrections, content requests, chapter proposals.
- **Email** — [hello@handbook.academy](mailto:hello@handbook.academy) for private or sensitive matters.
- **Maintainer** — [@invincible04](https://github.com/invincible04).

### Star history

If you find this useful, star the repo. Stars help signal to new contributors that the project is worth their time.

[![Star History Chart](https://api.star-history.com/svg?repos=handbook-academy/engineering-handbook&type=Date)](https://star-history.com/#handbook-academy/engineering-handbook&Date)

---

<div align="center">

### Start reading

**HLD:** [Networking Fundamentals](content/hld/part-0-prerequisites/00-networking-fundamentals.md) · [Scalability](content/hld/part-1-core-fundamentals/00-scalability.md) · [URL Shortener Case Study](content/hld/part-8-case-studies/00-url-shortener.md) · [Trade-offs Library](content/hld/trade-offs/)

**DSA:** [Arrays](content/dsa/part-1-linear-data-structures/00-arrays.md) · [Two pointers](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md) · [Sliding window (variable)](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md) · [Patterns](content/dsa/patterns/)

**AI Engineering:** [What an AI engineer is](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md) · [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md) · [Your first eval set](content/ai-eng/part-4-eval-fundamentals/02-your-first-eval-set.md) · [Workflow vs agent](content/ai-eng/part-7-agent-engineering/00-workflow-vs-agent.md)

Or skim **[the full HLD curriculum](#the-full-hld-curriculum)**, **[the full DSA curriculum](#the-full-dsa-curriculum)**, or **[the full AI Engineering curriculum](#the-full-ai-engineering-curriculum)** above.

</div>

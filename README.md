<div align="center">

<img src="logo.svg" alt="The HLD Handbook" width="160" />

# The HLD Handbook

**The open-source High-Level Design & System Design handbook.**

159 chapters + 22 trade-off pages · 181 pages · 772,000 words · 719 diagrams · 3,100+ citations

[![License: CC BY-SA 4.0](https://img.shields.io/badge/license-CC%20BY--SA%204.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI](https://github.com/handbook-academy/hld-handbook/actions/workflows/content-ci.yml/badge.svg)](https://github.com/handbook-academy/hld-handbook/actions)
[![GitHub stars](https://img.shields.io/github/stars/handbook-academy/hld-handbook?style=social)](https://github.com/handbook-academy/hld-handbook/stargazers)

**Read free at [hld.handbook.academy](https://hld.handbook.academy)** *(public beta)*

[Start reading](#start-reading) · [Full curriculum](#the-full-curriculum) · [Case studies](#part-8--case-studies-56-chapters) · [Trade-offs](#trade-offs-library-22-pages) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [What this is](#what-this-is)
- [Why this exists](#why-this-exists)
- [Who this is for](#who-this-is-for)
- [How the HLD Handbook compares](#how-the-hld-handbook-compares)
- [Start reading](#start-reading)
- [The full curriculum](#the-full-curriculum)
  - [Part 0 — Prerequisites (5 chapters)](#part-0--prerequisites-5-chapters)
  - [Part 1 — Core Fundamentals (7 chapters)](#part-1--core-fundamentals-7-chapters)
  - [Part 2 — Building Blocks (16 chapters)](#part-2--building-blocks-16-chapters)
  - [Part 3 — Distributed Systems Theory (11 chapters)](#part-3--distributed-systems-theory-11-chapters)
  - [Part 4 — Data Systems (10 chapters)](#part-4--data-systems-10-chapters)
  - [Part 5 — Architecture Patterns (11 chapters)](#part-5--architecture-patterns-11-chapters)
  - [Part 6 — Reliability & Operations (11 chapters)](#part-6--reliability--operations-11-chapters)
  - [Part 7 — Security at Scale (10 chapters)](#part-7--security-at-scale-10-chapters)
  - [Part 8 — Case Studies (56 chapters)](#part-8--case-studies-56-chapters)
  - [Part 9 — AI & ML System Design (15 chapters)](#part-9--ai--ml-system-design-15-chapters)
  - [Part 10 — Emerging Patterns (1 chapter)](#part-10--emerging-patterns-1-chapter)
  - [Part 11 — Interview Framework (6 chapters)](#part-11--interview-framework-6-chapters)
  - [Trade-offs Library (22 pages)](#trade-offs-library-22-pages)
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

The **HLD Handbook** is an open-source, opinionated, end-to-end textbook on high-level software design, distributed systems, and modern infrastructure — written for engineers who need more than a cheat sheet but less than a graduate-level textbook.

Every concept in this repository is taught **inline** as a full-length article: introduction, first-principles explanation, diagrams, worked examples, trade-offs, production gotchas, and citations to primary sources. No stubs. No "coming soon." No external blog redirects. No summary bullets that tell you to go somewhere else to actually learn.

At roughly **772,000 words across 181 pages**, the handbook is equivalent in scope to a **~2,200-page book** — longer than *Designing Data-Intensive Applications* and Alex Xu's *System Design Interview* volumes 1 and 2 combined. It covers everything from the TCP/IP stack to LLM serving architectures, and it treats each topic at roughly the same depth so you can trust the level of detail regardless of which chapter you land on.

**Read it free at [hld.handbook.academy](https://hld.handbook.academy).** Every `.md` file under `content/` also renders natively on GitHub — all 719 Mermaid diagrams display in the GitHub UI, all footnotes work, all cross-references resolve — but the website gives you search, dark mode, per-chapter diagram zoom, social cards, OG images, and fast client-side navigation across the full 181-page curriculum.

The handbook is continuously updated. Every chapter's frontmatter declares `date_created` and `date_updated`, so you can see exactly how fresh each page is. We care about numbers being right today, not right in 2022.

## Why this exists

The open-source system design landscape has a shape, and that shape is frustrating:

- **Link dumps** — curated lists that point at dozens of scattered blog posts, papers, and talks. Great for discovery, useless as a learning path. You end up with 60 tabs open and no through-line.
- **Teaser-and-redirect repos** — READMEs with a few hundred words on each topic that nudge you toward a paid course hosted elsewhere. The GitHub repo is the marketing page; the actual teaching is behind a $150-$400+/year paywall.
- **Monolithic READMEs frozen in time** — a single 5,000-line `README.md` that was great in 2021 but hasn't kept up with the modern stack. No LLM serving, no CRDTs, no post-quantum crypto, no FinOps. And nobody wants to review a PR against a 5,000-line file.
- **Surface-level outlines** — bullet-point summaries that tell you *what* exists without explaining *why* you'd pick one approach over another. You learn the vocabulary without the judgment.
- **Interview-only prep** — focused on passing a specific 45-minute screen, not on actually operating systems at scale.

This handbook fixes all of that:

- **100% inline content.** Every chapter is a full teaching article written from scratch, living in this repo as plain Markdown. Nothing is a stub. Nothing redirects you elsewhere to learn.
- **Progressive curriculum.** 159 teaching chapters across 12 parts, plus a 22-page Trade-offs Library, sequenced deliberately from prerequisites (Part 0) to Staff+ topics (Parts 7-9). Each chapter declares its prerequisites, learning objectives, estimated reading time, and difficulty tier.
- **Research-backed.** Every chapter ends with a **Further Reading & References** section citing primary sources — SIGMOD and OSDI papers, RFCs, IETF drafts, engineering postmortems, official docs, canonical books. **3,100+ citations** across the handbook. Not blog posts about blog posts.
- **Opinionated.** Every topic picks a recommended approach and explains *why*, instead of listing options without guidance. Where reasonable people disagree, the trade-offs are made explicit with a decision flowchart and "when to pick A" vs "when to pick B" tables.
- **Modern (2025+).** LLM serving, RAG pipelines, AI agents, multi-agent orchestration, CRDTs, edge computing, FinOps, post-quantum cryptography, platform engineering, local-first software, differential privacy, MCP — all first-class topics, not afterthoughts.
- **Decision-oriented.** The **Trade-offs Library** gives decision flowcharts for the hardest architectural choices: SQL vs NoSQL, REST vs gRPC vs GraphQL, monolith vs microservices, B-tree vs LSM, optimistic vs pessimistic locking, and 17 more.

## Who this is for

This handbook is written for:

- **SDE1 engineers preparing for SDE2 interviews.** Part 0 + Part 1 + Part 11, plus 8-10 targeted case studies from Part 8, plus the top-5 most-cited trade-off pages.
- **SDE2s preparing for Senior/Staff.** The full Parts 3-7 are the core "you need to know this to design anything meaningful" material. Parts 6 (Reliability) and 7 (Security) separate Senior candidates from Staff candidates.
- **Senior/Staff engineers refreshing or filling gaps.** Part 9 (AI/ML systems) and the Trade-offs Library are valuable even if you've been doing this for 15 years. Modern LLM serving and vector search weren't a thing when most of us learned backend.
- **Self-taught engineers without a CS degree** who want the vocabulary and the reasoning that bootcamps and YouTube don't teach. Part 0 is explicit prerequisites: TCP/IP, the OS contract, database internals, API design — fundamentals you need before "distributed systems" makes sense.
- **Career switchers** moving from adjacent roles (frontend → backend, backend → infra, SWE → MLE) who need to build system-level intuition fast.
- **Teachers and course creators** who want to build system-design curriculum without writing 800 pages from scratch. The CC BY-SA 4.0 license explicitly allows this.
- **Anyone operating a production system at non-trivial scale** who wants a reference shelf that covers the full stack — from packet-level networking to multi-tenant SaaS isolation models.

**This handbook is NOT for:**

- **Absolute beginners with no programming experience.** Part 0 assumes you can read code and have built at least one CRUD app. If you're brand new, start with [The Odin Project](https://www.theodinproject.com/) or [CS50](https://cs50.harvard.edu/), then come back.
- **People who want leetcode/algorithms prep.** This handbook is HLD, not DSA. For algorithms, see [NeetCode](https://neetcode.io/) or [LeetCode](https://leetcode.com/).
- **People who want low-level language-specific tutorials.** We don't teach Rust syntax or Go's goroutines — we teach concepts that apply across languages.

## How the HLD Handbook compares

|                                           | HLD Handbook | Typical OSS system-design repos | Paid courses (\$150-\$400+/yr) | O'Reilly-style books |
| ----------------------------------------- | :----------: | :-----------------------------: | :---------------------: | :------------------: |
| Free and open-source                      |      Yes     |                Yes              |            No           |           No         |
| 100% inline content (no external redirects)|    Yes      |                No               |            Yes          |           Yes        |
| 150+ chapters covering full stack         |      Yes     |                No               |      Only their sliver  |     Usually one topic|
| 56 end-to-end case studies                |      Yes     |           5-15 typical          |         15-25 typical   |          Varies      |
| Dedicated Trade-offs Library (22 pages)   |      Yes     |                No               |            No           |           No         |
| Covers LLMs, RAG, agents, multimodal AI   |      Yes     |           Rarely modern         |         Sometimes       |         Rarely       |
| Opinionated decisions, not just options   |      Yes     |                No               |        Sometimes        |         Varies       |
| 3,100+ primary-source citations           |      Yes     |                No               |            No           |           Yes        |
| Community-editable, PRs welcome           |      Yes     |                Yes              |            No           |           No         |
| Updated continuously                      |      Yes     |       Often frozen              |        Varies           |      Every 3-5 years |
| Decision flowcharts for architectural choices | Yes      |                No               |         Rarely          |         Rarely       |

## Start reading

> **For the best reading experience, visit [hld.handbook.academy](https://hld.handbook.academy)** — free, no sign-up, full search, dark mode, and per-chapter diagram zoom. The links below open the source on GitHub, where diagrams also render natively.

Pick one:

**I want a quick taste.** Read these three in order — they give you the vocabulary and the first real worked example:

1. [Scalability: Growing a System Without Breaking It](content/part-1-core-fundamentals/00-scalability.md)
2. [Back-of-the-Envelope Estimation](content/part-1-core-fundamentals/04-back-of-envelope-estimation.md)
3. [Design a URL Shortener (TinyURL / bit.ly)](content/part-8-case-studies/00-url-shortener.md)

**I'm preparing for an SDE2 interview in the next 6 weeks.** Follow the [SDE1 → SDE2 study plan](#sde1--sde2--6-week-interview-prep).

**I'm a Senior engineer refreshing my distributed-systems foundations.** Read [Part 3 — Distributed Systems Theory](#part-3--distributed-systems-theory-11-chapters) straight through.

**I want to learn AI-systems design.** Read [Part 9 — AI & ML System Design](#part-9--ai--ml-system-design-15-chapters) + the 8 AI case studies in [Part 8](#part-8--case-studies-56-chapters) (chapters 30-37).

**I want to read the whole book.** Start at [Part 0](#part-0--prerequisites-5-chapters) and move through the parts in order. At your target reading pace of one 25-minute chapter per day, you finish in about 6 months. Bookmark [hld.handbook.academy](https://hld.handbook.academy) so your progress is one tap away.

---

## The full curriculum

181 pages, every one linked below. Click any title to read the chapter on GitHub — Mermaid diagrams render natively.

### Part 0 — Prerequisites (5 chapters)

> **Audience:** engineers without a CS degree, or anyone who wants to confirm their foundations before moving on.
> **Difficulty:** Beginner. **Total reading time:** ~3 hours.

Foundational topics that the rest of the handbook assumes. If you can explain TCP's three-way handshake, the difference between a process and a thread, a B-tree's internal structure, and why idempotent PUT is better than non-idempotent POST for a retry-prone endpoint — you can skip this part.

1. [Networking Fundamentals for System Design](content/part-0-prerequisites/00-networking-fundamentals.md)
   — OSI and TCP/IP layers, TCP vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS resolution, TLS handshake, what "the network is unreliable" really means in practice.
2. [Operating System Essentials for System Design](content/part-0-prerequisites/01-os-essentials.md)
   — Processes vs threads, context switching cost, virtual memory, page cache, filesystem I/O, epoll/kqueue/IOCP, why `O_DIRECT` matters for databases.
3. [Data Structures for Distributed Systems](content/part-0-prerequisites/02-data-structures-for-systems.md)
   — Hash tables, B-trees, LSM-trees, skip lists, Bloom filters, tries, HyperLogLog, Count-Min Sketch, and when each shows up in real systems.
4. [Database Fundamentals for System Design](content/part-0-prerequisites/03-database-fundamentals.md)
   — Transactions, isolation levels (read-committed to serializable), indexes, query planners, joins, and why your ORM hides things from you that you need to see.
5. [API Design Basics: REST, GraphQL, gRPC, and the Hard Parts](content/part-0-prerequisites/04-api-design-basics.md)
   — Resource modeling, idempotency, versioning, pagination, rate-limit headers, error envelopes, HATEOAS in theory vs practice.

### Part 1 — Core Fundamentals (7 chapters)

> **Audience:** everybody — read this part even if you know the topic, because the vocabulary here is used for the rest of the book.
> **Difficulty:** Beginner-Intermediate. **Total reading time:** ~4 hours.

The vocabulary and the reasoning habits that every later chapter assumes. "Scalability," "consistency," "trade-off," and "back-of-envelope" get defined here rigorously so they mean something specific when we use them later.

1. [Scalability: Growing a System Without Breaking It](content/part-1-core-fundamentals/00-scalability.md)
2. [Latency and Throughput: The Two Numbers That Matter](content/part-1-core-fundamentals/01-latency-and-throughput.md)
3. [Availability and Reliability: Nines, SLOs, and Staying Up](content/part-1-core-fundamentals/02-availability-and-reliability.md)
4. [Consistency Models: What Readers Actually See](content/part-1-core-fundamentals/03-consistency-models.md)
5. [Back-of-the-Envelope Estimation](content/part-1-core-fundamentals/04-back-of-envelope-estimation.md)
6. [How to Approach a System Design Question](content/part-1-core-fundamentals/05-how-to-approach-design-questions.md)
7. [Trade-off Thinking](content/part-1-core-fundamentals/06-trade-off-thinking.md)

### Part 2 — Building Blocks (16 chapters)

> **Audience:** anyone who'll assemble backend systems. This part is the Lego brick inventory.
> **Difficulty:** Intermediate. **Total reading time:** ~10 hours.

Deep dives on the pieces you assemble to build real systems: load balancers, caches, queues, CDNs, databases (SQL and NoSQL), partitioning, replication, pub/sub, rate limiters, service discovery, blob storage, geospatial indexes, and edge compute.

1. [Load Balancers: Spreading Traffic, Absorbing Failure](content/part-2-building-blocks/00-load-balancers.md)
2. [Reverse Proxies and API Gateways: The Smart Edge](content/part-2-building-blocks/01-reverse-proxies-api-gateways.md)
3. [Content Delivery Networks: Moving Bytes Closer to Users](content/part-2-building-blocks/02-cdns.md)
4. [Caching: From Browser to Database](content/part-2-building-blocks/03-caching.md)
5. [SQL Databases: The Boring Technology That Wins](content/part-2-building-blocks/04-sql-databases.md)
6. [NoSQL Databases: Picking the Right Non-Relational Tool](content/part-2-building-blocks/05-nosql-databases.md)
7. [Database Partitioning and Sharding: When One Node Is Not Enough](content/part-2-building-blocks/06-database-partitioning-sharding.md)
8. [Database Replication: Keeping Copies in Sync](content/part-2-building-blocks/07-database-replication.md)
9. [Message Queues and Streaming: Decoupling at Scale](content/part-2-building-blocks/08-message-queues-streaming.md)
10. [Pub/Sub: Fan-Out and Event-Driven Systems](content/part-2-building-blocks/09-pub-sub.md)
11. [Real-Time Communication: WebSockets, SSE, and Long Polling](content/part-2-building-blocks/10-real-time-communication.md)
12. [Rate Limiting: Protecting Systems from Themselves](content/part-2-building-blocks/11-rate-limiting.md)
13. [Service Discovery and Service Mesh: Finding and Talking to Services](content/part-2-building-blocks/12-service-discovery-mesh.md)
14. [Blob and Object Storage: Storing the Big Stuff](content/part-2-building-blocks/13-blob-object-storage.md)
15. [Geospatial Indexing: Geohash, Quadtree, R-tree, S2, and H3](content/part-2-building-blocks/14-geospatial-indexing.md)
16. [Edge Computing (Cloudflare Workers, Lambda@Edge, Deno Deploy)](content/part-2-building-blocks/15-edge-computing.md)

### Part 3 — Distributed Systems Theory (11 chapters)

> **Audience:** SDE2+ preparing for Senior/Staff. If you haven't internalized linearizability vs serializability, read this.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~9 hours.

The theory that makes distributed systems *distributed*: consensus (Raft/Paxos), the full consistency spectrum, CAP/PACELC in 2025 framing, logical clocks, CRDTs, distributed transactions (2PC/Saga), exactly-once delivery, failure detection, consistent hashing, and Merkle-tree anti-entropy.

1. [Consensus Protocols: How Distributed Systems Agree](content/part-3-distributed-systems-theory/00-consensus-protocols.md)
2. [Consistency Deep Dive: Linearizability, Serializability, and the Spectrum Between](content/part-3-distributed-systems-theory/01-consistency-deep-dive.md)
3. [Quorums and Replication: The Math of R + W > N](content/part-3-distributed-systems-theory/02-quorums-and-replication.md)
4. [CAP and PACELC: The Tradeoff That Keeps Confusing People](content/part-3-distributed-systems-theory/03-cap-and-pacelc.md)
5. [Clocks and Ordering: Lamport, Vector, and Hybrid Logical Clocks](content/part-3-distributed-systems-theory/04-clocks-and-ordering.md)
6. [CRDTs: Conflict-Free Replicated Data Types](content/part-3-distributed-systems-theory/05-crdts.md)
7. [Distributed Transactions: 2PC, Saga, and When to Avoid Both](content/part-3-distributed-systems-theory/06-distributed-transactions.md)
8. [Idempotency and Exactly-Once: The Honest Truth About Delivery Guarantees](content/part-3-distributed-systems-theory/07-idempotency-exactly-once.md)
9. [Failure Detection: Deciding a Node Is Dead](content/part-3-distributed-systems-theory/08-failure-detection.md)
10. [Consistent Hashing: Keys to Nodes Without Global Reshuffles](content/part-3-distributed-systems-theory/09-consistent-hashing.md)
11. [Merkle Trees and Anti-Entropy: Keeping Replicas in Sync Cheaply](content/part-3-distributed-systems-theory/10-merkle-trees-anti-entropy.md)

### Part 4 — Data Systems (10 chapters)

> **Audience:** anyone who owns a data pipeline or picks a database.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~8 hours.

Every flavor of data system you might pick, and when each actually fits. Storage engines (B-tree vs LSM), OLTP vs OLAP, warehouses/lakes/lakehouses, streaming vs batch, CDC, search, time-series, graph, vector, and key-value.

1. [Storage Engines: B-Trees, LSM-Trees, and Why Your Database Feels the Way It Does](content/part-4-data-systems/00-storage-engines.md)
2. [OLTP vs OLAP: Row Stores, Column Stores, and Matching Shape to Workload](content/part-4-data-systems/01-oltp-vs-olap.md)
3. [Data Warehouses and Data Lakes: Structure, Schema, and the Lakehouse](content/part-4-data-systems/02-data-warehouses-lakes.md)
4. [Stream vs Batch Processing: Lambda, Kappa, and the End of That Debate](content/part-4-data-systems/03-stream-vs-batch.md)
5. [Change Data Capture: Streaming the Database's Inner Monologue](content/part-4-data-systems/04-change-data-capture.md)
6. [Search Systems: Inverted Indexes, BM25, and Running Elasticsearch in Production](content/part-4-data-systems/05-search-systems.md)
7. [Time-Series Databases: Metrics, Events, and Retention at Scale](content/part-4-data-systems/06-time-series-databases.md)
8. [Graph Databases: Property Graphs, Cypher, and When Joins Are the Problem](content/part-4-data-systems/07-graph-databases.md)
9. [Vector Databases: Embeddings, ANN Indexes, and the Retrieval Layer for AI](content/part-4-data-systems/08-vector-databases.md)
10. [Key-Value Stores: Redis, Memcached, DynamoDB, and Picking the Right Hash Table](content/part-4-data-systems/09-key-value-stores.md)

### Part 5 — Architecture Patterns (11 chapters)

> **Audience:** engineers making architecture-level decisions or leading service migrations.
> **Difficulty:** Intermediate. **Total reading time:** ~8 hours.

The architectural shapes you choose between when you design anything bigger than a single service: monolith vs microservices, event-driven, CQRS, event sourcing, serverless, BFF, strangler fig, hexagonal/clean, multi-region, multi-tenancy, CRDT-based apps.

1. [Monolith vs Microservices: Team Topology, Conway's Law, and the Distributed System Tax](content/part-5-architecture-patterns/00-monolith-vs-microservices.md)
2. [Event-Driven Architecture: Notifications, State Transfer, and Choreography](content/part-5-architecture-patterns/01-event-driven-architecture.md)
3. [CQRS: Separating Reads from Writes Without Losing Your Mind](content/part-5-architecture-patterns/02-cqrs.md)
4. [Event Sourcing: Events as the Source of Truth](content/part-5-architecture-patterns/03-event-sourcing.md)
5. [Serverless: Functions, Cold Starts, and When FaaS Actually Saves Money](content/part-5-architecture-patterns/04-serverless.md)
6. [Backend for Frontend: Per-Client API Aggregation Done Right](content/part-5-architecture-patterns/05-backend-for-frontend.md)
7. [Strangler Fig: Incremental Migration Without a Big Bang](content/part-5-architecture-patterns/06-strangler-fig.md)
8. [Hexagonal and Clean Architecture: Keeping Business Logic Independent](content/part-5-architecture-patterns/07-hexagonal-clean-architecture.md)
9. [Multi-Region Architecture: Active-Passive, Active-Active, and CRDTs](content/part-5-architecture-patterns/08-multi-region-architecture.md)
10. [Multi-Tenancy: Silo, Pool, and the SaaS Isolation Spectrum](content/part-5-architecture-patterns/09-multi-tenancy.md)
11. [CRDT Applications (Yjs, Automerge, Local-First Software)](content/part-5-architecture-patterns/10-crdt-applications.md)

### Part 6 — Reliability & Operations (11 chapters)

> **Audience:** anyone on-call, anyone who signs SLAs, anyone paying a cloud bill.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~8 hours.

The engineering that separates "it compiles" from "it runs reliably at 3 a.m. on a long weekend": observability, SLOs, resilience patterns, auto-scaling, deployments, chaos engineering, incident response, health checks, FinOps, platform engineering.

1. [Observability: Metrics, Logs, Traces, and the OpenTelemetry Standard](content/part-6-reliability-and-operations/00-observability.md)
2. [SLI, SLO, SLA, and Error Budgets: Making Reliability Quantitative](content/part-6-reliability-and-operations/01-sli-slo-sla-error-budgets.md)
3. [Resilience Patterns: Timeouts, Retries, Circuit Breakers, and Bulkheads](content/part-6-reliability-and-operations/02-resilience-patterns.md)
4. [Graceful Degradation: When Partial Service Beats No Service](content/part-6-reliability-and-operations/03-graceful-degradation.md)
5. [Auto-Scaling and Capacity Planning: From HPA to Predictive Scaling](content/part-6-reliability-and-operations/04-auto-scaling-capacity.md)
6. [Deployment Strategies: Blue-Green, Canary, Rolling, and Feature Flags](content/part-6-reliability-and-operations/05-deployment-strategies.md)
7. [Chaos Engineering: Breaking Things on Purpose](content/part-6-reliability-and-operations/06-chaos-engineering.md)
8. [Incident Management: From Detection to Blameless Postmortem](content/part-6-reliability-and-operations/07-incident-management.md)
9. [Health Checks and Readiness: Telling the Truth About Whether You're Up](content/part-6-reliability-and-operations/08-health-checks-readiness.md)
10. [Cost Optimization and FinOps](content/part-6-reliability-and-operations/09-cost-optimization-finops.md)
11. [Platform Engineering: IDPs, Golden Paths, and DX](content/part-6-reliability-and-operations/10-platform-engineering.md)

### Part 7 — Security at Scale (10 chapters)

> **Audience:** Senior/Staff engineers, platform teams, security-adjacent builders.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~7 hours.

Security architecture for real systems, not a CISSP crib sheet: AuthN vs AuthZ, OAuth2/OIDC, JWT (and why you probably shouldn't), mTLS, secrets management, DDoS/WAF, compliance (GDPR/DPDP/CCPA), software supply chain, privacy-preserving systems, post-quantum cryptography.

1. [Authentication vs Authorization: Identity, Permissions, and Access Models](content/part-7-security-at-scale/00-authn-authz.md)
2. [OAuth 2.0 and OpenID Connect: Delegated Authorization and Identity Done Right](content/part-7-security-at-scale/01-oauth2-oidc.md)
3. [JWT Deep Dive: Signed Tokens, Claims, and the Revocation Problem](content/part-7-security-at-scale/02-jwt-deep-dive.md)
4. [mTLS and Service-to-Service Authentication: SPIFFE, Service Mesh, and Zero Trust](content/part-7-security-at-scale/03-mtls-service-auth.md)
5. [Secrets Management: Vault, KMS, and the End of Secrets in Config Files](content/part-7-security-at-scale/04-secrets-management.md)
6. [DDoS Protection and WAFs: Mitigating Volumetric and Application Attacks](content/part-7-security-at-scale/05-ddos-waf.md)
7. [Data Residency and Compliance Architecture (GDPR, DPDP, CCPA, Right-to-Erasure)](content/part-7-security-at-scale/06-data-residency-compliance.md)
8. [Supply Chain Security: SBOM, SLSA, Sigstore, and Defending Against xz-utils](content/part-7-security-at-scale/07-supply-chain-security.md)
9. [Privacy-Preserving Systems (Differential Privacy, Federated Learning)](content/part-7-security-at-scale/08-privacy-preserving-systems.md)
10. [Post-Quantum Cryptography: Migrating to ML-KEM, ML-DSA, and a Crypto-Agile Future](content/part-7-security-at-scale/09-post-quantum-crypto.md)

### Part 8 — Case Studies (56 chapters)

> **Audience:** interview prep candidates, engineers building adjacent systems, anyone who learns best from worked examples.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~45 hours.

56 end-to-end system designs, each following a consistent structure: requirements (functional + non-functional), back-of-envelope numbers, high-level architecture, data model, deep-dive components, scalability and reliability considerations, and real-world references. Grouped thematically below for easier navigation.

<details>
<summary><strong>Core primitives (chapters 00-03)</strong> — the four designs you see in every interview</summary>

1. [Design a URL Shortener (TinyURL / bit.ly)](content/part-8-case-studies/00-url-shortener.md)
2. [Design a Pastebin (Paste Sharing Service)](content/part-8-case-studies/01-pastebin.md)
3. [Design a Distributed Rate Limiter](content/part-8-case-studies/02-rate-limiter.md)
4. [Design a Distributed Key-Value Store (Dynamo / Cassandra / Riak)](content/part-8-case-studies/03-key-value-store.md)

</details>

<details>
<summary><strong>Messaging & social (chapters 04-09)</strong> — notifications, chat, feeds, photos, crawlers, autocomplete</summary>

1. [Design a Notification System (Push, SMS, Email at Scale)](content/part-8-case-studies/04-notification-system.md)
2. [Design a Chat System (WhatsApp / Messenger / Signal)](content/part-8-case-studies/05-chat-system.md)
3. [Design a Social Media Feed (Twitter / Instagram / LinkedIn)](content/part-8-case-studies/06-social-media-feed.md)
4. [Design a Photo Sharing Service (Instagram)](content/part-8-case-studies/07-photo-sharing.md)
5. [Design a Web Crawler (Googlebot-style)](content/part-8-case-studies/08-web-crawler.md)
6. [Design Search Autocomplete (Typeahead Suggestions)](content/part-8-case-studies/09-search-autocomplete.md)

</details>

<details>
<summary><strong>Media & consumer products (chapters 10-17)</strong> — video, ride-hailing, maps, file sync, editing, cache, recommenders</strong></summary>

1. [Design a Video Streaming Service (YouTube / Twitch / TikTok)](content/part-8-case-studies/10-video-streaming.md)
2. [Design Netflix (End-to-End)](content/part-8-case-studies/11-netflix.md)
3. [Design a Ride-Hailing Service (Uber / Lyft)](content/part-8-case-studies/12-ride-hailing.md)
4. [Design Google Maps (Routing and Tile Rendering)](content/part-8-case-studies/13-google-maps.md)
5. [Design a File Sync Service (Dropbox / Google Drive)](content/part-8-case-studies/14-file-sync.md)
6. [Design Collaborative Editing (Google Docs / Figma / Notion)](content/part-8-case-studies/15-collaborative-editing.md)
7. [Design a Distributed Cache (Memcached / Redis Cluster)](content/part-8-case-studies/16-distributed-cache.md)
8. [Design a Recommendation System (Netflix / YouTube / TikTok)](content/part-8-case-studies/17-recommendation-system.md)

</details>

<details>
<summary><strong>Commerce & financial (chapters 18-21)</strong> — ticketing, payments, stock exchange, food delivery</summary>

1. [Design a Ticketing System (BookMyShow / Ticketmaster)](content/part-8-case-studies/18-ticketing-system.md)
2. [Design a Payment System (Stripe / PayPal)](content/part-8-case-studies/19-payment-system.md)
3. [Design a Stock Exchange (Matching Engine)](content/part-8-case-studies/20-stock-exchange.md)
4. [Design a Food Delivery Service (DoorDash / Swiggy)](content/part-8-case-studies/21-food-delivery.md)

</details>

<details>
<summary><strong>Data & infrastructure (chapters 22-29)</strong> — metrics, ad-click, logs, proximity, leaderboards, IDs, hotels, schedulers</summary>

1. [Design a Metrics Pipeline (Prometheus / InfluxDB / Thanos)](content/part-8-case-studies/22-metrics-pipeline.md)
2. [Design Ad-Click Aggregation (Real-Time Stream Processing)](content/part-8-case-studies/23-ad-click-aggregation.md)
3. [Design a Logging Platform (ELK / Loki / Splunk)](content/part-8-case-studies/24-logging-platform.md)
4. [Design a Proximity Service (Nearby Friends / Yelp)](content/part-8-case-studies/25-proximity-service.md)
5. [Design a Real-Time Leaderboard](content/part-8-case-studies/26-leaderboard.md)
6. [Design a Unique ID Generator (Snowflake, ULID, TSID, UUIDv7)](content/part-8-case-studies/27-unique-id-generator.md)
7. [Design a Hotel Reservation System (Booking.com / Airbnb)](content/part-8-case-studies/28-hotel-reservation.md)
8. [Design a Distributed Job Scheduler (Airflow / Temporal / Distributed Cron)](content/part-8-case-studies/29-job-scheduler.md)

</details>

<details>
<summary><strong>AI systems (chapters 30-37)</strong> — ChatGPT, RAG, coding agents, AI search, voice, moderation, semantic cache, model routing</summary>

1. [Design ChatGPT (Conversational AI at Scale)](content/part-8-case-studies/30-chatgpt-conversational-ai.md)
2. [Design an Enterprise RAG System](content/part-8-case-studies/31-enterprise-rag.md)
3. [Design a Coding Agent (Claude Code / GitHub Copilot / Cursor)](content/part-8-case-studies/32-coding-agent.md)
4. [Design Perplexity (AI Search with Citations)](content/part-8-case-studies/33-perplexity-ai-search.md)
5. [Design a Voice Agent (Alexa / Siri-Class Realtime)](content/part-8-case-studies/34-voice-agent.md)
6. [Design a Content Moderation System at Scale](content/part-8-case-studies/35-content-moderation-at-scale.md)
7. [Design a Semantic Cache for LLM Applications](content/part-8-case-studies/36-semantic-cache.md)
8. [Design a Model Router and Gateway (OpenRouter / LiteLLM)](content/part-8-case-studies/37-model-router-gateway.md)

</details>

<details>
<summary><strong>Infra services (chapters 38-39)</strong> — feature flags, DNS</summary>

1. [Design a Feature Flag Service (LaunchDarkly / Harness FME / Unleash)](content/part-8-case-studies/38-feature-flag-service.md)
2. [Design a DNS Service (Cloudflare 1.1.1.1 / Google 8.8.8.8)](content/part-8-case-studies/39-dns-service.md)

</details>

<details>
<summary><strong>Consumer products II (chapters 40-49)</strong> — dating, auctions, SaaS, video conf, email, live comments, fraud, fitness, online judge, price tracking</summary>

1. [Design a Dating App (Tinder / Hinge / Bumble)](content/part-8-case-studies/40-dating-app.md)
2. [Design an Online Auction (eBay / Catawiki)](content/part-8-case-studies/41-online-auction.md)
3. [Design a Multi-Tenant SaaS Platform](content/part-8-case-studies/42-multi-tenant-saas.md)
4. [Design a Video Conferencing System (Zoom / Google Meet)](content/part-8-case-studies/43-video-conferencing.md)
5. [Design an Email Service at Gmail Scale (1.8B Users, 300B Messages/Day)](content/part-8-case-studies/44-gmail-scale-email.md)
6. [Design Live Comments at Scale (FB Live / YouTube Live / Twitch Chat)](content/part-8-case-studies/45-live-comments.md)
7. [Design a Fraud Detection System (Stripe Radar / PayPal / Feedzai)](content/part-8-case-studies/46-fraud-detection.md)
8. [Design a Fitness Tracking Service (Strava / MapMyRun)](content/part-8-case-studies/47-strava-fitness.md)
9. [Design an Online Judge (LeetCode / Codeforces / HackerEarth)](content/part-8-case-studies/48-online-judge.md)
10. [Design a Price Tracking Service (CamelCamelCamel / Honey / Keepa)](content/part-8-case-studies/49-price-tracking.md)

</details>

<details>
<summary><strong>Developer & ops platforms (chapters 50-55)</strong> — API gateway, CI/CD, observability, search engine, brokerage, chat-at-scale</summary>

1. [Design an API Gateway at Scale (Kong / AWS API Gateway / Apigee / Envoy)](content/part-8-case-studies/50-api-gateway.md)
2. [Design a CI/CD Platform (GitHub Actions / GitLab CI / CircleCI)](content/part-8-case-studies/51-cicd-platform.md)
3. [Design an Observability Platform (Datadog / New Relic / Honeycomb)](content/part-8-case-studies/52-observability-platform.md)
4. [Design a Search Engine (Google-Scale / Brave Search)](content/part-8-case-studies/53-search-engine.md)
5. [Design a Brokerage Platform (Robinhood / E*TRADE / Interactive Brokers)](content/part-8-case-studies/54-brokerage-trading.md)
6. [Design Channel-Scale Chat (Discord / Slack)](content/part-8-case-studies/55-channel-scale-chat.md)

</details>

### Part 9 — AI & ML System Design (15 chapters)

> **Audience:** anyone building with or around LLMs, agents, or production ML.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~11 hours.

Modern AI-systems architecture, treated with the same rigor as Part 3: LLM serving, RAG, vector search, agent architectures, multi-agent orchestration, LLM evaluation, LLMOps, cost optimization, safety, ML fundamentals, feature stores, recommenders, real-time AI, multimodal, and the data infra underneath all of it.

1. [LLM Serving Architecture (vLLM, TGI, TensorRT-LLM)](content/part-9-ai-ml-system-design/00-llm-serving-architecture.md)
2. [RAG Pipelines (Retrieval-Augmented Generation)](content/part-9-ai-ml-system-design/01-rag-pipelines.md)
3. [Vector Search at Scale (HNSW, IVF-PQ, DiskANN)](content/part-9-ai-ml-system-design/02-vector-search-at-scale.md)
4. [AI Agent Architectures (ReAct, Reflection, Planning, Tool Use, Memory)](content/part-9-ai-ml-system-design/03-ai-agent-architectures.md)
5. [Multi-Agent Orchestration (LangGraph, OpenAI Agents SDK, AutoGen, Swarm)](content/part-9-ai-ml-system-design/04-multi-agent-orchestration.md)
6. [LLM Evaluation and Observability (Ragas, LangSmith, TruLens, LLM-as-Judge)](content/part-9-ai-ml-system-design/05-llm-evaluation-observability.md)
7. [LLMOps and Prompt Engineering (Versioning, Guardrails, Red-Teaming)](content/part-9-ai-ml-system-design/06-llmops-prompt-engineering.md)
8. [LLM Cost Optimisation (Semantic Cache, Model Routing, Cascading, Prompt Caching)](content/part-9-ai-ml-system-design/07-llm-cost-optimization.md)
9. [LLM Safety and Guardrails (OWASP LLM Top 10, Prompt Injection, PII, Jailbreaks)](content/part-9-ai-ml-system-design/08-llm-safety-guardrails.md)
10. [ML System Design Fundamentals](content/part-9-ai-ml-system-design/09-ml-system-design-fundamentals.md)
11. [Feature Stores and Model Serving (Feast, Tecton, KServe, BentoML, MLflow)](content/part-9-ai-ml-system-design/10-feature-stores-model-serving.md)
12. [Recommendation Systems Deep Dive (DLRM, Two-Tower, Embedding Retrieval, Cold Start)](content/part-9-ai-ml-system-design/11-recommendation-systems.md)
13. [Realtime AI and Voice Agents (Streaming Inference, WebRTC, LiveKit, Deepgram)](content/part-9-ai-ml-system-design/12-realtime-ai-voice-agents.md)
14. [Multimodal AI Systems (CLIP, Whisper, LayoutLM, Document AI)](content/part-9-ai-ml-system-design/13-multimodal-ai-systems.md)
15. [Data Infrastructure for AI (Embedding Pipelines, Chunking, Unstructured ETL, MCP)](content/part-9-ai-ml-system-design/14-data-infrastructure-for-ai.md)

### Part 10 — Emerging Patterns (1 chapter)

> **Audience:** Staff+ engineers and architects thinking past 2026.
> **Difficulty:** Intermediate-Advanced. **Total reading time:** ~45 minutes.

Forward-looking topics that are adjacent to everything else. Currently one chapter, with more planned (WebAssembly at the edge, unikernels, confidential computing, on-device AI).

1. [Green Computing (Carbon-Aware Scheduling, PUE, Sustainable Systems)](content/part-10-emerging-patterns/00-green-computing.md)

### Part 11 — Interview Framework (6 chapters)

> **Audience:** anyone preparing for or giving system-design interviews.
> **Difficulty:** Intermediate. **Total reading time:** ~4 hours.

How to run a 45-minute system-design interview, from both sides of the whiteboard. Compares RESHADED / PEDALS / ADEPT frameworks, teaches requirements scoping, diagramming, trade-off articulation, company-specific flavors, and RFC/design-doc authoring for Staff-level work.

1. [Interview Frameworks Compared (RESHADED, PEDALS, ADEPT)](content/part-11-interview-framework/00-frameworks-compared.md)
2. [Requirements Scoping: Functional, Non-Functional, and MoSCoW](content/part-11-interview-framework/01-requirements-scoping.md)
3. [Diagramming Skills for System Design Interviews](content/part-11-interview-framework/02-diagramming-skills.md)
4. [Trade-off Articulation: Saying 'It Depends' Well](content/part-11-interview-framework/03-trade-off-articulation.md)
5. [Company-Specific Interview Flavors (Amazon, Google, Meta, Netflix)](content/part-11-interview-framework/04-company-specific-flavors.md)
6. [Design Doc Authoring: RFCs, ADRs, and the Staff Engineer's Written Output](content/part-11-interview-framework/05-design-doc-authoring.md)

### Trade-offs Library (22 pages)

> **Audience:** everyone — these pages are referenced from every other part.
> **Difficulty:** Intermediate. **Total reading time:** ~8 hours.

The 22 most-asked architectural-choice questions, each answered in a dedicated decision-comparison page: flowchart, comparison table, "when to pick A" vs "when to pick B" sections, real-world examples, and citations.

1. [Strong vs Eventual Consistency](content/trade-offs/01-strong-vs-eventual-consistency.md)
2. [ACID vs BASE](content/trade-offs/02-acid-vs-base.md)
3. [SQL vs NoSQL](content/trade-offs/03-sql-vs-nosql.md)
4. [Latency vs Throughput](content/trade-offs/04-latency-vs-throughput.md)
5. [CAP and PACELC Applied](content/trade-offs/05-cap-and-pacelc.md)
6. [Cache Strategies: Cache-Aside vs Write-Through vs Write-Behind](content/trade-offs/06-cache-strategies.md)
7. [Batch vs Stream Processing](content/trade-offs/07-batch-vs-stream.md)
8. [Load Balancer vs Reverse Proxy vs API Gateway](content/trade-offs/08-load-balancer-vs-proxy-vs-gateway.md)
9. [REST vs gRPC vs GraphQL](content/trade-offs/09-rest-vs-grpc-vs-graphql.md)
10. [Polling vs Long-Polling vs SSE vs WebSockets vs Webhooks](content/trade-offs/10-polling-vs-websockets.md)
11. [Rate Limiting Algorithms: Token Bucket vs Sliding Window](content/trade-offs/11-rate-limiting-algorithms.md)
12. [Optimistic vs Pessimistic Concurrency Control](content/trade-offs/12-optimistic-vs-pessimistic-locking.md)
13. [Partitioning Schemes: Range, Hash, Consistent Hash, Directory](content/trade-offs/13-partitioning-schemes.md)
14. [B-tree vs LSM-tree Storage](content/trade-offs/14-btree-vs-lsm.md)
15. [Monolith vs Microservices](content/trade-offs/15-monolith-vs-microservices.md)
16. [Replication Topologies: Leader-Follower, Multi-Leader, Leaderless](content/trade-offs/16-replication-topologies.md)
17. [Distributed Transactions: 2PC vs Saga vs TCC](content/trade-offs/17-distributed-transactions.md)
18. [Push vs Pull (Fan-out, Messaging, Feed)](content/trade-offs/18-push-vs-pull.md)
19. [Lambda vs Kappa Architecture](content/trade-offs/19-lambda-vs-kappa.md)
20. [Vertical vs Horizontal Scaling](content/trade-offs/20-vertical-vs-horizontal-scaling.md)
21. [Normalization vs Denormalization](content/trade-offs/21-normalization-vs-denormalization.md)
22. [Single-Region vs Multi-Region Deployment](content/trade-offs/22-single-vs-multi-region.md)

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
| **5** | Case studies (your target)  | Pick 5 more from Part 8 relevant to your target company (see [Company-Specific Flavors](content/part-11-interview-framework/04-company-specific-flavors.md)) |
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
| 4    | ML fundamentals      | [Part 9](#part-9--ai--ml-system-design-15-chapters) chapters 9-14 + [Recommendation System case study](content/part-8-case-studies/17-recommendation-system.md) |

### Interview-triage track (one weekend)

If you have a loop on Monday:

- Saturday morning: [How to Approach a System Design Question](content/part-1-core-fundamentals/05-how-to-approach-design-questions.md) + [Back-of-the-Envelope Estimation](content/part-1-core-fundamentals/04-back-of-envelope-estimation.md) + [Requirements Scoping](content/part-11-interview-framework/01-requirements-scoping.md) + [Diagramming Skills](content/part-11-interview-framework/02-diagramming-skills.md)
- Saturday afternoon: 3 case studies in your domain
- Sunday morning: 3 more case studies + [Trade-off Articulation](content/part-11-interview-framework/03-trade-off-articulation.md)
- Sunday evening: [Company-Specific Interview Flavors](content/part-11-interview-framework/04-company-specific-flavors.md) for your target

---

## Project statistics

| Metric                              | Count         |
| ----------------------------------- | ------------- |
| Parts                               | 12 + Trade-offs Library |
| Teaching chapters                   | 159           |
| Trade-off decision pages            | 22            |
| **Total pages**                     | **181**       |
| Total words                         | **~772,000**  |
| Average words per chapter           | ~4,265        |
| Mermaid diagrams                    | **719**       |
| Citations to primary sources        | **3,100+**    |
| Estimated total reading time        | ~110 hours    |
| Equivalent printed book page count  | ~2,200 pages  |

For comparison: *Designing Data-Intensive Applications* is ~600 pages; Alex Xu's *System Design Interview* Vol. 1 is ~300 pages, Vol. 2 is ~340 pages; *Site Reliability Engineering* is ~550 pages. This handbook is longer than any three of them combined.

## Quality standards

Every chapter in this repository passes 7 automated CI checks on every PR:

1. **[markdownlint](https://github.com/DavidAnson/markdownlint)** — Markdown style and structure conformance.
2. **[typos](https://github.com/crate-ci/typos)** — source-code spell-check with a project-specific allowlist for technical terms.
3. **Citation integrity** — every `[^1]`-style footnote has a corresponding `[^1]: source` definition; every citation is a real URL; no orphan citations.
4. **Frontmatter validation** — every chapter declares `title`, `difficulty`, `prerequisites`, `date_created`, `date_updated`, `reading_time_minutes`, `tags` (from a canonical taxonomy), and `technologies` (from a curated allowlist).
5. **Mermaid diagram validation** — all 719 diagrams must parse with `@mermaid-js/mermaid-cli` on CI so broken syntax doesn't ship.
6. **[Vale](https://vale.sh/)** — prose-style linter for voice, passive voice, weasel words, and banned phrases. Custom rules in `.vale.ini`.
7. **[lychee](https://github.com/lycheeverse/lychee)** — external link checker run weekly; flags rotted URLs so citations stay valid.

CI configuration lives in [`.github/workflows/content-ci.yml`](.github/workflows/content-ci.yml). Validator scripts are in [`scripts/`](scripts/).

Beyond automation, every chapter is reviewed for:

- Internal consistency (terminology matches Part 1 definitions)
- Difficulty calibration (a "Beginner" chapter doesn't assume Staff-level context)
- Diagram quality (Mermaid, not screenshots; captioned; accessibility-tagged)
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

- **Security issues in validator scripts or CI:** open a [private security advisory](https://github.com/handbook-academy/hld-handbook/security/advisories/new).
- **Code of conduct concerns:** email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Legal or licensing questions:** email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Direct contact:** [@invincible04](https://github.com/invincible04).

---

## Project structure

```text
hld-handbook/
├── content/                           # All 181 teaching pages (CC BY-SA 4.0)
│   ├── part-0-prerequisites/          # 5 chapters
│   ├── part-1-core-fundamentals/      # 7 chapters
│   ├── part-2-building-blocks/        # 16 chapters
│   ├── part-3-distributed-systems-theory/  # 11 chapters
│   ├── part-4-data-systems/           # 10 chapters
│   ├── part-5-architecture-patterns/  # 11 chapters
│   ├── part-6-reliability-and-operations/  # 11 chapters
│   ├── part-7-security-at-scale/      # 10 chapters
│   ├── part-8-case-studies/           # 56 chapters
│   ├── part-9-ai-ml-system-design/    # 15 chapters
│   ├── part-10-emerging-patterns/     # 1 chapter
│   ├── part-11-interview-framework/   # 6 chapters
│   └── trade-offs/                    # 22 decision pages
│
├── writing-guides/                    # Author handbooks (CC BY-SA 4.0)
│   ├── case-study-template.md         # Skeleton for Part 8 case studies
│   └── trade-off-template.md          # Skeleton for trade-off decision pages
│
├── scripts/                           # Content validators used by CI
│   ├── check-citations.js             # Footnote integrity
│   ├── check-frontmatter.js           # YAML frontmatter schema
│   ├── check-mermaid.js               # Mermaid syntax validator
│   ├── technologies.json              # Curated technology name taxonomy
│   └── content-stats.js               # Word / diagram / citation counts
│
├── .github/
│   ├── workflows/
│   │   ├── content-ci.yml             # 8-job PR validation pipeline
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
git clone https://github.com/handbook-academy/hld-handbook.git
cd hld-handbook
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

### Editor setup

Any Markdown-aware editor works. Recommended extensions for VS Code:

- `yzhang.markdown-all-in-one` — Markdown editing and preview
- `bierner.markdown-mermaid` — Mermaid diagram preview
- `davidanson.vscode-markdownlint` — inline markdownlint warnings
- `chrischinchilla.vale-vscode` — Vale prose linter
- `tekumara.typos-vscode` — typos spell-check

The repo includes `.editorconfig`, `.nvmrc`, `.markdownlint.json`, `.vale.ini`, and `.typos.toml` so your editor picks up project settings automatically.

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

Yes, and specifically: everything in this repository — content, writing guides, style guide, validator scripts — is released under **CC BY-SA 4.0**. Anyone (including us) can share and adapt it, but adaptations must carry the same license. That means the chapter text cannot be paywalled by anybody — not by us, not by a future company, not by anyone who forks this repo. You can always read it free at [hld.handbook.academy](https://hld.handbook.academy).
</details>

<details>
<summary><strong>Can I use this to build a paid course?</strong></summary>

Yes. CC BY-SA 4.0 allows commercial use provided you:

1. Attribute the original ("Adapted from The HLD Handbook, CC BY-SA 4.0, https://github.com/handbook-academy/hld-handbook")
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

`system-design-primer` is a link-dump README that points at scattered blog posts and talks. It's great as a discovery tool. This handbook is inline content — every topic is taught fully within this repo. They're complementary: `system-design-primer` for breadth of resources, this handbook for depth of teaching.
</details>

<details>
<summary><strong>How is this different from Alex Xu's books?</strong></summary>

Alex Xu's books are excellent and we cite them in nearly every case study. The differences:

- **Scope:** ~640 pages (Vols 1+2) vs ~2,200 equivalent pages here.
- **Freshness:** Xu Vol. 2 was published in 2022 and doesn't cover LLMs, RAG, agents, CRDTs, post-quantum crypto, MCP, etc. This handbook does.
- **Format:** Xu is case-study-focused. This handbook has 56 case studies *plus* 103 foundational chapters that teach the building blocks.
- **License:** Xu's books are copyrighted and paid. This handbook is CC BY-SA 4.0.
- **Community:** Xu's books are one-author; this handbook accepts PRs.

</details>

<details>
<summary><strong>Is this the same as the website at hld.handbook.academy?</strong></summary>

The **content** is identical. The website at [hld.handbook.academy](https://hld.handbook.academy) adds a polished reading UI: full-text search across all 181 pages, dark mode, syntax-highlighted code blocks, per-chapter diagram zoom, social cards, OG images, and fast client-side navigation. Same content, better reading experience — and still free, with no sign-up.
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

Everything in this repository — the 181 chapters, writing guides, style guide, validator scripts, templates, and configuration — is licensed under **[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](LICENSE)**.

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

Nobody can paywall the chapter text itself under CC BY-SA 4.0. You can build anything on top of it, as long as the text itself stays open. Read the handbook free at **[hld.handbook.academy](https://hld.handbook.academy)** — no sign-up, no paywall, ever.

---

## Citation

If you reference this project in academic work, blog posts, books, or courses:

### BibTeX

```bibtex
@misc{hld-handbook,
  author       = {Soni, Aayush},
  title        = {The HLD Handbook: Open-Source High-Level Design Curriculum},
  year         = {2026},
  publisher    = {GitHub},
  url          = {https://github.com/handbook-academy/hld-handbook},
  note         = {159 chapters + 22 trade-off pages, 772K words, CC BY-SA 4.0}
}
```

### Prose

> *"The HLD Handbook" by Aayush Soni, https://github.com/handbook-academy/hld-handbook, CC BY-SA 4.0.*

### Machine-readable

The [`CITATION.cff`](CITATION.cff) file in this repository is a [Citation File Format](https://citation-file-format.github.io/) descriptor. GitHub's "Cite this repository" button, Zenodo, Zotero, and academic reference managers can parse it directly.

---

## Acknowledgments

This project stands on the shoulders of many, and we cite primary sources liberally throughout. A few that shaped the handbook most:

**Canonical books:**

- **Martin Kleppmann** — [Designing Data-Intensive Applications](https://dataintensive.net/) is the foundation underneath most of Parts 3-4.
- **Alex Xu** — [System Design Interview](https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF) Volumes 1 and 2 defined the interview case-study format we build on in Part 8.
- **Chip Huyen** — [Designing Machine Learning Systems](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) and [AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) shape Part 9.
- **Betsy Beyer et al. (Google)** — [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/) and [The SRE Workbook](https://sre.google/workbook/table-of-contents/) are behind Part 6.
- **Mark Richards & Neal Ford** — [Fundamentals of Software Architecture](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/) and [Software Architecture: The Hard Parts](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/) for Part 5.

**Open-source references:**

- **Donne Martin** — [system-design-primer](https://github.com/donnemartin/system-design-primer).
- **The Kubernetes, CNCF, and OpenTelemetry communities** — for cloud-native and observability standards.
- **The Apache projects** (Kafka, Cassandra, Hadoop, Spark, Flink) — for foundational distributed-systems code and docs.

**Papers, RFCs, and postmortems:**

- **SIGMOD / VLDB / OSDI / SOSP / NSDI** papers — the bedrock of distributed systems.
- **IETF / W3C / IANA** — for networking and web standards.
- **Every engineer who has written a public postmortem.** Real outages taught us everything about graceful degradation, blast radius, and the limits of testing.

We teach the same concepts in our own words, with our own diagrams, and we cite the originals.

---

## Community

- **[GitHub Discussions](https://github.com/handbook-academy/hld-handbook/discussions)** — design questions, feedback, sharing what you're building.
- **[GitHub Issues](https://github.com/handbook-academy/hld-handbook/issues)** — corrections, content requests, chapter proposals.
- **Email** — [hello@handbook.academy](mailto:hello@handbook.academy) for private or sensitive matters.
- **Maintainer** — [@invincible04](https://github.com/invincible04).

### Star history

If you find this useful, star the repo. Stars help signal to new contributors that the project is worth their time.

[![Star History Chart](https://api.star-history.com/svg?repos=handbook-academy/hld-handbook&type=Date)](https://star-history.com/#handbook-academy/hld-handbook&Date)

---

<div align="center">

### Start reading

**[Networking Fundamentals](content/part-0-prerequisites/00-networking-fundamentals.md)** · **[Scalability](content/part-1-core-fundamentals/00-scalability.md)** · **[URL Shortener Case Study](content/part-8-case-studies/00-url-shortener.md)** · **[Trade-offs Library](content/trade-offs/)**

Or skim **[the full curriculum above](#the-full-curriculum)**.

</div>

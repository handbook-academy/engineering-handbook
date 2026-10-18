<div align="center">

<img src="logo.svg" alt="Handbook Academy" width="140" />

# The Engineering Handbook

**Free, open-source engineering books for people who build software.**<br/>
System design, data structures and algorithms, and AI engineering, each taught in full and free to read forever.

[![License: CC BY-SA 4.0](https://img.shields.io/badge/license-CC%20BY--SA%204.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI](https://github.com/handbook-academy/engineering-handbook/actions/workflows/content-ci.yml/badge.svg)](https://github.com/handbook-academy/engineering-handbook/actions)
[![GitHub stars](https://img.shields.io/github/stars/handbook-academy/engineering-handbook?style=social)](https://github.com/handbook-academy/engineering-handbook/stargazers)

**[Read online at handbook.academy](https://handbook.academy)**

[HLD Handbook](#the-hld-handbook) · [DSA Handbook](#the-dsa-handbook) · [AI Engineering Handbook](#the-ai-engineering-handbook) · [Where to start](#where-to-start) · [Study plans](#study-plans) · [Contributing](#contributing) · [FAQ](#faq)

</div>

---

## Table of contents

- [About this project](#about-this-project)
- [The three handbooks](#the-three-handbooks)
- [Read online](#read-online)
- [Who it's for](#who-its-for)
- [Where to start](#where-to-start)
- [The HLD Handbook](#the-hld-handbook)
  - [Parts at a glance](#hld-parts-at-a-glance)
  - [Trade-offs Library](#trade-offs-library)
- [The DSA Handbook](#the-dsa-handbook)
  - [Parts at a glance](#dsa-parts-at-a-glance)
  - [Pattern decision pages](#pattern-decision-pages)
  - [Long-form editorials](#long-form-editorials)
  - [Interactive widget specs](#interactive-widget-specs)
- [The AI Engineering Handbook](#the-ai-engineering-handbook)
  - [Parts at a glance](#ai-engineering-parts-at-a-glance)
- [Study plans](#study-plans)
- [How the books are written](#how-the-books-are-written)
- [Contributing](#contributing)
- [Repository structure](#repository-structure)
- [Development setup](#development-setup)
- [FAQ](#faq)
- [License](#license)
- [Citation](#citation)
- [Acknowledgments](#acknowledgments)
- [Community](#community)

---

## About this project

The Engineering Handbook is a set of free textbooks for software engineers. Each book is a complete course: every topic is taught on the page, from first principles to the mistakes teams make in production. You won't find outlines, link lists, or "read this elsewhere" here.

The books live in this repository as plain Markdown. They render on GitHub with every diagram, figure and footnote intact, and the same text powers the websites at [handbook.academy](https://handbook.academy). Everything is licensed [CC BY-SA 4.0](LICENSE), so the text stays free to read, share and adapt.

What makes the books different:

- **Taught in full.** Each chapter explains the idea, shows it in diagrams and worked examples, compares the alternatives, and ends with what to watch for in production.
- **Opinionated.** Chapters recommend an approach and explain why. When reasonable people disagree, the trade-offs are spelled out so you can decide.
- **Sourced.** Claims are backed by footnoted primary sources: papers, RFCs, official documentation and engineering postmortems.
- **Current.** The books cover today's stack: LLM serving, RAG, agents, MCP, CRDTs, edge computing, FinOps and post-quantum cryptography. Every chapter records when it was last updated.
- **Open.** Anyone can suggest a fix, and every change goes through review.

## The three handbooks

| Handbook | What you'll learn | Best for | Read |
|---|---|---|---|
| **[HLD Handbook](#the-hld-handbook)** | How to design large software systems: networking and storage, distributed systems theory, architecture, reliability, security, end-to-end case studies, and AI system design. | System design interviews, and engineers who design or operate backend systems. | [Chapters](#hld-parts-at-a-glance) · [Website](https://hld.handbook.academy) |
| **[DSA Handbook](#the-dsa-handbook)** | Data structures and algorithms organized by pattern, with LeetCode problems solved in Python, Java, C++ and Go. | Coding interviews, competitive programming, and sharpening problem-solving. | [Chapters](#dsa-parts-at-a-glance) · [Website](https://dsa.handbook.academy) *(beta)* |
| **[AI Engineering Handbook](#the-ai-engineering-handbook)** | How to build and run production AI products on top of model APIs: prompts, evals, context, retrieval, agents, observability, security, cost and product. | Software engineers shipping AI features. No model training required. | [Chapters](#ai-engineering-parts-at-a-glance) · [Website](https://ai-eng.handbook.academy) |

## Read online

Each book has its own website with search, dark mode, diagram zoom and fast navigation. All of them are free, with no sign-up.

| Site | Address | What's there |
|---|---|---|
| **Home** | [handbook.academy](https://handbook.academy) | Pick a book |
| **HLD Handbook** | [hld.handbook.academy](https://hld.handbook.academy) | The full system design curriculum |
| **DSA Handbook** | [dsa.handbook.academy](https://dsa.handbook.academy) | The full DSA curriculum, with interactive widgets |
| **AI Engineering Handbook** | [ai-eng.handbook.academy](https://ai-eng.handbook.academy) | The full AI engineering curriculum, plus a frameworks reference page |

Prefer GitHub? Every chapter link in this README opens the source file, and Mermaid diagrams render right in the browser.

## Who it's for

- **Engineers preparing for interviews.** DSA for the coding rounds, HLD for system design, and both books' interview framework parts for the round itself.
- **Engineers moving up a level.** HLD's distributed systems, reliability and security parts are what separate Senior from Staff designs.
- **Engineers building AI features.** The AI Engineering Handbook covers making an LLM feature reliable, measurable, secure and affordable.
- **Self-taught engineers.** HLD's Prerequisites and DSA's Foundations cover the computer science a degree would have given you.
- **Career switchers** moving from frontend to backend, backend to infrastructure, or software to AI, who need system-level intuition fast.
- **Teachers and course creators** who want a full curriculum to build on. The license allows it.

**Not the right fit:** if you've never programmed, start with [CS50](https://cs50.harvard.edu/) or [The Odin Project](https://www.theodinproject.com/) and come back. The books also teach concepts that apply across languages rather than any one language's syntax.

## Where to start

| I want to… | Start here |
|---|---|
| Get a quick taste of system design | [Scalability](content/hld/part-1-core-fundamentals/00-scalability.md) → [Back-of-the-envelope estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md) → [Design a URL shortener](content/hld/part-8-case-studies/00-url-shortener.md) |
| Prepare for a system design interview | [How to approach a design question](content/hld/part-1-core-fundamentals/05-how-to-approach-design-questions.md), then the [interview prep plan](#interview-prep-sde1-to-sde2) |
| Refresh my distributed systems foundations | [HLD Part 3 — Distributed Systems Theory](#part-3--distributed-systems-theory) |
| Get better at coding interviews | [Arrays](content/dsa/part-1-linear-data-structures/00-arrays.md) → [Two pointers](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md) → [Sliding window](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md) |
| Choose between two approaches | The [Trade-offs Library](#trade-offs-library) for design, the [pattern decision pages](#pattern-decision-pages) for algorithms |
| Build an AI feature that holds up | [What an AI engineer is](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md) → [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md) → [Why you can't ship without evals](content/ai-eng/part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md) |
| Design AI systems at scale | [HLD Part 9 — AI & ML System Design](#part-9--ai--ml-system-design) and the [AI systems case studies](#ai-systems) |
| Follow a plan with a deadline | [Study plans](#study-plans), from one weekend to the full curriculum |

---

## The HLD Handbook

**How to design large software systems, from the network up to LLM serving.**

[Website](https://hld.handbook.academy) · [`content/hld/`](content/hld/) · [Style guide](STYLE_GUIDE.md)

The HLD Handbook starts with the prerequisites (networking, operating systems, databases, API design) and builds up through the building blocks, distributed systems theory, data systems and architecture patterns. It then covers what it takes to run systems for real: reliability, operations and security. The case studies put it all together in end-to-end designs, and the last parts cover AI system design and how to handle the interview.

**How a chapter is built.** Each teaching chapter follows the same path: an introduction, the idea from first principles, diagrams, a worked example, the trade-offs, production gotchas, and references. Case studies follow the interview shape instead: requirements, estimates, API, data model, architecture, deep dives, and scaling.

### HLD parts at a glance

Click a part to see every chapter in it.

| Part | What it covers | Level |
|---|---|---|
| [0](#part-0--prerequisites) | **Prerequisites** — networking, OS, data structures, databases, API design | Beginner |
| [1](#part-1--core-fundamentals) | **Core Fundamentals** — scalability, latency, availability, consistency, estimation, trade-off thinking | Beginner to intermediate |
| [2](#part-2--building-blocks) | **Building Blocks** — load balancers, caches, queues, CDNs, databases, sharding, pub/sub, rate limiting, blob storage, geo, edge | Intermediate to advanced |
| [3](#part-3--distributed-systems-theory) | **Distributed Systems Theory** — consensus, consistency, clocks, CRDTs, transactions | Intermediate to advanced |
| [4](#part-4--data-systems) | **Data Systems** — storage engines, OLTP/OLAP, warehouses/lakes, streams, search, time-series, graph, vector, KV | Intermediate to advanced |
| [5](#part-5--architecture-patterns) | **Architecture Patterns** — monolith vs micro, event-driven, CQRS, ES, serverless, BFF, strangler, hex, multi-region, multi-tenant, CRDT apps | Intermediate to advanced |
| [6](#part-6--reliability--operations) | **Reliability & Operations** — observability, SLOs, resilience, scaling, deploys, chaos, incidents, FinOps, platform | Intermediate to advanced |
| [7](#part-7--security-at-scale) | **Security at Scale** — AuthN/Z, OAuth/OIDC, JWT, mTLS, secrets, DDoS/WAF, compliance, supply chain, privacy, PQC | Intermediate to advanced |
| [8](#part-8--case-studies) | **Case Studies** — end-to-end designs, grouped by theme; the centerpiece of interview prep | Intermediate to advanced |
| [9](#part-9--ai--ml-system-design) | **AI & ML System Design** — LLM serving, RAG, vector search, agents, LLMOps, safety, recommenders, multimodal | Intermediate to advanced |
| [10](#part-10--emerging-patterns) | **Emerging Patterns** — green/sustainable computing; growing list of forward-looking topics | Intermediate |
| [11](#part-11--interview-framework) | **Interview Framework** — RESHADED/PEDALS/ADEPT, requirements, diagrams, trade-offs, company flavors, RFCs | Intermediate to advanced |

<details>
<summary><strong>Part 0 — Prerequisites</strong> — networking, OS, data structures, databases, API design</summary>

### Part 0 — Prerequisites

> **Who it's for:** engineers without a CS degree, or anyone who wants to confirm their foundations before moving on.  
> **Level:** Beginner

Foundational topics that the rest of the handbook assumes. If you can explain TCP's three-way handshake, the difference between a process and a thread, a B-tree's internal structure, and why idempotent PUT is better than non-idempotent POST for a retry-prone endpoint — you can skip this part.

- [Networking Fundamentals for System Design](content/hld/part-0-prerequisites/00-networking-fundamentals.md) — A practical tour of OSI layers, TCP/UDP, HTTP/1.1 through HTTP/3, DNS, TLS 1.3, and realtime transports like WebSockets and SSE.
- [Operating System Essentials for System Design](content/hld/part-0-prerequisites/01-os-essentials.md) — Processes, threads, memory hierarchy with real latency numbers, I/O models (epoll, kqueue, io_uring), and file system internals you need to design systems.
- [Data Structures for Distributed Systems](content/hld/part-0-prerequisites/02-data-structures-for-systems.md) — The handful of data structures that power modern infrastructure: hash tables, B-trees, LSM-trees, Bloom filters, skip lists, and consistent hashing rings.
- [Database Fundamentals for System Design](content/hld/part-0-prerequisites/03-database-fundamentals.md) — SQL, ACID, indexing, query execution, and the normalization vs denormalization debate, covered at the depth you need to design real systems.
- [API Design Basics: REST, GraphQL, gRPC, and the Hard Parts](content/hld/part-0-prerequisites/04-api-design-basics.md) — Resource modeling, GraphQL's N+1 problem, gRPC streaming, versioning strategies, idempotency keys, and cursor pagination done right.

</details>

<details>
<summary><strong>Part 1 — Core Fundamentals</strong> — scalability, latency, availability, consistency, estimation, trade-off thinking</summary>

### Part 1 — Core Fundamentals

> **Who it's for:** everybody — read this part even if you know the topic, because the vocabulary here is used for the rest of the book.  
> **Level:** Beginner to intermediate

The vocabulary and the reasoning habits that every later chapter assumes. "Scalability," "consistency," "trade-off," and "back-of-envelope" get defined here rigorously so they mean something specific when we use them later.

- [Scalability: Growing a System Without Breaking It](content/hld/part-1-core-fundamentals/00-scalability.md) — Vertical vs horizontal scaling, stateless services, read vs write scaling, and when scaling is the wrong answer. The vocabulary every system design conversation uses.
- [Latency and Throughput: The Two Numbers That Matter](content/hld/part-1-core-fundamentals/01-latency-and-throughput.md) — Latency vs throughput, Jeff Dean's numbers, tail latency (p50/p95/p99), Little's Law, and how to find the real bottleneck in any system.
- [Availability and Reliability: Nines, SLOs, and Staying Up](content/hld/part-1-core-fundamentals/02-availability-and-reliability.md) — Availability math, MTBF/MTTR, redundancy patterns, SLI/SLO/SLA, error budgets, dependency math, and real-world outage lessons.
- [Consistency Models: What Readers Actually See](content/hld/part-1-core-fundamentals/03-consistency-models.md) — Strong, eventual, and causal consistency. Read-your-writes, monotonic reads, and the client-centric vs data-centric distinction that makes consistency tractable.
- [Back-of-the-Envelope Estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md) — Powers of 2 and 10, storage and bandwidth templates, QPS math, and worked examples for Twitter and YouTube scale. The interview skill that matters in production too.
- [How to Approach a System Design Question](content/hld/part-1-core-fundamentals/05-how-to-approach-design-questions.md) — A repeatable 6-step framework for 45-minute system design interviews: clarify, estimate, API, high-level design, deep dive, trade-offs. Minute-by-minute plan with company-specific flavors.
- [Trade-off Thinking](content/hld/part-1-core-fundamentals/06-trade-off-thinking.md) — Every design decision is a trade-off. How to articulate, structure, and defend your choices, and how to recognize when not choosing is the right move.

</details>

<details>
<summary><strong>Part 2 — Building Blocks</strong> — load balancers, caches, queues, CDNs, databases, sharding, pub/sub, rate limiting, blob storage, geo, edge</summary>

### Part 2 — Building Blocks

> **Who it's for:** anyone who'll assemble backend systems. This part is the Lego brick inventory.  
> **Level:** Intermediate to advanced

Deep dives on the pieces you assemble to build real systems: load balancers, caches, queues, CDNs, databases (SQL and NoSQL), partitioning, replication, pub/sub, rate limiters, service discovery, blob storage, geospatial indexes, and edge compute.

- [Load Balancers: Spreading Traffic, Absorbing Failure](content/hld/part-2-building-blocks/00-load-balancers.md) — L4 vs L7 load balancing, algorithms, health checks, and how Envoy, HAProxy, NGINX, and AWS ALB/NLB actually work in production.
- [Reverse Proxies and API Gateways: The Smart Edge](content/hld/part-2-building-blocks/01-reverse-proxies-api-gateways.md) — TLS termination, routing, auth, rate limiting, and why an API gateway is more than a smarter load balancer.
- [Content Delivery Networks: Moving Bytes Closer to Users](content/hld/part-2-building-blocks/02-cdns.md) — How CDNs work, edge caching, cache keys and invalidation, and how Cloudflare, Akamai, and Fastly differ in practice.
- [Caching: From Browser to Database](content/hld/part-2-building-blocks/03-caching.md) — Cache hierarchy, five write patterns, eviction policies (LRU/TinyLFU), stampede prevention, and why invalidation is the hardest problem in distributed systems.
- [SQL Databases: The Boring Technology That Wins](content/hld/part-2-building-blocks/04-sql-databases.md) — B-trees, MVCC, isolation levels, indexing, and why PostgreSQL and MySQL are still the right answer for most systems.
- [NoSQL Databases: Picking the Right Non-Relational Tool](content/hld/part-2-building-blocks/05-nosql-databases.md) — Key-value, document, wide-column, and graph stores, and how DynamoDB, Cassandra, MongoDB, and Neo4j differ in practice.
- [Database Partitioning and Sharding: When One Node Is Not Enough](content/hld/part-2-building-blocks/06-database-partitioning-sharding.md) — Range, hash, and consistent-hash partitioning, hot spots, resharding, and how Notion, Figma, and Discord partition data in practice.
- [Database Replication: Keeping Copies in Sync](content/hld/part-2-building-blocks/07-database-replication.md) — Leader-follower, multi-leader, and leaderless replication, sync vs async, failover, and how Postgres, MySQL, Cassandra, and DynamoDB differ.
- [Message Queues and Streaming: Decoupling at Scale](content/hld/part-2-building-blocks/08-message-queues-streaming.md) — Queues vs logs, Kafka vs RabbitMQ vs SQS, delivery semantics, partitioning, consumer groups, and when streaming beats request-response.
- [Pub/Sub: Fan-Out and Event-Driven Systems](content/hld/part-2-building-blocks/09-pub-sub.md) — Topics, subscriptions, fan-out strategies, and how Google Pub/Sub, Redis, NATS, and SNS+SQS implement publish/subscribe at scale.
- [Real-Time Communication: WebSockets, SSE, and Long Polling](content/hld/part-2-building-blocks/10-real-time-communication.md) — Long polling, Server-Sent Events, WebSockets, WebRTC, and MQTT: when to use each, how to scale persistent connections, and production lessons from Discord and Slack.
- [Rate Limiting: Protecting Systems from Themselves](content/hld/part-2-building-blocks/11-rate-limiting.md) — Token bucket, leaky bucket, fixed and sliding windows, distributed rate limiting, and how Stripe, Cloudflare, and GitHub protect their APIs.
- [Service Discovery and Service Mesh: Finding and Talking to Services](content/hld/part-2-building-blocks/12-service-discovery-mesh.md) — DNS, client-side and server-side discovery, health checks, sidecars, mTLS, and what Consul, Envoy, Istio, and Linkerd actually solve.
- [Blob and Object Storage: Storing the Big Stuff](content/hld/part-2-building-blocks/13-blob-object-storage.md) — S3 semantics, object storage internals, multipart uploads, lifecycle policies, and when to pick S3 vs GCS vs MinIO vs a filesystem.
- [Geospatial Indexing: Geohash, Quadtree, R-tree, S2, and H3](content/hld/part-2-building-blocks/14-geospatial-indexing.md) — Space-filling curves, hierarchical grids, and tree indexes for location queries - with decision guidance on geohash vs quadtree vs R-tree vs S2 vs H3.
- [Edge Computing (Cloudflare Workers, Lambda@Edge, Deno Deploy)](content/hld/part-2-building-blocks/15-edge-computing.md) — Design applications for the edge: cold starts, state replication with Durable Objects, edge databases, and the limits of running code close to users.

</details>

<details>
<summary><strong>Part 3 — Distributed Systems Theory</strong> — consensus, consistency, clocks, CRDTs, transactions</summary>

### Part 3 — Distributed Systems Theory

> **Who it's for:** SDE2+ preparing for Senior/Staff. If you haven't internalized linearizability vs serializability, read this.  
> **Level:** Intermediate to advanced

The theory that makes distributed systems *distributed*: consensus (Raft/Paxos), the full consistency spectrum, CAP/PACELC in 2025 framing, logical clocks, CRDTs, distributed transactions (2PC/Saga), exactly-once delivery, failure detection, consistent hashing, and Merkle-tree anti-entropy.

- [Consensus Protocols: How Distributed Systems Agree](content/hld/part-3-distributed-systems-theory/00-consensus-protocols.md) — Raft and Multi-Paxos explained: leader election, log replication, safety under term numbers, and why etcd, Consul, and CockroachDB picked Raft.
- [Consistency Deep Dive: Linearizability, Serializability, and the Spectrum Between](content/hld/part-3-distributed-systems-theory/01-consistency-deep-dive.md) — Linearizability vs serializability vs causal vs eventual, external consistency, and how to reason precisely about what your database actually gives you.
- [Quorums and Replication: The Math of R + W > N](content/hld/part-3-distributed-systems-theory/02-quorums-and-replication.md) — Read and write quorums, Dynamo-style replication, sloppy quorums, hinted handoff, and when quorums give you linearizability (and when they do not).
- [CAP and PACELC: The Tradeoff That Keeps Confusing People](content/hld/part-3-distributed-systems-theory/03-cap-and-pacelc.md) — What CAP actually says (and what it doesn't), the three big misconceptions, and how PACELC fixes the omission of latency.
- [Clocks and Ordering: Lamport, Vector, and Hybrid Logical Clocks](content/hld/part-3-distributed-systems-theory/04-clocks-and-ordering.md) — Why wall-clock time lies, happens-before, Lamport clocks, vector clocks, hybrid logical clocks, and Google TrueTime.
- [CRDTs: Conflict-Free Replicated Data Types](content/hld/part-3-distributed-systems-theory/05-crdts.md) — State-based (CvRDT) and op-based (CmRDT) CRDTs, G-Counter, PN-Counter, OR-Set, LWW-Register, and how Yjs, Automerge, Figma, and Redis use them.
- [Distributed Transactions: 2PC, Saga, and When to Avoid Both](content/hld/part-3-distributed-systems-theory/06-distributed-transactions.md) — Two-phase commit, Percolator, Sagas, outbox pattern, and the honest answer to distributed transactions: don't, or pay the price.
- [Idempotency and Exactly-Once: The Honest Truth About Delivery Guarantees](content/hld/part-3-distributed-systems-theory/07-idempotency-exactly-once.md) — Why exactly-once delivery is a myth, how idempotency keys make at-least-once feel exactly-once, and how Stripe and Kafka implement it.
- [Failure Detection: Deciding a Node Is Dead](content/hld/part-3-distributed-systems-theory/08-failure-detection.md) — Heartbeats, phi-accrual detectors, gossip (SWIM), and why 'is it dead or just slow?' has no correct answer.
- [Consistent Hashing: Keys to Nodes Without Global Reshuffles](content/hld/part-3-distributed-systems-theory/09-consistent-hashing.md) — The hash ring, virtual nodes, bounded-load variant, rendezvous hashing, Maglev, and jump hash for distributing keys across dynamic node sets.
- [Merkle Trees and Anti-Entropy: Keeping Replicas in Sync Cheaply](content/hld/part-3-distributed-systems-theory/10-merkle-trees-anti-entropy.md) — Merkle trees, anti-entropy protocols, read repair, hinted handoff, and how Dynamo, Cassandra, and Git use hashed trees to find the differences.

</details>

<details>
<summary><strong>Part 4 — Data Systems</strong> — storage engines, OLTP/OLAP, warehouses/lakes, streams, search, time-series, graph, vector, KV</summary>

### Part 4 — Data Systems

> **Who it's for:** anyone who owns a data pipeline or picks a database.  
> **Level:** Intermediate to advanced

Every flavor of data system you might pick, and when each actually fits. Storage engines (B-tree vs LSM), OLTP vs OLAP, warehouses/lakes/lakehouses, streaming vs batch, CDC, search, time-series, graph, vector, and key-value.

- [Storage Engines: B-Trees, LSM-Trees, and Why Your Database Feels the Way It Does](content/hld/part-4-data-systems/00-storage-engines.md) — How B-tree and LSM-tree storage engines shape read, write, and space amplification, with examples from InnoDB, PostgreSQL, RocksDB, and Cassandra.
- [OLTP vs OLAP: Row Stores, Column Stores, and Matching Shape to Workload](content/hld/part-4-data-systems/01-oltp-vs-olap.md) — Why transactional systems use row-oriented storage and analytical systems use columnar, with examples from Postgres, MySQL, Redshift, BigQuery, ClickHouse, and Snowflake.
- [Data Warehouses and Data Lakes: Structure, Schema, and the Lakehouse](content/hld/part-4-data-systems/02-data-warehouses-lakes.md) — How Redshift, BigQuery, Snowflake, S3-based lakes, and the lakehouse pattern with Delta Lake, Iceberg, and Hudi actually fit together.
- [Stream vs Batch Processing: Lambda, Kappa, and the End of That Debate](content/hld/part-4-data-systems/03-stream-vs-batch.md) — Batch with Spark and Hadoop, streaming with Kafka Streams, Flink, and Spark Streaming, and how Lambda and Kappa architectures stack up.
- [Change Data Capture: Streaming the Database's Inner Monologue](content/hld/part-4-data-systems/04-change-data-capture.md) — How Debezium, Maxwell, and the outbox pattern turn WAL and binlog entries into reliable event streams, and when each approach is the right call.
- [Search Systems: Inverted Indexes, BM25, and Running Elasticsearch in Production](content/hld/part-4-data-systems/05-search-systems.md) — How Elasticsearch, OpenSearch, and Solr build inverted indexes, score with BM25, and handle faceting, relevance tuning, and sharding at scale.
- [Time-Series Databases: Metrics, Events, and Retention at Scale](content/hld/part-4-data-systems/06-time-series-databases.md) — How Prometheus, InfluxDB, TimescaleDB, and VictoriaMetrics handle write-heavy time-series workloads with downsampling and retention policies.
- [Graph Databases: Property Graphs, Cypher, and When Joins Are the Problem](content/hld/part-4-data-systems/07-graph-databases.md) — How Neo4j, Amazon Neptune, and Dgraph model relationships, and when graph queries beat recursive SQL joins.
- [Vector Databases: Embeddings, ANN Indexes, and the Retrieval Layer for AI](content/hld/part-4-data-systems/08-vector-databases.md) — How Pinecone, Weaviate, Milvus, and pgvector store and search embeddings using HNSW and IVF approximate nearest neighbor indexes.
- [Key-Value Stores: Redis, Memcached, DynamoDB, and Picking the Right Hash Table](content/hld/part-4-data-systems/09-key-value-stores.md) — How Redis, Memcached, and DynamoDB differ in durability, data model, and scaling, and when each is the right key-value store.

</details>

<details>
<summary><strong>Part 5 — Architecture Patterns</strong> — monolith vs micro, event-driven, CQRS, ES, serverless, BFF, strangler, hex, multi-region, multi-tenant, CRDT apps</summary>

### Part 5 — Architecture Patterns

> **Who it's for:** engineers making architecture-level decisions or leading service migrations.  
> **Level:** Intermediate to advanced

The architectural shapes you choose between when you design anything bigger than a single service: monolith vs microservices, event-driven, CQRS, event sourcing, serverless, BFF, strangler fig, hexagonal/clean, multi-region, multi-tenancy, CRDT-based apps.

- [Monolith vs Microservices: Team Topology, Conway's Law, and the Distributed System Tax](content/hld/part-5-architecture-patterns/00-monolith-vs-microservices.md) — When a modular monolith beats microservices, how Conway's Law shapes architecture, and what the distributed system tax actually costs you.
- [Event-Driven Architecture: Notifications, State Transfer, and Choreography](content/hld/part-5-architecture-patterns/01-event-driven-architecture.md) — The three flavors of events, how Kafka and event buses enable loose coupling, and when choreography beats orchestration.
- [CQRS: Separating Reads from Writes Without Losing Your Mind](content/hld/part-5-architecture-patterns/02-cqrs.md) — Command Query Responsibility Segregation in practice: when to split read and write models, how to handle eventual consistency, and when CQRS is overkill.
- [Event Sourcing: Events as the Source of Truth](content/hld/part-5-architecture-patterns/03-event-sourcing.md) — Storing state as an append-only log of events, with replay, projections, snapshots, and the ops reality of running event-sourced systems.
- [Serverless: Functions, Cold Starts, and When FaaS Actually Saves Money](content/hld/part-5-architecture-patterns/04-serverless.md) — AWS Lambda, Google Cloud Functions, and Azure Functions in practice: cold starts, concurrency models, and the honest economics of serverless.
- [Backend for Frontend: Per-Client API Aggregation Done Right](content/hld/part-5-architecture-patterns/05-backend-for-frontend.md) — When one API cannot serve web, mobile, and partner clients well, the BFF pattern gives each client its own aggregation layer.
- [Strangler Fig: Incremental Migration Without a Big Bang](content/hld/part-5-architecture-patterns/06-strangler-fig.md) — Martin Fowler's strangler fig pattern for replacing legacy systems incrementally, with routing, facades, and how teams actually execute multi-year migrations.
- [Hexagonal and Clean Architecture: Keeping Business Logic Independent](content/hld/part-5-architecture-patterns/07-hexagonal-clean-architecture.md) — Ports and adapters, clean architecture, and onion architecture: how to keep domain logic testable and framework-independent.
- [Multi-Region Architecture: Active-Passive, Active-Active, and CRDTs](content/hld/part-5-architecture-patterns/08-multi-region-architecture.md) — Designing systems that survive regional failure: DNS failover, active-passive replication, active-active with CRDTs, and Cloudflare's model.
- [Multi-Tenancy: Silo, Pool, and the SaaS Isolation Spectrum](content/hld/part-5-architecture-patterns/09-multi-tenancy.md) — Designing SaaS platforms that host many tenants on shared infrastructure: isolation levels, noisy-neighbor defenses, per-tenant metering, and when to graduate a whale.
- [CRDT Applications (Yjs, Automerge, Local-First Software)](content/hld/part-5-architecture-patterns/10-crdt-applications.md) — Design local-first collaborative software with CRDTs: Yjs, Automerge, peer-to-peer sync, and the architectural shift away from authoritative central servers.

</details>

<details>
<summary><strong>Part 6 — Reliability & Operations</strong> — observability, SLOs, resilience, scaling, deploys, chaos, incidents, FinOps, platform</summary>

### Part 6 — Reliability & Operations

> **Who it's for:** anyone on-call, anyone who signs SLAs, anyone paying a cloud bill.  
> **Level:** Intermediate to advanced

The engineering that separates "it compiles" from "it runs reliably at 3 a.m. on a long weekend": observability, SLOs, resilience patterns, auto-scaling, deployments, chaos engineering, incident response, health checks, FinOps, platform engineering.

- [Observability: Metrics, Logs, Traces, and the OpenTelemetry Standard](content/hld/part-6-reliability-and-operations/00-observability.md) — The three pillars of observability, USE vs RED methods, and how OpenTelemetry, Prometheus, Grafana, and Jaeger fit together in production.
- [SLI, SLO, SLA, and Error Budgets: Making Reliability Quantitative](content/hld/part-6-reliability-and-operations/01-sli-slo-sla-error-budgets.md) — The Google SRE framework for reliability: what to measure, what to target, what to promise, and how error budgets fund feature work vs reliability work.
- [Resilience Patterns: Timeouts, Retries, Circuit Breakers, and Bulkheads](content/hld/part-6-reliability-and-operations/02-resilience-patterns.md) — The defensive patterns that keep distributed systems from cascading into total failure, from Hystrix to modern service mesh implementations.
- [Graceful Degradation: When Partial Service Beats No Service](content/hld/part-6-reliability-and-operations/03-graceful-degradation.md) — Load shedding, feature flags, cached fallbacks, and the product-engineering decisions behind degrading one feature to save the system.
- [Auto-Scaling and Capacity Planning: From HPA to Predictive Scaling](content/hld/part-6-reliability-and-operations/04-auto-scaling-capacity.md) — Horizontal pod autoscalers, cluster autoscalers, predictive scaling, and the capacity planning math that keeps systems sized right without overspending.
- [Deployment Strategies: Blue-Green, Canary, Rolling, and Feature Flags](content/hld/part-6-reliability-and-operations/05-deployment-strategies.md) — How to ship changes safely with blue-green, rolling, canary, and progressive delivery, plus the role of feature flags and LaunchDarkly-style tooling.
- [Chaos Engineering: Breaking Things on Purpose](content/hld/part-6-reliability-and-operations/06-chaos-engineering.md) — Netflix's Chaos Monkey, the Principles of Chaos, and how to run game days and fault injection experiments without making your on-call call in sick.
- [Incident Management: From Detection to Blameless Postmortem](content/hld/part-6-reliability-and-operations/07-incident-management.md) — On-call, incident command, severity levels, communication, and how to run postmortems that actually change systems instead of blaming people.
- [Health Checks and Readiness: Telling the Truth About Whether You're Up](content/hld/part-6-reliability-and-operations/08-health-checks-readiness.md) — Liveness, readiness, startup probes, deep vs shallow health checks, and why bad health checks cause more outages than bad code.
- [Cost Optimization and FinOps](content/hld/part-6-reliability-and-operations/09-cost-optimization-finops.md) — Apply FinOps to reduce cloud bills without sacrificing reliability: spot instances, reserved capacity, autoscaling, storage tiering, and unit-economics thinking.
- [Platform Engineering: IDPs, Golden Paths, and DX](content/hld/part-6-reliability-and-operations/10-platform-engineering.md) — Treat the platform as a product: build internal developer platforms with Backstage, golden paths, and DORA/SPACE metrics that move developer productivity.

</details>

<details>
<summary><strong>Part 7 — Security at Scale</strong> — AuthN/Z, OAuth/OIDC, JWT, mTLS, secrets, DDoS/WAF, compliance, supply chain, privacy, PQC</summary>

### Part 7 — Security at Scale

> **Who it's for:** Senior/Staff engineers, platform teams, security-adjacent builders.  
> **Level:** Intermediate to advanced

Security architecture for real systems, not a CISSP crib sheet: AuthN vs AuthZ, OAuth2/OIDC, JWT (and why you probably shouldn't), mTLS, secrets management, DDoS/WAF, compliance (GDPR/DPDP/CCPA), software supply chain, privacy-preserving systems, post-quantum cryptography.

- [Authentication vs Authorization: Identity, Permissions, and Access Models](content/hld/part-7-security-at-scale/00-authn-authz.md) — AuthN vs AuthZ, session vs token auth, and access control models: RBAC, ABAC, ReBAC with examples from SpiceDB, OpenFGA, and AWS IAM.
- [OAuth 2.0 and OpenID Connect: Delegated Authorization and Identity Done Right](content/hld/part-7-security-at-scale/01-oauth2-oidc.md) — The OAuth 2.0 authorization framework, OIDC identity layer, and the Authorization Code + PKCE flow that is the modern standard for web and mobile.
- [JWT Deep Dive: Signed Tokens, Claims, and the Revocation Problem](content/hld/part-7-security-at-scale/02-jwt-deep-dive.md) — How JSON Web Tokens work: JWS signing, JWE encryption, claim validation, key rotation, and the trade-offs of stateless auth.
- [mTLS and Service-to-Service Authentication: SPIFFE, Service Mesh, and Zero Trust](content/hld/part-7-security-at-scale/03-mtls-service-auth.md) — How mutual TLS, SPIFFE/SPIRE, and service meshes like Istio and Linkerd authenticate services without long-lived credentials.
- [Secrets Management: Vault, KMS, and the End of Secrets in Config Files](content/hld/part-7-security-at-scale/04-secrets-management.md) — Managing API keys, passwords, and certificates with Vault, AWS Secrets Manager, KMS envelope encryption, and dynamic secrets.
- [DDoS Protection and WAFs: Mitigating Volumetric and Application Attacks](content/hld/part-7-security-at-scale/05-ddos-waf.md) — Defending against L3/L4 and L7 DDoS with Cloudflare, AWS Shield, and WAFs; rate limiting, bot management, and the OWASP Top 10.
- [Data Residency and Compliance Architecture (GDPR, DPDP, CCPA, Right-to-Erasure)](content/hld/part-7-security-at-scale/06-data-residency-compliance.md) — Designing multi-jurisdictional systems for GDPR, DPDP, CCPA, and LGPD with data classification, regional silos, crypto-shredding, and auditable erasure.
- [Supply Chain Security: SBOM, SLSA, Sigstore, and Defending Against xz-utils](content/hld/part-7-security-at-scale/07-supply-chain-security.md) — Protecting the software supply chain with SBOMs, SLSA provenance, Sigstore signing, admission policies, and lessons from xz-utils and SolarWinds.
- [Privacy-Preserving Systems (Differential Privacy, Federated Learning)](content/hld/part-7-security-at-scale/08-privacy-preserving-systems.md) — Design systems that protect user data by construction: differential privacy, federated learning, secure aggregation, and an introduction to homomorphic encryption.
- [Post-Quantum Cryptography: Migrating to ML-KEM, ML-DSA, and a Crypto-Agile Future](content/hld/part-7-security-at-scale/09-post-quantum-crypto.md) — Why harvest-now-decrypt-later makes PQC urgent, what NIST standardized in 2024, and how to migrate production TLS and long-lived secrets to hybrid post-quantum cryptography.

</details>

<details>
<summary><strong>Part 8 — Case Studies</strong> — end-to-end designs, grouped by theme; the centerpiece of interview prep</summary>

### Part 8 — Case Studies

> **Who it's for:** interview prep candidates, engineers building adjacent systems, anyone who learns best from worked examples.  
> **Level:** Intermediate to advanced

End-to-end system designs, each following a consistent structure: requirements (functional + non-functional), back-of-envelope numbers, high-level architecture, data model, deep-dive components, scalability and reliability considerations, and real-world references. Grouped thematically below for easier navigation.

#### Core primitives

The interview classics. One building block per chapter, designed from scratch.

- [Design a URL Shortener (TinyURL / bit.ly)](content/hld/part-8-case-studies/00-url-shortener.md) — An interview-grade walkthrough for a URL shortener: capacity estimation, short-code generation, hot-key caching, and an analytics pipeline that never blocks the redirect.
- [Design a Pastebin (Paste Sharing Service)](content/hld/part-8-case-studies/01-pastebin.md) — An interview-grade walkthrough for a Pastebin-style text sharing service: object storage split, TTL-based expiration pipelines, syntax highlighting placement, and abuse prevention.
- [Design a Distributed Rate Limiter](content/hld/part-8-case-studies/02-rate-limiter.md) — An interview-grade walkthrough for a distributed API rate limiter: algorithm choice, Redis Lua atomicity, two-tier local+global synchronization, and fail-open failure modes.
- [Design a Distributed Key-Value Store (Dynamo / Cassandra / Riak)](content/hld/part-8-case-studies/03-key-value-store.md) — Design a distributed KV store with consistent hashing, quorum replication, gossip membership, hinted handoff, and Merkle-tree anti-entropy repair.
- [Design a Notification System (Push, SMS, Email at Scale)](content/hld/part-8-case-studies/04-notification-system.md) — An interview-grade walkthrough for a multi-channel notification platform: fan-out architecture, APNs/FCM integration, retry with dead-letter queues, and device-token lifecycle.
- [Design a Chat System (WhatsApp / Messenger / Signal)](content/hld/part-8-case-studies/05-chat-system.md) — Staff-level design for 1:1 and small-group chat at WhatsApp scale: 500M concurrent connections, message ordering, E2E encryption, and storage model trade-offs.
- [Design a Social Media Feed (Twitter / Instagram / LinkedIn)](content/hld/part-8-case-studies/06-social-media-feed.md) — Fan-out architecture, hybrid push/pull, ML ranking pipelines, and the celebrity problem at Twitter/X scale.
- [Design a Photo Sharing Service (Instagram)](content/hld/part-8-case-studies/07-photo-sharing.md) — Design Instagram-scale photo sharing: upload pipeline, transcoding, multi-resolution image serving, CDN with origin shielding, and news feed integration.
- [Design a Web Crawler (Googlebot-style)](content/hld/part-8-case-studies/08-web-crawler.md) — Design a distributed web crawler with URL frontier, politeness policies, content deduplication, robots.txt compliance, and Bloom-filter-backed URL dedup at billion scale.
- [Design Search Autocomplete (Typeahead Suggestions)](content/hld/part-8-case-studies/09-search-autocomplete.md) — Design a low-latency autocomplete system with tries, top-K precomputation, real-time trending overlays, and multi-tier caching at Google scale.
- [Design a Distributed Cache (Memcached / Redis Cluster)](content/hld/part-8-case-studies/16-distributed-cache.md) — Design a Memcached- or Redis-style distributed cache: consistent hashing, eviction, replication, client-side sharding, and hot-key mitigation.
- [Design a Proximity Service (Nearby Friends / Yelp)](content/hld/part-8-case-studies/25-proximity-service.md) — Design a proximity service for 100M users with 1M concurrent location-sharing sessions: geohash/H3/S2 trade-offs, Redis geosets, bounding-box query fan-out, privacy, and hotspot handling during events.
- [Design a Real-Time Leaderboard](content/hld/part-8-case-studies/26-leaderboard.md) — Design a real-time leaderboard for 10M players with 100K score updates/sec, tie-breaking, time-windowed views, friend boards, and approximate rank for the tail.
- [Design a Unique ID Generator (Snowflake, ULID, TSID, UUIDv7)](content/hld/part-8-case-studies/27-unique-id-generator.md) — Design a distributed ID generator producing 10M 64-bit IDs/sec, monotonic-ish ordering, clock-skew resilience, and the four-way trade-off between Snowflake, ULID, TSID, and UUIDv7.
- [Design a Distributed Job Scheduler (Airflow / Temporal / Distributed Cron)](content/hld/part-8-case-studies/29-job-scheduler.md) — Design a scheduler for 100k registered jobs and 10k executions/sec with exactly-once execution, DAGs up to 10k nodes, late/missed run policies, and graceful scheduler upgrades.

#### Consumer products

End-user products built from several building blocks.

- [Design a Video Streaming Service (YouTube / Twitch / TikTok)](content/hld/part-8-case-studies/10-video-streaming.md) — Design a UGC video platform from upload through adaptive bitrate streaming: transcode pipeline, HLS/DASH/CMAF packaging, CDN delivery with ISP peering, and live ingest architecture.
- [Design Netflix (End-to-End)](content/hld/part-8-case-studies/11-netflix.md) — A whole-system walkthrough of Netflix's architecture: microservices, Open Connect CDN, per-title encoding, Cassandra + EVCache, resilience patterns, and chaos engineering.
- [Design a Ride-Hailing Service (Uber / Lyft)](content/hld/part-8-case-studies/12-ride-hailing.md) — An interview-grade walkthrough for Uber-scale ride-hailing: H3 geospatial indexing, real-time location ingest, batched bipartite matching, surge pricing, and trip orchestration.
- [Design Google Maps (Routing and Tile Rendering)](content/hld/part-8-case-studies/13-google-maps.md) — Design planet-scale mapping: map tile rendering, shortest-path routing with contraction hierarchies, ETA prediction with GNNs, and offline maps.
- [Design a File Sync Service (Dropbox / Google Drive)](content/hld/part-8-case-studies/14-file-sync.md) — Design a Dropbox-style file sync service: block-level deduplication, delta sync, conflict resolution, versioning, and client-server reconciliation.
- [Design Collaborative Editing (Google Docs / Figma / Notion)](content/hld/part-8-case-studies/15-collaborative-editing.md) — Staff-level design for real-time collaborative editing at 100K+ concurrent editors: OT vs CRDTs, presence broadcasting, offline sync, and version history.
- [Design a Ticketing System (BookMyShow / Ticketmaster)](content/hld/part-8-case-studies/18-ticketing-system.md) — An interview-grade walkthrough for high-concurrency ticketing: seat locking with Redis SETNX, saga-based payment, virtual waiting rooms, and anti-bot defenses at 500M tickets/year scale.
- [Design a Food Delivery Service (DoorDash / Swiggy)](content/hld/part-8-case-studies/21-food-delivery.md) — Design a three-sided food delivery marketplace: dispatch with batching and reassignment, composite ETA prediction, and driver-merchant-customer coordination.
- [Design a Hotel Reservation System (Booking.com / Airbnb)](content/hld/part-8-case-studies/28-hotel-reservation.md) — Staff-level design for hotel reservation: search/booking split, PostgreSQL exclusion constraints for date-range double-booking prevention, Temporal saga orchestration, and CDC-backed availability indexing at 85K QPS.
- [Design a Dating App (Tinder / Hinge / Bumble)](content/hld/part-8-case-studies/40-dating-app.md) — Design a dating app for 100M MAU handling 1.5B swipes/day with <50 ms card loads: two-tower recommendations, geospatial filtering, mutual-match detection, and safety-at-scale.
- [Design a Video Conferencing System (Zoom / Google Meet)](content/hld/part-8-case-studies/43-video-conferencing.md) — Design a video conferencing platform for 500K simultaneous meetings and 10M concurrent participants with <150 ms audio and <500 ms video: SFU vs MCU vs P2P, simulcast and SVC, bandwidth estimation, regional media routing, and real-time recording.
- [Design an Email Service at Gmail Scale (1.8B Users, 300B Messages/Day)](content/hld/part-8-case-studies/44-gmail-scale-email.md) — Design a global email service for 1.8B users and 300B messages/day: SMTP ingress, spam pipeline cascade, per-user sharded search, RFC 5322 threading, and exabyte-scale tiered storage with content-addressed attachment dedup.
- [Design Live Comments at Scale (FB Live / YouTube Live / Twitch Chat)](content/hld/part-8-case-studies/45-live-comments.md) — Design a live-comment system for 10M concurrent viewers and 100K commenters on one stream: delta-batched fan-out, pre-publish moderation, and the celebrity-stream hotspot.
- [Design a Fitness Tracking Service (Strava / MapMyRun)](content/hld/part-8-case-studies/47-strava-fitness.md) — Design a fitness tracking service for 195M+ users: GPS ingestion, two-stage segment matching with H3 pre-filter and DTW, Kafka-backed leaderboards, and privacy-safe planetary heatmaps.

#### Financial systems

Systems where correctness, audit and regulation come first.

- [Design a Payment System (Stripe / PayPal)](content/hld/part-8-case-studies/19-payment-system.md) — Design a payment system with a double-entry ledger, idempotency keys, saga-orchestrated cross-service flows, and the compliance constraints that shape every decision.
- [Design a Stock Exchange (Matching Engine)](content/hld/part-8-case-studies/20-stock-exchange.md) — Design a deterministic, low-latency matching engine: FIFO order book, price-time priority, multicast market data distribution, and co-location realities.
- [Design an Online Auction (eBay / Catawiki)](content/hld/part-8-case-studies/41-online-auction.md) — Design an online auction for 100M active listings and 10M concurrent bidders: Redis Lua CAS for atomic bids at 1M/sec peak, proxy bidding, sniping extensions, and WebSocket fan-out.
- [Design a Fraud Detection System (Stripe Radar / PayPal / Feedzai)](content/hld/part-8-case-studies/46-fraud-detection.md) — Design a real-time fraud detection service scoring millions of events per second under 100 ms p99 with a rules-ML cascade, online/offline feature store, graph ring detection, and analyst feedback loop.
- [Design a Brokerage Platform (Robinhood / E*TRADE / Interactive Brokers)](content/hld/part-8-case-studies/54-brokerage-trading.md) — Design a retail brokerage for 30M users: order routing, symbol-channel quote fanout, fractional-share aggregation, tax-lot accounting, and seven-year regulatory audit.

#### AI systems

Systems where inference, retrieval or agent behavior is the hard part.

- [Design a Recommendation System (Netflix / YouTube / TikTok)](content/hld/part-8-case-studies/17-recommendation-system.md) — Design a two-stage recommendation system: candidate generation, ranking, collaborative filtering, content-based features, a feature store, and cold-start handling.
- [Design ChatGPT (Conversational AI at Scale)](content/hld/part-8-case-studies/30-chatgpt-conversational-ai.md) — Design ChatGPT for 900M weekly users: multi-tenant LLM serving, session-state architecture, streaming SSE, per-user memory, safety, and multi-region deployment.
- [Design an Enterprise RAG System](content/hld/part-8-case-studies/31-enterprise-rag.md) — Design a multi-tenant enterprise RAG platform for 1k tenants with 10M documents each at 100 QPS/tenant: ingestion, hybrid retrieval, reranking, citation, access-control-aware retrieval, freshness, and tenant isolation.
- [Design a Coding Agent (Claude Code / GitHub Copilot / Cursor)](content/hld/part-8-case-studies/32-coding-agent.md) — Design a coding agent serving 1M concurrent sessions across autocomplete, chat, and autonomous loop modes with repo indexing, sandboxed tool use, and streaming diff application.
- [Design Perplexity (AI Search with Citations)](content/hld/part-8-case-studies/33-perplexity-ai-search.md) — Design an AI search engine for 50M MAU, 5k QPS peak, <2 s answer latency with inline citations: query rewriting, source retrieval, citation-grounding, streaming output, freshness, and fact-check post-processing.
- [Design a Voice Agent (Alexa / Siri-Class Realtime)](content/hld/part-8-case-studies/34-voice-agent.md) — Design a realtime voice agent for 100M devices with 50k concurrent conversations and sub-700 ms turn latency: streaming ASR, LLM turn-taking, streaming TTS, WebRTC transport, and barge-in.
- [Design a Content Moderation System at Scale](content/hld/part-8-case-studies/35-content-moderation-at-scale.md) — Design moderation for 500M posts/day with <200 ms pre-publish latency, human-in-loop for 0.5% of traffic, multi-modal (text+image+video): classifier cascade, reviewer workflow, appeals, adversarial robustness.
- [Design a Semantic Cache for LLM Applications](content/hld/part-8-case-studies/36-semantic-cache.md) — Design an embedding-similarity cache for LLM prompts at 10k QPS, 70%+ hit rate, <10 ms lookup: similarity threshold calibration, invalidation on source change, per-tenant isolation, false-positive cost accounting.
- [Design a Model Router and Gateway (OpenRouter / LiteLLM)](content/hld/part-8-case-studies/37-model-router-gateway.md) — Design a gateway routing 20k QPS across 50+ models and 10 providers with <30 ms routing overhead: cost/latency/quality routing strategies, provider failover, streaming pass-through, per-tenant quotas, cost attribution.

#### Infrastructure platforms

Platforms other engineers build on.

- [Design a Metrics Pipeline (Prometheus / InfluxDB / Thanos)](content/hld/part-8-case-studies/22-metrics-pipeline.md) — Design a time-series metrics pipeline: high-cardinality ingestion, aggregation across clusters with Thanos or Cortex, alerting, and downsampling for long-term retention.
- [Design Ad-Click Aggregation (Real-Time Stream Processing)](content/hld/part-8-case-studies/23-ad-click-aggregation.md) — Design an ad-click aggregation system with exactly-once semantics on Kafka + Flink, real-time fraud detection, and low-latency dashboards.
- [Design a Logging Platform (ELK / Loki / Splunk)](content/hld/part-8-case-studies/24-logging-platform.md) — Design a logging platform: ingestion at scale, index vs. label-based storage (Elastic vs Loki), retention tiering, and full-text search with BM25.
- [Design a Feature Flag Service (LaunchDarkly / Harness FME / Unleash)](content/hld/part-8-case-studies/38-feature-flag-service.md) — Design a feature flag and experimentation platform for 20T evaluations/day with sub-millisecond SDK-side latency, streaming config distribution, and sub-60s kill-switch propagation.
- [Design a DNS Service (Cloudflare 1.1.1.1 / Google 8.8.8.8)](content/hld/part-8-case-studies/39-dns-service.md) — Design a public recursive DNS resolver serving trillions of queries/day globally with <20 ms p99 from 300+ anycast POPs: UDP/TCP/DoT/DoH/DoQ, DNSSEC validation, cache design, rate limiting, and DDoS survivability.
- [Design a Multi-Tenant SaaS Platform](content/hld/part-8-case-studies/42-multi-tenant-saas.md) — Design a multi-tenant SaaS platform serving 50K tenants with per-tenant SLA tiers, metered billing, noisy-neighbor containment, and zero cross-tenant data leakage.
- [Design an Online Judge (LeetCode / Codeforces / HackerEarth)](content/hld/part-8-case-studies/48-online-judge.md) — Design an online judge for 1M users at 100K submissions/hour peak with <15s verdict p99: Firecracker sandboxes, priority queueing for contests, seccomp + cgroups isolation, and MOSS-style plagiarism detection.
- [Design a Price Tracking Service (CamelCamelCamel / Honey / Keepa)](content/hld/part-8-case-studies/49-price-tracking.md) — Design a price-tracking service that watches 100M product URLs with priority-driven scraping, diff-based alerting to 10M subscribers, 2-year historical retention, and polite rotation through a proxy pool that retailers actively try to block.
- [Design an API Gateway at Scale (Kong / AWS API Gateway / Apigee / Envoy)](content/hld/part-8-case-studies/50-api-gateway.md) — Design an API gateway that handles 100K RPS per instance with <5 ms p99 overhead across 10K upstream services: routing trie, local+global rate limiting, mTLS termination, hitless config reload, and circuit breaking.
- [Design a CI/CD Platform (GitHub Actions / GitLab CI / CircleCI)](content/hld/part-8-case-studies/51-cicd-platform.md) — Design a CI/CD platform for 100K orgs and 10M workflow runs/day: YAML DAG execution, ephemeral runner pools (Firecracker), content-addressed artifacts, dependency caches, secrets injection, and multi-tenant isolation at 40K concurrent runners.
- [Design an Observability Platform (Datadog / New Relic / Honeycomb)](content/hld/part-8-case-studies/52-observability-platform.md) — Design a unified observability platform for 10M hosts and 1B events/sec: OTLP ingestion across metrics, logs, and traces, cardinality control, trace-log correlation, multi-tenant isolation, and query latency at 100K concurrent analysts.
- [Design a Search Engine (Google-Scale / Brave Search)](content/hld/part-8-case-studies/53-search-engine.md) — Design a web-scale search engine over 10B documents serving 100K queries/sec at <200 ms p99: sharded inverted index, BM25 + PageRank + neural re-ranking cascade, query understanding, and freshness pipelines.
- [Design Channel-Scale Chat (Discord / Slack)](content/hld/part-8-case-studies/55-channel-scale-chat.md) — Design channel-scale chat for 100K+ member channels with pub/sub fanout, RBAC on the hot path, presence aggregation, and workspace search.

</details>

<details>
<summary><strong>Part 9 — AI & ML System Design</strong> — LLM serving, RAG, vector search, agents, LLMOps, safety, recommenders, multimodal</summary>

### Part 9 — AI & ML System Design

> **Who it's for:** anyone building with or around LLMs, agents, or production ML.  
> **Level:** Intermediate to advanced

Modern AI-systems architecture, treated with the same rigor as Part 3: LLM serving, RAG, vector search, agent architectures, multi-agent orchestration, LLM evaluation, LLMOps, cost optimization, safety, ML fundamentals, feature stores, recommenders, real-time AI, multimodal, and the data infra underneath all of it.

- [LLM Serving Architecture (vLLM, TGI, TensorRT-LLM)](content/hld/part-9-ai-ml-system-design/00-llm-serving-architecture.md) — Design a production LLM inference stack: continuous batching, paged attention, KV-cache management, and multi-tenant GPU scheduling.
- [RAG Pipelines (Retrieval-Augmented Generation)](content/hld/part-9-ai-ml-system-design/01-rag-pipelines.md) — Design production RAG: chunking, embedding models, hybrid dense-plus-sparse retrieval, reranking, and the eval loops that keep it honest.
- [Vector Search at Scale (HNSW, IVF-PQ, DiskANN)](content/hld/part-9-ai-ml-system-design/02-vector-search-at-scale.md) — Design billion-scale vector search: HNSW, IVF-PQ, and DiskANN indexes, product quantization, hybrid BM25-vector search, and sharding strategies.
- [AI Agent Architectures (ReAct, Reflection, Planning, Tool Use, Memory)](content/hld/part-9-ai-ml-system-design/03-ai-agent-architectures.md) — The canonical patterns for turning an LLM into an agent: ReAct's think-act-observe loop, reflection and self-critique, planner-executor decomposition, tool use and function calling, and how agents manage short- and long-term memory.
- [Multi-Agent Orchestration (LangGraph, OpenAI Agents SDK, AutoGen, Swarm)](content/hld/part-9-ai-ml-system-design/04-multi-agent-orchestration.md) — Composing multiple agents into a reliable system: orchestrator-worker topologies, handoffs and delegation, shared memory, parallel fan-out, and the failure modes of agent graphs.
- [LLM Evaluation and Observability (Ragas, LangSmith, TruLens, LLM-as-Judge)](content/hld/part-9-ai-ml-system-design/05-llm-evaluation-observability.md) — How to evaluate LLM systems before and after they ship: golden datasets, reference-free metrics, LLM-as-judge, continuous eval pipelines, and the observability stack for production LLMs.
- [LLMOps and Prompt Engineering (Versioning, Guardrails, Red-Teaming)](content/hld/part-9-ai-ml-system-design/06-llmops-prompt-engineering.md) — The operational side of shipping LLM features: prompt-as-code, versioning, rollback, A/B testing prompts, structured outputs, and red-teaming before launch.
- [LLM Cost Optimisation (Semantic Cache, Model Routing, Cascading, Prompt Caching)](content/hld/part-9-ai-ml-system-design/07-llm-cost-optimization.md) — The cost-engineering toolbox for production LLMs: semantic caching, model routing, cascade small-then-big, prompt caching (Anthropic, OpenAI), and the unit economics that decide per-request margin.
- [LLM Safety and Guardrails (OWASP LLM Top 10, Prompt Injection, PII, Jailbreaks)](content/hld/part-9-ai-ml-system-design/08-llm-safety-guardrails.md) — The safety-engineering surface for LLM applications: OWASP LLM Top 10, prompt-injection defence, PII redaction, jailbreak containment, and the defence-in-depth model for public-facing agents.
- [ML System Design Fundamentals](content/hld/part-9-ai-ml-system-design/09-ml-system-design-fundamentals.md) — The classic ML systems backbone every modern AI product sits on: candidate generation, ranking, two-tower embeddings, offline/online feature parity, and the training-serving skew problem.
- [Feature Stores and Model Serving (Feast, Tecton, KServe, BentoML, MLflow)](content/hld/part-9-ai-ml-system-design/10-feature-stores-model-serving.md) — The infrastructure that makes ML shippable: online and offline feature stores, the model registry, model servers, shadow deploys, and the production lifecycle around a trained model.
- [Recommendation Systems Deep Dive (DLRM, Two-Tower, Embedding Retrieval, Cold Start)](content/hld/part-9-ai-ml-system-design/11-recommendation-systems.md) — How modern recommenders actually work end-to-end: candidate gen via ANN on embeddings, DLRM-style ranking, exploration-exploitation, cold-start handling, and the evaluation loop that keeps metrics honest.
- [Realtime AI and Voice Agents (Streaming Inference, WebRTC, LiveKit, Deepgram)](content/hld/part-9-ai-ml-system-design/12-realtime-ai-voice-agents.md) — Designing sub-second voice agents: streaming ASR, low-latency LLM inference, streaming TTS, WebRTC transport, interruption handling, and the end-to-end latency budget.
- [Multimodal AI Systems (CLIP, Whisper, LayoutLM, Document AI)](content/hld/part-9-ai-ml-system-design/13-multimodal-ai-systems.md) — Designing systems that ingest images, audio, video, and documents: CLIP-style embeddings for cross-modal retrieval, Whisper pipelines, OCR-plus-layout models, and the storage architecture for unstructured data.
- [Data Infrastructure for AI (Embedding Pipelines, Chunking, Unstructured ETL, MCP)](content/hld/part-9-ai-ml-system-design/14-data-infrastructure-for-ai.md) — The data plane that feeds AI systems: source connectors, chunking strategies, embedding at scale, metadata schema, freshness, and the Model Context Protocol as a standard interface.

</details>

<details>
<summary><strong>Part 10 — Emerging Patterns</strong> — green/sustainable computing; growing list of forward-looking topics</summary>

### Part 10 — Emerging Patterns

> **Who it's for:** Staff+ engineers and architects thinking past 2026.  
> **Level:** Intermediate

Forward-looking topics that are adjacent to everything else. More are planned (WebAssembly at the edge, unikernels, confidential computing, on-device AI).

- [Green Computing (Carbon-Aware Scheduling, PUE, Sustainable Systems)](content/hld/part-10-emerging-patterns/00-green-computing.md) — Design systems that account for carbon: carbon-aware scheduling, PUE, renewable-energy datacenters, and the Green Software Foundation practices.

</details>

<details>
<summary><strong>Part 11 — Interview Framework</strong> — RESHADED/PEDALS/ADEPT, requirements, diagrams, trade-offs, company flavors, RFCs</summary>

### Part 11 — Interview Framework

> **Who it's for:** anyone preparing for or giving system-design interviews.  
> **Level:** Intermediate to advanced

How to run a 45-minute system-design interview, from both sides of the whiteboard. Compares RESHADED / PEDALS / ADEPT frameworks, teaches requirements scoping, diagramming, trade-off articulation, company-specific flavors, and RFC/design-doc authoring for Staff-level work.

- [Interview Frameworks Compared (RESHADED, PEDALS, ADEPT)](content/hld/part-11-interview-framework/00-frameworks-compared.md) — Compare the major system-design interview frameworks and pick the one you will use in every interview.
- [Requirements Scoping: Functional, Non-Functional, and MoSCoW](content/hld/part-11-interview-framework/01-requirements-scoping.md) — Master the first five minutes of a system design interview: functional vs non-functional requirements, MoSCoW prioritization, and time-boxing the scope.
- [Diagramming Skills for System Design Interviews](content/hld/part-11-interview-framework/02-diagramming-skills.md) — Build whiteboard and virtual diagrams that interviewers can read: consistent notation, flow direction, and the tools (Excalidraw, Miro) that the industry prefers.
- [Trade-off Articulation: Saying 'It Depends' Well](content/hld/part-11-interview-framework/03-trade-off-articulation.md) — Learn to verbalize design trade-offs the way senior engineers do: name the axis, state the dependency, and commit to a choice.
- [Company-Specific Interview Flavors (Amazon, Google, Meta, Netflix)](content/hld/part-11-interview-framework/04-company-specific-flavors.md) — How the same system design question looks different at Amazon, Google, Meta, and Netflix: leadership principles, scale emphasis, product sense, and simplicity.
- [Design Doc Authoring: RFCs, ADRs, and the Staff Engineer's Written Output](content/hld/part-11-interview-framework/05-design-doc-authoring.md) — How to write ADRs, design docs, and RFCs that drive alignment, record decisions, and demonstrate Staff+ engineering judgment.

</details>

### Trade-offs Library

The design questions that come up again and again, each answered on a dedicated page with a decision flowchart, a comparison table, when to pick each side, real-world examples and citations. Chapters across the book link here.

<details>
<summary><strong>All trade-off pages</strong> — consistency, storage, APIs, real-time, scaling, transactions, deployment</summary>

- [Strong vs Eventual Consistency](content/hld/trade-offs/01-strong-vs-eventual-consistency.md) — when to pick linearizable consistency, when eventual is enough, and the session-guarantees hybrid that most production systems actually run.
- [ACID vs BASE](content/hld/trade-offs/02-acid-vs-base.md) — When ACID transactions earn their coordination cost, when BASE is the only thing that scales, and why most systems run both.
- [SQL vs NoSQL](content/hld/trade-offs/03-sql-vs-nosql.md) — When relational wins, when non-relational wins, and why 'SQL does not scale' is almost always wrong in 2026.
- [Latency vs Throughput](content/hld/trade-offs/04-latency-vs-throughput.md) — When to optimize for the single request, when to optimize for the aggregate, and why batching has a non-obvious ceiling.
- [CAP and PACELC Applied](content/hld/trade-offs/05-cap-and-pacelc.md) — Decision guide for picking CP or AP under partition, and why PACELC's else-clause (latency vs consistency) is the choice you face on every request.
- [Cache Strategies: Cache-Aside vs Write-Through vs Write-Behind](content/hld/trade-offs/06-cache-strategies.md) — Decision guide for picking the right cache-database coordination pattern: what you gain, what you lose, and why most systems use a hybrid.
- [Batch vs Stream Processing](content/hld/trade-offs/07-batch-vs-stream.md) — Decision guide for choosing discrete job runs vs continuous flow, pinned to the freshness SLO that actually matters.
- [Load Balancer vs Reverse Proxy vs API Gateway](content/hld/trade-offs/08-load-balancer-vs-proxy-vs-gateway.md) — Decision guide for choosing between L4 load balancers, L7 reverse proxies, and API gateways based on your traffic layer, protocol, and policy needs.
- [REST vs gRPC vs GraphQL](content/hld/trade-offs/09-rest-vs-grpc-vs-graphql.md) — Decision guide for picking the right API protocol based on caller identity, caching needs, and payload shape.
- [Polling vs Long-Polling vs SSE vs WebSockets vs Webhooks](content/hld/trade-offs/10-polling-vs-websockets.md) — Decision guide for picking the right real-time pattern. Five options, each right for a different niche; the wrong one means missed updates, wasted bandwidth, or operational pain.
- [Rate Limiting Algorithms: Token Bucket vs Sliding Window](content/hld/trade-offs/11-rate-limiting-algorithms.md) — Decision guide for picking the right rate-limiting algorithm. Token bucket tolerates bursts; sliding window enforces accuracy; the hybrid path layers both.
- [Optimistic vs Pessimistic Concurrency Control](content/hld/trade-offs/12-optimistic-vs-pessimistic-locking.md) — Decision guide for picking validate-at-commit vs lock-first concurrency. The answer depends on conflict rate, retry cost, and side effects.
- [Partitioning Schemes: Range, Hash, Consistent Hash, Directory](content/hld/trade-offs/13-partitioning-schemes.md) — Decision guide for the four canonical partitioning strategies. Pick based on query pattern, rebalance cost, and hot-spot risk.
- [B-tree vs LSM-tree Storage](content/hld/trade-offs/14-btree-vs-lsm.md) — Decision guide for choosing between B-tree and LSM-tree storage engines based on read:write ratio, latency SLOs, and operational complexity.
- [Monolith vs Microservices](content/hld/trade-offs/15-monolith-vs-microservices.md) — Decision guide for the architecture choice that mirrors your org chart. Team size and domain stability decide, not traffic.
- [Replication Topologies: Leader-Follower, Multi-Leader, Leaderless](content/hld/trade-offs/16-replication-topologies.md) — Decision guide for picking how writes propagate: single-leader, multi-leader, leaderless, or per-range-leader hybrid.
- [Distributed Transactions: 2PC vs Saga vs TCC](content/hld/trade-offs/17-distributed-transactions.md) — Decision guide for choosing between two-phase commit, saga compensations, and try-confirm-cancel based on isolation needs, transaction duration, and participant control.
- [Push vs Pull (Fan-out, Messaging, Feed)](content/hld/trade-offs/18-push-vs-pull.md) — Decision guide for the fundamental data-propagation choice: push front-loads compute on writes, pull back-loads it on reads. The fan-out ratio decides.
- [Lambda vs Kappa Architecture](content/hld/trade-offs/19-lambda-vs-kappa.md) — Decision guide for choosing two pipelines (batch + stream) vs one (stream-only with log replay) for analytics data systems.
- [Vertical vs Horizontal Scaling](content/hld/trade-offs/20-vertical-vs-horizontal-scaling.md) — Decision guide for scaling up a single machine vs scaling out across many. Default: vertical first, horizontal only when measured bottlenecks demand it.
- [Normalization vs Denormalization](content/hld/trade-offs/21-normalization-vs-denormalization.md) — Decision guide for choosing between strict 3NF schemas and redundant pre-joined data, with the hybrid CDC-projection pattern most production systems actually run.
- [Single-Region vs Multi-Region Deployment](content/hld/trade-offs/22-single-vs-multi-region.md) — Decision guide for deployment geography: single-region is the default, multi-region is the most expensive choice you can make, and regional pinning is the hybrid most teams actually need.


</details>

---

## The DSA Handbook

**Data structures and algorithms, taught pattern by pattern.**

[Website](https://dsa.handbook.academy) *(public beta)* · [`content/dsa/`](content/dsa/) · [DSA style rules](STYLE_GUIDE.md#dsa-specific-deviations)

The DSA Handbook builds from Big-O and recursion through linear structures, searching and sorting, and the array-walking patterns, then trees, graphs, dynamic programming and the advanced string algorithms. It finishes with designing data structures to an API contract and with the interview itself: recognizing the pattern, asking the right questions, and narrating your solution.

**How a chapter is built.** Each chapter opens with a cheat-sheet table, explains the structure or pattern in depth, then works through LeetCode problems as prompt cards, each with a worked example, a solution walkthrough and the common mistakes. The Python solution is inline. Java, C++ and Go solutions sit next to the chapter in `lc-NNN/` folders (`sol.py`, `sol.java`, `sol.cpp`, `sol.go`), each with test cases.

### DSA parts at a glance

Click a part to see every chapter in it.

| Part | What it covers | Level |
|---|---|---|
| [0](#part-0--foundations) | **Foundations** — Big-O, recursion, bit ops, interview math, language idioms, choosing your language | Beginner |
| [1](#part-1--linear-data-structures) | **Linear Data Structures** — arrays, dynamic-array internals, strings, hash maps, stacks, queues, matrices | Beginner to advanced |
| [2](#part-2--search--sort) | **Search & Sort** — linear/binary search, comparison & linear-time sorts, heap sort, quickselect | Beginner to intermediate |
| [3](#part-3--two-pointers-sliding-window-prefix-sums) | **Two Pointers, Sliding Window, Prefix Sums** — the array-walking patterns that turn O(n²) into O(n) | Beginner to intermediate |
| [4](#part-4--stack--queue-patterns) | **Stack & Queue Patterns** — monotonic stack/deque, min/max stack, expression parsing, queue-from-stacks | Intermediate |
| [5](#part-5--linked-lists) | **Linked Lists** — pointer rewiring, reversal, k-group reversal, Floyd's cycle, merging, LRU cache | Beginner to intermediate |
| [6](#part-6--trees--heaps) | **Trees & Heaps** — traversals, Morris, BFS, heaps, BST, AVL/RB, tries, tree DP, segment trees | Beginner to advanced |
| [7](#part-7--recursion--backtracking) | **Recursion & Backtracking** — recursion patterns, the template, subsets/perms, N-Queens, Sudoku, randomized algos | Intermediate to advanced |
| [8](#part-8--graphs) | **Graphs** — BFS/DFS, components, topo, cycles, bipartite, union-find, Dijkstra, Bellman-Ford, MSTs | Beginner to advanced |
| [9](#part-9--dynamic-programming) | **Dynamic Programming** — memo↔tab, 1D/grid/interval/tree/bitmask, knapsack, LCS, edit distance, LIS, palindromes | Intermediate to advanced |
| [10](#part-10--greedy) | **Greedy** — when local choices win, intervals, activity selection, Huffman, jump games | Intermediate |
| [11](#part-11--bit-manipulation) | **Bit Manipulation** — the bit-ops cookbook, XOR patterns, bitmask techniques, performance tricks | Intermediate to advanced |
| [12](#part-12--strings--pattern-matching) | **Strings & Pattern Matching** — naive matching, Rabin-Karp, KMP, Z-array, Aho-Corasick, suffix arrays | Intermediate to advanced |
| [13](#part-13--design-the-data-structure) | **Design the Data Structure** — LRU/LFU, min stacks, hit counter, trie autocomplete, Twitter feed, game state | Intermediate to advanced |
| [14](#part-14--interview-framework) | **Interview Framework** — pattern recognition, clarifying questions, communicating, complexity, mocks, per-company tracks | Intermediate |

<details>
<summary><strong>Part 0 — Foundations</strong> — Big-O, recursion, bit ops, interview math, language idioms, choosing your language</summary>

### Part 0 — Foundations

> **Who it's for:** anyone starting interview prep, or returning after a long pause.  
> **Level:** Beginner

The mental models and language fluency that everything else assumes. Big-O, the recursion mental model, bit-manipulation primer, the math you actually need for interviews, language idioms across Python / Java / C++ / Go, and how to pick which language to interview in.

- [How to use this handbook](content/dsa/part-0-foundations/00-how-to-use.md) — How to read this handbook: who it's for, what to skip, how to pick a language, and the four questions every DSA resource ducks.
- [Computational complexity and Big-O](content/dsa/part-0-foundations/01-complexity-big-o.md) — Computational complexity, Big-O, and the asymptotic vocabulary every algorithm chapter assumes you have. The five Bachmann-Landau notations.
- [The recursion mental model](content/dsa/part-0-foundations/02-recursion-mental-model.md) — The mental model for recursion: base case, recursive case, and how to read tree-shaped recursion without losing your place.
- [Bit manipulation primer](content/dsa/part-0-foundations/03-bit-manipulation-primer.md) — Bit manipulation primer: AND, OR, XOR, NOT, shifts, popcount. The bit-level idioms that show up in interview problems.
- [Math for interviews](content/dsa/part-0-foundations/04-math-for-interviews.md) — The math you actually need for technical interviews: modular arithmetic, GCD, primality, combinatorics, integer overflow.
- [Language idioms across Python, Java, C++, Go](content/dsa/part-0-foundations/05-language-idioms.md) — Idiomatic patterns for Python, Java, C++, and Go: collections, iteration, sorting, comparators. The dialect each language wants you to write.
- [Choosing your interview language](content/dsa/part-0-foundations/06-choosing-your-language.md) — How to pick a language for technical interviews: trade-offs, what each language costs you in problem-solving time, and a decision tree.

</details>

<details>
<summary><strong>Part 1 — Linear Data Structures</strong> — arrays, dynamic-array internals, strings, hash maps, stacks, queues, matrices</summary>

### Part 1 — Linear Data Structures

> **Who it's for:** everyone. These structures show up in most interview problems.  
> **Level:** Beginner to advanced

The contiguous-memory and bucket-based data structures: arrays (static / dynamic / multi-dimensional), the amortized-O(1) doubling rule that makes a `vector` work, strings as encoded byte arrays, hash maps and hash sets, the load-factor / collision math behind them, stacks and queues with the call-stack analogy, and matrix manipulation tricks (rotate-in-place, spiral, transpose).

- [Arrays: static, dynamic, multi-dimensional](content/dsa/part-1-linear-data-structures/00-arrays.md) — Arrays: contiguous memory, O(1) indexing, and the operations that differ between fixed-size arrays and dynamic arrays.
- [Dynamic array internals](content/dsa/part-1-linear-data-structures/01-dynamic-array-internals.md) — How dynamic arrays grow: amortised O(1) append, the doubling trick, capacity vs length, and what each language calls them.
- [Strings: encoding, immutability, builders](content/dsa/part-1-linear-data-structures/02-strings.md) — Strings as character arrays and beyond: immutability, encoding, concatenation cost, and the per-language trade-offs that catch interviews out.
- [Hash maps and hash sets](content/dsa/part-1-linear-data-structures/03-hash-maps.md) — Hash maps from first principles: hash functions, buckets, average vs worst-case complexity, and the standard library implementations.
- [Hash collisions and the load factor](content/dsa/part-1-linear-data-structures/04-hash-collisions.md) — Hash collisions: separate chaining, open addressing, load factor, rehashing, and why hash maps degrade to O(n) under adversarial keys.
- [Stacks and the call stack analogy](content/dsa/part-1-linear-data-structures/05-stacks.md) — Stacks as data structures and algorithmic primitives: LIFO, function-call stacks, and the interview problems that scream 'stack'.
- [Queues, deques, and circular buffers](content/dsa/part-1-linear-data-structures/06-queues-deques.md) — Queues and deques: FIFO, double-ended, ring buffers, and the BFS / sliding-window problems where the right primitive is a deque.
- [Matrix manipulation](content/dsa/part-1-linear-data-structures/07-matrix-manipulation.md) — 2D arrays and matrix manipulation: in-place rotation, transposition, spiral traversal, and indexing without off-by-one bugs.

</details>

<details>
<summary><strong>Part 2 — Search & Sort</strong> — linear/binary search, comparison & linear-time sorts, heap sort, quickselect</summary>

### Part 2 — Search & Sort

> **Who it's for:** every interviewee. Binary search alone shows up again and again.  
> **Level:** Beginner to intermediate

How to find things and how to order things. Linear search and when it's actually the right answer; the canonical binary search written without off-by-one bugs; the lower_bound / upper_bound / peak / rotated-array variants; the comparison-sort family (insertion, merge, quicksort with the production hybrids like Timsort and Introsort); heap sort and why `n log n` is the comparison-sort lower bound; the linear-time sorts (counting, radix, bucket); and quickselect for the top-k problems.

- [Linear search and what it's good for](content/dsa/part-2-search-sort/00-linear-search.md) — Linear search: when O(n) is the right answer, and the problems where the trick is recognising you don't need anything cleverer.
- [Binary search: the canonical version](content/dsa/part-2-search-sort/01-binary-search-canonical.md) — Binary search done right: the canonical template, off-by-one pitfalls, and the invariant you need to articulate before writing the loop.
- [Binary search variants: lower_bound, upper_bound, peaks, and rotated arrays](content/dsa/part-2-search-sort/02-binary-search-variants.md) — Binary search beyond sorted arrays: lower_bound, upper_bound, first-true, last-true, and binary search on the answer space.
- [Comparison sorts I: insertion sort and merge sort](content/dsa/part-2-search-sort/03-comparison-sorts-1.md) — Insertion, selection, and bubble sort: O(n^2) sorts, when each wins on real input, and the constant-factor lessons that hide inside them.
- [Comparison sorts II: quicksort, partition, and the production hybrids](content/dsa/part-2-search-sort/04-comparison-sorts-2.md) — Merge sort and quicksort: divide-and-conquer, partitioning, stability, and why production library sorts are hybrid algorithms.
- [Heap sort and the n log n lower bound](content/dsa/part-2-search-sort/05-heap-sort.md) — Heap sort and the binary heap: heapify, sift-up, sift-down, and why a heap is the right tool for k-way merges and priority queues.
- [Linear-time sorts: counting, radix, bucket](content/dsa/part-2-search-sort/06-linear-sorts.md) — Counting sort, radix sort, bucket sort: O(n) sorts that beat the comparison-sort lower bound when the input has structure.
- [Quickselect: linear-time selection](content/dsa/part-2-search-sort/07-quickselect.md) — Quickselect: O(n) average kth-smallest, partitioning, and the problems where you can dodge a full sort by selecting only the part you need.

</details>

<details>
<summary><strong>Part 3 — Two Pointers, Sliding Window, Prefix Sums</strong> — the array-walking patterns that turn O(n²) into O(n)</summary>

### Part 3 — Two Pointers, Sliding Window, Prefix Sums

> **Who it's for:** anyone whose nested-loop solutions keep timing out.  
> **Level:** Beginner to intermediate

Three closely related patterns that all amount to "walk the array smarter": opposite-ends two pointers (Container With Most Water, 3Sum), same-direction two pointers, fixed and variable sliding windows, prefix sums and difference arrays, and the prefix-sum + hash-map combo for "subarray sum equals K"-shaped problems.

- [Two pointers: opposite ends](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md) — Two pointers, opposite ends: the inward sweep, sorted-array invariants, and the canonical 'sum to target' / 'pair under constraint' patterns.
- [Two pointers: same direction](content/dsa/part-3-pointers-window-prefix/01-two-pointers-same-direction.md) — Two pointers, same direction: fast-slow pointers, in-place filtering, and the array problems that disguise this pattern.
- [Sliding window: fixed size](content/dsa/part-3-pointers-window-prefix/02-sliding-window-fixed.md) — Fixed-size sliding windows: maintaining a running aggregate in O(1) per step, and the problems whose constraint is window length.
- [Sliding window: variable size](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md) — Variable-size sliding windows: shrinking when the invariant breaks, and the longest-substring / minimum-window problem family.
- [Prefix sums and difference arrays](content/dsa/part-3-pointers-window-prefix/04-prefix-sums.md) — Prefix sums: O(1) range-sum queries, 2D extensions, and the subarray-sum problems that simplify once the right precomputation is in place.
- [The prefix-sum + hash-map combo](content/dsa/part-3-pointers-window-prefix/05-prefix-sum-hash.md) — Prefix sum + hash map: counting subarrays with a target sum, the canonical 'subarray sum equals K' problem family, and modulo extensions.

</details>

<details>
<summary><strong>Part 4 — Stack & Queue Patterns</strong> — monotonic stack/deque, min/max stack, expression parsing, queue-from-stacks</summary>

### Part 4 — Stack & Queue Patterns

> **Who it's for:** anyone struggling with Next-Greater-Element and sliding-window-maximum problems.  
> **Level:** Intermediate

Stack and queue *as algorithmic patterns*, not just data structures. Monotonic stacks (Daily Temperatures, Largest Rectangle in Histogram), monotonic deques (Sliding Window Maximum), min/max stacks (O(1) min query under push/pop), expression parsing (Shunting-Yard / RPN), and the queue-from-stacks amortization argument.

- [Monotonic stack](content/dsa/part-4-stack-queue-patterns/00-monotonic-stack.md) — Push indices, pop while the incoming value violates a monotone order. The data structure designed for the intersection of nearest-greater queries and one-pass linear scans.
- [Monotonic deque](content/dsa/part-4-stack-queue-patterns/01-monotonic-deque.md) — Pop from both ends to maintain a windowed running max or min in O(1) amortized per slide. The structure that makes sliding-window-extremum problems linear instead of n log k.
- [Min and max stacks](content/dsa/part-4-stack-queue-patterns/02-min-max-stack.md) — Augment a stack with an O(1) aggregate query by pinning a parallel auxiliary stack to it; scale the technique from running min to lazy bulk-update to frequency tracking.
- [Expression evaluation and parsing](content/dsa/part-4-stack-queue-patterns/03-expression-evaluation.md) — Stacks suspend operators until their right operand exists. The shunting-yard rhythm and the LeetCode 224/227/772 family where the order characters arrive in is not the order arithmetic should happen.
- [Queue from stacks](content/dsa/part-4-stack-queue-patterns/04-queue-from-stacks.md) — Implement a queue using only stack primitives. The two-stack lazy-transfer trick, amortized O(1) on every operation, and why the LIFO-from-FIFO inverse has no symmetric construction.

</details>

<details>
<summary><strong>Part 5 — Linked Lists</strong> — pointer rewiring, reversal, k-group reversal, Floyd's cycle, merging, LRU cache</summary>

### Part 5 — Linked Lists

> **Who it's for:** anyone who's drawn boxes-and-arrows on a whiteboard and gotten lost.  
> **Level:** Beginner to intermediate

Linked lists are pointer surgery. Sentinel-node patterns, the canonical iterative reversal (and the recursive cousin), reverse-in-groups-of-k, Floyd's tortoise-and-hare cycle detection (and why the cycle-start formula works), merging sorted lists, and the LRU cache as the canonical hash-map + doubly-linked-list combo.

- [Linked list fundamentals: sentinels, pointer rewiring, doubly-linked design](content/dsa/part-5-linked-lists/00-linked-list-fundamentals.md) — Sentinel and dummy nodes erase the boundary branching that special-cases head and tail. The pointer-rewiring discipline and the doubly-linked design every later chapter in Part 5 assumes.
- [Reversal patterns](content/dsa/part-5-linked-lists/01-reversal-patterns.md) — Reverse a singly-linked list in place with prev, curr, next. The snapshot-then-clobber rule, plus the iterative and recursive forms that show up as a primitive in every later linked-list chapter.
- [Reverse in groups of k](content/dsa/part-5-linked-lists/02-reverse-in-groups-k.md) — Three mechanical phases stacked on single-list reversal solve LeetCode 25 in O(1) extra memory, with the seam between groups handled cleanly.
- [Cycle detection (Floyd's tortoise and hare)](content/dsa/part-5-linked-lists/03-cycle-detection.md) — Two pointers, one stepping twice as fast as the other, locate a cycle's entry node in O(n) time and O(1) space. The modular-arithmetic three-line proof of why the second-phase reset works.
- [Merging linked lists](content/dsa/part-5-linked-lists/04-merging-linked-lists.md) — Merge sorted linked lists in place. The dummy-head trick that erases the first-node special case, two-list and k-list versions, and the heap-based and divide-and-conquer extensions to LC 23.
- [LRU cache: hash map plus doubly linked list](content/dsa/part-5-linked-lists/05-lru-cache.md) — Build the data structure behind LeetCode 146 from a doubly-linked list and a hash map. O(1) get and put with explicit list management, no shortcut through Python's OrderedDict.

</details>

<details>
<summary><strong>Part 6 — Trees & Heaps</strong> — traversals, Morris, BFS, heaps, BST, AVL/RB, tries, tree DP, segment trees</summary>

### Part 6 — Trees & Heaps

> **Who it's for:** anyone past the linear-data-structure phase of prep.  
> **Level:** Beginner to advanced

The hierarchical structures and the priority queue. Binary tree fundamentals, the three depth-first traversals (pre/in/post — both recursive and iterative), Morris traversal for O(1) space, level-order BFS, heaps and priority queues (heapify in O(n)), binary search trees, AVL rotations, a red-black overview, tries, the tree-DP primer (post-order with side state), and an introduction to segment trees for range queries.

- [Binary tree fundamentals](content/dsa/part-6-trees-heaps/00-binary-tree-fundamentals.md) — Tree terminology, height vs depth, the two physical representations, and the on-disk vocabulary every later Part 6 chapter assumes you have pinned down.
- [Tree traversals: pre, in, post](content/dsa/part-6-trees-heaps/01-tree-traversals.md) — One recursive skeleton has three positions for the visit() call. The pre, in, and post placements solve different problem families on the same scaffolding.
- [Morris traversal: O(1)-space inorder by threading](content/dsa/part-6-trees-heaps/02-morris-traversal.md) — Walk a binary tree in inorder with no recursion stack and no auxiliary memory by threading temporary right-pointers from each subtree's rightmost descendant back to its successor.
- [Level-order traversal: BFS on trees](content/dsa/part-6-trees-heaps/03-level-order-traversal.md) — BFS on trees, with the level_size = len(queue) snapshot that turns 'visit every node' into 'visit every node grouped by depth' with the boundaries preserved.
- [Heaps and priority queues](content/dsa/part-6-trees-heaps/04-heaps-priority-queues.md) — Sift-up and sift-down, Floyd's O(n) bottom-up build vs O(n log n) repeated insert, and the language-by-language API for the priority-queue primitive.
- [Binary search trees](content/dsa/part-6-trees-heaps/05-binary-search-trees.md) — The BST invariant, search/insert/delete operations, and why every shipping standard library uses a balanced variant instead of a plain BST.
- [AVL trees and rotations](content/dsa/part-6-trees-heaps/06-avl-rotations.md) — Self-balancing BSTs from first principles: the AVL invariant, the four rotation cases, the 1.44 log(n+2) height bound, and why every production ordered map descends from this 1962 paper.
- [Red-black trees: an overview](content/dsa/part-6-trees-heaps/07-red-black-overview.md) — The balancing scheme behind TreeMap, std::map, and the Linux scheduler. Five invariants, the rotation cases at a high level, and what an interview can reasonably ask about them.
- [Tries](content/dsa/part-6-trees-heaps/08-tries.md) — Children-map-plus-end-flag nodes give prefix walks in O(L) on query length. The autocomplete and IP-routing problem family where prefix structure is the whole point.
- [Tree DP primer: post-order with side state](content/dsa/part-6-trees-heaps/09-tree-dp.md) — Post-order helpers thread side state down through arguments, return aggregates up the call stack, and use a global to track diameter-style through-this-node optima.
- [Segment trees](content/dsa/part-6-trees-heaps/10-segment-tree.md) — O(log n) point updates and O(log n) range queries on the same array. The recursive build and the lazy-propagation extension for range updates.

</details>

<details>
<summary><strong>Part 7 — Recursion & Backtracking</strong> — recursion patterns, the template, subsets/perms, N-Queens, Sudoku, randomized algos</summary>

### Part 7 — Recursion & Backtracking

> **Who it's for:** anyone whose subset/permutation/combination solutions feel like guesswork.  
> **Level:** Intermediate to advanced

Backtracking is just DFS with state-restoration discipline. The recursion patterns (linear, tree, divide-and-conquer); the backtracking template you can adapt to any constraint problem; subsets, combinations, and permutations; N-Queens with pruning; Sudoku with constraint propagation and forward checking; word search on a grid; and Fisher-Yates, reservoir sampling, and rejection sampling for randomized algorithms.

- [Recursion patterns: linear, tree, and divide-and-conquer](content/dsa/part-7-recursion-backtracking/00-recursion-patterns.md) — Three call-tree shapes — linear, tree, divide-and-conquer — and how to read the shape from the recursive case so you know whether you need memoization, an accumulator, or neither.
- [The backtracking template](content/dsa/part-7-recursion-backtracking/01-backtracking-template.md) — Choose, recurse, unchoose, with prune-on-partial-information as the move that turns exponential search into something that finishes.
- [Subsets, combinations, permutations](content/dsa/part-7-recursion-backtracking/02-subsets-combinations-permutations.md) — One recursion with three knobs (when to snapshot the path, what to skip, when to allow repeats) covers subsets (LC 78), permutations (LC 46), and combination sum (LC 39).
- [N-Queens: pruning and constraint propagation](content/dsa/part-7-recursion-backtracking/03-n-queens.md) — Column and diagonal occupancy bitsets give O(1) attack checks. Symmetry pruning and the constraint-propagation idea that generalizes to Sudoku and beyond.
- [Sudoku solver: constraint propagation and forward checking](content/dsa/part-7-recursion-backtracking/04-sudoku-solver.md) — Row, column, and box bitmasks combined with MRV cell selection and a forward-checking loop solve a 9x9 in milliseconds, despite 4 × 10^38 candidate fillings.
- [Word search and grid backtracking](content/dsa/part-7-recursion-backtracking/05-word-search.md) — Grid DFS with mark-and-restore: the in-place visited trick that turns a 2D backtracking problem into one clean recursion.
- [Randomized algorithms: Fisher-Yates, reservoir sampling, rejection sampling](content/dsa/part-7-recursion-backtracking/06-randomized-algorithms.md) — Three randomized recipes — Fisher-Yates shuffle, reservoir sampling, rejection sampling — whose proofs of uniform correctness are the actual lesson, not the code.

</details>

<details>
<summary><strong>Part 8 — Graphs</strong> — BFS/DFS, components, topo, cycles, bipartite, union-find, Dijkstra, Bellman-Ford, MSTs</summary>

### Part 8 — Graphs

> **Who it's for:** anyone preparing for FAANG-tier interviews — graph problems are the differentiator.  
> **Level:** Beginner to advanced

The graph chapters are interview-grade end-to-end. Adjacency-list vs adjacency-matrix representations; BFS and DFS as orthogonal traversal templates; connected components and flood fill (Number of Islands); topological sort via Kahn's queue and via DFS post-order reverse; cycle detection on directed and undirected graphs; bipartite checking; union-find with path compression and union-by-rank; Dijkstra's algorithm; Bellman-Ford and negative cycles; and minimum spanning trees via both Kruskal and Prim.

- [Graph representation](content/dsa/part-8-graphs/00-graph-representation.md) — Three ways to store a graph (adjacency list, adjacency matrix, edge list), the memory math that decides between them, and the default every interview assumes.
- [Breadth-first search](content/dsa/part-8-graphs/01-bfs.md) — Queue, visited set, and the discipline of never enqueuing the same vertex twice. The shortest-path-on-unweighted-edges algorithm, plus its multi-source and grid variants.
- [Depth-first search](content/dsa/part-8-graphs/02-dfs.md) — Five lines that visit on entry and recurse on neighbors, plus the customization knobs (entry hook, exit hook, edge classification) every advanced graph algorithm later in Part 8 turns.
- [Connected components and flood fill](content/dsa/part-8-graphs/03-connected-components.md) — Counting and measuring components in a graph or grid: the outer scan that turns plain BFS or DFS into the algorithm.
- [Topological sort: Kahn's algorithm](content/dsa/part-8-graphs/04-topological-sort-kahn.md) — Indegree-driven, queue-based, iterative. Kahn's algorithm flags a cycle by failing to consume every vertex.
- [Topological sort: DFS post-order reverse](content/dsa/part-8-graphs/05-topological-sort-dfs.md) — DFS-based topological sort: three-color recursion, post-order emission, and the algorithms that fall out of the same skeleton — Tarjan's bridges, Hierholzer's Eulerian path, cycle-length detection.
- [Cycle detection in graphs](content/dsa/part-8-graphs/06-cycle-detection-graphs.md) — Three-state DFS coloring for directed cycles, parent-aware single-state DFS for undirected, and the bug both halves share when the wrong one is used.
- [Bipartite check](content/dsa/part-8-graphs/07-bipartite-check.md) — Two-color a graph by BFS or DFS. The odd-cycle obstruction, the linear-time check, and the problem family that disguises this question as 'split into two groups'.
- [Union-Find: parent forests, path compression, and union by rank](content/dsa/part-8-graphs/08-union-find.md) — Parent forests, union by rank, path compression, and the inverse-Ackermann amortized bound. The cycle-detection and connected-components problem family it owns.
- [Dijkstra's shortest-path algorithm](content/dsa/part-8-graphs/09-dijkstra.md) — Single-source shortest paths on weighted graphs with non-negative edges: the priority-queue mechanics, the lazy-deletion idiom, and the min-max-path and 0-1 BFS specializations.
- [Bellman-Ford and negative cycles](content/dsa/part-8-graphs/10-bellman-ford.md) — V-1 edge relaxations on every edge, an extra Vth pass to detect negative cycles, and the algorithm that handles the negative-edge case Dijkstra silently mis-reports.
- [Minimum spanning tree: Kruskal's algorithm](content/dsa/part-8-graphs/11-mst-kruskal.md) — Kruskal's algorithm: sort edges by weight, accept each one whose endpoints sit in different components, halt at n-1 edges. The cycle check is union-find; the cost is the sort.
- [Minimum spanning trees: Prim's algorithm](content/dsa/part-8-graphs/12-mst-prim.md) — Prim's algorithm grows a minimum spanning tree from a single start vertex by absorbing the cheapest crossing edge. Same MST as Kruskal, different path; better choice on dense and implicit graphs.

</details>

<details>
<summary><strong>Part 9 — Dynamic Programming</strong> — memo↔tab, 1D/grid/interval/tree/bitmask, knapsack, LCS, edit distance, LIS, palindromes</summary>

### Part 9 — Dynamic Programming

> **Who it's for:** the part most candidates fear most. Read this if "DP problems just don't click."  
> **Level:** Intermediate to advanced

The most demanding part of the handbook. Build DP up from recursion (top-down memoization) and re-derive the bottom-up tabulation; 1D-state DPs (Climbing Stairs, House Robber, decision DP); the string-prefix decision DPs (Decode Ways, Word Break); 0/1 and unbounded knapsacks; longest-common-subsequence and edit distance; LIS in O(n²) and the patience-sort O(n log n) variant; palindrome DP; interval DP (matrix chain, burst balloons); grid DP; tree DP; and the bitmask DP family for "all subsets" problems.

- [Dynamic Programming: From Recursion to Memoization](content/dsa/part-9-dynamic-programming/00-dp-recursion-to-memo.md) — When a recursion's call tree carries redundancy, an eight-character cache drops Fibonacci from O(phi^n) to O(n). The systematic move from naive recursion to memoized recursion to bottom-up tabulation.
- [DP: bottom-up tabulation](content/dsa/part-9-dynamic-programming/01-dp-bottom-up-tabulation.md) — Convert memoized recursion to an iterative table fill: dependency DAG, topological order, loop, array. Plus the rolling-pair O(1) compression.
- [Dynamic programming on a 1D state](content/dsa/part-9-dynamic-programming/02-dp-1d.md) — 1D-state DP: when the answer at index i depends on a small fixed window of earlier indices. Climbing stairs, house robber, min cost climbing stairs, and the rolling-scalars space collapse.
- [Decode Ways and Word Break: string-prefix decision DP](content/dsa/part-9-dynamic-programming/03-dp-decode-word-break.md) — Two string-prefix decision DPs whose recurrences look different but run on the same `dp[i]` = OR-over-valid-splits skeleton. LC 91 Decode Ways and LC 139 Word Break.
- [0/1 knapsack](content/dsa/part-9-dynamic-programming/04-knapsack-01.md) — 0/1 knapsack: take-or-skip per item, the 1D table fill, why the inner loop sweeps right-to-left, and the family of subset-sum reformulations (LC 416, 494, 474, 879, 1049).
- [Unbounded knapsack: when items can be picked over and over](content/dsa/part-9-dynamic-programming/05-knapsack-unbounded.md) — One inner-loop direction reversed from 0/1 knapsack unlocks the coin-change family. How 'minimum coins', 'count of ways', and 'minimum cost' all fit one recurrence.
- [Longest common subsequence](content/dsa/part-9-dynamic-programming/06-lcs.md) — The O(n*m) 2D DP for longest common subsequence, parent-pointer recovery for the actual subsequence, and the edit-distance and shortest-common-supersequence variants that live on the same table.
- [Edit distance](content/dsa/part-9-dynamic-programming/07-edit-distance.md) — Wagner-Fischer's three-way recurrence for the minimum number of insertions, deletions, and replacements that turn one string into another. The canonical 2D string DP.
- [Longest Increasing Subsequence: the quadratic DP](content/dsa/part-9-dynamic-programming/08-lis-quadratic.md) — Per-index `dp[i]` = max-over-smaller-predecessors gives the O(n^2) LIS. Parent-pointer recovery and the variants (LIS count, LIS with k-tolerance) that stay quadratic.
- [LIS: patience sort](content/dsa/part-9-dynamic-programming/09-lis-patience-sort.md) — From 9.8's O(n^2) DP to O(n log n): the patience-sort framing, the tails-array invariant, binary search by tail value, and the LC 354 sort-then-LIS reduction.
- [Palindrome DP](content/dsa/part-9-dynamic-programming/10-palindrome-dp.md) — Filling a 2D table whose recurrence reads `dp[i+1][j-1]` forces a diagonal fill order. The longest-palindromic-substring and min-cuts family that lives on it.
- [Interval DP: matrix chain and burst balloons](content/dsa/part-9-dynamic-programming/11-interval-dp.md) — State is `dp[l][r]`, and the recurrence picks the LAST operation in the range. Burst Balloons (LC 312) and Matrix Chain Multiplication (LC 1039) are the canonical specimens.
- [Grid DP: forward fills, backward survives](content/dsa/part-9-dynamic-programming/12-grid-dp.md) — Top-down forward fills (Unique Paths, Min Path Sum) and bottom-up backward survives (Dungeon Game). The direction is picked by whether the constraint applies at start or finish.
- [Tree DP: states that travel up the call stack](content/dsa/part-9-dynamic-programming/13-tree-dp.md) — Post-order helpers that return more than one number to the parent — (rob, skip), (diameter, depth) — centered on LC 337 House Robber III and LC 124 Max Path Sum.
- [Bitmask DP](content/dsa/part-9-dynamic-programming/14-bitmask-dp.md) — A subset of a small ground set encoded as one integer, `dp[mask]` = ..., and the assignment / TSP / shortest-path-visiting-all family where this state is the only one that fits.

</details>

<details>
<summary><strong>Part 10 — Greedy</strong> — when local choices win, intervals, activity selection, Huffman, jump games</summary>

### Part 10 — Greedy

> **Who it's for:** anyone who's been burned by a greedy that "looked right" and got Wrong Answer.  
> **Level:** Intermediate

When local choices yield global optima, and how to prove it. Greedy thinking framed against DP; interval scheduling (the sorting comparator *is* the algorithm); activity selection and the task-scheduler family; Huffman encoding; and Jump Games / Gas Station as canonical "scan once, maintain a running invariant" problems.

- [Greedy thinking: when local choices win, and when they don't](content/dsa/part-10-greedy/00-greedy-thinking.md) — When the locally-best choice provably aggregates to the globally-best answer. The exchange-argument proof technique and the failure modes where greedy looks right and isn't.
- [Interval scheduling: the comparator is the algorithm](content/dsa/part-10-greedy/01-interval-scheduling.md) — Sort by end time and you've picked the maximum non-overlapping subset. The comparator (not the DP, not the heap) is the entire algorithm.
- [Activity selection and the task-scheduler family](content/dsa/part-10-greedy/02-activity-selection.md) — A max-heap of remaining tasks paired with a cooldown queue. The same skeleton solves LC 621 Task Scheduler, room booking, and conference assignment.
- [Huffman encoding](content/dsa/part-10-greedy/03-huffman-encoding.md) — Build the optimal prefix-free code bottom-up by repeatedly merging the two least-frequent symbols. The optimality proof and why this construction wins where top-down construction fails.
- [Jump games and gas station](content/dsa/part-10-greedy/04-jump-games-gas-station.md) — Two array problems that look O(n^2), both solved by a single linear pass that maintains one running quantity. LC 55 Jump Game and LC 134 Gas Station.

</details>

<details>
<summary><strong>Part 11 — Bit Manipulation</strong> — the bit-ops cookbook, XOR patterns, bitmask techniques, performance tricks</summary>

### Part 11 — Bit Manipulation

> **Who it's for:** anyone preparing for low-level / performance-oriented interviews (HFT, embedded, kernel, GPU).  
> **Level:** Intermediate to advanced

The bit-ops cookbook (set/clear/toggle, lowest-set-bit, popcount); XOR patterns (Single Number I/II/III, Missing Number); bitmask techniques as compact subset state; and bit-level performance tricks for the "your code is correct, just make it 10× faster" interview round.

- [Bit operations cookbook](content/dsa/part-11-bit-manipulation/00-bit-operations-cookbook.md) — The two identities the rest of Part 11 stands on: x & -x for the lowest set bit, x & (x-1) to clear it. Plus popcount, set/clear/flip/test, and subset iteration.
- [XOR patterns](content/dsa/part-11-bit-manipulation/01-xor-patterns.md) — XOR patterns: pair-cancellation as a bit-vector group law, and the family of LC problems it solves in O(n) time and O(1) space.
- [Bitmask techniques](content/dsa/part-11-bit-manipulation/02-bitmask-techniques.md) — Encode a small set as an integer; iterate every subset; walk the submasks of a mask. The substrate behind bitmask DP.
- [Bit tricks for performance](content/dsa/part-11-bit-manipulation/03-bit-tricks-performance.md) — A toolkit of bit-pattern identities — Brian Kernighan's loop, x & -x, SWAR popcount, de Bruijn bit-scan — and the hardware intrinsics that have made most of them obsolete in production.

</details>

<details>
<summary><strong>Part 12 — Strings & Pattern Matching</strong> — naive matching, Rabin-Karp, KMP, Z-array, Aho-Corasick, suffix arrays</summary>

### Part 12 — Strings & Pattern Matching

> **Who it's for:** anyone interviewing where strings are a focus area (search infra, NLP infra, IDEs, compiler tooling).  
> **Level:** Intermediate to advanced

Substring search beyond the naive O(n·m) baseline. Rabin-Karp with rolling hashes; KMP and the failure function (and why it generalizes the prefix-function); the Z-algorithm; Aho-Corasick for matching many patterns in one pass; and an introduction to suffix arrays for "all substring" queries.

- [Naive string matching](content/dsa/part-12-strings-pattern-matching/00-naive-string-matching.md) — The O(nm) double loop hidden inside str.find and str.indexOf. Average-case behavior on real text, and the adversarial inputs that motivate KMP and Rabin-Karp.
- [Rabin-Karp and rolling hashes](content/dsa/part-12-strings-pattern-matching/01-rabin-karp.md) — Rolling hashes give O(1)-per-slide hash maintenance for fixed-length windows. Double hashing defeats adversarial collisions and unlocks the duplicate-substring problem family.
- [KMP and the failure function](content/dsa/part-12-strings-pattern-matching/02-kmp.md) — Knuth-Morris-Pratt: deterministic O(n+m) substring search via the failure function, and the prefix-suffix table that solves a small family of problems on its own.
- [Z-algorithm](content/dsa/part-12-strings-pattern-matching/03-z-algorithm.md) — Z-array as the prefix-match table on a string; the [l, r) window invariant that makes it linear; how it compares with KMP for exact pattern matching.
- [Aho-Corasick: many patterns, one pass](content/dsa/part-12-strings-pattern-matching/04-aho-corasick.md) — A trie with failure links: how Aho-Corasick scans a text once and reports every occurrence of every pattern in a fixed dictionary in O(n + m + z) time.
- [Suffix arrays: a sorted index of every suffix](content/dsa/part-12-strings-pattern-matching/05-suffix-array.md) — A sorted index of every suffix in roughly 4n bytes, plus the LCP array. The substring-search, longest-repeated-substring, and BWT applications built on these two arrays.

</details>

<details>
<summary><strong>Part 13 — Design the Data Structure</strong> — LRU/LFU, min stacks, hit counter, trie autocomplete, Twitter feed, game state</summary>

### Part 13 — Design the Data Structure

> **Who it's for:** SDE2+ candidates — "design X" is the staple senior-coding-round question type.  
> **Level:** Intermediate to advanced

The bridge between DSA and HLD: how to compose primitives into APIs that meet a per-operation complexity contract. The full LRU treatment with concurrency and multi-tier framing; LFU via frequency-bucketed doubly-linked lists; min stacks and max-frequency stacks; hit counters and rate limiters; trie-backed autocomplete; Twitter-feed design; and a game-state design vignette.

- [LRU cache: design framing, concurrency, and multi-tier deployment](content/dsa/part-13-design-the-data-structure/00-lru-cache.md) — Pointer rewiring is the warm-up for LeetCode 146. Thread-safety, multi-tier deployment, and Caffeine-style admission policies are the actual interview.
- [LFU cache: hash map plus frequency-bucketed doubly linked lists](content/dsa/part-13-design-the-data-structure/01-lfu-cache.md) — A hash map keyed by frequency, each value a doubly-linked list of equally-frequent entries, plus a min-frequency tracker. The construction that earns LeetCode 460 its Hard rating.
- [Min stack and max-frequency stack](content/dsa/part-13-design-the-data-structure/02-min-stack-maxfreq.md) — Two design problems, one technique. Pin a parallel auxiliary to a stack and the augmented operation collapses to a peek; the auxiliary's shape tracks the contract.
- [Hit counter and rate limiter](content/dsa/part-13-design-the-data-structure/03-hit-counter-rate-limiter.md) — Fixed-window, sliding-window-log, and token-bucket variants of LC 362 Design Hit Counter, with the precision-and-memory trade-offs that production systems (Cloudflare, Stripe, AWS) pick from.
- [Trie autocomplete](content/dsa/part-13-design-the-data-structure/04-trie-autocomplete.md) — Per-node ranked top-k cache, persistent suggestions across keystrokes, and the design moves that take a vanilla trie from O(L + answers) to single-digit-microsecond typeahead.
- [Twitter feed design](content/dsa/part-13-design-the-data-structure/05-twitter-feed.md) — LC 355 Design Twitter as a mechanics-driven design class: monotonic timestamps, per-user append-only logs, and a k-way merge through a heap of author cursors for the news feed.
- [Game state design](content/dsa/part-13-design-the-data-structure/06-game-state-design.md) — Store the answer the board would give, not the board itself. Per-row, per-column, per-diagonal counters give LC 348 Tic-Tac-Toe O(1) per move and O(n) memory total.

</details>

<details>
<summary><strong>Part 14 — Interview Framework</strong> — pattern recognition, clarifying questions, communicating, complexity, mocks, per-company tracks</summary>

### Part 14 — Interview Framework

> **Who it's for:** anyone within a month of an actual interview window.  
> **Level:** Intermediate

The meta-skills that turn a correct solution into a passing one. Pattern-recognition drills; the first-five-minutes clarifying-questions script; how to narrate while you code; how to discuss complexity convincingly; running productive mock interviews; the most common pitfalls; Amazon Leadership Principles (brief and narration); the Meta AI-assisted round (format, prompting tactics, common failures); and the per-company tracks index that points at company-specific reading lists.

- [Pattern recognition: the fastest skill to develop](content/dsa/part-14-interview-framework/00-pattern-recognition.md) — The twenty patterns that cover ~95% of new-grad FAANG coding rounds, the top five that cover half on their own, and the recognition rhythm that names the pattern in the first 90 seconds.
- [The first five minutes: clarifying questions](content/dsa/part-14-interview-framework/01-clarifying-questions.md) — What to ask in the first five minutes. The questions interviewers grade you on, the prompts that signal seniority, and the failure mode that costs the most candidates the round.
- [Communicating during the interview](content/dsa/part-14-interview-framework/02-communicating.md) — Thinking aloud, narrating trade-offs, and the interviewing.io data showing the 4-4-2 candidate beats the 3-3-4 candidate on outcomes.
- [Complexity discussions](content/dsa/part-14-interview-framework/03-complexity-discussions.md) — How to answer 'what's the time complexity?' in one sentence: derive vs memorize, time alongside space, the right qualifier (worst/average/amortized), all four signals at once.
- [The mock interview process](content/dsa/part-14-interview-framework/04-mock-interview-process.md) — When to start mocking, which platform to use, how many mocks you actually need, and how to run a debrief that converts a session into signal.
- [Common pitfalls](content/dsa/part-14-interview-framework/05-common-pitfalls.md) — The five highest-leverage failure modes at FAANG-tier loops: jumping to code, silent solving, missed clarifications, unstructured complexity answers, and the signal failures that look like skill failures.
- [Amazon Leadership Principles, briefly](content/dsa/part-14-interview-framework/06-amazon-lps-brief.md) — Which Leadership Principles surface most in coding rounds, why the chat at minute 5 and minute 50 is part of the rubric, and the rounds where 'I'll just be excellent at the algorithm' fails.
- [Amazon Leadership Principles narration](content/dsa/part-14-interview-framework/07-amazon-lps-narration.md) — STAR-format micro-narrations for the technical rounds, plus the eight to twelve full stories the behavioral and Bar Raiser rounds expect candidates to walk in carrying.
- [Meta's AI round: the format](content/dsa/part-14-interview-framework/08-meta-ai-round-format.md) — What Meta's AI-assisted coding round actually is in 2026: 60 minutes, three phases, a model menu, and a rubric that grades how you use the AI more than what the AI produces.
- [Meta's AI round: prompting tactics](content/dsa/part-14-interview-framework/09-meta-ai-round-prompting.md) — Prompting tactics for an AI-assisted coding round. The three-tier hierarchy (orchestrator, spot-checker, typist) that produces the behavior the rubric scores.
- [Meta's AI round: common failures](content/dsa/part-14-interview-framework/10-meta-ai-round-failures.md) — Candidates who treat the assistant as a solver, candidates who can't explain their own code, and the system-prompt hardening that breaks any prep built on 'AI will catch the bug'.
- [Per-company tracks: index and how to use](content/dsa/part-14-interview-framework/11-per-company-tracks-index.md) — When to open a per-company track, how to layer it on Parts 0-13, and the three signals that tell you it's time to move from pattern practice to company-specific calibration.

</details>

### Pattern decision pages

When a problem could be solved two ways (recursion or iteration, BFS or DFS, sliding window or prefix sums), a decision page compares them. Each one has a decision tree, a "pick A or pick B" table, typical problems for each side, and references.

<details>
<summary><strong>All pattern decision pages</strong></summary>

- [Recursion vs iteration: when does iteration matter](content/dsa/patterns/P-01-recursion-vs-iteration.md)
- [Memoization vs tabulation, top-down vs bottom-up](content/dsa/patterns/P-02-memoization-vs-tabulation.md)
- [Hash map vs sorted map: O(1) average vs O(log n) ordered](content/dsa/patterns/P-03-hash-map-vs-sorted-map.md)
- [Array vs linked list: when each wins](content/dsa/patterns/P-04-array-vs-linked-list.md)
- [Stack vs queue vs deque, picking the right LIFO/FIFO](content/dsa/patterns/P-05-stack-vs-queue-vs-deque.md)
- [Heap vs sorted array vs balanced BST vs language-sorted-set](content/dsa/patterns/P-06-heap-vs-sorted-array-vs-bst.md)
- [Two-heap median archetypes: when one heap is not enough](content/dsa/patterns/P-06b-two-heap-median-archetypes.md)
- [K-way merge and cursor heap](content/dsa/patterns/P-06c-k-way-merge-cursor-heap.md)
- [BFS vs DFS for graphs: when each is correct](content/dsa/patterns/P-07-bfs-vs-dfs-graphs.md)
- [Dijkstra vs Bellman-Ford vs 0-1 BFS vs A*, shortest-paths decision tree](content/dsa/patterns/P-08-shortest-paths-decision-tree.md)
- [Kruskal vs Prim, MST decision](content/dsa/patterns/P-09-kruskal-vs-prim.md)
- [Quicksort vs mergesort vs heapsort, picking your sort](content/dsa/patterns/P-10-quicksort-vs-mergesort-vs-heapsort.md)
- [Binary search vs linear scan, and binary search on the answer](content/dsa/patterns/P-11-binary-search-vs-linear-scan.md)
- [Two pointers vs sliding window: the lookalikes](content/dsa/patterns/P-12-two-pointers-vs-sliding-window.md)
- [Iterative vs Morris vs recursive tree traversal](content/dsa/patterns/P-13-iterative-vs-morris-vs-recursive-traversal.md)
- [Trie vs hash map vs sorted set: the prefix-query decision](content/dsa/patterns/P-14-trie-vs-hash-map-vs-sorted-set.md)
- [Union-Find vs DFS for connectivity](content/dsa/patterns/P-15-union-find-vs-dfs.md)
- [Topological sort: Kahn vs DFS-based](content/dsa/patterns/P-16-topological-sort-kahn-vs-dfs.md)
- [Greedy vs DP: when greedy is provably correct](content/dsa/patterns/P-17-greedy-vs-dp.md)
- [Backtracking vs DP: overlapping subproblems vs not](content/dsa/patterns/P-18-backtracking-vs-dp.md)
- [Recursion vs DP: when there is no overlap (tree traversal) vs when there is](content/dsa/patterns/P-19-recursion-vs-dp.md)
- [When to reach for bit manipulation](content/dsa/patterns/P-20-when-bit-manipulation.md)
- [BFS vs DFS for trees: level-order vs in/pre/post-order semantics](content/dsa/patterns/P-21-bfs-vs-dfs-trees.md)
- [Quickselect vs heap for top-K](content/dsa/patterns/P-22-quickselect-vs-heap-top-k.md)
- [Sliding window archetypes](content/dsa/patterns/P-23-sliding-window-archetypes.md)
- [Two-pointer archetypes: opposite-ends, fast-slow, partition, in-place dedup, merge-from-end](content/dsa/patterns/P-24-two-pointer-archetypes.md)
- [Prefix-sum archetypes (incl. prefix-sum + hash, prefix XOR, difference array, 2D)](content/dsa/patterns/P-25-prefix-sum-archetypes.md)
- [Monotonic stack archetypes](content/dsa/patterns/P-26-monotonic-stack-archetypes.md)
- [Monotonic deque archetypes](content/dsa/patterns/P-27-monotonic-deque-archetypes.md)
- [In-place reversal of a linked list group](content/dsa/patterns/P-28-in-place-linked-list-reversal.md)
- [Cyclic sort archetypes: missing, duplicate, and first-positive in a [1..n] permutation-shaped array](content/dsa/patterns/P-29-cyclic-sort-archetypes.md)
- [Top-K via heap or quickselect](content/dsa/patterns/P-30-top-k-heap-or-quickselect.md)
- [Merge intervals archetypes](content/dsa/patterns/P-31-merge-intervals-archetypes.md)
- [Tree DP archetypes](content/dsa/patterns/P-32-tree-dp-archetypes.md)
- [Bitmask DP archetypes](content/dsa/patterns/P-33-bitmask-dp-archetypes.md)
- [Backtracking template + pruning](content/dsa/patterns/P-34-backtracking-template-pruning.md)
- [Sweep line archetypes](content/dsa/patterns/P-35-sweep-line-archetypes.md)


</details>

### Long-form editorials

Classic interview problems treated as full essays: every approach from brute force to optimal, the proof of correctness, edge cases, and follow-up variants.

<details>
<summary><strong>All editorials</strong></summary>

- [LC 1 — Two Sum](content/dsa/editorials/LC-001-two-sum.md)
- [LC 3 — Longest Substring Without Repeating Characters](content/dsa/editorials/LC-003-longest-substring-without-repeating-characters.md)
- [LC 5 — Longest Palindromic Substring](content/dsa/editorials/LC-005-longest-palindromic-substring.md)
- [LC 11 — Container With Most Water](content/dsa/editorials/LC-011-container-with-most-water.md)
- [LC 15 — 3Sum](content/dsa/editorials/LC-015-3sum.md)


</details>

### Interactive widget specs

On [dsa.handbook.academy](https://dsa.handbook.academy), key chapters include interactive animations you can play, pause and step through, such as sliding windows, monotonic stacks and Dijkstra. Each widget is described in a YAML spec in [`content/dsa/widgets/`](content/dsa/widgets/), and indexed in [`_widget-registry.yml`](content/dsa/_widget-registry.yml). On GitHub, the chapter callouts link to the spec.

<details>
<summary><strong>Editorial widgets</strong></summary>

- [Two Sum (LC 1) — optimal one-pass hash map](content/dsa/widgets/e-LC001-two-sum.yml)
- [Longest Substring Without Repeating Characters (LC 3) — last-index jump](content/dsa/widgets/e-LC003-longest-substring.yml)
- [Longest Palindromic Substring (LC 5) — expand around centers](content/dsa/widgets/e-LC005-longest-palindrome.yml)
- [Container With Most Water (LC 11) — greedy two-pointer shrink](content/dsa/widgets/e-LC011-container.yml)
- [3Sum (LC 15) — sort + anchor + opposite-ends with duplicate-skip](content/dsa/widgets/e-LC015-3sum.yml)


</details>

<details>
<summary><strong>Pattern widgets</strong></summary>

- [Recursion call stack (factorial; three-shapes comparison)](content/dsa/widgets/w-01-recursion-call-stack.yml)
- [Hash table (chained insert + lookup)](content/dsa/widgets/w-02-hash-table.yml)
- [Matrix rotation (layered 4-cycle)](content/dsa/widgets/w-03-matrix-rotation.yml)
- [Binary search (exact-match + rotated)](content/dsa/widgets/w-04-binary-search.yml)
- [Sorting visualizer (merge sort + quicksort)](content/dsa/widgets/w-05-sorting-visualizer.yml)
- [Quicksort partition (Lomuto, step-by-step)](content/dsa/widgets/w-06-quicksort-partition.yml)
- [Quickselect: partition and recurse on one side](content/dsa/widgets/w-07-quickselect.yml)
- [Two pointers (sum-equals-target)](content/dsa/widgets/w-08-two-pointers-3sum.yml)
- [Sliding window (fixed + variable size)](content/dsa/widgets/w-09-sliding-window-expansion.yml)
- [Prefix sum (cumulative + range query)](content/dsa/widgets/w-10-prefix-sum-cumulative.yml)
- [Monotonic stack (next-greater scan)](content/dsa/widgets/w-11-monotonic-stack.yml)
- [Amortized queue via two stacks (LC 232)](content/dsa/widgets/w-12-amortized-queue-via-stacks.yml)
- [Monotonic deque (sliding window maximum)](content/dsa/widgets/w-12-monotonic-deque.yml)
- [Linked list pointer rewiring](content/dsa/widgets/w-13-linked-list-pointer-rewiring.yml)
- [Floyd's tortoise and hare (cycle detection)](content/dsa/widgets/w-14-floyd-cycle.yml)
- [LRU cache (hash map + doubly linked list)](content/dsa/widgets/w-15-lru-cache.yml)
- [Tree traversal animator (DFS pre/in/post + BFS level-order)](content/dsa/widgets/w-16-tree-traversal-animator.yml)
- [Morris inorder traversal (threading)](content/dsa/widgets/w-17-morris-thread.yml)
- [Heap operations: sift-up after push, sift-down after pop](content/dsa/widgets/w-18-heap-operations.yml)
- [BST operations and AVL rotations](content/dsa/widgets/w-19-bst-rotations.yml)
- [Trie — insert + prefix walk + frequency autocomplete](content/dsa/widgets/w-20-trie.yml)
- [Segment tree (build / update / query)](content/dsa/widgets/w-21-segment-tree.yml)
- [Backtracking decision tree](content/dsa/widgets/w-22-backtracking-tree.yml)
- [N-Queens -- place / attack / backtrack on n=4](content/dsa/widgets/w-23-n-queens.yml)
- [Sudoku solver (constraint propagation + MRV)](content/dsa/widgets/w-24-sudoku-grid.yml)
- [Graph BFS — frontier expansion (multi-source on a grid)](content/dsa/widgets/w-25-graph-bfs.yml)
- [DFS exploration -- iterative DFS-from-boundary on a 5x5 grid](content/dsa/widgets/w-26-graph-dfs.yml)
- [Topological sort (Kahn's vs DFS post-order)](content/dsa/widgets/w-27-topological-sort-kahn.yml)
- [Union-Find: parent forest with path compression and union by rank](content/dsa/widgets/w-28-union-find.yml)
- [Dijkstra's shortest-path algorithm](content/dsa/widgets/w-29-dijkstra.yml)
- [MST: Kruskal + Prim (side-by-side)](content/dsa/widgets/w-30-mst-kruskal-prim.yml)
- [DP table fill](content/dsa/widgets/w-31-dp-table-fill.yml)
- [Knapsack DP table fill (0/1 vs unbounded)](content/dsa/widgets/w-32-knapsack-fill.yml)
- [LIS via patience sort](content/dsa/widgets/w-33-lis-patience.yml)
- [Bitmask BFS: (node, mask) state expansion](content/dsa/widgets/w-34-bitmask-dp.yml)
- [Prefix-sum + hash-map combo](content/dsa/widgets/w-35-prefix-sum-hash-combo.yml)
- [Interval scheduling: non-overlap and min-arrows](content/dsa/widgets/w-36-interval-scheduling.yml)
- [Bellman-Ford with negative-cycle detection](content/dsa/widgets/w-37-bellman-ford.yml)
- [KMP failure-function build and matching pass](content/dsa/widgets/w-38-kmp.yml)
- [Huffman encoding (heap + tree assembly + codeword walk)](content/dsa/widgets/w-39-huffman-encoding.yml)
- [Z-array construction with the [l, r) match window](content/dsa/widgets/w-40-z-array.yml)


</details>

---

## The AI Engineering Handbook

**How to build and run production AI products on top of model APIs.**

[Website](https://ai-eng.handbook.academy) · [`content/ai-eng/`](content/ai-eng/) · [Book guide](content/ai-eng/README.md) · [AI Engineering style rules](STYLE_GUIDE.md#ai-engineering-specific-deviations)

An AI engineer builds products on top of foundation models; they don't train them. This book stays on the product side of the model API. It covers how models behave, how to call them reliably, how to write and version prompts, how to evaluate output, how to assemble context, how to retrieve, how to build agents, and how to observe, secure and pay for all of it in production.

**Read it in order the first time.** Part 0 sets out the escalation ladder the whole book follows: prompt, then context, then retrieval, then tools, then an agent, and fine-tuning last. **Part 4, on evals, comes before retrieval and agents on purpose**, because everything after it assumes you can measure whether a change helped.

**How a chapter is built.** There's no fixed template. Most chapters open with a real incident or a failing example, explain the mechanism, and end with something you can apply: a checklist, a decision rule, or a runnable snippet. Code is Python. Figures sit in each part's `images/` folder. Prices, model names and benchmark scores carry an "as of" date and a source.

**How it relates to HLD Part 9.** [HLD Part 9](#part-9--ai--ml-system-design) is the whiteboard view: how to design an AI system at scale. This book is the editor view: how to build and operate one. The two books link to each other.

### AI Engineering parts at a glance

Click a part to see every chapter in it.

| Part | What it covers | Level |
|---|---|---|
| [0](#part-0--start-here) | **Start Here** — what an AI engineer is, the software baseline, probabilistic systems, the escalation ladder | Beginner |
| [1](#part-1--how-models-behave) | **How Models Behave** — model tiers, tokens, sampling, embeddings, reasoning models, the cost-quality-latency triangle | Beginner to intermediate |
| [2](#part-2--working-with-model-apis) | **Working with Model APIs** — streaming, structured outputs, tool calling, retries, gateways, prompt caching | Beginner to intermediate |
| [3](#part-3--prompt-engineering) | **Prompt Engineering** — prompt anatomy, few-shot, chain-of-thought, templates, versioning | Beginner to intermediate |
| [4](#part-4--eval-fundamentals) | **Eval Fundamentals** — look at your data, your first eval set, assertions in CI | Beginner |
| [5](#part-5--context-engineering) | **Context Engineering** — context assembly, compression, memory, tool metadata, context testing | Intermediate |
| [6](#part-6--retrieval-rag) | **Retrieval (RAG)** — chunking, vector + hybrid search, reranking, citations, retrieval evals, production indexing | Intermediate to advanced |
| [7](#part-7--agent-engineering) | **Agent Engineering** — workflows vs agents, tool design, MCP, memory, HITL, multi-agent, voice, frameworks | Intermediate to advanced |
| [8](#part-8--evaluation-and-observability) | **Evaluation and Observability** — LLM-as-judge, judge bias, RAG/agent evals, CI gates, A/B tests, tracing, dashboards | Intermediate |
| [9](#part-9--security-and-governance) | **Security and Governance** — prompt injection, the lethal trifecta, guardrails, abuse, PII, compliance, red-teaming | Intermediate to advanced |
| [10](#part-10--production-ai) | **Production AI** — hosted vs self-hosted, fine-tuning decisions, cost and latency engineering, rollouts, SLOs | Intermediate |
| [11](#part-11--ai-product-engineering) | **AI Product Engineering** — AI UX, failure recovery, product metrics, experimentation, pricing, feedback loops | Intermediate to advanced |

<details>
<summary><strong>Part 0 — Start Here</strong> — what an AI engineer is, the software baseline, probabilistic systems, the escalation ladder</summary>

### Part 0 — Start Here

> **Who it's for:** everyone, including experienced engineers new to building on LLMs.  
> **Level:** Beginner

What an AI engineer is, the software baseline, thinking in probabilistic systems, and the escalation ladder the whole book follows: prompt, context, retrieval, tools, agent, fine-tune.

- [What an AI engineer is (and isn't)](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md) — AI engineer vs ML engineer vs researcher: the API line, the three roles, and exactly what this handbook teaches and skips.
- [The software baseline](content/ai-eng/part-0-start-here/01-the-software-baseline.md) — The seven engineering skills this book assumes (Python, HTTP, JSON, async, Git, Docker, Postgres), why each one matters for AI work, and where to refresh it.
- [Thinking in probabilistic systems](content/ai-eng/part-0-start-here/02-thinking-in-probabilistic-systems.md) — Why the same LLM call returns different answers even at temperature 0, the five failure modes, and why graceful degradation is the default posture.
- [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md) — The priority order the whole book runs on: prompt, context, retrieval, tools, agent, fine-tune. Climb the cheapest rung that fixes the failure.

</details>

<details>
<summary><strong>Part 1 — How Models Behave</strong> — model tiers, tokens, sampling, embeddings, reasoning models, the cost-quality-latency triangle</summary>

### Part 1 — How Models Behave

> **Who it's for:** anyone who calls a model API and wants to predict its bill, latency, and failure modes.  
> **Level:** Beginner to intermediate

The model landscape, tokens and context windows, sampling, embeddings, reasoning models, the cost-quality-latency triangle, and just enough ML to make good system decisions.

- [The model landscape](content/ai-eng/part-1-how-models-behave/00-the-model-landscape.md) — Place any model into a tier, and know what each tier is for: frontier, mid, fast, and local, plus open-weight vs hosted and chat vs reasoning vs multimodal.
- [Tokens and context windows](content/ai-eng/part-1-how-models-behave/01-tokens-and-context-windows.md) — Tokens are the unit every LLM bill, limit, and prompt is measured in. How to count them in Python before you send, and why non-Latin text costs more.
- [Sampling and temperature](content/ai-eng/part-1-how-models-behave/02-sampling-and-temperature.md) — How temperature and top-p reshape a model's probability distribution, how to pick them per task, and why temperature 0 is not a determinism guarantee.
- [Embeddings](content/ai-eng/part-1-how-models-behave/03-embeddings.md) — What embeddings are, why cosine similarity and dot product agree on normalized vectors, and the four engineering patterns built on them: search, memory, routing, clustering.
- [Reasoning models](content/ai-eng/part-1-how-models-behave/04-reasoning-models.md) — What test-time compute is, the effort and budget knobs across providers, why you pay for hidden thinking tokens, and when reasoning earns its cost.
- [The cost-quality-latency triangle](content/ai-eng/part-1-how-models-behave/05-the-cost-quality-latency-triangle.md) — The book's recurring mental model: cost, quality, and latency are three axes you can't max at once. Name the one you sacrifice, then learn the levers that cheat it.
- [Just enough ML](content/ai-eng/part-1-how-models-behave/06-just-enough-ml.md) — The three ML ideas an AI engineer who never trains a model still needs: the data split, overfitting, and distribution shift, framed as eval decisions.

</details>

<details>
<summary><strong>Part 2 — Working with Model APIs</strong> — streaming, structured outputs, tool calling, retries, gateways, prompt caching</summary>

### Part 2 — Working with Model APIs

> **Who it's for:** engineers wiring their first LLM feature into a real service.  
> **Level:** Beginner to intermediate

Calling models reliably: streaming, structured outputs, tool calling, errors and fallbacks, model selection, gateways and routing, and prompt caching economics.

- [Calling models](content/ai-eng/part-2-working-with-model-apis/00-calling-models.md) — What happens when you POST a chat completion: messages, roles, the system prompt, and the three provider shapes you need to know side by side.
- [Streaming](content/ai-eng/part-2-working-with-model-apis/01-streaming.md) — How token-by-token streaming wins on perceived latency, why it breaks output validation, and the four ways to get both.
- [Structured outputs](content/ai-eng/part-2-working-with-model-apis/02-structured-outputs.md) — Why schema-enforced JSON, not free text, is the contract between an LLM and the code that consumes its output, and how to wire it up with Pydantic.
- [Function and tool calling](content/ai-eng/part-2-working-with-model-apis/03-function-and-tool-calling.md) — The model proposes a tool call, you execute it, the model continues: how to define tool schemas, run the loop, parallelize, and return errors the model can act on.
- [Errors, retries, fallbacks](content/ai-eng/part-2-working-with-model-apis/04-errors-retries-fallbacks.md) — How to handle the timeouts, rate limits, and overloaded responses every LLM API throws at you, with the right backoff, fallback, and idempotency rules.
- [Choosing models and reading benchmarks](content/ai-eng/part-2-working-with-model-apis/05-choosing-models-and-reading-benchmarks.md) — Public leaderboards don't predict your product's quality. Shortlist by tier, test on your own eval set, decide. That's the whole workflow.
- [Gateways and routing](content/ai-eng/part-2-working-with-model-apis/06-gateways-and-routing.md) — One API in front of many providers, cheap-then-expensive cascades, provider failover, and the rule for when a gateway earns its operational cost.
- [Prompt caching](content/ai-eng/part-2-working-with-model-apis/07-prompt-caching.md) — The single biggest cost lever in API-native LLM products. A 50k-token agent over 10 turns drops from $1.53 to $0.47 with one config change.

</details>

<details>
<summary><strong>Part 3 — Prompt Engineering</strong> — prompt anatomy, few-shot, chain-of-thought, templates, versioning</summary>

### Part 3 — Prompt Engineering

> **Who it's for:** anyone who owns a production prompt.  
> **Level:** Beginner to intermediate

Production prompts: anatomy, few-shot, chain-of-thought and the reasoning-model inversion, templates and chaining, and prompt versioning with rollback.

- [Anatomy of a production prompt](content/ai-eng/part-3-prompt-engineering/00-anatomy-of-a-production-prompt.md) — The five sections every production system prompt has, why monolithic god-prompts fail, and how to wire defensive instructions against prompt injection.
- [Zero-shot and few-shot](content/ai-eng/part-3-prompt-engineering/01-zero-shot-and-few-shot.md) — When examples earn their tokens and when they don't. The decision rule, the over-prompting cliff, and how prompt caching rewrites the math.
- [Chain-of-thought, ReAct, self-consistency](content/ai-eng/part-3-prompt-engineering/02-chain-of-thought-react-self-consistency.md) — The three techniques that survived the 2023 prompting literature, and the reasoning-model inversion that flips the rules: when to use each, and when to delete them.
- [Templates and chaining](content/ai-eng/part-3-prompt-engineering/03-templates-and-chaining.md) — Treating prompts as typed code, and the call you make every week: one big prompt or several small ones in a chain.
- [Prompt versioning](content/ai-eng/part-3-prompt-engineering/04-prompt-versioning.md) — Treat a prompt change like a code change: registry, version pinning, rollback, and review, with a minimal setup you can build in a week.

</details>

<details>
<summary><strong>Part 4 — Eval Fundamentals</strong> — look at your data, your first eval set, assertions in CI</summary>

### Part 4 — Eval Fundamentals

> **Who it's for:** everyone. If you read one part, read this one.  
> **Level:** Beginner

The minimum eval loop, taught before RAG and agents on purpose: look at your data, build your first eval set, and wire assertions into CI. Nothing after this part ships without evals.

- [Why you can't ship without evals](content/ai-eng/part-4-eval-fundamentals/00-why-you-cant-ship-without-evals.md) — The vibes-driven failure mode, evals as the AI engineer's CI, and the maturity ladder that gets you off the whack-a-mole loop.
- [Look at your data](content/ai-eng/part-4-eval-fundamentals/01-look-at-your-data.md) — The single highest-ROI habit in LLM evaluation: read your traces by hand and build a failure taxonomy before automating anything.
- [Your first eval set](content/ai-eng/part-4-eval-fundamentals/02-your-first-eval-set.md) — Bootstrap a 50-example eval set in a week: real or realistic inputs, binary pass/fail labels, versioned in git, growing from production failures.
- [Assertions and unit tests for LLM output](content/ai-eng/part-4-eval-fundamentals/03-assertions-and-unit-tests.md) — The cheap, deterministic checks that should gate every LLM commit before any judge model runs: schema, contains, regex, code-runs, SQL-parses, wired into pytest and CI.

</details>

<details>
<summary><strong>Part 5 — Context Engineering</strong> — context assembly, compression, memory, tool metadata, context testing</summary>

### Part 5 — Context Engineering

> **Who it's for:** engineers whose prompts have grown into pipelines.  
> **Level:** Intermediate

Building the full world the model sees: context assembly and routing, compression and budgets, memory and state, tool context, and testing what was actually assembled.

- [Context is more than the prompt](content/ai-eng/part-5-context-engineering/00-context-is-more-than-the-prompt.md) — The six things that go into a context window every turn, why prompt engineering only covers one of them, and what the discipline of context engineering actually owns.
- [Context assembly and routing](content/ai-eng/part-5-context-engineering/01-context-assembly-and-routing.md) — Why a 1M-token window doesn't make context free, and the route-then-assemble pipeline that decides what the model actually sees.
- [Compression and context budgets](content/ai-eng/part-5-context-engineering/02-compression-and-context-budgets.md) — More context isn't better context. How lost-in-the-middle and context rot degrade long prompts, and when to trim, summarize, or re-retrieve.
- [Memory and state](content/ai-eng/part-5-context-engineering/03-memory-and-state.md) — What an LLM remembers between turns, between sessions, and across years, and the techniques that make each scope work without crowding the context window.
- [Tool context and metadata](content/ai-eng/part-5-context-engineering/04-tool-context-and-metadata.md) — Models have no clock, no role awareness, and no sense of locale. The metadata you inject and the way you describe tools prevent whole classes of confidently wrong answers.
- [Testing and observing context](content/ai-eng/part-5-context-engineering/05-testing-and-observing-context.md) — Snapshot the assembled context, regression-test the assembly logic, and capture traces that can answer why the model saw what it saw.

</details>

<details>
<summary><strong>Part 6 — Retrieval (RAG)</strong> — chunking, vector + hybrid search, reranking, citations, retrieval evals, production indexing</summary>

### Part 6 — Retrieval (RAG)

> **Who it's for:** anyone building search or question answering over their own documents.  
> **Level:** Intermediate to advanced

Retrieval done right: when you actually need RAG, chunking, vector and hybrid search, reranking, query understanding, citations, retrieval evaluation, and production indexing.

- [When you actually need RAG](content/ai-eng/part-6-retrieval-augmented-generation/00-when-you-actually-need-rag.md) — RAG vs long context vs fine-tune as a cost decision: long context pays per query, RAG pays once to index. The default rule, the exceptions, and when RAG is the wrong answer.
- [Document processing and chunking](content/ai-eng/part-6-retrieval-augmented-generation/01-document-processing-and-chunking.md) — How parsing and chunk boundaries set your retrieval ceiling, why overlap and chunk size are eval questions, and the defaults that survive contact with real corpora.
- [Embeddings and vector search](content/ai-eng/part-6-retrieval-augmented-generation/02-embeddings-and-vector-search.md) — How to pick an embedding model on your own data, why pgvector is the default store, what HNSW and IVFFlat actually do, and the honest threshold where a dedicated vector DB earns its keep.
- [Hybrid search and reranking](content/ai-eng/part-6-retrieval-augmented-generation/03-hybrid-search-and-reranking.md) — Why BM25 still beats vector search on exact terms, how to fuse them with RRF, and when a reranker earns its latency.
- [Query understanding](content/ai-eng/part-6-retrieval-augmented-generation/04-query-understanding.md) — Rewriting, multi-query, decomposition, and routing: closing the gap between what users type and what your retriever can match.
- [Citations and grounding](content/ai-eng/part-6-retrieval-augmented-generation/05-citations-and-grounding.md) — Make RAG answers verifiable: span-level citations, refusal on empty retrieval, and the faithfulness vs fluency tension that decides both.
- [Advanced retrieval](content/ai-eng/part-6-retrieval-augmented-generation/06-advanced-retrieval.md) — Three patterns that beat vanilla RAG on specific queries: agentic retrieval, GraphRAG, and vision-native PDF search. When each earns its complexity, and when it doesn't.
- [Evaluating retrieval](content/ai-eng/part-6-retrieval-augmented-generation/07-evaluating-retrieval.md) — RAG eval is mostly retrieval eval. Recall@k and MRR in plain terms, building an eval set from real queries, and the 2x2 that separates retrieval failure from generation failure.
- [Production RAG](content/ai-eng/part-6-retrieval-augmented-generation/08-production-rag.md) — The five operational concerns that turn a RAG prototype into a system you can run: incremental indexing, the reindex tax, multi-tenant isolation, metadata filtering, and per-stage latency budgets.

</details>

<details>
<summary><strong>Part 7 — Agent Engineering</strong> — workflows vs agents, tool design, MCP, memory, HITL, multi-agent, voice, frameworks</summary>

### Part 7 — Agent Engineering

> **Who it's for:** engineers deciding whether they need an agent, and building one when they do.  
> **Level:** Intermediate to advanced

Workflows versus agents, tool design, MCP and its security model, memory, human-in-the-loop, long-running agents, multi-agent systems, agent archetypes, voice agents, and choosing a framework.

- [Workflow vs agent](content/ai-eng/part-7-agent-engineering/00-workflow-vs-agent.md) — If you can write the control flow in Python, it's a workflow. If the model decides at runtime, it's an agent. Most production wins are workflows.
- [The five workflow patterns](content/ai-eng/part-7-agent-engineering/01-the-five-workflow-patterns.md) — Chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer: each with code, a use case, and the failure mode that bites in production.
- [The agent loop](content/ai-eng/part-7-agent-engineering/02-the-agent-loop.md) — Think, act, observe, and the part nobody talks about: how the loop ends. Stop conditions, reflection that actually works, and why production agents look nothing like the demo.
- [Tool design](content/ai-eng/part-7-agent-engineering/03-tool-design.md) — The agent-engineering skill: schemas that make invalid calls impossible, descriptions the model can't misread, errors it can recover from, and the right number of tools.
- [MCP: Model Context Protocol](content/ai-eng/part-7-agent-engineering/04-mcp-model-context-protocol.md) — How to expose tools, data, and prompts to any AI host through one open protocol; build a server and client end-to-end.
- [MCP security](content/ai-eng/part-7-agent-engineering/05-mcp-security.md) — The four attack classes MCP creates: tool poisoning, cross-server shadowing, rug pulls, and injection via tool results, and the architectural defenses that actually stop them.
- [Agent memory and task state](content/ai-eng/part-7-agent-engineering/06-agent-memory-and-task-state.md) — The four places an agent can put information, why most teams use the wrong one, and how to design state that survives a pod restart mid-task.
- [Human-in-the-loop](content/ai-eng/part-7-agent-engineering/07-human-in-the-loop.md) — Approval gates as tool calls, confidence-based escalation, and handoff design: the three independent things you have to engineer for selective human oversight to actually work.
- [Long-running agents](content/ai-eng/part-7-agent-engineering/08-long-running-agents.md) — Budgets, kill switches, checkpoints, replay, and the sync vs async choice: the harness work that keeps a multi-minute agent from burning a month's API spend.
- [Multi-agent systems](content/ai-eng/part-7-agent-engineering/09-multi-agent-systems.md) — When multi-agent topology earns its 15x token cost, when it doesn't, and the single-writer pattern that handles most production work.
- [Agent archetypes](content/ai-eng/part-7-agent-engineering/10-agent-archetypes.md) — Research, Coding, Browser, and Computer Use agents differ in one thing that cascades into everything else: what the model sees at each step.
- [Voice agents](content/ai-eng/part-7-agent-engineering/11-voice-agents.md) — The 800ms budget that defines voice agents, the cascaded vs native trade-off, and why barge-in is the hardest correctness problem in the stack.
- [Choosing a framework](content/ai-eng/part-7-agent-engineering/12-choosing-a-framework.md) — Frameworks buy state, retries, and tracing. Most teams don't need them. The decision rule for plain SDK, light structure, and full graph runtime.

</details>

<details>
<summary><strong>Part 8 — Evaluation and Observability</strong> — LLM-as-judge, judge bias, RAG/agent evals, CI gates, A/B tests, tracing, dashboards</summary>

### Part 8 — Evaluation and Observability

> **Who it's for:** teams past their first eval set who need evals they can trust in CI and production.  
> **Level:** Intermediate

The deep spine: LLM-as-judge and its failure modes, component evals for RAG and agents, regression gates in CI, online evaluation, tracing, monitoring, and the data flywheel.

- [The eval taxonomy](content/ai-eng/part-8-evaluation-and-observability/00-the-eval-taxonomy.md) — Four axes that decide which kind of evaluation answers your question: offline vs online, component vs end-to-end, reference-based vs reference-free, automatic vs judge vs human.
- [LLM-as-judge](content/ai-eng/part-8-evaluation-and-observability/01-llm-as-judge.md) — Build a second-LLM judge you can trust: binary pass/fail over Likert, prompt patterns, and the human-agreement loop you must run before deploying it.
- [Judge failure modes](content/ai-eng/part-8-evaluation-and-observability/02-judge-failure-modes.md) — Position bias, length bias, self-preference, and style bias in LLM-as-judge pipelines, with the numbers and the mitigations that actually work in production.
- [Evaluating RAG and agents](content/ai-eng/part-8-evaluation-and-observability/03-evaluating-rag-and-agents.md) — Component evals, tool-choice accuracy, trajectory evaluation, and the weakest-link pattern that tells you which piece of a compound system to fix.
- [Regression suites and CI gates](content/ai-eng/part-8-evaluation-and-observability/04-regression-suites-and-ci-gates.md) — Wiring evals into CI as a real merge gate: two-tier golden sets, differential thresholds over absolute floors, and how to keep flaky probabilistic tests trustworthy.
- [Online evaluation and A/B testing](content/ai-eng/part-8-evaluation-and-observability/05-online-evaluation-and-ab-testing.md) — Why your offline eval lied about a 3-point lift, the implicit signals that don't, and the sample sizes LLM A/B tests actually need.
- [Tracing](content/ai-eng/part-8-evaluation-and-observability/06-tracing.md) — Spans for LLM calls, retrieval, and agent loops; the gen_ai.* OpenTelemetry conventions; why vendor-proprietary tracing locks you in.
- [Monitoring and dashboards](content/ai-eng/part-8-evaluation-and-observability/07-monitoring-and-dashboards.md) — Why LLM systems need cost, latency, quality, and usage on one screen; how to alert on quality regressions and cost spikes; and which observability platform to pick in 2026.
- [Feedback & the data flywheel](content/ai-eng/part-8-evaluation-and-observability/08-feedback-and-the-data-flywheel.md) — How production traffic compounds into better evals and a better product, instead of becoming a treadmill of sprint-by-sprint bug fixes.

</details>

<details>
<summary><strong>Part 9 — Security and Governance</strong> — prompt injection, the lethal trifecta, guardrails, abuse, PII, compliance, red-teaming</summary>

### Part 9 — Security and Governance

> **Who it's for:** anyone shipping an LLM feature that touches user data or tools.  
> **Level:** Intermediate to advanced

Prompt injection, the lethal trifecta and agent security, guardrails, abuse prevention, PII and privacy, compliance, and red-teaming your own system.

- [Prompt injection](content/ai-eng/part-9-security-and-governance/00-prompt-injection.md) — Why prompt injection has no general fix, the difference between direct and indirect attacks, and the defense-in-depth posture you ship with.
- [Agent security and the lethal trifecta](content/ai-eng/part-9-security-and-governance/01-agent-security-and-the-lethal-trifecta.md) — The three-leg threat model for agentic exfiltration, why all three together is game-over, and how to cut at least one leg before you ship.
- [Guardrails](content/ai-eng/part-9-security-and-governance/02-guardrails.md) — Input filters, output validators, content moderation models, and the streaming-versus-validation problem nobody warns you about.
- [Abuse prevention](content/ai-eng/part-9-security-and-governance/03-abuse-prevention.md) — Rate limits, spend caps, per-tenant budgets, and the behavioral signals that catch automated abuse before it shows up on the bill.
- [PII and privacy](content/ai-eng/part-9-security-and-governance/04-pii-and-privacy.md) — Detect and redact before the model call, navigate the controller-processor-subprocessor chain, and pick the right retention and residency knobs.
- [Compliance and audit](content/ai-eng/part-9-security-and-governance/05-compliance-and-audit.md) — What engineers actually build for SOC 2 and the EU AI Act: structured audit trails, tamper-evident retention, and the model documentation regulators look for.
- [Red-teaming](content/ai-eng/part-9-security-and-governance/06-red-teaming.md) — Automated probe suites, manual protocols, and continuous red-teaming in CI: how to attack your own AI system before someone else does.

</details>

<details>
<summary><strong>Part 10 — Production AI</strong> — hosted vs self-hosted, fine-tuning decisions, cost and latency engineering, rollouts, SLOs</summary>

### Part 10 — Production AI

> **Who it's for:** engineers who own an AI feature's bill, latency, and on-call.  
> **Level:** Intermediate

Operating AI in production: hosted versus self-hosted, the customization menu, cost and latency engineering, eval-gated rollouts, SLOs, incident response, and AI infrastructure patterns.

- [Hosted vs self-hosted](content/ai-eng/part-10-deployment-and-cost/00-hosted-vs-self-hosted.md) — The four-line TCO model that decides when self-hosting beats per-token billing, why GPU utilization is the silent multiplier, and the 'start hosted, migrate the hot path' default for 2026.
- [Self-hosting essentials](content/ai-eng/part-10-deployment-and-cost/01-self-hosting-essentials.md) — What you actually need to know to run an open-weight model competently: vLLM as the default server, KV cache as the resource constraint, continuous batching, and how to size GPUs before you spend.
- [The customization menu](content/ai-eng/part-10-deployment-and-cost/02-the-customization-menu.md) — Fine-tuning, LoRA, and distillation as decisions, not techniques: when each is the right answer, what it costs, and the contamination trap that makes broken systems look healthy.
- [Cost engineering](content/ai-eng/part-10-deployment-and-cost/03-cost-engineering.md) — Five orthogonal levers (caching, batching, routing, quantization, distillation) that compound multiplicatively to cut a five-figure monthly bill by ~80% without changing model quality.
- [Latency engineering](content/ai-eng/part-10-deployment-and-cost/04-latency-engineering.md) — Why LLM latency isn't a single number: the waterfall, TTFT vs total time, parallel tool calls, prefix caching, and the perceived-latency tricks that close the gap UX-side.
- [Shipping changes](content/ai-eng/part-10-deployment-and-cost/05-shipping-changes.md) — Prompt and model changes are deployments. Eval-gated promotion, shadow traffic, canary rollout, and instant rollback as the discipline that turns 'just edit the prompt' into safe production change.
- [SLOs and incident response](content/ai-eng/part-10-deployment-and-cost/06-slos-and-incident-response.md) — AI failures return HTTP 200 with garbage. The four AI incident classes (quality regression, injection exploit, cost runaway, hallucination at scale), the semantic SLIs that detect them, and the runbooks that contain them.
- [AI infrastructure patterns](content/ai-eng/part-10-deployment-and-cost/07-ai-infrastructure-patterns.md) — The four AI-specific infrastructure components: vector stores in production, semantic caching, durable agent job queues, and embedding pipelines. Everything generic cross-links to HLD.

</details>

<details>
<summary><strong>Part 11 — AI Product Engineering</strong> — AI UX, failure recovery, product metrics, experimentation, pricing, feedback loops</summary>

### Part 11 — AI Product Engineering

> **Who it's for:** engineers and PMs deciding what an AI feature should do and whether it's working.  
> **Level:** Intermediate to advanced

AI UX, failure recovery, product metrics beyond accuracy, experimentation, cost modeling and pricing, and feedback loops that compound.

- [AI UX](content/ai-eng/part-11-ai-product/00-ai-ux.md) — Streaming as a trust signal, not a transport detail. The three failure modes (blank screen, mid-stream stall, unverifiable claim) and what to build for each.
- [Failure recovery UX](content/ai-eng/part-11-ai-product/01-failure-recovery-ux.md) — AI failures aren't edge cases. Designing the fallback cascade, retry affordances, and human handoffs so the failure you can't prevent doesn't destroy trust.
- [AI product metrics](content/ai-eng/part-11-ai-product/02-ai-product-metrics.md) — Beyond accuracy. Task success, deflection vs. containment vs. resolution, escalation as a quality signal, time-to-completion, and AI-feature retention.
- [Experimentation](content/ai-eng/part-11-ai-product/03-experimentation.md) — A/B testing AI features when variance is 2-5x higher than deterministic features, the treatment can drift mid-experiment, and 'no significant effect' usually means underpowered.
- [Cost modeling and pricing](content/ai-eng/part-11-ai-product/04-cost-modeling-and-pricing.md) — Why marginal cost matters again. Cost-per-task (not per-token), the four pricing architectures, and the math that says when a feature is too expensive to ship.
- [Feedback and growth loops](content/ai-eng/part-11-ai-product/05-feedback-and-growth-loops.md) — Most teams have a log file, not a flywheel. The three preconditions for a working data loop, and why the loop itself (not the data) is the durable advantage.

</details>

---

## Study plans

You don't need a plan. Open any chapter and start reading. These routes help when you have a deadline or a specific gap to fill.

| Plan | For | Length |
|---|---|---|
| [Interview prep: SDE1 to SDE2](#interview-prep-sde1-to-sde2) | Passing a mid-level system design round | 6 weeks |
| [Deep dive: SDE2 to Senior](#deep-dive-sde2-to-senior) | Designing and owning cross-team architecture | 3 months |
| [AI Engineering track](#ai-engineering-track) | Shipping AI features on model APIs | 6 weeks |
| [AI systems design track](#ai-systems-design-track) | Designing AI systems at scale | 4 weeks |
| [Interview triage](#interview-triage) | A system design loop on Monday | 1 weekend |
| [The full curriculum](#the-full-curriculum) | Staff+ preparation | Months |

<details>
<summary><strong>Interview prep: SDE1 to SDE2</strong> — 6 weeks</summary>

### Interview prep: SDE1 to SDE2

**Goal:** pass a 45–60 minute system design round at mid-to-senior level. Plan on 8–10 hours of reading a week.

| Week | Focus | Read |
|---|---|---|
| 1 | Foundations | HLD [Part 0](#part-0--prerequisites) and [Part 1](#part-1--core-fundamentals) |
| 2 | Building blocks I | HLD [Part 2](#part-2--building-blocks), first half: load balancers, proxies, CDNs, caching, SQL, NoSQL, partitioning, replication |
| 3 | Building blocks II | HLD Part 2, second half: queues, pub/sub, real-time, rate limiting, service mesh, blob storage, geo, edge |
| 4 | Core case studies | The [core primitives](#core-primitives) case studies: URL shortener, rate limiter, chat, news feed, web crawler, autocomplete |
| 5 | Your target company | More [case studies](#part-8--case-studies), chosen with [Company-specific flavors](content/hld/part-11-interview-framework/04-company-specific-flavors.md) |
| 6 | Interview mechanics | HLD [Part 11](#part-11--interview-framework) and the [Trade-offs Library](#trade-offs-library) |

Running the coding round too? Read [DSA Parts 0 to 9](#dsa-parts-at-a-glance) alongside.

</details>

<details>
<summary><strong>Deep dive: SDE2 to Senior</strong> — 3 months</summary>

### Deep dive: SDE2 to Senior

**Goal:** design at Senior level, own cross-team architecture, and pass Senior+ loops.

| Phase | Focus | Read | Time |
|---|---|---|---|
| 1 | Foundations and building blocks | HLD [Parts 0](#part-0--prerequisites), [1](#part-1--core-fundamentals) and [2](#part-2--building-blocks) | 3 weeks |
| 2 | Distributed theory, data, architecture | HLD [Parts 3](#part-3--distributed-systems-theory), [4](#part-4--data-systems) and [5](#part-5--architecture-patterns) | 4 weeks |
| 3 | Every case study | HLD [Part 8](#part-8--case-studies) | 4 weeks |
| 4 | Reliability, security, AI, interview | HLD [Parts 6](#part-6--reliability--operations), [7](#part-7--security-at-scale), [9](#part-9--ai--ml-system-design), [10](#part-10--emerging-patterns) and [11](#part-11--interview-framework), and the [Trade-offs Library](#trade-offs-library) | 2 weeks |

</details>

<details>
<summary><strong>AI Engineering track</strong> — 6 weeks</summary>

### AI Engineering track

**Goal:** ship AI features that are reliable, measurable, secure and affordable. Plan on 4–5 hours of reading a week, plus time to run the snippets.

| Week | Focus | Read |
|---|---|---|
| 1 | Mental model and model behavior | [Part 0](#part-0--start-here) and [Part 1](#part-1--how-models-behave) |
| 2 | APIs and prompts | [Part 2](#part-2--working-with-model-apis) and [Part 3](#part-3--prompt-engineering) |
| 3 | Evals and context | [Part 4](#part-4--eval-fundamentals) and [Part 5](#part-5--context-engineering) |
| 4 | Retrieval | [Part 6](#part-6--retrieval-rag) |
| 5 | Agents | [Part 7](#part-7--agent-engineering) |
| 6 | Running it in production | [Parts 8](#part-8--evaluation-and-observability), [9](#part-9--security-and-governance), [10](#part-10--production-ai) and [11](#part-11--ai-product-engineering). Skim now, and come back as each problem shows up. |

</details>

<details>
<summary><strong>AI systems design track</strong> — 4 weeks</summary>

### AI systems design track

**Goal:** design AI systems on the whiteboard. Assumes you know the HLD fundamentals.

| Week | Focus | Read |
|---|---|---|
| 1 | LLM serving and RAG | The first chapters of HLD [Part 9](#part-9--ai--ml-system-design): LLM serving, RAG pipelines, vector search |
| 2 | Agents and evaluation | HLD Part 9: agent architectures, multi-agent orchestration, LLM evaluation, LLMOps |
| 3 | AI case studies | The [AI systems](#ai-systems) case studies: ChatGPT, enterprise RAG, coding agent, AI search, voice assistant, moderation, semantic cache, model router |
| 4 | ML fundamentals | The rest of HLD Part 9, and the [Recommendation system](content/hld/part-8-case-studies/17-recommendation-system.md) case study |

Pair it with the [AI Engineering track](#ai-engineering-track) when you also build the system.

</details>

<details>
<summary><strong>Interview triage</strong> — one weekend</summary>

### Interview triage

A system design loop on Monday:

| When | Read |
|---|---|
| Saturday morning | [How to approach a design question](content/hld/part-1-core-fundamentals/05-how-to-approach-design-questions.md), [Back-of-the-envelope estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md), [Requirements scoping](content/hld/part-11-interview-framework/01-requirements-scoping.md), [Diagramming skills](content/hld/part-11-interview-framework/02-diagramming-skills.md) |
| Saturday afternoon | Three [case studies](#part-8--case-studies) in your domain |
| Sunday morning | Three more case studies, and [Trade-off articulation](content/hld/part-11-interview-framework/03-trade-off-articulation.md) |
| Sunday evening | [Company-specific flavors](content/hld/part-11-interview-framework/04-company-specific-flavors.md) for your target company |

</details>

<details>
<summary><strong>The full curriculum</strong> — Staff+ preparation</summary>

### The full curriculum

Read each book front to back, in order. A chapter a day is a sustainable pace, and it leaves room to re-read the hard ones. HLD chapters end with an exercise and flashcards, so use them for active recall.

</details>

---

## How the books are written

**The writing rules.** Every book follows the [style guide](STYLE_GUIDE.md):

- Teach the reasoning, not just the facts. A reader should come away knowing how to decide.
- Pick a recommendation and justify it. "It depends" must say what it depends on.
- Be concrete. A measured number with a source beats "very fast".
- Be honest about difficulty. Say when something is hard, and why.
- Write plainly: short sentences, one idea per paragraph, jargon defined the first time it appears.

**The automated checks.** Every pull request runs these in CI ([`content-ci.yml`](.github/workflows/content-ci.yml)):

| Check | What it catches |
|---|---|
| [markdownlint](https://github.com/DavidAnson/markdownlint) | Broken Markdown structure and style |
| [typos](https://github.com/crate-ci/typos) | Spelling mistakes, with an allowlist for technical terms |
| Citation integrity | Footnotes that are used but never defined, or defined but never used |
| Frontmatter validation | Missing or malformed chapter metadata, per book |
| Mermaid validation | Diagrams that would fail to render |
| [Vale](https://vale.sh/) | Passive voice, weasel words and banned phrases |
| [lychee](https://github.com/lycheeverse/lychee) | Dead links, so citations keep working |

**The human review.** Beyond the checks, reviewers look for consistent terminology, a difficulty level that matches the chapter's audience, diagrams that are captioned and accessible, and citations that point to primary sources.

---

## Contributing

Contributions of every size are welcome, from a typo to a full chapter. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

### Ways to help

| Time | What you can do | Open an issue first? |
|---|---|:-:|
| 5 minutes | Fix a typo or a dead link | No |
| 15 minutes | Add a missing citation, or update an out-of-date number with its source | No |
| 30 minutes | Clarify a confusing paragraph, or add a real-world example | No |
| An hour | Add a diagram to an existing chapter | Optional |
| A few hours | Review a chapter for technical accuracy | Yes |
| A weekend | Write a new chapter | **Yes** |
| Ongoing | Translate chapters into your language | Yes |

### How to contribute

1. **Read the [style guide](STYLE_GUIDE.md).** It covers voice, structure, diagrams and citations, and how each book's chapters differ.
2. **Open an issue first** for anything over half an hour of work, so nobody duplicates effort. Use the [issue templates](https://github.com/handbook-academy/engineering-handbook/issues/new/choose).
3. **Fork, branch and edit.** Use a descriptive branch name, such as `fix/raft-quorum-math` or `add/mcp-security-chapter`.
4. **Run the checks** with `npm run check:all`, or let CI run them on your pull request.
5. **Open a pull request** using the [PR template](.github/PULL_REQUEST_TEMPLATE.md). A one-line description is fine for small fixes. For a new chapter, describe your approach and list your sources.
6. **Respond to review.** A maintainer reviews within a week, usually sooner.

### What makes a great contribution

- **Correct.** Cite the primary source for every number and every claimed property.
- **Clear.** Write for the difficulty level in the chapter's frontmatter.
- **Argued.** If you think a chapter should recommend something else, make the case with sources.
- **Well structured.** Match the chapter shape of the book you're editing.

**Reviewers wanted.** If you've operated a system covered in the case studies, such as payments, chat, feeds or video, your review is worth more than a month of solo research. Open an issue with your area of expertise.

---

## Repository structure

```text
engineering-handbook/
├── content/                      The three books (CC BY-SA 4.0)
│   ├── hld/                      HLD Handbook
│   │   ├── part-0-prerequisites/ … part-11-interview-framework/
│   │   └── trade-offs/           Trade-offs Library
│   ├── dsa/                      DSA Handbook
│   │   ├── part-0-foundations/ … part-14-interview-framework/
│   │   │   └── <chapter>/lc-NNN/ sol.py · sol.java · sol.cpp · sol.go · cases.json
│   │   ├── patterns/             Pattern decision pages
│   │   ├── editorials/           Long-form editorials
│   │   ├── widgets/              Interactive widget specs (YAML)
│   │   ├── _problem-registry.yml Every LeetCode problem the book uses
│   │   └── _widget-registry.yml  Every widget
│   └── ai-eng/                   AI Engineering Handbook
│       ├── README.md             How to read the book
│       └── part-0-start-here/ … part-11-ai-product/
│           └── images/           Chapter figures
├── writing-guides/               Templates for case studies and trade-off pages
├── scripts/                      The content checks CI runs
├── .github/                      CI workflows, issue and PR templates, CODEOWNERS
├── STYLE_GUIDE.md                How we write
├── CONTRIBUTING.md               How to contribute
├── CODE_OF_CONDUCT.md            Contributor Covenant
├── SECURITY.md                   How to report a security issue
├── CITATION.cff                  Citation metadata
└── LICENSE                       CC BY-SA 4.0
```

---

## Development setup

You don't need to install anything to contribute. Edit Markdown, open a pull request, and CI checks it. To run the checks locally first:

**You'll need** [Node.js 20+](https://nodejs.org/) (the `.nvmrc` file pins the version) and npm. [typos](https://github.com/crate-ci/typos), [lychee](https://github.com/lycheeverse/lychee) and [Vale](https://vale.sh/) are optional.

```bash
git clone https://github.com/handbook-academy/engineering-handbook.git
cd engineering-handbook
nvm use        # the Node version from .nvmrc
npm install    # markdownlint, Mermaid and the other check tools
```

```bash
npm run check:all          # everything CI runs

npm run lint               # Markdown style
npm run check:frontmatter  # chapter metadata
npm run check:citations    # footnotes are defined and used
npm run check:mermaid      # diagrams parse
npm run check:typos        # spelling
npm run check:links        # dead links (slow)
npm run prose              # Vale prose style (needs Vale)
```

**Editing in the browser.** [Markdownlab](https://markdownlab.vercel.app) ([source](https://github.com/invincible04/markdownlab)) is a Markdown editor with live preview, Mermaid rendering and the same callouts and footnotes these books use. Put `https://markdownlab.vercel.app/` in front of any chapter's GitHub URL to open it there:

```text
https://markdownlab.vercel.app/https://github.com/handbook-academy/engineering-handbook/blob/main/content/hld/part-1-core-fundamentals/00-scalability.md
```

The repo also ships `.editorconfig`, `.markdownlint.json`, `.vale.ini` and `.typos.toml`, so most editors pick up the project settings on their own.

---

## FAQ

<details>
<summary><strong>Is it really free?</strong></summary>

Yes. Everything in this repository is released under CC BY-SA 4.0. Anyone, including us, can share and adapt it, but adaptations must carry the same license. So the text can't be paywalled, not by us, not by a future company, and not by anyone who forks it. You can always read every book free at [handbook.academy](https://handbook.academy), with no sign-up.

</details>

<details>
<summary><strong>How are decisions made?</strong></summary>

The project is led by its founder and maintainer, [@invincible04](https://github.com/invincible04), who decides what the books cover and gives the final approval on every change.

The books are researched, drafted and reviewed with the help of the most capable AI models available today. They're used for the heavy lifting: gathering sources, drafting and redrafting chapters, checking claims against the cited sources, and reviewing for accuracy and clarity. They don't have the final say. @invincible04 decides what ships, and anything the sources don't support is rewritten or cut.

How each kind of change is decided:

- **Typos, dead links and factual corrections:** any maintainer can merge them.
- **A new chapter or a major rewrite:** needs an issue explaining the idea, and maintainer approval.
- **A change to the curriculum (a new, renamed or reordered part):** needs a Discussion that stays open for at least a week before merging.
- **The license:** CC BY-SA 4.0 is a permanent commitment, and changing it would need every contributor's consent.

People who contribute well over several months may be invited to become maintainers, with merge rights in their area and a vote on curriculum decisions. [CODEOWNERS](.github/CODEOWNERS) shows who reviews what.

</details>

<details>
<summary><strong>Can I use it to build a paid course?</strong></summary>

Yes. CC BY-SA 4.0 allows commercial use, as long as you:

1. Credit the original: "Adapted from The Engineering Handbook, CC BY-SA 4.0, https://github.com/handbook-academy/engineering-handbook".
2. License your version under the same CC BY-SA 4.0 terms.
3. Say what you changed.

You can teach courses, run bootcamps, make videos or publish books based on this content. You can't remove the credit or relicense the text as proprietary.

</details>

<details>
<summary><strong>Can I translate it?</strong></summary>

Please do. Open an issue saying which language and which chapters you'll start with. Translations can live in parallel folders in this repo, such as `content-hi/` for Hindi, or in a linked sister repo.

</details>

<details>
<summary><strong>How is the HLD book different from system-design-primer or Alex Xu's books?</strong></summary>

[system-design-primer](https://github.com/donnemartin/system-design-primer) is a great index of other people's articles and talks. The HLD Handbook teaches every topic on the page instead, so the two work well together: the primer for breadth of resources, this book for depth.

Alex Xu's *System Design Interview* books are excellent, and the case studies here cite them often. The HLD Handbook adds the foundational chapters behind the case studies, covers newer topics (LLMs, RAG, agents, CRDTs, post-quantum crypto, MCP), is free, and takes pull requests.

</details>

<details>
<summary><strong>How is the DSA book different from NeetCode, LeetCode editorials or Cracking the Coding Interview?</strong></summary>

- **Organized by pattern, not by problem.** Each chapter teaches a structure or pattern, and the LeetCode problems are worked examples inside it.
- **Four languages side by side.** Read the chapter in Python, then open the Java, C++ or Go solution for your interview language.
- **Decision pages.** When two approaches both fit, a pattern decision page tells you which to reach for first.
- **Interactive widgets.** On the website, key chapters include animations you can step through.
- **Open.** It's free and takes pull requests.

</details>

<details>
<summary><strong>How does the AI Engineering book relate to HLD Part 9 and to other AI books?</strong></summary>

HLD Part 9 answers "how would I design this AI system at scale?". The AI Engineering Handbook answers "how do I build and operate it?": the prompt, the eval set, the retrieval pipeline, the agent loop, the trace, the bill. The two books link to each other.

Chip Huyen's *AI Engineering* is the field's most complete reference, and the book cites it. The AI Engineering Handbook is free, takes pull requests so a stale price or a renamed API parameter can be fixed quickly, picks defaults (a workflow before an agent, pgvector before a dedicated vector database), and teaches evals before RAG and agents.

</details>

<details>
<summary><strong>Is GitHub the same content as the websites?</strong></summary>

Yes, the same text. The websites add full-text search, dark mode, syntax highlighting, diagram zoom, social cards, fast navigation, and the interactive DSA widgets.

</details>

<details>
<summary><strong>Why isn't there an "awesome list" of external resources?</strong></summary>

Sources are cited inline where they matter. A separate list would repeat that work and go stale faster. If a resource is worth reading, a chapter cites it.

</details>

<details>
<summary><strong>I want to write a chapter on a new topic. How?</strong></summary>

Open an issue with the [writing template](https://github.com/handbook-academy/engineering-handbook/issues/new/choose) covering:

1. Which book and part the chapter belongs in.
2. Why it belongs: what's missing, or what's new.
3. A one- or two-paragraph outline.
4. Your primary sources.

A maintainer replies with feedback on scope within a week. Once it's approved, fork, draft and open a pull request. Case studies use [`writing-guides/case-study-template.md`](writing-guides/case-study-template.md), trade-off pages use [`writing-guides/trade-off-template.md`](writing-guides/trade-off-template.md), and every other chapter follows the [style guide](STYLE_GUIDE.md).

</details>

---

## License

Everything in this repository (the three books, the writing guides, the style guide, the check scripts, the templates and the configuration) is licensed under **[Creative Commons Attribution-ShareAlike 4.0 International](LICENSE)**.

| You can | You must |
|---|---|
| Read, share, print and screenshot it, forever | **Credit** the original, with a link to this repo |
| Build courses, bootcamps, videos or books on it | Release your version under the **same CC BY-SA 4.0 license** |
| Translate it into any language | Not relicense it as proprietary or add restrictions |
| Use it commercially | |

Nobody can paywall the text. Read every book free at **[handbook.academy](https://handbook.academy)**, with no sign-up and no paywall, ever.

---

## Citation

If you reference this project in a paper, post, book or course:

```bibtex
@misc{engineering-handbook,
  author       = {Soni, Aayush},
  title        = {The Engineering Handbook: Open-Source Engineering Curricula (HLD + DSA + AI Engineering)},
  year         = {2026},
  publisher    = {GitHub},
  url          = {https://github.com/handbook-academy/engineering-handbook},
  note         = {CC BY-SA 4.0}
}
```

> *"The Engineering Handbook (HLD + DSA + AI Engineering)" by Aayush Soni, https://github.com/handbook-academy/engineering-handbook, CC BY-SA 4.0.*

GitHub's **Cite this repository** button, Zenodo, Zotero and other reference managers read [`CITATION.cff`](CITATION.cff) directly.

---

## Acknowledgments

These books stand on the work of many people, and the chapters cite them throughout. The ones that shaped the books most:

**System design**

- **Martin Kleppmann:** [*Designing Data-Intensive Applications*](https://dataintensive.net/) underpins the distributed systems and data parts.
- **Alex Xu:** the *System Design Interview* books defined the interview case-study format the HLD case studies build on.
- **Chip Huyen:** [*Designing Machine Learning Systems*](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) shapes HLD Part 9.
- **Betsy Beyer et al. (Google):** [*Site Reliability Engineering*](https://sre.google/sre-book/table-of-contents/) and [*The Site Reliability Workbook*](https://sre.google/workbook/table-of-contents/) are behind the reliability part.
- **Mark Richards and Neal Ford:** [*Fundamentals of Software Architecture*](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/) and [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/) inform the architecture patterns.

**Data structures and algorithms**

- **Cormen, Leiserson, Rivest and Stein:** [*Introduction to Algorithms*](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) for proofs and complexity arguments.
- **Robert Sedgewick and Kevin Wayne:** [*Algorithms*](https://algs4.cs.princeton.edu/home/) for how the data structures are explained.
- **Jon Bentley:** *Programming Pearls*, the spirit behind the prompt cards.
- **Steven and Felix Halim:** [*Competitive Programming*](https://cpbook.net/) for contest techniques.
- **Aziz, Lee and Prakash:** [*Elements of Programming Interviews*](https://elementsofprogramminginterviews.com/), and **Gayle Laakmann McDowell:** [*Cracking the Coding Interview*](https://www.crackingthecodinginterview.com/), for setting the bar on interview explanations.
- **[NeetCode](https://neetcode.io/)** and the **LeetCode community** for the practice ladder and the problem set.

**AI engineering**

- **Chip Huyen:** [*AI Engineering*](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) frames the line between AI engineering and ML engineering.
- **Shawn Wang (swyx):** ["The Rise of the AI Engineer"](https://www.latent.space/p/ai-engineer) named the role and drew the API line the book is organized around.
- **Hamel Husain and Shreya Shankar:** their writing on evals and error analysis shapes the eval parts.
- **Simon Willison:** his work on prompt injection and the "lethal trifecta" underpins the security part.
- **Anthropic:** ["Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents) is the source of the workflow-versus-agent split.

**Everyone else**

- **[system-design-primer](https://github.com/donnemartin/system-design-primer)** by Donne Martin, the Kubernetes, CNCF and OpenTelemetry communities, and the Apache projects.
- The authors of SIGMOD, VLDB, OSDI, SOSP and NSDI papers, and the IETF, W3C and IANA standards.
- **Every engineer who has written a public postmortem.** Real outages taught us the most about graceful degradation, blast radius and the limits of testing.

We teach these ideas in our own words, with our own diagrams, and cite the originals.

---

## Community

- **[GitHub Discussions](https://github.com/handbook-academy/engineering-handbook/discussions):** questions, feedback and ideas
- **[GitHub Issues](https://github.com/handbook-academy/engineering-handbook/issues):** corrections, chapter requests and proposals
- **Email [hello@handbook.academy](mailto:hello@handbook.academy):** private or sensitive matters, including code of conduct and licensing questions
- **[Security advisories](https://github.com/handbook-academy/engineering-handbook/security/advisories/new):** security issues in the scripts or CI ([policy](SECURITY.md))
- **Maintainer:** [@invincible04](https://github.com/invincible04)

If the books help you, star the repo. Stars help new readers and contributors find the project.

[![Star History Chart](https://api.star-history.com/svg?repos=handbook-academy/engineering-handbook&type=Date)](https://star-history.com/#handbook-academy/engineering-handbook&Date)

---

<div align="center">

### Start reading

**HLD:** [Networking fundamentals](content/hld/part-0-prerequisites/00-networking-fundamentals.md) · [Scalability](content/hld/part-1-core-fundamentals/00-scalability.md) · [URL shortener](content/hld/part-8-case-studies/00-url-shortener.md) · [Trade-offs Library](#trade-offs-library)

**DSA:** [Arrays](content/dsa/part-1-linear-data-structures/00-arrays.md) · [Two pointers](content/dsa/part-3-pointers-window-prefix/00-two-pointers-opposite.md) · [Sliding window](content/dsa/part-3-pointers-window-prefix/03-sliding-window-variable.md) · [Pattern decision pages](#pattern-decision-pages)

**AI Engineering:** [What an AI engineer is](content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md) · [The escalation ladder](content/ai-eng/part-0-start-here/03-the-escalation-ladder.md) · [Your first eval set](content/ai-eng/part-4-eval-fundamentals/02-your-first-eval-set.md) · [Workflow vs agent](content/ai-eng/part-7-agent-engineering/00-workflow-vs-agent.md)

Licensed [CC BY-SA 4.0](LICENSE) · [handbook.academy](https://handbook.academy)

</div>

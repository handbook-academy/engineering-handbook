# Contributing to The Engineering Handbook

Thank you for your interest in contributing. This project exists because people like you are willing to write, review, translate, and improve it in public.

This guide covers **what** you can contribute, **how** to submit changes, and **the quality bar** every contribution must meet.

## Table of Contents

- [Three books, one workflow](#three-books-one-workflow)
- [Ways to Contribute](#ways-to-contribute)
- [Before You Start](#before-you-start)
- [The Contribution Workflow](#the-contribution-workflow)
- [Quality Bar](#quality-bar)
- [Diagrams](#diagrams)
- [Citations and Sources](#citations-and-sources)
- [Review Process](#review-process)
- [Recognition](#recognition)
- [Questions](#questions)

## Three books, one workflow

This repo hosts three sibling open-source curricula: the HLD Handbook under [`content/hld/`](content/hld/), the DSA Handbook under [`content/dsa/`](content/dsa/), and the AI Engineering Handbook under [`content/ai-eng/`](content/ai-eng/). All three share this contribution workflow, the same CC BY-SA 4.0 license, and the same CI quality bar — but they have **different chapter shapes** and you should match the book you're editing.

- **HLD chapters** follow the chapter template described in [Quality Bar](#quality-bar) below: intro → first principles → diagrams → worked example → trade-offs → production gotchas → references. See [STYLE_GUIDE.md](STYLE_GUIDE.md) for voice and structure.
- **DSA chapters** are practice-first: a tight cheat-sheet table, a deep dive on the data structure or pattern, prompt cards for representative LeetCode problems, and `<details>` solution + common-mistakes blocks. Code samples live as sibling files (`sol.py`, `sol.java`, `sol.cpp`, `sol.go`) under each chapter's directory; the Python solution is inlined in the chapter, the others are linked. See [`content/dsa/part-1-linear-data-structures/00-arrays.md`](content/dsa/part-1-linear-data-structures/00-arrays.md) for the canonical shape and [STYLE_GUIDE.md § DSA-specific deviations](STYLE_GUIDE.md#dsa-specific-deviations) for the schema rules.

- **AI Engineering chapters** have no fixed skeleton: each opens with a real incident or failing example, explains the mechanism, and ends with something the reader can apply. Figures are PNGs in each part's `images/` folder with alt text and a caption; code is Python; perishable facts (prices, model names, benchmarks) carry an "as of" date and a footnoted source. See [`content/ai-eng/README.md`](content/ai-eng/README.md) and [STYLE_GUIDE.md § AI Engineering-specific deviations](STYLE_GUIDE.md#ai-engineering-specific-deviations).

The rest of this guide applies to every book unless noted.

## Ways to Contribute

Pick the contribution level that matches the time you have.

| Time | What You Can Do | Need Issue First? |
|------|-----------------|-------------------|
| 5 minutes | Fix a typo, dead link, or formatting error | No |
| 30 minutes | Add a real-world example, update an outdated number, clarify a paragraph | No |
| 1 hour | Create a Mermaid diagram for an existing chapter | Optional |
| 2 to 4 hours | Review an existing chapter for accuracy (leave review comments) | Yes |
| 4 to 8 hours | Write a full chapter from an outline | **Yes, required** |
| Ongoing | Translate a chapter or section to another language | Yes |

> [!TIP]
> If you have built one of the systems we have a case study for (chat systems, payment systems, feeds, etc.), please review the case study even if you have no time to write. A 30-minute review from someone with production experience beats a month of solo theorising.

## Before You Start

### Read at least one existing chapter

Read a complete chapter to understand the expected depth, structure, and tone. Good references:

- [0.0 Networking Fundamentals](content/hld/part-0-prerequisites/00-networking-fundamentals.md)
- [1.4 Back of Envelope Estimation](content/hld/part-1-core-fundamentals/04-back-of-envelope-estimation.md)
- [8.0 Case Study: URL Shortener](content/hld/part-8-case-studies/00-url-shortener.md)

### Read the Style Guide

[STYLE_GUIDE.md](STYLE_GUIDE.md) documents the writing voice, structure, and formatting rules. Every PR is checked against it.

### Check open issues

Before starting a large contribution, search the [issue tracker](../../issues) and [pull request list](../../pulls) to avoid duplicating work.

## The Contribution Workflow

### For small fixes (typos, links, minor edits)

1. Fork the repo.
2. Create a branch: `fix/typo-in-cap-chapter` or similar.
3. Make the change.
4. (Optional) Run `npm install && npm run check:all` locally to catch issues.
5. Open a PR. Reference any related issue in the description.
6. Wait for review. A maintainer will merge or request changes within **one week**.

### For a new chapter (from an outline)

1. **Open an issue first** with title `Writing: [Chapter Name]`. This reserves the chapter so two people do not duplicate work. Include:
   - Your proposed scope (topics you will cover)
   - Expected word count
   - Self-imposed deadline

2. Wait for acknowledgement from a maintainer (usually within 48 hours).

3. Fork and branch: `chapter/part-2-caching` or similar.

4. **Use the writing-guides template.** Part 8 case studies must follow [writing-guides/case-study-template.md](writing-guides/case-study-template.md). Trade-off pages must follow [writing-guides/trade-off-template.md](writing-guides/trade-off-template.md).

5. Write the chapter following the [chapter template](#the-chapter-template).

6. (Optional) Run local checks to get fast feedback before pushing:

   ```bash
   npm install                # one-time
   npm run lint               # markdownlint
   npm run check:frontmatter  # YAML schema
   npm run check:citations    # footnote integrity
   npm run check:mermaid      # diagram syntax
   npm run check:typos        # spell check
   npm run check:all          # everything
   npm run stats              # view content statistics
   ```

   You don't have to run these locally — CI will run them all on your PR automatically and report what needs fixing.

7. Open a PR. In the description, link the tracking issue and summarise your key design choices (e.g., "I chose to treat cache-aside as the default and discuss write-through as an alternative because...").

8. Be prepared for substantive review. Chapters are reviewed for technical accuracy, clarity, and consistency with the rest of the book.

### For a translation

1. Open an issue titled `Translation: [Language] [Chapter Name]`.
2. We will add the translation directory structure if it does not exist.
3. Follow the same workflow as a new chapter.
4. Translations are merged into the `content/i18n/[lang]/` directory.

## Quality Bar

Every contribution is held to the same standard regardless of contributor experience.

### Hard rules (non-negotiable)

| Rule | Why |
|------|-----|
| **No emoji as structural icons in chapter body.** Frontmatter tags and callout icons are allowed. | Emoji render inconsistently across platforms; use proper SVGs or plain text in content. |
| **Real URLs only.** Never invent a link. If uncertain, cite "Author, Year, Title" without URL. | Our readers trust our citations. Hallucinated URLs destroy that trust. |
| **Original writing.** Do not paste content from ByteByteGo, DesignGurus, Educative, or any paid course. You can reference the same concepts, but write from scratch. | Legal (DMCA risk) and ethical. |
| **Technical accuracy.** Every specific number (QPS, latency, throughput) must be verifiable. Cite the source. | We are not publishing rumours. |
| **Frontmatter complete.** `title`, `description`, `part`, `module`, `difficulty`, `prerequisites`, `date_created`, `date_updated`. | CI depends on it. |

### The Chapter Template

Every new chapter must include these sections in this order:

1. **Frontmatter** (YAML at top)
2. **Title** (`# H1` matching the frontmatter title)
3. **TL;DR** (blockquote, one to two sentences)
4. **Learning Objectives** (checklist, 3 to 6 items)
5. **Intuition** (analogy or concrete scenario)
6. **Theory** (core content, with sub-sections using `###`)
7. **Real-World Example** (cite a specific company and their engineering blog)
8. **Trade-offs** (comparison table with at least 3 rows)
9. **Common Pitfalls** (with `[!WARNING]` callout)
10. **Exercise** (with `<details>` hint and `<details>` sample solution)
11. **Key Takeaways** (3 to 5 bullets)
12. **Further Reading** (with real URLs)
13. **Flashcards** (2 to 3 Q/A pairs in blockquotes)

See any complete chapter in `content/hld/part-0-prerequisites/` for an example. For Part 8 case studies and trade-off pages, use the dedicated templates in [writing-guides/](writing-guides/).

### Diagrams

We use **Mermaid** and **Excalidraw** only. ASCII box diagrams (drawn with `+`, `-`, `|`) are not allowed: they drift out of sync with Mermaid on the same page, break in proportional fonts, and offer nothing Mermaid cannot express better.

- **Mermaid** is the default. Use it for sequence diagrams, flowcharts, state machines, ER diagrams, and architecture overviews. It renders on GitHub and on the website with zero plugins.
- **Excalidraw** is for diagrams Mermaid cannot express: multi-region deployment topologies, threat models, free-form whiteboard annotations.

Every teaching chapter must include **at least three Mermaid diagrams** (case studies: at least four) unless inherently non-visual. Every diagram gets a one-sentence italic caption directly below explaining the takeaway. See `STYLE_GUIDE.md` for full rules.

### Citations and Sources

| Source Type | How to Cite |
|-------------|-------------|
| Engineering blog | `[Post Title](URL) by Company Name, Year` |
| Academic paper | `Author et al., "Title," Venue Year. [DOI or arxiv URL]` |
| Book | `Author, _Title_, Publisher Year, chapter/page` |
| RFC or spec | `[RFC XXXX: Title](https://datatracker.ietf.org/doc/html/rfcXXXX)` |
| Documentation | `[Topic](Official docs URL)` |

Prefer primary sources (the engineering blog, the paper, the RFC) over secondary summaries (Medium articles summarising the engineering blog).

## Review Process

We follow a **batch review** model. Maintainers review PRs on a weekly cadence, not in real time. Expect:

- **Typo and link fixes:** merged within 3 days.
- **Content edits and examples:** reviewed within 1 week.
- **Full new chapters:** reviewed within 2 weeks, usually across 2 review rounds.

### What reviewers check

1. **Technical accuracy.** Are the claims true? Do the numbers verify?
2. **Clarity.** Can a reader who has never seen this topic understand it?
3. **Consistency.** Does it match the voice of the rest of the book?
4. **Completeness.** Are all required sections present?
5. **Compliance.** No paywalled-content copies, frontmatter valid, diagrams render.

### Feedback culture

We aim for **specific, kind, actionable** review comments.

- Specific: "The QPS estimate on line 42 is off by 10x. DAU is 100M, so 100M / 86,400 seconds = ~1,200 QPS average, not 12,000."
- Kind: no personal judgement, only claim-level feedback.
- Actionable: always suggest a concrete fix.

If you receive review feedback, push fixes to the same branch. Do not open a new PR.

## Recognition

All contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md), sorted by first contribution date.

Chapter authors are credited at the top of the chapter they wrote. Reviewers are credited in the chapter's acknowledgements section.

We are explicitly **not** using a points or ranking system. Contributions of all sizes are valued equally.

## Questions

- **Technical questions about writing a chapter:** Open an issue with the `question` label, or ask in [GitHub Discussions](../../discussions).
- **Bug report for content (typo, factual error, broken link):** Open an issue with the `content: correction` label.
- **Bug report for the rendered website at hld.handbook.academy:** Open an issue here using the [site bug template](.github/ISSUE_TEMPLATE) with a screenshot and the URL, or email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Private concern (conduct, legal, security):** Email [hello@handbook.academy](mailto:hello@handbook.academy), open a [private security advisory](https://github.com/handbook-academy/engineering-handbook/security/advisories/new) on GitHub, or contact the maintainer via their GitHub profile at [@invincible04](https://github.com/invincible04).

By contributing, you agree that your contributions will be licensed under the same terms as the rest of the project (CC BY-SA 4.0).

Welcome aboard.

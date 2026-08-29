---
title: "Choosing your interview language"
description: "How to pick a language for technical interviews: trade-offs, what each language costs you in problem-solving time, and a decision tree."
slug: 06-choosing-your-language
part: 0
chapter: 6
difficulty: beginner
prerequisites: [00-how-to-use, 05-language-idioms]
date_updated: 2026-05-24
languages: [python, java, cpp, go]
ladder:
  core: []
  stretch: []
---

# Choosing your interview language

Friday at 10 a.m. you have a Meta phone screen. You write Java at work, but you've been doing LeetCode in Python for a month because the syntax is shorter. It is now Wednesday night. You have ninety seconds to pick the language you'll open the editor in on Friday and a hundred hours of practice already invested in the wrong direction. Pick.

That is the actual problem. The internet treats this question like a tournament bracket where one language wins; the data says otherwise. interviewing.io ran a quantitative analysis on roughly 3,000 logged technical interviews and found no statistically significant difference in pass rate as a function of language choice, with one exception at p = 0.037: candidates interviewing in Java were more likely to pass when the company's stack was Java.[^1] Their direct conclusion: "wielding your language of choice comfortably beats out showing off in a fancy-sounding language you don't know well, every time."[^1]

So the chapter does not crown a winner. It tells you when to switch, how late is too late, and which two cells in the gotcha table account for half the "my code worked locally" stories.

## Which language should I pick?

Default to **Python** if you don't already have a strong incumbent. Yangshun Tay, ex-Meta Staff Engineer and author of Blind 75, recommends Python, C++, Java, or JavaScript, with the canonical reason for the higher-level recommendation: "higher level languages like Python or Java provide standard library functions and data structures which allow you to translate solution to code more easily."[^2] His acceptable secondary list is Go, Ruby, PHP, C#, Swift, Kotlin. The list to *avoid*, because interviewers can't read them fluently, is Haskell, Erlang, Perl, C, MATLAB.[^2]

Python wins on three concrete axes. A sliding-window medium runs 15 to 25 lines in Python and 30 to 50 lines in Java. The standard library covers `Counter`, `deque`, `heapq`, `bisect`, `itertools`, and `lru_cache` out of the box. The whiteboard is forgiving: no type declarations, no class wrapper, slicing notation that compresses to one line.

Python loses on integer overflow only in the trick-question sense — it doesn't overflow, because `int` is arbitrary-precision per PEP 237.[^3] Java, C++, and Go all carry the overflow tax. See [Math for interviews](./04-math-for-interviews.md) and [Language idioms](./05-language-idioms.md) for the receipts.

The cases where you'd pick something else:

- **Stick with your day-job language if you already write it fluently.** Yangshun puts it directly: "If you have been using Java at work for a while now and do not have time to be comfortably familiar with another language, I would recommend just sticking to Java instead of picking up Python from scratch just for the sake of interviews."[^2] The switching cost is real and usually larger than the gain.
- **C++ for trading firms, ByteDance core systems, and Bloomberg.** Lowest TLE risk on the hardest problems and the cultural default at those shops.
- **Java for any large JVM shop.** Amazon, Bloomberg backend, parts of Microsoft Azure. The Java-at-Java-shop signal is the only language effect interviewing.io found in its data.[^1]
- **Go for Stripe, CNCF infrastructure shops, and back-end loops at Cloudflare and ByteDance infrastructure**, provided your target is not Google (see the next question).

Almost every other case: Python.

## Will my language work at my target company?

Yes, except at one place. Yangshun's *Tech Interview Handbook* documents the only hard restriction in the industry: "Most companies let you code in any language you want, the only exception I know being Google, where they only allow candidates to pick from Java, C++, JavaScript or Python for their algorithmic coding interviews."[^2] Go is acceptable on Google's job-board listings (the team uses it internally) but is not on the algorithmic-coding-round list.

The defaults at every other big-tech company are softer signals. They tell you what an experienced engineer at the company would notice without comment, not what they require. Most of the per-company guidance below comes from candidate reports and recruiter notes synthesized in the handbook's interview-research compilation, not from primary company documentation.[^4]

| Company | What candidates report | Hard restriction |
|---|---|---|
| Google | Python is most common in interviews; Java and C++ widely accepted | **Yes:** Java, C++, JavaScript, or Python only[^2] |
| Meta | Python for SWE-Product, C++ for infra, JavaScript for frontend; interviews accept any of the four[^4] | None for algorithmic rounds |
| Amazon | Java is the long-standing convention for backend, but Python is fully accepted; C++ for AWS systems[^4] | None |
| Microsoft | C# is the internal default for many teams; Java and Python equally welcomed[^4] | None |
| Apple | Team-dependent: iOS expects Swift or Objective-C; infra accepts Python, Java, C++, Go; ML expects Python[^4] | Per-team; ask the recruiter |
| Netflix | Python dominant for backend and data; Java in legacy services[^4] | None reported |
| Stripe | Stated policy is language-agnostic; in practice candidates use Ruby, Python, Go[^4] | None |
| ByteDance / TikTok | C++ for core systems, Go for infra, Python for ML[^4] | None reported |
| Bloomberg | C++ is the historical default (the terminal codebase); Python and Java fine[^4] | None |

The single call-out worth memorizing: if you're targeting Google and you've picked Go, switch the language or change the target. Every other row is a soft preference, not a wall.

## Does language signal differently at new-grad versus senior?

For new graduates, the only signal that matters is *fluency in any one language*. interviewing.io's data is unambiguous: the candidates who fail are not the ones who picked Java instead of Python. They are the ones who picked any language they weren't fluent in.[^1] The new-grad signal is "I can write fluent code in this language under time pressure," and Python satisfies that signal in the shortest practice time.

For senior candidates (L5+ / E5+), the calibration shifts. A senior writing Python at a heavily-Java shop doesn't fail the loop, but the interviewer notes the candidate didn't bother to learn the company's stack. interviewing.io's Java-at-Java-shop effect was statistically significant for general candidates and the magnitude is plausibly higher at senior level, where idiom expectations are tighter.[^1] If you're targeting one primary company, interview in their default language even if your day job is something else. Cost: 40 to 80 hours of ramp-up. Benefit: a signal that you already know what they use.

For staff and principal candidates, the round structure changes and language choice fades. Stripe's staff loop is a written one-pager and a presentation. Apple's senior loops include a deep-dive in the candidate's strongest area. Meta's E7+ candidates get the AI-assisted multi-file round, where day-job language wins by definition. Write whatever you write best.

## When is it too late to switch?

The cost of switching languages mid-prep grows superlinearly with hours invested. The numbers below come from the time required to re-internalize the eight cross-language idiom cells in [Language idioms](./05-language-idioms.md) (sort with comparator, hash map literal, deque, heap, recursion limit, generics, equality and hash, slicing) at roughly 30 to 90 minutes per cell, multiplied across 200 to 400 problems.

| Hours practiced | Switching cost | Recommendation |
|---:|---|---|
| 0 to 5 | trivial | Switch freely. The cost is one weekend. |
| 5 to 20 | 10 to 20 hours | Switch on a real reason: a target company's hard restriction, or a language you actually know better. |
| 20 to 50 | 30 to 60 hours | Switch only on a hard blocker: target became Google and you picked Go, or a missing standard-library piece keeps biting. |
| 50 to 200 | 60 to 150 hours | Don't switch. Work around the limitations. |
| 200+ | starting fresh | Don't switch under any circumstances. Ship with what you have. |

The operational rule is short: **decide in the first five hours, and only switch in the first twenty.** After that, the cost of switching is higher than the cost of working around whatever made you want to switch.

Real reasons to switch: your target shifted from a Python-friendly shop to Google and you picked Go; you're 30 hours in and Python's recursion-limit and dict-iteration-order semantics keep biting you on graph problems; you're joining a Java team in three months and want interview prep to double as on-job ramp.

Bad reasons to switch: "C++ looks more impressive" (interviewing.io's data does not support this; pass rate is statistically the same across languages[^1]); "the company uses Rust internally" (Rust is not a common interview language, and using something the interviewer can't read is a self-inflicted handicap[^2]); "I heard Python is faster to write" (true on average, but if you've already written 30 hours of Java the writing-speed gain is consumed by the re-learning cost).

## What gotchas should I watch out for?

A quick reference card. Each row is a real interview-ending bug, indexed by language. The depth lives in [Language idioms](./05-language-idioms.md); this is the at-a-glance version.

| Gotcha | Python | Java | C++ | Go |
|---|---|---|---|---|
| Integer overflow | none (PEP 237)[^3] | yes (`int` is signed 32-bit, max `2^31 - 1`) | yes (signed overflow is UB) | yes (use `int64` or guard) |
| Default recursion depth | 1,000 (raise to `10**6` at module top) | ~5,000 to 20,000 (JVM stack ~1 MB) | ~50,000 to 200,000 (8 MB stack on Linux/macOS) | unbounded (goroutine stacks auto-grow) |
| Hash-map iteration order | insertion order (3.7+) | undefined in `HashMap`; use `LinkedHashMap` | undefined in `unordered_map` | undefined and randomized by design |
| Default heap polarity | min-heap (`heapq`) | min-heap (`PriorityQueue`) | **max-heap** (`std::priority_queue`) | depends on `Less` |
| Container front pop | `list.pop(0)` is O(n); use `collections.deque` | `LinkedList` works; `ArrayDeque` is faster | `std::deque` is canonical | `slice[1:]` is O(n) and aliases |
| Sort stability default | stable (TimSort) | stable for `Arrays.sort(Object[])`; not for `int[]` | not stable; use `std::stable_sort` | not stable; use `slices.SortStableFunc` |
| Comparator overflow | none | yes (`a - b` violates total order; use `Integer.compare`) | yes (subtract is UB on overflow) | yes (use `cmp.Compare`) |

Two rows account for the majority of "my code worked locally but failed the interview" anecdotes. The recursion-depth row catches you when a Python solution that worked on `n = 100` blows up at `n = 1,000` because it crosses the 1,000-frame default; `sys.setrecursionlimit(10**6)` at the top of the file is the one-time fix. The integer-overflow row catches you when `a * b` quietly wraps in Java, C++, or Go; the fix is to widen to `long` / `long long` / `int64` *before* the multiply, not after.

## What to do this week

If you don't have an incumbent: open this chapter again, write `count_freqs("abracadabra")` in Python (it's two lines with `Counter`), and start with [Computational complexity and Big-O](./01-complexity-big-o.md). Sunk cost is currently zero. Decide before you cross the five-hour mark.

If you do have an incumbent: stay with it. The 40 to 80 hours you'd spend learning a new language don't pay back unless your incumbent is on Yangshun's avoid list (Haskell, Erlang, Perl, C, MATLAB) or your only target is Google and you currently write Go.

If JavaScript is your incumbent, the [JavaScript interview preparation path](https://frontendatlas.com/guides/framework-prep/javascript-prep-path) provides a 7-, 14-, or 30-day practice sequence covering runtime reasoning, coding drills, and frontend interview follow-ups.

[Language idioms](./05-language-idioms.md) is the cross-language reference you'll come back to. [Part 14 — Interview framework](../part-14-interview-framework/00-pattern-recognition.md) is the broader prep mental model. The language is decided. The next 100 to 400 hours of practice are the part that actually matters.

## References

[^1]: Lerner, A. and Holtz, D., "We analyzed thousands of technical interviews on everything from language to code style. Here's what we found," interviewing.io blog, [interviewing.io/blog/we-analyzed-thousands-of-technical-interviews-on-everything-from-language-to-code-style-here-s-what-we-found](https://interviewing.io/blog/we-analyzed-thousands-of-technical-interviews-on-everything-from-language-to-code-style-here-s-what-we-found).

[^2]: Tay, Y., "Which programming language to use for coding interviews," *Tech Interview Handbook*, [techinterviewhandbook.org/programming-languages-for-coding-interviews](https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/).

[^3]: Zadka, M. and van Rossum, G., "PEP 237 — Unifying Long Integers and Integers," [peps.python.org/pep-0237](https://peps.python.org/pep-0237/).

[^4]: Per-company defaults synthesized from candidate reports and recruiter conversations on interviewing.io's company-specific guides (refreshed Q4 2025 / Q1 2026) and the krishnadey30/LeetCode-Questions-CompanyWise community tags.

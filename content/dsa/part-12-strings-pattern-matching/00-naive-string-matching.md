---
title: "Naive string matching"
description: "The O(nm) double loop hidden inside str.find and str.indexOf. Average-case behavior on real text, and the adversarial inputs that motivate KMP and Rabin-Karp."
slug: 00-naive-string-matching
part: 12
chapter: 0
difficulty: intermediate
prerequisites:
  - part-1-linear-data-structures/02-strings
  - part-0-foundations/01-complexity-big-o
date_updated: 2026-05-25
languages: [python, java, cpp, go]
canonical_test: LC-28
widgets: []
ladder:
  core: [LC-28, LC-1455, LC-686]
  stretch: [LC-30, LC-796]
  star: LC-28
---

# Naive string matching

Type `"hello world".find("world")` in Python and you get `6`. Same call in Java is `"hello world".indexOf("world")`. C's `strstr("hello world", "world")` returns a pointer four bytes past the start of `"world"`. Go's `strings.Index("hello world", "world")` returns `6` again. Four languages, four spellings, one job: tell me where the needle starts.

You've used these calls a thousand times. They're so unremarkable that very few engineers can describe what's happening behind them. This chapter answers that question. The algorithm under the function name is short enough to fit on a postcard, runs fast enough on real text that nobody complains, and breaks badly enough on adversarial input that the next three chapters in Part 12 exist mainly to fix it.

## The standard library is the algorithm

Every modern runtime ships a substring matcher. None of them are exotic. Python's `str.find` does roughly what we're about to write; CPython's implementation adds a few constant-factor tricks around it but follows the same shape. Java's `String.indexOf` is the textbook double loop, plain and unornamented. C++ `std::string::find` is the same. Go's `strings.Index` short-circuits on small needles and otherwise calls into a Rabin-Karp variant for longer ones, but for needles under 32 bytes it uses naive byte comparison.

The exception is `strstr` in modern C. glibc and musl both replaced their naive `strstr` with the Crochemore-Perrin two-way algorithm sometime in the 2000s, which runs in worst-case `O(n)` with `O(log m)` extra space.[^glibc] On most systems `strstr` is therefore *not* what this chapter teaches. It's the algorithm `strstr` used to be, and the algorithm `String.indexOf` still is.

Why teach the version the C library walked away from? Two reasons. The naive algorithm is the baseline that 12.1 (Rabin-Karp), 12.2 (KMP), and 12.3 (Z) each improve on, and reading those three without seeing the algorithm they replace turns each one into a magic trick. And on the inputs where naive runs (random text, English prose, anything that isn't deliberately adversarial), it averages `Θ(n + m)`,[^wiki-kmp] the same bound as KMP without the failure table. The standard library kept it for so long because for real input it's fine.

## The naive matcher in five lines

The pattern is a plain double loop. For each starting position `i` in the text, compare up to `m` characters of the pattern against the text starting at `i`. If all `m` match, return `i`. If any mismatches, advance `i` by one and try again. No precomputation, no shift table, no rolling state.

```python
# LC 28 — Find the Index of the First Occurrence in a String
def str_str(haystack: str, needle: str) -> int:
    n, m = len(haystack), len(needle)
    if m == 0:
        return 0
    if m > n:
        return -1
    for i in range(n - m + 1):
        j = 0
        while j < m and haystack[i + j] == needle[j]:
            j += 1
        if j == m:
            return i
    return -1
```

**Solution** — Python ([Java](./00-naive-string-matching/lc-28/sol.java) · [C++](./00-naive-string-matching/lc-28/sol.cpp) · [Go](./00-naive-string-matching/lc-28/sol.go))

```python
# LC 28. Find the Index of the First Occurrence in a String
def str_str(haystack: str, needle: str) -> int:
    """Return the first index where needle occurs in haystack, or -1."""
    n, m = len(haystack), len(needle)
    if m == 0:
        return 0
    if m > n:
        return -1
    for i in range(n - m + 1):
        j = 0
        while j < m and haystack[i + j] == needle[j]:
            j += 1
        if j == m:
            return i
    return -1
```

Two guards do real work and one loop bound deserves attention. An empty needle returns `0` because every implementation of `find` defines empty-pattern-matches-at-zero (`"abc".find("") == 0` in Python, same in Java, same in C). A needle longer than the haystack returns `-1` because no shift can fit. The outer loop runs from `0` to `n - m` *inclusive*: in Python that's `range(n - m + 1)`; in Java, C++, and Go that's `i <= n - m`. The off-by-one trap here is real. Drop the `+ 1` and you miss matches that start at the very end of the haystack, where `i = n - m`.

CLRS prints the same algorithm under the name `NAIVE-STRING-MATCHER` and observes that it is "inefficient because information gained about the text for one value of s is totally ignored in considering other values of s."[^clrs] Crochemore, Hancart, and Lecroq print it as "Brute Force" with the inner equality test expanded into the same character loop you see above.[^chl] The two are identical up to the indexing convention.

## The worst case that motivates Part 12

Take the haystack `"aaaaaaaa"` (eight `a`s) and the needle `"aaab"`. The matcher checks position 0: `a == a`, `a == a`, `a == a`, then `a != b`. Mismatch. Slide to position 1. Check `a == a`, `a == a`, `a == a`, then `a != b`. Mismatch. The same near-miss plays out at every starting position, and the function eventually returns `-1` after burning `(n - m + 1) · m` comparisons.

Wikipedia's KMP article frames the pathological case beautifully: imagine a haystack of one million `A`s and a needle of 999 `A`s followed by a single `B`. The naive algorithm performs roughly one billion character comparisons before deciding the needle isn't there.[^wiki-kmp] At a few hundred million simple operations per second, that's a measurable wait on a phone, an unacceptable wait on a server.

The shape generalizes. Any pattern that ends in a mismatch character but is otherwise built from a long matching prefix triggers the same blowup. The information gained from "the first 999 characters at this shift matched" is exactly the information KMP keeps and naive throws away. Naive starts the inner loop from `j = 0` on every shift; the next three chapters each find a different way to reuse what was already compared.

## Cost

Let `n = |haystack|` and `m = |needle|`. The outer loop runs `n - m + 1` times. The inner loop runs at most `m` times per outer iteration. Multiplying gives the worst-case bound. The algorithm uses no auxiliary data (no hash, no failure table, no Z-array), so space is constant.

| Variant | Time | Space |
|---|---|---|
| Best case | `O(n)` | `O(1)` |
| Average case (random text, alphabet of size σ) | `Θ(n + m)` | `O(1)` |
| Worst case | `O(n · m)` | `O(1)` |

The average-case bound deserves a proof sketch. For uniformly random text over an alphabet of size σ, the expected number of comparisons before the first mismatch at any given shift is the geometric mean `< σ / (σ - 1)`. With σ = 26 (English letters) that's about 1.04 comparisons per shift, so the total work is `(n - m + 1) · 1.04 ≈ n` plus the `m` comparisons in the matching shift if there is one. Total: `Θ(n + m)`, the same bound as KMP.[^wiki-kmp] The constant-factor cost of computing KMP's failure table is what keeps naive matching competitive on real text.

The space column is the algorithm's only structural advantage over the rest of Part 12. Rabin-Karp adds `O(1)` rolling-hash state but needs hash-mismatch verification. KMP adds an `O(m)` failure table. Z-algorithm computes an `O(n + m)` Z-array. When memory is the bottleneck and time isn't (embedded systems, a small lookup buried inside a tight loop, anything where allocating a table is more expensive than running the comparisons), naive wins.

## Where the pattern bends

Three problems in the ladder reuse the same five-line matcher with different framing around it.

**Find every occurrence, not just the first.** Replace `return i` with `result.append(i)` and continue past the match. Position increments by one (overlapping matches counted) or by `m` (non-overlapping); pick from the problem statement. The CLRS pseudocode is the all-occurrences form by default. Finding only the first is a specialization, not the natural shape.

**Search a constructed haystack.** [LC 686 — Repeated String Match](https://leetcode.com/problems/repeated-string-match/) asks for the minimum number of times string `a` must be repeated for `b` to appear inside it. Concatenate `a` exactly `ceil(|b| / |a|)` times, run naive search, return that count if found. If not found, append one more copy and search again. If still not found, return `-1`. The `+1` ceiling is provably tight: any longer concatenation can't help, because any match of `b` has to start within the first `|a|` characters of some repetition. The algorithm is naive matching; the cleverness is the bound on how much haystack to build.

**Use the doubled-text trick.** [LC 796 — Rotate String](https://leetcode.com/problems/rotate-string/) asks whether one string is a rotation of another. Every rotation of `s` appears as a substring of `s + s`. The one-line solution is `len(s) == len(goal) and goal in s + s`, which calls naive matching (or whatever the runtime ships) on the doubled text. The length guard prevents false positives when the strings differ in length; the rotation theorem does the rest.

## Two pitfalls that bite

> [!WARNING]
> **Sliding by `j` after a partial match.** After matching `k` characters at shift `i` and hitting a mismatch on the `k+1`th, the temptation is to write `i += k` instead of `i += 1`, on the reasoning that "we already matched k characters, so we can skip them." This *is* the optimization KMP performs, but only with the failure function to back it up. Without it, the shift skips matches whenever the needle has a non-trivial proper prefix that's also a suffix of the matched part. In naive matching, `i += 1` always. Resist the optimization until you reach [KMP](./02-kmp.md), which is precisely the chapter that makes it correct.

> [!WARNING]
> **Slicing inside the inner loop.** Writing `if haystack[i:i+m] == needle:` in Python or `haystack.substring(i, i+m).equals(needle)` in Java reads naturally but allocates a fresh string at every shift. The comparison is still `O(m)` time, but it's now `O(m)` extra space per shift, and the total allocation count is `n - m + 1` strings that the garbage collector has to reclaim. The explicit character loop in the reference implementation does the same comparison without any allocation. On LC 28's test suite the slice form passes; on a profiler it shows up immediately. Save the slice form for prototypes and write the character loop in production code.

## Problem ladder

### CORE (solve all three to claim chapter mastery)

- [LC 28 — Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) [Easy] • naive-string-matching ★
- [LC 1455 — Check If a Word Occurs As a Prefix of Any Word in a Sentence](https://leetcode.com/problems/check-if-a-word-occurs-as-a-prefix-of-any-word-in-a-sentence/) [Easy] • naive-string-matching *(reference: Python only)*
- [LC 686 — Repeated String Match](https://leetcode.com/problems/repeated-string-match/) [Medium] • naive-string-matching *(reference: Python only)*

### STRETCH (optional)

- [LC 30 — Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/) [Hard] • naive-string-matching + hash-counter *(canonical solution lives in [Sliding window: fixed size](../part-3-pointers-window-prefix/02-sliding-window-fixed.md))*
- [LC 796 — Rotate String](https://leetcode.com/problems/rotate-string/) [Easy] • naive-string-matching *(reference: Python only)*

The pattern admits no canonical Hard problem on its own. The LeetCode Hards tagged with naive matching (LC 214 Shortest Palindrome, LC 1392 Longest Happy Prefix) are canonically solved with KMP or Z-algorithm and belong to those chapters. LC 30's brute force *is* naive matching at every starting index, which is why it sits as STRETCH here while [Sliding window: fixed size](../part-3-pointers-window-prefix/02-sliding-window-fixed.md) owns the optimal solution.

## Where this leads

[Rabin-Karp and rolling hashes](./01-rabin-karp.md) keeps a rolling hash of the current text window across shifts; the gap between naive's `O(n · m)` worst case and `Θ(n)` average closes as soon as the hash agrees, since hash agreement is checked in `O(1)` and only verified at full cost on a match. [KMP and the failure function](./02-kmp.md) preserves the longest proper-prefix-also-suffix information across shifts, turning the worst case from `O(n · m)` into `Θ(n + m)` without sacrificing simplicity.[^kmp1977] [The Z-algorithm](./03-z-algorithm.md) reaches the same `Θ(n + m)` bound through a different data structure that's often easier to teach. Each one is the answer to a question naive matching can't answer: *what did we already know, and how can we use it next time?*

## References

[^clrs]: Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms*, 4th ed., MIT Press, 2022. §32.1 "The naive string-matching algorithm." The procedure `NAIVE-STRING-MATCHER(T, P)` with loop bound `for s = 0 to n - m`; worst-case bound `O((n - m + 1) m)`.

[^chl]: Crochemore, Hancart, Lecroq. *Algorithms on Strings*, Cambridge University Press, 2007. §1.2 "Brute force algorithm." Companion site at [monge.univ-mlv.fr/~lecroq/string](https://web.archive.org/web/20241217120010/http://monge.univ-mlv.fr/~lecroq/string/) with the canonical pseudocode and worst-case analysis.

[^wiki-kmp]: Wikipedia, "Knuth-Morris-Pratt algorithm." [en.wikipedia.org/wiki/Knuth-Morris-Pratt_algorithm](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm). The "Background" section gives the adversarial pair (`s = "AAAA...A"` of length 1M, `w = 999 As followed by B`) with the resulting one-billion-comparison worst case, and the average-case `Θ(n)` argument for uniform random text.

[^glibc]: glibc, `string/str-two-way.h`. The Crochemore-Perrin two-way string-matching algorithm is the production replacement for naive `strstr` / `memmem` in the GNU C library. Two-way runs in `O(n)` worst case with `O(log m)` extra space, beating naive's `O(n · m)` worst case while keeping the no-preprocessing-table feel. Source: [code.woboq.org/userspace/glibc/string/str-two-way.h](https://code.woboq.org/userspace/glibc/string/str-two-way.h.html).

[^kmp1977]: Knuth, D. E.; Morris, J. H.; Pratt, V. R. "Fast pattern matching in strings." *SIAM Journal on Computing* 6 (2), pp. 323-350, 1977. [doi.org/10.1137/0206024](https://doi.org/10.1137/0206024). The original paper that beat naive `O(n · m)` for pattern matching, and the historical reason a baseline chapter exists at all.

---
title: "Red-teaming"
description: "Automated probe suites, manual protocols, and continuous red-teaming in CI: how to attack your own AI system before someone else does."
slug: 06-red-teaming
part: 9
chapter: 6
difficulty: advanced
prerequisites:
  - 00-prompt-injection
  - 02-guardrails
  - part-8-evaluation-and-observability/04-regression-suites-and-ci-gates
tags: [llm, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Red-teaming

In April and May 2024, Microsoft's research team tested a multi-step jailbreak called **Skeleton Key** against seven frontier models: Llama 3 70B Instruct, Gemini Pro, GPT-3.5, GPT-4o, Mistral Large, Claude 3 Opus, and Cohere Commander R Plus. The attack works by asking the model to *augment* rather than change its behavior guidelines, framing compliance as scientific research and asking only for a warning prefix on harmful output. Seven out of seven models complied. Only GPT-4 showed partial resistance, and only when system messages were strictly separated from user inputs.[^1]

That's why red-teaming exists. Models with substantial safety investment fail multi-turn attacks that don't appear on standard safety benchmarks. The job is to find these failures in your own deployment, with your own system prompt and your own tools, before an attacker does. Microsoft's published lesson after red-teaming more than 100 generative AI products through October 2024 is the framing to keep: "generative AI amplifies existing security risks and introduces new ones," including classic SSRF and injection bugs that exist independently of the AI layer.[^2]

## What automated probe suites give you

Three serious tools cover the automated breadth side. They're complements, not alternatives, and each is right for a different job.

**garak** is the model-level breadth scanner, originally NVIDIA, now maintained at github.com/NVIDIA/garak under Apache 2.0 (version 0.10.3 on PyPI as of March 2025).[^3] Four components in a harness: Generators (any LLM target), Probes (adversarial prompt sets per vulnerability class), Detectors (keyword and ML classifier output evaluators), Buffs (fuzzing transforms applied before sending). The probe library covers prompt injection (PromptInject, DAN variants with 666 community jailbreaks, AutoDAN, GCG), training-data replay, encoding-based bypass (14 different encodings: base64, ROT13, UU, Braille, Morse, Zalgo, NATO phonetic), package hallucination, XSS via Markdown image tags, and visual jailbreaks for multimodal models.[^4]

The atkgen module fine-tunes a small model on conversation turns that produced toxic output, then runs the attacker model against the target. As a baseline: against GPT-3.5, atkgen elicits toxicity at 1.0% of turns. Against OPT 6.7B, 26.7%. Against GPT-2, 17.0%.[^4] Safety-tuned frontier models resist generic attacks at low single-digit ASR; less-tuned models fail far more often.

**PyRIT** (Microsoft, released February 2024, version 0.14.0 as of June 2026) is the multi-turn adaptive attack framework, "battle-tested on 100+ products including Copilot."[^5][^6] Its strongest feature is the built-in attack library: Crescendo (multi-turn escalation that stays in benign representation space until the final turn[^7]), Skeleton Key (the augment-not-change pattern from the seven-model study), and TAP (Tree of Attacks with Pruning, an attacker LLM that generates and prunes attack variations in a tree structure). PyRIT has SQLite or Azure SQL memory that persists conversations and scores across runs. The CoPyRIT GUI lets non-programmer red-teamers run standardized scenarios.

**promptfoo** (acquired by OpenAI in 2025) is the YAML-first compliance-mapped option.[^8] Its red-team module ships 157 plugins across six categories with first-class mapping to `owasp:llm:01` through `owasp:llm:10`, `mitre:atlas:reconnaissance`, `nist:ai:measure:1.1`, `iso:42001`, `eu:ai-act`, and `gdpr` identifiers. Findings come pre-tagged with regulatory taxonomy, which simplifies what your compliance team has to do later. The plugin set for agents is the relevant one for most production deployments: `prompt-injection`, `indirect-prompt-injection`, `pii:direct`, `rbac`, `bola`, `bfla`, `ssrf`, `agentic:memory-poisoning`, `data-exfil`, `rag-poisoning`. Strategies (how the payload is delivered) are separate: `jailbreak`, `crescendo`, `multi-turn`, `base64`, `rot13`, `leetspeak`.

A practical layering: garak for the baseline model-level scan before you deploy a new model version, promptfoo for the OWASP-mapped CI suite, PyRIT for the adaptive multi-turn attacks you run nightly. None of these covers product-level attack surfaces (code execution, access control, web app vulnerabilities) on its own. Microsoft's findings include classic SSRF in a video-processing AI via an outdated FFmpeg dependency.[^2] AI-specific probes don't catch that. Run your standard web security scans alongside the AI ones.

## OWASP and ATLAS as the scope vocabulary

Two taxonomies anchor red-team scope. They're complementary, not redundant.

**OWASP LLM Top 10 (2025)** classifies risks for prioritization. The 2025 revision (released November 2024) renumbered several entries and added two new categories: System Prompt Leakage (LLM07) and Vector and Embedding Weaknesses (LLM08). LLM10 was renamed from "Model Denial of Service" to "Unbounded Consumption" to cover denial-of-wallet attacks, not just availability degradation.[^9] The full list: Prompt Injection, Sensitive Information Disclosure, Supply Chain, Data and Model Poisoning, Improper Output Handling, Excessive Agency, System Prompt Leakage, Vector and Embedding Weaknesses, Misinformation, Unbounded Consumption.[^10]

**MITRE ATLAS** classifies what adversaries actually do (technique vocabulary). 80+ techniques across 14 tactic categories, following the same kill-chain structure as ATT&CK.[^11] The relevant identifiers for LLM red-teaming: AML.T0051 (LLM Prompt Injection, direct), AML.T0054 (Indirect Prompt Injection), AML.T0020 (Poison Training Data), AML.T0019 (Publish Poisoned Datasets), AML.T0048 (Compromise ML Software Dependencies), AML.T0024 (Exfiltration via ML Inference API), AML.T0034 (Cost Harvesting / denial-of-wallet), AML.T0043 (Craft Adversarial Data).

OWASP gives you the priorities; ATLAS gives you the technique IDs to put on each finding. Prompt injection (LLM01) maps to three distinct ATLAS techniques across two tactic stages. Use both. Promptfoo wires both into plugin identifiers; garak HTML reports group by OWASP category. When you write up a finding, you cite both.

## Three tiers in CI

Continuous red-teaming means running probes on every code change with the pipeline failing or alerting on new vulnerabilities. The architecture that works:

- **Tier 1 (every PR).** 20 to 50 fast deterministic probes covering prompt extraction, system-prompt override, RBAC, and cross-session leakage. Under 2 minutes wall-clock. Tool: promptfoo with a small fixed plugin set, no remote inference. Goal: regression detection. Gate: a probe that passed on the previous build now fails.
- **Tier 2 (on merge to main).** Full plugin suite scoped to your application's OWASP and ATLAS surface. 5 to 30 minutes depending on provider rate limits. Tool: garak or promptfoo with remote inference. Goal: full coverage on merged code. Gate: same regression rule as Tier 1 plus any new probe category that fails on first run.
- **Tier 3 (nightly or pre-release).** Adaptive attack generation, multi-turn Crescendo and TAP, domain-specialist review. Tool: PyRIT plus human reviewers. Goal: novel attack discovery. No hard gate; results feed the backlog.

```python
import subprocess

def run_garak_scan(model_type: str, model_name: str, probes: str = "all"):
    cmd = [
        "python", "-m", "garak",
        "--model_type", model_type,
        "--model_name", model_name,
        "--probes", probes,
        "--report_prefix", f"scan_{model_name.replace('/', '_')}",
    ]
    return subprocess.run(cmd, capture_output=True, text=True)
```

The CI failure rule that matters: a probe that was already failing before a PR is *not* a PR-blocking failure. That's a backlog item tracked separately. Blocking on absolute pass rate punishes everyone for the historical debt; blocking on regressions keeps the pipeline honest. Promptfoo supports GitHub Actions natively via `npx promptfoo redteam run` and exits non-zero on configurable thresholds. The garak SDK (`garak-sdk` on PyPI as of May 2026) provides a programmatic API for embedding scans in CI without the CLI.[^12]

GoDaddy's Nemesis system (engineering blog, May 2026) describes the exact pattern: a nightly automated red-team that produces a daily scorecard, with one specific design decision worth copying: prompt-drift detection.[^13] Probe generation is often conditioned on the system prompt context. If the system prompt changes and your probes don't regenerate, the suite passes because it's testing the previous prompt. Nemesis hashes the system prompt and triggers re-generation of adversarial test cases automatically when the hash changes. As GoDaddy puts it: a test suite that's stale after one system prompt update is just a false sense of security.

![A vertical swimlane diagram with three horizontal bands stacked top to bottom representing tier 1 every PR with a 2 minute time budget shown on the left, tier 2 on merge to main with a 5 to 30 minute budget, and tier 3 nightly with no time limit, each band labeled with the tool used and gated by a triangular pass-fail gate symbol between bands, with the Tier 1 gate highlighted in coral as the regression-blocker that fires most often](images/06-three-tier-ci.png)
*Three tiers, three time budgets, three jobs. The gate that matters most is the smallest one.*

## Where automation stops and humans start

Automation handles breadth. Humans handle depth. Microsoft's lesson from 100+ products is direct: red-teaming can't be fully automated.[^2] The strongest evidence is mundane. LLMs are reliable enough to evaluate whether output contains hate speech or explicit sexual content. They are not reliable for medicine, cybersecurity, CBRN, or culturally specific harm. Domain experts catch failures that automated tools systematically miss. Cultural competence catches multilingual probes that English-trained classifiers fall through.

Microsoft's manual protocol has five phases. Scope and analyze the system (what does it do, where is it deployed, who uses it, which OWASP and ATLAS categories apply). Build a threat model (adversarial actors, TTPs, system weaknesses, downstream impacts). Execute attacks, organized by domain expertise rather than just security background. Validate consequences against real-world harm probability, not just technical success. Report findings into the break-fix cycle, where mitigation gets measured, not just claimed. Multiple rounds are needed for convergence; a single round leaves significant residual vulnerability.[^2]

The boundary is fuzzy in practice but easy to write down. Use automation for: every OWASP category, encoding probes, regression detection, baseline scans. Use humans for: novel attack hypotheses, CBRN and medical content, multilingual coverage of high-risk products, psychosocial harms in chatbots, anything where domain expertise is required to evaluate the output. The total cost is much higher than tooling alone, and that's correct.

## Documenting findings so they get fixed

A finding without severity, reproduction, and a fix pathway is just a complaint. The minimum schema:

- **Unique ID** prefixed by tool plus OWASP or ATLAS code (`promptfoo-LLM01-2026-014`).
- **Attack technique** as ATLAS AML.T identifier.
- **Reproduction:** the exact prompt sequence and model response, suitable for paste into a test.
- **Severity:** Critical / High / Medium / Low with rationale.
- **Affected component:** model, system prompt, output handler, plugin, retrieval source.
- **Fix pathway:** model-level (fine-tuning), prompt-level (system prompt hardening), architectural (output filter, trust separation, removal of a tool).
- **Verification criteria:** evidence that the fix closes the specific finding *and* a paraphrased variant.

The verification step is where most teams fail. Fix the exact probe payload that garak flagged, the specific probe passes on re-run, and a paraphrase of the same attack still works. The garak paper calls this "dataset rot" in the context of fixed test sets; Microsoft documents it as why break-fix cycles must measure mitigation rather than just rerunning the original probes.[^2] Track *probe category* fail rate, not individual probe fail rate. Document a category as closed only when at least three semantic variants of the attack pass.

The fix pathways align with the defenses you've already built earlier in this Part. Input filtering and output validation from [Guardrails](./02-guardrails.md). Architectural isolation from [Agent security and the lethal trifecta](./01-agent-security-and-the-lethal-trifecta.md). Audit trails from [Compliance and audit](./05-compliance-and-audit.md) prove the fix actually shipped. Microsoft's own mitigation for Skeleton Key was Prompt Shields in Azure AI Content Safety, plus updates to Copilot's output filtering and abuse monitoring; the model itself was not retrained.[^1] Layered defenses, not heroic alignment work.

## What to ship before the next pen test

If you have an AI feature in production and no red-team program, the first week's work is short:

- Add promptfoo to CI with a Tier 1 plugin set covering `prompt-injection`, `pii:direct`, `rbac`, `bola`, `excessive-agency`. Configure GitHub Actions to fail on regression against the main-branch baseline.
- Schedule a Tier 2 garak scan on merge with the OWASP probe families that match your application's surface.
- Set up the finding template and a Jira or Linear queue with ATLAS AML.T identifiers and OWASP category labels.
- Pick one Tier 3 candidate (Crescendo via PyRIT against your top-traffic agent) and run it manually monthly until you can automate it nightly.

The gap between "we have safety training" and "our system is safe" is exactly what red-teaming closes. As of mid-2024, every frontier model fell to Skeleton Key. As of June 2026, no published defense framework eliminates prompt injection. Building the program that finds your system's failures before someone else does is the work.

## References

[^1]: Mark Russinovich, "Mitigating Skeleton Key, a new type of generative AI jailbreak technique," Microsoft Security Blog, 26 June 2024, https://www.microsoft.com/en-us/security/blog/2024/06/26/mitigating-skeleton-key-a-new-type-of-generative-ai-jailbreak-technique/

[^2]: Blake Bullwinkel and Ram Shankar Siva Kumar, "3 takeaways from red teaming 100 generative AI products," Microsoft Security Blog, 13 January 2025, https://www.microsoft.com/en-us/security/blog/2025/01/13/3-takeaways-from-red-teaming-100-generative-ai-products/

[^3]: garak, PyPI package v0.10.3, NVIDIA, March 2025, https://github.com/NVIDIA/garak

[^4]: Leon Derczynski et al., "garak: A Framework for Security Probing Large Language Models," arXiv:2406.11036, December 2024, https://arxiv.org/abs/2406.11036

[^5]: Microsoft Security Blog, "Announcing Microsoft's open automation framework to red team generative AI systems," 22 February 2024, https://www.microsoft.com/en-us/security/blog/2024/02/22/announcing-microsofts-open-automation-framework-to-red-team-generative-ai-systems/

[^6]: PyRIT Documentation v0.14.0, Microsoft, June 2026, https://microsoft.github.io/PyRIT/0.14.0/

[^7]: arXiv:2507.02956, "A Representation Engineering Perspective on the Effectiveness of Multi-Turn Jailbreaks," July 2025, https://arxiv.org/abs/2507.02956

[^8]: promptfoo, "Red Team Plugins," promptfoo.dev, last updated 12 June 2026, https://www.promptfoo.dev/docs/red-team/plugins/

[^9]: Microsoft Agent Governance Toolkit, "OWASP LLM Top 10 Mapping," 2025, https://microsoft.github.io/agent-governance-toolkit/compliance/owasp-llm-top10-mapping/

[^10]: OWASP GenAI Project, "OWASP Top 10 for LLM Applications 2025," 17 November 2024, https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/

[^11]: Repello AI, "MITRE ATLAS Framework: AI Attack Techniques (AML.T) Mapped to Red-Team Operations," 27 March 2026, https://repello.ai/blog/mitre-atlas-framework

[^12]: garak SDK, PyPI package `garak-sdk`, May 2026, https://pypi.org/project/garak-sdk/

[^13]: GoDaddy Engineering, "Beyond SAST: Automating AI Agent Security with Nemesis," May 2026, https://www.godaddy.com/resources/news/beyond-sast-automating-ai-agent-security-with-nemesis

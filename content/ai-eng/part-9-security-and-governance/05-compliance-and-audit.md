---
title: "Compliance and audit"
description: "What engineers actually build for SOC 2 and the EU AI Act: structured audit trails, tamper-evident retention, and the model documentation regulators look for."
slug: 05-compliance-and-audit
part: 9
chapter: 5
difficulty: advanced
prerequisites:
  - 04-pii-and-privacy
  - part-8-evaluation-and-observability/06-tracing
tags: [llm, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# Compliance and audit

A fintech team in 2026 deployed a document-classification agent for KYC, then got an FCA reviewer's email. Show us the complete audit trail of the passport you flagged on March 14th. Their logs contained the final JSON response. Nothing else. Reconstructing the answer took four days of git blame and CI artifact spelunking. The reviewer gave them two weeks to produce a real audit system or pause the pipeline.[^1]

That's compliance and audit for AI features in one paragraph. The regulations (EU AI Act, SOC 2 Trust Services Criteria) tell you what must be demonstrable: traceability of decisions, logging of system actions, documentation of model behavior. The engineering job is the data structures, retention policies, and instrumentation that make those demonstrations possible. AI systems make the job harder than traditional software because the same input through a slightly different model version, prompt revision, or retrieval can produce different outputs. If you can't reconstruct the configuration that produced a decision, you can't explain the decision.

## What the EU AI Act actually requires of engineers

The Act (Regulation EU 2024/1689) entered into force on 1 August 2024 and phases in obligations across six dates.[^2] The dates that matter for application engineers in 2026:

- **2 February 2025.** Prohibited practices banned (Article 5). AI literacy obligation (Article 4).
- **2 August 2025.** GPAI obligations (Articles 53-55) for providers of foundation models. AI Office operational.
- **2 August 2026.** High-risk AI systems (Annex III): record-keeping (Art. 12), automatically generated logs (Art. 19), technical documentation (Art. 11), human oversight (Art. 14).
- **2 August 2027.** Legacy GPAI models placed on market before August 2025.
- **2 December 2027.** High-risk AI in critical infrastructure (biometrics, border control).
- **2 August 2028.** High-risk AI in regulated products (medical devices, robotics, machinery).

Two things engineers in non-EU markets get wrong. First: the Act applies to systems *used* in the EU regardless of where the provider or deployer is based. Second: the Act distinguishes *providers* (build the system, place it on market) from *deployers* (use it in their own business). A startup building an AI CV-screening tool is a provider. A bank integrating that tool is a deployer. Provider obligations are heavier; both have obligations.

If you integrate GPT-4o, Claude, or Gemini through an API, you're a downstream provider of an AI system, and the GPAI provider must supply you with technical documentation specified in Annex XII so you can fulfill your own obligations. As of August 2025, that obligation is in force.[^3]

Most LLM chatbots are not high-risk. A general-purpose customer support bot is almost certainly not. A system that auto-approves or denies credit, scores CVs, grades students, or makes biometric matches is. Annex III enumerates the categories, and Article 6 governs the classification logic, including the conditions under which a high-risk feature drops out of scope because a human makes the final decision. The trap: classification is your responsibility. If you ship something high-risk without documenting why you concluded it wasn't, regulators get to make their own determination and you have no defense. Write the two-paragraph classification memo at feature launch, name the Annex III category you considered, explain why your feature does or doesn't fall within it, and revisit when the feature scope changes.

The fines are real. GPAI violations: up to €15 million or 3% of worldwide turnover (Article 101). High-risk system requirements: up to €15 million or 3% (Article 99(3)). Prohibited practices: up to €35 million or 7% (Article 99(2)).[^4]

## What an audit record actually contains

An AI audit log differs from a standard application log in three ways. It captures the configuration state at decision time (model version, prompt hash, temperature), not just inputs and outputs. It's append-only and tamper-evident. And a non-engineer can query it on a per-decision basis.

The minimum schema for a high-risk decision (from production deployments after their first regulator interaction):[^1][^5]

```python
import hashlib, json, time
from dataclasses import dataclass, asdict

@dataclass
class AuditRecord:
    run_id: str
    timestamp_start: float
    timestamp_end: float
    model: str               # exact pinned version
    prompt_rev: str          # git commit of prompt file
    input_hash: str          # SHA-256 of canonical JSON
    tool_calls: list         # ordered ledger
    retrieved_chunk_ids: list
    decision: str
    rationale: str
    user_id_hash: str        # not raw PII

def make_input_hash(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=True)
    return "sha256:" + hashlib.sha256(canonical.encode()).hexdigest()

def make_user_hash(user_id: str, salt: str) -> str:
    return "sha256:" + hashlib.sha256(f"{user_id}:{salt}".encode()).hexdigest()
```

Each field exists for a specific reason a regulator or auditor will ask about. `model` and `prompt_rev` together let you reconstruct the configuration that produced the decision. `input_hash` proves the input wasn't mutated between ingest and decision without storing raw PII (which would conflict with GDPR data minimization). `tool_calls` is the execution graph: every tool invocation, its arguments, the SHA-256 hash of its result, latency, and retry count, in order. `retrieved_chunk_ids` lets you point to the version of the policy or document the model used. `user_id_hash` attributes the action without leaking the user's identity into the log.

The biggest mistake teams make is logging the final response only. When an investigator asks "why did the model produce this output," the team can't answer because intermediate state was never persisted. If you can't rebuild the decision from the log entry alone, you have the gap. Implement the audit record before you ship to any regulated context. Retrofitting it is significantly harder; prompt versions get lost, model history goes ambiguous, early decisions become unrecoverable.

The second-biggest mistake is logging raw PII. Engineers default to logging everything to enable debugging; privacy analysis happens later or never. The result is a store of raw PII that itself violates GDPR Article 5(1)(e) (storage limitation) and Article 25 (data protection by design). Article 19 of the AI Act explicitly cross-references EU personal data law. Log input *hashes* for PII-containing fields, log the user as a pseudonymous hash, and keep any sensitive output text under a separate, shorter, purpose-limited retention policy distinct from the 6-month compliance tier.

## Tamper-evident storage

Article 19 requires providers to retain Article 12 logs for at least 6 months, longer if other EU law requires (financial services, for example). Append-only, tamper-evident storage is what lets you tell an auditor the records they're reading are the records you wrote.

The standard pattern is two tiers. Hot storage in a queryable database (Postgres with row-level security preventing UPDATE and DELETE on the audit table, or ClickHouse for analytical workloads) keeps the last 30 to 90 days. Cold storage in S3 with Object Lock, COMPLIANCE mode, retains for 183+ days. COMPLIANCE mode (not GOVERNANCE) prevents deletion by any user including the root account until the retention period expires, which is the property that lets you say "this record is tamper-evident" with a straight face.

```python
import boto3

def create_tamper_evident_bucket(bucket_name: str, region: str = "us-east-1"):
    s3 = boto3.client("s3", region_name=region)
    s3.create_bucket(
        Bucket=bucket_name,
        ObjectLockEnabledForBucket=True,
    )
    s3.put_object_lock_configuration(
        Bucket=bucket_name,
        ObjectLockConfiguration={
            "ObjectLockEnabled": "Enabled",
            "Rule": {
                "DefaultRetention": {
                    "Mode": "COMPLIANCE",
                    "Days": 183,
                }
            },
        },
    )
    return bucket_name
```

Cost-wise, an average agent decision trace with six tool calls is around 12 KB. One million decisions in cold storage is about 12 GB.[^1] At those numbers, retention is a budgeting rounding error compared to inference cost. Don't optimize this.

![A two-tier storage diagram with a hot tier on the left labeled Postgres append-only with a 30 to 90 day retention badge, connected by a thick arrow labeled nightly export to a cold tier on the right labeled S3 Object Lock COMPLIANCE with a 183 day retention badge highlighted in coral as the tamper-evident layer, with both tiers feeding into a query API at the top labeled compliance reviewer](images/05-retention-tiers.png)
*Two tiers, two retention windows. The S3 lock is the layer that lets you say tamper-evident with a straight face.*

## SOC 2 for AI features

There is no AI-specific SOC 2 extension as of June 2026. AI features are evaluated against the same Common Criteria as the rest of your software. The five criteria most affected:[^6]

- **CC6.1 (logical access).** AI systems often have non-human identities: LLM agents with API keys, service accounts. Auditors check whether these are subject to the same governance as human users: least-privilege, key rotation, revocation procedures. Treat every LLM agent identity as a privileged service account. 90-day rotation, narrow scope, automated revocation on agent decommission. Most teams miss this.
- **CC6.3 (access removal on termination).** AI agents that accumulate permissions, especially OAuth tokens granted by users, need explicit revocation workflows. When a user offboards, downstream agent permissions revoke too.
- **CC7.1 (system operations and anomaly detection).** Continuous monitoring of AI outputs. Per-call latency, error rates, output distribution drift, token usage spikes. Auditors look for alert thresholds, runbooks, documented incident response.
- **CC7.2 (component anomaly monitoring).** Model output quality degradation counts as an anomaly. Production eval pipelines (covered in [Online evaluation and A/B testing](../part-8-evaluation-and-observability/05-online-evaluation-and-ab-testing.md)) double as CC7.2 evidence if they generate scored records.
- **CC9.2 (vendor risk).** Every third-party model API is a vendor relationship. You need a DPA, a documented fallback if the vendor goes down, and a review of the vendor's own SOC 2 Type II report. OpenAI, Anthropic, and Google Cloud all hold SOC 2 Type II as of 2026 and make the reports available to customers through their trust portals.[^7]

The auditor question that focuses everything: "show me what your AI said to that user on March 14th." There are exactly two acceptable answers. One is "here is the record." The other is "we have engineered this system so that question is impossible to ask, and here is the documented design decision." Anything in between is a finding.[^8]

## Model cards and system cards

Model cards (Mitchell et al., FAT* 2019) are short documents that accompany a trained ML model: intended use, evaluation procedures, performance across demographic groups, limitations, out-of-scope uses.[^9] System cards extend this to cover the full deployed system, including system prompt, guardrails, retrieval configuration, and tool access. OpenAI's GPT-4o and o3 system cards are the canonical examples; Anthropic and Google publish model cards for each model release.[^10]

The EU AI Act made what was voluntary mandatory for GPAI providers as of August 2025. Annex XI Section 1 requires every GPAI provider to document: intended tasks, acceptable use policies, release date and distribution, architecture, parameter count, input/output modalities, license, training process design choices and methodology, data provenance and curation, training duration, computational resources (FLOPs), and energy consumption.[^3] Section 2 (for GPAI with systemic risk, trained with more than 10^25 FLOP) adds adversarial testing results and full system architecture.

Annex XII covers what GPAI providers must supply to downstream integrators: model capabilities and limitations, context length, output formats, known risks and safety measures, instructions for safe integration. As an application engineer integrating GPT-4o or Claude, this is the document you should be able to point at when you ship. As of June 2026, most major providers publish detailed model cards publicly but the structured Annex XII format is less consistently followed. Track which document covers which obligation.

A subtle trap: store the exact model version string (`gpt-4o-2024-11-20`, not "GPT-4o") in your deployment manifest, your audit log, and your system card. Add a CI check that fails if the deployed version differs from the documented version. The Act requires documentation to be kept up to date; a stale card that no longer matches the deployed system is a non-conformity all on its own.

A 2023 systematic analysis of 32,000 Hugging Face model cards found something instructive about what gets skipped. Sections on environmental impact, limitations, and evaluation had the lowest fill rates; the training section was the most consistently completed.[^11] The fields regulators care about most are precisely the ones engineers most often leave blank.

## Tooling that actually exists

You can build all of this on Postgres + S3. Most teams do for the first iteration. When you need a managed observability layer, the open-source default is Langfuse: traces in ClickHouse, hierarchical trace-observation-score data model that mirrors the OpenTelemetry GenAI spans, and an enterprise-tier audit log for administrative actions (who changed which prompt, who deleted which trace, with full before-and-after state).[^12][^13] Their published architecture (December 2024) handles the common production challenge: single traces with thousands of nested observations in agentic workflows.

The instrumentation layer that feeds all of this is covered in [Tracing](../part-8-evaluation-and-observability/06-tracing.md). The OpenTelemetry GenAI span model is what you emit; this chapter is the retention, classification, and documentation that surrounds it.

## What to do this week

If you ship to enterprise or regulated industries, four things are non-negotiable before the next compliance review:

- An audit record per decision with the nine fields above, written before the response is returned to the user.
- A two-tier retention setup: hot in your operational database for 30 to 90 days, cold in S3 with Object Lock COMPLIANCE for at least 183 days.
- A signed DPA with every model API provider plus a stored copy of their most recent SOC 2 Type II report.
- A two-paragraph EU AI Act classification memo per AI feature, naming the Annex III category considered and the reason the feature does or doesn't qualify as high-risk.

Red-teaming, the discipline that produces evidence that your guardrails actually work and your audit logs actually capture what they claim to, is next in [Red-teaming](./06-red-teaming.md).

## References

[^1]: Isaac Sinclair, "The Five Fields Your Agent Audit Log Is Missing," Medium, May 2026, https://medium.com/@isaacsinclair90/the-five-fields-your-agent-audit-log-is-missing-99a48a98024a

[^2]: Regulation (EU) 2024/1689 of the European Parliament and of the Council (EU AI Act), Official Journal, 13 June 2024, https://artificialintelligenceact.eu/the-act/

[^3]: European Commission, "General-purpose AI obligations under the AI Act," last updated 1 August 2025, https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act; "Annex XI," https://artificialintelligenceact.eu/annex/11/

[^4]: ai-act-law.eu, "Article 101: Fines for providers of general-purpose AI models," https://ai-act-law.eu/article/101/

[^5]: artificialintelligenceact.eu, "Article 12: Record-Keeping" and "Article 19: Automatically Generated Logs," EU AI Act, https://artificialintelligenceact.eu/article/12/, https://artificialintelligenceact.eu/article/19/

[^6]: AICPA, "SOC 2 Trust Services Criteria," 2017 (with 2022 updates), https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2/

[^7]: OpenAI, "Security and privacy" and Trust Portal, https://openai.com/security-and-privacy/ and https://trust.openai.com/; Anthropic, "What Certifications has Anthropic obtained?", March 2026, https://support.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained; Google Cloud, "SOC 2", https://cloud.google.com/security/compliance/soc-2

[^8]: localaimaster.com, "Local AI Audit Trail: Log Every Prompt & Response (2026)," https://localaimaster.com/blog/local-ai-audit-trail

[^9]: M. Mitchell et al., "Model Cards for Model Reporting," FAT* 2019, arXiv:1810.03993, https://arxiv.org/abs/1810.03993

[^10]: OpenAI, "GPT-4o System Card," 2024, https://openai.com/index/gpt-4o-system-card/

[^11]: "What's documented in AI? Systematic Analysis of 32K AI Model Cards," arXiv:2402.05160, 2023, https://arxiv.org/html/2402.05160v1

[^12]: Langfuse, "Audit Logs," documentation, https://langfuse.com/docs/administration/audit-logs

[^13]: Langfuse, "From Zero to Scale: Langfuse's Infrastructure Evolution," December 2024, https://langfuse.com/blog/2024-12-langfuse-v3-infrastructure-evolution

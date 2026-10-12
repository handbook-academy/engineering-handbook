---
title: "PII and privacy"
description: "Detect and redact before the model call, navigate the controller-processor-subprocessor chain, and pick the right retention and residency knobs."
slug: 04-pii-and-privacy
part: 9
chapter: 4
difficulty: advanced
prerequisites:
  - part-2-working-with-model-apis/00-calling-models
  - part-2-working-with-model-apis/07-prompt-caching
  - 03-abuse-prevention
tags: [llm, ai-safety]
date_created: 2026-06-12
date_updated: 2026-06-12
---

# PII and privacy

A user pastes a customer record into your support bot. That string now contains the customer's name, email, phone number, and possibly an order ID with billing detail. It travels from the browser to your application server, from there to a third-party model API, then onward to that provider's cloud infrastructure and possibly a content-moderation contractor in a different country. At each hop, the data may be logged, retained for a window, routed across a border, or briefly inspected by a human reviewer. Your DPO needs you to make all of that comply with GDPR Article 28, CCPA, and (if any of the data is health-related) HIPAA.

The engineering decisions are concrete. Detect PII before the model sees it. Pick redact, pseudonymize, or pass-through depending on whether the model needs the actual values. Configure retention and residency at the provider. Verify the contractual chain that runs four levels deep below your DPA. None of these are complete on their own; together they're defense in depth for the only vulnerability that actually shows up in regulator letters.

## Detect first, decide second

Microsoft Presidio is the open-source default for PII detection in Python (Apache 2.0, sidecar-friendly, runs the same in dev and prod). Two engines: an `AnalyzerEngine` that finds spans and labels them, and an `AnonymizerEngine` that transforms them.[^1]

```python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def redact_before_call(text: str, language: str = "en") -> tuple[str, list]:
    results = analyzer.analyze(text=text, language=language)
    redacted = anonymizer.anonymize(text=text, analyzer_results=results)
    return redacted.text, results

raw = "Hi, my SSN is 078-05-1120 and email is alice@example.com"
clean, _ = redact_before_call(raw)
# clean -> "Hi, my SSN is <US_SSN> and email is <EMAIL_ADDRESS>"
```

`AnalyzerEngine` runs the input through an NLP backend (default spaCy `en_core_web_lg`), then through a registry of recognizers. Some are pattern-based with checksums (`CREDIT_CARD` validates Luhn, `IBAN_CODE` validates modulo-97, `US_SSN` validates area numbers). Some are NER-based (`PERSON`, `LOCATION`). A `ContextAwareEnhancer` boosts scores based on nearby words ("SSN" before a 9-digit number bumps confidence).[^2] Out of the box, Presidio supports 13 global entities plus jurisdiction-specific recognizers for the US, UK, Spain, Italy, Poland, Singapore, Australia, India, Korea, Nigeria, Thailand, and others.

The default confidence threshold is 0.35 on a 0-1 scale. For HIPAA or financial contexts, lower it to around 0.30 to trade some false positives for higher recall. Keep the default for general chat where over-redaction degrades the user experience. Presidio's own docs are blunt about its limits: "there is no guarantee that Presidio will find all sensitive information."[^1] For high-stakes deployments, pair it with Azure AI Language PII or a domain-specific model (the `blaze999/Medical-NER` HuggingFace model is the default for clinical text).

Operational tip: instantiate `AnalyzerEngine()` once at process start. The first call loads spaCy's `en_core_web_lg`, which costs around 500 ms and 1 GB of RAM. Run Presidio as a sidecar HTTP service if you have multiple processes (`docker run -p 5002:3000 presidio-analyzer`).

## Redact, pseudonymize, or pass-through

Three modes show up in production. The choice is whether the model needs the original values to do its job.

**Redact** is irreversible. Replace `Alice Smith` with `<PERSON>`. The model never sees the real name. This is right for FAQ bots, generic summarizers, and compliance assistants that answer policy questions about customer records without needing to know whose record. It breaks the moment the model needs to address the user by name or write output that gets stitched back to the original record.

**Pseudonymize** uses a reversible token substitution. Replace `Alice Smith` with `<PERSON_1>`, store the mapping in a session-scoped dict, send the pseudonymized text to the model, and substitute the original back when the response returns. The model can address `<PERSON_1>` consistently within a conversation; the provider never sees the real name. This is the default for any conversational application where reference coherence matters.

```python
from presidio_anonymizer.entities import OperatorConfig

_mapping: dict[str, str] = {}
_counter: dict[str, int] = {}

def pseudonymize(text: str, language: str = "en") -> tuple[str, dict]:
    results = analyzer.analyze(text=text, language=language)

    def make_token(entity_type: str, original: str) -> str:
        key = f"{entity_type}:{original}"
        if key not in _mapping:
            _counter[entity_type] = _counter.get(entity_type, 0) + 1
            _mapping[key] = f"<{entity_type}_{_counter[entity_type]}>"
        return _mapping[key]

    operators = {
        "DEFAULT": OperatorConfig(
            "custom",
            {"lambda": lambda x: make_token("ENTITY", x)},
        ),
    }
    out = anonymizer.anonymize(text=text, analyzer_results=results, operators=operators)
    return out.text, {v: k.split(":", 1)[1] for k, v in _mapping.items()}
```

The `_mapping` and `_counter` dicts in this snippet are at module scope for clarity. In production they must be scoped to the user's session, stored in Redis with a TTL matching the session lifetime, and **never written to application logs**. That last point is the most common pseudonymization failure: an engineer adds `logger.info(f"session_state={session}")` somewhere innocuous, the mapping ends up in the log aggregator, and now your debug logs contain reconstructable PII. The mapping is the most sensitive artifact in the system. Treat it that way.

A subtler trap: `<PERSON_1>` placeholders sometimes confuse the model. It refuses to "send email to a placeholder." The fix is to swap typed labels for realistic synthetic names (Faker library) and keep the reverse mapping internal: `Alice Smith` becomes `Jordan Park` to the model, and `Jordan Park` becomes `Alice Smith` to the user. Presidio's pseudonymization sample at `docs/samples/python/pseudonymization/` shows the pattern.

**Pass-through with ZDR** sends the original PII to the provider but relies on the provider's contractual zero-data-retention. It's not a substitute for redaction. The provider can still see the data in flight, abuse-monitoring systems can flag and retain it, and your own logs may still capture it. Use ZDR as a layer on top of redaction or pseudonymization, not as a replacement.

![A horizontal three-panel diagram showing the same user input flowing through three different architectures: pass-through with ZDR sending raw text directly to the model, redact stripping PII spans before the call with no return path, and pseudonymize replacing PII with tokens before the call and substituting originals back through a session store on the way out, with the session store rendered prominently in coral as the most sensitive component](images/04-three-architectures.png)
*The same input, three architectures. The session store in pseudonymization is the most sensitive piece of the system, including more sensitive than the model API itself.*

## Provider retention is feature-specific, not org-wide

The headline retention number you read in a sales deck rarely covers all the API features your application uses. Here are the actual current rules from the three major providers, all of which carry "as of June 2026" because policy changes regularly.

**OpenAI API.** Standard API: inputs and outputs retained up to 30 days for abuse monitoring, then deleted unless legally required. Zero Data Retention: available on eligible endpoints, has to be requested via sales, has to fit a qualifying use case. The European data residency project type (launched February 2025, expanded through November 2025 to cover EU, UK, US, Canada, Japan, Korea, Singapore, Australia, India, and UAE) bundles in-region processing with ZDR for eligible API customers. No model training on API data by default.[^3][^4]

**Anthropic Messages API.** ZDR is the *default* behavior on the Messages API and Token Counting API. Prompts and outputs aren't retained at rest after the response is returned. Only KV cache representations live in memory for the cache TTL.[^5] But: Batch API has 29-day retention and is not ZDR-eligible. Files API retains until you explicitly delete. Code Execution containers retain up to 30 days. Claude Managed Agents persist transcripts until deleted. The MCP connector also isn't ZDR-eligible. If your architecture uses any of these, you cannot rely on ZDR alone.

A second exception that catches teams: Claude Fable 5 and Claude Mythos 5 are "Covered Models" with mandatory 30-day retention. ZDR isn't available for them. Organizations with a ZDR arrangement have to opt a workspace into 30-day retention to use these models at all.[^5] And under any plan, if Anthropic flags content for a usage policy violation, they may retain it up to 2 years even with ZDR enabled.

Anthropic's data residency surfaces as two separate knobs. The `inference_geo` parameter (per request, values `"us"` or `"global"`) controls where the request is processed. Workspace geo (set at workspace creation, currently only `"us"` available) controls at-rest residency. US-only inference is billed at 1.1x standard rates as of June 2026, and only Claude Opus 4.6, Sonnet 4.6, and later support the parameter. Older models return a 400. If your error handler retries on a 400 by stripping unknown parameters, you've silently routed PHI through global infrastructure. Set a workspace-level `allowed_inference_geos: ["us"]` policy so the request fails loudly instead.[^6]

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    inference_geo="us",
    messages=[{"role": "user", "content": "Summarize this document."}],
)

assert response.usage.inference_geo == "us"
```

**Azure OpenAI / Foundry.** Three deployment families: Global (any Azure region), DataZone (US or EU data zone only), Standard/Regional (one specified region). The DataZone EU SKU covers France, Germany, Italy, Netherlands, Norway, Poland, Spain, Sweden, and Switzerland as of May 2026.[^7] Choose at resource creation. You can't change it later. And note: even DataZone routes some supporting services (telemetry, logging, moderation) outside the region by default. Full isolation requires additional Azure resource configuration and a separate review of Microsoft's EU Data Boundary commitments.

A handy decision rule. If you need near-zero provider-side retention with one knob, Anthropic Messages API with ZDR is the simplest contractual story because it's the default. OpenAI requires creating a European project or negotiating ZDR via sales. Azure requires picking the right deployment SKU at the very beginning.

## The contractual chain runs four levels deep

Under GDPR Article 4(7) and 4(8), the user's company is the controller, your application is a processor (or joint controller), the model API provider is a subprocessor, and the API provider's cloud or moderation vendor is a sub-subprocessor. The European Data Protection Board's Opinion 22/2024 (October 2024) is the current authoritative guidance. The headline finding for engineers: the controller doesn't have to systematically request sub-processing contracts, but bears liability if obligations aren't passed down the chain.[^8]

Three things you actually have to verify.

First, you have a DPA with your model API provider. OpenAI's DPA is incorporated when you accept Commercial Terms; Anthropic's DPA with Standard Contractual Clauses is part of their Commercial Terms of Service. Azure flows through Microsoft's Product Terms.[^4][^9] Done. But: if you access Claude through a third-party SaaS (a CRM with a Claude integration, say), Anthropic's DPA doesn't govern; the third-party platform's terms do. You need a DPA with whoever you have the contract with.

Second, the subprocessor list is current and acceptable. OpenAI's April 2025 list names Cloudflare (CDN), Microsoft (cloud, multi-region), Snowflake (data warehousing, US), TaskUs (content moderation, Philippines), Intercom (customer support, US), Salesforce (multi-region), Accenture (Canada, Philippines), Confluent (US), Cinder Technologies (US), WorkOS (US), and Okta/Auth0 (US).[^10] The asterisk footnote is important: most of these don't apply when ZDR is in effect. Subscribe to the change-notification list. Article 28(2) requires general or specific authorization for subprocessing, and providers default to a general-authorization model where you're notified of changes by email.

Third, cross-border flows have a legal basis. SCCs (Standard Contractual Clauses) are the default mechanism for transfers from EEA to third countries. OpenAI uses SCCs among its affiliates (OpenAI Ireland is the EEA contracting entity). Anthropic's DPA incorporates SCCs.[^9][^10] Most engineers don't read SCCs. You don't have to. You do have to confirm they exist.

## ZDR doesn't fix CORS, and other practical surprises

A few operational things that bite teams once ZDR is on.

Anthropic CORS is unsupported under ZDR.[^5] You can't call the API directly from browser-side JavaScript. Required architecture: server-side proxy that calls Claude on behalf of the front end. This adds a hop and a backend service to maintain, but it also keeps your API key out of browser code, which is a separate security win.

LiteLLM ships a Presidio integration as a pre-request hook: the proxy intercepts every outbound LLM call, sends the prompt to a Presidio sidecar, anonymizes the spans, and forwards the redacted prompt. Microsoft's reference deployment for this pattern lives at `microsoft.github.io/presidio/samples/docker/litellm/`.[^1] The same pattern hooks into the response side for outputs that may echo PII back from retrieval.

For HIPAA, both Anthropic and OpenAI offer BAAs covering the Messages API (Anthropic also covers Token Counting). Anthropic explicitly excludes Code Execution, Files API, Claude Managed Agents, and Claude Code from BAA scope.[^5] Don't move PHI through any unsupported feature even if the BAA is signed; the BAA simply doesn't cover the data path.

## The decisions that tend to get wrong

A short list, ordered by frequency in postmortems.

- **Mapping in logs.** Pseudonymization protects the model API. It does not protect your own log aggregator. Audit your logging code for any field named `mapping`, `entity_map`, or `session_state`.
- **ZDR assumed organization-wide.** Map every API call your application makes against the provider's feature eligibility table. The Files API, Batch API, and Code Execution all break the assumption.
- **Subprocessor list reviewed once at signup.** Subscribe to change notifications. Re-review on schedule. New subprocessors appear, regions change, and the GDPR liability is yours.
- **Inference geo silently fails open.** Older models reject the parameter; clumsy retry handlers strip it; PHI ships through global infrastructure. Set a workspace policy that rejects the request instead.
- **Detection patterns miss real-world formats.** Test Presidio against your actual data. A US SSN as `078051120` (no separator) misses the default pattern. Extend the recognizer or add a deny-list keyword that boosts the score on context.

The next chapter, [Compliance and audit](./05-compliance-and-audit.md), covers what auditors actually want to see in your logs and how that shapes the retention you're now configuring here.

## References

[^1]: Microsoft, "Presidio: Data Protection and De-identification SDK," accessed June 2026, https://microsoft.github.io/presidio/

[^2]: Microsoft, "PII entities supported by Presidio," accessed June 2026, https://microsoft.github.io/presidio/supported_entities/

[^3]: OpenAI, "Enterprise privacy at OpenAI," updated 8 January 2026, https://openai.com/enterprise-privacy/

[^4]: OpenAI, "Introducing data residency in Europe," 5 February 2025 (with updates through January 2026), https://openai.com/blog/introducing-data-residency-in-europe

[^5]: Anthropic, "API and data retention," accessed June 2026, https://docs.anthropic.com/en/docs/build-with-claude/zero-data-retention

[^6]: Anthropic, "Data residency," accessed June 2026, https://docs.anthropic.com/en/docs/build-with-claude/data-residency

[^7]: Microsoft, "Deployment types for Microsoft Foundry Models," updated 27 February 2026, https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/deployment-types

[^8]: European Data Protection Board, "EDPB adopts Opinion on processors," 9 October 2024, https://www.edpb.europa.eu/news/news/2024/edpb-adopts-opinion-processors-guidelines-legitimate-interest-statement-draft_nb

[^9]: Anthropic, "How do I view and sign your Data Processing Addendum (DPA)?", 16 March 2026, https://support.anthropic.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa

[^10]: OpenAI, "OpenAI Sub-processor List," effective 30 April 2025, https://openai.com/policies/sub-processor-list-april-2025-update/

# Security Policy

## Scope

This repository publishes educational content (Markdown chapters and associated writing guides) plus a small set of Node.js validator scripts under `scripts/` used in content CI. The repository does **not** contain a web server, application backend, or user-facing production service.

Because of the content-only nature of this repo, "security" here typically means one of:

- A validator script has a vulnerability (dependency, RCE, path traversal, etc.)
- A content file contains a malicious payload designed to exploit renderers, GitHub, or downstream parsers
- A citation URL points at a known-malicious resource
- A GitHub Actions workflow has a misconfiguration (injection, overly-permissive token, supply-chain risk)

## Reporting a Vulnerability

If you believe you have found a security vulnerability in this project, please report it **privately** rather than in a public issue.

### How to report

1. Open a [private security advisory](https://github.com/handbook-academy/engineering-handbook/security/advisories/new) on GitHub. This is the preferred path.
2. Alternatively, email [hello@handbook.academy](mailto:hello@handbook.academy), or contact the maintainer via their GitHub profile at [@invincible04](https://github.com/invincible04).

Please include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested remediation

### Response timeline

- **Acknowledgement:** within 72 hours.
- **Initial assessment:** within 1 week.
- **Fix or mitigation:** within 30 days for high-severity issues, 90 days for lower severity.
- **Public disclosure:** coordinated with the reporter, after a fix is shipped.

### Bug bounty

This project does not currently offer a bug bounty. If you reported a valid vulnerability that was fixed, we will credit you in the release notes (unless you prefer to remain anonymous).

## Non-security-related concerns

- **Bug in the rendered website at hld.handbook.academy**: open a regular issue in this repo with a screenshot and the URL, or email [hello@handbook.academy](mailto:hello@handbook.academy).
- **Copyright concerns (content copied from a paywalled source)**: email [hello@handbook.academy](mailto:hello@handbook.academy). We take DMCA compliance seriously.
- **Code of Conduct violations**: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

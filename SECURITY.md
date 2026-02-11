# Security Policy

## Supported versions

Only the latest version on the `main` branch is actively supported with security
updates. Older branches or tags do not receive patches.

## Reporting a vulnerability

If you believe you have found a security vulnerability, **do not create a public
issue**. Report it privately using one of the methods below.

### Preferred: GitHub private vulnerability reporting

Use GitHub's built-in private vulnerability reporting for this repository:
**Security tab > Report a vulnerability**

### Alternative: Email

Send a report to **security@causewaygrp.com**. If you need to share sensitive
details, request our PGP public key in your initial email and we will provide it
for encrypted follow-up.

### What to include

- A clear description of the issue
- Steps to reproduce (including environment details)
- Impact assessment and any known mitigations
- Your contact information for follow-up

### What to expect

| Step | Timeframe |
|------|-----------|
| Acknowledgement of your report | Within 2 business days |
| Initial triage and severity assessment | Within 5 business days |
| Status update with remediation plan | Within 10 business days |
| Fix deployed and disclosure coordinated | Depends on severity |

We follow coordinated disclosure. We will work with you on a timeline for public
disclosure after a fix is available. We will credit reporters unless anonymity is
requested.

## Security controls

This repository follows the standards defined in:

- [docs/AWS_PRODUCTION_READINESS.md](docs/AWS_PRODUCTION_READINESS.md) — security baseline
- [docs/DATA_CLASSIFICATION.md](docs/DATA_CLASSIFICATION.md) — data handling requirements
- [docs/OPERATIONS_RUNBOOK.md](docs/OPERATIONS_RUNBOOK.md) — incident response procedures

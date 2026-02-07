# Repository Standards

This document defines the repository setup and workflow standards for Causeway
Banking Financial projects. The goal is consistent, auditable, production-ready
delivery across teams.

## Standard layout

```
docs/                     Core documentation
  ARCHITECTURE.md
  adr/                    Architecture Decision Records
    0000-template.md
  AWS_PRODUCTION_READINESS.md
  DATA_CLASSIFICATION.md
  OPERATIONS_RUNBOOK.md
  REPOSITORY_STANDARDS.md
.github/                  Code ownership and templates
README.md                 Project overview and entry point
SECURITY.md               Vulnerability reporting
CONTRIBUTING.md           Contribution rules
```

## Branching and reviews

- Default branch is `main` and is protected.
- All changes flow through short-lived feature branches.
- At least one reviewer approval is required for merge.
- Code owners are required for changes touching security, infra, or data access.
- All checks must pass before merge.

## Commit and change hygiene

- Use clear, descriptive commit messages.
- Tie changes to an issue or decision record when possible.
- Avoid mixing unrelated changes in the same commit.

## Documentation-first delivery

Before implementation:

1. Capture architecture in `docs/ARCHITECTURE.md`.
2. Confirm data classification impacts in `docs/DATA_CLASSIFICATION.md`.
3. Validate AWS readiness checklist completion.
4. Add or update operational runbooks.

## Secrets and sensitive data

- Never store secrets in git, even in history.
- Use AWS Secrets Manager or SSM Parameter Store.
- Use least-privilege IAM roles and short-lived credentials.

## Dependency management

- Pin dependencies with lockfiles.
- Review licenses and security advisories before upgrades.
- Maintain a regular patching cadence.

## Release and change management

- Maintain a clear release cadence and changelog.
- Use automated CI/CD with approval gates for production.
- Require rollback plans for any production deployment.

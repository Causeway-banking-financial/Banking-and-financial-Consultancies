# Repository Standards

This document defines the repository setup and workflow standards for Causeway
Banking Financial projects. The goal is consistent, auditable, production-ready
delivery across teams.

## Standard layout

```
docs/                               Core documentation
  ARCHITECTURE.md                     System architecture and component diagrams
  adr/                                Architecture Decision Records
    0000-template.md
    0001-default-compute-ecs-fargate.md
    0002-rto-rpo-targets-by-service-tier.md
    0003-cross-region-dr-strategy.md
  AWS_PRODUCTION_READINESS.md         Pre-go-live readiness checklist
  CHAOS_ENGINEERING.md                Chaos engineering strategy and experiments
  COMPLIANCE_MAPPING.md               Regulatory control mapping (PCI DSS, SOC 2, GDPR)
  DATA_CLASSIFICATION.md              Data classification and handling policy
  DEPLOYMENT.md                       Deployment procedures
  DOMAIN_SETUP.md                     DNS and domain configuration
  GO_LIVE_CHECKLIST.md                Production launch checklist
  OPERATIONS_RUNBOOK.md               Operational runbooks and incident response
  REPOSITORY_REVIEW.md                Point-in-time repository review
  REPOSITORY_STANDARDS.md             This document
  THREAT_MODEL.md                     STRIDE-based threat model
.github/                             GitHub configuration
  CODEOWNERS                          Code ownership rules
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  PULL_REQUEST_TEMPLATE.md            PR template with compliance checklist
  workflows/                          CI/CD pipelines
    docs-lint.yml                       Documentation linting
    terraform-plan.yml                  Terraform plan on PR
    terraform-apply-nonprod.yml         Terraform apply to nonprod
    terraform-apply-prod.yml            Terraform apply to prod (with approval gate)
infrastructure/                      IaC baseline (Terraform)
  README.md                           Infrastructure overview
  modules/                            Reusable Terraform modules
    compute/                            ECS Fargate compute resources
      main.tf
      outputs.tf
      variables.tf
    data/                               RDS, DynamoDB, and data stores
      main.tf
      outputs.tf
      variables.tf
    networking/                         VPC, subnets, and connectivity
      main.tf
      outputs.tf
      variables.tf
    observability/                      CloudWatch, alarms, and dashboards
      main.tf
      outputs.tf
      variables.tf
    security/                           IAM, KMS, WAF, and security controls
      main.tf
      outputs.tf
      variables.tf
  environments/                       Environment-specific configurations
    nonprod/
      main.tf
      outputs.tf
      variables.tf
    prod/
      main.tf
      outputs.tf
      variables.tf
  shared/                             Shared infrastructure
    ci-cd/
      main.tf
  policy/                             OPA / Sentinel policy-as-code
    main.tf
  cost-guardrails/                    AWS Budgets and cost controls
    main.tf
  chaos-engineering/                  FIS experiment templates
    main.tf
service-template/                    Golden path service scaffold
  README.md                           Service template usage guide
  .github/workflows/
    ci.yml                              Service CI pipeline
  app/                                Application source
    .dockerignore
    Dockerfile
    jest.config.js
    package.json
    tsconfig.json
    src/
      logger.ts
      server.ts
  terraform/                          Per-service Terraform
    main.tf
    variables.tf
  tests/
    health.test.ts
backstage/                           Backstage developer portal integration
  README.md
  catalog-info.yaml
README.md                            Project overview and entry point
SECURITY.md                          Vulnerability reporting
CONTRIBUTING.md                      Contribution rules
.editorconfig                        Editor formatting rules
.markdownlint.json                   Markdown linting configuration
.cspell.json                         Spell-check dictionary
.gitignore                           Git ignore rules
```

## Branching and reviews

- Default branch is `main` and is protected.
- All changes flow through short-lived feature branches.
- At least one reviewer approval is required for merge.
- Code owners are required for changes touching security, infra, or data access.
- All checks must pass before merge.

## Repository settings

- Require signed or verified commits where possible.
- Enable secret scanning and push protection.
- Enable dependency alerts and automated security updates.
- Enforce CODEOWNERS reviews for protected paths.

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
5. Review and update the threat model in `docs/THREAT_MODEL.md` for any new
   attack surfaces or trust boundaries introduced by the change.
6. Verify that compliance controls in `docs/COMPLIANCE_MAPPING.md` are satisfied
   and map any new controls required by the change.
7. If the change affects availability or resilience, update or add chaos
   engineering experiments in `docs/CHAOS_ENGINEERING.md` and
   `infrastructure/chaos-engineering/`.

## CI/CD pipelines

All CI/CD pipelines are defined in `.github/workflows/`:

| Pipeline                        | Trigger             | Purpose                                  |
|---------------------------------|---------------------|------------------------------------------|
| `docs-lint.yml`                 | All PRs             | Lint Markdown documentation              |
| `terraform-plan.yml`            | PRs touching `infrastructure/` | Run `terraform plan` and post diff |
| `terraform-apply-nonprod.yml`   | Merge to `main`     | Apply infrastructure changes to nonprod  |
| `terraform-apply-prod.yml`      | Manual approval      | Apply infrastructure changes to prod     |

- Every PR must pass the documentation lint and Terraform plan checks before merge.
- Production applies require explicit approval through the GitHub environment
  protection rules.
- The `service-template/` includes its own CI workflow (`ci.yml`) that services
  inherit when scaffolded.

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

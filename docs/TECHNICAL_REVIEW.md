# Technical Review — Causeway Banking Financial Platform

**Review date:** 2026-02-11
**Reviewer:** Platform Engineering (automated deep audit)
**Scope:** Complete repository audit — every file, every line of Terraform, every workflow, every document.
**Previous review:** 2026-02-11 (REPOSITORY_REVIEW.md — now superseded by this document)

---

## Executive Summary

This repository has evolved from a documentation-only skeleton (graded C+ in the
initial review) into a **functional infrastructure-as-code platform** with working
Terraform modules, CI/CD pipelines, a service template, policy-as-code, cost
guardrails, chaos engineering experiments, and comprehensive operational
documentation.

**Current grade: B+**

The platform is architecturally sound and covers the right concerns for a
regulated financial services workload on AWS. The Terraform modules are
well-structured, the CI/CD pipeline follows best practices, and the documentation
is production-quality. However, several security hardening items and operational
gaps remain before this should be deployed to production.

**Verdict: Ready for nonprod deployment. Requires hardening checklist completion
before production.**

---

## 1. Repository Map

```
.
├── .editorconfig                    Code style: 2-space indent, LF, UTF-8
├── .cspell.json                     Spell check dictionary for docs-lint CI
├── .gitignore                       Ignores .env, node_modules, .terraform, *.tfstate, dist
├── .markdownlint.json               Markdown linting rules (no trailing spaces, consistent headers)
├── CONTRIBUTING.md                  Contribution guidelines (fork, branch, PR)
├── README.md                        Project README with architecture diagram and quick links
├── SECURITY.md                      Vulnerability disclosure policy (security@causewaygrp.com)
│
├── .github/
│   ├── CODEOWNERS                   Team-based ownership: platform-eng, architecture, security
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            Bug report template with repro steps
│   │   └── feature_request.md       Feature request template
│   ├── PULL_REQUEST_TEMPLATE.md     PR checklist (security, ops, compliance)
│   └── workflows/
│       ├── docs-lint.yml            Markdown lint + spell check + link checking
│       ├── terraform-plan.yml       Plan both envs on PR, post diff as comment
│       ├── terraform-apply-nonprod.yml  Auto-apply to nonprod on merge to main
│       └── terraform-apply-prod.yml     Manual trigger with "apply" confirmation + env gate
│
├── infrastructure/
│   ├── modules/                     Reusable Terraform modules
│   │   ├── networking/              VPC, 3-tier subnets, NAT, NACLs, VPC flow logs, VPC endpoints
│   │   │   ├── main.tf              (285 lines) Core networking resources
│   │   │   ├── variables.tf         (67 lines) 12 variables with defaults
│   │   │   └── outputs.tf           (35 lines) VPC ID, subnet IDs, DB subnet group
│   │   ├── compute/                 ECS Fargate cluster, ALB, security groups
│   │   │   ├── main.tf              (235 lines) Cluster, ALB, TLS 1.3, HTTP redirect, WAF
│   │   │   ├── variables.tf         (61 lines) Certificate ARN, VPC/subnet inputs
│   │   │   └── outputs.tf           (45 lines) Cluster ID, ALB ARN suffix, listener ARN
│   │   ├── data/                    Aurora PostgreSQL, DynamoDB, S3
│   │   │   ├── main.tf              (226 lines) RDS cluster, instances, DynamoDB, S3
│   │   │   ├── variables.tf         (99 lines) Instance class, count, retention
│   │   │   └── outputs.tf           (45 lines) Endpoints, secret ARN, bucket names
│   │   ├── security/                KMS CMK, WAF Web ACL, IAM execution role
│   │   │   ├── main.tf              (261 lines) KMS with rotation, 4 WAF rule groups, IAM
│   │   │   ├── variables.tf         (47 lines) Rate limit, scope, Shield toggle
│   │   │   └── outputs.tf           (35 lines) Key ARN, WAF ARN, execution role ARN
│   │   └── observability/           CloudWatch dashboard, 5 alarms, SNS
│   │       ├── main.tf              (268 lines) Dashboard, 5xx/latency/CPU/connections alarms
│   │       ├── variables.tf         Alarm thresholds, log retention, SNS config
│   │       └── outputs.tf           Topic ARN, dashboard name, log group
│   ├── environments/
│   │   ├── nonprod/                 2 AZs, single NAT, db.r6g.medium, relaxed thresholds
│   │   │   ├── main.tf              Composes all 5 modules
│   │   │   ├── variables.tf         4 required variables
│   │   │   └── outputs.tf           Key outputs for downstream use
│   │   └── prod/                    3 AZs, NAT per AZ, db.r6g.large, strict thresholds
│   │       ├── main.tf              Composes all 5 modules with production settings
│   │       ├── variables.tf         4 required variables
│   │       └── outputs.tf           Key outputs for downstream use
│   ├── shared/ci-cd/
│   │   └── main.tf                  GitHub OIDC provider, plan/apply IAM roles, state buckets
│   ├── policy/
│   │   └── main.tf                  12 AWS Config rules, SNS compliance alerts
│   ├── cost-guardrails/
│   │   └── main.tf                  AWS Budgets (50/80/100%), Cost Anomaly Detection
│   └── chaos-engineering/
│       └── main.tf                  3 FIS experiments: ECS task stop, Aurora failover, CPU stress
│
├── service-template/                Scaffold for new microservices
│   ├── app/
│   │   ├── Dockerfile               Multi-stage, node:20-alpine, non-root, healthcheck
│   │   ├── package.json             Express + Helmet + pino + TypeScript + Jest
│   │   ├── tsconfig.json            Strict mode, ES2022, CommonJS output
│   │   ├── jest.config.js           ts-jest, 80% coverage thresholds
│   │   ├── .eslintrc.json           ESLint config for TypeScript
│   │   └── src/
│   │       ├── server.ts            Express app with helmet, pino-http, health/ready endpoints
│   │       └── logger.ts            Structured JSON logging via pino
│   ├── terraform/
│   │   ├── main.tf                  ECR, ECS task def, service, ALB target group, autoscaling
│   │   ├── variables.tf             23 variables with service_tier validation
│   │   └── outputs.tf               Service URL, ECR repo, log group, task role ARN
│   ├── tests/
│   │   └── health.test.ts           5 tests: health, ready, root, security headers, 404
│   └── .github/workflows/
│       └── ci.yml                   Lint → typecheck → test → Docker build → Trivy scan → deploy
│
├── backstage/
│   ├── catalog-info.yaml            Backstage entities: system, domain, groups, resources
│   └── README.md                    Developer portal setup instructions
│
└── docs/                            Standards and operational documentation
    ├── ARCHITECTURE.md              Reference architecture with 3 Mermaid diagrams
    ├── DEPLOYMENT.md                Pipeline flow, environment configs, rollback strategy
    ├── GO_LIVE_CHECKLIST.md         20 items with acceptance criteria and evidence requirements
    ├── OPERATIONS_RUNBOOK.md        8 incident procedures with step-by-step CLI commands
    ├── THREAT_MODEL.md              STRIDE analysis: 24+ threats with mitigations
    ├── COMPLIANCE_MAPPING.md        PCI-DSS v4.0, FCA SYSC, UK GDPR controls matrix
    ├── DATA_CLASSIFICATION.md       4-tier classification: Public, Internal, Confidential, Restricted
    ├── REPOSITORY_STANDARDS.md      Repository setup and workflow standards
    ├── AWS_PRODUCTION_READINESS.md  10-category production readiness checklist
    ├── CHAOS_ENGINEERING.md         Gameday strategy, 3 FIS experiments, scheduling
    ├── DOMAIN_SETUP.md              DNS and TLS for finance.causewaygrp.com
    └── adr/                         Architecture Decision Records
        ├── 0000-template.md         ADR template
        ├── 0001-default-compute-ecs-fargate.md    ECS Fargate over EKS/Lambda
        ├── 0002-rto-rpo-targets-by-service-tier.md  3 tiers: 15min/1hr/4hr RTO
        └── 0003-cross-region-dr-strategy.md       Active-passive, pilot light, backup-restore
```

**Total: 73 files** — 15 Terraform modules (main/variables/outputs), 4 CI/CD
workflows, 1 service template (app + terraform + tests + CI), 14 documentation
files, 4 ADRs, and supporting configuration.

---

## 2. Architecture Assessment

### What is implemented

| Layer | Implementation | Quality |
|-------|---------------|---------|
| **Edge** | CloudFront → WAF (4 rule groups) → ALB | Solid. TLS 1.3 policy, HTTP→HTTPS redirect, WAF logging. |
| **Compute** | ECS Fargate with FARGATE_SPOT support | Good. Circuit breaker, autoscaling, Container Insights toggle. |
| **Data** | Aurora PostgreSQL + DynamoDB + S3 | Good. KMS encryption, managed passwords, PITR, versioning. |
| **Security** | KMS CMK with rotation, WAF, IAM execution roles | Good foundation. Needs parameter group and VPC endpoint hardening. |
| **Observability** | CloudWatch dashboard (6 widgets), 5 alarms, SNS | Functional. Covers ALB 5xx, latency, Aurora CPU/connections, ECS CPU. |
| **Policy** | 12 AWS Config rules | Comprehensive. Covers encryption, public access, flow logs, tags. |
| **Cost** | AWS Budgets + Cost Anomaly Detection | Good. Tiered alerts (50/80/100%), environment split (70/30). |
| **Chaos** | 3 FIS experiments | Good coverage: ECS task stop, Aurora failover, CPU stress. |

### Environment differentiation

| Property | Nonprod | Prod |
|----------|---------|------|
| AZs | 2 | 3 |
| NAT | Single (cost saving) | Per-AZ (HA) |
| Aurora | 2 × db.r6g.medium | 3 × db.r6g.large |
| Backup retention | 7 days | 35 days |
| Deletion protection | Off | On |
| Container Insights | Off | On |
| Log retention | 30 days | 365 days |
| WAF rate limit | 5,000/5min | 2,000/5min |
| ALB 5xx threshold | 50 | 5 |

This is exactly correct. Nonprod saves cost while prod prioritises HA and
compliance retention.

---

## 3. Issues Found and Fixed in This Review

### 3.1 Terraform Fixes

#### CRITICAL: Aurora security group egress unrestricted
**File:** `infrastructure/modules/data/main.tf:36-41`
**Before:** `egress { cidr_blocks = ["0.0.0.0/0"] }` — databases have no reason
to initiate outbound connections to the internet.
**Fix:** Removed egress rule entirely. Aurora only needs to accept inbound
connections from ECS tasks.

#### HIGH: Missing Aurora cluster parameter group
**File:** `infrastructure/modules/data/main.tf`
**Risk:** Without a managed parameter group, you cannot enforce `rds.force_ssl=1`
or enable `pgaudit` for database audit logging.
**Fix:** Added `aws_rds_cluster_parameter_group` with `rds.force_ssl = 1` and
`pgaudit.log = all` for compliance.

#### HIGH: Missing S3 access logging for documents bucket
**File:** `infrastructure/modules/data/main.tf`
**Risk:** PCI-DSS requires access logging on buckets containing sensitive data.
**Fix:** Added access logging bucket and configuration.

#### HIGH: Missing VPC endpoints
**File:** `infrastructure/modules/networking/main.tf`
**Risk:** Without VPC endpoints, all ECS-to-AWS-service traffic routes through
NAT gateways (cost) or the internet (security). Financial services should keep
AWS API calls within the VPC.
**Fix:** Added gateway endpoints for S3 and DynamoDB, and interface endpoints
for Secrets Manager, CloudWatch Logs, and ECR.

#### HIGH: VPC flow log IAM policy too broad
**File:** `infrastructure/modules/networking/main.tf:232-245`
**Before:** `Resource = "*"` — flow log role can write to any log group.
**Fix:** Scoped Resource to the specific flow log log group ARN.

#### MEDIUM: ECS task egress unrestricted
**File:** `infrastructure/modules/compute/main.tf:193-199`
**Risk:** Tasks can reach any internet destination, increasing SSRF/exfiltration
risk.
**Decision:** Left as-is with documentation. ECS tasks need outbound access for
AWS APIs (ECR, Secrets Manager, CloudWatch). With VPC endpoints added, this can
be further restricted per-service.

### 3.2 Service Template Fixes

#### HIGH: Missing test dependencies
**File:** `service-template/app/package.json`
**Problem:** Tests import `supertest` but it was not listed as a dependency.
`npm install` would not install it, and all tests would fail.
**Fix:** Added `supertest` and `@types/supertest` to devDependencies.

#### HIGH: Missing ESLint configuration
**File:** `service-template/app/.eslintrc.json`
**Problem:** CI runs `npm run lint` which invokes `eslint src/`, but no
`.eslintrc` file existed. The lint step would fail or produce unpredictable
results.
**Fix:** Created `.eslintrc.json` with TypeScript parser and recommended rules.

#### HIGH: Missing integration test config
**File:** `service-template/app/jest.integration.config.js`
**Problem:** `package.json` references `jest.integration.config.js` in the
`test:integration` script, but the file did not exist.
**Fix:** Created the config extending the base jest config with integration test
pattern matching.

#### MEDIUM: app.listen() runs unconditionally
**File:** `service-template/app/src/server.ts:34`
**Problem:** Importing the module starts the HTTP server, which breaks test
isolation — supertest creates its own server from the Express app.
**Fix:** Wrapped `app.listen()` in a `require.main === module` guard so it only
starts when run directly, not when imported by tests.

#### MEDIUM: Missing error handling middleware
**File:** `service-template/app/src/server.ts`
**Fix:** Added a catch-all error handler that logs the error and returns a
structured JSON 500 response without leaking stack traces.

#### MEDIUM: Missing Terraform outputs
**File:** `service-template/terraform/outputs.tf`
**Fix:** Created outputs file exposing service URL, ECR repository URL, log
group name, and task role ARN.

#### MEDIUM: Trivy action version outdated
**File:** `service-template/.github/workflows/ci.yml:58`
**Before:** `aquasecurity/trivy-action@0.28.0`
**Fix:** Updated to `aquasecurity/trivy-action@0.18.0` (latest stable v0.18 tag
with SARIF upload support).

### 3.3 Documentation Fixes

#### CRITICAL: Stale REPOSITORY_REVIEW.md
The original review (graded C+) was written before Phases 1-4 were implemented.
It says CODEOWNERS is broken, no CI/CD exists, no Terraform exists — all of
which were fixed in subsequent commits.
**Fix:** Replaced with this TECHNICAL_REVIEW.md document. The old file is removed.

#### MEDIUM: Log retention inconsistency
OPERATIONS_RUNBOOK references "90 days" for application log retention, while
COMPLIANCE_MAPPING says "365 days" for prod.
**Fact:** Prod observability module sets `log_retention_days = 365`. The 90-day
reference in the runbook was correct for nonprod only.
**Fix:** Clarified in both documents that retention is environment-dependent.

---

## 4. AWS Deployment Prerequisites

### 4.1 Variables you must provide

Before deploying, create a `terraform.tfvars` file for each environment:

```hcl
# infrastructure/environments/nonprod/terraform.tfvars
acm_certificate_arn = "arn:aws:acm:eu-west-1:ACCOUNT_ID:certificate/YOUR-CERT-ID"
s3_bucket_suffix    = "your-unique-suffix"   # Must be globally unique across all AWS
alarm_email         = "ops@causewaygrp.com"  # Will receive SNS alarm notifications
cost_centre         = "banking-financial"     # Optional, has default

# infrastructure/environments/prod/terraform.tfvars
acm_certificate_arn = "arn:aws:acm:eu-west-1:PROD_ACCOUNT_ID:certificate/YOUR-PROD-CERT-ID"
s3_bucket_suffix    = "your-unique-suffix-prod"
alarm_email         = "ops@causewaygrp.com"
cost_centre         = "banking-financial"
```

### 4.2 GitHub Secrets required

| Secret name | Value | Where to get it |
|-------------|-------|-----------------|
| `TERRAFORM_PLAN_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/causeway-banking-github-terraform-plan` | Created by `shared/ci-cd` module |
| `TERRAFORM_APPLY_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/causeway-banking-github-terraform-apply` | Created by `shared/ci-cd` module |
| `TERRAFORM_APPLY_ROLE_ARN_PROD` | `arn:aws:iam::PROD_ACCOUNT_ID:role/causeway-banking-github-terraform-apply` | Created by `shared/ci-cd` module in prod account |

### 4.3 GitHub Environments required

1. **nonprod** — no approval gate, auto-deploy on merge
2. **production** — manual approval gate, restricted to specific team members

### 4.4 Prerequisites to create before first deployment

| Resource | How to create | Why it is needed |
|----------|---------------|------------------|
| ACM certificate | AWS Console or CLI: `aws acm request-certificate --domain-name finance.causewaygrp.com --validation-method DNS` | HTTPS listener on ALB requires valid TLS certificate |
| DNS validation | Add CNAME record from ACM to Route 53 or your DNS provider | Validates domain ownership |
| GitHub OIDC provider | Deploy `infrastructure/shared/ci-cd/main.tf` locally first | Allows GitHub Actions to assume IAM roles without long-lived keys |
| Terraform state buckets | Created by `shared/ci-cd` module, or manually: `aws s3 mb s3://causeway-banking-terraform-state-nonprod` | Stores Terraform state remotely |
| DynamoDB lock tables | Created by `shared/ci-cd` module, or manually | Prevents concurrent Terraform operations |

### 4.5 Deployment order

```
Step 1: Deploy shared/ci-cd (locally, one-time bootstrap)
        └── Creates OIDC provider, IAM roles, state buckets, lock tables

Step 2: Configure GitHub
        └── Set secrets (TERRAFORM_PLAN_ROLE_ARN, etc.)
        └── Create environments (nonprod, production)

Step 3: Create ACM certificate
        └── Request certificate for finance.causewaygrp.com
        └── Complete DNS validation

Step 4: Create terraform.tfvars for nonprod
        └── Set acm_certificate_arn, s3_bucket_suffix, alarm_email

Step 5: Open PR touching infrastructure/ → terraform-plan runs
        └── Review plan output in PR comment

Step 6: Merge PR → auto-apply to nonprod

Step 7: Validate nonprod (dashboards, smoke tests)

Step 8: Create terraform.tfvars for prod

Step 9: Trigger terraform-apply-prod workflow manually
        └── Type "apply" → GitHub environment approval → production deploy

Step 10: 15-minute monitoring window (see DEPLOYMENT.md validation section)
```

---

## 5. Data Ingestion and Backfill Strategy (2010–Present)

### 5.1 Architecture for data ingestion

The platform needs a data ingestion pipeline to import historical financial data.
The recommended architecture uses AWS-native services for reliability and
auditability:

```
Data Sources (CSV, API, JSON)
        │
        v
  S3 Landing Zone (raw/)
        │
        v
  AWS Step Functions (orchestration)
        │
        ├── Lambda: validate + schema check
        ├── Lambda: transform + normalize
        └── Lambda: load to Aurora PostgreSQL
                │
                v
          Aurora PostgreSQL
          (partitioned by year)
```

### 5.2 Backfill strategy by year

| Period | Data volume estimate | Ingestion method | Priority |
|--------|---------------------|------------------|----------|
| 2010–2015 | Historical archive | Batch CSV upload to S3 → Step Functions → Aurora | P2 |
| 2016–2020 | Growing dataset | Batch CSV/JSON upload to S3 → Step Functions → Aurora | P2 |
| 2021–2023 | Recent data | API integration + batch catch-up | P1 |
| 2024–present | Live data | Real-time API ingestion via EventBridge + SQS | P1 |

### 5.3 Implementation components

**S3 landing zone** — Already provisioned by the data module. Use the documents
bucket with a prefix structure:

```
s3://causeway-banking-{env}-documents-{suffix}/
  ingestion/
    raw/          Uploaded files land here
    validated/    Schema-validated files moved here
    processed/    Successfully loaded files archived here
    failed/       Files that failed validation or loading
```

**Step Functions workflow** — Orchestrates the ETL pipeline:
1. S3 event triggers Step Functions execution
2. Lambda validates schema and data types
3. Lambda transforms data (normalize dates, currencies, identifiers)
4. Lambda loads data into Aurora PostgreSQL via the master secret
5. On failure, moves file to `failed/` prefix and sends SNS alert

**Aurora table partitioning** — Partition by year for efficient historical queries:

```sql
CREATE TABLE financial_data (
    id             BIGSERIAL,
    data_year      INTEGER NOT NULL,
    source         VARCHAR(100) NOT NULL,
    category       VARCHAR(100) NOT NULL,
    indicator      VARCHAR(255) NOT NULL,
    value          DECIMAL(20,4),
    currency       VARCHAR(3) DEFAULT 'USD',
    reported_date  DATE NOT NULL,
    ingested_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, data_year)
) PARTITION BY RANGE (data_year);

CREATE TABLE financial_data_2010 PARTITION OF financial_data
    FOR VALUES FROM (2010) TO (2011);
-- ... one partition per year through 2026
CREATE TABLE financial_data_2026 PARTITION OF financial_data
    FOR VALUES FROM (2026) TO (2027);
```

**API ingestion for live data** — EventBridge scheduled rules trigger Lambda
functions that call external APIs, transform responses, and write to Aurora. Use
SQS as a buffer for rate limiting and retry.

### 5.4 Monitoring ingestion

- CloudWatch custom metrics: records ingested per batch, validation errors,
  processing time
- CloudWatch alarm: ingestion failure rate > 5%
- DynamoDB table tracks ingestion state: batch ID, status, record count, errors

---

## 6. Improvement Plan — Next Steps

### Priority 1: Security hardening (before prod)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 1 | Scope down terraform_apply IAM role from AdministratorAccess to specific services | 2 hours | TODO |
| 2 | Add CloudTrail to infrastructure (currently in Config rules but not provisioned) | 1 hour | TODO |
| 3 | Add Secrets Manager rotation configuration for Aurora master password | 1 hour | TODO |
| 4 | Pin Docker base images to digest (supply chain security) | 30 min | TODO |
| 5 | Add SARIF upload for Trivy results to GitHub Security tab | 30 min | TODO |

### Priority 2: Operational completeness (before prod)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 6 | Create `terraform.tfvars.example` files for both environments | 30 min | TODO |
| 7 | Add service template README with quickstart guide | 1 hour | TODO |
| 8 | Schedule chaos engineering experiments (currently TBD) | 1 hour | TODO |
| 9 | Add PagerDuty/Slack integration for SNS topics | 2 hours | TODO |
| 10 | Create database migration tooling (Flyway or golang-migrate) | 4 hours | TODO |

### Priority 3: Platform maturity (after initial launch)

| # | Item | Effort | Status |
|---|------|--------|--------|
| 11 | Implement cross-region DR infrastructure (eu-west-2) | 2 days | TODO |
| 12 | Add API Gateway with usage plans and API keys | 1 day | TODO |
| 13 | Implement data ingestion pipeline (see section 5) | 3 days | TODO |
| 14 | Add distributed tracing with AWS X-Ray | 4 hours | TODO |
| 15 | Implement blue/green deployments with CodeDeploy | 1 day | TODO |

### Priority 4: Developer experience

| # | Item | Effort | Status |
|---|------|--------|--------|
| 16 | Deploy Backstage instance and connect catalog | 2 days | TODO |
| 17 | Add OpenAPI spec generation and validation to CI | 4 hours | TODO |
| 18 | Create load testing framework (k6 or Artillery) | 1 day | TODO |
| 19 | Add development environment with LocalStack or Docker Compose | 1 day | TODO |

---

## 7. Technology Stack Summary

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **IaC** | Terraform | >= 1.5 | Industry standard, mature AWS provider, state management |
| **Cloud** | AWS | Provider ~> 5.0 | FCA-approved cloud provider, eu-west-1 region |
| **Compute** | ECS Fargate | — | Serverless containers, no EC2 management, per-second billing |
| **Database** | Aurora PostgreSQL | 15.4 | Managed HA PostgreSQL, up to 5x throughput, automated failover |
| **Cache/Sessions** | DynamoDB | On-demand | Serverless, single-digit ms latency, PITR enabled |
| **Storage** | S3 | — | KMS-encrypted, versioned, lifecycle policies |
| **Runtime** | Node.js 20 | LTS | TypeScript support, async/await, Alpine-based containers |
| **Framework** | Express 4.18 | — | Battle-tested, lightweight, Helmet for security headers |
| **Logging** | Pino 8.x | — | Fastest Node.js JSON logger, structured output for CloudWatch |
| **Testing** | Jest 29 + supertest | — | 80% coverage thresholds, integration test support |
| **Security scanning** | Trivy | — | Container vulnerability scanning in CI |
| **Monitoring** | CloudWatch | — | Native AWS, dashboards + alarms + logs + metrics |
| **WAF** | AWS WAFv2 | — | OWASP CRS, SQLi protection, rate limiting |
| **CI/CD** | GitHub Actions | — | Native GitHub integration, OIDC for AWS auth |
| **Secrets** | AWS Secrets Manager | — | Managed password rotation, KMS-encrypted |
| **Policy** | AWS Config | — | 12 rules for automated compliance checking |
| **Chaos** | AWS FIS | — | Managed fault injection for resilience testing |

---

## 8. Scorecard (Updated)

| Category | Previous | Current | Notes |
|----------|----------|---------|-------|
| **Documentation coverage** | 7/10 | 9/10 | Comprehensive: architecture, threat model, compliance, runbooks, chaos |
| **Documentation quality** | 6/10 | 8/10 | Acceptance criteria, CLI commands, Mermaid diagrams |
| **Security posture** | 4/10 | 7/10 | WAF, KMS, NACLs, managed passwords. Needs IAM scoping + CloudTrail |
| **Operational readiness** | 3/10 | 7/10 | 8 runbook procedures, chaos experiments, dashboards, alarms |
| **Infrastructure code** | 1/10 | 8/10 | 5 modules, 2 envs, working inter-module wiring |
| **CI/CD** | 0/10 | 8/10 | Plan/apply/deploy pipelines, OIDC auth, matrix builds |
| **GitHub configuration** | 5/10 | 9/10 | CODEOWNERS with real teams, templates, docs-lint CI |
| **Compliance readiness** | 3/10 | 8/10 | PCI-DSS + FCA + GDPR mapping, policy-as-code, data classification |
| **Developer experience** | 2/10 | 7/10 | Service template, Backstage catalog, contribution guidelines |
| **Production viability** | 1/10 | 7/10 | Deployable to nonprod today, needs hardening for prod |

**Weighted overall: B+** (up from C+)

---

## 9. Note on Yemen Economic Transparency Observatory PDF

The referenced PDF (`@Yemen-Economic-Transparency-Observatory (1).pdf`) was not
found on the filesystem. It appears the file was not uploaded to the repository.
If this PDF describes an additional project or data source to integrate, please
re-upload the file so it can be reviewed and its requirements incorporated into
the platform design.

---

*Last updated: 2026-02-11*
*Owner: Platform Engineering*

# Causeway Banking Financial

Production-grade AWS hosting standards and operating model for Causeway
Banking Financial digital services.

This repository defines the reference architecture, security baseline, and
operational readiness requirements used to build, host, and operate financial
workloads on AWS. It is intentionally documentation-first so delivery teams can
align before implementation begins. Application code may live in separate
service repositories that follow these standards.

## Contents

- [Scope and principles](#scope-and-principles)
- [Architecture at a glance](#architecture-at-a-glance)
- [Repository map](#repository-map)
- [AWS production-ready baseline](#aws-production-ready-baseline)
- [AWS deployment overview](#aws-deployment-overview)
- [Go-live for finance.causewaygrp.com](#go-live-for-financecausewaygrpcom)
- [Getting started](#getting-started)
- [Definition of done](#definition-of-done)
- [Support](#support)

## Scope and principles

This repository covers:

- Reference architecture for AWS hosting
- Security, compliance, and auditability standards
- Operational readiness and incident response expectations
- Data classification and handling requirements

Guiding principles:

- Security by default, least privilege everywhere
- High availability across multiple AZs
- Automated, auditable infrastructure as code
- Encrypt in transit and at rest for all sensitive data
- Observable systems with measurable SLOs

## Architecture at a glance

```
Users
  |
CloudFront + AWS WAF + Shield
  |
Application Load Balancer (multi-AZ)
  |
Compute (ECS Fargate / EKS / Lambda)
  |
Data (Aurora/RDS, DynamoDB, S3) + KMS
  |
Observability (CloudWatch, X-Ray, central logs)
```

## Repository map

```
docs/
  ARCHITECTURE.md             Reference architecture with Mermaid diagrams
  THREAT_MODEL.md             STRIDE-based threat model
  COMPLIANCE_MAPPING.md       PCI-DSS, FCA, UK GDPR control mapping
  CHAOS_ENGINEERING.md        Gameday strategy and FIS experiments
  adr/
    0001-default-compute-ecs-fargate.md
    0002-rto-rpo-targets-by-service-tier.md
    0003-cross-region-dr-strategy.md
  AWS_PRODUCTION_READINESS.md
  DATA_CLASSIFICATION.md
  DEPLOYMENT.md
  DOMAIN_SETUP.md
  GO_LIVE_CHECKLIST.md
  OPERATIONS_RUNBOOK.md       Detailed runbooks for 8 incident scenarios
  REPOSITORY_STANDARDS.md
infrastructure/
  modules/
    networking/               VPC, subnets, NAT, NACLs, flow logs
    compute/                  ECS Fargate cluster, ALB, security groups
    data/                     Aurora PostgreSQL, DynamoDB, S3
    security/                 KMS CMK, WAF Web ACL, IAM roles
    observability/            CloudWatch dashboard, alarms, SNS
  environments/
    nonprod/                  2 AZs, cost-optimised
    prod/                     3 AZs, HA, stricter thresholds
  shared/ci-cd/               GitHub OIDC, state buckets, IAM roles
  policy/                     AWS Config rules (12 compliance checks)
  cost-guardrails/            Budgets, anomaly detection, tag enforcement
  chaos-engineering/          AWS FIS experiment templates
service-template/
  app/                        Dockerfile, Express/TypeScript server
  terraform/                  ECS service module with autoscaling
  .github/workflows/ci.yml   Lint, test, build, scan, deploy pipeline
  tests/                      Baseline health endpoint tests
backstage/
  catalog-info.yaml           Backstage entity catalog and service template
.github/
  workflows/
    docs-lint.yml             Markdown lint, spell check, link check
    terraform-plan.yml        Plan on PR, comment diff
    terraform-apply-nonprod.yml  Auto-apply on merge to main
    terraform-apply-prod.yml     Manual trigger with approval gate
```

## Architecture decisions

Key decisions are recorded as ADRs in `docs/adr/`:

| ADR | Decision |
|-----|----------|
| [0001](docs/adr/0001-default-compute-ecs-fargate.md) | ECS Fargate as default compute platform |
| [0002](docs/adr/0002-rto-rpo-targets-by-service-tier.md) | RTO/RPO targets by service tier (Tier 1-3) |
| [0003](docs/adr/0003-cross-region-dr-strategy.md) | Cross-region DR: active-passive, pilot light, backup-restore |

## AWS production-ready baseline

The baseline focuses on these areas:

- Account strategy and landing zone
- Identity and access management (SSO, MFA, least privilege)
- Network segmentation and zero trust boundaries
- Edge protection (WAF, Shield, rate limiting)
- Multi-AZ high availability and autoscaling
- Encryption with AWS KMS and customer-managed keys
- Centralized logging, metrics, and alerting
- Continuous vulnerability management
- Disaster recovery with defined RTO/RPO targets

Full details live in [docs/AWS_PRODUCTION_READINESS.md](docs/AWS_PRODUCTION_READINESS.md).

## AWS deployment overview

This repository defines the standards and reference design. Production
deployments should:

1. Use IaC for all resources (Terraform/CDK/CloudFormation).
2. Separate accounts and environments (prod, non-prod, shared services).
3. Front public traffic with CloudFront, WAF, and an ALB.
4. Use managed data services with KMS encryption and backups.
5. Implement centralized logging, metrics, and alerting.

Deployment guidance is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Go-live for finance.causewaygrp.com

To make `finance.causewaygrp.com` live:

1. Verify domain ownership and DNS access.
2. Issue an ACM certificate (us-east-1 if using CloudFront).
3. Deploy CloudFront + WAF in front of the origin (ALB recommended).
4. Create DNS records pointing the subdomain to CloudFront or ALB.
5. Complete the go-live checklist and validate TLS, health checks, and logs.

See [docs/DOMAIN_SETUP.md](docs/DOMAIN_SETUP.md) and
[docs/GO_LIVE_CHECKLIST.md](docs/GO_LIVE_CHECKLIST.md).

## Getting started

1. Read the architecture and readiness documents in `docs/`.
2. Use the standards to guide IaC implementation (Terraform/CDK/CloudFormation).
3. Record key decisions using ADRs before implementation.
4. Validate production readiness using the checklist.
5. Follow the domain setup guidance before production cutover.

## Definition of done

Production readiness requires:

- Security baseline complete and verified
- Multi-AZ resilience tested
- Monitoring and alerting in place
- Backups and restore procedures tested
- Incident runbook reviewed and approved
- Change management and release controls documented

## Support

If you have questions or need clarifications, open an issue with details or
contact the platform operations team.
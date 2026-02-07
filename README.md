# Causeway Banking Financial

Production-grade AWS hosting standards and operating model for Causeway
Banking Financial digital services.

This repository defines the reference architecture, security baseline, and
operational readiness requirements used to build, host, and operate financial
workloads on AWS. It is intentionally documentation-first so delivery teams can
align before implementation begins.

## Contents

- [Scope and principles](#scope-and-principles)
- [Architecture at a glance](#architecture-at-a-glance)
- [Repository structure](#repository-structure)
- [AWS production-ready baseline](#aws-production-ready-baseline)
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

## Repository structure

```
docs/
  ARCHITECTURE.md
  adr/
    0000-template.md
  AWS_PRODUCTION_READINESS.md
  DATA_CLASSIFICATION.md
  OPERATIONS_RUNBOOK.md
  REPOSITORY_STANDARDS.md
```

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

## Getting started

1. Read the architecture and readiness documents in `docs/`.
2. Use the standards to guide IaC implementation (Terraform/CDK/CloudFormation).
3. Record key decisions using ADRs before implementation.
4. Validate production readiness using the checklist.

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
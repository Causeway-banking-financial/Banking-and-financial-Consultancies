# Deployment Guide

This guide describes the standard deployment approach for AWS-hosted services.
It assumes the repository contains standards and IaC, while application code
may live in separate service repositories.

## Deployment model

- Infrastructure is managed as code and deployed through CI/CD.
- Environments are isolated by account and region.
- Releases are immutable and rollbacks are automated.

## Environment separation

- **Shared services**: logging, security tooling, CI/CD runners.
- **Non-production**: dev and staging for integration testing.
- **Production**: isolated account with stricter controls.

## Recommended pipeline stages

1. **Plan**: validate IaC, lint, and policy checks.
2. **Build**: create immutable artifacts (containers, packages).
3. **Test**: unit, integration, and security checks.
4. **Deploy**: apply IaC changes and release artifacts.
5. **Verify**: health checks and SLO validation.

## Infrastructure layers

- **Network**: VPCs, subnets, route tables, gateways.
- **Security**: IAM, KMS, Secrets Manager, WAF.
- **Compute**: ECS/EKS/Lambda and autoscaling.
- **Data**: RDS/Aurora, DynamoDB, S3.
- **Observability**: logging, metrics, tracing, alerting.

## Configuration and secrets

- Store configuration in SSM Parameter Store or Secrets Manager.
- Rotate secrets regularly and log access.
- Avoid plaintext secrets in CI logs.

## Rollback strategy

- Keep the previous release artifact available.
- Use blue/green or canary where feasible.
- Document manual recovery steps in the runbook.

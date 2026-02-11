# Architecture

This document describes the reference architecture for Causeway Banking
Financial workloads hosted on AWS. It is a baseline that each service can
extend while maintaining security and operational consistency.

## Context

The platform supports customer-facing and internal systems that handle
confidential financial data. The design prioritizes confidentiality,
availability, and auditability.

## Reference flow

```
Client -> CloudFront/WAF -> ALB -> Service tier -> Data tier
                  |                |
                  |                +-> Async events (SQS/SNS/EventBridge)
                  +-> Static assets (S3)
```

## Core components

- Edge: CloudFront, AWS WAF, Shield
- Ingress: Application Load Balancer across multiple AZs
- Compute: ECS Fargate, EKS, or Lambda depending on service needs
- Data: Aurora/RDS for relational, DynamoDB for key-value, S3 for objects
- Security: KMS, IAM, Secrets Manager
- Observability: CloudWatch, X-Ray, central log archive

## Data flow and boundaries

- All inbound traffic terminates TLS at the edge and is re-encrypted internally.
- Sensitive data remains in private subnets with no direct internet access.
- Service-to-service calls use mutual TLS where required.

## Availability and scaling

- All tiers run in at least two availability zones.
- Auto scaling policies are defined and tested.
- Stateless services preferred for rapid recovery.

## Resolved decisions

The following decisions are recorded as Architecture Decision Records in `docs/adr/`:

- **Compute platform:** ECS Fargate is the default. Lambda is permitted for
  event-driven workloads. EKS is deferred. See [ADR-0001](adr/0001-default-compute-ecs-fargate.md).
- **RTO/RPO targets:** Three service tiers with targets ranging from 15min/1min
  (Tier 1) to 4hr/1hr (Tier 3). See [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md).
- **DR strategy:** Active-passive warm standby for Tier 1, pilot light for
  Tier 2, backup-and-restore for Tier 3. Primary region eu-west-1, DR region
  eu-west-2. See [ADR-0003](adr/0003-cross-region-dr-strategy.md).

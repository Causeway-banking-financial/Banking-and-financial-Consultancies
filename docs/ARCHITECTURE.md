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

## Open decisions

- Final compute choice per service (ECS/EKS/Lambda)
- RTO/RPO targets by service tier
- Cross-region DR activation strategy

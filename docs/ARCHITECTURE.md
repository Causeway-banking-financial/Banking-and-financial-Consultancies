# Architecture

This document describes the reference architecture for Causeway Banking
Financial workloads hosted on AWS. It is a baseline that each service can
extend while maintaining security and operational consistency.

## Context

The platform supports customer-facing and internal systems that handle
confidential financial data. The design prioritizes confidentiality,
availability, and auditability.

## Reference architecture

```mermaid
graph TB
    subgraph Internet
        Users([Users / Clients])
    end

    subgraph Edge["Edge Layer"]
        CF[CloudFront CDN]
        WAF[AWS WAF]
        Shield[AWS Shield]
    end

    subgraph VPC["VPC — eu-west-1 (multi-AZ)"]
        subgraph Public["Public Subnets"]
            ALB[Application Load Balancer]
        end

        subgraph Private["Private Subnets"]
            ECS1[ECS Fargate<br/>Service A]
            ECS2[ECS Fargate<br/>Service B]
            Lambda[Lambda<br/>Event Processors]
        end

        subgraph Data["Database Subnets"]
            Aurora[(Aurora PostgreSQL<br/>Multi-AZ)]
            DDB[(DynamoDB<br/>Sessions)]
        end
    end

    subgraph Async["Async / Events"]
        SQS[SQS Queues]
        SNS[SNS Topics]
        EB[EventBridge]
    end

    subgraph Storage["Object Storage"]
        S3[S3 Encrypted<br/>Documents]
    end

    subgraph Security["Security Services"]
        KMS[AWS KMS CMK]
        SM[Secrets Manager]
        IAM[IAM Roles]
    end

    subgraph Observability["Observability"]
        CW[CloudWatch<br/>Metrics + Logs]
        XRay[AWS X-Ray<br/>Traces]
        SNSAlarm[SNS Alarms]
    end

    Users --> CF
    CF --> WAF
    WAF --> Shield
    Shield --> ALB
    ALB --> ECS1
    ALB --> ECS2
    ECS1 --> Aurora
    ECS1 --> DDB
    ECS2 --> Aurora
    ECS2 --> S3
    ECS1 --> SQS
    SQS --> Lambda
    Lambda --> Aurora
    SNS --> Lambda
    EB --> Lambda
    Aurora --> KMS
    DDB --> KMS
    S3 --> KMS
    ECS1 --> SM
    ECS2 --> SM
    ECS1 --> CW
    ECS2 --> CW
    Lambda --> CW
    CW --> SNSAlarm
    ECS1 --> XRay
    ECS2 --> XRay
```

## Disaster recovery topology

```mermaid
graph LR
    subgraph Primary["eu-west-1 (Primary)"]
        P_CF[CloudFront + WAF]
        P_ALB[ALB]
        P_ECS[ECS Fargate<br/>Full Scale]
        P_Aurora[(Aurora Writer)]
        P_DDB[(DynamoDB)]

        P_CF --> P_ALB --> P_ECS --> P_Aurora
        P_ECS --> P_DDB
    end

    subgraph DR["eu-west-2 (DR)"]
        D_ALB[ALB Standby]
        D_ECS[ECS Fargate<br/>Min Scale]
        D_Aurora[(Aurora Reader<br/>Cross-Region Replica)]
        D_DDB[(DynamoDB<br/>Global Table)]

        D_ALB --> D_ECS --> D_Aurora
        D_ECS --> D_DDB
    end

    R53{Route 53<br/>Health Check}

    R53 -->|Active| P_CF
    R53 -.->|Failover| D_ALB
    P_Aurora -->|Async Replication| D_Aurora
    P_DDB -->|Global Tables| D_DDB
```

## Network segmentation

```mermaid
graph TB
    subgraph VPC["VPC 10.1.0.0/16"]
        subgraph PubSub["Public Subnets (10.1.0.0/22)"]
            ALB2[ALB]
            NAT[NAT Gateway]
        end

        subgraph PrivSub["Private Subnets (10.1.10.0/22)"]
            Compute[ECS Tasks / Lambda]
        end

        subgraph DBSub["Database Subnets (10.1.20.0/22)"]
            DB[Aurora / DynamoDB]
        end
    end

    Internet2([Internet]) -->|443 only| ALB2
    ALB2 -->|SG: ALB to ECS| Compute
    Compute -->|SG: ECS to DB<br/>Port 5432 only| DB
    Compute -->|NAT Gateway| Internet2
    DB -.->|No internet access| X[Blocked]

    style X fill:#f44,stroke:#d32,color:#fff
```

## Core components

| Layer | Service | Purpose |
|-------|---------|---------|
| Edge | CloudFront, AWS WAF, Shield | CDN, OWASP protection, DDoS mitigation |
| Ingress | Application Load Balancer | TLS termination, multi-AZ routing |
| Compute | ECS Fargate (default) | Containerised services — see [ADR-0001](adr/0001-default-compute-ecs-fargate.md) |
| Compute | Lambda | Event-driven processors (SQS, S3, scheduled) |
| Data | Aurora PostgreSQL | Relational data, multi-AZ, encrypted with KMS |
| Data | DynamoDB | Key-value / session data, global tables for DR |
| Data | S3 | Document and object storage, versioned, encrypted |
| Async | SQS, SNS, EventBridge | Decoupled event processing |
| Security | KMS, IAM, Secrets Manager | Encryption, access control, secrets |
| Observability | CloudWatch, X-Ray | Metrics, logs, distributed tracing |

## Data flow and boundaries

- All inbound traffic terminates TLS at the edge and is re-encrypted internally.
- Sensitive data remains in private subnets with no direct internet access.
- Service-to-service calls use mutual TLS where required.
- Database subnets are restricted by NACLs to accept connections only from
  private subnets on port 5432.

## Availability and scaling

- All tiers run in at least two availability zones (three in prod).
- ECS services use target-tracking autoscaling on CPU utilisation (target 70%).
- Aurora uses read replicas for read scaling and cross-region replicas for DR.
- Stateless services preferred for rapid recovery and horizontal scaling.

## Resolved decisions

The following decisions are recorded as Architecture Decision Records in `docs/adr/`:

- **Compute platform:** ECS Fargate is the default. Lambda is permitted for
  event-driven workloads. EKS is deferred. See [ADR-0001](adr/0001-default-compute-ecs-fargate.md).
- **RTO/RPO targets:** Three service tiers with targets ranging from 15min/1min
  (Tier 1) to 4hr/1hr (Tier 3). See [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md).
- **DR strategy:** Active-passive warm standby for Tier 1, pilot light for
  Tier 2, backup-and-restore for Tier 3. Primary region eu-west-1, DR region
  eu-west-2. See [ADR-0003](adr/0003-cross-region-dr-strategy.md).

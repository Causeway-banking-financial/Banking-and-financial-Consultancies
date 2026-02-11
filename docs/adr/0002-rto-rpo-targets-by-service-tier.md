# ADR 0002: RTO/RPO Targets by Service Tier

Date: 2026-02-11

## Status

Accepted

## Context

The architecture documents require "RTO/RPO defined per service" but no targets
exist. Without concrete recovery objectives, teams cannot design backup
strategies, choose database configurations, or size disaster recovery
infrastructure.

Recovery objectives must balance cost against business impact. Not every service
justifies the investment required for near-zero downtime.

Key definitions:

- **RTO (Recovery Time Objective):** Maximum acceptable time from failure to
  service restoration.
- **RPO (Recovery Point Objective):** Maximum acceptable data loss measured in
  time. An RPO of 5 minutes means up to 5 minutes of data may be lost.

## Decision

**Services are classified into three tiers with defined RTO/RPO targets.**

### Tier 1 — Critical (customer-facing transaction processing)

| Metric | Target |
|--------|--------|
| RTO | 15 minutes |
| RPO | 1 minute |
| Availability SLO | 99.95% (approx. 4.4 hours downtime/year) |

**Implementation requirements:**
- Aurora PostgreSQL with Multi-AZ (synchronous replication, automatic failover)
- ECS Fargate across 3 AZs with minimum 2 running tasks
- Health checks with 10-second intervals, 2-failure threshold
- Automated failover — no human intervention required for AZ-level failure
- Point-in-time recovery enabled with 1-minute granularity (Aurora backtrack)
- Cross-region read replica for DR (see ADR-0003)

**Examples:** Payment processing API, account management service, authentication
service.

### Tier 2 — Important (customer-facing non-transactional, internal business-critical)

| Metric | Target |
|--------|--------|
| RTO | 1 hour |
| RPO | 15 minutes |
| Availability SLO | 99.9% (approx. 8.8 hours downtime/year) |

**Implementation requirements:**
- Aurora PostgreSQL or RDS with Multi-AZ
- ECS Fargate across 2 AZs with minimum 2 running tasks
- Automated backups every 15 minutes (Aurora continuous or RDS snapshots)
- Manual failover to DR region acceptable

**Examples:** Reporting dashboards, document generation, notification service,
internal workflow tools.

### Tier 3 — Standard (internal tools, batch processing, non-critical)

| Metric | Target |
|--------|--------|
| RTO | 4 hours |
| RPO | 1 hour |
| Availability SLO | 99.5% (approx. 1.8 days downtime/year) |

**Implementation requirements:**
- RDS Single-AZ or DynamoDB (depending on data model)
- ECS Fargate in 2 AZs (can scale to zero during off-hours if applicable)
- Daily automated backups with hourly transaction log shipping
- Restore from backup is the DR strategy

**Examples:** Internal admin tools, data migration jobs, development/staging
environments, log aggregation.

### Tier assignment process

1. Service owner proposes a tier during architecture review.
2. Platform engineering and security team validate the classification.
3. Tier is recorded in the service's README and infrastructure configuration.
4. Tier determines the infrastructure module variant used (see infrastructure/).

## Consequences

**Benefits:**
- Teams have clear, non-negotiable targets to design against.
- Infrastructure modules can be parameterized by tier, reducing per-service
  decision-making.
- Cost is proportional to criticality — Tier 3 services don't pay for Tier 1
  infrastructure.
- DR testing can be prioritized by tier (Tier 1 quarterly, Tier 2 biannually,
  Tier 3 annually).

**Risks:**
- Services may be misclassified. Mitigated by requiring platform engineering
  sign-off on tier assignment.
- Targets may need adjustment as the business scales. This ADR should be
  reviewed annually or when a major incident reveals inadequate targets.

**Trade-offs:**
- Tier 1 infrastructure costs are significantly higher (3-AZ, cross-region
  replication). Accepted because customer-facing transaction services justify
  the investment.
- Tier 3 accepts meaningful downtime risk. Accepted because the business impact
  is contained.

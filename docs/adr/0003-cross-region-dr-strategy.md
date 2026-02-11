# ADR 0003: Cross-Region Disaster Recovery Strategy

Date: 2026-02-11

## Status

Accepted

## Context

The architecture requires a cross-region DR strategy but none has been defined.
A single-region deployment, even across multiple AZs, is vulnerable to
region-wide AWS outages — rare but documented (us-east-1 has experienced
multi-hour degradations).

For a financial services platform, regulators and customers expect a credible DR
plan with evidence of regular testing.

Constraints:

- Primary region: **eu-west-1** (Ireland) — chosen for UK/EU data residency and
  low latency to Causeway's primary user base.
- DR region: **eu-west-2** (London) — same regulatory jurisdiction, independent
  infrastructure, acceptable latency for failover.
- Cost must be proportional to risk. A fully active-active deployment doubles
  infrastructure spend.
- Recovery targets are defined in ADR-0002 by service tier.

Options considered:

1. **Active-active (multi-region):** Both regions serve traffic simultaneously.
   Near-zero RTO but doubles cost and introduces data consistency complexity.
2. **Active-passive (warm standby):** DR region has pre-provisioned
   infrastructure at reduced scale. Minutes-to-hours RTO depending on tier.
3. **Pilot light:** DR region has only data replication running. Infrastructure
   is provisioned on-demand during failover. Hours-level RTO.
4. **Backup and restore:** No running infrastructure in DR region. Restore from
   backups when needed. Hours-to-days RTO.

## Decision

**Active-passive (warm standby) for Tier 1 services. Pilot light for Tier 2.
Backup and restore for Tier 3.**

### Tier 1 — Active-passive warm standby

```
eu-west-1 (primary)              eu-west-2 (DR)
┌─────────────────┐              ┌─────────────────┐
│ CloudFront/WAF  │              │ CloudFront/WAF  │
│ ALB (active)    │              │ ALB (standby)   │
│ ECS (full)      │              │ ECS (min scale) │
│ Aurora (writer) │──replicate──>│ Aurora (reader)  │
│ DynamoDB        │──global tbl─>│ DynamoDB        │
└─────────────────┘              └─────────────────┘
```

- Aurora cross-region read replica with promotion capability.
- DynamoDB global tables for key-value data.
- ECS tasks running at minimum scale (2 tasks) in DR — enough to validate
  health, not enough to serve full load.
- DNS failover via Route 53 health checks with 60-second evaluation.
- On failover: scale ECS to full capacity, promote Aurora replica to writer,
  update Route 53 to point to DR ALB.
- **Target RTO: 15 minutes.** Automated detection, semi-automated execution
  (single-command runbook, human approval required).

### Tier 2 — Pilot light

- Aurora cross-region read replica (or automated snapshot copy).
- ECS task definitions and infrastructure exist in DR but tasks are not running.
- On failover: start ECS tasks, promote Aurora, update DNS.
- **Target RTO: 1 hour.** Manual execution from runbook.

### Tier 3 — Backup and restore

- Nightly automated backup copies to DR region (S3 cross-region replication for
  objects, RDS automated snapshot copy).
- No running infrastructure in DR.
- On failover: provision infrastructure from Terraform, restore from latest
  backup.
- **Target RTO: 4 hours.** Manual execution.

### Failover triggers

| Trigger | Action |
|---------|--------|
| Route 53 health check fails for 3 consecutive intervals (3 minutes) | Page on-call, begin assessment |
| AWS Health Dashboard confirms region-level incident | Initiate failover runbook |
| On-call engineer confirms primary is unrecoverable within RTO | Execute failover |

### Failback procedure

1. Confirm primary region is fully healthy (minimum 30 minutes stable).
2. Re-establish replication from DR back to primary.
3. Verify data consistency (row counts, checksums on critical tables).
4. Switch DNS back to primary during a maintenance window.
5. Scale down DR to standby levels.
6. Write post-incident report.

## Consequences

**Benefits:**
- Tier 1 services meet the 15-minute RTO with pre-provisioned infrastructure.
- Cost is controlled — Tier 2 and 3 don't pay for always-on DR compute.
- Strategy is testable. Quarterly DR drills can validate each tier independently.
- Route 53 health checks provide automated detection without custom tooling.

**Risks:**
- Active-passive introduces replication lag (Aurora: typically <1 second, but
  can spike). Accepted because RPO of 1 minute is met under normal conditions.
- Failback is complex and error-prone. Mitigated by detailed runbook and
  mandatory post-failover data validation.
- DR infrastructure can drift from primary if Terraform is not applied
  consistently. Mitigated by CI/CD applying to both regions on every merge.

**Trade-offs:**
- Warm standby for Tier 1 costs approximately 20-30% of primary infrastructure
  (reduced ECS scale, read replica). Accepted as insurance against region failure.
- Pilot light for Tier 2 means a 1-hour RTO gap where services are unavailable.
  Accepted because these services are not transaction-critical.
- Manual failover decision (no fully automated region switch) to prevent
  false-positive failovers. Accepted as safer for financial services.

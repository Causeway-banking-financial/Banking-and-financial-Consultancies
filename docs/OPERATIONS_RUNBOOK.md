# Operations Runbook — Causeway Banking Financial Platform

This runbook defines operational procedures for the Causeway Banking Financial
platform running on AWS. It is the authoritative reference during incidents
and routine operational work. Every on-call engineer must read this document
before joining the rotation.

**Primary region:** eu-west-1 (Ireland)
**DR region:** eu-west-2 (London)
**Compute platform:** ECS Fargate (ADR-0001)
**DR strategy:** Active-passive warm standby / pilot light / backup-restore by tier (ADR-0003)

---

## Table of contents

1. [Severity levels and SLOs](#1-severity-levels-and-slos)
2. [On-call structure and escalation](#2-on-call-structure-and-escalation)
3. [Incident response framework](#3-incident-response-framework)
4. [Monitoring and alerting](#4-monitoring-and-alerting)
5. [Change management](#5-change-management)
6. [Runbook procedures](#6-runbook-procedures)
   - [6.1 ECS container crash loop](#61-ecs-container-crash-loop)
   - [6.2 Aurora database failover](#62-aurora-database-failover)
   - [6.3 TLS certificate approaching expiry](#63-tls-certificate-approaching-expiry)
   - [6.4 AWS region degradation](#64-aws-region-degradation)
   - [6.5 Suspected data breach response](#65-suspected-data-breach-response)
   - [6.6 DDoS attack mitigation](#66-ddos-attack-mitigation)
   - [6.7 Failed deployment rollback](#67-failed-deployment-rollback)
   - [6.8 Secrets rotation (scheduled and emergency)](#68-secrets-rotation-scheduled-and-emergency)
7. [Backups and recovery](#7-backups-and-recovery)
8. [Appendix — key resource identifiers](#8-appendix--key-resource-identifiers)

---

## 1. Severity levels and SLOs

### Severity definitions

| Severity | Definition | Examples | Response time | Resolution target |
|----------|-----------|----------|---------------|-------------------|
| **SEV-1** | Full outage of a Tier 1 service, data integrity risk, confirmed security breach, or regulatory reporting trigger | Payment processing API down, database corruption detected, confirmed data exfiltration | **5 minutes** (page all on-call) | **15 minutes** (stabilize), **1 hour** (resolve) |
| **SEV-2** | Major degradation of a Tier 1 service or full outage of a Tier 2 service affecting customers | Elevated error rates (>5%) on transaction API, reporting dashboard unavailable during business hours, authentication latency >2s | **15 minutes** (page primary on-call) | **30 minutes** (stabilize), **4 hours** (resolve) |
| **SEV-3** | Limited customer impact, degradation of a Tier 2 service, or outage of a Tier 3 service | Batch processing delayed, internal admin tool unavailable, non-critical alert firing | **30 minutes** (notify via Slack) | **1 business day** |
| **SEV-4** | No customer impact; cosmetic issues, non-urgent maintenance items, or informational alerts | Elevated but non-actionable metric, minor UI defect in internal tooling | **Next business day** | **1 week** |

### Service tier SLOs (per ADR-0002)

| Tier | Availability SLO | RTO | RPO | Examples |
|------|------------------|-----|-----|----------|
| **Tier 1** | 99.95% | 15 min | 1 min | Payment processing API, account management, authentication |
| **Tier 2** | 99.9% | 1 hour | 15 min | Reporting dashboards, document generation, notifications |
| **Tier 3** | 99.5% | 4 hours | 1 hour | Internal admin tools, batch jobs, dev/staging |

### Error budget policy

- Each service tracks a rolling 30-day error budget derived from its SLO.
- When >50% of the error budget is consumed, a review is triggered and deployments require additional sign-off from the platform engineering lead.
- When >80% is consumed, all non-critical deployments are frozen until the budget recovers or a remediation plan is approved.
- Error budget status is published weekly in the `#platform-status` Slack channel.

---

## 2. On-call structure and escalation

### Rotation structure

| Role | Roster | Hours | Responsibilities |
|------|--------|-------|------------------|
| **Primary on-call** | Platform engineering (weekly rotation) | 24/7 | First responder. Triage all pages, execute runbook procedures, own incident until resolved or escalated. |
| **Secondary on-call** | Platform engineering (weekly rotation, offset) | 24/7 | Backup if primary does not acknowledge within 5 minutes. Assists on SEV-1 incidents. |
| **Security on-call** | Security team (weekly rotation) | 24/7 | Engaged for all security-related incidents (breach, DDoS, WAF events). Has authority to isolate resources. |
| **Engineering lead** | Named individual per service area | Business hours + on-call escalation | Escalation point for architectural decisions, coordinates cross-team response. |
| **Incident commander** | Senior engineering / management (rotating) | Escalation only | Takes command of SEV-1 incidents. Owns communication, coordination, and post-incident review. |

### Escalation path

```
Alert fires
  |
  v
Primary on-call (PagerDuty) — 5 min to acknowledge
  |
  +-- Not acknowledged --> Secondary on-call (auto-escalate)
  |
  +-- Acknowledged --> Triage severity
        |
        +-- SEV-3/4 --> Primary resolves, posts update in Slack
        |
        +-- SEV-2 --> Primary resolves, pages engineering lead if needed
        |
        +-- SEV-1 --> Primary pages:
              - Secondary on-call
              - Incident commander
              - Security on-call (if security-related)
              - Service owner(s)
              |
              +-- No resolution in 30 min --> Page VP Engineering
              +-- No resolution in 60 min --> Page CTO
```

### Contact channels

| Channel | Purpose |
|---------|---------|
| PagerDuty service `causeway-platform` | All automated alerts route here |
| Slack `#incidents` | Real-time incident coordination (create per-incident thread) |
| Slack `#platform-status` | Service status updates for wider engineering team |
| Incident bridge (Zoom) | Voice coordination for SEV-1; link auto-posted by PagerDuty |
| StatusPage | External customer communication for SEV-1/SEV-2 |

### On-call handoff procedure

1. Outgoing on-call writes a handoff note in `#platform-status` covering:
   - Active incidents or follow-up items.
   - Alerts that fired during the shift and their disposition.
   - Any known upcoming maintenance or deployments.
2. Incoming on-call acknowledges the handoff in the thread.
3. PagerDuty schedule rotates automatically; verify your shift in the PagerDuty UI.
4. If you cannot take your shift, arrange a swap in PagerDuty and notify the engineering lead.

---

## 3. Incident response framework

### Incident lifecycle

```
DETECT --> TRIAGE --> STABILIZE --> RESOLVE --> REVIEW
```

### Phase 1 — Detect

- Automated alerts (CloudWatch alarms, GuardDuty findings, Health Dashboard events) page the on-call via PagerDuty.
- Engineers or customers may also report issues via Slack or support channels.
- The on-call engineer acknowledges the alert within the SLA for the assigned severity.

### Phase 2 — Triage

1. Assess the impact: which services, which customers, what data is affected.
2. Assign a severity level using the definitions in section 1.
3. For SEV-1 and SEV-2: open an incident thread in `#incidents` with the format:
   ```
   **Incident: [Brief title]**
   Severity: SEV-X
   Impact: [Who/what is affected]
   Status: Investigating
   Lead: [@on-call-engineer]
   ```
4. For SEV-1: page the incident commander and open the Zoom bridge.

### Phase 3 — Stabilize

1. Execute the relevant runbook procedure from section 6.
2. Prioritize restoring service over root-cause analysis.
3. Post status updates in the incident thread every **15 minutes** (SEV-1) or **30 minutes** (SEV-2).
4. If customer-facing: update StatusPage with a brief description and estimated resolution time.

### Phase 4 — Resolve

1. Confirm service is restored by verifying health checks, dashboards, and SLO metrics.
2. Update the incident thread with resolution details.
3. Update StatusPage to "Resolved."
4. Stand down the incident team.

### Phase 5 — Post-incident review

- **SEV-1:** Blameless post-incident review (PIR) within 48 hours. Written report with timeline, root cause, contributing factors, and action items. Published to `docs/pir/`.
- **SEV-2:** Lightweight PIR within 5 business days. Written summary with action items.
- **SEV-3:** Action items captured in the team backlog; no formal PIR unless recurring.
- All action items are tracked in the project tracker with owners and due dates.

---

## 4. Monitoring and alerting

### CloudWatch dashboards

| Dashboard | Contents | Audience |
|-----------|----------|----------|
| `causeway-platform-overview` | ALB request rate, error rate, p50/p95/p99 latency, ECS task count, Aurora connections | On-call, engineering leads |
| `causeway-ecs-services` | Per-service CPU, memory, task health, deployment status | Service owners, on-call |
| `causeway-aurora` | Read/write latency, connections, replication lag, IOPS, freeable memory | DBA, on-call |
| `causeway-security` | WAF blocked requests, GuardDuty finding count, failed auth attempts | Security team |
| `causeway-costs` | Daily spend by service, anomaly detection | Engineering leads, finance |

### Key alarms

| Alarm | Metric | Threshold | Period | Severity |
|-------|--------|-----------|--------|----------|
| `ecs-task-crash-loop` | ECS RunningTaskCount < DesiredCount | >2 consecutive checks | 1 min | SEV-2 |
| `alb-5xx-rate` | ALB HTTPCode_Target_5XX_Count / RequestCount | >5% | 5 min | SEV-2 |
| `alb-5xx-critical` | ALB HTTPCode_Target_5XX_Count / RequestCount | >25% | 1 min | SEV-1 |
| `aurora-replication-lag` | AuroraReplicaLag | >5 seconds | 1 min | SEV-2 |
| `aurora-cpu-high` | CPUUtilization on Aurora | >80% | 5 min | SEV-3 |
| `aurora-connections-high` | DatabaseConnections | >80% of max | 5 min | SEV-2 |
| `aurora-freeable-memory-low` | FreeableMemory | <1 GB | 5 min | SEV-2 |
| `dynamodb-throttle` | ThrottledRequests on DynamoDB | >0 sustained | 5 min | SEV-3 |
| `waf-rate-limit-spike` | WAF BlockedRequests | >1000/min | 1 min | SEV-3 |
| `certificate-expiry` | `days_to_expiry` custom metric | <30 days | 24 hours | SEV-3 |
| `certificate-expiry-critical` | `days_to_expiry` custom metric | <7 days | 6 hours | SEV-1 |
| `guardduty-high-severity` | GuardDuty finding severity | HIGH or CRITICAL | Immediate | SEV-1 |
| `health-dashboard-event` | AWS Health region event | Any | Immediate | SEV-2 |

### Log retention

| Log group | Retention | Archive |
|-----------|-----------|---------|
| `/ecs/causeway/*` | 90 days in CloudWatch | Archived to S3 Glacier after 90 days, retained 7 years |
| `/aurora/causeway/*` | 90 days in CloudWatch | Archived to S3 Glacier after 90 days, retained 7 years |
| CloudTrail | 90 days in CloudWatch | S3 with integrity validation, retained 7 years |
| WAF logs | 90 days in CloudWatch | S3, retained 3 years |
| VPC Flow Logs | 90 days in CloudWatch | S3, retained 1 year |

---

## 5. Change management

### Change categories

| Category | Definition | Approval required | Lead time |
|----------|-----------|-------------------|-----------|
| **Standard** | Pre-approved, low-risk, repeatable changes (dependency updates, config tuning within tested bounds) | Peer review via PR | None beyond CI/CD pipeline |
| **Normal** | Changes to infrastructure, new features, database schema changes, IAM policy changes | Peer review + platform engineering lead approval | 1 business day |
| **Emergency** | Changes required to restore service during an active incident | On-call engineer + verbal approval from engineering lead (documented retroactively) | Immediate |

### Change process

1. **Propose:** Author creates a pull request with:
   - Description of the change and its purpose.
   - Risk assessment (what could go wrong).
   - Rollback plan (specific steps to revert).
   - Test evidence (CI results, staging validation).
2. **Review:** At least one peer review. Normal/emergency changes also require platform engineering lead approval.
3. **Approve:** Reviewer approves the PR. For Normal changes, the platform engineering lead provides explicit sign-off.
4. **Deploy:** CI/CD pipeline deploys to staging, runs automated tests, then deploys to production with a manual approval gate.
5. **Verify:** Deployer monitors dashboards for 15 minutes post-deploy. Confirms health checks pass and SLO metrics are stable.
6. **Close:** PR is merged. Deployment is recorded in the change log.

### Maintenance windows

- **Preferred window:** Tuesday through Thursday, 06:00-08:00 UTC (before UK business hours).
- **Blackout periods:** Month-end processing (last 2 business days of each month), regulatory reporting deadlines, any period declared by the incident commander.
- Emergency changes may be deployed outside the maintenance window with appropriate approval.

### Rollback policy

- Every production deployment must have an automated or documented rollback path.
- ECS deployments use the `--deployment-configuration` rollback feature or explicit redeployment of the previous task definition.
- Infrastructure changes via Terraform must be revertable by applying the previous state or running `terraform apply` with the reverted code.
- Database migrations must include a down migration or a documented manual reversal procedure.
- If a rollback is required, it must be executed within 15 minutes of detecting the issue.

---

## 6. Runbook procedures

---

### 6.1 ECS container crash loop

#### When to trigger

- CloudWatch alarm `ecs-task-crash-loop` fires: `RunningTaskCount` < `DesiredCount` for 2+ consecutive 1-minute evaluations.
- PagerDuty alert: "ECS tasks failing to start" or "ECS task stopped unexpectedly."
- Manual observation: tasks cycling between PENDING, RUNNING, and STOPPED in rapid succession.

#### Severity

- SEV-2 if the service is degraded but partially available (some tasks still running).
- Escalate to SEV-1 if `RunningTaskCount` = 0 for a Tier 1 service.

#### Prerequisites and tools

- AWS CLI v2 configured with production account credentials.
- Access to the ECS console in eu-west-1.
- Access to CloudWatch Logs for the service's log group (`/ecs/causeway/<service-name>`).
- Access to the ECR repository to inspect container images.
- `jq` installed for CLI output parsing.

#### Procedure

**Step 1 — Identify the affected service and cluster.**

```bash
# List services with tasks in an unstable state
aws ecs list-services \
  --cluster causeway-prod \
  --region eu-west-1 \
  --output json | jq -r '.serviceArns[]'

# Describe the specific service to see running vs desired count
aws ecs describe-services \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1 \
  --output json | jq '.services[] | {serviceName, runningCount, desiredCount, deployments}'
```

**Step 2 — Examine stopped task reasons.**

```bash
# List recently stopped tasks
aws ecs list-tasks \
  --cluster causeway-prod \
  --service-name <service-name> \
  --desired-status STOPPED \
  --region eu-west-1 \
  --output json | jq -r '.taskArns[]'

# Describe stopped tasks to find the stop reason
aws ecs describe-tasks \
  --cluster causeway-prod \
  --tasks <task-arn-1> <task-arn-2> \
  --region eu-west-1 \
  --output json | jq '.tasks[] | {taskArn, stoppedReason, stopCode, containers: [.containers[] | {name, exitCode, reason}]}'
```

Common stop reasons:
- `Essential container in task exited` — application crash. Check application logs.
- `CannotPullContainerError` — ECR image pull failure. Check image URI and IAM permissions.
- `ResourceNotFoundException` — task definition references deleted resources.
- `OutOfMemoryError` — container exceeded its memory limit.
- Health check failure — ALB health check returned unhealthy, ECS stopped the task.

**Step 3 — Check application logs.**

```bash
# Retrieve the last 100 log events from the task's log stream
aws logs get-log-events \
  --log-group-name /ecs/causeway/<service-name> \
  --log-stream-name "ecs/causeway-<service-name>/<task-id>" \
  --limit 100 \
  --region eu-west-1 \
  --output json | jq -r '.events[] | .message'

# If the exact stream name is unknown, find recent streams
aws logs describe-log-streams \
  --log-group-name /ecs/causeway/<service-name> \
  --order-by LastEventTime \
  --descending \
  --limit 5 \
  --region eu-west-1 \
  --output json | jq -r '.logStreams[] | {logStreamName, lastEventTimestamp}'
```

**Step 4 — Diagnose by failure type.**

*If OutOfMemoryError:*
```bash
# Check the current task definition memory limits
aws ecs describe-task-definition \
  --task-definition <task-def-family> \
  --region eu-west-1 \
  --output json | jq '.taskDefinition.containerDefinitions[] | {name, memory, memoryReservation, cpu}'

# Increase memory by registering an updated task definition
# (Prepare the updated JSON and register — see Step 5 for rollback alternative)
```

*If CannotPullContainerError:*
```bash
# Verify the image exists in ECR
aws ecr describe-images \
  --repository-name causeway/<service-name> \
  --image-ids imageTag=<expected-tag> \
  --region eu-west-1

# Verify the task execution role has ECR pull permissions
aws iam get-role-policy \
  --role-name <task-execution-role> \
  --policy-name <ecr-policy-name>
```

*If health check failure:*
```bash
# Check ALB target group health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region eu-west-1 \
  --output json | jq '.TargetHealthDescriptions[] | {target: .Target.Id, health: .TargetHealth}'
```

**Step 5 — Restore service (rollback to previous task definition).**

```bash
# List recent task definition revisions
aws ecs list-task-definitions \
  --family-prefix causeway-<service-name> \
  --sort DESC \
  --max-items 5 \
  --region eu-west-1 \
  --output json | jq -r '.taskDefinitionArns[]'

# Update the service to use the last known good task definition
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --task-definition causeway-<service-name>:<previous-revision> \
  --region eu-west-1

# Force a new deployment to replace all running tasks
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --force-new-deployment \
  --region eu-west-1
```

**Step 6 — Monitor recovery.**

```bash
# Watch the deployment until it stabilizes
aws ecs wait services-stable \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1

# Confirm running count matches desired count
aws ecs describe-services \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1 \
  --output json | jq '.services[] | {runningCount, desiredCount, deployments}'
```

#### Verification

- [ ] `RunningTaskCount` equals `DesiredCount` and has been stable for at least 5 minutes.
- [ ] ALB target group shows all targets as "healthy."
- [ ] CloudWatch alarm `ecs-task-crash-loop` returns to OK state.
- [ ] Application logs show no new errors or exceptions.
- [ ] Dashboard latency and error rate metrics have returned to baseline.

#### Escalation criteria

- Escalate to SEV-1 if running task count remains 0 for a Tier 1 service after 5 minutes.
- Escalate to the engineering lead if the root cause is not in the application code (e.g., AWS service issue, networking problem).
- Escalate to the security on-call if the crash is caused by unexpected process behavior or unknown binaries.

#### Post-incident actions

1. Identify the root cause (bad deployment, dependency failure, resource exhaustion, configuration error).
2. If caused by a deployment, determine why CI/CD checks did not catch the issue. Add regression tests.
3. If caused by resource exhaustion, review and update task definition CPU/memory limits.
4. If health check thresholds are too aggressive, tune the health check configuration.
5. Update this runbook if the failure mode was not covered.
6. File a PIR if severity was SEV-1 or SEV-2.

---

### 6.2 Aurora database failover

#### When to trigger

- CloudWatch alarm: Aurora cluster event `failover` detected.
- CloudWatch alarm: `aurora-replication-lag` sustained above 5 seconds.
- AWS RDS event notification: `RDS-EVENT-0049` (Multi-AZ failover started), `RDS-EVENT-0050` (Multi-AZ failover complete).
- Manual observation: write queries failing, connection timeouts to the writer endpoint.
- Planned failover for maintenance or AZ evacuation.

#### Severity

- SEV-1 if failover is unplanned and Tier 1 services are affected.
- SEV-2 if failover is planned or only Tier 2/3 services are affected.

#### Prerequisites and tools

- AWS CLI v2 with production RDS access.
- Aurora cluster identifier: `causeway-prod-cluster` (eu-west-1).
- Application connection strings must use the Aurora cluster endpoint (not individual instance endpoints) for automatic failover.
- Database credentials available in AWS Secrets Manager: `causeway/prod/aurora/master`.

#### Procedure — Unplanned failover (automatic)

Aurora Multi-AZ performs automatic failover. The on-call engineer's role is to monitor and verify.

**Step 1 — Confirm failover is occurring or has occurred.**

```bash
# Check recent RDS events for the cluster
aws rds describe-events \
  --source-identifier causeway-prod-cluster \
  --source-type db-cluster \
  --duration 60 \
  --region eu-west-1 \
  --output json | jq '.Events[] | {date: .Date, message: .Message}'

# Identify the current writer instance
aws rds describe-db-clusters \
  --db-cluster-identifier causeway-prod-cluster \
  --region eu-west-1 \
  --output json | jq '.DBClusters[] | {status: .Status, members: [.DBClusterMembers[] | {id: .DBInstanceIdentifier, isWriter: .IsClusterWriter}]}'
```

**Step 2 — Verify application connectivity.**

```bash
# Check that the cluster endpoint resolves to the new writer
dig +short causeway-prod-cluster.cluster-xxxxxxxxxxxx.eu-west-1.rds.amazonaws.com

# Verify from inside the VPC (run on a bastion or ECS exec session)
aws ecs execute-command \
  --cluster causeway-prod \
  --task <running-task-arn> \
  --container <container-name> \
  --interactive \
  --command "/bin/sh -c 'pg_isready -h \$DB_HOST -p 5432'"
```

**Step 3 — Check for connection pool issues.**

Applications using connection pools may hold stale connections to the old writer.

```bash
# Check ECS service logs for connection errors
aws logs filter-log-events \
  --log-group-name /ecs/causeway/<service-name> \
  --filter-pattern "\"connection refused\" OR \"connection reset\" OR \"FATAL\" OR \"could not connect\"" \
  --start-time $(date -d '10 minutes ago' +%s000) \
  --region eu-west-1 \
  --output json | jq -r '.events[] | .message'
```

If applications are failing to reconnect, force a rolling restart:

```bash
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --force-new-deployment \
  --region eu-west-1
```

**Step 4 — Verify replication is healthy.**

```bash
# Check replica lag on all reader instances
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name AuroraReplicaLag \
  --dimensions Name=DBClusterIdentifier,Value=causeway-prod-cluster \
  --start-time $(date -u -d '15 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average Maximum \
  --region eu-west-1 \
  --output json | jq '.Datapoints | sort_by(.Timestamp) | .[-5:]'
```

#### Procedure — Planned failover

**Step 1 — Announce the maintenance window.**

Post in `#platform-status`:
```
Planned Aurora failover for maintenance at [TIME UTC]. Expected impact:
brief (10-30 second) connection interruption. Tier 1 services will
automatically reconnect.
```

**Step 2 — Initiate failover.**

```bash
# Failover to a specific reader instance (optional)
aws rds failover-db-cluster \
  --db-cluster-identifier causeway-prod-cluster \
  --target-db-instance-identifier causeway-prod-cluster-reader-1 \
  --region eu-west-1

# Or failover without specifying a target (Aurora chooses)
aws rds failover-db-cluster \
  --db-cluster-identifier causeway-prod-cluster \
  --region eu-west-1
```

**Step 3 — Monitor until complete.**

```bash
# Wait for the cluster to return to available status
aws rds wait db-cluster-available \
  --db-cluster-identifier causeway-prod-cluster \
  --region eu-west-1

# Confirm the new writer
aws rds describe-db-clusters \
  --db-cluster-identifier causeway-prod-cluster \
  --region eu-west-1 \
  --output json | jq '.DBClusters[].DBClusterMembers[] | select(.IsClusterWriter==true) | .DBInstanceIdentifier'
```

Then continue with Steps 2-4 from the unplanned procedure above.

#### Verification

- [ ] Aurora cluster status is "available."
- [ ] Writer instance is correctly identified and accepting connections.
- [ ] Replica lag is below 100 ms.
- [ ] All ECS services connected to Aurora show healthy targets in the ALB.
- [ ] Application error rate has returned to baseline within 5 minutes.
- [ ] No data integrity issues (spot-check recent transactions).
- [ ] Cross-region replica (eu-west-2) replication lag is within acceptable bounds.

#### Escalation criteria

- Escalate to SEV-1 if failover does not complete within 5 minutes.
- Escalate to the DBA or AWS Support if the cluster enters a degraded or incompatible state.
- Escalate to the security on-call if the failover was caused by unauthorized activity.
- Open an AWS Support case (Business Critical) if the failover appears to be caused by an AWS infrastructure issue.

#### Post-incident actions

1. Determine the cause of the unplanned failover (AZ issue, instance failure, storage issue, manual error).
2. Review Aurora event logs and CloudTrail for any triggering actions.
3. Confirm cross-region replica in eu-west-2 has caught up and is healthy.
4. Verify that connection pool configurations across all services are tuned for fast reconnection (connection timeout, validation query, max lifetime).
5. If connection pool issues caused prolonged impact, update application connection pool settings and add regression tests.
6. File a PIR if the incident was SEV-1.

---

### 6.3 TLS certificate approaching expiry

#### When to trigger

- CloudWatch alarm `certificate-expiry` fires: custom metric `days_to_expiry` < 30 days (SEV-3 warning).
- CloudWatch alarm `certificate-expiry-critical` fires: `days_to_expiry` < 7 days (SEV-1 critical).
- AWS Config rule `acm-certificate-expiration-check` flags non-compliant certificates.
- Manual review during monthly operational checks.

#### Severity

- SEV-3 if >7 days remain (warning — schedule renewal).
- SEV-1 if <=7 days remain (critical — immediate action required).
- SEV-1 if a certificate has already expired and is causing service disruption.

#### Prerequisites and tools

- AWS CLI v2 with ACM access in the relevant regions.
- ACM certificates are used for ALB and CloudFront. CloudFront certificates must be in **us-east-1**.
- For ACM-managed certificates (DNS validation): Route 53 hosted zone access.
- For imported certificates: access to the private key, certificate, and CA chain from the certificate authority.

#### Procedure

**Step 1 — Identify expiring certificates.**

```bash
# List all certificates and their expiry dates in eu-west-1 (ALB)
aws acm list-certificates \
  --region eu-west-1 \
  --output json | jq -r '.CertificateSummaryList[] | {domain: .DomainName, arn: .CertificateArn}' | while read -r cert; do
  arn=$(echo "$cert" | jq -r '.arn')
  aws acm describe-certificate --certificate-arn "$arn" --region eu-west-1 \
    --output json | jq '{domain: .Certificate.DomainName, expiry: .Certificate.NotAfter, status: .Certificate.Status, renewalStatus: .Certificate.RenewalSummary.RenewalStatus}'
done

# List certificates in us-east-1 (CloudFront)
aws acm list-certificates \
  --region us-east-1 \
  --output json | jq -r '.CertificateSummaryList[] | {domain: .DomainName, arn: .CertificateArn}' | while read -r cert; do
  arn=$(echo "$cert" | jq -r '.arn')
  aws acm describe-certificate --certificate-arn "$arn" --region us-east-1 \
    --output json | jq '{domain: .Certificate.DomainName, expiry: .Certificate.NotAfter, status: .Certificate.Status, renewalStatus: .Certificate.RenewalSummary.RenewalStatus}'
done
```

**Step 2 — Determine renewal method.**

*ACM-issued certificates with DNS validation (preferred):*

ACM automatically renews these certificates if the CNAME validation records exist in DNS. If renewal is failing:

```bash
# Check the renewal status and any failure reasons
aws acm describe-certificate \
  --certificate-arn <certificate-arn> \
  --region <region> \
  --output json | jq '.Certificate.RenewalSummary'

# Verify that DNS validation records exist
aws acm describe-certificate \
  --certificate-arn <certificate-arn> \
  --region <region> \
  --output json | jq '.Certificate.DomainValidationOptions[] | {domain: .DomainName, validationStatus: .ValidationStatus, resourceRecord: .ResourceRecord}'

# If validation records are missing, add them to Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id <hosted-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "<CNAME_name_from_above>",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "<CNAME_value_from_above>"}]
      }
    }]
  }'
```

*Imported certificates:*

```bash
# Re-import the renewed certificate
aws acm import-certificate \
  --certificate-arn <existing-certificate-arn> \
  --certificate fileb://cert.pem \
  --private-key fileb://privkey.pem \
  --certificate-chain fileb://chain.pem \
  --region <region>
```

**Step 3 — If automatic renewal fails and the certificate is ACM-issued, request a new one.**

```bash
# Request a new certificate
aws acm request-certificate \
  --domain-name "*.causeway.example.com" \
  --subject-alternative-names "causeway.example.com" \
  --validation-method DNS \
  --region <region> \
  --output json | jq '.CertificateArn'

# Wait for the CNAME validation record requirement
aws acm describe-certificate \
  --certificate-arn <new-certificate-arn> \
  --region <region> \
  --output json | jq '.Certificate.DomainValidationOptions'

# Add the validation CNAME to Route 53 (as in Step 2)
# Wait for validation to complete
aws acm wait certificate-validated \
  --certificate-arn <new-certificate-arn> \
  --region <region>
```

**Step 4 — Associate the new certificate with the load balancer or CloudFront.**

For ALB:
```bash
# Find the HTTPS listener
aws elbv2 describe-listeners \
  --load-balancer-arn <alb-arn> \
  --region eu-west-1 \
  --output json | jq '.Listeners[] | select(.Protocol=="HTTPS") | {listenerArn: .ListenerArn, certificates: .Certificates}'

# Update the listener to use the new certificate
aws elbv2 modify-listener \
  --listener-arn <listener-arn> \
  --certificates CertificateArn=<new-certificate-arn> \
  --region eu-west-1
```

For CloudFront:
```bash
# Update the CloudFront distribution
aws cloudfront get-distribution-config \
  --id <distribution-id> \
  --output json > /tmp/cf-config.json

# Edit /tmp/cf-config.json to update ViewerCertificate.ACMCertificateArn
# Then update the distribution:
aws cloudfront update-distribution \
  --id <distribution-id> \
  --if-match <etag-from-get> \
  --distribution-config file:///tmp/cf-config-updated.json
```

#### Verification

- [ ] `aws acm describe-certificate` shows "ISSUED" status and a future expiry date.
- [ ] HTTPS requests to the application succeed without certificate warnings.
- [ ] `openssl s_client -connect <domain>:443 -servername <domain>` confirms the new certificate is served.
- [ ] CloudWatch alarm `certificate-expiry` returns to OK state.
- [ ] CloudFront distribution status returns to "Deployed" (if updated).

#### Escalation criteria

- Escalate to SEV-1 if a certificate has expired and users are seeing browser warnings or connection failures.
- Escalate to the security team if certificate validation is failing for unknown reasons (potential DNS hijacking or compromise).
- Escalate to the domain registrar or CA if domain validation cannot be completed.

#### Post-incident actions

1. Determine why automatic renewal failed (missing DNS records, changed domain ownership, ACM service issue).
2. Implement monitoring for the DNS validation CNAME records themselves (ensure they are not accidentally deleted).
3. Add a monthly operational check for certificates expiring within 60 days.
4. Update Terraform/IaC to ensure new certificates are provisioned correctly.
5. If an imported certificate was involved, evaluate migrating to ACM-issued certificates for automatic renewal.

---

### 6.4 AWS region degradation

#### When to trigger

- AWS Health Dashboard event for eu-west-1 affecting any service in the platform stack (ECS, RDS, ALB, DynamoDB, S3, CloudFront).
- Route 53 health checks for the eu-west-1 endpoints fail for 3+ consecutive intervals (3 minutes).
- Multiple unrelated CloudWatch alarms fire simultaneously in eu-west-1.
- External monitoring (synthetic checks) report failures from eu-west-1 endpoints.

#### Severity

- SEV-1 for any region degradation affecting Tier 1 services.
- SEV-2 if only Tier 2/3 services are affected and Tier 1 remains operational.

#### Prerequisites and tools

- AWS CLI v2 configured for both eu-west-1 and eu-west-2.
- Route 53 hosted zone with health checks and failover routing configured.
- DR infrastructure pre-provisioned per ADR-0003:
  - **Tier 1:** Warm standby in eu-west-2 (ECS at minimum scale, Aurora cross-region replica, DynamoDB global tables).
  - **Tier 2:** Pilot light in eu-west-2 (infrastructure defined, not running).
  - **Tier 3:** Backup and restore.
- Terraform workspaces for eu-west-2 infrastructure.
- Runbook authority: the incident commander must approve the failover decision.

#### Procedure — Assessment

**Step 1 — Confirm the scope of the AWS issue.**

```bash
# Check AWS Health Dashboard events
aws health describe-events \
  --filter "regions=eu-west-1,eventStatusCodes=open,upcoming" \
  --region us-east-1 \
  --output json | jq '.events[] | {service: .service, statusCode: .statusCode, description: .eventTypeCode, startTime: .startTime}'

# Note: AWS Health API must be called from us-east-1

# Check Route 53 health check status for primary endpoints
aws route53 get-health-check-status \
  --health-check-id <primary-health-check-id> \
  --output json | jq '.HealthCheckObservations[] | {region: .Region, status: .StatusReport.Status}'
```

**Step 2 — Assess impact on platform services.**

```bash
# Check ECS services in eu-west-1
aws ecs describe-services \
  --cluster causeway-prod \
  --services $(aws ecs list-services --cluster causeway-prod --region eu-west-1 --output text --query 'serviceArns[*]') \
  --region eu-west-1 \
  --output json | jq '.services[] | {name: .serviceName, running: .runningCount, desired: .desiredCount, status: .status}'

# Check Aurora cluster status
aws rds describe-db-clusters \
  --db-cluster-identifier causeway-prod-cluster \
  --region eu-west-1 \
  --output json | jq '.DBClusters[] | {status: .Status, availabilityZones: .AvailabilityZones}'

# Check ALB health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region eu-west-1 \
  --output json | jq '.TargetHealthDescriptions[] | {id: .Target.Id, health: .TargetHealth.State}'
```

**Step 3 — Determine if failover is necessary.**

Decision criteria:
- AWS Health confirms a region-level incident AND recovery time is unknown or exceeds RTO.
- Primary services are unreachable and not recovering after 5 minutes.
- On-call engineer and incident commander agree to proceed.

**If failover is NOT needed** (isolated AZ issue, transient degradation): monitor and document. AWS AZ-level issues are handled by Multi-AZ configurations automatically.

#### Procedure — Tier 1 failover to eu-west-2

**Step 4 — Scale up ECS services in eu-west-2.**

```bash
# Scale Tier 1 services to full production capacity in DR
aws ecs update-service \
  --cluster causeway-dr \
  --service payment-processing-api \
  --desired-count <production-count> \
  --region eu-west-2

aws ecs update-service \
  --cluster causeway-dr \
  --service account-management \
  --desired-count <production-count> \
  --region eu-west-2

aws ecs update-service \
  --cluster causeway-dr \
  --service authentication \
  --desired-count <production-count> \
  --region eu-west-2

# Wait for services to stabilize
aws ecs wait services-stable \
  --cluster causeway-dr \
  --services payment-processing-api account-management authentication \
  --region eu-west-2
```

**Step 5 — Promote Aurora cross-region replica in eu-west-2.**

```bash
# Check DR replica status
aws rds describe-db-clusters \
  --db-cluster-identifier causeway-dr-cluster \
  --region eu-west-2 \
  --output json | jq '.DBClusters[] | {status: .Status, replicationSourceIdentifier: .ReplicationSourceIdentifier}'

# Promote the DR cluster to a standalone writer
# WARNING: This breaks replication from eu-west-1. This action cannot be undone.
aws rds promote-read-replica-db-cluster \
  --db-cluster-identifier causeway-dr-cluster \
  --region eu-west-2

# Wait for promotion to complete
aws rds wait db-cluster-available \
  --db-cluster-identifier causeway-dr-cluster \
  --region eu-west-2

# Verify the cluster is now a writer
aws rds describe-db-clusters \
  --db-cluster-identifier causeway-dr-cluster \
  --region eu-west-2 \
  --output json | jq '.DBClusters[] | {status: .Status, engineMode: .EngineMode, replicationSourceIdentifier: .ReplicationSourceIdentifier}'
```

**Step 6 — Verify DynamoDB global tables are active in eu-west-2.**

```bash
# DynamoDB global tables replicate automatically. Verify the table is accessible.
aws dynamodb describe-table \
  --table-name causeway-sessions \
  --region eu-west-2 \
  --output json | jq '{status: .Table.TableStatus, itemCount: .Table.ItemCount}'
```

**Step 7 — Update Route 53 to direct traffic to eu-west-2.**

```bash
# If using failover routing, Route 53 will switch automatically when the
# primary health check fails. Verify the DNS resolution:
dig +short causeway-api.example.com

# If manual DNS update is needed:
aws route53 change-resource-record-sets \
  --hosted-zone-id <hosted-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "causeway-api.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<eu-west-2-alb-hosted-zone-id>",
          "DNSName": "<eu-west-2-alb-dns-name>",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# Update CloudFront origin to point to eu-west-2 ALB if needed
aws cloudfront get-distribution-config --id <distribution-id> > /tmp/cf-config.json
# Edit origin domain name to eu-west-2 ALB, then:
aws cloudfront update-distribution \
  --id <distribution-id> \
  --if-match <etag> \
  --distribution-config file:///tmp/cf-config-updated.json
```

**Step 8 — Verify DR is serving traffic.**

```bash
# Test the API endpoint
curl -s -o /dev/null -w "%{http_code}" https://causeway-api.example.com/health

# Check ALB in eu-west-2
aws elbv2 describe-target-health \
  --target-group-arn <eu-west-2-target-group-arn> \
  --region eu-west-2 \
  --output json | jq '.TargetHealthDescriptions[] | {id: .Target.Id, health: .TargetHealth.State}'
```

#### Procedure — Tier 2 failover (pilot light)

```bash
# Start ECS services in eu-west-2 (they are defined but have 0 tasks)
aws ecs update-service \
  --cluster causeway-dr \
  --service <tier-2-service-name> \
  --desired-count <production-count> \
  --region eu-west-2

# Promote Aurora replica (same as Tier 1 Step 5) or restore from snapshot
# Update DNS records for the Tier 2 service endpoints
```

#### Procedure — Failback to eu-west-1

Only perform failback when eu-west-1 is confirmed healthy for at least 30 minutes.

1. Re-establish Aurora replication from eu-west-2 back to eu-west-1 by creating a new cross-region replica.
2. Wait for the replica to catch up (replication lag < 100 ms).
3. Verify data consistency: compare row counts and checksums on critical tables between regions.
4. During a maintenance window:
   a. Reduce write traffic (enable maintenance mode if possible).
   b. Promote the eu-west-1 replica to writer.
   c. Update Route 53 / CloudFront to point back to eu-west-1.
   d. Scale down eu-west-2 to standby levels.
5. Monitor for 30 minutes after failback.
6. Re-establish eu-west-2 cross-region replica for future DR.

#### Verification

- [ ] All Tier 1 services are healthy in the DR region with full task count.
- [ ] Aurora writer is active in eu-west-2 and accepting reads and writes.
- [ ] DynamoDB tables are accessible in eu-west-2.
- [ ] DNS resolves to eu-west-2 endpoints.
- [ ] End-to-end health checks pass from external monitoring.
- [ ] Customer-facing functionality verified (login, transaction, account query).
- [ ] StatusPage updated with DR status.

#### Escalation criteria

- Escalate to the CTO if a failover decision is needed and the incident commander is unavailable.
- Open an AWS Premium Support case (Severity: Critical — System Impaired) immediately.
- Notify regulators per the regulatory notification procedure if service disruption exceeds RTO thresholds.

#### Post-incident actions

1. Write a detailed PIR covering the timeline, failover execution, and any data loss.
2. Quantify actual RPO (compare the last committed transaction in eu-west-1 vs. what was available in eu-west-2).
3. Plan and execute failback per the failback procedure above.
4. Review and update the DR runbook based on lessons learned.
5. Schedule a DR drill within 30 days to validate any procedure changes.
6. Confirm that both regions are fully operational and replication is re-established.

---

### 6.5 Suspected data breach response

#### When to trigger

- GuardDuty finding with severity HIGH or CRITICAL (e.g., `UnauthorizedAccess`, `Exfiltration`, `CryptoCurrency`).
- CloudTrail anomaly: unusual API calls, bulk data access, or access from unexpected IP addresses or regions.
- WAF logs showing successful bypass of security rules followed by data access.
- Report from internal staff, customers, or third parties about unauthorized data access.
- AWS Access Analyzer finding: resource policy allows public or cross-account access unexpectedly.

#### Severity

- Always **SEV-1**. Data breaches in financial services have regulatory implications.

#### Prerequisites and tools

- AWS CLI v2 with security account and production account access.
- GuardDuty console access.
- CloudTrail log access (both CloudWatch and S3 archive).
- VPC Flow Logs access.
- Incident response communication plan (legal, compliance, executive contacts).
- Forensic investigation tools: AWS CloudTrail Lake, Athena for S3 log queries.
- Ability to modify security groups, NACLs, and IAM policies.

**CRITICAL:** Preserve evidence. Do not terminate instances or delete resources until forensic evidence is captured.

#### Procedure

**Step 1 — Activate the security incident response team.**

1. Page the security on-call via PagerDuty.
2. Page the incident commander.
3. Open a private incident channel (not `#incidents`): `#incident-sec-YYYY-MM-DD`.
4. Limit access to the channel to security team, incident commander, and engineering lead.
5. Do NOT discuss specifics of a potential breach in public channels.

**Step 2 — Assess and scope the breach.**

```bash
# Review GuardDuty findings
aws guardduty list-findings \
  --detector-id <detector-id> \
  --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}' \
  --sort-criteria '{"AttributeName":"severity","OrderBy":"DESC"}' \
  --region eu-west-1 \
  --output json

aws guardduty get-findings \
  --detector-id <detector-id> \
  --finding-ids <finding-id-1> <finding-id-2> \
  --region eu-west-1 \
  --output json | jq '.Findings[] | {type: .Type, severity: .Severity, resource: .Resource, action: .Service.Action}'

# Review CloudTrail for unusual API activity
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=GetObject \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --region eu-west-1 \
  --output json | jq '.Events[] | {time: .EventTime, user: .Username, event: .EventName, resources: .Resources}'

# Check for unusual IAM activity
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --region eu-west-1 \
  --output json | jq '.Events[] | {time: .EventTime, user: .Username, sourceIP: (.CloudTrailEvent | fromjson | .sourceIPAddress)}'
```

**Step 3 — Contain the breach.**

*Isolate compromised IAM credentials:*
```bash
# Identify the compromised principal
# Disable access keys if an IAM user is compromised
aws iam update-access-key \
  --user-name <compromised-user> \
  --access-key-id <key-id> \
  --status Inactive

# Attach a deny-all policy to the compromised role or user
aws iam put-user-policy \
  --user-name <compromised-user> \
  --policy-name DenyAll-IncidentResponse \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*"
    }]
  }'

# For compromised roles, add a deny-all inline policy
aws iam put-role-policy \
  --role-name <compromised-role> \
  --policy-name DenyAll-IncidentResponse \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*"
    }]
  }'
```

*Isolate compromised network resources:*
```bash
# Replace the security group of a compromised resource with an isolation group
# that allows no inbound/outbound traffic
aws ec2 create-security-group \
  --group-name incident-isolation \
  --description "Incident isolation - no traffic" \
  --vpc-id <vpc-id> \
  --region eu-west-1

# The isolation group has no ingress/egress rules by default.
# Remove the default egress rule:
aws ec2 revoke-security-group-egress \
  --group-id <isolation-sg-id> \
  --ip-permissions '[{"IpProtocol":"-1","FromPort":-1,"ToPort":-1,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]}]' \
  --region eu-west-1
```

*Block suspicious IP addresses at the WAF:*
```bash
# Add the IP to a WAF IP set for blocking
aws wafv2 update-ip-set \
  --name causeway-blocked-ips \
  --scope REGIONAL \
  --id <ip-set-id> \
  --lock-token <lock-token> \
  --addresses "<suspicious-ip>/32" \
  --region eu-west-1
```

**Step 4 — Preserve forensic evidence.**

```bash
# Export CloudTrail logs to a dedicated forensic S3 bucket
# (CloudTrail logs are already archived; ensure the forensic period is protected)

# Snapshot any affected Aurora instances
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier causeway-prod-cluster \
  --db-cluster-snapshot-identifier forensic-$(date +%Y%m%d-%H%M%S) \
  --region eu-west-1

# Export VPC Flow Logs for the affected period
# (Flow logs are already streaming to CloudWatch; create an export task)
aws logs create-export-task \
  --task-name "forensic-flow-logs-$(date +%Y%m%d)" \
  --log-group-name /vpc/causeway-prod-flow-logs \
  --from $(date -d '48 hours ago' +%s000) \
  --to $(date +%s000) \
  --destination causeway-forensic-evidence-bucket \
  --destination-prefix "incident-$(date +%Y%m%d)" \
  --region eu-west-1

# Save current IAM policies for compromised entities
aws iam get-role --role-name <compromised-role> > /tmp/forensic-role-$(date +%Y%m%d).json
aws iam list-role-policies --role-name <compromised-role> >> /tmp/forensic-role-$(date +%Y%m%d).json
aws iam list-attached-role-policies --role-name <compromised-role> >> /tmp/forensic-role-$(date +%Y%m%d).json
```

**Step 5 — Assess data exposure.**

1. Determine which data stores were accessed (Aurora, DynamoDB, S3).
2. Query CloudTrail and database audit logs to identify the exact records/objects accessed.
3. Classify the data per the data classification policy (PII, financial records, credentials).
4. Estimate the number of affected customers/records.

**Step 6 — Notify stakeholders.**

1. Notify the CISO and legal counsel immediately.
2. Prepare a breach impact assessment for regulatory notification (if required).
3. Regulatory notification timelines:
   - UK ICO (GDPR): within 72 hours of becoming aware of a personal data breach.
   - FCA: as soon as reasonably practicable.
4. Do NOT communicate externally until legal counsel has reviewed and approved the messaging.

#### Verification

- [ ] Compromised credentials are disabled or locked down.
- [ ] Suspicious IP addresses are blocked at the WAF and network layers.
- [ ] Forensic evidence (CloudTrail logs, database snapshots, flow logs) is preserved.
- [ ] All affected services are operational (containment did not cause an outage, or if it did, services are restored).
- [ ] GuardDuty findings are reviewed and no new high-severity findings are appearing.

#### Escalation criteria

- Always SEV-1 from the start.
- Escalate to the CTO and CEO immediately if customer financial data is confirmed exfiltrated.
- Engage external forensic investigators if the breach is complex or the internal team lacks capacity.
- Notify AWS Abuse team if the attack involves AWS infrastructure.

#### Post-incident actions

1. Conduct a full forensic investigation and produce a written report.
2. Perform a complete credential rotation for all potentially affected services (see procedure 6.8).
3. Review and harden IAM policies, security group rules, and WAF configurations.
4. File regulatory notifications within the required timeframes.
5. Prepare customer notification if personal data was exposed.
6. Conduct a tabletop exercise within 30 days covering the identified attack vector.
7. Implement additional detection controls for the attack pattern.
8. Update the incident response plan based on lessons learned.

---

### 6.6 DDoS attack mitigation

#### When to trigger

- CloudWatch alarm: ALB request rate exceeds 10x normal baseline sustained for 5+ minutes.
- CloudWatch alarm: WAF `BlockedRequests` exceeds 1000/minute.
- CloudFront metrics: origin request rate spikes abnormally.
- AWS Shield Advanced notification (if enabled).
- Customer reports of slow or unavailable service combined with elevated traffic metrics.
- GuardDuty finding: `Recon:EC2/Portscan` or network anomaly.

#### Severity

- SEV-1 if customer-facing services are degraded or unavailable.
- SEV-2 if the attack is being mitigated by existing controls and service is unaffected.

#### Prerequisites and tools

- AWS CLI v2 with WAF, CloudFront, and Shield access.
- AWS WAF WebACL ID and IP set IDs for the production environment.
- CloudFront distribution ID.
- AWS Shield Advanced is recommended for financial services (provides DDoS Response Team access).
- Rate limiting rules pre-configured in WAF.

#### Procedure

**Step 1 — Confirm the attack and assess scope.**

```bash
# Check WAF request metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/WAFV2 \
  --metric-name AllowedRequests \
  --dimensions Name=WebACL,Value=causeway-prod-waf Name=Region,Value=eu-west-1 Name=Rule,Value=ALL \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum \
  --region eu-west-1 \
  --output json | jq '.Datapoints | sort_by(.Timestamp)'

aws cloudwatch get-metric-statistics \
  --namespace AWS/WAFV2 \
  --metric-name BlockedRequests \
  --dimensions Name=WebACL,Value=causeway-prod-waf Name=Region,Value=eu-west-1 Name=Rule,Value=ALL \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum \
  --region eu-west-1 \
  --output json | jq '.Datapoints | sort_by(.Timestamp)'

# Check ALB connection and request counts
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=<alb-dimension-value> \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum \
  --region eu-west-1 \
  --output json | jq '.Datapoints | sort_by(.Timestamp)'
```

**Step 2 — Identify the attack pattern.**

```bash
# Sample WAF logs to identify top offending IPs and request patterns
# (WAF logs should be streaming to S3 or CloudWatch)
aws logs filter-log-events \
  --log-group-name aws-waf-logs-causeway-prod \
  --filter-pattern "{ $.action = \"BLOCK\" }" \
  --start-time $(date -d '15 minutes ago' +%s000) \
  --limit 100 \
  --region eu-west-1 \
  --output json | jq -r '.events[].message' | jq -s 'group_by(.httpRequest.clientIp) | map({ip: .[0].httpRequest.clientIp, count: length}) | sort_by(-.count) | .[:20]'

# For CloudFront access logs (if stored in S3), use Athena or manual analysis
# to identify top source IPs, user agents, and request paths
```

**Step 3 — Tighten WAF rate limiting.**

```bash
# Get the current WAF WebACL configuration
aws wafv2 get-web-acl \
  --name causeway-prod-waf \
  --scope REGIONAL \
  --id <web-acl-id> \
  --region eu-west-1 \
  --output json > /tmp/waf-config.json

# Update the rate-based rule to a lower threshold
# This requires updating the WebACL with the modified rule.
# Example: lower the rate limit from 2000 to 500 requests per 5 minutes per IP.
# Edit the rule in /tmp/waf-config.json, then:
aws wafv2 update-web-acl \
  --name causeway-prod-waf \
  --scope REGIONAL \
  --id <web-acl-id> \
  --lock-token <lock-token> \
  --default-action '{"Allow":{}}' \
  --rules file:///tmp/updated-rules.json \
  --visibility-config file:///tmp/visibility-config.json \
  --region eu-west-1
```

**Step 4 — Block offending IP ranges.**

```bash
# Get the current IP set
aws wafv2 get-ip-set \
  --name causeway-blocked-ips \
  --scope REGIONAL \
  --id <ip-set-id> \
  --region eu-west-1 \
  --output json | jq '{addresses: .IPSet.Addresses, lockToken: .LockToken}'

# Add offending IP ranges to the block list
aws wafv2 update-ip-set \
  --name causeway-blocked-ips \
  --scope REGIONAL \
  --id <ip-set-id> \
  --lock-token <lock-token> \
  --addresses "1.2.3.0/24" "5.6.7.0/24" \
  --region eu-west-1
```

**Step 5 — Enable geo-blocking if the attack originates from specific regions.**

```bash
# Add a geo-match rule to the WebACL to block traffic from
# countries not in the expected user base.
# This is done by updating the WebACL rules (see Step 3 pattern).
# Example: block all countries except GB, IE, and other expected origins.
```

**Step 6 — Scale up backend capacity if needed.**

```bash
# Increase ECS desired count to absorb legitimate traffic
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --desired-count <increased-count> \
  --region eu-west-1

# If using auto-scaling, verify the scaling policy is triggering
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/causeway-prod/<service-name> \
  --region eu-west-1 \
  --output json | jq '.ScalingActivities[:5]'
```

**Step 7 — Engage AWS Shield Response Team (if Shield Advanced is enabled).**

```bash
# Create a Shield support case
aws shield create-protection \
  --name "DDoS Incident $(date +%Y%m%d)" \
  --resource-arn <alb-arn> \
  --region us-east-1

# Contact AWS DDoS Response Team (DRT) via AWS Support
# Premium Support: open a critical severity case
aws support create-case \
  --subject "Active DDoS attack on Causeway Banking platform" \
  --service-code "shield" \
  --severity-code "critical" \
  --category-code "ddos-attack" \
  --communication-body "Active DDoS targeting ALB <arn>. Current request rate: Xrps. WAF blocking Y%. Service degradation observed." \
  --region us-east-1
```

#### Verification

- [ ] WAF `BlockedRequests` metrics show the attack traffic is being filtered.
- [ ] ALB request rate for legitimate traffic has returned to normal.
- [ ] Application latency and error rate have returned to baseline.
- [ ] No new attack patterns are bypassing the WAF rules.
- [ ] ECS services are healthy and scaled appropriately.
- [ ] Customer-facing service is responsive (verify with synthetic checks).

#### Escalation criteria

- Escalate to SEV-1 if the attack is bypassing WAF and affecting service availability.
- Escalate to the security on-call and incident commander immediately.
- Engage AWS Shield DRT if Shield Advanced is active and the attack persists.
- Escalate to the CTO if service is unavailable for more than 15 minutes despite mitigation.
- Notify law enforcement (via legal counsel) if the attack is sustained and causing significant financial impact.

#### Post-incident actions

1. Analyze the full attack: source IPs, geography, request patterns, duration, peak traffic.
2. Review and strengthen WAF rules based on the attack pattern.
3. If Shield Advanced was not enabled, evaluate adopting it.
4. Review rate-limiting thresholds and adjust for the service's actual traffic patterns.
5. Consider implementing CAPTCHA or challenge pages for suspicious traffic patterns.
6. Update the WAF IP blocklist and geo-restriction configuration.
7. Review CloudFront caching configuration to ensure static content is served from edge without hitting the origin.
8. Conduct a PIR and update this runbook.

---

### 6.7 Failed deployment rollback

#### When to trigger

- ECS deployment is stuck: new tasks are failing health checks and old tasks are being drained.
- CloudWatch alarm: `alb-5xx-rate` spikes during or immediately after a deployment.
- CI/CD pipeline reports deployment failure or timeout.
- Manual observation: canary checks fail after deployment, functional tests fail in production.
- ECS deployment circuit breaker triggers automatic rollback (if enabled).

#### Severity

- SEV-2 if service is degraded but partially available.
- SEV-1 if the failed deployment has caused a full outage of a Tier 1 service.

#### Prerequisites and tools

- AWS CLI v2 with ECS access.
- CI/CD pipeline access (to identify the failed build and previous successful build).
- ECS cluster: `causeway-prod` (eu-west-1).
- Previous task definition revision number or the known-good container image tag.
- Terraform state access if infrastructure changes are involved.

#### Procedure

**Step 1 — Confirm the deployment is the cause.**

```bash
# Check the current deployment status
aws ecs describe-services \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1 \
  --output json | jq '.services[] | {
    desiredCount,
    runningCount,
    deployments: [.deployments[] | {
      id: .id,
      status: .status,
      taskDefinition: .taskDefinition,
      runningCount: .runningCount,
      desiredCount: .desiredCount,
      rolloutState: .rolloutState,
      createdAt: .createdAt
    }]
  }'

# If there are multiple deployments listed, the new deployment is replacing the old one.
# If rolloutState is "IN_PROGRESS" and runningCount for the new deployment is 0,
# the new tasks are failing.

# Check the ALB target group for unhealthy targets
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region eu-west-1 \
  --output json | jq '.TargetHealthDescriptions[] | {id: .Target.Id, health: .TargetHealth.State, reason: .TargetHealth.Reason}'
```

**Step 2 — Identify the previous good task definition.**

```bash
# List recent task definition revisions
aws ecs list-task-definitions \
  --family-prefix causeway-<service-name> \
  --sort DESC \
  --max-items 5 \
  --region eu-west-1 \
  --output json | jq -r '.taskDefinitionArns[]'

# The current (failing) deployment uses the most recent revision.
# The previous revision is the rollback target.
# Verify which revision was running before the deployment:
aws ecs describe-services \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1 \
  --output json | jq '.services[].deployments[] | select(.status=="ACTIVE") | .taskDefinition'
```

**Step 3 — Execute the rollback.**

```bash
# Rollback by updating the service to the previous task definition
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --task-definition causeway-<service-name>:<previous-revision> \
  --force-new-deployment \
  --region eu-west-1 \
  --output json | jq '{serviceName: .service.serviceName, taskDefinition: .service.taskDefinition, desiredCount: .service.desiredCount}'

# Monitor the rollback deployment
watch -n 5 "aws ecs describe-services \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1 \
  --output json | jq '.services[] | {running: .runningCount, desired: .desiredCount, deployments: [.deployments[] | {status, runningCount, rolloutState}]}'"
```

**Step 4 — Wait for the rollback deployment to stabilize.**

```bash
aws ecs wait services-stable \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1
```

**Step 5 — If the ECS rollback does not work (e.g., infrastructure change is the problem):**

```bash
# Check if a Terraform/IaC change was applied
# Review the CI/CD pipeline logs for the failed deployment

# Revert the Terraform change by applying the previous commit
cd /path/to/infrastructure
git log --oneline -5
git revert <failing-commit> --no-edit

# Apply the reverted Terraform
terraform plan -var-file=prod.tfvars
# Review the plan carefully before applying
terraform apply -var-file=prod.tfvars -auto-approve
```

**Step 6 — If a database migration is involved:**

```bash
# Check if a database migration was run as part of the deployment
# If the migration needs to be rolled back:

# Option A: Run the down migration
# (From within an ECS exec session or a bastion)
aws ecs execute-command \
  --cluster causeway-prod \
  --task <running-task-arn> \
  --container <container-name> \
  --interactive \
  --command "/bin/sh -c 'npx migrate down'"

# Option B: Restore from an Aurora snapshot taken before the deployment
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier causeway-prod-cluster-restored \
  --snapshot-identifier <pre-deployment-snapshot> \
  --engine aurora-postgresql \
  --region eu-west-1
```

#### Verification

- [ ] Service is running the previous (known-good) task definition.
- [ ] `RunningTaskCount` equals `DesiredCount`.
- [ ] ALB target group shows all targets as "healthy."
- [ ] 5xx error rate has returned to baseline.
- [ ] Application latency is within SLO targets.
- [ ] Functional tests pass against the production endpoint.
- [ ] No active deployment in progress (single PRIMARY deployment shown).

#### Escalation criteria

- Escalate to SEV-1 if the rollback itself fails and the service remains unavailable.
- Escalate to the engineering lead if the failed deployment involved database schema changes that cannot be easily reverted.
- Escalate to the DBA if database restoration is required.
- Escalate to the platform engineering lead if infrastructure (Terraform) changes need to be reverted.

#### Post-incident actions

1. Determine why the deployment failed:
   - Application bug not caught by tests.
   - Infrastructure change that was incompatible.
   - Configuration error (wrong environment variables, missing secrets).
   - Database migration incompatibility.
2. Review CI/CD pipeline: were there tests that should have caught this?
3. Add or improve integration tests, staging validation, or canary deployment strategy.
4. Consider enabling ECS deployment circuit breaker if not already enabled:
   ```bash
   aws ecs update-service \
     --cluster causeway-prod \
     --service <service-name> \
     --deployment-configuration '{
       "deploymentCircuitBreaker": {"enable": true, "rollback": true},
       "maximumPercent": 200,
       "minimumHealthyPercent": 100
     }' \
     --region eu-west-1
   ```
5. Document the failure in the deployment log and update the change management process if needed.

---

### 6.8 Secrets rotation (scheduled and emergency)

#### When to trigger

**Scheduled rotation:**
- Secrets Manager automatic rotation interval reached (90 days for database credentials, 365 days for API keys, per policy).
- Monthly operational review identifies secrets approaching rotation due date.
- Compliance audit requires evidence of rotation.

**Emergency rotation:**
- Suspected or confirmed credential compromise (see procedure 6.5).
- Credential accidentally exposed (committed to source control, logged in plaintext, shared insecurely).
- Team member with access to secrets leaves the organization.
- GuardDuty or CloudTrail indicates unauthorized use of credentials.

#### Severity

- SEV-3 for scheduled rotation.
- SEV-1 for emergency rotation (treat as a security incident).

#### Prerequisites and tools

- AWS CLI v2 with Secrets Manager and IAM access.
- List of all secrets and their rotation schedules (maintained in the platform inventory).
- Access to the application configuration to understand which services consume which secrets.
- For database credentials: Aurora admin access to create/rotate users.
- For KMS keys: KMS key administration permissions.

#### Secrets inventory

| Secret | Secrets Manager path | Consumers | Rotation interval | Method |
|--------|---------------------|-----------|-------------------|--------|
| Aurora master password | `causeway/prod/aurora/master` | DBA tooling | 90 days | Secrets Manager automatic |
| Aurora application user | `causeway/prod/aurora/app-user` | ECS services | 90 days | Secrets Manager automatic with Lambda |
| DynamoDB is IAM-authenticated | N/A (IAM role credentials) | N/A | Automatic (STS) | AWS-managed |
| Third-party API keys | `causeway/prod/api-keys/<provider>` | ECS services | 365 days | Manual rotation |
| JWT signing key | `causeway/prod/jwt-signing-key` | Authentication service | 180 days | Manual rotation with key overlap |
| KMS CMK | Key ID in KMS | All encryption consumers | Automatic annual rotation | AWS-managed |

#### Procedure — Scheduled database credential rotation

**Step 1 — Verify automatic rotation is configured.**

```bash
# Check rotation configuration for the secret
aws secretsmanager describe-secret \
  --secret-id causeway/prod/aurora/app-user \
  --region eu-west-1 \
  --output json | jq '{
    name: .Name,
    rotationEnabled: .RotationEnabled,
    rotationRules: .RotationRules,
    lastRotated: .LastRotatedDate,
    nextRotation: .NextRotationDate
  }'
```

**Step 2 — Trigger rotation (if manual trigger is needed).**

```bash
# Trigger immediate rotation
aws secretsmanager rotate-secret \
  --secret-id causeway/prod/aurora/app-user \
  --region eu-west-1 \
  --output json | jq '{name: .Name, versionId: .VersionId}'

# Monitor the rotation status
aws secretsmanager describe-secret \
  --secret-id causeway/prod/aurora/app-user \
  --region eu-west-1 \
  --output json | jq '{lastRotated: .LastRotatedDate, versionIdsToStages: .VersionIdsToStages}'
```

**Step 3 — Verify the rotation Lambda executed successfully.**

```bash
# Check the rotation Lambda logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/causeway-secret-rotation \
  --start-time $(date -d '10 minutes ago' +%s000) \
  --region eu-west-1 \
  --output json | jq -r '.events[] | .message'
```

**Step 4 — Verify application connectivity.**

```bash
# Check ECS service logs for connection errors after rotation
aws logs filter-log-events \
  --log-group-name /ecs/causeway/<service-name> \
  --filter-pattern "\"authentication failed\" OR \"password\" OR \"credential\" OR \"FATAL\"" \
  --start-time $(date -d '10 minutes ago' +%s000) \
  --region eu-west-1 \
  --output json | jq -r '.events[] | .message'

# If applications cache credentials and are not picking up the new secret,
# force a rolling restart:
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --force-new-deployment \
  --region eu-west-1
```

#### Procedure — Emergency credential rotation

**Step 1 — Immediately invalidate the compromised credential.**

For Aurora database credentials:
```bash
# Connect to Aurora and change the password directly
# (Use ECS exec or a bastion host)
aws ecs execute-command \
  --cluster causeway-prod \
  --task <running-task-arn> \
  --container <container-name> \
  --interactive \
  --command "/bin/sh -c 'psql -h \$DB_HOST -U postgres -c \"ALTER USER app_user WITH PASSWORD '\\''$(openssl rand -base64 32)'\\''\"'"

# Update the secret in Secrets Manager with the new password
aws secretsmanager put-secret-value \
  --secret-id causeway/prod/aurora/app-user \
  --secret-string '{"username":"app_user","password":"<new-password>","host":"<cluster-endpoint>","port":"5432","dbname":"causeway"}' \
  --region eu-west-1
```

For IAM access keys:
```bash
# Deactivate the compromised key immediately
aws iam update-access-key \
  --user-name <user-name> \
  --access-key-id <compromised-key-id> \
  --status Inactive

# Create a new access key
aws iam create-access-key \
  --user-name <user-name> \
  --output json | jq '{accessKeyId: .AccessKey.AccessKeyId, status: .AccessKey.Status}'

# Update the corresponding secret in Secrets Manager
aws secretsmanager put-secret-value \
  --secret-id causeway/prod/api-keys/<service> \
  --secret-string '{"accessKeyId":"<new-key-id>","secretAccessKey":"<new-secret-key>"}' \
  --region eu-west-1

# After confirming the new key works, delete the old key
aws iam delete-access-key \
  --user-name <user-name> \
  --access-key-id <compromised-key-id>
```

For JWT signing keys:
```bash
# Generate a new signing key
openssl genrsa -out /tmp/new-jwt-key.pem 4096

# Store the new key in Secrets Manager (keep the old key as AWSPREVIOUS for
# token validation during transition)
aws secretsmanager put-secret-value \
  --secret-id causeway/prod/jwt-signing-key \
  --secret-string "$(cat /tmp/new-jwt-key.pem)" \
  --region eu-west-1

# Securely delete the local copy
shred -u /tmp/new-jwt-key.pem

# Force restart the authentication service to pick up the new key
aws ecs update-service \
  --cluster causeway-prod \
  --service authentication \
  --force-new-deployment \
  --region eu-west-1
```

**Step 2 — Restart all affected services to pick up new credentials.**

```bash
# Identify services that consume the rotated secret
# (Refer to the secrets inventory table above)

# Force rolling restart of each affected service
for service in payment-processing-api account-management authentication; do
  aws ecs update-service \
    --cluster causeway-prod \
    --service "$service" \
    --force-new-deployment \
    --region eu-west-1
  echo "Restarted: $service"
done

# Wait for all services to stabilize
aws ecs wait services-stable \
  --cluster causeway-prod \
  --services payment-processing-api account-management authentication \
  --region eu-west-1
```

**Step 3 — Rotate credentials in the DR region (eu-west-2).**

```bash
# Update secrets in the DR region
aws secretsmanager put-secret-value \
  --secret-id causeway/prod/aurora/app-user \
  --secret-string '<same-new-credential-json>' \
  --region eu-west-2

# If using Secrets Manager replication, verify the secret has replicated
aws secretsmanager describe-secret \
  --secret-id causeway/prod/aurora/app-user \
  --region eu-west-2 \
  --output json | jq '{lastChanged: .LastChangedDate}'

# Restart DR services if they are running (Tier 1 warm standby)
aws ecs update-service \
  --cluster causeway-dr \
  --service <service-name> \
  --force-new-deployment \
  --region eu-west-2
```

#### Procedure — KMS key rotation

```bash
# KMS automatic key rotation (annual) should already be enabled.
# Verify:
aws kms get-key-rotation-status \
  --key-id <key-id> \
  --region eu-west-1 \
  --output json

# If not enabled, enable it:
aws kms enable-key-rotation \
  --key-id <key-id> \
  --region eu-west-1

# For emergency KMS key rotation (e.g., suspected key compromise):
# KMS does not support immediate rotation of the key material.
# Instead, create a new CMK and re-encrypt data:
aws kms create-key \
  --description "Causeway prod encryption - rotated $(date +%Y%m%d)" \
  --key-usage ENCRYPT_DECRYPT \
  --region eu-west-1

# Update aliases to point to the new key
aws kms update-alias \
  --alias-name alias/causeway-prod-encryption \
  --target-key-id <new-key-id> \
  --region eu-west-1

# Schedule the old key for deletion (30-day waiting period)
aws kms schedule-key-deletion \
  --key-id <old-key-id> \
  --pending-window-in-days 30 \
  --region eu-west-1

# IMPORTANT: Existing data encrypted with the old key will still need the old key
# for decryption until it is re-encrypted. Do NOT delete the old key until all
# data has been re-encrypted with the new key.
```

#### Verification

- [ ] New credential is stored in Secrets Manager with stage label `AWSCURRENT`.
- [ ] Old credential is labeled `AWSPREVIOUS` (for graceful transition) or deleted (for emergency rotation).
- [ ] All consuming services have restarted and are using the new credential.
- [ ] Application logs show no authentication errors.
- [ ] Database connections are established successfully.
- [ ] Services in both eu-west-1 and eu-west-2 are using the updated credentials.
- [ ] CloudTrail shows no further unauthorized use of the old credential.

#### Escalation criteria

- Escalate to SEV-1 if emergency rotation causes service disruption (applications cannot authenticate).
- Escalate to the security on-call if the compromised credential was used for unauthorized actions.
- Escalate to the DBA if database credential rotation fails or locks out the application.
- Escalate to the engineering lead if multiple services are affected and need coordinated restarts.

#### Post-incident actions

1. For emergency rotations: complete the data breach response procedure (6.5) if applicable.
2. Audit how the credential was compromised (code commit, log exposure, phishing, insider threat).
3. Review and update credential management practices:
   - Ensure no secrets are hardcoded in application code or configuration files.
   - Verify that Secrets Manager automatic rotation is enabled for all applicable secrets.
   - Confirm that applications fetch secrets from Secrets Manager at startup (not baked into images).
4. Update the secrets inventory if new secrets were created.
5. Verify that CloudTrail logging covers all Secrets Manager access.
6. Schedule the next rotation cycle based on policy requirements.

---

## 7. Backups and recovery

### Backup schedule

| Resource | Backup method | Frequency | Retention | Location |
|----------|--------------|-----------|-----------|----------|
| Aurora PostgreSQL | Automated snapshots + continuous backups (PITR) | Continuous (1-min granularity) | 35 days | Same region + cross-region copy to eu-west-2 |
| Aurora PostgreSQL | Manual snapshots | Before major deployments | 90 days | Same region |
| DynamoDB | Point-in-time recovery (PITR) | Continuous | 35 days | Same region |
| DynamoDB | On-demand backups | Weekly | 90 days | Same region |
| S3 documents | Versioning + cross-region replication | Continuous | Per lifecycle policy (current: 7 years) | eu-west-1 + eu-west-2 |
| ECS task definitions | Stored in ECR/registry | N/A (immutable) | All revisions retained | eu-west-1 + eu-west-2 |
| Terraform state | S3 versioning + DynamoDB locking | Every apply | All versions retained | eu-west-1 |
| Secrets Manager | Cross-region replication | Automatic | N/A | eu-west-1 + eu-west-2 |

### Recovery testing

- **Tier 1 services:** Full restore drill quarterly. Test Aurora PITR, ECS service redeployment, and DynamoDB restore.
- **Tier 2 services:** Restore drill biannually.
- **Tier 3 services:** Restore drill annually.
- All drill results are documented in `docs/dr-drills/` with date, scope, duration, findings, and action items.
- Recovery drill failures are treated as SEV-3 incidents and tracked to resolution.

### Aurora PITR procedure

```bash
# Restore to a specific point in time
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier causeway-prod-cluster \
  --db-cluster-identifier causeway-prod-cluster-pitr \
  --restore-to-time "2026-02-11T10:30:00Z" \
  --region eu-west-1

# Wait for the restored cluster to become available
aws rds wait db-cluster-available \
  --db-cluster-identifier causeway-prod-cluster-pitr \
  --region eu-west-1

# Create an instance in the restored cluster
aws rds create-db-instance \
  --db-instance-identifier causeway-prod-pitr-instance-1 \
  --db-cluster-identifier causeway-prod-cluster-pitr \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql \
  --region eu-west-1

# Validate data, then update application configuration to point to the restored cluster
# or rename the clusters to swap them.
```

---

## 8. Appendix — Key resource identifiers

These identifiers are placeholders. Replace with actual values and store securely.

| Resource | Identifier | Region |
|----------|-----------|--------|
| ECS cluster (prod) | `causeway-prod` | eu-west-1 |
| ECS cluster (DR) | `causeway-dr` | eu-west-2 |
| Aurora cluster (prod) | `causeway-prod-cluster` | eu-west-1 |
| Aurora cluster (DR replica) | `causeway-dr-cluster` | eu-west-2 |
| DynamoDB sessions table | `causeway-sessions` | eu-west-1 (global table) |
| ALB (prod) | `causeway-prod-alb` | eu-west-1 |
| ALB (DR) | `causeway-dr-alb` | eu-west-2 |
| CloudFront distribution | `<distribution-id>` | Global |
| WAF WebACL | `causeway-prod-waf` | eu-west-1 |
| WAF blocked IP set | `causeway-blocked-ips` | eu-west-1 |
| S3 documents bucket | `causeway-prod-documents` | eu-west-1 |
| S3 documents replica | `causeway-dr-documents` | eu-west-2 |
| KMS CMK alias | `alias/causeway-prod-encryption` | eu-west-1 |
| Route 53 hosted zone | `<hosted-zone-id>` | Global |
| PagerDuty service | `causeway-platform` | N/A |
| GuardDuty detector | `<detector-id>` | eu-west-1 |
| Secrets Manager — Aurora | `causeway/prod/aurora/master` | eu-west-1 |
| Secrets Manager — App user | `causeway/prod/aurora/app-user` | eu-west-1 |
| Secrets Manager — JWT key | `causeway/prod/jwt-signing-key` | eu-west-1 |

---

*Last updated: 2026-02-11*
*Owner: Platform Engineering*
*Review cadence: Quarterly, or after any SEV-1 incident*

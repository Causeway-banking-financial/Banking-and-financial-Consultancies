# Go-Live Checklist — Causeway Banking Financial Platform

Use this checklist before launching any new service or major change to
production. Every item has specific acceptance criteria and evidence
requirements. A service may not go live until all applicable items are complete
and the sign-off section at the bottom is signed.

**Prerequisite:** The service must have an assigned tier classification (Tier 1,
Tier 2, or Tier 3) per [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md).
The tier determines which items below are mandatory vs. recommended. If a tier
has not been assigned, stop here and complete the
[tier assignment process](adr/0002-rto-rpo-targets-by-service-tier.md#tier-assignment-process).

---

## Service classification

- [ ] **Service tier assigned and recorded**
  - Acceptance: Tier (1, 2, or 3) agreed with platform engineering and security
    team, recorded in the service README and infrastructure configuration.
  - Evidence: PR showing tier assignment in the service repository. Confirm the
    tier matches the infrastructure module variant used.
  - Reference: [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md)

---

## Security

- [ ] **Data classification completed and controls applied**
  - Acceptance: Every data field stored or processed by the service is classified
    (Public, Internal, Confidential, or Restricted) and the corresponding
    encryption, access control, and logging requirements are enforced.
  - Evidence: Data classification tag on Aurora tables, DynamoDB tables, and S3
    buckets. `aws resourcegroupstaggingapi get-resources --tag-filters Key=DataClassification`
    returns the service's resources with correct classification tags.
  - Reference: [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md),
    [THREAT_MODEL.md section 2.2](THREAT_MODEL.md#22-key-components)

- [ ] **IAM least privilege verified**
  - Acceptance: The ECS task role has only the permissions required for the
    service's operation. No wildcard (`*`) resource permissions. No unused
    permissions. IAM Access Analyzer shows no findings for the service's roles.
  - Evidence: Run `aws iam access-analyzer list-findings --analyzer-arn <arn>
    --filter 'resource={"contains":["<service-name>"]}'` and confirm zero
    findings. Review the task role policy in Terraform and confirm resource ARNs
    are scoped to the service's own resources.
  - Reference: [THREAT_MODEL.md S-02, E-02](THREAT_MODEL.md#32-tampering),
    [COMPLIANCE_MAPPING.md PCI-DSS 7.2.1](COMPLIANCE_MAPPING.md#22-requirements-mapping)

- [ ] **Secrets stored in Secrets Manager or SSM Parameter Store**
  - Acceptance: No secrets hardcoded in application code, container images,
    environment variables, or CI/CD pipeline definitions. All secrets are
    fetched from AWS Secrets Manager or SSM Parameter Store at runtime.
  - Evidence: CI pipeline secret scanning (git-secrets, trufflehog) passes with
    zero findings. `grep -r` of the repository for known secret patterns returns
    zero matches. Secrets Manager secret exists for the service:
    `aws secretsmanager list-secrets --filters Key=name,Values=causeway/prod/<service-name>`.
  - Reference: [OPERATIONS_RUNBOOK.md section 6.8](OPERATIONS_RUNBOOK.md#68-secrets-rotation-scheduled-and-emergency)

- [ ] **WAF rules in place and tested**
  - Acceptance: The ALB serving the service is associated with the production
    WAF WebACL. Managed rule groups (OWASP Core Rule Set, Known Bad Inputs, SQLi)
    are active. Rate-limiting rule is configured at 2,000 requests per 5 minutes
    per IP.
  - Evidence: `aws wafv2 get-web-acl-for-resource --resource-arn <alb-arn>
    --region eu-west-1` returns the production WebACL. WAF test requests
    (SQL injection payloads, rate-limit bursts) are blocked as expected.
  - Reference: [THREAT_MODEL.md D-01, D-02](THREAT_MODEL.md#35-denial-of-service),
    [COMPLIANCE_MAPPING.md PCI-DSS 6.4.1](COMPLIANCE_MAPPING.md#22-requirements-mapping)

- [ ] **Vulnerability scanning configured and passing**
  - Acceptance: Container images are scanned by AWS Inspector or equivalent on
    every build. No CRITICAL or HIGH severity findings in the latest scan.
    Dependency scanning (SAST) runs in the CI pipeline on every PR.
  - Evidence: Latest CI pipeline run shows scan step passed. Inspector findings
    dashboard shows zero CRITICAL/HIGH for the service's ECR repository:
    `aws inspector2 list-findings --filter-criteria '{"ecrImageRepositoryName":[{"comparison":"EQUALS","value":"causeway/<service-name>"}],"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}'`.
  - Reference: [COMPLIANCE_MAPPING.md PCI-DSS 11.3.1](COMPLIANCE_MAPPING.md#22-requirements-mapping)

---

## Reliability

- [ ] **Multi-AZ architecture verified**
  - Acceptance: ECS tasks are distributed across the number of AZs required by
    the service tier (Tier 1: 3 AZs, Tier 2/3: 2 AZs). Aurora cluster spans
    the same AZs. The networking module's `availability_zones` parameter in the
    environment config matches the tier requirement.
  - Evidence: `aws ecs describe-services --cluster causeway-prod --services
    <service-name> --region eu-west-1` shows tasks in multiple AZs.
    `aws rds describe-db-clusters --db-cluster-identifier causeway-prod-cluster
    --region eu-west-1` shows the correct AZs.
  - Reference: [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md),
    `infrastructure/environments/prod/main.tf` (3 AZs),
    `infrastructure/environments/nonprod/main.tf` (2 AZs)

- [ ] **Autoscaling policies tested**
  - Acceptance: ECS service auto-scaling is configured with target-tracking
    policies (CPU and/or request count). Scaling out and scaling in have been
    tested in nonprod under load. Maximum task count is set to prevent runaway
    costs.
  - Evidence: `aws application-autoscaling describe-scalable-targets
    --service-namespace ecs --resource-ids service/causeway-prod/<service-name>
    --region eu-west-1` returns the scaling configuration. Load test report
    shows scaling triggered as expected.
  - Reference: [CHAOS_ENGINEERING.md Experiment 3: ECS CPU Stress](CHAOS_ENGINEERING.md#experiment-3-ecs-cpu-stress)

- [ ] **Backups enabled and restore tested**
  - Acceptance: Aurora automated backups are enabled with the retention period
    required by the tier (Tier 1: 35 days, Tier 2: 14+ days, Tier 3: 7+ days).
    DynamoDB PITR is enabled. A restore-from-backup test has been completed in
    nonprod within the last quarter.
  - Evidence: `aws rds describe-db-clusters --db-cluster-identifier
    causeway-prod-cluster` shows `BackupRetentionPeriod` matches the tier
    requirement. `aws dynamodb describe-continuous-backups --table-name
    causeway-<table>` shows PITR enabled. Restore test report on file.
  - Reference: [OPERATIONS_RUNBOOK.md section 7](OPERATIONS_RUNBOOK.md#7-backups-and-recovery)

- [ ] **RTO/RPO defined and documented**
  - Acceptance: The service's RTO and RPO are documented in its README and match
    the targets defined for its tier in ADR-0002. The infrastructure configuration
    supports these targets (e.g., Tier 1 requires cross-region replica).
  - Evidence: Service README contains RTO/RPO values. Infrastructure code
    provisions the correct Aurora replication, backup frequency, and AZ count
    for the tier.
  - Reference: [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md)

- [ ] **Health checks configured**
  - Acceptance: ALB health check is configured with the correct path, interval
    (10s for Tier 1), and failure threshold. ECS service uses the ALB health
    check for task health determination.
  - Evidence: `aws elbv2 describe-target-groups --names <target-group-name>
    --region eu-west-1` shows health check path, interval, and thresholds.
    Target group reports all targets as `healthy`.

---

## Observability

- [ ] **Logging centralised with retention set**
  - Acceptance: Application logs are written to a CloudWatch log group under
    `/ecs/causeway/<service-name>`. Log retention matches the environment
    (nonprod: 30 days, prod: 365 days). Logs are structured (JSON) with
    correlation IDs.
  - Evidence: `aws logs describe-log-groups --log-group-name-prefix
    /ecs/causeway/<service-name> --region eu-west-1` returns the log group with
    correct retention. Sample log entries contain structured JSON with a
    `correlationId` field.
  - Reference: [OPERATIONS_RUNBOOK.md section 4](OPERATIONS_RUNBOOK.md#4-monitoring-and-alerting),
    [COMPLIANCE_MAPPING.md PCI-DSS 10.2.1](COMPLIANCE_MAPPING.md#22-requirements-mapping)

- [ ] **Metrics dashboards aligned to SLOs**
  - Acceptance: The service's key metrics (request rate, error rate,
    p50/p95/p99 latency, ECS task count, Aurora connection count) are visible on
    the `causeway-platform-overview` CloudWatch dashboard. SLO thresholds are
    marked on the dashboard where supported.
  - Evidence: CloudWatch dashboard `causeway-platform-overview` includes widgets
    for the service. Screenshot or dashboard URL on file.
  - Reference: [OPERATIONS_RUNBOOK.md section 4](OPERATIONS_RUNBOOK.md#4-monitoring-and-alerting)

- [ ] **Alert routing and on-call configured**
  - Acceptance: CloudWatch alarms for the service route to the SNS topic
    connected to PagerDuty (`causeway-platform`). On-call rotation includes
    engineers with knowledge of this service. Alarms include: `ecs-task-crash-loop`,
    `alb-5xx-rate`, and any service-specific alarms.
  - Evidence: `aws cloudwatch describe-alarms --alarm-name-prefix
    causeway-prod-<service-name> --region eu-west-1` returns alarms with SNS
    actions configured. PagerDuty service `causeway-platform` shows the
    escalation policy includes the service team.
  - Reference: [OPERATIONS_RUNBOOK.md section 2](OPERATIONS_RUNBOOK.md#2-on-call-structure-and-escalation)

---

## Deployment

- [ ] **CI/CD pipeline approvals in place**
  - Acceptance: The service deploys through the standard pipeline flow:
    PR plan comment (terraform-plan.yml), auto-apply to nonprod on merge
    (terraform-apply-nonprod.yml), manual-trigger to prod
    (terraform-apply-prod.yml with `workflow_dispatch` confirmation and GitHub
    environment approval gate).
  - Evidence: GitHub repository settings show branch protection on `main`
    requiring at least one review. GitHub environment `production` requires
    manual approval. Recent deployment history shows the pipeline was followed.
  - Reference: [DEPLOYMENT.md](DEPLOYMENT.md)

- [ ] **Rollback plan documented**
  - Acceptance: A rollback procedure specific to this service is documented,
    covering: (1) ECS task definition rollback via `force-new-deployment`,
    (2) Terraform revert if infrastructure changed, (3) database migration
    down-migration or snapshot restore if schema changed. The ECS deployment
    circuit breaker is enabled.
  - Evidence: `aws ecs describe-services --cluster causeway-prod --services
    <service-name> --region eu-west-1 | jq '.services[].deploymentConfiguration.deploymentCircuitBreaker'`
    returns `{"enable": true, "rollback": true}`. Rollback procedure is
    documented in the service's deployment notes or the operations runbook.
  - Reference: [DEPLOYMENT.md](DEPLOYMENT.md),
    [OPERATIONS_RUNBOOK.md section 6.7](OPERATIONS_RUNBOOK.md#67-failed-deployment-rollback)

- [ ] **Change window scheduled if required**
  - Acceptance: If this is a Normal or Emergency change (not Standard), a change
    window has been scheduled per the change management policy. Preferred window:
    Tuesday-Thursday, 06:00-08:00 UTC. Blackout periods are avoided (month-end
    processing, regulatory reporting deadlines).
  - Evidence: Change request documented with scheduled window. No conflict with
    blackout calendar.
  - Reference: [OPERATIONS_RUNBOOK.md section 5](OPERATIONS_RUNBOOK.md#5-change-management)

---

## DNS and domain

- [ ] **ACM certificate issued for finance.causewaygrp.com**
  - Acceptance: An ACM certificate covering the service's domain (or
    `*.causewaygrp.com`) is issued and in `ISSUED` status. DNS validation
    CNAME records exist in Route 53. Automatic renewal is functioning.
  - Evidence: `aws acm describe-certificate --certificate-arn <arn>
    --region eu-west-1` shows `Status: ISSUED` and
    `RenewalSummary.RenewalStatus: SUCCESS` (or pending if recently issued).
  - Reference: [OPERATIONS_RUNBOOK.md section 6.3](OPERATIONS_RUNBOOK.md#63-tls-certificate-approaching-expiry)

- [ ] **DNS record points to CloudFront or ALB**
  - Acceptance: The service's DNS record resolves to the correct CloudFront
    distribution or ALB. `dig +short <service-domain>` returns the expected
    endpoint. Route 53 health check is configured for Tier 1 services.
  - Evidence: `dig +short <service-domain>` output matches the expected
    CloudFront or ALB DNS name. Route 53 hosted zone shows the correct
    alias record.

- [ ] **HTTPS enforced and HSTS enabled**
  - Acceptance: HTTP requests to port 80 receive a 301 redirect to HTTPS.
    The HTTPS response includes `Strict-Transport-Security` header with
    `max-age >= 31536000` and `includeSubDomains`. TLS 1.2 is the minimum
    supported version (ALB security policy `ELBSecurityPolicy-TLS13-1-2-2021-06`).
  - Evidence: `curl -I http://<service-domain>` returns `HTTP/1.1 301` with
    `Location: https://...`. `curl -I https://<service-domain>` returns the
    HSTS header. `openssl s_client -connect <service-domain>:443 -tls1_1`
    fails (TLS 1.1 rejected).
  - Reference: [THREAT_MODEL.md T-01](THREAT_MODEL.md#32-tampering),
    [COMPLIANCE_MAPPING.md PCI-DSS 2.2.7](COMPLIANCE_MAPPING.md#22-requirements-mapping)

---

## Compliance

- [ ] **Threat model reviewed for new service or change**
  - Acceptance: The STRIDE threat model has been reviewed to confirm the new
    service or change does not introduce unmitigated threats. If new trust
    boundaries or data flows are introduced, the threat model has been updated
    with new entries.
  - Evidence: PR updating THREAT_MODEL.md (if changes were needed), or a
    comment in the service PR confirming the threat model was reviewed and no
    updates are required.
  - Reference: [THREAT_MODEL.md section 7](THREAT_MODEL.md#7-review-cadence-and-governance)

- [ ] **Regulatory controls verified**
  - Acceptance: The service's data handling, logging, and access controls
    satisfy the applicable regulatory requirements (PCI-DSS, FCA SYSC, UK GDPR)
    as mapped in the compliance document. If the service processes payment card
    data, PCI-DSS scoping has been confirmed.
  - Evidence: Compliance team has reviewed the service against
    COMPLIANCE_MAPPING.md and confirmed no new gaps. If new gaps are identified,
    they are recorded in the Gap Analysis section with a remediation plan.
  - Reference: [COMPLIANCE_MAPPING.md](COMPLIANCE_MAPPING.md)

- [ ] **Audit logging covers all sensitive operations**
  - Acceptance: CloudTrail logs all AWS API calls. Application-level audit logs
    record all write operations on customer data with before/after values,
    authenticated user identity, timestamp, and correlation ID. Audit logs are
    delivered to a centralised, tamper-resistant store.
  - Evidence: CloudTrail is enabled (verified by `aws cloudtrail get-trail-status
    --name <trail-name> --region eu-west-1` showing `IsLogging: true`).
    Application audit log sample shows required fields.
  - Reference: [COMPLIANCE_MAPPING.md PCI-DSS 10.2.1](COMPLIANCE_MAPPING.md#22-requirements-mapping),
    [THREAT_MODEL.md R-01, R-02](THREAT_MODEL.md#33-repudiation)

---

## Operational readiness

- [ ] **Runbook procedure exists for the service**
  - Acceptance: The operations runbook contains a procedure for the most likely
    failure modes of this service (container crash loop, database connectivity
    failure, dependency timeout). On-call engineers can find and execute the
    procedure without prior knowledge of the service.
  - Evidence: OPERATIONS_RUNBOOK.md contains a section for the service, or a
    service-specific runbook is linked from the main runbook. Procedure has been
    reviewed by at least one on-call engineer who is not the service author.
  - Reference: [OPERATIONS_RUNBOOK.md section 6](OPERATIONS_RUNBOOK.md#6-runbook-procedures)

- [ ] **On-call team briefed on the new service**
  - Acceptance: The on-call team has been notified about the new service,
    its tier classification, key metrics to watch, and escalation contacts.
    A brief handoff note has been posted in `#platform-status`.
  - Evidence: Slack message in `#platform-status` announcing the service,
    its tier, and key contacts.

- [ ] **Chaos experiment run in nonprod**
  - Acceptance: At least the ECS Task Termination experiment has been run
    against the service in nonprod. The service recovered within expected
    bounds (replacement task within 30 seconds, no user-visible errors).
  - Evidence: Gameday report on file following the template in
    CHAOS_ENGINEERING.md. Any findings have been recorded as GitHub issues
    with the `chaos-finding` label.
  - Reference: [CHAOS_ENGINEERING.md](CHAOS_ENGINEERING.md)

- [ ] **Error budget baseline established**
  - Acceptance: The service's SLO (per its tier) is configured in the
    monitoring system. The 30-day error budget is being tracked. The initial
    error budget consumption is below 10%.
  - Evidence: CloudWatch dashboard or SLO tracking tool shows the service's
    availability and error budget. Weekly report in `#platform-status` includes
    the new service.
  - Reference: [OPERATIONS_RUNBOOK.md section 1](OPERATIONS_RUNBOOK.md#1-severity-levels-and-slos)

---

## Sign-off

All items above must be verified before the service is declared production-ready.
Each signatory confirms they have reviewed the checklist items within their area
of responsibility and the acceptance criteria are met.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Service owner** | _________________ | __________ | __________ |
| **Platform engineering lead** | _________________ | __________ | __________ |
| **Security engineering** | _________________ | __________ | __________ |
| **Compliance / DPO** (if personal data is processed) | _________________ | __________ | __________ |
| **On-call representative** | _________________ | __________ | __________ |

---

*Last updated: 2026-02-11*
*Owner: Platform Engineering*
*Review cadence: Every go-live, or when the checklist categories change*

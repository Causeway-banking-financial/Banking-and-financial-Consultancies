# Deployment Guide — Causeway Banking Financial Platform

This guide describes the infrastructure deployment pipeline for the Causeway
Banking Financial platform. It covers the Terraform module structure, GitHub
Actions pipeline flow, environment configuration, and rollback strategy.

**Compute platform:** ECS Fargate ([ADR-0001](adr/0001-default-compute-ecs-fargate.md))
**Primary region:** eu-west-1 (Ireland)
**IaC tool:** Terraform >= 1.5, AWS provider ~> 5.0

---

## Terraform module structure

All infrastructure is defined in `infrastructure/modules/` with five modules
composed per environment:

| Module | Path | Responsibility |
|--------|------|----------------|
| **networking** | `infrastructure/modules/networking/main.tf` | VPC, public/private/database subnets, NAT gateways, NACLs, VPC Flow Logs |
| **security** | `infrastructure/modules/security/main.tf` | KMS CMKs, WAF WebACL with managed rule groups, IAM baselines |
| **compute** | `infrastructure/modules/compute/main.tf` | ECS Fargate cluster, ALB, HTTPS listener (TLS 1.3 policy), target groups, ECS task security groups |
| **data** | `infrastructure/modules/data/main.tf` | Aurora PostgreSQL, DynamoDB, S3 buckets (KMS-encrypted) |
| **observability** | `infrastructure/modules/observability/main.tf` | CloudWatch dashboards, alarms, SNS alerting, log groups and retention |

Environment-specific compositions live in:

- `infrastructure/environments/nonprod/main.tf`
- `infrastructure/environments/prod/main.tf`

Each environment file wires the five modules together with environment-appropriate
parameters (instance sizes, thresholds, retention periods).

---

## Environment configurations

### Nonprod

| Property | Value |
|----------|-------|
| Availability zones | 2 (`eu-west-1a`, `eu-west-1b`) |
| NAT gateway | Single (cost saving) |
| Aurora instance class | `db.r6g.medium` |
| Aurora instances | 2 |
| Aurora backup retention | 7 days |
| Container Insights | Disabled |
| Log retention | 30 days |
| VPC Flow Log retention | 30 days |
| WAF rate limit | 5,000 requests/5 min |
| ALB 5xx alarm threshold | 50% |
| Terraform state | `s3://causeway-banking-terraform-state-nonprod/nonprod/terraform.tfstate` |
| Terraform lock | DynamoDB table `causeway-banking-terraform-locks-nonprod` |

### Prod

| Property | Value |
|----------|-------|
| Availability zones | 3 (`eu-west-1a`, `eu-west-1b`, `eu-west-1c`) |
| NAT gateway | One per AZ (HA) |
| Aurora instance class | `db.r6g.large` |
| Aurora instances | 3 (writer + 2 readers) |
| Aurora backup retention | 35 days |
| Aurora deletion protection | Enabled |
| Container Insights | Enabled |
| Log retention | 365 days |
| VPC Flow Log retention | 365 days |
| WAF rate limit | 2,000 requests/5 min |
| ALB 5xx alarm threshold | 5% |
| ALB deletion protection | Enabled |
| Terraform state | `s3://causeway-banking-terraform-state-prod/prod/terraform.tfstate` |
| Terraform lock | DynamoDB table `causeway-banking-terraform-locks-prod` |

---

## CI/CD pipeline

Three GitHub Actions workflows in `.github/workflows/` implement the deployment
pipeline:

### 1. `terraform-plan.yml` -- Plan on pull request

**Trigger:** Pull request that modifies `infrastructure/**` or
`.github/workflows/terraform-*.yml`.

**What it does:**

1. Runs `terraform fmt -check -recursive` to enforce formatting.
2. Runs `terraform init` and `terraform validate`.
3. Runs `terraform plan` for both nonprod and prod (matrix strategy, parallel).
4. Posts the plan output as a comment on the PR so reviewers can see exactly
   what will change.
5. Fails the check if the plan errors.

**IAM role:** `TERRAFORM_PLAN_ROLE_ARN` (read-only).

### 2. `terraform-apply-nonprod.yml` -- Auto-apply on merge

**Trigger:** Push to `main` that modifies `infrastructure/**`.

**What it does:**

1. Runs `terraform init`.
2. Runs `terraform apply -auto-approve` against the nonprod environment.

This runs automatically when a PR is merged. No manual approval is required
for nonprod.

**IAM role:** `TERRAFORM_APPLY_ROLE_ARN` (nonprod account, write access).
**GitHub environment:** `nonprod`.

### 3. `terraform-apply-prod.yml` -- Manual trigger for production

**Trigger:** `workflow_dispatch` with a confirmation input. The operator must
type `apply` to confirm.

**What it does:**

1. Validates the confirmation input (rejects anything other than `apply`).
2. Runs `terraform plan -out=tfplan` to capture the exact plan.
3. Runs `terraform apply tfplan` to apply only the captured plan.

**IAM role:** `TERRAFORM_APPLY_ROLE_ARN_PROD` (prod account, write access).
**GitHub environment:** `production` (requires manual approval configured in
GitHub environment settings).

### Pipeline flow diagram

```
 Developer opens PR
       |
       v
 terraform-plan.yml
 (plan for nonprod + prod, post as PR comment)
       |
       v
 Reviewer inspects plan output in PR comment
       |
       v
 PR approved and merged to main
       |
       v
 terraform-apply-nonprod.yml    (automatic)
 (apply to nonprod on push to main)
       |
       v
 Verify nonprod is healthy
 (dashboards, smoke tests, chaos experiments -- see CHAOS_ENGINEERING.md)
       |
       v
 terraform-apply-prod.yml       (manual trigger)
 (workflow_dispatch, type 'apply', GitHub environment approval gate)
       |
       v
 Monitor prod for 15 minutes post-deploy
 (see OPERATIONS_RUNBOOK.md section 5 -- Change management)
```

---

## Rollback strategy

ECS Fargate deployments use the following rollback mechanisms:

### ECS deployment circuit breaker

The ECS deployment circuit breaker automatically rolls back a deployment if new
tasks repeatedly fail to reach a healthy state. When enabled, ECS will:

1. Detect that new tasks are failing health checks or crashing on startup.
2. Automatically stop the failing deployment.
3. Roll back to the last completed deployment (the previous task definition).

Enable the circuit breaker on the ECS service:

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

### Manual rollback via force-new-deployment

If a deployment passes health checks but introduces a functional regression,
roll back manually by redeploying the previous task definition:

```bash
# Identify the previous good task definition
aws ecs list-task-definitions \
  --family-prefix causeway-<service-name> \
  --sort DESC --max-items 5 \
  --region eu-west-1

# Roll back
aws ecs update-service \
  --cluster causeway-prod \
  --service <service-name> \
  --task-definition causeway-<service-name>:<previous-revision> \
  --force-new-deployment \
  --region eu-west-1

# Wait for stabilisation
aws ecs wait services-stable \
  --cluster causeway-prod \
  --services <service-name> \
  --region eu-west-1
```

### Infrastructure rollback (Terraform)

If a Terraform apply introduces a problem, revert the commit on `main` and
re-run the apply pipeline. Terraform will converge the infrastructure back to
the previous state.

```bash
git revert <failing-commit> --no-edit
git push origin main
# terraform-apply-nonprod.yml triggers automatically
# terraform-apply-prod.yml must be triggered manually after verification
```

### Database migration rollback

Database schema changes must include a down migration or a documented manual
reversal procedure. If a migration must be rolled back, execute the down
migration from within an ECS exec session. If the down migration is not
possible, restore from an Aurora snapshot taken before the deployment.

See [OPERATIONS_RUNBOOK.md, section 6.7 -- Failed deployment rollback](OPERATIONS_RUNBOOK.md#67-failed-deployment-rollback)
for the full step-by-step procedure.

---

## Deployment validation

After every production deployment, the deployer must:

1. Monitor the `causeway-platform-overview` CloudWatch dashboard for 15 minutes.
2. Confirm ALB 5xx error rate has not increased above baseline.
3. Confirm ECS `RunningTaskCount` equals `DesiredCount`.
4. Confirm ALB target group health checks show all targets as healthy.
5. Verify application latency (p50/p95/p99) remains within SLO targets.

For higher confidence, run the ECS Task Termination chaos experiment from
[CHAOS_ENGINEERING.md](CHAOS_ENGINEERING.md) against nonprod after applying
infrastructure changes. This validates that ECS recovery, ALB health checks,
and the deployment circuit breaker are functioning correctly.

---

## Cross-references

| Document | Relevance |
|----------|-----------|
| [ADR-0001: ECS Fargate as Default Compute](adr/0001-default-compute-ecs-fargate.md) | Decision to use ECS Fargate over EKS/Lambda |
| [ADR-0002: RTO/RPO Targets by Service Tier](adr/0002-rto-rpo-targets-by-service-tier.md) | Recovery objectives that drive environment sizing (3 AZs for Tier 1) |
| [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) | Rollback procedures (section 6.7), change management (section 5), monitoring (section 4) |
| [CHAOS_ENGINEERING.md](CHAOS_ENGINEERING.md) | Post-deployment validation experiments |
| [COMPLIANCE_MAPPING.md](COMPLIANCE_MAPPING.md) | Change management controls mapped to PCI-DSS and FCA SYSC |

---

*Last updated: 2026-02-11*
*Owner: Platform Engineering*

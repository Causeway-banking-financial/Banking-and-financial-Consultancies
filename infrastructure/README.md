# Infrastructure

Infrastructure as code (IaC) for the Causeway Banking Financial platform on AWS.
All resources are managed with Terraform.

## Layout

```
infrastructure/
  modules/
    networking/       VPC, subnets, NAT gateways, NACLs, flow logs
    compute/          ECS Fargate cluster, ALB, security groups
    data/             Aurora PostgreSQL, DynamoDB, S3 (encrypted)
    security/         KMS CMK, WAF Web ACL, IAM roles
    observability/    CloudWatch dashboard, alarms, log groups, SNS
  environments/
    nonprod/          Non-production (dev + staging) — 2 AZs, cost-optimised
    prod/             Production — 3 AZs, HA, stricter thresholds
  shared/
    ci-cd/            GitHub OIDC, IAM roles, Terraform state buckets
  policy/             AWS Config rules for automated compliance enforcement
  cost-guardrails/    AWS Budgets, Cost Anomaly Detection, tag enforcement
  chaos-engineering/  AWS FIS experiment templates for gamedays
```

## Module dependency graph

```
security ──┐
            ├──> networking ──> compute ──> data ──> observability
            │                      │
            └──────────────────────┘
```

Security (KMS, WAF, IAM) is provisioned first. Other modules reference the
KMS key ARN and WAF Web ACL ARN as inputs.

## Environments

| Environment | Region | AZs | NAT Gateways | Aurora Instances | Purpose |
|-------------|--------|-----|--------------|------------------|---------|
| nonprod | eu-west-1 | 2 | 1 (shared) | 2 (medium) | Dev + staging |
| prod | eu-west-1 | 3 | 3 (per AZ) | 3 (large) | Production |

## Deploying

### Prerequisites

1. Deploy `shared/ci-cd/` first — creates state buckets, OIDC provider, IAM roles.
2. Set GitHub repository secrets:
   - `TERRAFORM_PLAN_ROLE_ARN` — read-only role for PR plans
   - `TERRAFORM_APPLY_ROLE_ARN` — write role for nonprod apply
   - `TERRAFORM_APPLY_ROLE_ARN_PROD` — write role for prod apply
3. Create GitHub environments (`nonprod`, `production`) with appropriate
   protection rules.

### Workflow

1. **PR opened** → `terraform-plan.yml` runs plan for both environments,
   comments the diff on the PR.
2. **PR merged to main** → `terraform-apply-nonprod.yml` auto-applies to nonprod.
3. **Manual trigger** → `terraform-apply-prod.yml` requires typing "apply" and
   manual approval in the `production` GitHub environment.

## Standards

- Use IaC for all AWS resources. No console-created resources.
- Separate prod and nonprod accounts and Terraform state.
- Keep secrets out of git — use Secrets Manager or SSM Parameter Store.
- Apply tagging standards: `Project`, `Environment`, `ManagedBy` on every resource.
- All modules require `terraform fmt` and `terraform validate` to pass.

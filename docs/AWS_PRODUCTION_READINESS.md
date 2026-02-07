# AWS Production Readiness

This checklist defines the minimum standard for hosting Causeway Banking
Financial workloads on AWS. It is designed for regulated, high-trust systems
with strict security and resilience expectations.

## Baseline architecture

- Multi-account setup (prod, non-prod, shared services, security)
- Centralized identity and logging
- Multi-AZ networking with segmented subnets
- Edge protection with WAF and DDoS controls
- Managed data services with encryption and backups

## Readiness checklist

### Account and governance

- AWS Control Tower or equivalent landing zone in place
- Centralized billing, tagging, and cost allocation
- AWS Config and Security Hub enabled in all accounts
- GuardDuty enabled in all accounts and regions
- CloudTrail enabled and log integrity protected

### Identity and access

- SSO enforced with MFA for all users
- No long-lived access keys for humans
- Least-privilege roles and per-service IAM boundaries
- Break-glass access documented and audited

### Network and edge

- VPCs segmented by environment and trust zone
- Ingress restricted through CloudFront and WAF
- Security groups and NACLs reviewed and documented
- Private subnets for data stores and internal services

### Compute

- Workloads deploy across at least two AZs
- Autoscaling configured with tested limits
- Immutable images or deployable artifacts
- No SSH access to production hosts

### Data protection

- Encryption at rest using KMS CMKs for sensitive data
- TLS 1.2+ for all ingress and service-to-service traffic
- Backups automated and tested with restore drills
- Data retention and deletion policies documented

### Observability and operations

- Centralized logging with retention and alerting
- Metrics and dashboards tied to SLOs
- Alert routing and on-call coverage defined
- Incident runbook reviewed and accessible

### CI/CD and change management

- Infrastructure as code used for all AWS resources
- Automated security and configuration checks in CI
- Manual approval gate for production deploys
- Rollback strategy documented and tested

### Resilience and disaster recovery

- RTO and RPO targets defined per service
- Multi-AZ and multi-region strategy documented
- Regular DR exercises with evidence of results

## Financial industry considerations

- Data classification controls applied to PII and financial records
- Audit trails retained according to policy
- Vendor and third-party risk assessed before integration
- Regulatory requirements mapped but not assumed as compliance

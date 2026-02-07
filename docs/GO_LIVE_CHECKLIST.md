# Go-live checklist

Use this checklist before launching production services.

## Security and compliance

- [ ] Data classification completed and controls applied
- [ ] IAM least privilege verified
- [ ] Secrets stored in Secrets Manager or SSM
- [ ] WAF rules in place and tested
- [ ] Vulnerability scanning configured

## Reliability and resilience

- [ ] Multi-AZ architecture verified
- [ ] Autoscaling policies tested
- [ ] Backups enabled and restore tested
- [ ] RTO/RPO defined and documented

## Observability

- [ ] Logging centralized with retention set
- [ ] Metrics dashboards aligned to SLOs
- [ ] Alert routing and on-call configured

## Deployment readiness

- [ ] CI/CD pipeline approvals in place
- [ ] Rollback plan documented
- [ ] Change window scheduled if required

## DNS and domain

- [ ] ACM certificate issued for finance.causewaygrp.com
- [ ] DNS record points to CloudFront or ALB
- [ ] HTTPS enforced and HSTS enabled

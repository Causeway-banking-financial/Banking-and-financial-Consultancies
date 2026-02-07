# Domain setup for finance.causewaygrp.com

This document describes the steps required to bring
`finance.causewaygrp.com` live on AWS.

## Prerequisites

- Domain ownership verified for `causewaygrp.com`.
- Access to the DNS provider (Route 53 or external).
- Target AWS account and region selected.

## TLS certificates

1. Request an ACM certificate for `finance.causewaygrp.com`.
2. If using CloudFront, request the certificate in **us-east-1**.
3. Validate via DNS.

## Recommended edge configuration

Use CloudFront with AWS WAF in front of an Application Load Balancer (ALB).

- CloudFront provides caching, TLS termination, and edge protection.
- WAF enforces managed rules and rate limiting.
- ALB routes to your service tier.

## DNS records

### With CloudFront (recommended)

- Create an A/AAAA alias record for `finance.causewaygrp.com`
  pointing to the CloudFront distribution.
- Use the ACM certificate in us-east-1.

### With ALB only (not preferred for public traffic)

- Create an A/AAAA alias record for `finance.causewaygrp.com`
  pointing to the ALB in the target region.
- Use an ACM certificate in the same region as the ALB.

## Security hardening

- Enforce TLS 1.2+ and modern cipher suites.
- Enable HSTS at the edge.
- Add a CAA record to restrict certificate issuance.
- Disable HTTP and redirect to HTTPS.

## Validation

- Confirm the certificate is issued and in use.
- Run a TLS scan and confirm no weak ciphers.
- Verify WAF logs and blocked request visibility.
- Validate health checks and origin reachability.

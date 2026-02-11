# Threat Model -- Causeway Banking Financial Platform

| Field              | Value                                                        |
|--------------------|--------------------------------------------------------------|
| Document owner     | Security Engineering, Causeway Banking Financial             |
| Classification     | Confidential                                                 |
| Version            | 1.0                                                          |
| Last reviewed      | 2026-02-11                                                   |
| Next review        | 2026-05-11                                                   |
| Methodology        | STRIDE (Microsoft Threat Modeling)                           |
| Scope              | Production AWS environment -- finance.causewaygrp.com        |

---

## 1. Purpose and Scope

This document provides a structured threat model for the Causeway Banking
Financial platform using the STRIDE methodology. It identifies threats to the
confidentiality, integrity, and availability of platform components, assesses
risk, and maps each threat to existing or required mitigations.

### 1.1 Objectives

- Identify and classify threats across all architectural tiers.
- Ensure mitigations are traceable to security controls documented in
  [AWS_PRODUCTION_READINESS.md](AWS_PRODUCTION_READINESS.md) and
  [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md).
- Provide a risk-prioritised backlog for security remediation.
- Satisfy regulatory and audit requirements for threat analysis in financial
  services (FCA, PRA operational resilience expectations).

### 1.2 In scope

- All production infrastructure in AWS accounts (eu-west-1 primary, eu-west-2 DR).
- The public domain finance.causewaygrp.com and all subdomains.
- Data classified as Confidential or Restricted per the data classification policy.
- CI/CD pipelines that deploy to production.
- Third-party integrations that process or store customer data.

### 1.3 Out of scope

- Corporate IT endpoints and end-user devices (covered by separate policy).
- Physical security of AWS data centres (covered by AWS shared responsibility model).
- Non-production environments (dev, staging) except where they can impact production.

---

## 2. System Overview

### 2.1 Architecture summary

```
                         Internet
                            |
                   +-----------------+
                   | Route 53 (DNS)  |
                   +-----------------+
                            |
              +----------------------------+
              | CloudFront + WAF + Shield  |
              +----------------------------+
                            |
                   +-----------------+
                   |  ALB (multi-AZ) |    Public subnet
              -----+-----------------+---------------------
                            |             Private subnet
                   +-----------------+
                   |  ECS Fargate    |
                   |  (Service Tier) |
                   +-----------------+
                     |      |      |
          +----------+------+------+----------+
          |          |             |           |
   +------+---+ +---+------+ +---+---+ +-----+--------+
   | Aurora    | | DynamoDB | |  S3   | | SQS/SNS/     |
   | PostgreSQL| |          | |       | | EventBridge  |
   +-----------+ +----------+ +-------+ +--------------+
                                              |
                                     +--------+--------+
                                     | Lambda / Async  |
                                     | Consumers       |
                                     +-----------------+

Cross-cutting: KMS | IAM | Secrets Manager | CloudTrail | CloudWatch | GuardDuty
```

### 2.2 Key components

| Component           | Purpose                                    | Data classification |
|---------------------|--------------------------------------------|---------------------|
| CloudFront + WAF    | Edge caching, DDoS protection, geo-filter  | Public / Internal   |
| Shield Advanced     | Volumetric DDoS mitigation                 | N/A (control plane) |
| ALB                 | Layer 7 load balancing, TLS termination    | Internal            |
| ECS Fargate         | Application compute (stateless containers) | Confidential        |
| Aurora PostgreSQL   | Relational data (accounts, transactions)   | Restricted          |
| DynamoDB            | Session state, key-value lookups            | Confidential        |
| S3                  | Document storage, audit logs, backups       | Restricted          |
| SQS / SNS          | Asynchronous message processing             | Confidential        |
| EventBridge         | Event routing and integration               | Confidential        |
| KMS                 | Encryption key management                   | Restricted          |
| Secrets Manager     | Credential and secret storage               | Restricted          |
| IAM                 | Identity and access control                 | Restricted          |
| CloudTrail          | API audit logging                           | Restricted          |
| Route 53            | DNS resolution and health checks            | Internal            |

### 2.3 Trust boundaries

The following trust boundaries define transitions between zones of differing
trust levels. Each boundary represents a point where authentication,
authorisation, or data validation must be enforced.

```
TB-1: Internet --> CloudFront/WAF edge
     (Untrusted public traffic enters the platform perimeter)

TB-2: CloudFront --> ALB
     (Edge-validated traffic enters the VPC via private origin)

TB-3: ALB --> ECS Fargate application containers
     (Infrastructure layer hands off to application code)

TB-4: ECS Fargate --> Data tier (Aurora, DynamoDB, S3)
     (Application code accesses persistent stores containing Restricted data)

TB-5: ECS Fargate --> Async messaging (SQS, SNS, EventBridge)
     (Service-to-service communication across asynchronous channels)

TB-6: AWS control plane --> All resources
     (IAM principals with API access can modify infrastructure and data)

TB-7: CI/CD pipeline --> Production AWS accounts
     (Deployment tooling can modify running infrastructure)
```

**Trust boundary diagram:**

```
+===================================================================+
|  UNTRUSTED ZONE (Internet)                                  TB-1  |
+===================================================================+
        |
+-------v-----------------------------------------------------------+
|  EDGE ZONE (CloudFront, WAF, Shield)                              |
|  - Rate limiting, geo-blocking, bot detection                     |
+-------------------------------------------------------------------+
        |                                                       TB-2
+-------v-----------------------------------------------------------+
|  DMZ / PUBLIC SUBNET (ALB)                                        |
|  - TLS termination, health checks, routing rules                  |
+-------------------------------------------------------------------+
        |                                                       TB-3
+-------v-----------------------------------------------------------+
|  APPLICATION ZONE / PRIVATE SUBNET (ECS Fargate)                  |
|  - Business logic, authn/authz enforcement, input validation      |
+-------------------------------------------------------------------+
        |                            |                          TB-4 / TB-5
+-------v-----------------+  +------v--------------------------+
|  DATA ZONE              |  |  MESSAGING ZONE                 |
|  Aurora, DynamoDB, S3   |  |  SQS, SNS, EventBridge          |
|  - Encryption at rest   |  |  - Message signing, DLQ config   |
+--------------------------+  +--------------------------------+
```

---

## 3. STRIDE Threat Analysis

Each subsection below addresses one STRIDE category. Threats are numbered with
a category prefix (S, T, R, I, D, E) for cross-referencing.

### 3.1 Spoofing

Threats where an attacker assumes the identity of a legitimate user, service,
or component.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| S-01 | **Credential stuffing / brute force against customer login.** Attacker uses leaked credential lists to authenticate as legitimate customers. | ECS Fargate (authentication service), ALB | **Critical** | WAF rate-limiting rules on authentication endpoints. Account lockout after 5 failed attempts with exponential backoff. MFA enforced for all customer accounts handling financial transactions. CAPTCHA challenge on suspicious login patterns. Real-time anomaly detection via GuardDuty and application-level behavioural analysis. | Residual risk is **Low** if MFA adoption exceeds 95%. Accounts without MFA remain at elevated risk; monitor MFA enrollment rates and enforce MFA for high-value operations. |
| S-02 | **Stolen or leaked IAM credentials used to access AWS resources.** Long-lived access keys or compromised SSO sessions allow an attacker to impersonate an operator or service. | IAM, AWS control plane (TB-6) | **Critical** | No long-lived access keys for human users (enforced via SCP). SSO with hardware MFA required for all console and CLI access. Session duration capped at 1 hour for privileged roles. IAM Access Analyzer enabled to detect unused or overly broad permissions. GuardDuty alerts on anomalous API calls (unusual region, time, or volume). Automatic key rotation for service accounts via Secrets Manager. | Residual risk is **Low**. Temporary credential theft (STS tokens) remains possible during the session window; mitigated by short session duration and CloudTrail monitoring. |
| S-03 | **DNS hijacking or spoofing of finance.causewaygrp.com.** Attacker modifies DNS records to redirect users to a malicious endpoint, intercepting credentials or data. | Route 53, CloudFront | **High** | DNSSEC enabled on the causewaygrp.com hosted zone. Route 53 registrar lock enabled. CAA DNS records restrict certificate issuance to authorised CAs only. Certificate Transparency log monitoring for unauthorised certificate issuance. CloudTrail logging of all Route 53 API calls with alerts on record changes. | Residual risk is **Low**. Registrar-level compromise is extremely rare but not impossible; mitigated by registrar lock and MFA on the registrar account. |
| S-04 | **Service-to-service impersonation within the VPC.** A compromised container or rogue workload sends requests to internal services pretending to be a legitimate service. | ECS Fargate, ALB, SQS/SNS (TB-3, TB-5) | **High** | IAM task roles scoped per service (no shared roles). Security groups restrict network access to only required ports and destinations. Service mesh or mutual TLS (mTLS) for inter-service communication where required. SQS queue policies restrict senders by IAM principal. CloudTrail and VPC Flow Logs provide forensic traceability. | Residual risk is **Medium**. If a container is fully compromised, the attacker inherits its IAM task role permissions. Mitigated by least-privilege role design and anomaly detection. |

### 3.2 Tampering

Threats where an attacker modifies data, code, or configuration without
authorisation.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| T-01 | **Modification of financial transaction data in transit.** Attacker performs a man-in-the-middle attack to alter transaction amounts, account numbers, or other payment details between client and server. | CloudFront, ALB, ECS Fargate (TB-1, TB-2, TB-3) | **Critical** | TLS 1.2+ enforced at all layers (CloudFront, ALB, internal). HSTS headers with long max-age and includeSubDomains. CloudFront configured with a security policy that disables legacy TLS and weak cipher suites. Certificate pinning for mobile clients. End-to-end message integrity checks (HMAC) for high-value transaction payloads. | Residual risk is **Low**. TLS downgrade attacks are mitigated by strict policy; residual risk limited to zero-day TLS vulnerabilities. |
| T-02 | **Tampering with container images or deployment artifacts.** Attacker compromises the CI/CD pipeline or container registry to inject malicious code into production images. | ECR, CI/CD pipeline, ECS Fargate (TB-7) | **Critical** | Container images signed and verified before deployment (Docker Content Trust or Sigstore). ECR image scanning enabled with critical/high vulnerability blocking. CI/CD pipeline enforces branch protection, required reviews, and signed commits. Immutable image tags used in task definitions (digest-based references). Deployment requires manual approval gate for production. Infrastructure as code changes audited via pull request. | Residual risk is **Medium**. A compromised developer workstation with approval authority could bypass controls. Mitigated by requiring two-person approval and workstation security policy. |
| T-03 | **Unauthorised modification of data at rest in Aurora or DynamoDB.** Attacker with database access (via compromised application or credential) alters financial records. | Aurora PostgreSQL, DynamoDB (TB-4) | **Critical** | Application-level audit logging of all write operations with before/after values. Database audit logging enabled (Aurora pgAudit, DynamoDB Streams). Row-level integrity checks (hash columns) for critical financial tables. Database credentials rotated automatically via Secrets Manager. IAM database authentication where supported. Read replicas used for reporting to reduce direct writer access. Point-in-time recovery enabled with 1-minute granularity. | Residual risk is **Medium**. A compromised application with write access can modify data within its authorised scope. Mitigated by audit trail, anomaly detection, and segregation of duties in application logic. |
| T-04 | **Tampering with CloudTrail logs or audit evidence.** Attacker deletes or modifies audit logs to cover their tracks after a breach. | CloudTrail, S3 (log archive) | **High** | CloudTrail log file integrity validation enabled. Logs delivered to a dedicated security account with cross-account write-only access. S3 bucket with Object Lock (WORM) and versioning enabled. Bucket policy denies deletion by all principals except break-glass role. CloudWatch alarm on CloudTrail configuration changes (StopLogging, DeleteTrail). | Residual risk is **Low**. An attacker would need to compromise the security account (separate AWS account with restricted access) to tamper with logs. |
| T-05 | **Message tampering in asynchronous queues.** Attacker modifies messages in SQS or SNS to alter business logic outcomes (e.g., changing a transaction approval to a different amount). | SQS, SNS, EventBridge (TB-5) | **High** | SQS server-side encryption (SSE-KMS) for all queues. SQS queue access policies restrict producers and consumers by IAM principal. Application-level message signing (HMAC) for critical business events. Dead letter queues configured with alerting on unexpected message patterns. EventBridge rules scoped to specific event sources and detail types. | Residual risk is **Low**. Message integrity is enforced by IAM policy and application-level signing; residual risk requires IAM credential compromise. |

### 3.3 Repudiation

Threats where an actor denies performing an action and there is insufficient
evidence to prove otherwise.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| R-01 | **Customer denies initiating a financial transaction.** A customer or fraudster claims a legitimate transaction was unauthorised, and the platform cannot prove otherwise. | ECS Fargate (application layer), Aurora PostgreSQL | **High** | All transaction requests logged with: timestamp, source IP, device fingerprint, session ID, authenticated user identity, and MFA confirmation status. Transaction confirmation workflow with customer acknowledgement (e.g., OTP or in-app approval for high-value transfers). Immutable audit log stored in the security account S3 bucket with Object Lock. Digital signatures on transaction records where regulatory requirements demand it. | Residual risk is **Low**. Disputes may still occur but the platform holds sufficient evidence for regulatory and legal proceedings. |
| R-02 | **Operator denies making a privileged infrastructure change.** An administrator modifies a security group, IAM policy, or database configuration and denies responsibility. | IAM, AWS control plane, Aurora, ECS | **High** | CloudTrail enabled in all accounts and regions with log file integrity validation. All API calls are attributable to a named IAM principal (no shared credentials). Privileged operations require break-glass access with documented justification. AWS Config records configuration state over time for comparison. Change management process requires pre-approved change requests linked to CloudTrail events. | Residual risk is **Low**. CloudTrail provides cryptographically verifiable attribution for all AWS API calls. |
| R-03 | **Service-to-service actions cannot be attributed to the originating request.** An internal service processes a message from a queue but the original request context (user, session, intent) is lost, making it impossible to trace responsibility. | SQS, SNS, EventBridge, ECS Fargate (TB-5) | **Medium** | Correlation ID propagated through all synchronous and asynchronous calls. Messages include the originating user identity, session ID, and request ID as metadata. Centralised structured logging (CloudWatch Logs) with correlation ID indexing. X-Ray distributed tracing enabled across all services with trace ID linked to the audit trail. | Residual risk is **Low**. Requires discipline in propagating correlation IDs; enforced by shared middleware libraries and integration tests. |
| R-04 | **CI/CD deployment actions are not attributable to a specific engineer.** A production deployment is made but it is unclear who approved or triggered it, complicating incident response. | CI/CD pipeline (TB-7), ECS Fargate | **Medium** | CI/CD system (GitHub Actions) enforces authenticated triggers with SSO identity. Deployment approval is logged with approver identity and timestamp. Git commits are signed and linked to verified identities. Deployment events published to a centralised audit stream. All production deployments require at least two approvals (four-eyes principle). | Residual risk is **Low**. The combination of Git signing, CI/CD audit logs, and approval gates provides strong attribution. |

### 3.4 Information Disclosure

Threats where sensitive data is exposed to unauthorised parties.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| I-01 | **Exposure of customer PII or financial records through application vulnerability.** SQL injection, IDOR, or other application flaws allow an attacker to extract Restricted data from Aurora or DynamoDB. | ECS Fargate, Aurora PostgreSQL, DynamoDB (TB-3, TB-4) | **Critical** | Parameterised queries enforced (no dynamic SQL). Input validation and output encoding at the application layer. SAST and DAST scanning in the CI/CD pipeline. Regular third-party penetration testing (annual minimum, quarterly for Tier 1 services). Application-level access control with row-level filtering for multi-tenant data. WAF managed rule sets for SQL injection and common attack patterns. | Residual risk is **Medium**. Zero-day application vulnerabilities remain possible. Mitigated by defence in depth (WAF, application controls, database permissions) and rapid patching process. |
| I-02 | **S3 bucket misconfiguration exposes sensitive documents or backups.** A bucket containing customer documents, database backups, or audit logs is made publicly accessible due to a misconfiguration. | S3 (TB-4) | **Critical** | S3 Block Public Access enabled at the account level (enforced via SCP). Bucket policies deny all public access. AWS Config rule monitors for public bucket configurations and auto-remediates. All buckets encrypted with KMS CMKs (SSE-KMS). Access logging enabled on all buckets containing Restricted data. Terraform modules enforce secure defaults; manual bucket creation is prohibited. | Residual risk is **Low**. Account-level Block Public Access makes individual bucket misconfiguration ineffective as an attack vector. |
| I-03 | **Secrets or credentials leaked in application logs, error messages, or source code.** Database passwords, API keys, or KMS key material appears in CloudWatch Logs, error responses, or Git history. | CloudWatch Logs, ECS Fargate, Git repository | **High** | All secrets stored in Secrets Manager with automatic rotation. Application logging framework configured to redact known secret patterns (credit card numbers, passwords, tokens). Pre-commit hooks scan for secrets (e.g., git-secrets, truffleHog). CI pipeline includes secret detection scanning. CloudWatch Logs encrypted with KMS. Error responses to clients return generic messages with correlation IDs only (no stack traces or internal details). | Residual risk is **Medium**. Novel secret patterns may evade redaction filters. Mitigated by periodic log review and expanding redaction patterns. |
| I-04 | **Data exfiltration via compromised ECS task or insider threat.** An attacker with access to a running container exfiltrates data to an external endpoint. | ECS Fargate, VPC, Aurora PostgreSQL, S3 (TB-4) | **Critical** | ECS tasks run in private subnets with no direct internet access. Outbound traffic routed through NAT Gateway with VPC Flow Logs monitoring. Egress filtering via security groups and network ACLs restricts outbound destinations. S3 VPC endpoints with bucket policies restricting access to the VPC. DynamoDB and other services accessed via VPC endpoints. GuardDuty monitors for unusual outbound data transfer patterns. Data loss prevention (DLP) rules on sensitive data egress paths. | Residual risk is **Medium**. A sophisticated attacker may use allowed outbound paths (e.g., HTTPS to permitted endpoints). Mitigated by anomaly detection, VPC Flow Log analysis, and least-privilege network rules. |
| I-05 | **Cross-region replication exposes data in a less-secured DR environment.** Data replicated to eu-west-2 for DR purposes is accessible with weaker controls than the primary region. | Aurora (cross-region replica), DynamoDB (global tables), S3 (CRR) | **High** | DR region (eu-west-2) applies identical security controls as the primary (enforced by Terraform applying to both regions). KMS keys are region-specific; DR region uses its own CMK with equivalent access policies. IAM policies, security groups, and bucket policies are consistent across regions. AWS Config and Security Hub enabled in both regions. Quarterly DR security audit validates parity of controls. | Residual risk is **Low**. Infrastructure drift between regions is the primary risk; mitigated by CI/CD applying changes to both regions simultaneously. |

### 3.5 Denial of Service

Threats that degrade or destroy the availability of the platform.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| D-01 | **Volumetric DDoS attack against finance.causewaygrp.com.** Large-scale network-level flood (SYN, UDP, amplification) overwhelms the platform edge and prevents legitimate access. | CloudFront, Route 53, ALB | **High** | AWS Shield Advanced enabled with DDoS Response Team (DRT) engagement. CloudFront absorbs and distributes volumetric traffic across the global edge network. Route 53 health checks with DNS failover to a static maintenance page if origin becomes unreachable. WAF rate-limiting rules cap requests per IP. Operational runbook includes Shield Advanced escalation procedures. 24/7 monitoring with automated alerting on traffic anomalies. | Residual risk is **Low**. Shield Advanced provides contractual DDoS cost protection and proactive engagement. Residual risk limited to novel attack vectors not yet in Shield signatures. |
| D-02 | **Application-layer DDoS (Layer 7) targeting expensive API endpoints.** Attacker sends legitimate-looking requests to computationally expensive endpoints (e.g., report generation, complex queries) to exhaust application resources. | WAF, ALB, ECS Fargate (TB-1, TB-2, TB-3) | **High** | WAF rate-limiting rules per endpoint and per authenticated user. Expensive operations are asynchronous (submitted to SQS, processed by background workers with controlled concurrency). ECS auto-scaling with maximum task limits to prevent runaway cost. Circuit breaker patterns in the application to shed load gracefully. API gateway throttling per client and per endpoint. Request timeouts configured at ALB (60s) and application level. | Residual risk is **Medium**. Sophisticated L7 attacks that mimic legitimate traffic may bypass rate limits temporarily. Mitigated by behavioural analysis and manual WAF rule updates during incidents. |
| D-03 | **Resource exhaustion via SQS/EventBridge message flooding.** Attacker or buggy producer floods queues with messages, overwhelming consumer capacity and causing backpressure that degrades the entire platform. | SQS, EventBridge, ECS Fargate (TB-5) | **Medium** | SQS queue policies restrict message producers by IAM principal. Dead letter queues configured with maxReceiveCount to isolate poison messages. CloudWatch alarms on queue depth thresholds trigger scaling and alert on-call. EventBridge rules use input transformation and filtering to reject malformed events. Consumer services implement backpressure and circuit breakers. Maximum concurrency limits on Lambda consumers. | Residual risk is **Low**. Controlled producer access and DLQ handling contain the blast radius. |
| D-04 | **Aurora database exhaustion via connection flooding or expensive queries.** Attacker or application bug opens excessive database connections or executes queries that consume all available IOPS and CPU. | Aurora PostgreSQL (TB-4) | **High** | Connection pooling enforced at the application layer (e.g., PgBouncer or RDS Proxy). Aurora auto-scaling read replicas for read-heavy workloads. Query timeout configured at the database level (statement_timeout). Slow query logging enabled with alerts on queries exceeding thresholds. Database performance insights enabled for real-time monitoring. Max connections limited per application service via IAM database authentication. | Residual risk is **Medium**. A compromised application can still issue expensive queries within its authorised connection pool. Mitigated by query analysis, circuit breakers, and read replica offloading. |
| D-05 | **Region-wide AWS outage affecting eu-west-1.** A rare but documented scenario where the primary AWS region experiences prolonged service degradation or outage. | All components in eu-west-1 | **High** | Cross-region DR strategy implemented per [ADR-0003](adr/0003-cross-region-dr-strategy.md). Tier 1 services: active-passive warm standby in eu-west-2, 15-minute RTO. Tier 2 services: pilot light in eu-west-2, 1-hour RTO. Route 53 health checks with automated alerting and semi-automated failover. Quarterly DR drills with documented results. | Residual risk is **Medium**. Failover is semi-automated (requires human approval) and replication lag may cause up to 1 minute of data loss (RPO). Accepted per [ADR-0002](adr/0002-rto-rpo-targets-by-service-tier.md). |

### 3.6 Elevation of Privilege

Threats where an attacker gains higher-level permissions than authorised.

| ID   | Threat description | Affected component | Risk | Mitigation | Residual risk |
|------|--------------------|--------------------|------|------------|---------------|
| E-01 | **Container escape from ECS Fargate task.** An attacker exploits a vulnerability in the container runtime or Fargate platform to break out of the container sandbox and access the underlying host or other tenants' workloads. | ECS Fargate (TB-3) | **Critical** | Fargate uses AWS-managed infrastructure with kernel isolation (Firecracker microVM). Containers run as non-root users (enforced in task definitions). No privileged mode or host networking permitted (enforced via SCP). Base images are minimal and patched on a defined cadence. Runtime security monitoring via GuardDuty ECS Runtime Monitoring. Rapid patching process for container runtime CVEs. | Residual risk is **Low**. Fargate's Firecracker isolation significantly limits the blast radius of container escapes. Residual risk is a zero-day in Firecracker itself, which is managed by AWS. |
| E-02 | **IAM privilege escalation via overly permissive policies.** An attacker with limited IAM access discovers a misconfigured role or policy that allows them to escalate to administrative privileges (e.g., iam:PassRole, iam:CreatePolicyVersion). | IAM, AWS control plane (TB-6) | **Critical** | IAM Access Analyzer enabled to identify unused permissions and overly broad policies. SCPs enforce permission boundaries at the organisation level (deny wildcards on sensitive actions). IAM permission boundaries applied to all non-admin roles. Quarterly IAM access reviews with automated reporting. No wildcard (`*`) resource permissions permitted outside sandbox accounts. iam:PassRole restricted to specific role ARNs per service. Break-glass roles require MFA and are time-limited via STS. | Residual risk is **Medium**. Complex IAM policies may contain unintended escalation paths. Mitigated by continuous analysis (IAM Access Analyzer) and external audits. |
| E-03 | **Application-level privilege escalation.** A standard user manipulates API requests (e.g., IDOR, parameter tampering) to access admin functions or other users' data. | ECS Fargate (application layer) (TB-3) | **High** | Role-based access control (RBAC) enforced at the API layer with server-side authorisation checks on every request. Indirect object references or UUIDs used instead of sequential IDs. Authorisation logic centralised in shared middleware (not duplicated per endpoint). Automated authorisation testing in the CI/CD pipeline (e.g., DAST with authenticated scans). Penetration testing specifically targets privilege escalation scenarios. | Residual risk is **Medium**. Authorisation bugs in application code remain the most common source of privilege escalation. Mitigated by centralised enforcement, code review, and testing. |
| E-04 | **Secrets Manager or KMS key policy misconfiguration grants excessive access.** A misconfigured KMS key policy or Secrets Manager resource policy allows unintended principals to decrypt data or retrieve secrets. | KMS, Secrets Manager (TB-6) | **High** | KMS key policies follow least privilege and explicitly deny access from non-approved accounts. Key policies reviewed as part of infrastructure-as-code pull requests. AWS Config rules monitor for KMS and Secrets Manager policy changes. Secrets Manager resource policies restrict access to specific IAM roles. Encryption context required for all KMS Decrypt operations (prevents key reuse across unrelated services). CloudTrail logging of all KMS and Secrets Manager API calls with alerts on unusual access patterns. | Residual risk is **Low**. Policy-as-code and automated Config rules catch misconfigurations before they reach production. |
| E-05 | **Lateral movement from a compromised async consumer to data tier.** An attacker compromises an SQS consumer Lambda or ECS task and leverages its IAM role to access databases or S3 buckets beyond its intended scope. | SQS consumer (Lambda/ECS), Aurora, S3, DynamoDB (TB-4, TB-5) | **High** | Each consumer service has a dedicated IAM task role with permissions scoped to the exact resources it requires. Database access restricted to specific tables/schemas per service. S3 bucket policies restrict access by IAM principal and VPC endpoint. VPC security groups limit network-level access between services. GuardDuty monitors for anomalous API call patterns from task roles. Regular review of IAM role permissions as part of service onboarding and quarterly audit. | Residual risk is **Medium**. A compromised consumer retains access to its own authorised resources. Blast radius is contained by least-privilege design but not eliminated. |

---

## 4. Risk Matrix Summary

The following matrix summarises all identified threats by likelihood and impact.
Risk rating is derived from the combination of likelihood (how probable the
threat is given existing controls) and impact (the consequence if the threat
materialises).

### 4.1 Risk rating definitions

| Rating       | Description |
|--------------|-------------|
| **Critical** | Immediate and severe impact on customer data, financial integrity, or platform availability. Regulatory consequences likely. Requires immediate mitigation. |
| **High**     | Significant impact on confidentiality, integrity, or availability. May affect multiple customers or services. Requires mitigation within current quarter. |
| **Medium**   | Moderate impact, typically contained to a single service or limited data exposure. Requires mitigation within the next two quarters. |
| **Low**      | Minor impact with limited scope. Acceptable risk with monitoring. Review during next scheduled assessment. |

### 4.2 Threat summary by category and rating

| STRIDE Category         | Critical | High | Medium | Low | Total |
|-------------------------|----------|------|--------|-----|-------|
| Spoofing                | 2        | 2    | 0      | 0   | 4     |
| Tampering               | 3        | 2    | 0      | 0   | 5     |
| Repudiation             | 0        | 2    | 2      | 0   | 4     |
| Information Disclosure  | 3        | 2    | 0      | 0   | 5     |
| Denial of Service       | 0        | 4    | 1      | 0   | 5     |
| Elevation of Privilege  | 2        | 3    | 0      | 0   | 5     |
| **Total**               | **10**   | **15** | **3** | **0** | **28** |

### 4.3 Risk heat map

```
                          IMPACT
                 Low     Medium    High    Critical
            +----------+--------+--------+----------+
 Likely     |          |        | D-02   |          |
            +----------+--------+--------+----------+
 Possible   |          | D-03   | S-04   | S-01     |
 LIKELIHOOD |          | R-03   | D-04   | T-01     |
            |          | R-04   | E-03   | T-02     |
            |          |        | E-05   | T-03     |
            |          |        |        | I-01     |
            |          |        |        | I-04     |
            |          |        |        | E-01     |
            |          |        |        | E-02     |
            +----------+--------+--------+----------+
 Unlikely   |          |        | S-03   | I-02     |
            |          |        | T-04   |          |
            |          |        | T-05   |          |
            |          |        | I-03   |          |
            |          |        | I-05   |          |
            |          |        | D-01   |          |
            |          |        | D-05   |          |
            |          |        | E-04   |          |
            +----------+--------+--------+----------+
 Rare       |          |        | R-01   |          |
            |          |        | R-02   |          |
            +----------+--------+--------+----------+
```

### 4.4 Residual risk summary after mitigations

| Residual risk | Count | Threat IDs |
|---------------|-------|------------|
| **Low**       | 16    | S-01, S-02, S-03, T-01, T-04, T-05, R-01, R-02, R-03, R-04, I-02, I-05, D-01, D-03, E-01, E-04 |
| **Medium**    | 12    | S-04, T-02, T-03, I-01, I-03, I-04, D-02, D-04, D-05, E-02, E-03, E-05 |
| **High**      | 0     | -- |
| **Critical**  | 0     | -- |

All threats have been mitigated to Medium or Low residual risk. No threats
carry a High or Critical residual risk rating. Threats with Medium residual
risk are tracked in the security backlog and reviewed quarterly.

---

## 5. Trust Boundary Threat Coverage

This section maps threats to trust boundaries to ensure complete coverage.

| Trust boundary | Threats | Coverage |
|----------------|---------|----------|
| TB-1: Internet to CloudFront/WAF | S-01, S-03, T-01, D-01, D-02 | Complete |
| TB-2: CloudFront to ALB | T-01, D-01, D-02 | Complete |
| TB-3: ALB to ECS Fargate | S-04, T-01, I-01, E-01, E-03 | Complete |
| TB-4: ECS to Data tier | T-03, I-01, I-04, I-05, D-04, E-05 | Complete |
| TB-5: ECS to Messaging | S-04, T-05, R-03, D-03, E-05 | Complete |
| TB-6: AWS control plane | S-02, T-04, R-02, E-02, E-04 | Complete |
| TB-7: CI/CD to Production | T-02, R-04 | Complete |

---

## 6. Regulatory and Compliance Mapping

The following table maps key threats to relevant regulatory expectations for
UK financial services.

| Regulatory area | Related threats | Control reference |
|-----------------|-----------------|-------------------|
| FCA SYSC 13 (Operational resilience) | D-01, D-02, D-04, D-05 | DR strategy (ADR-0003), RTO/RPO (ADR-0002) |
| PRA SS1/21 (Operational resilience) | D-05, T-03 | Cross-region failover, data integrity checks |
| GDPR Article 32 (Security of processing) | I-01, I-02, I-03, I-04 | Encryption, access control, logging |
| GDPR Article 33 (Breach notification) | I-01, I-04 | Incident response runbook, 72-hour notification |
| PCI DSS Requirement 6 (Secure development) | T-01, T-02, I-01, E-03 | SAST/DAST, code review, penetration testing |
| PCI DSS Requirement 10 (Audit trails) | R-01, R-02, R-03, R-04 | CloudTrail, application audit logs |

---

## 7. Review Cadence and Governance

### 7.1 Review schedule

| Activity | Frequency | Responsible party | Output |
|----------|-----------|-------------------|--------|
| Full STRIDE threat model review | Quarterly | Security Engineering + Platform Engineering | Updated THREAT_MODEL.md with version increment |
| Threat model review triggered by architecture change | Per change (within sprint) | Service owner + Security Engineering | Addendum or updated threat entries |
| Residual risk reassessment | Quarterly | Security Engineering | Updated residual risk ratings |
| Penetration test (external) | Annually (Tier 1 services quarterly) | Third-party security firm | Pen test report mapped to threat IDs |
| IAM access review | Quarterly | Security Engineering + Operations | Access review report, remediation tickets |
| DR drill with threat scenario | Quarterly (Tier 1), biannually (Tier 2) | Platform Engineering + Operations | DR drill report |
| Incident-driven threat review | Within 5 business days of Sev 1/Sev 2 incident | Security Engineering | Post-incident addendum to threat model |

### 7.2 Change triggers

This threat model must be reviewed and updated when any of the following occur:

- A new service or component is added to the architecture.
- A trust boundary is added, removed, or modified.
- A Sev 1 or Sev 2 security incident occurs.
- A significant vulnerability is discovered in a platform dependency.
- A new regulatory requirement is introduced.
- An external audit or penetration test identifies a gap not covered by this model.
- The DR strategy or region configuration changes.

### 7.3 Approval and sign-off

Each version of this document requires sign-off from:

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Head of Security Engineering | _________________ | __________ | __________ |
| Head of Platform Engineering | _________________ | __________ | __________ |
| Chief Information Security Officer (CISO) | _________________ | __________ | __________ |
| Compliance Officer | _________________ | __________ | __________ |

---

## 8. References

- [Architecture](ARCHITECTURE.md)
- [AWS Production Readiness](AWS_PRODUCTION_READINESS.md)
- [Data Classification](DATA_CLASSIFICATION.md)
- [Operations Runbook](OPERATIONS_RUNBOOK.md)
- [Security Policy](../SECURITY.md)
- [ADR-0002: RTO/RPO Targets](adr/0002-rto-rpo-targets-by-service-tier.md)
- [ADR-0003: Cross-Region DR Strategy](adr/0003-cross-region-dr-strategy.md)
- [Microsoft STRIDE Threat Modeling](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)

# Compliance Mapping

**Organisation:** Causeway Banking Financial
**Platform:** AWS-hosted financial services platform
**Document owner:** Head of Compliance / Chief Information Security Officer (CISO)
**Last reviewed:** 2026-02-11
**Next review:** 2026-08-11
**Classification:** Confidential

---

## Table of Contents

1. [Overview](#1-overview)
2. [PCI-DSS v4.0 Mapping](#2-pci-dss-v40-mapping)
3. [FCA SYSC Requirements Mapping](#3-fca-sysc-requirements-mapping)
4. [UK GDPR Mapping](#4-uk-gdpr-mapping)
5. [Control Evidence Matrix](#5-control-evidence-matrix)
6. [Audit and Review Schedule](#6-audit-and-review-schedule)
7. [Gap Analysis and Remediation Plan](#7-gap-analysis-and-remediation-plan)

---

## 1. Overview

### 1.1 Purpose

This document maps the regulatory and industry obligations that apply to the
Causeway Banking Financial platform to the specific technical and organisational
controls implemented across the AWS environment. It is intended to:

- Provide auditors and examiners with a single reference that traces each
  requirement to an implemented control and its supporting evidence.
- Enable the compliance and engineering teams to identify gaps, track
  remediation, and demonstrate continuous improvement.
- Support the annual compliance attestation cycle and ongoing supervisory
  engagement with the Financial Conduct Authority (FCA).

This document is maintained as a living artefact. It is reviewed on a
semi-annual basis and updated whenever material changes are made to the
platform architecture, data flows, or the regulatory landscape.

### 1.2 Applicable Regulations

| Regulation | Scope | Governing Body |
|---|---|---|
| **PCI-DSS v4.0** | Applies if the platform stores, processes, or transmits payment card data (cardholder data or sensitive authentication data). Current assessment: the platform integrates with a PCI-DSS Level 1 certified payment processor via tokenisation; however, certain components (API gateway, network segmentation, logging) fall within scope as they handle card-present or card-not-present transaction metadata. | PCI Security Standards Council |
| **FCA Handbook (SYSC)** | The platform operates under FCA authorisation. The Senior Management Arrangements, Systems and Controls (SYSC) sourcebook applies to governance, operational resilience, outsourcing, and information security. | Financial Conduct Authority (UK) |
| **UK GDPR / Data Protection Act 2018** | The platform processes personal data of UK data subjects including customers, employees, and third-party contacts. Processing activities include account management, transaction processing, KYC/AML checks, and marketing (where consent is obtained). | Information Commissioner's Office (ICO) |

### 1.3 Scope

**In scope:**

- All AWS accounts within the Causeway Banking Financial organisation
  (production, non-production, shared services, security).
- Primary region: eu-west-1 (Ireland). DR region: eu-west-2 (London).
- All services classified as Tier 1 (critical), Tier 2 (important), and
  Tier 3 (standard) as defined in ADR-0002.
- Infrastructure components: CloudFront, WAF, ALB, ECS Fargate, Aurora
  PostgreSQL, DynamoDB, S3, KMS, Secrets Manager, CloudWatch, CloudTrail,
  GuardDuty, Security Hub, AWS Config, VPC networking.
- Supporting processes: CI/CD pipelines, change management, incident response,
  disaster recovery, access management.

**Out of scope:**

- Third-party SaaS tools used by non-engineering business units (assessed
  separately under vendor risk management).
- Physical office security (covered by the corporate security policy).
- End-user devices (covered by the endpoint management policy).

### 1.4 Architecture Reference

The platform architecture is documented in `docs/ARCHITECTURE.md`. The
reference flow is:

```
Client -> CloudFront/WAF -> ALB -> ECS Fargate (Service Tier) -> Aurora/DynamoDB/S3 (Data Tier)
                |                      |
                |                      +-> Async events (SQS/SNS/EventBridge)
                +-> Static assets (S3)
```

All inbound traffic terminates TLS at the edge and is re-encrypted internally.
Sensitive data resides in private subnets with no direct internet access.
Service-to-service calls use mutual TLS where required.

### 1.5 Data Classification

Data handling follows the four-tier classification defined in
`docs/DATA_CLASSIFICATION.md`:

| Class | Examples | Key Controls |
|---|---|---|
| Public | Marketing content, public APIs docs | No confidentiality requirements |
| Internal | Internal wikis, operational metrics | Access restricted to employees/contractors |
| Confidential | Customer PII, business strategies | Encryption at rest/in transit, access logged |
| Restricted | Payment card data, financial records, KYC documents | KMS CMK encryption, strict least-privilege, full audit trail |

---

## 2. PCI-DSS v4.0 Mapping

### 2.1 Applicability Statement

Causeway Banking Financial integrates with a PCI-DSS Level 1 certified payment
processor. The platform does not store raw primary account numbers (PANs) in its
own data stores. Payment card data is tokenised at the point of capture by the
processor's client-side SDK, and only tokens traverse the platform.

However, the following components are within PCI-DSS scope because they
participate in the transaction flow or could affect the security of cardholder
data:

- Network segmentation controls (VPC, NACLs, security groups)
- WAF and edge security (CloudFront, AWS WAF)
- Application services that invoke the payment processor API
- Logging and monitoring infrastructure that records transaction metadata
- IAM and access control mechanisms
- Encryption key management (KMS)

### 2.2 Requirements Mapping

| Req ID | Requirement Description | Platform Control | Evidence Location | Status |
|---|---|---|---|---|
| **1.2.1** | Network security controls restrict inbound traffic to the CDE to only that which is necessary. | VPC architecture with three subnet tiers (public, private, database). Database subnets restricted via NACLs to accept PostgreSQL traffic (port 5432) only from private compute subnets. Security groups enforce least-privilege ingress. No direct internet access to data tier. See `infrastructure/modules/networking/main.tf`. | AWS Config rule `vpc-sg-open-only-to-authorized-ports`; VPC Flow Logs in CloudWatch (`/aws/vpc/flow-log/causeway-banking-prod`); Terraform state showing NACL rules. | **Implemented** |
| **1.2.5** | All services, protocols, and ports that are allowed are identified, approved, and have a defined business need. | Security groups defined in Terraform with explicit ingress/egress rules. WAF rate-limiting at 2,000 requests/IP. Only HTTPS (443) exposed externally via ALB. Internal services communicate over defined ports (5432 for Aurora, ephemeral for ECS). All rules version-controlled and peer-reviewed. | Terraform module source (`infrastructure/modules/security/main.tf`, `networking/main.tf`); PR approval history in GitHub; AWS Config rule `restricted-common-ports`. | **Implemented** |
| **1.4.1** | Network security controls are implemented between trusted and untrusted networks (NSCs between CDE and other networks). | CloudFront with AWS WAF (OWASP Core Rule Set, Known Bad Inputs, SQLi rule groups) at the edge. ALB in public subnets forwards only to ECS tasks in private subnets. Database NACLs restrict access to compute subnets only. NAT gateways provide controlled outbound for private subnets. | WAF logging in CloudWatch (`aws-waf-logs-causeway-banking-prod`); Network architecture diagram in `docs/ARCHITECTURE.md`; Terraform plan output. | **Implemented** |
| **2.2.7** | All non-console administrative access is encrypted using strong cryptography. | All AWS console access via SSO with MFA enforced. No long-lived access keys for human users. API access uses STS temporary credentials. ECS tasks have no SSH access (Fargate — no underlying host access). Secrets Manager stores and rotates credentials. All management-plane traffic over TLS 1.2+. | IAM credential report; AWS SSO configuration; `docs/AWS_PRODUCTION_READINESS.md` (Identity and Access section); CloudTrail `ConsoleLogin` events filtered by MFA status. | **Implemented** |
| **3.5.1** | PAN is secured with strong cryptography wherever it is stored. | The platform does not store raw PANs. Payment card data is tokenised by the external processor before reaching the platform. Tokens stored in Aurora PostgreSQL are encrypted at rest using KMS CMKs with automatic key rotation enabled (`enable_key_rotation = true`). S3 objects encrypted with SSE-KMS (bucket key enabled). DynamoDB encrypted with KMS CMK. | KMS key policy and rotation status via `aws kms get-key-rotation-status`; Aurora cluster configuration (`storage_encrypted = true`, `kms_key_id` set); S3 bucket encryption configuration; Data flow diagram documenting tokenisation boundary. | **Implemented** |
| **3.5.1.2** | Disk-level or partition-level encryption is used to render PAN unreadable (if disk encryption is the mechanism used). | Aurora PostgreSQL uses AES-256 encryption at rest via KMS CMK. ECS Fargate tasks use encrypted ephemeral storage. S3 bucket encryption enforced via bucket policy and `aws_s3_bucket_server_side_encryption_configuration`. DynamoDB server-side encryption with CMK. | AWS Config rule `rds-storage-encrypted`; AWS Config rule `s3-bucket-server-side-encryption-enabled`; Terraform resource definitions in `infrastructure/modules/data/main.tf`. | **Implemented** |
| **6.4.1** | Public-facing web applications are protected against attacks with an automated technical solution that detects and prevents web-based attacks. | AWS WAF v2 deployed in front of CloudFront/ALB with three managed rule groups: `AWSManagedRulesCommonRuleSet` (OWASP Top 10), `AWSManagedRulesKnownBadInputsRuleSet`, and `AWSManagedRulesSQLiRuleSet`. Rate-limiting rule blocks IPs exceeding 2,000 requests per 5-minute window. WAF logs streamed to CloudWatch for analysis and alerting. | WAF Web ACL configuration in `infrastructure/modules/security/main.tf`; WAF request logs in CloudWatch; WAF metrics on CloudWatch dashboard; Quarterly WAF rule review minutes. | **Implemented** |
| **6.4.2** | Public-facing web applications have an automated technical solution that continually detects and prevents web-based attacks (updated to reflect v4.0 continuous monitoring requirement). | WAF managed rule groups are automatically updated by AWS. GuardDuty enabled across all accounts for continuous threat detection. Security Hub aggregates findings. Image and dependency scanning in CI/CD pipeline (SAST/DAST). Patch management process tracked. | GuardDuty findings dashboard; Security Hub compliance score; CI pipeline scan reports; `docs/AWS_PRODUCTION_READINESS.md` (Security Posture section). | **Implemented** |
| **7.2.1** | An access control system is implemented that restricts access based on a user's need to know and is set to "deny all" by default. | IAM policies follow least-privilege. ECS task roles scoped per service with resource-level ARN restrictions. Secrets Manager access restricted to `${name_prefix}-*` secrets per service. KMS key policy limits decrypt to specific roles. Break-glass access documented and audited. SSO groups map to predefined IAM roles. Security group default deny (no rules = no traffic). | IAM policy documents in Terraform; `aws iam get-account-authorization-details` output; Quarterly access review reports; CloudTrail `AssumeRole` events; `docs/AWS_PRODUCTION_READINESS.md` (Identity and Access section). | **Implemented** |
| **8.3.6** | Passwords/passphrases for application and system accounts meet minimum complexity requirements. | Human access via SSO with MFA — no local passwords on AWS. Aurora master password managed by AWS Secrets Manager (`manage_master_user_password = true`) with automatic rotation. Application secrets stored in Secrets Manager with defined rotation schedules. KMS CMK protects all stored secrets. No hard-coded credentials permitted (enforced by CI secret scanning). | Secrets Manager rotation configuration; Aurora cluster `manage_master_user_password` setting in Terraform; CI pipeline secret detection results (e.g., `git-secrets`, `trufflehog`); SSO MFA policy. | **Implemented** |
| **10.2.1** | Audit logs are enabled and active for all system components in the CDE. | CloudTrail enabled in all accounts with log integrity validation. VPC Flow Logs capture all network traffic with 60-second aggregation. Aurora PostgreSQL logs exported to CloudWatch. WAF logs stream to CloudWatch. ALB access logs enabled. Application logs centralised in CloudWatch (`/aws/ecs/causeway-banking-prod/application`). All log groups have defined retention (365 days for production). | CloudTrail trail configuration; VPC Flow Log resource in `infrastructure/modules/networking/main.tf`; CloudWatch log group list and retention settings; `docs/AWS_PRODUCTION_READINESS.md` (Observability section). | **Implemented** |
| **10.4.1** | Audit logs are reviewed at least once daily to identify anomalies or suspicious activity. | CloudWatch alarms configured for security-relevant events (5xx spikes, high CPU, abnormal connection counts). GuardDuty provides automated anomaly detection with findings routed to Security Hub and SNS alerts. On-call team receives real-time alerts. WAF metrics monitored on CloudWatch dashboard. Structured log queries run via CloudWatch Logs Insights. | CloudWatch alarm definitions in `infrastructure/modules/observability/main.tf`; SNS topic subscriptions; GuardDuty finding summaries; On-call rotation schedule; Daily security review checklist. | **Implemented** |
| **11.3.1** | Internal vulnerability scans are performed at least quarterly. | AWS Inspector enabled for ECS container image scanning. Dependency scanning in CI/CD pipeline on every build. Security Hub runs automated compliance checks against CIS AWS Foundations Benchmark. Quarterly internal vulnerability assessment performed by the security team. | Inspector findings; CI pipeline scan artefacts; Security Hub compliance dashboard; Quarterly vulnerability scan reports stored in compliance evidence S3 bucket. | **Implemented** |
| **11.3.2** | External vulnerability scans are performed at least quarterly by an Approved Scanning Vendor (ASV). | External ASV scans contracted and executed quarterly against all externally-facing endpoints (CloudFront distributions, public ALB DNS). Remediation tracked in the gap analysis section of this document. | ASV quarterly scan reports (PDF) stored in compliance evidence S3 bucket; Remediation tickets in issue tracker. | **Implemented** |
| **12.1.1** | An information security policy is established, published, maintained, and disseminated to all relevant personnel and vendors. | Security policy published at `SECURITY.md` (repository root). Supporting documents: `docs/AWS_PRODUCTION_READINESS.md`, `docs/DATA_CLASSIFICATION.md`, `docs/OPERATIONS_RUNBOOK.md`. Policies reviewed semi-annually. New joiners complete security awareness onboarding. Policy changes communicated via internal channels and require acknowledgement. | Repository `SECURITY.md`; Document revision history (git log); Onboarding records; Policy acknowledgement register. | **Implemented** |

### 2.3 Compensating Controls

Where a PCI-DSS requirement is met through a compensating control rather than
the prescribed mechanism, the following applies:

| Original Requirement | Compensating Control | Justification |
|---|---|---|
| 3.4.1 (PAN rendered unreadable) | Tokenisation by PCI-DSS L1 processor; platform never receives raw PAN | Stronger than masking/hashing — raw PAN never enters the environment. Documented in payment processor integration specification and data flow diagram. |

---

## 3. FCA SYSC Requirements Mapping

### 3.1 Applicability Statement

Causeway Banking Financial is authorised and regulated by the Financial Conduct
Authority. The SYSC sourcebook (Senior Management Arrangements, Systems and
Controls) prescribes requirements for governance, risk management, operational
resilience, outsourcing, and information security. The following mapping covers
the key provisions most relevant to the technology platform.

### 3.2 Requirements Mapping

| SYSC Ref | Requirement Area | Requirement Summary | Platform Control | Evidence Location | Status |
|---|---|---|---|---|---|
| **SYSC 3.1** | Systems and controls | A firm must take reasonable care to establish and maintain such systems and controls as are appropriate to its business. | Multi-account AWS organisation with centralised governance via Control Tower. Infrastructure as Code (Terraform) ensures consistent, auditable configuration. AWS Config and Security Hub provide continuous compliance monitoring. Change management requires peer review and production approval gates. | AWS Control Tower dashboard; Terraform state files; AWS Config conformance packs; `docs/AWS_PRODUCTION_READINESS.md`; CI/CD pipeline configuration in `infrastructure/shared/ci-cd/main.tf`. | **Implemented** |
| **SYSC 3.2** | Responsibility of senior management | A firm must take reasonable care to maintain a clear and appropriate apportionment of significant responsibilities among its directors and senior managers. | Platform responsibilities documented with named owners for: security (CISO), infrastructure (Head of Platform Engineering), compliance (Head of Compliance), data protection (DPO). Escalation paths defined in `docs/OPERATIONS_RUNBOOK.md`. Incident severity and ownership matrix maintained. SM&CR (Senior Managers and Certification Regime) statements of responsibility reference technology controls. | SM&CR responsibility maps; Organisational chart; `docs/OPERATIONS_RUNBOOK.md` (escalation section); Board-level technology risk committee terms of reference. | **Implemented** |
| **SYSC 4.1.1** | General organisational requirements | A firm must have robust governance arrangements, including a clear organisational structure with well-defined, transparent and consistent lines of responsibility. | See SYSC 3.2 above. Additionally, all infrastructure changes follow a defined workflow: feature branch, automated tests, peer review, approval gate, production deployment. Break-glass access requires dual approval and is time-limited and audited. | GitHub branch protection rules; PR approval audit trail; Break-glass access log (CloudTrail `AssumeRole` events filtered by emergency role). | **Implemented** |
| **SYSC 7.1** | Risk management | A firm must establish, implement and maintain adequate risk management policies and procedures which identify the risks relating to the firm's activities, processes and systems. | Technology risk register maintained with quarterly reviews. Risks categorised by likelihood and impact. AWS GuardDuty, Security Hub, and Inspector provide automated risk identification. Vulnerability scan findings fed into risk register. DR strategy defined per service tier (ADR-0003) with tested failover procedures. | Technology risk register (internal GRC tool); GuardDuty/Security Hub finding summaries; DR test reports; `docs/adr/0002-rto-rpo-targets-by-service-tier.md`; `docs/adr/0003-cross-region-dr-strategy.md`. | **Implemented** |
| **SYSC 8.1** | Outsourcing requirements | A firm must take reasonable steps to avoid undue additional operational risk when outsourcing critical or important functions. | AWS is classified as a material outsourcing arrangement. Due diligence completed including review of AWS SOC 2 Type II, ISO 27001, and PCI-DSS compliance reports. AWS Business Associate Agreement (BAA) and Data Processing Addendum executed. Multi-region DR strategy (eu-west-1 primary, eu-west-2 DR) mitigates single-region dependency. Exit strategy documented including data portability provisions. | AWS compliance reports (SOC 2, ISO 27001) obtained via AWS Artifact; Outsourcing register entry for AWS; Contractual agreements; Exit strategy document; `docs/adr/0003-cross-region-dr-strategy.md`. | **Implemented** |
| **SYSC 8.1.8** | Outsourcing — sub-outsourcing | Where the service provider sub-outsources, the firm must ensure sub-outsourcing does not materially impair the quality of internal control or the ability of the FCA to monitor compliance. | AWS sub-processor list reviewed annually. Data Processing Addendum includes sub-processor notification obligations. Platform architecture limits data residency to eu-west-1 and eu-west-2 (UK/Ireland jurisdiction). S3 bucket policies and KMS key policies prevent cross-account or cross-region data exfiltration outside approved boundaries. | AWS sub-processor list (reviewed annually); Data Processing Addendum; S3 bucket policy restricting `s3:PutObject` to approved accounts; KMS key policy in `infrastructure/modules/security/main.tf`. | **Implemented** |
| **SYSC 13.1** | Operational resilience (business continuity) | A firm must establish, implement and maintain an adequate business continuity policy, including contingency and recovery plans aimed at ensuring that key business processes and systems can be maintained or restored in a timely manner. | Three-tier DR strategy: Tier 1 active-passive warm standby (RTO 15 min), Tier 2 pilot light (RTO 1 hr), Tier 3 backup-and-restore (RTO 4 hr). Multi-AZ deployment across 3 AZs in eu-west-1. Automated health checks and Route 53 DNS failover. Quarterly DR drills for Tier 1 services. Failover runbook documented with semi-automated execution. | `docs/adr/0002-rto-rpo-targets-by-service-tier.md`; `docs/adr/0003-cross-region-dr-strategy.md`; DR drill reports (quarterly); Route 53 health check configuration; `docs/OPERATIONS_RUNBOOK.md` (Backups and Recovery section). | **Implemented** |
| **SYSC 15A** | Operational resilience — impact tolerances | A firm must identify its important business services and set impact tolerances for the maximum tolerable disruption to each. | Important business services identified and mapped to service tiers. Impact tolerances set: Tier 1 payment processing (15-minute maximum disruption), Tier 2 reporting/notifications (1-hour maximum disruption). Self-assessment testing conducted annually. Mapping maintained between important business services and underlying technology components, third-party dependencies, and data assets. | Important business services register; Impact tolerance documentation; Self-assessment test results; Service dependency maps; Board reporting on operational resilience. | **Implemented** |
| **SYSC 25.2** | Senior Managers and Certification Regime — information security | Firms should adopt appropriate policies, procedures, systems and controls to manage information security risks. This includes managing risks from cyber threats. | WAF with managed rule groups (OWASP, SQLi, bad inputs). GuardDuty for threat detection. KMS CMK encryption for all data at rest. TLS 1.2+ for all data in transit. SSO with MFA enforced. Least-privilege IAM. VPC segmentation. Image and dependency scanning in CI/CD. Secrets Manager with rotation. Incident response procedure with defined severity levels and SLAs. Security vulnerability reporting process with 2-business-day acknowledgement SLA. | WAF configuration; GuardDuty findings; KMS key configuration; `SECURITY.md`; `docs/AWS_PRODUCTION_READINESS.md`; CI/CD pipeline security scan artefacts; Incident response log; Vulnerability disclosure tracker. | **Implemented** |
| **SYSC 27.1** | Operational resilience — third-party risk | A firm must manage risks from third-party service arrangements, including cloud service providers, that support its important business services. | AWS treated as material third-party provider. Annual review of AWS compliance certifications (SOC 2 Type II, ISO 27001, PCI-DSS). Contractual protections including audit rights, data handling obligations, and termination provisions. Concentration risk mitigated by multi-region deployment and documented exit strategy. Third-party risk assessment completed and maintained in vendor risk register. Regular monitoring of AWS service health and trust centre advisories. | Vendor risk register; AWS Artifact compliance reports (annual download); Third-party risk assessment; Exit strategy document; AWS Health Dashboard integration with alerting. | **Implemented** |

---

## 4. UK GDPR Mapping

### 4.1 Applicability Statement

The platform processes personal data of UK-resident individuals under the
UK General Data Protection Regulation (retained from EU GDPR) and the Data
Protection Act 2018. The organisation acts as a data controller for customer
account data and as a data processor where it processes data on behalf of
institutional clients. A Data Protection Officer (DPO) has been appointed.

### 4.2 Lawful Bases for Processing

| Processing Activity | Lawful Basis | GDPR Article |
|---|---|---|
| Account creation and management | Performance of a contract (Art. 6(1)(b)) | Art. 6(1)(b) |
| Transaction processing | Performance of a contract (Art. 6(1)(b)) | Art. 6(1)(b) |
| KYC/AML identity verification | Legal obligation (Art. 6(1)(c)) | Art. 6(1)(c) |
| Fraud detection and prevention | Legitimate interests (Art. 6(1)(f)) | Art. 6(1)(f) |
| Marketing communications | Consent (Art. 6(1)(a)) | Art. 6(1)(a) |
| Employee data processing | Performance of employment contract (Art. 6(1)(b)), legal obligation (Art. 6(1)(c)) | Art. 6(1)(b), (c) |

### 4.3 Requirements Mapping

| GDPR Article | Requirement Summary | Platform Control | Evidence Location | Status |
|---|---|---|---|---|
| **Art. 5(1)(a)** | Lawfulness, fairness and transparency — personal data shall be processed lawfully, fairly and in a transparent manner. | Privacy notices published on the customer-facing application detailing processing purposes, lawful bases, data retention periods, and data subject rights. Internal processing register (Record of Processing Activities) maintained. Cookie consent mechanism deployed on public-facing web properties. | Privacy notice (published on `finance.causewaygrp.com`); ROPA register; Cookie consent audit logs; Lawful basis assessment documents for each processing activity. | **Implemented** |
| **Art. 5(1)(b)** | Purpose limitation — personal data collected for specified, explicit and legitimate purposes and not further processed in a manner incompatible with those purposes. | Data classification policy (`docs/DATA_CLASSIFICATION.md`) defines handling requirements per class. Restricted data (PII, financial records) constrained to approved AWS accounts and may not leave without explicit approval. Database schemas document the purpose for each personal data field. Data access requests from internal teams require documented business justification and DPO approval for novel uses. | `docs/DATA_CLASSIFICATION.md`; Database schema documentation; Data access request log; DPO approval records for novel processing. | **Implemented** |
| **Art. 5(1)(f)** | Integrity and confidentiality — personal data processed in a manner that ensures appropriate security including protection against unauthorised or unlawful processing, accidental loss, destruction or damage. | Encryption at rest (KMS CMK for Aurora, DynamoDB, S3) and in transit (TLS 1.2+). VPC segmentation with private subnets for data stores. WAF with OWASP rule set. IAM least-privilege access. Secrets Manager for credential management. MFA enforced for all human access. VPC Flow Logs and CloudTrail for audit. GuardDuty for anomaly detection. Backup and recovery tested quarterly. | Infrastructure Terraform configurations; AWS Config compliance dashboard; Encryption verification reports; `docs/AWS_PRODUCTION_READINESS.md`; Quarterly backup restoration test results. | **Implemented** |
| **Art. 12-14** | Information to be provided to data subjects — transparent information, communication and modalities for exercise of rights; information to be provided where data is collected from the data subject. | Privacy notice accessible from all customer-facing interfaces. Layered approach: concise notice at point of collection, detailed notice linked. Notice includes: identity of controller, DPO contact, purposes/lawful bases, recipients, international transfers (if any), retention periods, data subject rights, right to complain to ICO. Notice reviewed and updated when processing activities change. | Published privacy notice; Privacy notice review log (revision history); Customer-facing UI screenshots showing notice placement; DPO contact details on corporate website. | **Implemented** |
| **Art. 15** | Right of access — the data subject shall have the right to obtain confirmation as to whether personal data concerning them is being processed and access to the personal data. | Subject Access Request (SAR) procedure documented with 30-calendar-day response SLA. Platform supports data export functionality for customer account data. Database queries for SAR fulfilment documented and tested. Dedicated internal workflow for receiving, verifying identity, retrieving data, reviewing for third-party information, and delivering response. | SAR procedure document; SAR fulfilment log (tracking receipt, identity verification, response date); Data export function documentation; Template SAR response letter. | **Implemented** |
| **Art. 17** | Right to erasure (right to be forgotten) — data subject has the right to obtain erasure of personal data without undue delay where specified grounds apply. | Data deletion procedure documented with consideration for legal retention obligations (AML records: 5 years post-relationship; financial records: 7 years per HMRC requirements). Where deletion is requested but legal retention applies, data is restricted (access removed from operational systems) rather than erased. Soft-delete mechanism in Aurora with scheduled hard-delete after retention expiry. S3 object lifecycle policies with noncurrent version expiration (365 days). DynamoDB TTL enabled for session and transient data. | Data retention schedule; Erasure request log; Aurora soft-delete implementation documentation; S3 lifecycle configuration in `infrastructure/modules/data/main.tf`; DynamoDB TTL configuration; Legal retention exemption register. | **Implemented** |
| **Art. 25** | Data protection by design and by default — the controller shall implement appropriate technical and organisational measures for ensuring that, by default, only personal data which are necessary for each specific purpose are processed. | Privacy impact considered during architecture design (see ADR process in `docs/adr/`). Data minimisation enforced: only required personal data fields collected per service. Default data classification is "Restricted" for any new field containing personal data. Access to personal data requires explicit IAM permissions scoped to specific services. New features processing personal data require a DPIA screening assessment. | Architecture Decision Records; DPIA screening assessments; Data model documentation showing minimisation; IAM policy definitions; Feature development checklist (includes privacy screening). | **Implemented** |
| **Art. 28** | Processor obligations — where processing is carried out on behalf of a controller, the controller shall use only processors providing sufficient guarantees. | AWS Data Processing Addendum executed covering Art. 28 requirements. Payment processor DPA in place. All sub-processors documented in the outsourcing register. Processor contracts include: processing only on documented instructions, confidentiality, security measures, sub-processor controls, data subject rights assistance, deletion/return on termination, audit rights. | AWS DPA; Payment processor DPA; Outsourcing register; Processor contract review log; Annual processor compliance verification records. | **Implemented** |
| **Art. 32** | Security of processing — the controller and processor shall implement appropriate technical and organisational measures including pseudonymisation, encryption, confidentiality/integrity/availability assurance, restoration ability, and regular testing. | See Art. 5(1)(f) controls above. Additionally: tokenisation for payment card data (pseudonymisation), annual penetration testing, quarterly vulnerability scanning, DR testing per service tier, access reviews on scheduled cadence, security awareness training for all staff. Measures regularly tested and evaluated. | Penetration test reports (annual); Vulnerability scan reports (quarterly); DR drill results; Access review records; Security training completion records; `docs/AWS_PRODUCTION_READINESS.md`. | **Implemented** |
| **Art. 33** | Notification of personal data breach to supervisory authority — notification to ICO within 72 hours where feasible, unless the breach is unlikely to result in a risk to the rights and freedoms of individuals. | Incident response procedure defines breach assessment and notification workflow. Security incidents triaged as Sev 1 (data integrity risk) trigger immediate breach assessment. DPO notified within 4 hours of breach confirmation. ICO notification template pre-prepared. Communication channels tested quarterly. GuardDuty and CloudTrail provide automated detection of unauthorised access. | `docs/OPERATIONS_RUNBOOK.md` (Incident Response section); Breach notification procedure; ICO notification template; Breach log/register; GuardDuty findings; CloudTrail anomaly alerts; `SECURITY.md` (vulnerability reporting SLAs). | **Implemented** |
| **Art. 34** | Communication of personal data breach to data subject — where a breach is likely to result in a high risk to the rights and freedoms of individuals, the controller shall communicate the breach to the data subject without undue delay. | Breach communication procedure documented as an extension of Art. 33 workflow. Template data subject notification prepared covering: nature of breach, DPO contact, likely consequences, measures taken. Communication channels identified (email, in-app notification, postal). Decision on whether to notify data subjects documented with DPO recommendation and senior management approval. | Breach communication procedure; Data subject notification templates; Breach decision log; Senior management approval records. | **Implemented** |
| **Art. 35** | Data Protection Impact Assessment (DPIA) — required where processing is likely to result in a high risk to the rights and freedoms of individuals, particularly using new technologies. | DPIA screening assessment required for all new features processing personal data or changing existing data flows. Full DPIA conducted for high-risk processing (systematic profiling, large-scale processing of special category data, systematic monitoring). DPIA template follows ICO guidance. DPO reviews and signs off all DPIAs. DPIA register maintained. | DPIA screening checklist (integrated into feature development workflow); Completed DPIA documents; DPIA register; DPO sign-off records; ICO DPIA template. | **Implemented** |
| **Art. 44-49** | Transfers of personal data to third countries — transfers only permitted where adequate safeguards are in place. | Platform data resides in eu-west-1 (Ireland) and eu-west-2 (London). No routine transfers outside UK/EEA. AWS DPA includes Standard Contractual Clauses (SCCs) as a safeguard for any incidental access from AWS support personnel outside UK/EEA. S3 bucket policies and KMS key policies prevent cross-region replication to non-approved regions. Transfer Impact Assessment (TIA) completed for AWS relationship. | AWS DPA with SCCs; Transfer Impact Assessment; S3 bucket replication configuration (limited to eu-west-1 and eu-west-2); KMS key policy (non-multi-region); Data transfer register. | **Implemented** |

---

## 5. Control Evidence Matrix

This matrix identifies where evidence for each major control category is
generated, stored, and how it can be retrieved for audit purposes.

### 5.1 Evidence Sources

| Control Category | Evidence Type | Source / Tool | Storage Location | Retention Period | Retrieval Method |
|---|---|---|---|---|---|
| **Access management** | IAM credential reports, SSO login events, role assumption logs | AWS IAM, AWS SSO, CloudTrail | CloudTrail logs in centralised S3 bucket (security account); IAM credential reports generated on demand | CloudTrail: 365 days in CloudWatch, 7 years in S3 (Glacier after 1 year) | `aws cloudtrail lookup-events`; S3 select queries; CloudWatch Logs Insights |
| **Network security** | VPC Flow Logs, security group configurations, NACL rules, WAF request logs | VPC Flow Logs, AWS Config, AWS WAF | CloudWatch Log Groups (`/aws/vpc/flow-log/*`); AWS Config snapshots in S3; WAF logs in CloudWatch (`aws-waf-logs-*`) | Flow Logs: 365 days; AWS Config: indefinite (S3); WAF logs: 90 days in CloudWatch, archived to S3 | CloudWatch Logs Insights queries; AWS Config resource timeline; WAF log analysis |
| **Encryption** | KMS key configuration, key rotation status, encryption-at-rest verification | AWS KMS, AWS Config | AWS Config configuration items; KMS API responses | AWS Config: indefinite; KMS audit trail via CloudTrail: 7 years | `aws kms describe-key`; `aws kms get-key-rotation-status`; AWS Config rules `rds-storage-encrypted`, `s3-bucket-server-side-encryption-enabled`, `dynamodb-table-encrypted-kms` |
| **Change management** | Git commit history, PR reviews, CI/CD pipeline execution, Terraform plan/apply logs | GitHub, CI/CD system | GitHub repository (indefinite); CI/CD artefact storage (S3) | Git history: indefinite; CI/CD artefacts: 2 years | GitHub API (`gh pr list`, `gh pr view`); CI/CD dashboard; S3 artefact retrieval |
| **Vulnerability management** | Container image scans, dependency scans, ASV scan reports, penetration test reports | AWS Inspector, CI pipeline scanners, external ASV, penetration test vendor | Inspector findings in Security Hub; CI scan artefacts in S3; ASV/pen test reports in compliance evidence S3 bucket | Inspector: 90 days active, archived indefinitely in S3; ASV reports: 7 years; Pen test reports: 7 years | Security Hub console; S3 bucket `s3://causeway-banking-compliance-evidence/` |
| **Monitoring and alerting** | CloudWatch alarms, alarm state changes, on-call incident log | CloudWatch, SNS, PagerDuty/equivalent | CloudWatch alarm history; SNS delivery logs; Incident management tool | Alarm history: 14 days (CloudWatch native), extended via CloudTrail and custom logging to 365 days | CloudWatch alarm history API; Incident management tool search |
| **Business continuity and DR** | DR drill execution logs, failover timing evidence, data consistency verification | Manual drill reports, Route 53 health check logs, Aurora replication metrics | Compliance evidence S3 bucket; CloudWatch metrics | DR drill reports: 7 years; Health check logs: 365 days | S3 retrieval; CloudWatch Metrics query for replication lag |
| **Backup and recovery** | Backup job completion, restore test results, point-in-time recovery verification | AWS Backup, Aurora automated backups, S3 versioning | AWS Backup vault; Aurora snapshot list; Compliance evidence S3 bucket | Backup retention: 35 days (Aurora); S3 versions: 365 days noncurrent; Restore test reports: 7 years | `aws backup list-backup-jobs`; `aws rds describe-db-cluster-snapshots`; Compliance evidence bucket |
| **Data protection / privacy** | DPIA documents, SAR fulfilment logs, breach register, consent records, ROPA | Internal GRC tool, DPO records | GRC tool (SaaS); Compliance evidence S3 bucket for archived documents | DPIAs: life of processing + 3 years; SAR log: 3 years; Breach register: indefinite; ROPA: current + 3 years historical | GRC tool interface; S3 retrieval for archived records |
| **Configuration compliance** | AWS Config evaluations, Security Hub scores, CIS Benchmark results | AWS Config, Security Hub | Config delivery channel (S3); Security Hub findings | AWS Config: indefinite; Security Hub findings: 90 days active, archived | AWS Config console and API; Security Hub dashboard; Config conformance pack reports |
| **Threat detection** | GuardDuty findings, anomaly detection alerts | GuardDuty, CloudTrail Insights | GuardDuty findings (Security Hub aggregation); CloudTrail Insights events | GuardDuty: 90 days active findings; archived via EventBridge to S3 for 7 years | Security Hub console; S3 archived findings; EventBridge event history |

### 5.2 Evidence Collection Automation

The following automated mechanisms ensure evidence is collected continuously
without manual intervention:

- **AWS Config** records all resource configuration changes and evaluates
  compliance rules continuously. Delivery channel writes snapshots to a
  dedicated S3 bucket in the security account.
- **CloudTrail** is enabled organisation-wide with log file integrity
  validation. Logs are delivered to a centralised S3 bucket with a lifecycle
  policy that transitions to Glacier after 1 year and retains for 7 years.
- **Security Hub** aggregates findings from Config, GuardDuty, Inspector, and
  IAM Access Analyzer into a single dashboard with compliance scores against
  CIS AWS Foundations Benchmark.
- **EventBridge rules** forward GuardDuty HIGH/CRITICAL findings to SNS for
  immediate alerting and to S3 for long-term archival.
- **CI/CD pipeline** produces and stores scan artefacts (SAST, dependency
  scan, image scan) as build artefacts in S3 for each deployment.

---

## 6. Audit and Review Schedule

### 6.1 Internal Reviews

| Review Activity | Scope | Frequency | Responsible Party | Output | Next Due |
|---|---|---|---|---|---|
| **IAM access review** | All IAM users, roles, and policies across all accounts. Verify least-privilege, remove stale access, confirm MFA enforcement. | Quarterly | Security team + Platform Engineering | Access review report with findings and remediation actions | 2026-04-15 |
| **Security group and NACL review** | All VPC security groups and NACLs. Verify no overly permissive rules, confirm alignment with network architecture documentation. | Quarterly | Platform Engineering | Network configuration review report | 2026-04-15 |
| **KMS key management review** | Key rotation status, key policy review, key usage audit (CloudTrail). Confirm no unused keys, no overly broad policies. | Semi-annually | Security team | KMS review report | 2026-08-11 |
| **Data classification review** | Verify data classification tags on all data stores (Aurora, DynamoDB, S3). Confirm handling requirements are enforced for each class. | Semi-annually | DPO + Platform Engineering | Data classification audit report | 2026-08-11 |
| **Disaster recovery drill** | Tier 1: full failover to eu-west-2 and failback. Tier 2: pilot light activation. Measure actual RTO/RPO against targets. | Quarterly (Tier 1), Semi-annually (Tier 2), Annually (Tier 3) | Platform Engineering + Operations | DR drill report with timing evidence and findings | Tier 1: 2026-04-15; Tier 2: 2026-08-11; Tier 3: 2027-02-11 |
| **Backup restoration test** | Restore from Aurora snapshots and S3 backups. Verify data integrity post-restore. Measure restore time against RPO targets. | Quarterly | Platform Engineering | Restore test report | 2026-04-15 |
| **Incident response tabletop exercise** | Simulate Sev 1 and Sev 2 incidents including data breach scenarios. Test escalation paths, communication channels, and breach notification workflow. | Semi-annually | CISO + Security team + Operations | Tabletop exercise report with lessons learned | 2026-08-11 |
| **ROPA (Record of Processing Activities) update** | Review and update the register of all personal data processing activities. Confirm lawful bases, data flows, and processor relationships are current. | Semi-annually | DPO | Updated ROPA | 2026-08-11 |
| **Security policy review** | Review and update `SECURITY.md`, `DATA_CLASSIFICATION.md`, `AWS_PRODUCTION_READINESS.md`, and this compliance mapping document. | Semi-annually | CISO + Head of Compliance | Updated policy documents with change log | 2026-08-11 |
| **WAF rule review** | Review WAF managed rule group updates, custom rule effectiveness, false positive rates. Tune rate-limiting thresholds based on traffic patterns. | Quarterly | Security team + Platform Engineering | WAF review report | 2026-04-15 |

### 6.2 External Reviews

| Review Activity | Scope | Frequency | Performed By | Output | Next Due |
|---|---|---|---|---|---|
| **PCI-DSS assessment** | Self-Assessment Questionnaire (SAQ) or Report on Compliance (ROC) depending on transaction volume. Covers all in-scope components. | Annually | Qualified Security Assessor (QSA) | SAQ/ROC with Attestation of Compliance (AOC) | 2026-12-31 |
| **External ASV vulnerability scan** | All externally-facing IP addresses and URLs (CloudFront, ALB). | Quarterly | PCI-approved ASV | ASV scan report (pass/fail) | 2026-04-30 |
| **Penetration test** | Application-layer and infrastructure-layer testing of the production environment. Includes OWASP Top 10, API security, and cloud-specific attack vectors. | Annually | CREST-certified penetration testing firm | Pen test report with findings, risk ratings, and remediation recommendations | 2026-09-30 |
| **SOC 2 Type II report review (AWS)** | Review of AWS SOC 2 Type II report for controls relevant to the platform. Verify no exceptions or qualifications that impact Causeway Banking Financial. | Annually (upon AWS report release) | Head of Compliance | AWS SOC 2 review memo | 2026-06-30 |
| **ISO 27001 surveillance audit** | If applicable: surveillance audit of the organisation's ISMS. | Annually | Certification body | Surveillance audit report | 2026-12-31 |
| **ICO registration renewal** | Confirm data protection registration is current and processing descriptions are accurate. | Annually | DPO | ICO registration confirmation | 2026-11-30 |

### 6.3 Continuous Monitoring

The following controls are evaluated continuously (real-time or near-real-time)
and do not rely solely on periodic reviews:

- **AWS Config rules** evaluate resource compliance on every configuration change.
- **Security Hub** aggregates and scores compliance posture continuously.
- **GuardDuty** analyses CloudTrail, VPC Flow Logs, and DNS logs continuously
  for threat detection.
- **CloudWatch alarms** monitor operational and security metrics with
  60-second evaluation periods.
- **CI/CD pipeline security scans** run on every code change (pull request and
  merge to main).

---

## 7. Gap Analysis and Remediation Plan

### 7.1 Identified Gaps

The following gaps have been identified through internal review, external
assessment, or regulatory engagement. Each gap is assigned a risk rating,
owner, and target remediation date.

| Gap ID | Regulation | Requirement Ref | Gap Description | Risk Rating | Owner | Remediation Plan | Target Date | Status |
|---|---|---|---|---|---|---|---|---|
| **GAP-001** | PCI-DSS v4.0 | 6.3.2 | Inventory of bespoke and custom software and third-party components is not fully automated. Manual tracking exists but does not cover all transitive dependencies or generate a complete Software Bill of Materials (SBOM). PCI-DSS v4.0 requires this by 31 March 2025. | **High** | Head of Platform Engineering | Implement automated SBOM generation in CI/CD pipeline using Syft or equivalent tooling. Integrate SBOM output with vulnerability scanning. Store SBOMs as build artefacts. | 2026-04-30 | **In Progress** |
| **GAP-002** | PCI-DSS v4.0 | 11.6.1 | Change- and tamper-detection mechanism for payment page scripts (HTTP headers, scripts served to customer browser) is not yet implemented. PCI-DSS v4.0 requires monitoring of payment page integrity. | **High** | Security team | Implement Content Security Policy (CSP) headers with reporting. Deploy Subresource Integrity (SRI) for all third-party scripts. Implement script change monitoring with alerts. | 2026-05-31 | **Planned** |
| **GAP-003** | PCI-DSS v4.0 | 12.3.1 | Targeted risk analysis for each PCI-DSS requirement where the entity has flexibility to determine frequency (e.g., log review frequency, scan frequency) has not been formally documented. | **Medium** | Head of Compliance | Create formal targeted risk analysis documents for requirements 5.2.3.1, 5.3.2.1, 7.2.5.1, 8.6.3, 9.5.1.2.1, 10.4.2.1, 11.3.1.1, 11.3.2.1, 11.4.1, 11.6.1, 12.10.4.1. Template to follow PCI-DSS v4.0 guidance. | 2026-06-30 | **Planned** |
| **GAP-004** | UK GDPR | Art. 17 / Art. 5(1)(e) | Automated data retention enforcement is partially implemented. S3 lifecycle policies and DynamoDB TTL are in place, but Aurora PostgreSQL does not have a fully automated mechanism to purge personal data after the retention period expires. Current approach relies on scheduled application-level jobs that require manual verification. | **Medium** | DPO + Platform Engineering | Implement and validate automated data purge jobs for Aurora PostgreSQL. Create audit trail for automated deletions. Test with synthetic data to confirm complete removal. Schedule quarterly verification of retention enforcement. | 2026-06-30 | **In Progress** |
| **GAP-005** | UK GDPR | Art. 20 | Right to data portability — while SAR (Art. 15) is supported, the platform does not yet offer a self-service data export in a structured, commonly used, machine-readable format (e.g., JSON, CSV). Current exports require manual intervention by the operations team. | **Low** | Product Engineering + DPO | Build self-service data export feature in the customer portal. Support JSON and CSV export formats. Include all personal data categories. Implement rate-limiting and authentication for export endpoint. | 2026-09-30 | **Planned** |
| **GAP-006** | FCA SYSC | SYSC 15A.3 | Mapping of important business services to underlying third-party dependencies is complete for technology components but does not yet include all non-technology dependencies (e.g., postal services, telecommunications providers) as required for comprehensive operational resilience mapping. | **Low** | Head of Compliance + COO | Extend the important business services mapping to include all material third-party dependencies (technology and non-technology). Update the operational resilience self-assessment. Present updated mapping to the Board. | 2026-07-31 | **Planned** |
| **GAP-007** | FCA SYSC | SYSC 13.1 | Scenario testing for operational resilience has been conducted for technology failure scenarios (region outage, AZ failure) but has not yet included scenarios for simultaneous failure of multiple third-party providers or extreme but plausible stress scenarios as recommended by FCA guidance PS21/3. | **Medium** | CISO + Head of Compliance | Design and execute additional scenario tests covering: (1) simultaneous AWS and payment processor outage, (2) cyber attack during DR failover, (3) data corruption requiring point-in-time recovery with concurrent high transaction volume. Document results and remediation actions. | 2026-08-31 | **Planned** |
| **GAP-008** | PCI-DSS v4.0 | 8.4.2 | MFA is enforced for all console and SSO access to the AWS environment. However, MFA for all access into the CDE (not just administrative) including application-level access by support personnel viewing cardholder data environments needs to be verified and documented for PCI-DSS v4.0 compliance. | **Medium** | Security team | Audit all access paths into CDE. Verify MFA enforcement at application layer for support/operations personnel. Document MFA implementation for each access path. Implement MFA for any identified gaps. | 2026-05-31 | **In Progress** |
| **GAP-009** | UK GDPR | Art. 35 | DPIA screening is integrated into the feature development workflow, but two legacy processing activities (pre-dating the current DPIA process) have not been retrospectively assessed. These are: (1) customer transaction analytics and (2) internal fraud scoring model. | **Medium** | DPO | Conduct retrospective DPIAs for the two identified legacy processing activities. Document findings and any required mitigations. Update the DPIA register. | 2026-05-31 | **In Progress** |
| **GAP-010** | PCI-DSS v4.0 | 3.2.1 | Verification that sensitive authentication data (SAD) is not retained after authorisation needs to be formally documented with evidence from the payment processor integration. While the platform uses tokenisation and does not handle raw SAD, the data flow documentation needs to be updated to explicitly confirm this at each stage of the transaction lifecycle. | **Low** | Security team + Payment Engineering | Update the payment data flow documentation to explicitly trace SAD handling at each stage. Obtain confirmation from the payment processor that SAD is purged post-authorisation. Include evidence in the next PCI-DSS assessment package. | 2026-04-30 | **Planned** |

### 7.2 Remediation Prioritisation

Gaps are prioritised based on risk rating and regulatory deadline:

1. **Immediate (by 2026-04-30):** GAP-001 (SBOM), GAP-010 (SAD documentation)
2. **Near-term (by 2026-05-31):** GAP-002 (payment page integrity), GAP-008
   (CDE MFA verification), GAP-009 (retrospective DPIAs)
3. **Medium-term (by 2026-06-30):** GAP-003 (targeted risk analyses), GAP-004
   (automated data purge)
4. **Longer-term (by 2026-09-30):** GAP-005 (data portability), GAP-006
   (third-party mapping), GAP-007 (scenario testing)

### 7.3 Remediation Governance

- Each gap has a named owner who is accountable for delivery by the target date.
- Progress is reported monthly to the CISO and Head of Compliance.
- The Board Technology Risk Committee receives a quarterly summary of
  compliance gap status.
- If a target date is at risk of being missed, the owner must escalate to the
  CISO at least 30 days before the deadline with a revised plan.
- Completed remediations are verified by an independent party (internal audit
  or external assessor) before the gap is closed.

---

## Appendix A: Document Cross-References

| Document | Location | Relevance |
|---|---|---|
| Architecture | `docs/ARCHITECTURE.md` | Platform architecture and data flows |
| AWS Production Readiness | `docs/AWS_PRODUCTION_READINESS.md` | Security baseline and readiness checklist |
| Data Classification | `docs/DATA_CLASSIFICATION.md` | Data handling requirements by class |
| Operations Runbook | `docs/OPERATIONS_RUNBOOK.md` | Incident response, monitoring, backups |
| Security Policy | `SECURITY.md` | Vulnerability reporting, security controls |
| Go-Live Checklist | `docs/GO_LIVE_CHECKLIST.md` | Pre-launch security and compliance checks |
| ADR-0001: Default Compute | `docs/adr/0001-default-compute-ecs-fargate.md` | ECS Fargate as default compute platform |
| ADR-0002: RTO/RPO Targets | `docs/adr/0002-rto-rpo-targets-by-service-tier.md` | Recovery objectives by service tier |
| ADR-0003: Cross-Region DR | `docs/adr/0003-cross-region-dr-strategy.md` | Disaster recovery strategy |
| Domain Setup | `docs/DOMAIN_SETUP.md` | DNS, certificates, HTTPS enforcement |
| Deployment | `docs/DEPLOYMENT.md` | CI/CD pipeline and deployment process |

## Appendix B: Regulatory Reference Index

| Abbreviation | Full Name | Source |
|---|---|---|
| PCI-DSS v4.0 | Payment Card Industry Data Security Standard v4.0 | [PCI SSC](https://www.pcisecuritystandards.org/) |
| FCA SYSC | FCA Handbook — Senior Management Arrangements, Systems and Controls | [FCA Handbook](https://www.handbook.fca.org.uk/handbook/SYSC/) |
| UK GDPR | UK General Data Protection Regulation (retained EU law) | [legislation.gov.uk](https://www.legislation.gov.uk/eur/2016/679/contents) |
| DPA 2018 | Data Protection Act 2018 | [legislation.gov.uk](https://www.legislation.gov.uk/ukpga/2018/12/contents) |
| PS21/3 | FCA Policy Statement — Building operational resilience | [FCA](https://www.fca.org.uk/publications/policy-statements/ps21-3-building-operational-resilience) |
| SM&CR | Senior Managers and Certification Regime | [FCA](https://www.fca.org.uk/firms/senior-managers-certification-regime) |

## Appendix C: Approval and Review History

| Version | Date | Author | Reviewer | Changes |
|---|---|---|---|---|
| 1.0 | 2026-02-11 | Compliance Team | CISO | Initial release |

---

*This document is classified as Confidential under the Causeway Banking
Financial data classification policy. It must not be shared outside the
organisation without written approval from the Head of Compliance or CISO.*

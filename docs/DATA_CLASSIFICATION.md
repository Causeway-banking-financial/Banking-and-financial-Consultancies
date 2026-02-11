# Data Classification

This policy defines how data is classified and protected across the Causeway
Banking Financial platform. All teams must apply these classifications when
designing, storing, processing, or transmitting data.

See also:

- `docs/COMPLIANCE_MAPPING.md` -- maps these classifications to PCI DSS, SOC 2,
  and GDPR controls.
- `docs/THREAT_MODEL.md` -- identifies threats to each data class and the
  mitigations required.

---

## Classification levels

### 1. Public

**Definition:** Information intended for public release with no confidentiality
requirements.

**Examples:**

- Marketing materials and press releases
- Published API documentation
- Public-facing status page content
- Open-source code and licenses

**Storage requirements:**

- May be stored in any AWS account or public hosting (S3 static website,
  CloudFront).
- No access-control restrictions beyond standard change management.

**Encryption requirements:**

- Encryption at rest is not required but recommended as a default.
- Encryption in transit (TLS 1.2+) is required for all web-facing endpoints.

**Deletion procedures:**

- Remove from public hosting when no longer current.
- No formal retention schedule required; follow general housekeeping practices.

---

### 2. Internal

**Definition:** Internal business data not intended for public release. Exposure
would cause limited business impact.

**Examples:**

- Organisation charts and internal directories
- Internal process documentation and wiki content
- Non-sensitive project plans and roadmaps
- Aggregated, anonymised operational metrics

**Storage requirements:**

- Must be stored within approved AWS accounts or approved SaaS tools.
- S3 buckets must block public access (`BlockPublicAcls`, `BlockPublicPolicy`,
  `IgnorePublicAcls`, `RestrictPublicBuckets` all enabled).
- Access limited to employees and approved contractors via IAM or SSO.

**Encryption requirements:**

- Encryption at rest required using AWS managed keys (SSE-S3 or SSE-KMS with the
  `aws/s3`, `aws/rds`, or equivalent AWS managed key).
- Encryption in transit (TLS 1.2+) required for all connections.

**Deletion procedures:**

- Delete when no longer needed for business purposes.
- Follow a retention period of no more than 3 years unless a longer period is
  required by policy.
- Use S3 lifecycle policies or RDS snapshot expiration to automate cleanup.

---

### 3. Confidential

**Definition:** Customer data, business secrets, or sensitive operational data.
Unauthorised disclosure could cause significant business or reputational harm.

**Examples:**

- Customer account data (names, email addresses, account numbers)
- Business financial reports and forecasts
- Internal audit findings
- Application configuration containing environment-specific details
- Non-public API keys and integration credentials (note: these must also follow
  the secrets management policy in `docs/REPOSITORY_STANDARDS.md`)

**Storage requirements:**

- Must be stored only in approved production or nonprod AWS accounts.
- S3 buckets must block public access and enable versioning.
- RDS instances must be deployed in private subnets with no public accessibility.
- Access is restricted to authorised personnel; access must be logged and
  reviewed quarterly.

**Encryption requirements:**

- Encryption at rest required using customer managed KMS CMKs (SSE-KMS with a
  dedicated CMK per service or data domain).
- Encryption in transit (TLS 1.2+) required for all connections.
- Database connections must use SSL/TLS.

**Deletion procedures:**

- Retain according to contractual and regulatory obligations (typically 5--7
  years for financial records).
- Deletion requires approval from the data owner and a record in the audit log.
- Use cryptographic erasure (delete the KMS CMK schedule) when bulk purging
  encrypted data stores.
- S3 objects must be permanently deleted (not just versioned) once the retention
  period expires.

---

### 4. Restricted

**Definition:** Personally identifiable information (PII), payment card data,
financial records, or any data subject to specific regulatory requirements.
Unauthorised disclosure could cause severe regulatory, legal, or financial
consequences.

**Examples:**

- PII: full names combined with government identifiers (SSN, passport numbers),
  dates of birth, home addresses
- Payment card data: primary account numbers (PAN), CVV, expiration dates
- Bank account and routing numbers
- Authentication credentials and password hashes
- Encryption keys and key material

**Storage requirements:**

- Must be stored only in the designated restricted-data AWS accounts.
- Must not leave approved AWS accounts or regions under any circumstances.
- S3 buckets must block public access, enable versioning, and enable object lock
  where regulatory hold is required.
- RDS and DynamoDB tables must reside in isolated private subnets with security
  group rules limited to specific application roles.
- Access requires multi-factor authentication, is restricted to named
  individuals, and is logged with CloudTrail and reviewed monthly.
- PCI DSS cardholder data environment (CDE) segmentation rules apply to payment
  data -- see `docs/COMPLIANCE_MAPPING.md`.

**Encryption requirements:**

- Encryption at rest required using customer managed KMS CMKs with automatic
  annual key rotation enabled.
- KMS key policies must enforce least-privilege access and deny all principals
  not explicitly listed.
- Encryption in transit (TLS 1.2+) required; mutual TLS (mTLS) recommended for
  service-to-service communication handling restricted data.
- Field-level or column-level encryption required for PAN and government
  identifiers stored in databases.
- Tokenisation is preferred over direct storage of PAN -- see the threat model
  in `docs/THREAT_MODEL.md` for tokenisation architecture.

**Deletion procedures:**

- Retain according to the strictest applicable regulation (PCI DSS, GDPR, or
  local financial regulation).
- GDPR right-to-erasure requests must be fulfilled within 30 days; implement
  automated deletion workflows.
- Deletion requires dual approval (data owner + compliance officer) and an
  immutable audit trail.
- Use cryptographic erasure by scheduling KMS CMK deletion (minimum 7-day
  waiting period) for bulk purges.
- All backups and replicas containing the deleted data must also be purged or
  verified to expire within the retention window.
- Confirm deletion completion and record evidence in the compliance register.

---

## Handling requirements

- Restricted data must not leave approved AWS accounts or approved regions.
- Data retention and deletion must follow legal, regulatory, and policy
  requirements as defined per classification level above.
- All exports of Confidential or Restricted data require written approval from
  the data owner and the compliance team.
- Data classification must be reviewed whenever a service is created, materially
  changed, or decommissioned.
- Misclassification must be reported as a security incident and corrected
  immediately.

## Summary matrix

| Requirement         | Public       | Internal           | Confidential           | Restricted                     |
|---------------------|--------------|--------------------|------------------------|--------------------------------|
| Encryption at rest  | Recommended  | AWS managed keys   | Customer managed CMK   | Customer managed CMK + rotation|
| Encryption in transit| TLS 1.2+    | TLS 1.2+           | TLS 1.2+               | TLS 1.2+ (mTLS recommended)   |
| Storage boundary    | Any          | Approved accounts  | Approved accounts      | Restricted accounts only       |
| Access control      | None         | IAM / SSO          | Named roles, logged    | Named individuals, MFA, logged |
| Access review       | None         | Annual             | Quarterly              | Monthly                        |
| Deletion approval   | None         | Standard           | Data owner             | Dual approval + audit trail    |
| Retention default   | None         | Up to 3 years      | 5--7 years             | Per regulation                 |

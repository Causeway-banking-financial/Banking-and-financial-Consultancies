# Data Classification

This policy defines how data is classified and protected.

## Classes

1. Public
   - Intended for public release
   - No confidentiality requirements

2. Internal
   - Internal business data
   - Access limited to employees and approved contractors

3. Confidential
   - Customer data, business secrets, or sensitive operational data
   - Encryption at rest and in transit required
   - Access logged and reviewed

4. Restricted
   - PII, financial records, or regulated data
   - Strong encryption with KMS CMKs
   - Strict least-privilege access and auditing

## Handling requirements

- Restricted data must not leave approved AWS accounts.
- Data retention and deletion must follow legal and policy requirements.
- All exports of Confidential or Restricted data require approval.

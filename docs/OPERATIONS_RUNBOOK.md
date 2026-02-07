# Operations Runbook

This runbook defines operational practices for production systems.

## On-call and escalation

- Primary and secondary on-call coverage defined per service.
- Escalation paths documented with time-based triggers.
- Incident communication channels maintained and tested quarterly.

## Incident response

Severity levels:

- Sev 1: Full outage or data integrity risk
- Sev 2: Major degradation affecting customers
- Sev 3: Limited impact or internal-only issue

Standard flow:

1. Triage and stabilize
2. Communicate status and impact
3. Restore service
4. Post-incident review with action items

## Monitoring and alerting

- SLOs defined and monitored for each service.
- Alerts must be actionable and noise-reduced.
- Log retention meets policy requirements.

## Backups and recovery

- Backups are automated via AWS Backup or native service features.
- Restore procedures are tested quarterly.
- Evidence of recovery tests is stored with audit artifacts.

## Change management

- Production changes require peer review and approval.
- Rollback plans must be documented in the release.
- Maintenance windows communicated in advance.

# Chaos Engineering

This document defines the chaos engineering strategy for the Causeway Banking
Financial platform. The goal is to proactively find weaknesses before they cause
outages.

## Principles

1. **Start in nonprod.** All experiments run against nonprod first.
2. **Define steady state.** Know what "healthy" looks like before breaking things.
3. **Use stop conditions.** Every experiment has CloudWatch alarm stop conditions
   that automatically halt the experiment if SLOs are breached.
4. **Minimise blast radius.** Target individual tasks or clusters, not entire
   environments.
5. **Document and share.** Every gameday produces a written report.

## Experiment Catalog

The following experiments are defined as AWS FIS templates in
`infrastructure/chaos-engineering/`:

### Experiment 1: ECS Task Termination

| Property | Value |
|----------|-------|
| Template | `ecs-task-stop` |
| What it does | Kills 1 ECS Fargate task |
| What it tests | ECS service recovery, deployment circuit breaker, ALB health checks |
| Expected behaviour | Replacement task starts within 30 seconds, no user-visible errors |
| Stop conditions | ALB 5xx alarm, ECS CPU alarm |
| Frequency | Monthly |

### Experiment 2: Aurora Failover

| Property | Value |
|----------|-------|
| Template | `aurora-failover` |
| What it does | Forces Aurora writer to fail over to a read replica |
| What it tests | Application handles DB connection reset, reconnects automatically |
| Expected behaviour | Failover completes in <30 seconds, brief connection errors logged |
| Stop conditions | ALB 5xx alarm, Aurora connections alarm |
| Frequency | Quarterly |

### Experiment 3: ECS CPU Stress

| Property | Value |
|----------|-------|
| Template | `ecs-cpu-stress` |
| What it does | Injects 90% CPU load onto 50% of ECS tasks for 5 minutes |
| What it tests | Autoscaling triggers, latency remains within SLO |
| Expected behaviour | New tasks scale out within 60 seconds, p99 latency stays below 3s |
| Stop conditions | ALB latency alarm, ECS CPU alarm |
| Frequency | Monthly |

## Gameday Process

### Before the gameday

1. Schedule the gameday with at least 1 week notice.
2. Notify the on-call team and stakeholders.
3. Verify all stop conditions (CloudWatch alarms) are in OK state.
4. Confirm the experiment targets nonprod.
5. Review the relevant runbook procedure for manual recovery.

### During the gameday

1. Start the FIS experiment from the AWS console or CLI.
2. Monitor the CloudWatch dashboard in real time.
3. Note the time of each observable event (task death, recovery, alarm trigger).
4. If a stop condition fires, the experiment halts automatically. Investigate.
5. If unexpected behaviour occurs, manually stop the experiment.

### After the gameday

1. Write a gameday report using the template below.
2. File any issues found as GitHub issues with the `chaos-finding` label.
3. Track remediation items to completion before the next gameday.

## Gameday Report Template

```markdown
# Gameday Report — YYYY-MM-DD

## Experiment
[Name and description]

## Participants
[List of participants and roles]

## Steady state
[Define what "healthy" looked like before the experiment]

## Hypothesis
[What we expected to happen]

## Observations
[What actually happened, with timestamps]

## Findings
[Any unexpected behaviours or failures]

## Action Items
- [ ] [Action item 1]
- [ ] [Action item 2]

## Conclusion
[Pass/Fail and confidence level in the system's resilience]
```

## Schedule

| Experiment | Frequency | Next scheduled |
|------------|-----------|----------------|
| ECS Task Termination | Monthly | TBD |
| Aurora Failover | Quarterly | TBD |
| ECS CPU Stress | Monthly | TBD |
| Cross-region DR drill | Biannually | TBD |

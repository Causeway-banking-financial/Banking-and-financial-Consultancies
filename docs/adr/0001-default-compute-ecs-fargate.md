# ADR 0001: ECS Fargate as Default Compute Platform

Date: 2026-02-11

## Status

Accepted

## Context

The reference architecture lists three compute options — ECS Fargate, EKS, and
Lambda — without specifying a default. Teams cannot begin infrastructure work or
estimate operational costs until a primary compute platform is chosen.

Key constraints:

- The platform hosts long-running financial services that process transactions,
  serve APIs, and run batch jobs.
- The operations team is small and cannot absorb the overhead of managing a
  Kubernetes control plane.
- Regulatory requirements demand auditability and predictable network behaviour.
- Services must run across at least two availability zones.
- Container images are the preferred packaging format for portability and
  reproducibility.

Options considered:

1. **ECS Fargate** — Serverless containers. AWS manages the underlying hosts.
   Per-task pricing. Native ALB integration. Simple IAM-per-task model.
2. **EKS** — Managed Kubernetes. Powerful but requires cluster management,
   node group configuration, and Kubernetes operational expertise.
3. **Lambda** — Event-driven functions. Excellent for async workloads but
   introduces cold-start latency, 15-minute execution limits, and a different
   deployment model.

## Decision

**ECS Fargate is the default compute platform for all services.**

Rationale:

- **Lower operational overhead** than EKS. No nodes to patch, no cluster
  upgrades to coordinate, no Kubernetes RBAC to manage.
- **Predictable networking.** Each task gets its own ENI in a VPC subnet,
  making security group rules and network flow logs straightforward.
- **Task-level IAM roles.** Each service gets its own role with least-privilege
  permissions — simpler to audit than Kubernetes service accounts.
- **Native integration** with ALB target groups, CloudWatch, X-Ray, and Secrets
  Manager without sidecars or custom operators.
- **Multi-AZ by default** when configured with multiple subnets.
- **Right-sized cost model.** Pay per vCPU/memory-second. No idle node costs.

Exceptions:

- **Lambda** is permitted for event-driven workloads (SQS consumers, S3 event
  processors, scheduled jobs) where execution completes within 15 minutes and
  cold-start latency is acceptable.
- **EKS** may be adopted in the future if the team grows significantly or
  workloads require Kubernetes-specific features (custom operators, service
  mesh). This would be recorded as a new ADR superseding this one.

## Consequences

**Benefits:**
- Teams can begin infrastructure work immediately with a clear compute target.
- Operational playbooks and monitoring dashboards only need to cover one primary
  platform instead of three.
- Smaller blast radius from infrastructure incidents — no shared node pools.

**Risks:**
- ECS Fargate has higher per-unit cost than self-managed EC2. Accepted because
  the reduced operational burden outweighs the cost difference at current scale.
- Vendor lock-in to AWS. Mitigated by using standard Docker images and avoiding
  ECS-specific application code.

**Trade-offs:**
- Some teams may prefer Kubernetes. The decision is to standardize first and
  evaluate EKS later once operational maturity is established.

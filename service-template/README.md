# Service Template

This is a starter template for building services on the Causeway Banking
Financial platform. It follows the standards defined in the main repository.

## What's included

```
service-template/
  app/
    Dockerfile              Multi-stage build, non-root user, health check
    .dockerignore
    package.json            Node.js/TypeScript project scaffold
    src/
      server.ts             Express server with health/ready endpoints
      logger.ts             Structured JSON logging (pino)
  terraform/
    main.tf                 ECS service, ALB target group, autoscaling, ECR
    variables.tf            Configurable per-service variables
  .github/
    workflows/
      ci.yml                Lint, test, Docker build, Trivy scan, deploy
  tests/
    health.test.ts          Baseline health endpoint tests
```

## Usage

1. Copy this template into a new repository.
2. Replace all `{{service-name}}` placeholders with your service name.
3. Set the `service_tier` variable in Terraform to match your tier from ADR-0002.
4. Configure secrets in GitHub for your deployment role and ECR registry.
5. Push to `main` — CI will lint, test, build, scan, and deploy to nonprod.

## Standards compliance

| Standard | How this template complies |
|----------|---------------------------|
| ADR-0001 (ECS Fargate) | Terraform deploys to Fargate with circuit breaker |
| ADR-0002 (RTO/RPO tiers) | `service_tier` variable enforces tier classification |
| ADR-0003 (DR strategy) | Multi-AZ subnets, infrastructure exists in DR region |
| Security baseline | Helmet headers, non-root container, Trivy scan, KMS encryption |
| Observability | Structured JSON logs, CloudWatch log group, health checks |
| Deployment | Immutable image tags, blue/green via ECS deployment circuit breaker |

# Infrastructure

This folder is the home for infrastructure as code (IaC) used to deploy and
operate Causeway Banking Financial services on AWS.

## Recommended layout

```
infrastructure/
  modules/              Reusable building blocks
  environments/
    nonprod/            Shared non-production environment
    prod/               Production environment
  shared/               Cross-account services (logging, security, tooling)
```

## Standards

- Use IaC for all AWS resources (Terraform/CDK/CloudFormation).
- Separate prod and non-prod accounts and state.
- Keep secrets out of git and use Secrets Manager or SSM.
- Apply tagging standards for cost and ownership.

## Next steps

Create environment stacks that follow the guidance in:

- `docs/DEPLOYMENT.md`
- `docs/AWS_PRODUCTION_READINESS.md`

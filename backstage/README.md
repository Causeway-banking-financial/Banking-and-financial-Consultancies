# Developer Portal (Backstage)

This directory contains the Backstage catalog configuration for the Causeway
Banking Financial platform.

## What's included

- `catalog-info.yaml` — Entity definitions for the platform:
  - **System:** `causeway-banking-financial` (the top-level platform)
  - **Domain:** `banking-financial`
  - **Groups:** `platform-engineering`, `architecture`, `security`
  - **Resources:** VPC, ECS cluster, Aurora database
  - **Template:** `causeway-service-template` for self-service scaffolding

## How it works

1. Backstage reads `catalog-info.yaml` to discover and display platform entities.
2. Teams use the Software Template to scaffold new services via the Backstage UI.
3. The template creates a new GitHub repository from `service-template/`,
   configures branch protection, and registers the service in the catalog.

## Setup

1. Deploy Backstage (via Docker or Kubernetes) following the
   [Backstage getting started guide](https://backstage.io/docs/getting-started/).
2. Configure the GitHub integration in `app-config.yaml`.
3. Add this repository as a catalog location:
   ```yaml
   catalog:
     locations:
       - type: url
         target: https://github.com/Causeway-banking-financial/Banking-and-financial-Consultancies/blob/main/backstage/catalog-info.yaml
   ```
4. Teams can now browse the catalog, view documentation, and scaffold services.

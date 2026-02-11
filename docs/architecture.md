# Architecture - CauseWay Financial Consulting Platform

## Overview

CauseWay is a bilingual (English/Arabic) financial consulting platform with a dynamic CMS admin panel. The platform allows admins to manage all website content, resources, categories, and pages through a modern dashboard.

The architecture is designed around a single Next.js application that serves both the public-facing website and the admin CMS, connected to a PostgreSQL database and S3-compatible file storage. This monolithic-but-modular approach keeps operational complexity low while providing full content management capabilities.

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Frontend & Backend | Next.js 14 (App Router) - unified SSR/SSG       |
| Language           | TypeScript (strict mode)                        |
| Database           | PostgreSQL 16 with Prisma ORM                   |
| Authentication     | NextAuth.js with JWT strategy, role-based (Admin/Editor) |
| Styling            | Tailwind CSS 3 with RTL support                 |
| File Storage       | AWS S3 (MinIO for local dev)                    |
| Internationalization | next-intl (EN/AR with RTL)                    |
| Infrastructure     | AWS (CloudFront, ECS Fargate, RDS, S3) managed by Terraform |
| CI/CD              | GitHub Actions                                  |
| Local Dev          | Docker Compose (PostgreSQL + MinIO)             |

## Architecture Diagram

```
[Users] --> [CloudFront/WAF] --> [ALB]
                                    |
                                [ECS Fargate]
                                (Next.js App)
                                /          \
                        [RDS PostgreSQL]   [S3 Uploads]
```

All inbound traffic passes through CloudFront with AWS WAF rules for bot mitigation and rate limiting. CloudFront terminates TLS and forwards requests to an Application Load Balancer, which routes to the ECS Fargate service running the Next.js application. The application connects to RDS PostgreSQL for persistent data and S3 for file uploads and static assets.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # Public site (EN/AR routes)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── about/         # About page
│   │   │   ├── services/      # Services page
│   │   │   ├── observatory/   # Observatory page
│   │   │   ├── insights/      # Insights page
│   │   │   ├── contact/       # Contact page
│   │   │   ├── resources/     # Resources listing + search
│   │   │   └── [slug]/        # Dynamic CMS pages
│   │   ├── admin/             # Admin panel (no i18n middleware)
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── resources/     # CRUD with EN+AR tabs
│   │   │   ├── categories/    # Reorder, enable/disable
│   │   │   ├── pages/         # Structured blocks builder
│   │   │   ├── health/        # System health + link checker
│   │   │   ├── audit/         # Audit log viewer
│   │   │   └── settings/
│   │   └── api/               # REST API routes
│   │       ├── auth/[...nextauth]/
│   │       ├── resources/
│   │       ├── categories/
│   │       ├── pages/
│   │       ├── upload/
│   │       ├── health/
│   │       ├── search/
│   │       └── audit/
│   ├── components/
│   │   ├── admin/             # Admin shell, shared components
│   │   ├── public/            # Header, Footer, shared UI
│   │   └── shared/
│   ├── lib/                   # Core utilities
│   │   ├── prisma.ts          # Database client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── s3.ts              # File upload
│   │   ├── audit.ts           # Audit logging
│   │   ├── utils.ts           # Helpers
│   │   └── api-helpers.ts     # API response utilities
│   ├── i18n/                  # Internationalization
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── messages/
│   │       ├── en.json
│   │       └── ar.json
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   └── middleware.ts          # i18n routing middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── infrastructure/
│   └── terraform/             # AWS IaC
├── tests/
├── docker-compose.yml
├── Dockerfile
└── docs/
```

### Key directories

- **`src/app/[locale]/`** contains all public-facing pages. The `[locale]` segment enables bilingual routing so every page is available under `/en/...` and `/ar/...`.
- **`src/app/admin/`** is excluded from the i18n middleware and serves the English-only admin CMS dashboard.
- **`src/app/api/`** holds Next.js Route Handlers that form the REST API consumed by both the admin panel and the public site.
- **`src/lib/`** contains singleton utilities (Prisma client, S3 helpers, auth config) imported throughout the application.
- **`prisma/`** holds the database schema and seed scripts. Migrations are generated with `prisma migrate dev`.
- **`infrastructure/terraform/`** contains all AWS infrastructure definitions.

## Database Schema

The PostgreSQL database is accessed through Prisma ORM. The following models form the core schema:

### User

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| email          | String   | Unique, indexed                    |
| passwordHash   | String   | bcrypt hashed                      |
| name           | String   |                                    |
| role           | Enum     | ADMIN or EDITOR                    |
| createdAt      | DateTime | Auto-set                           |
| updatedAt      | DateTime | Auto-updated                       |

### Resource

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| titleEn        | String   | English title                      |
| titleAr        | String   | Arabic title                       |
| descriptionEn  | Text     | English description                |
| descriptionAr  | Text     | Arabic description                 |
| slug           | String   | Unique, URL-safe                   |
| categoryId     | UUID     | FK to Category                     |
| fileUrl        | String   | S3 URL to uploaded file            |
| thumbnailUrl   | String?  | Optional thumbnail                 |
| published      | Boolean  | Default false                      |
| publishedAt    | DateTime?|                                    |
| createdBy      | UUID     | FK to User                         |
| createdAt      | DateTime |                                    |
| updatedAt      | DateTime |                                    |

### Category

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| nameEn         | String   | English name                       |
| nameAr         | String   | Arabic name                        |
| slug           | String   | Unique                             |
| sortOrder      | Int      | For manual ordering                |
| enabled        | Boolean  | Default true                       |
| createdAt      | DateTime |                                    |
| updatedAt      | DateTime |                                    |

### Page

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| slug           | String   | Unique, used for dynamic routes    |
| titleEn        | String   |                                    |
| titleAr        | String   |                                    |
| blocksEn       | JSON     | Structured content blocks (EN)     |
| blocksAr       | JSON     | Structured content blocks (AR)     |
| published      | Boolean  | Default false                      |
| createdBy      | UUID     | FK to User                         |
| createdAt      | DateTime |                                    |
| updatedAt      | DateTime |                                    |

### SiteSetting

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| key            | String   | Unique setting key                 |
| valueEn        | Text     | English value                      |
| valueAr        | Text     | Arabic value                       |
| updatedAt      | DateTime |                                    |

### FileUpload

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| originalName   | String   | Original filename                  |
| s3Key          | String   | S3 object key                      |
| mimeType       | String   | Validated MIME type                 |
| sizeBytes      | Int      | File size                          |
| uploadedBy     | UUID     | FK to User                         |
| createdAt      | DateTime |                                    |

### AuditLog

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| userId         | UUID     | FK to User                         |
| action         | String   | e.g., CREATE, UPDATE, DELETE       |
| entity         | String   | e.g., Resource, Page               |
| entityId       | UUID     | ID of affected record              |
| details        | JSON?    | Optional diff or metadata          |
| ipAddress      | String   |                                    |
| createdAt      | DateTime |                                    |

### LinkCheck

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| id             | UUID     | Primary key                        |
| url            | String   | Checked URL                        |
| statusCode     | Int?     | HTTP response code                 |
| healthy        | Boolean  |                                    |
| lastCheckedAt  | DateTime |                                    |
| sourceEntity   | String   | Where the link was found           |
| sourceEntityId | UUID     |                                    |

## API Endpoints

### Authentication

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| POST   | `/api/auth/[...nextauth]`   | NextAuth sign-in/sign-out/session | Public |

### Resources

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/resources`            | List resources (paginated, filterable) | Public |
| GET    | `/api/resources/[id]`       | Get single resource            | Public   |
| POST   | `/api/resources`            | Create resource                | Admin/Editor |
| PUT    | `/api/resources/[id]`       | Update resource                | Admin/Editor |
| DELETE | `/api/resources/[id]`       | Delete resource                | Admin    |

### Categories

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/categories`           | List all categories            | Public   |
| POST   | `/api/categories`           | Create category                | Admin    |
| PUT    | `/api/categories/[id]`      | Update category                | Admin    |
| DELETE | `/api/categories/[id]`      | Delete category                | Admin    |
| PATCH  | `/api/categories/reorder`   | Reorder categories             | Admin    |

### Pages

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/pages`                | List CMS pages                 | Public   |
| GET    | `/api/pages/[slug]`         | Get page by slug               | Public   |
| POST   | `/api/pages`                | Create page                    | Admin/Editor |
| PUT    | `/api/pages/[id]`           | Update page                    | Admin/Editor |
| DELETE | `/api/pages/[id]`           | Delete page                    | Admin    |

### File Upload

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| POST   | `/api/upload`               | Upload file to S3              | Admin/Editor |
| DELETE | `/api/upload/[id]`          | Delete uploaded file           | Admin    |

### Search

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/search`               | Full-text search across resources and pages | Public |

### Health

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/health`               | System health check            | Public   |
| GET    | `/api/health/links`         | Link checker results           | Admin    |
| POST   | `/api/health/links/check`   | Trigger link check             | Admin    |

### Audit

| Method | Path                        | Description                    | Auth     |
| ------ | --------------------------- | ------------------------------ | -------- |
| GET    | `/api/audit`                | List audit log entries (paginated) | Admin |

## Authentication & Authorization

### JWT Strategy

Authentication uses NextAuth.js configured with the JWT session strategy. On successful login, a JWT is issued containing the user ID and role. The token is stored in an HTTP-only cookie and validated on every API request and server component render.

```
Login flow:
1. Admin submits email + password to /api/auth/callback/credentials
2. NextAuth verifies password hash (bcrypt) against User table
3. JWT issued with { userId, role, email } payload
4. Token stored in HTTP-only, Secure, SameSite=Lax cookie
5. Subsequent requests include cookie automatically
```

### Role-Based Access Control

| Role   | Permissions                                                  |
| ------ | ------------------------------------------------------------ |
| Admin  | Full access: CRUD all entities, manage users, view audit logs, delete resources, manage categories, access health dashboard |
| Editor | Create and update resources and pages. Cannot delete, manage categories, manage users, or view audit logs |

### Protected Routes

- All `/admin/*` routes (except `/admin/login`) require an authenticated session.
- All mutating API endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) require authentication.
- Role checks are enforced at the API route handler level using a `requireAuth(role)` middleware helper.
- The Next.js middleware redirects unauthenticated users accessing `/admin/*` to `/admin/login`.

## Bilingual Strategy

### EN/AR Field Pairs

Every user-facing text field in the database has paired columns: one for English (`*En`) and one for Arabic (`*Ar`). For example, `titleEn` / `titleAr`, `descriptionEn` / `descriptionAr`. This avoids the complexity of a separate translations table while keeping queries simple.

In the admin panel, bilingual fields are presented as **tabbed inputs** (EN | AR) so editors can fill in both languages in a single form.

### RTL CSS Support

Tailwind CSS is configured with RTL support using the `dir` attribute on the root `<html>` element:

- Arabic pages render with `dir="rtl"` and `lang="ar"`.
- English pages render with `dir="ltr"` and `lang="en"`.
- Tailwind's logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) are used instead of `ml-*`/`mr-*` to ensure correct spacing in both directions.
- The `rtl:` variant is used sparingly for cases where logical properties are insufficient.

### next-intl Routing

The `[locale]` dynamic segment in the App Router handles locale detection and routing:

- Supported locales: `en`, `ar` (defined in `src/i18n/config.ts`).
- The middleware (`src/middleware.ts`) detects the preferred locale from the `Accept-Language` header and redirects to the appropriate prefix.
- The `/admin` path is excluded from i18n middleware to keep the admin panel English-only.
- Translation strings are stored in `src/i18n/messages/en.json` and `src/i18n/messages/ar.json`.

### Hreflang Tags

Every public page includes `<link rel="alternate" hreflang="en" href="...">` and `<link rel="alternate" hreflang="ar" href="...">` tags for SEO. A `<link rel="alternate" hreflang="x-default" href="...">` tag points to the English version.

## File Upload Strategy

### S3 Organized Storage

Uploaded files are stored in S3 with a structured key format:

```
uploads/{entity}/{year}/{month}/{uuid}-{sanitized-filename}
```

Example: `uploads/resources/2025/01/a1b2c3d4-annual-report.pdf`

This organization makes it easy to browse uploads by type and date, and avoids filename collisions.

### Validation

- **MIME type validation**: Only allowed types are accepted. For resources: PDF, DOCX, XLSX, PPTX, and common image formats (JPEG, PNG, WebP).
- **File size limit**: 15 MB maximum per upload. Enforced both client-side (for UX) and server-side (for security).
- **Filename sanitization**: Special characters are stripped, and the original name is preserved in the `FileUpload` database record.

### Presigned URLs

For the upload flow:

1. The client requests a presigned upload URL from `/api/upload`.
2. The server generates a presigned S3 PUT URL (valid for 5 minutes) and returns it to the client.
3. The client uploads the file directly to S3 using the presigned URL.
4. On success, the client confirms the upload, and the server creates the `FileUpload` database record.

This approach offloads large file transfers from the application server and reduces memory pressure on the Fargate containers.

## Deployment Architecture

### AWS Services

| Service          | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| CloudFront       | CDN and edge caching for static assets and pages    |
| AWS WAF          | Bot mitigation, rate limiting, OWASP rule groups    |
| ALB              | Load balancing across Fargate tasks                 |
| ECS Fargate      | Serverless container hosting for the Next.js app    |
| RDS PostgreSQL   | Managed PostgreSQL 16 database                      |
| S3               | File uploads and static asset storage               |
| ACM              | TLS certificates for custom domains                 |
| Secrets Manager  | Database credentials, API keys, JWT secrets         |
| CloudWatch       | Logs, metrics, and alarms                           |
| Route 53         | DNS management                                      |

### Environment Tiers

| Environment | Compute           | Database        | Notes                     |
| ----------- | ----------------- | --------------- | ------------------------- |
| Local       | Docker Compose    | PostgreSQL 16 + MinIO | `docker-compose up`  |
| Staging     | Fargate (1 task)  | RDS t4g.micro   | Single NAT gateway        |
| Production  | Fargate (2+ tasks)| RDS t4g.small+  | Multi-AZ, auto-scaling    |

### Why Cost-Effective

- **Fargate**: No idle EC2 instances. Pay only for the vCPU and memory consumed by running tasks. Auto-scaling adjusts capacity based on request load.
- **Single NAT gateway for staging**: Staging does not need the high-availability of a NAT gateway per AZ. One NAT gateway saves approximately $32/month per removed gateway.
- **S3 lifecycle rules**: Objects transition to Infrequent Access after 90 days, reducing storage costs for older uploads.
- **RDS right-sizing**: Staging uses `t4g.micro` (2 vCPU, 1 GB RAM) which falls under the free tier for the first 12 months. Production scales to `t4g.small` or larger based on load.
- **CloudFront caching**: Aggressively caches static assets and ISR pages at the edge, reducing origin hits and Fargate compute costs.

## Cost Control

The following strategies keep AWS costs predictable and low, especially for the staging environment:

- **Fargate auto-scaling (pay per use)**: Minimum task count of 1 in staging, 2 in production. Scales up based on CPU/memory thresholds. Scales back down during low-traffic periods.
- **Single NAT gateway in staging**: Production uses one NAT gateway per AZ for high availability; staging uses a single NAT gateway to minimize cost.
- **S3 lifecycle to IA after 90 days**: An S3 lifecycle policy automatically transitions objects older than 90 days to the S3 Infrequent Access storage class, which costs roughly 45% less per GB.
- **RDS t4g.micro for staging, scale for prod**: Staging uses the smallest Graviton-based instance. Production can be independently scaled without affecting the staging cost baseline.
- **CloudFront caching reduces origin hits**: Next.js ISR pages are cached at CloudFront edges with appropriate `Cache-Control` headers. Static assets (JS, CSS, images) are cached with long TTLs. This reduces the number of requests that reach the Fargate origin, lowering compute costs.

## Security Considerations

- All data in transit is encrypted via TLS (CloudFront to client, ALB to Fargate).
- All data at rest is encrypted (RDS encryption, S3 SSE-S3).
- Database credentials and secrets are stored in AWS Secrets Manager, never in environment variables or code.
- Admin panel is protected by authentication and role-based authorization.
- Audit logging tracks all admin actions for compliance and forensics.
- WAF rules protect against common web attacks (SQL injection, XSS, bot abuse).
- CORS is configured to allow only the application's own origin.

## Local Development

To run the platform locally:

```bash
# Start PostgreSQL and MinIO
docker-compose up -d

# Install dependencies
npm install

# Run database migrations and seed
npx prisma migrate dev
npx prisma db seed

# Start the development server
npm run dev
```

The local environment uses:
- PostgreSQL on `localhost:5432`
- MinIO (S3-compatible) on `localhost:9000` with console at `localhost:9001`
- Next.js dev server on `localhost:3000`

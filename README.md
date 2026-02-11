# CauseWay Financial Consulting Platform

A production-ready, dynamic, bilingual (English/Arabic) platform for CauseWay Financial Consulting — a strategic advisory firm serving banking and financial institutions across the MENA region.

The platform provides expert insights on regulatory advisory, strategic planning, risk management, digital transformation, corporate governance, and training for the financial services sector.

## What This Platform Does

**Public Website** — A fully dynamic, API-backed bilingual site (EN/AR with correct RTL) featuring:
- Homepage with services overview, statistics, and featured resources
- About, Services, Observatory, Insights, Contact pages
- Resources library with search, filtering by category/type, and featured highlights
- Dynamic CMS pages created from the admin panel without code
- Full SEO: per-page meta tags in both languages, hreflang, sitemap, robots.txt

**Admin Dashboard** — A modern CMS panel for managing all content:
- Resources CRUD (EN+AR bilingual editor, file upload, draft/publish workflow)
- Categories management (create, reorder, enable/disable, color-coded)
- Pages builder (structured blocks, templates, no-code page creation)
- Health dashboard (system status, broken link checker, translation coverage)
- Audit log (who changed what and when)
- Bilingual completion indicators and quality checks

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes, unified stack |
| Language | TypeScript (strict) | Type safety, better DX |
| Database | PostgreSQL 16 + Prisma | Relational data, full-text search, migrations |
| Auth | NextAuth.js (JWT) | Role-based access (Admin/Editor) |
| Styling | Tailwind CSS 3 | RTL support, rapid UI development |
| i18n | next-intl | EN/AR routing, message bundles |
| Storage | AWS S3 / MinIO | File uploads with organized structure |
| Infra | AWS (CloudFront, ECS, RDS, S3) | Cost-effective, scalable |
| IaC | Terraform | Reproducible infrastructure |
| CI/CD | GitHub Actions | Automated lint → test → build → deploy |
| Local Dev | Docker Compose | One-command full stack setup |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/              # Public site (EN/AR)
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── about/             # About page
│   │   │   ├── services/          # Services page
│   │   │   ├── observatory/       # Financial Observatory
│   │   │   ├── insights/          # Insights/blog
│   │   │   ├── contact/           # Contact form
│   │   │   ├── resources/         # Resources with search/filter
│   │   │   └── [slug]/            # Dynamic CMS pages
│   │   ├── admin/                 # Admin panel
│   │   │   ├── login/             # Auth page
│   │   │   ├── dashboard/         # Stats + quality indicators
│   │   │   ├── resources/         # CRUD with bilingual tabs
│   │   │   ├── categories/        # Reorder + enable/disable
│   │   │   ├── pages/             # Block builder + templates
│   │   │   ├── health/            # System health + link checker
│   │   │   ├── audit/             # Activity log
│   │   │   └── settings/          # Platform config
│   │   └── api/                   # REST API
│   │       ├── auth/              # NextAuth handler
│   │       ├── resources/         # CRUD + public listing
│   │       ├── categories/        # CRUD
│   │       ├── pages/             # CRUD
│   │       ├── upload/            # File upload to S3
│   │       ├── health/            # Health check + link checker
│   │       ├── search/            # Full-text search
│   │       └── audit/             # Audit log query
│   ├── components/
│   │   ├── admin/                 # AdminShell sidebar layout
│   │   └── public/                # Header, Footer
│   ├── lib/                       # Core utilities
│   │   ├── prisma.ts              # Database client singleton
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── s3.ts                  # S3 upload/delete/presign
│   │   ├── audit.ts               # Audit log writer
│   │   ├── utils.ts               # Slugify, format, localize
│   │   └── api-helpers.ts         # Auth guards, response helpers
│   ├── i18n/                      # Translations (EN/AR)
│   ├── styles/globals.css         # Tailwind + RTL + components
│   ├── types/                     # TypeScript declarations
│   └── middleware.ts              # i18n routing
├── prisma/
│   ├── schema.prisma              # Full database schema
│   └── seed.ts                    # Sample data + users
├── infrastructure/
│   └── terraform/main.tf          # AWS infrastructure
├── tests/
│   ├── setup.ts
│   └── unit/utils.test.ts
├── docker-compose.yml             # PostgreSQL + MinIO
├── Dockerfile                     # Multi-stage production build
├── .github/workflows/ci.yml       # CI/CD pipeline
└── docs/
    ├── architecture.md            # System architecture
    ├── admin-manual.md            # Admin user guide
    └── runbook.md                 # Operations runbook
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 22+
- Docker and Docker Compose

### Setup

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd Banking-and-financial-Consultancies

# 2. Copy environment config
cp .env.example .env

# 3. Start database and storage
docker compose up -d

# 4. Install dependencies and set up database
npm run setup

# 5. Start development server
npm run dev
```

Access:
- **Public site**: http://localhost:3000
- **Arabic site**: http://localhost:3000/ar
- **Admin panel**: http://localhost:3000/admin
- **MinIO console**: http://localhost:9001 (minioadmin/minioadmin)

### Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@causewaygrp.com | admin123 |
| Editor | editor@causewaygrp.com | editor123 |

Change these immediately in production.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npm run test         # Run tests
npm run test:coverage # Tests with coverage

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Create migration
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio

npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services

npm run setup        # Full setup (install + generate + push + seed)
npm run check        # Full check (typecheck + lint + test)
```

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resources` | List published resources (search, filter, paginate) |
| GET | `/api/resources/[id]` | Get resource details |
| GET | `/api/categories` | List enabled categories |
| GET | `/api/pages` | List published pages |
| GET | `/api/pages/[id]` | Get page by ID or slug |
| GET | `/api/search?q=keyword` | Full-text search across resources and pages |
| GET | `/api/health` | Basic health check |

### Admin (requires authentication)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resources` | Create resource |
| PUT | `/api/resources/[id]` | Update resource |
| DELETE | `/api/resources/[id]` | Delete resource |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete category |
| POST | `/api/pages` | Create page |
| PUT | `/api/pages/[id]` | Update page |
| DELETE | `/api/pages/[id]` | Delete page |
| POST | `/api/upload` | Upload file to S3 |
| GET | `/api/health` | Detailed health (with x-admin header) |
| POST | `/api/health` | Run broken link checker |
| GET | `/api/audit` | Query audit logs |

## Database Schema

8 models covering the full platform:

- **User** — Admin/Editor accounts with bcrypt passwords
- **Resource** — Bilingual resources with type, category, tags, file, SEO fields
- **Category** — Hierarchical categories with ordering and enable/disable
- **Page** — CMS pages with structured blocks, templates, SEO
- **SiteSetting** — Key-value bilingual site configuration
- **FileUpload** — Upload tracking with S3 paths
- **AuditLog** — Who changed what and when
- **LinkCheck** — Broken link tracking for external URLs

## Deployment

### CI/CD Pipeline (GitHub Actions)
1. **Lint and Typecheck** — ESLint + TypeScript validation
2. **Test** — Jest with PostgreSQL service container
3. **Build** — Next.js production build
4. **Deploy Staging** — On push to `develop` branch
5. **Deploy Production** — On push to `main` branch (with approval gate)

### AWS Services
| Service | Purpose | Cost Control |
|---------|---------|-------------|
| CloudFront | CDN + edge caching | Reduces origin hits |
| ECS Fargate | Application hosting | Pay-per-use, no idle servers |
| RDS PostgreSQL | Database | t4g.micro for staging |
| S3 | File storage + uploads | Lifecycle to IA after 90 days |
| ECR | Docker image registry | Scan on push |
| VPC | Network isolation | Single NAT gateway for staging |

### Infrastructure as Code
```bash
cd infrastructure/terraform
terraform init
terraform plan -var="environment=staging"
terraform apply
```

## How to Add Content

### Add a Resource
1. Go to Admin → Resources → New Resource
2. Fill English title (required) and Arabic title
3. Add description and content in both languages
4. Select type (Report, Whitepaper, etc.) and category
5. Upload file or provide external URL
6. Add tags for thematic hub grouping
7. Fill SEO meta fields
8. Save as Draft or Publish directly

### Add a Page
1. Go to Admin → Pages → New Page
2. Set title, URL slug, and template
3. Add content blocks (Hero, Text, Cards, CTA, Stats)
4. Fill both English and Arabic content
5. Set SEO fields
6. Toggle "Show in navigation" if desired
7. Publish when ready

### Manage Categories
1. Go to Admin → Categories
2. Create with EN+AR names and color
3. Reorder using up/down arrows
4. Enable/disable to show/hide on public site

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Cannot connect to DB | Check `docker compose ps`, verify `DATABASE_URL` |
| Upload fails | Verify MinIO is running, check S3 credentials |
| Arabic not showing | Check Arabic fields are filled, verify locale routing |
| Admin login fails | Verify seed ran: `npm run db:seed` |
| Build errors | Run `npx prisma generate` first |
| Missing styles | Ensure `npm install` completed |

## Documentation

- [Architecture](docs/architecture.md) — System design and technical decisions
- [Admin Manual](docs/admin-manual.md) — Guide for admin panel users
- [Operations Runbook](docs/runbook.md) — Deployment, backups, monitoring

## License

Proprietary — CauseWay Financial Consulting. All rights reserved.

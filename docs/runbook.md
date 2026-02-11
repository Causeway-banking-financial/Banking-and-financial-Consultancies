# Operations Runbook - CauseWay Financial Consulting

## Local Development Setup
1. Clone repo
2. Copy .env.example to .env
3. Start services: docker compose up -d
4. Install deps: npm install
5. Generate Prisma: npm run db:generate
6. Push schema: npm run db:push
7. Seed data: npm run db:seed
8. Start dev: npm run dev
9. Access: http://localhost:3000 (public), http://localhost:3000/admin (admin)

One-command: `npm run setup && npm run dev`

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- NEXTAUTH_URL: Application URL
- NEXTAUTH_SECRET: JWT secret (generate with openssl rand -base64 32)
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY: S3 credentials
- S3_BUCKET_NAME: Upload bucket
- S3_ENDPOINT: MinIO endpoint for local dev
- MAX_UPLOAD_SIZE_MB: File upload limit (default 15)
- NEXT_PUBLIC_SITE_URL: Public site URL

## Deployment
### Staging
- Push to `develop` branch triggers CI/CD
- Builds Docker image, pushes to ECR
- Deploys to ECS staging cluster
- Database migrations run automatically

### Production
- Merge to `main` triggers production deploy
- Same pipeline with production environment
- Manual approval gate in GitHub Actions
- Runs prisma migrate deploy

## Database Management
- Migrations: `npx prisma migrate dev --name description`
- Production migrations: `npx prisma migrate deploy`
- Studio: `npx prisma studio` (port 5555)
- Backups: AWS RDS automated (14 days retention in prod)

## Monitoring
- CloudWatch for ECS logs and metrics
- Health endpoint: GET /api/health
- Admin health dashboard: /admin/health
- Link checker: POST /api/health (run from admin panel)

## Common Operations
### Add a new admin user
```sql
INSERT INTO users (id, email, name, password_hash, role, active)
VALUES (gen_random_uuid(), 'user@example.com', 'Name', '$hash', 'ADMIN', true);
```
Or use the seed script pattern.

### Run link check
1. Go to /admin/health
2. Click "Run Link Check"
3. Or POST /api/health with admin auth

### Backup database
```bash
pg_dump -h host -U causeway -d causeway_db > backup.sql
```

### Restore database
```bash
psql -h host -U causeway -d causeway_db < backup.sql
```

## Troubleshooting
- 500 errors: Check CloudWatch logs / docker compose logs
- DB connection issues: Verify DATABASE_URL, check security groups
- Upload failures: Verify S3 credentials, check bucket permissions
- Auth issues: Verify NEXTAUTH_SECRET matches across deployments
- Missing content: Check publish status in admin panel
- RTL layout issues: Verify locale detection in middleware

## Security
- All admin routes require authentication
- JWT tokens expire after 8 hours
- File uploads validated for MIME type and size
- SQL injection prevented by Prisma ORM
- XSS prevented by React's built-in escaping
- CSRF handled by NextAuth
- Security headers set in next.config.js

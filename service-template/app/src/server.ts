import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./logger";

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);

// Security headers
app.use(helmet());

// Structured request logging
app.use(pinoHttp({ logger }));

// Parse JSON bodies
app.use(express.json());

// Health check — used by ALB target group and container HEALTHCHECK
app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// Readiness check — verify downstream dependencies
app.get("/ready", async (_req, res) => {
  // TODO: Add database connectivity check
  res.json({ status: "ready" });
});

// Placeholder route
app.get("/", (_req, res) => {
  res.json({ service: "{{service-name}}", version: process.env.npm_package_version });
});

// Error handling middleware — catches unhandled errors and returns structured JSON
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "internal_server_error" });
});

// Only start the server when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(port, () => {
    logger.info({ port }, "Service started");
  });
}

export default app;

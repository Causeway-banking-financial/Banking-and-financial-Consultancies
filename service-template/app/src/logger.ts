import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  // Structured JSON logging for CloudWatch ingestion
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: process.env.SERVICE_NAME || "{{service-name}}",
    environment: process.env.ENVIRONMENT || "local",
  },
});

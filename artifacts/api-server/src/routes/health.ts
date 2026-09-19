import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  // Run a trivial query against the database as part of every health check.
  // This doubles as a keep-alive for database providers (like Neon) that
  // auto-suspend their compute after a period of inactivity — the existing
  // self-ping in keepAlive.ts already hits this endpoint every 10 minutes,
  // so this query rides along on that same schedule for free, with nothing
  // extra to configure. A failed DB ping doesn't fail the health check
  // itself — the app can still be "up" even if the DB briefly hiccups.
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    logger.warn({ err }, "Health check DB keep-alive query failed");
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

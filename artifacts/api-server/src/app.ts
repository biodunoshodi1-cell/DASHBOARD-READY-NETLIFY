import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const isProduction = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------
// Recommended deployment: the frontend host (Netlify) proxies /api/* to this
// server, so the browser only ever talks to one origin and CORS never comes
// into play. CORS_ORIGIN only matters if the frontend calls this API
// directly cross-origin (e.g. a separate domain, or local dev on another
// port). Set it to a comma-separated allowlist, e.g.
//   CORS_ORIGIN=https://brightlearnersadaptive.netlify.app,https://bright.adaptivelearningsupport.com
const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// In development, allow any origin so `pnpm dev` "just works" without extra
// setup. In production, only allow explicitly configured origins (or none,
// if the proxy approach above is used and no direct cross-origin calls are
// expected).
const corsOrigin: boolean | string[] =
  configuredOrigins.length > 0 ? configuredOrigins : !isProduction;

const app: Express = express();

// Required when running behind a reverse proxy / load balancer (Render,
// Railway, Fly, Netlify's proxy, etc.) so Express correctly detects HTTPS
// and sets secure cookies instead of silently dropping them.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
// express-session's default MemoryStore is explicitly NOT for production: it
// leaks memory and loses every session on restart or redeploy, and doesn't
// work at all with more than one server instance. Since a Postgres database
// is already provisioned for the app, we store sessions there instead.
const PgSessionStore = connectPgSimple(session);

// COOKIE_SAMESITE: "lax" (default) works when the frontend is served from
// the same site as the API, e.g. via the Netlify /api/* proxy recommended in
// DEPLOYMENT.md. Set to "none" only if the frontend calls this API directly
// from a *different* registrable domain — that also requires secure cookies,
// which are forced on automatically in that case.
const configuredSameSite = (process.env.COOKIE_SAMESITE ?? "lax").toLowerCase();
const sameSite: "lax" | "strict" | "none" =
  configuredSameSite === "none" || configuredSameSite === "strict"
    ? (configuredSameSite as "none" | "strict")
    : "lax";
const secureCookie = isProduction || sameSite === "none" || process.env.COOKIE_SECURE === "true";

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    name: "bls.sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: secureCookie,
      httpOnly: true,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

app.use("/api", router);

export default app;

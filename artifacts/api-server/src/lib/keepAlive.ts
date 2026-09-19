import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Keep-alive for free-tier hosts (like Render) that spin a service down
// after ~15 minutes with no inbound traffic. An external uptime monitor
// (UptimeRobot, etc.) hitting this server should already prevent that, but
// if it's misconfigured or pointed at the wrong URL, the service still
// sleeps. This is a self-contained backup: the server periodically pings
// its own public URL, which counts as genuine inbound traffic and resets
// the host's inactivity timer — no external service required.
//
// This does NOT prevent the very first cold start after a fresh deploy
// (nothing is pinging yet at that point), only gaps of inactivity after
// that. It also only helps at all when something reaches the server
// initially to start the interval below — Render itself keeps the process
// running once started, this just stops it from being marked idle.
// ---------------------------------------------------------------------------

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — comfortably under Render's ~15 min idle threshold

function resolveKeepAliveUrl(): string | null {
  // KEEP_ALIVE_URL is an explicit override (e.g. if you're on a host that
  // doesn't auto-provide its own URL, or you want to point at a custom
  // domain). RENDER_EXTERNAL_URL is set automatically by Render for every
  // web service — no configuration needed there.
  const explicit = process.env["KEEP_ALIVE_URL"];
  if (explicit) return explicit.replace(/\/+$/, "");

  const renderUrl = process.env["RENDER_EXTERNAL_URL"];
  if (renderUrl) return renderUrl.replace(/\/+$/, "");

  return null;
}

export function startKeepAlive(): void {
  // Opt-out valve, and off by default outside production so local dev and
  // preview environments don't spam themselves with requests.
  const explicitlyEnabled = process.env["KEEP_ALIVE_ENABLED"] === "true";
  const explicitlyDisabled = process.env["KEEP_ALIVE_ENABLED"] === "false";
  const isProduction = process.env["NODE_ENV"] === "production";

  if (explicitlyDisabled || (!isProduction && !explicitlyEnabled)) {
    return;
  }

  const baseUrl = resolveKeepAliveUrl();
  if (!baseUrl) {
    logger.warn(
      "Keep-alive is enabled but no URL is available (set KEEP_ALIVE_URL, or deploy somewhere that provides RENDER_EXTERNAL_URL) — skipping self-ping.",
    );
    return;
  }

  const pingUrl = `${baseUrl}/api/healthz`;

  const ping = async () => {
    try {
      const res = await fetch(pingUrl, { method: "GET" });
      logger.info({ pingUrl, status: res.status }, "Keep-alive ping sent");
    } catch (err) {
      // A failed ping isn't fatal — just log it and try again next interval.
      logger.warn({ pingUrl, err }, "Keep-alive ping failed");
    }
  };

  const timer = setInterval(ping, PING_INTERVAL_MS);
  // Don't let this timer keep the process alive on its own during shutdown.
  timer.unref();

  logger.info({ pingUrl, intervalMinutes: PING_INTERVAL_MS / 60_000 }, "Keep-alive self-ping started");
}

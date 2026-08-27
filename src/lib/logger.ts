// ponytail: tiny structured logger, no deps, secrets never logged
type Level = "info" | "warn" | "error";
function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const safeMeta = meta ? JSON.stringify(meta).replace(/Bearer\s+\S+/g, "Bearer [REDACTED]") : "";
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg} ${safeMeta}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};

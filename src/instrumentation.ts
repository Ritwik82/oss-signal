export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // ponytail: observability hook — logs cold-start without leaking secrets
    const { logger } = await import("./lib/logger");
    logger.info("pulsaross cold start", { runtime: process.env.NEXT_RUNTIME });
  }
}

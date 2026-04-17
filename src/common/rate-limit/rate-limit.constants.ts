/**
 * Shared fixed-window budget (HTTP + Socket.IO handshake) per user per minute.
 * Window buckets align to `Math.floor(Date.now() / 60_000)` (60s from Unix epoch).
 */
export const FREE_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE = 2; // lower values for easier testing
export const PAID_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE = 4;

/** TTL slightly above 60s so keys expire cleanly across the boundary. */
export const RATE_LIMIT_WINDOW_TTL_SECONDS = 90;

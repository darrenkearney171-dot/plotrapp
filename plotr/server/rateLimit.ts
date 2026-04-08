// ─── In-memory Rate Limiter ────────────────────────────────────────────────
// Lightweight, zero-dependency rate limiter for Express.
// Suitable for single-server deployments. For multi-server,
// swap to Redis-backed limiter (e.g. express-rate-limit + rate-limit-redis).

import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Unique name for this limiter (e.g. "estimate", "upload") */
  name: string;
  /** Maximum requests per window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Custom message when rate limited */
  message?: string;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/**
 * Creates an Express middleware that rate-limits requests by IP.
 */
export function rateLimit(options: RateLimitOptions) {
  const { name, maxRequests, windowSeconds, message } = options;

  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      // New window
      store.set(ip, { count: 1, resetAt: now + windowSeconds * 1000 });
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: message ?? "Too many requests. Please try again later.",
        retryAfter,
      });
    }

    return next();
  };
}

// ─── Pre-configured limiters for Plotr endpoints ────────────────────────────

/** Guest estimate: 10 per minute per IP */
export const estimateRateLimit = rateLimit({
  name: "estimate",
  maxRequests: 10,
  windowSeconds: 60,
  message: "Too many estimate requests. Please wait a minute and try again.",
});

/** Quote requests: 5 per minute per IP */
export const quoteRateLimit = rateLimit({
  name: "quote",
  maxRequests: 5,
  windowSeconds: 60,
  message: "Too many quote requests. Please wait a minute and try again.",
});

/** File uploads: 20 per minute per IP */
export const uploadRateLimit = rateLimit({
  name: "upload",
  maxRequests: 20,
  windowSeconds: 60,
  message: "Too many uploads. Please wait a minute and try again.",
});

/** Waitlist join: 5 per minute per IP */
export const waitlistRateLimit = rateLimit({
  name: "waitlist",
  maxRequests: 5,
  windowSeconds: 60,
  message: "Too many signups. Please wait a minute and try again.",
});

/** General API: 100 per minute per IP */
export const apiRateLimit = rateLimit({
  name: "api",
  maxRequests: 100,
  windowSeconds: 60,
});

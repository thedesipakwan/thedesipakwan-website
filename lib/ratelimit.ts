import "server-only";

/**
 * Simple fixed-window rate limiter, per client IP, held in memory.
 * On serverless hosting each instance keeps its own counts, so this blunts
 * scripts and floods rather than giving an exact global limit. For a hard
 * global limit add Vercel WAF rate-limiting rules or Upstash Redis.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

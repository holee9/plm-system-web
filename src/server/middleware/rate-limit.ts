/**
 * Rate Limiter Middleware
 *
 * In-memory rate limiting implementation for authentication endpoints.
 * Can be upgraded to Redis-based distributed rate limiting in production.
 *
 * Features:
 * - IP-based rate limiting
 * - Sliding window algorithm
 * - Configurable window size and request limits
 * - Memory cleanup for expired windows
 * - AC-010: 10 login attempts per minute
 * - NFR-002: Rate limiting on auth endpoints
 *
 * @task TASK-011
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in window
}

interface RequestRecord {
  timestamp: number;
}

/**
 * Rate Limiter Class
 *
 * Implements sliding window rate limiting with in-memory storage.
 * Each identifier (typically IP address or email) has its own window.
 */
export class RateLimiter {
  private options: RateLimiterOptions;
  private store: Map<string, RequestRecord[]>;

  constructor(options: RateLimiterOptions) {
    this.options = options;
    this.store = new Map();

    // Set up periodic cleanup of expired records (every 5 minutes)
    if (typeof window === "undefined") {
      // Only run in Node.js environment
      setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Check if request is allowed for identifier
   *
   * Implements sliding window algorithm:
   * 1. Remove expired records from the window
   * 2. Count remaining records in window
   * 3. If count < max, allow and record request
   * 4. If count >= max, deny request
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Get existing records for identifier
    let records = this.store.get(identifier) || [];

    // Remove expired records (outside the window)
    records = records.filter((record) => record.timestamp > windowStart);

    // Count requests in current window
    const requestCount = records.length;

    if (requestCount >= this.options.maxRequests) {
      // Rate limit exceeded
      // Find oldest record to calculate reset time
      const oldestRecord = records[0];
      const resetAt = new Date(oldestRecord.timestamp + this.options.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request to records
    records.push({ timestamp: now });
    this.store.set(identifier, records);

    // Calculate remaining requests
    const remaining = this.options.maxRequests - records.length;

    // Calculate reset time (when oldest record expires)
    const resetAt = new Date(records[0].timestamp + this.options.windowMs);

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  /**
   * Reset rate limit for identifier
   * Used when user successfully authenticates or for testing
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired records for all identifiers
   * Runs periodically to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    for (const [identifier, records] of this.store.entries()) {
      // Remove expired records
      const validRecords = records.filter((record) => record.timestamp > windowStart);

      if (validRecords.length === 0) {
        // Remove identifier entirely if no valid records
        this.store.delete(identifier);
      } else {
        // Update with filtered records
        this.store.set(identifier, validRecords);
      }
    }
  }

  /**
   * Create Next.js middleware function
   *
   * @param identifierGenerator - Function to extract identifier from request
   * @returns Next.js middleware function
   */
  middleware(identifierGenerator: (req: Request) => string) {
    return async (req: Request) => {
      const identifier = identifierGenerator(req);
      const result = await this.checkLimit(identifier);

      if (!result.allowed) {
        // Return 429 Too Many Requests
        return new Response(
          JSON.stringify({
            error: "Too many requests",
            message: "너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.",
            resetAt: result.resetAt.toISOString(),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": this.options.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": result.resetAt.toISOString(),
              "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Allow request to proceed
      return null;
    };
  }
}

/**
 * Default rate limiter for authentication endpoints
 * AC-010: 10 attempts per minute (NFR-002)
 */
export const authRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

/**
 * Rate limiter for password reset endpoints
 * More restrictive: 3 requests per hour
 */
export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 requests per hour
});

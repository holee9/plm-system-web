/**
 * Rate Limiter Tests
 *
 * TDD: RED-GREEN-REFACTOR cycle for rate limiting middleware
 *
 * AC-010: 1분 이내에 10회 이상 로그인 시도하면 rate limiting 에러 반환
 * NFR-002: 인증 엔드포인트에 rate limiting 적용 (분당 10회)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "@/server/middleware/rate-limit";

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;
  let mockDate: Date;

  beforeEach(() => {
    // Use in-memory store for testing
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 10,
    });

    mockDate = new Date("2026-02-18T10:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("checkLimit", () => {
    it("should allow requests within the limit", async () => {
      const identifier = "user@example.com";
      const result = await rateLimiter.checkLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeDefined();
    });

    it("should track remaining requests correctly", async () => {
      const identifier = "user@example.com";

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit(identifier);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it("should block requests when limit is exceeded", async () => {
      const identifier = "user@example.com";

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkLimit(identifier);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset counter after window expires", async () => {
      const identifier = "user@example.com";

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(identifier);
      }

      // Verify blocked
      let result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(false);

      // Advance time by 61 seconds (past window)
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe("reset", () => {
    it("should reset rate limit for identifier", async () => {
      const identifier = "user@example.com";

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(identifier);
      }

      // Reset
      rateLimiter.reset(identifier);

      // Should start fresh
      const result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("should handle resetting non-existent identifier", () => {
      expect(() => {
        rateLimiter.reset("nonexistent@example.com");
      }).not.toThrow();
    });
  });

  describe("middleware", () => {
    it("should create middleware function", () => {
      const middleware = rateLimiter.middleware({
        identifierGenerator: (req) => req.headers.get("x-forwarded-for") || "unknown",
      });

      expect(typeof middleware).toBe("function");
    });
  });

  describe("AC-010: 10 login attempts per minute", () => {
    it("should allow exactly 10 login attempts in 1 minute", async () => {
      const identifier = "login@example.com";

      // AC-010: 1분 이내에 10회 시도는 허용
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkLimit(identifier);
        expect(result.allowed).toBe(true);
      }
    });

    it("should block 11th login attempt within 1 minute", async () => {
      const identifier = "login@example.com";

      // AC-010: 11번째 시도는 차단
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit(identifier);
      }

      const result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("IP-based rate limiting", () => {
    it("should rate limit by IP address", async () => {
      const ip1 = "192.168.1.100";
      const ip2 = "192.168.1.101";

      // IP1 makes 10 requests
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkLimit(ip1);
        expect(result.allowed).toBe(true);
      }

      // IP1 should be blocked
      let result = await rateLimiter.checkLimit(ip1);
      expect(result.allowed).toBe(false);

      // IP2 should still be allowed (different IP)
      result = await rateLimiter.checkLimit(ip2);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe("sliding window behavior", () => {
    it("should implement sliding window correctly", async () => {
      const identifier = "sliding@example.com";

      // Make 5 requests at t=0
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(identifier);
      }

      // Advance 30 seconds
      vi.advanceTimersByTime(30000);

      // Make 5 more requests at t=30
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(identifier);
      }

      // Should now be at limit (10 requests in window)
      let result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(false);

      // Advance 31 seconds (t=61)
      // First 5 requests should have fallen out of window
      vi.advanceTimersByTime(31000);

      // Should allow 5 more requests
      for (let i = 0; i < 5; i++) {
        result = await rateLimiter.checkLimit(identifier);
        expect(result.allowed).toBe(true);
      }
    });
  });
});

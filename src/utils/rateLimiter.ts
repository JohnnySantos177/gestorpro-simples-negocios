
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - entry.count);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // Auth attempts
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // API calls

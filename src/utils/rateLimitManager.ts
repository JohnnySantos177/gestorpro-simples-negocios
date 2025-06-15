
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitManager {
  private attempts = new Map<string, RateLimitEntry>();
  private configs: Record<string, RateLimitConfig> = {
    checkout: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
    webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  };

  isAllowed(identifier: string, type: keyof typeof this.configs): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const config = this.configs[type];
    const now = Date.now();
    const key = `${type}:${identifier}`;
    const entry = this.attempts.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.attempts.delete(key);
    }

    const currentEntry = this.attempts.get(key);

    if (!currentEntry) {
      // First request in window
      this.attempts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }

    if (currentEntry.count >= config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: currentEntry.resetTime
      };
    }

    // Increment counter
    currentEntry.count++;
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime
    };
  }

  reset(identifier: string, type: keyof typeof this.configs): void {
    const key = `${type}:${identifier}`;
    this.attempts.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

export const rateLimitManager = new RateLimitManager();

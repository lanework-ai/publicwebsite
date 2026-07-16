import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting
const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limiter using in-memory store
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 } // Default: 5 requests per minute
): RateLimitResult {
  // Get client identifier (IP address or forwarded IP)
  const identifier =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const key = `${identifier}`;

  // Initialize or get existing rate limit data
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  // Increment count
  rateLimitStore[key].count += 1;

  // Check if limit exceeded
  if (rateLimitStore[key].count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - rateLimitStore[key].count,
    resetTime: rateLimitStore[key].resetTime,
  };
}

/**
 * Validates honeypot field to detect bots
 * @param honeypot - The honeypot field value
 * @returns true if valid (empty), false if bot detected
 */
export function validateHoneypot(honeypot: unknown): boolean {
  // Honeypot should be empty or undefined
  // If it has a value, it's likely a bot
  return !honeypot || (typeof honeypot === 'string' && honeypot.trim() === '');
}

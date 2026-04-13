import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware configuration
 * Limits requests to prevent abuse and ensure service availability
 */

// General rate limiter (applies to all routes unless overridden)
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to apply rate limiting based on endpoint category
export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip rate limiting for development environment
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Apply strict rate limiting to auth endpoints
  if (req.path.startsWith('/api/auth')) {
    return authRateLimiter(req, res, next);
  }

  // Apply general rate limiting to all other endpoints
  return generalRateLimiter(req, res, next);
};
import rateLimit from 'express-rate-limit';

// rate limiter middleware
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: 'Too many requests, please try again later.' 
  }
});

// Stricter rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    error: 'Too many authentication attempts, please try again later.' 
  }
});
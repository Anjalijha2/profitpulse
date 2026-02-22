import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    limit: process.env.NODE_ENV === 'test' ? 1000 : 100, // Allow 100 requests per window (more for testing)
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after a minute',
    },
});

export const loginRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 20, // Limit each IP to 20 login requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 5 minutes',
    },
});

export default rateLimiter;

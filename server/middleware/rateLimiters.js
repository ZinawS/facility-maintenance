const rateLimit = require("express-rate-limit");

/** Tight limiter for brute-force-sensitive auth endpoints. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

/**
 * Looser limiter applied to the whole API to blunt abuse/scraping.
 * Public marketing-content GETs (/api/public/*) are exempt: a single page
 * load fires several of them (services, blogs, testimonials, settings), so
 * counting them here made ordinary browsing trip the cap. Mutating and
 * authenticated routes still go through this limiter.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET" && req.path.startsWith("/api/public"),
  message: { message: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, generalLimiter };

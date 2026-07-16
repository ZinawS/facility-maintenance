const rateLimit = require("express-rate-limit");

/** Tight limiter for brute-force-sensitive auth endpoints. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

/** Looser limiter applied to the whole API to blunt abuse/scraping. */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, generalLimiter };

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

/**
 * Requires a valid JWT. Populates req.user from the token payload.
 */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Populates req.user if a valid token is present, but never rejects the
 * request. Used by routes that behave the same for guests and logged-in
 * users but should attribute the action to a user when possible (e.g.
 * payments) — never trust a client-supplied userId instead.
 */
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, jwtSecret);
  } catch {
    // Ignore invalid/expired token on optional routes; treat as anonymous.
  }
  next();
}

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;

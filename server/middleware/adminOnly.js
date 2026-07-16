/**
 * Requires `auth` middleware to have run first (populates req.user).
 */
module.exports = function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

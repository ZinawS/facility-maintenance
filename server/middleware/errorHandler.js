const multer = require("multer");
const logger = require("../config/logger");
const { isProduction } = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.originalUrl, method: req.method }, "Request error");

  if (err instanceof multer.MulterError || err.message?.includes("images are allowed")) {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  const status = err.statusCode || err.status || 500;
  const message =
    status < 500 || !isProduction
      ? err.message || "Internal server error"
      : "Internal server error";

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };

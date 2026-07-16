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

  // Only trust a status code we set ourselves (err.appStatusCode, via
  // asError() below). Third-party SDKs (Stripe, etc.) attach their own
  // .statusCode/.status to errors reflecting *their* upstream response —
  // e.g. an expired Stripe key throws with .statusCode 401, which used to
  // get relayed here as our API's own 401 and force-logged out whoever
  // triggered it (the frontend treats any 401 as "your session expired").
  const status = err.appStatusCode || 500;
  const message =
    status < 500 || !isProduction
      ? err.message || "Internal server error"
      : "Internal server error";

  res.status(status).json({ message });
}

/** Marks an error with a status code this handler is allowed to relay to the client. */
function asError(message, statusCode) {
  const err = new Error(message);
  err.appStatusCode = statusCode;
  return err;
}

module.exports = { notFound, errorHandler, asError };

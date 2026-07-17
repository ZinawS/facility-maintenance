const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const pinoHttp = require("pino-http");

const env = require("./config/env");
const logger = require("./config/logger");
const { pool, checkConnection } = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const mountContentRoutes = require("./routes/content");

const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/client");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");
const reportsRoutes = require("./routes/reports");
const { router: paymentsRoutes, webhookRouter: paymentsWebhookRouter } = require("./routes/payments");
const { publicRouter: legalPublicRoutes, adminRouter: legalAdminRoutes } = require("./routes/legal");

const app = express();

app.use(helmet());
app.use(compression());
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/api/health" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(generalLimiter);

// Provide the DB pool to every route via req.db — mounted before the
// webhook route below, which needs it too (it was previously mounted
// after this and silently ran with req.db undefined, masked because the
// "webhook not configured" early-return always fired first).
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Stripe webhook needs the raw request body for signature verification, so
// it's mounted before the global JSON body parser.
app.use("/api/payments", paymentsWebhookRouter);

app.use(express.json({ limit: "1mb" }));

// Uploaded images are meant to be embedded by the frontend on a different
// origin (and eventually other consumers), so they need an explicit
// cross-origin resource policy — helmet's default (same-origin) blocks the
// browser from rendering them even though the request itself succeeds.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  })
);

app.get("/api/health", async (req, res) => {
  try {
    await checkConnection();
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "unavailable", error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/public/legal", legalPublicRoutes);
app.use("/api/admin/legal", legalAdminRoutes);
mountContentRoutes(app);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port} (${env.nodeEnv})`);
});

function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    logger.info("Server closed");
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;

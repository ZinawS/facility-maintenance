const path = require("path");
// Explicit path, not the default cwd-relative lookup: some process
// managers (e.g. Hostinger's LiteSpeed Node app runner) launch the app
// with its cwd set to the app root rather than this file's directory,
// which made dotenv silently find nothing and fall through to whatever
// the platform happened to inject directly into process.env.
//
// override: true — dotenv's default leaves any var already present in
// process.env untouched. Some host panels inject their own copies of
// these same variable names (e.g. a JWT_SECRET set once when the app
// was first created in the panel's UI) directly into the environment
// before this file ever runs, which then silently wins over — and can
// drift out of sync with — this file. This app's .env is the single
// source of truth; it should never lose quietly to an untracked value
// neither committed to the repo nor visible anywhere on disk.
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: true });

const REQUIRED_VARS = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "CLIENT_URL",
];

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length) {
  // Fail fast: a silently-defaulted DB password or JWT secret is worse than a crash at boot.
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "Copy .env.example to .env and fill in real values."
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters long.");
  process.exit(1);
}

const corsOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL,
  corsOrigins,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
  },
  mailer: {
    email: process.env.NODEMAILER_EMAIL || null,
    pass: process.env.NODEMAILER_PASS || null,
  },
  // Configurable so production deploys can point uploads outside the
  // git-managed app directory — a redeploy that resets the app root to
  // match the repo (fresh clone, rsync mirror, hPanel's Git auto-deploy)
  // would otherwise silently wipe every previously uploaded file.
  uploadDir: process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(__dirname, "..", "uploads"),
};

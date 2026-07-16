const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const { authLimiter } = require("../middleware/rateLimiters");
const { sendMail } = require("../config/mailer");
const env = require("../config/env");

const router = express.Router();

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

router.post(
  "/register",
  authLimiter,
  [
    body("name").isString().trim().isLength({ min: 1, max: 150 }).withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const [existingUser] = await req.db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await req.db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "client"]
    );
    res.status(201).json({ success: true });
  })
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [users] = await req.db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.banned) {
      return res.status(403).json({ message: "Account is banned" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  })
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail().withMessage("A valid email is required")],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const [users] = await req.db.query("SELECT id, email FROM users WHERE email = ?", [email]);
    const user = users[0];
    // Always respond the same way whether or not the email exists, to avoid
    // leaking which addresses are registered.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await req.db.query(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
        [hashToken(rawToken), expiry, user.id]
      );
      await sendMail({
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>Click <a href="${env.clientUrl}/reset-password/${rawToken}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      });
    }
    res.json({ message: "If that email is registered, a reset link has been sent." });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const [users] = await req.db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [hashToken(token)]
    );
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired reset link" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await req.db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );
    res.json({ message: "Password reset successful" });
  })
);

module.exports = router;

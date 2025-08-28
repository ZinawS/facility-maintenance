const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

/**
 * Register a new user
 * @route POST /api/auth/register
 * @param {Object} req.body - User registration data
 * @param {string} req.body.name - User name
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Success response
 */
router.post("/register", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "client"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error registering user:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Log in a user
 * @route POST /api/auth/login
 * @param {Object} req.body - User login credentials
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} User data and JWT token
 */
router.post("/login", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.banned) {
      return res.status(403).json({ message: "Account is banned" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Request a password reset link
 * @route POST /api/auth/forgot-password
 * @param {Object} req.body - Email data
 * @param {string} req.body.email - User email
 * @returns {Object} Success message
 */
router.post("/forgot-password", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { email } = req.body;
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await connection.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [token, expiry, email]
    );
    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${process.env.CLIENT_URL}/reset-password/${token}">here</a> to reset your password.</p>`,
    });
    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("Error sending reset link:", err);
    res
      .status(500)
      .json({ message: "Failed to send reset link", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Reset user password
 * @route POST /api/auth/reset-password
 * @param {Object} req.body - Reset data
 * @param {string} req.body.token - Reset token
 * @param {string} req.body.password - New password
 * @returns {Object} Success message
 */
router.post("/reset-password", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { token, password } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token expired" });
    }
    const [users] = await connection.query(
      "SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > ?",
      [decoded.id, token, new Date()]
    );
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res
      .status(500)
      .json({ message: "Failed to reset password", error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

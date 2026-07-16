const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/client");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");
require("dotenv").config();

/**
 * Express application instance
 * @type {import('express').Express}
 */
const app = express();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "facilitypro",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// CORS configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Provide database pool to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

/**
 * Stripe payment intent creation endpoint with transaction logging
 * @route POST /api/payments/create
 * @param {Object} req.body - Payment details
 * @param {number} req.body.amount - Amount in cents
 * @param {string} req.body.currency - Currency code
 * @param {string} req.body.description - Payment description
 * @param {number} [req.body.userId] - Optional user ID for logged-in users
 * @returns {Object} Payment intent with client secret
 */
app.post("/api/payments/create", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { amount, currency, description, userId } = req.body;
    if (!amount || !currency || !description) {
      return res
        .status(400)
        .json({ message: "Missing required payment fields" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      payment_method_types: ["card"],
    });
    await connection.query(
      "INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, description, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userId || null,
        paymentIntent.id,
        amount / 100,
        currency,
        description,
        "pending",
      ]
    );
    await connection.commit();
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating payment intent:", error);
    res
      .status(500)
      .json({
        message: "Failed to create payment intent",
        error: error.message,
      });
  } finally {
    connection.release();
  }
});

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));

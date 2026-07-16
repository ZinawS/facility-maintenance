const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const logger = require("../config/logger");
const { cancelOrder, CANCELABLE_FULFILLMENT_STATUSES } = require("../utils/orders");

const router = express.Router();

/**
 * @route GET /api/client/service-history
 */
router.get(
  "/service-history",
  auth,
  asyncHandler(async (req, res) => {
    const [history] = await req.db.query(
      "SELECT * FROM service_history WHERE user_id = ? ORDER BY date DESC",
      [req.user.id]
    );
    res.json(history);
  })
);

/**
 * @route GET /api/client/equipment
 */
router.get(
  "/equipment",
  auth,
  asyncHandler(async (req, res) => {
    const [equipment] = await req.db.query(
      "SELECT * FROM equipment WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(equipment);
  })
);

/**
 * @route GET /api/client/payments
 * The logged-in customer's own order/payment history.
 */
router.get(
  "/payments",
  auth,
  asyncHandler(async (req, res) => {
    const [payments] = await req.db.query(
      `SELECT id, description, amount, currency, status, fulfillment_status,
              tracking_number, cancel_reason, created_at
       FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(payments);
  })
);

/**
 * @route PUT /api/client/payments/:id/cancel
 * Customers can cancel their own order while it hasn't shipped yet; if it
 * was already paid, this issues a Stripe refund automatically.
 */
router.put(
  "/payments/:id/cancel",
  auth,
  [
    param("id").isInt(),
    body("reason").optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query("SELECT * FROM payments WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    const payment = rows[0];
    if (!payment) return res.status(404).json({ message: "Order not found" });
    if (!CANCELABLE_FULFILLMENT_STATUSES.includes(payment.fulfillment_status)) {
      return res
        .status(400)
        .json({ message: "This order can no longer be canceled — it has already shipped." });
    }

    try {
      const outcome = await cancelOrder(req.db, payment, req.body.reason);
      res.json({ success: true, status: outcome });
    } catch (err) {
      logger.error({ err }, "Refund failed");
      res.status(502).json({ message: "Failed to process the refund. Please contact support." });
    }
  })
);

/**
 * @route POST /api/client/feedback
 */
router.post(
  "/feedback",
  auth,
  [body("comment").isString().trim().isLength({ min: 1, max: 3000 }).withMessage("Comment is required")],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { comment } = req.body;
    await req.db.query(
      "INSERT INTO feedback (user_id, comment, type, status) VALUES (?, ?, 'feedback', 'pending')",
      [req.user.id, comment]
    );
    res.status(201).json({ success: true });
  })
);

/**
 * @route GET /api/client/service-requests
 */
router.get(
  "/service-requests",
  auth,
  asyncHandler(async (req, res) => {
    const [requests] = await req.db.query(
      `SELECT id, service_type, description, status, quote_amount_cents, quote_message, quoted_at, created_at
       FROM service_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(requests);
  })
);

/**
 * @route POST /api/client/service-requests
 */
router.post(
  "/service-requests",
  auth,
  [
    body("service_type").isString().trim().isLength({ min: 1, max: 150 }).withMessage("Service type is required"),
    body("description").isString().trim().isLength({ min: 1, max: 3000 }).withMessage("Description is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { service_type, description } = req.body;
    const [result] = await req.db.query(
      "INSERT INTO service_requests (user_id, service_type, description, status) VALUES (?, ?, ?, 'Pending')",
      [req.user.id, service_type, description]
    );
    res.status(201).json({ id: result.insertId, success: true });
  })
);

/**
 * @route POST /api/client/contact
 */
router.post(
  "/contact",
  [
    body("name").isString().trim().isLength({ min: 1, max: 150 }).withMessage("Name is required"),
    body("phone").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Phone is required"),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
    body("company").optional({ nullable: true }).isString().trim().isLength({ max: 150 }),
    body("equipment_type").optional({ nullable: true }).isString().trim().isLength({ max: 150 }),
    body("message").isString().trim().isLength({ min: 1, max: 3000 }).withMessage("Message is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { name, company, phone, email, equipment_type, message } = req.body;
    await req.db.query(
      "INSERT INTO feedback (name, company, email, phone, equipment_type, comment, type, status) VALUES (?, ?, ?, ?, ?, ?, 'contact', 'pending')",
      [name, company || null, email, phone, equipment_type || null, message]
    );
    res.status(201).json({ success: true, message: "Message sent successfully" });
  })
);

module.exports = router;

const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");

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

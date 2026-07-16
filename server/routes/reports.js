const express = require("express");
const { query } = require("express-validator");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const { toCsv } = require("../utils/csv");

const router = express.Router();
router.use(auth, adminOnly);

const dateRangeValidators = [
  query("from").optional().isISO8601().withMessage("from must be a date (YYYY-MM-DD)"),
  query("to").optional().isISO8601().withMessage("to must be a date (YYYY-MM-DD)"),
];

/** Resolves the [from, to] window, defaulting to the trailing 30 days. */
function resolveRange(req) {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from
    ? new Date(req.query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  // Include the entire `to` day.
  const toInclusive = new Date(to);
  toInclusive.setHours(23, 59, 59, 999);
  return { from, to: toInclusive };
}

/**
 * @route GET /api/admin/reports/summary
 * Aggregated data for the admin dashboard's charts, all scoped to ?from=&to=.
 */
router.get(
  "/summary",
  dateRangeValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const { from, to } = resolveRange(req);
    const range = [from, to];

    const [
      [revenueByDay],
      [paymentsByStatus],
      [serviceRequestsByStatus],
      [feedbackByStatus],
      [usersByDay],
    ] = await Promise.all([
      req.db.query(
        `SELECT DATE(created_at) AS date,
                SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) AS revenue,
                COUNT(*) AS count
         FROM payments WHERE created_at BETWEEN ? AND ?
         GROUP BY DATE(created_at) ORDER BY date`,
        range
      ),
      req.db.query(
        `SELECT status, COUNT(*) AS count, SUM(amount) AS total
         FROM payments WHERE created_at BETWEEN ? AND ? GROUP BY status`,
        range
      ),
      req.db.query(
        `SELECT status, COUNT(*) AS count FROM service_requests
         WHERE created_at BETWEEN ? AND ? GROUP BY status`,
        range
      ),
      req.db.query(
        `SELECT status, COUNT(*) AS count FROM feedback
         WHERE type = 'feedback' AND created_at BETWEEN ? AND ? GROUP BY status`,
        range
      ),
      req.db.query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count FROM users
         WHERE created_at BETWEEN ? AND ? GROUP BY DATE(created_at) ORDER BY date`,
        range
      ),
    ]);

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      revenueByDay,
      paymentsByStatus,
      serviceRequestsByStatus,
      feedbackByStatus,
      usersByDay,
    });
  })
);

const EXPORTABLE = {
  payments: {
    sql: `SELECT p.id, p.user_id, u.name AS user_name, p.description, p.amount, p.currency, p.status, p.created_at
          FROM payments p LEFT JOIN users u ON p.user_id = u.id
          WHERE p.created_at BETWEEN ? AND ? ORDER BY p.created_at DESC`,
  },
  "service-requests": {
    sql: `SELECT s.id, s.user_id, u.name AS user_name, s.service_type, s.description, s.status, s.created_at
          FROM service_requests s LEFT JOIN users u ON s.user_id = u.id
          WHERE s.created_at BETWEEN ? AND ? ORDER BY s.created_at DESC`,
  },
  feedback: {
    sql: `SELECT f.id, f.user_id, u.name AS user_name, f.comment, f.status, f.created_at
          FROM feedback f LEFT JOIN users u ON f.user_id = u.id
          WHERE f.type = 'feedback' AND f.created_at BETWEEN ? AND ? ORDER BY f.created_at DESC`,
  },
  "contact-messages": {
    sql: `SELECT id, name, company, email, phone, equipment_type, comment AS message, created_at
          FROM feedback WHERE type = 'contact' AND created_at BETWEEN ? AND ? ORDER BY created_at DESC`,
  },
  users: {
    sql: `SELECT id, name, email, role, banned, created_at FROM users
          WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`,
  },
};

/**
 * @route GET /api/admin/reports/export/:type
 * Streams a CSV of the requested resource for the given date range.
 */
router.get(
  "/export/:type",
  dateRangeValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const config = EXPORTABLE[req.params.type];
    if (!config) return res.status(404).json({ message: "Unknown report type" });

    const { from, to } = resolveRange(req);
    const [rows] = await req.db.query(config.sql, [from, to]);

    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.type}.csv"`);
    res.send(csv);
  })
);

module.exports = router;

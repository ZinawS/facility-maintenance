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

function resolveRange(req) {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from
    ? new Date(req.query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const toInclusive = new Date(to);
  toInclusive.setHours(23, 59, 59, 999);
  return { from, to: toInclusive };
}

// Every entry that actually moved money: a completed sale, its refund (if
// any) as its own reversing line on the date it was refunded, and manual
// expenses. Failed/pending/canceled-before-payment rows never appear —
// no money moved for those.
const LEDGER_SQL = `
  SELECT * FROM (
    SELECT p.created_at AS entry_date, 'income' AS type, p.description AS description,
           NULL AS category, p.amount AS amount, p.id AS source_id, 'payment' AS source
    FROM payments p WHERE p.status IN ('succeeded', 'refunded')
    UNION ALL
    SELECT p.refunded_at AS entry_date, 'refund' AS type, CONCAT('Refund: ', p.description) AS description,
           NULL AS category, -p.amount AS amount, p.id AS source_id, 'payment' AS source
    FROM payments p WHERE p.status = 'refunded' AND p.refunded_at IS NOT NULL
    UNION ALL
    SELECT e.expense_date AS entry_date, 'expense' AS type, e.description AS description,
           e.category AS category, -e.amount AS amount, e.id AS source_id, 'expense' AS source
    FROM expenses e
  ) ledger
  WHERE entry_date BETWEEN ? AND ?
  ORDER BY entry_date ASC, source_id ASC
`;

/**
 * @route GET /api/admin/ledger
 * Combined income (payments) + expenses view with a running balance.
 */
router.get(
  "/",
  dateRangeValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const { from, to } = resolveRange(req);
    const [rows] = await req.db.query(LEDGER_SQL, [from, to]);

    let balance = 0;
    let income = 0;
    let expenses = 0;
    const entries = rows.map((row) => {
      const amount = Number(row.amount);
      balance += amount;
      if (amount >= 0) income += amount;
      else expenses += -amount;
      return { ...row, amount, balance };
    });

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      entries,
      totals: { income, expenses, net: income - expenses },
    });
  })
);

/**
 * @route GET /api/admin/ledger/export
 */
router.get(
  "/export",
  dateRangeValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const { from, to } = resolveRange(req);
    const [rows] = await req.db.query(LEDGER_SQL, [from, to]);
    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="ledger.csv"`);
    res.send(csv);
  })
);

module.exports = router;

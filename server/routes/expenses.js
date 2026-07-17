const express = require("express");
const { body, param } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const handleValidation = require("../middleware/handleValidation");

const router = express.Router();
router.use(auth, adminOnly);

const CATEGORIES = ["inventory", "payroll", "utilities", "rent", "marketing", "equipment", "other"];

const validators = [
  body("description").isString().trim().isLength({ min: 1, max: 255 }).withMessage("description is required"),
  body("amount").isFloat({ min: 0.01 }).withMessage("amount must be a positive number"),
  body("category").isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(", ")}`),
  body("expense_date").isISO8601().withMessage("expense_date must be a date (YYYY-MM-DD)"),
];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query("SELECT * FROM expenses ORDER BY expense_date DESC, id DESC");
    res.json(rows);
  })
);

router.post(
  "/",
  validators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const { description, amount, category, expense_date } = req.body;
    const [result] = await req.db.query(
      "INSERT INTO expenses (description, amount, category, expense_date, created_by) VALUES (?, ?, ?, ?, ?)",
      [description, amount, category, expense_date, req.user.id]
    );
    const [rows] = await req.db.query("SELECT * FROM expenses WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

router.put(
  "/:id",
  param("id").isInt(),
  validators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const { description, amount, category, expense_date } = req.body;
    const [result] = await req.db.query(
      "UPDATE expenses SET description = ?, amount = ?, category = ?, expense_date = ? WHERE id = ?",
      [description, amount, category, expense_date, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Not found" });
    const [rows] = await req.db.query("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  })
);

router.delete(
  "/:id",
  param("id").isInt(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const [result] = await req.db.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  })
);

module.exports = router;

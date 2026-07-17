const express = require("express");
const { param, body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const DOCUMENT_TYPES = ["terms", "disclaimer"];

const publicRouter = express.Router();
const adminRouter = express.Router();

/**
 * @route GET /api/public/legal/:type
 * The currently published version of a legal document (terms/disclaimer).
 */
publicRouter.get(
  "/:type",
  [param("type").isIn(DOCUMENT_TYPES)],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query(
      "SELECT type, title, content, version, published_at FROM legal_documents WHERE type = ? AND is_published = 1",
      [req.params.type]
    );
    if (!rows.length) return res.status(404).json({ message: "Document not found" });
    res.json(rows[0]);
  })
);

adminRouter.use(auth, adminOnly);

/**
 * @route GET /api/admin/legal/:type
 */
adminRouter.get(
  "/:type",
  [param("type").isIn(DOCUMENT_TYPES)],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query("SELECT * FROM legal_documents WHERE type = ?", [req.params.type]);
    if (!rows.length) return res.status(404).json({ message: "Document not found" });
    res.json(rows[0]);
  })
);

/**
 * @route PUT /api/admin/legal/:type
 * Every save publishes a new version — there's no separate draft state,
 * matching how blogs/site-settings work elsewhere in this admin panel.
 * Past acceptances (legal_acceptances) reference the version number they
 * were recorded against, so this never retroactively changes history.
 */
adminRouter.put(
  "/:type",
  [
    param("type").isIn(DOCUMENT_TYPES),
    body("title").isString().trim().isLength({ min: 1, max: 200 }).withMessage("Title is required"),
    body("content").isString().trim().isLength({ min: 1 }).withMessage("Content is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const [result] = await req.db.query(
      `UPDATE legal_documents
       SET title = ?, content = ?, version = version + 1, is_published = 1, published_at = NOW()
       WHERE type = ?`,
      [title, content, req.params.type]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Document not found" });
    const [rows] = await req.db.query("SELECT * FROM legal_documents WHERE type = ?", [req.params.type]);
    res.json(rows[0]);
  })
);

module.exports = { publicRouter, adminRouter, DOCUMENT_TYPES };

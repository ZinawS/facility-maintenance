const express = require("express");
const { body, param } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const handleValidation = require("../middleware/handleValidation");
const upload = require("../middleware/upload");

/**
 * Builds a public (read-only, active rows) + admin (full CRUD) router pair
 * for a simple content table: services, team members, FAQs, plans, parts,
 * knowledge-base entries. `table` and `orderBy` are fixed, developer-supplied
 * strings (never derived from request data), so interpolating them into SQL
 * here is safe; all request-derived values still go through parameterized
 * queries below.
 */
function createResourceRouter({ table, fields, hasImage = false, orderBy = "sort_order ASC, id ASC" }) {
  const allFields = hasImage ? [...fields, { name: "image_url", type: "string" }] : fields;
  const columns = allFields.map((f) => f.name);

  const publicRouter = express.Router();
  const adminRouter = express.Router();

  const maybeUpload = hasImage ? upload.single("image") : (req, res, next) => next();

  publicRouter.get(
    "/",
    asyncHandler(async (req, res) => {
      const [rows] = await req.db.query(
        `SELECT * FROM ${table} WHERE is_active = 1 ORDER BY ${orderBy}`
      );
      res.json(rows.map(deserialize));
    })
  );

  adminRouter.use(auth, adminOnly);

  adminRouter.get(
    "/",
    asyncHandler(async (req, res) => {
      const [rows] = await req.db.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
      res.json(rows.map(deserialize));
    })
  );

  adminRouter.post(
    "/",
    maybeUpload,
    validationChain(fields, { partial: false }),
    handleValidation,
    asyncHandler(async (req, res) => {
      const data = normalize(fields, req.body);
      if (hasImage && req.file) data.image_url = `/uploads/${req.file.filename}`;
      const cols = columns.filter((c) => c in data);
      const [result] = await req.db.query(
        `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
        cols.map((c) => data[c])
      );
      const [rows] = await req.db.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      res.status(201).json(deserialize(rows[0]));
    })
  );

  adminRouter.put(
    "/:id",
    param("id").isInt(),
    maybeUpload,
    validationChain(fields, { partial: true }),
    handleValidation,
    asyncHandler(async (req, res) => {
      const [existing] = await req.db.query(`SELECT id FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!existing.length) return res.status(404).json({ message: "Not found" });

      const data = normalize(fields, req.body);
      if (hasImage && req.file) data.image_url = `/uploads/${req.file.filename}`;
      const cols = columns.filter((c) => c in data);
      if (cols.length) {
        await req.db.query(
          `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
          [...cols.map((c) => data[c]), req.params.id]
        );
      }
      const [rows] = await req.db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json(deserialize(rows[0]));
    })
  );

  adminRouter.delete(
    "/:id",
    param("id").isInt(),
    handleValidation,
    asyncHandler(async (req, res) => {
      const [result] = await req.db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!result.affectedRows) return res.status(404).json({ message: "Not found" });
      res.json({ success: true });
    })
  );

  return { publicRouter, adminRouter };
}

function validationChain(fields, { partial }) {
  return fields.map((f) => {
    let chain = body(f.name);
    chain = f.required && !partial ? chain.notEmpty().withMessage(`${f.name} is required`) : chain.optional({ nullable: true });

    if (f.type === "int") chain = chain.isInt(f.min !== undefined ? { min: f.min } : {}).toInt();
    else if (f.type === "bool") chain = chain.isBoolean().toBoolean();
    else if (f.type === "json") {
      chain = chain.custom((value) => {
        if (value === undefined || value === null || value === "") return true;
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) throw new Error(`${f.name} must be an array`);
        return true;
      });
    } else {
      chain = chain.isString().trim();
      if (f.max) chain = chain.isLength({ max: f.max }).withMessage(`${f.name} must be ${f.max} characters or fewer`);
    }
    return chain;
  });
}

function normalize(fields, body) {
  const out = {};
  for (const f of fields) {
    if (!(f.name in body) || body[f.name] === undefined) continue;
    let value = body[f.name];
    if (f.type === "json") {
      const parsed = typeof value === "string" && value !== "" ? JSON.parse(value) : value || [];
      value = JSON.stringify(parsed);
    } else if (f.type === "bool") {
      value = value === true || value === "true" || value === "1" || value === 1 ? 1 : 0;
    } else if (f.type === "int") {
      value = value === "" || value === null ? null : Number(value);
    } else if (value === "") {
      value = null;
    }
    out[f.name] = value;
  }
  return out;
}

function deserialize(row) {
  if (!row) return row;
  const out = { ...row };
  for (const key of Object.keys(out)) {
    if (typeof out[key] === "string" && (key === "features" || key === "steps")) {
      try {
        out[key] = JSON.parse(out[key]);
      } catch {
        out[key] = [];
      }
    }
    if (key === "is_active" || key === "is_featured") out[key] = !!out[key];
  }
  return out;
}

module.exports = { createResourceRouter };

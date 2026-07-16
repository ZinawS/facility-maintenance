const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const handleValidation = require("../middleware/handleValidation");

const ALLOWED_KEYS = ["address", "email", "phone", "working_hours", "emergency_phone"];

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query("SELECT setting_key, setting_value FROM site_settings");
    res.json(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])));
  })
);

adminRouter.use(auth, adminOnly);

adminRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query(
      "SELECT setting_key, setting_value, updated_at FROM site_settings"
    );
    res.json(rows);
  })
);

adminRouter.put(
  "/",
  body().custom((value) => {
    const keys = Object.keys(value || {});
    if (!keys.length) throw new Error("At least one setting is required");
    for (const key of keys) {
      if (!ALLOWED_KEYS.includes(key)) throw new Error(`Unknown setting key: ${key}`);
    }
    return true;
  }),
  handleValidation,
  asyncHandler(async (req, res) => {
    for (const [key, value] of Object.entries(req.body)) {
      await req.db.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }
    const [rows] = await req.db.query("SELECT setting_key, setting_value FROM site_settings");
    res.json(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])));
  })
);

module.exports = { publicRouter, adminRouter };

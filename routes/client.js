const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * Get client service history
 * @route GET /api/client/service-history
 * @returns {Array} List of service history items
 */
router.get("/service-history", authMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [history] = await connection.query(
      "SELECT * FROM service_history WHERE user_id = ?",
      [req.user.id]
    );
    res.json(history);
  } catch (err) {
    console.error("Error fetching service history:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch service history", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Get client equipment
 * @route GET /api/client/equipment
 * @returns {Array} List of equipment items
 */
router.get("/equipment", authMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [equipment] = await connection.query(
      "SELECT * FROM equipment WHERE user_id = ?",
      [req.user.id]
    );
    res.json(equipment);
  } catch (err) {
    console.error("Error fetching equipment:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch equipment", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Submit client feedback
 * @route POST /api/client/feedback
 * @param {Object} req.body - Feedback data
 * @param {string} req.body.comment - Feedback comment
 * @returns {Object} Success response
 */
router.post("/feedback", authMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }
    await connection.query(
      "INSERT INTO feedback (user_id, comment, status) VALUES (?, ?, ?)",
      [req.user.id, comment, "pending"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res
      .status(500)
      .json({ message: "Failed to submit feedback", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Submit contact form message
 * @route POST /api/client/contact
 * @param {Object} req.body - Contact form data
 * @param {string} req.body.name - Sender name
 * @param {string} [req.body.company] - Sender company
 * @param {string} req.body.phone - Sender phone
 * @param {string} req.body.email - Sender email
 * @param {string} [req.body.equipment_type] - Equipment type
 * @param {string} req.body.message - Message content
 * @returns {Object} Success response
 */
router.post("/contact", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { name, company, phone, email, equipment_type, message } = req.body;
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    await connection.query(
      "INSERT INTO feedback (name, email, phone, equipment_type, comment, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, equipment_type || null, message, "pending"]
    );
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Error submitting contact message:", err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Get parts inventory
 * @route GET /api/client/parts
 * @returns {Array} List of parts
 */
router.get("/parts", async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [parts] = await connection.query("SELECT * FROM parts");
    res.json(parts);
  } catch (err) {
    console.error("Error fetching parts:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch parts", error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

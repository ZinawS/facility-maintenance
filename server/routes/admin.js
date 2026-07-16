const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * Middleware to ensure admin access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.use(authMiddleware);

/**
 * Get all users
 * @route GET /api/admin/users
 * @returns {Array} List of users
 */
router.get("/users", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [users] = await connection.query(
      "SELECT id, name, email, role, banned FROM users"
    );
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Update user role
 * @route PUT /api/admin/users/:id/role
 * @param {string} req.params.id - User ID
 * @param {Object} req.body - Role data
 * @param {string} req.body.role - New role ('admin' or 'client')
 * @returns {Object} Success response
 */
router.put("/users/:id/role", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { role } = req.body;
    if (!["admin", "client"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }
    await connection.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating user role:", err);
    res
      .status(500)
      .json({ message: "Failed to update user role", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Ban or unban a user
 * @route PUT /api/admin/users/:id/ban
 * @param {string} req.params.id - User ID
 * @param {Object} req.body - Ban status
 * @param {boolean} req.body.banned - Ban status
 * @returns {Object} Success response
 */
router.put("/users/:id/ban", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { banned } = req.body;
    if (typeof banned !== "boolean") {
      return res.status(400).json({ message: "Invalid ban status" });
    }
    const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }
    await connection.query("UPDATE users SET banned = ? WHERE id = ?", [
      banned,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating user ban status:", err);
    res
      .status(500)
      .json({ message: "Failed to update ban status", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Get all payments
 * @route GET /api/admin/payments
 * @returns {Array} List of payment records
 */
router.get("/payments", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [payments] = await connection.query(
      "SELECT p.id, p.user_id, p.stripe_payment_intent_id, p.amount, p.currency, p.description, p.status, p.created_at, u.name AS user_name FROM payments p LEFT JOIN users u ON p.user_id = u.id"
    );
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch payments", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Get all service requests
 * @route GET /api/admin/service-requests
 * @returns {Array} List of service requests
 */
router.get("/service-requests", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [requests] = await connection.query(
      "SELECT s.id, s.user_id, s.service_type, s.description, s.status, s.created_at, u.name AS user_name FROM service_requests s LEFT JOIN users u ON s.user_id = u.id"
    );
    res.json(requests);
  } catch (err) {
    console.error("Error fetching service requests:", err);
    res
      .status(500)
      .json({
        message: "Failed to fetch service requests",
        error: err.message,
      });
  } finally {
    connection.release();
  }
});

/**
 * Get all contact messages (via feedback table)
 * @route GET /api/admin/contact-messages
 * @returns {Array} List of contact messages
 */
router.get("/contact-messages", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [messages] = await connection.query(
      "SELECT f.id, f.name, f.email, f.phone, f.equipment_type, f.comment AS message, f.created_at FROM feedback f WHERE f.name IS NOT NULL OR f.email IS NOT NULL OR f.phone IS NOT NULL"
    );
    res.json(messages);
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res
      .status(500)
      .json({
        message: "Failed to fetch contact messages",
        error: err.message,
      });
  } finally {
    connection.release();
  }
});

/**
 * Get all feedback
 * @route GET /api/admin/feedback
 * @returns {Array} List of feedback items
 */
router.get("/feedback", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [feedback] = await connection.query(
      "SELECT f.id, f.user_id, f.name, f.email, f.phone, f.equipment_type, f.comment, f.status, u.name AS user_name FROM feedback f LEFT JOIN users u ON f.user_id = u.id"
    );
    res.json(feedback);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch feedback", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Approve feedback
 * @route POST /api/admin/feedback/approve/:id
 * @param {string} req.params.id - Feedback ID
 * @returns {Object} Success response
 */
router.post("/feedback/approve/:id", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [feedback] = await connection.query(
      "SELECT * FROM feedback WHERE id = ?",
      [req.params.id]
    );
    if (!feedback.length) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    await connection.query("UPDATE feedback SET status = ? WHERE id = ?", [
      "approved",
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error approving feedback:", err);
    res
      .status(500)
      .json({ message: "Failed to approve feedback", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Reject feedback
 * @route POST /api/admin/feedback/reject/:id
 * @param {string} req.params.id - Feedback ID
 * @returns {Object} Success response
 */
router.post("/feedback/reject/:id", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [feedback] = await connection.query(
      "SELECT * FROM feedback WHERE id = ?",
      [req.params.id]
    );
    if (!feedback.length) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    await connection.query("UPDATE feedback SET status = ? WHERE id = ?", [
      "rejected",
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error rejecting feedback:", err);
    res
      .status(500)
      .json({ message: "Failed to reject feedback", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Get all blogs
 * @route GET /api/admin/blogs
 * @returns {Array} List of blog posts
 */
router.get("/blogs", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [blogs] = await connection.query(
      "SELECT b.id, b.title, b.content, b.created_at, u.name AS author FROM blogs b JOIN users u ON b.author_id = u.id"
    );
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch blogs", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Create a new blog post
 * @route POST /api/admin/blogs
 * @param {Object} req.body - Blog data
 * @param {string} req.body.title - Blog title
 * @param {string} req.body.content - Blog content
 * @returns {Object} Success response
 */
router.post("/blogs", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    await connection.query(
      "INSERT INTO blogs (author_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title, content]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error creating blog:", err);
    res
      .status(500)
      .json({ message: "Failed to create blog", error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * Update an existing blog post
 * @route PUT /api/admin/blogs/:id
 * @param {string} req.params.id - Blog post ID
 * @param {Object} req.body - Blog data
 * @param {string} req.body.title - Blog title
 * @param {string} req.body.content - Blog content
 * @returns {Object} Success response
 */
router.put("/blogs/:id", adminMiddleware, async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    const [blog] = await connection.query(
      "SELECT * FROM blogs WHERE id = ? AND author_id = ?",
      [req.params.id, req.user.id]
    );
    if (!blog.length) {
      return res
        .status(404)
        .json({
          message: "Blog not found or you are not authorized to edit it",
        });
    }
    await connection.query(
      "UPDATE blogs SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [title, content, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating blog:", err);
    res
      .status(500)
      .json({ message: "Failed to update blog", error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

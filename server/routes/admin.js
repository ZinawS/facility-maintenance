const express = require("express");
const { body, param } = require("express-validator");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const { getPagination, buildMeta } = require("../utils/paginate");
const { sendMail } = require("../config/mailer");

const router = express.Router();

router.use(auth, adminOnly);

/**
 * @route GET /api/admin/users
 */
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req);
    const [[{ total }]] = await req.db.query("SELECT COUNT(*) AS total FROM users");
    const [users] = await req.db.query(
      "SELECT id, name, email, role, banned, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json({ data: users, meta: buildMeta({ page, limit }, total) });
  })
);

/**
 * @route PUT /api/admin/users/:id/role
 */
router.put(
  "/users/:id/role",
  [param("id").isInt(), body("role").isIn(["admin", "client"]).withMessage("Invalid role")],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [user] = await req.db.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!user.length) return res.status(404).json({ message: "User not found" });
    await req.db.query("UPDATE users SET role = ? WHERE id = ?", [req.body.role, req.params.id]);
    res.json({ success: true });
  })
);

/**
 * @route PUT /api/admin/users/:id/ban
 */
router.put(
  "/users/:id/ban",
  [param("id").isInt(), body("banned").isBoolean().withMessage("Invalid ban status")],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [user] = await req.db.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!user.length) return res.status(404).json({ message: "User not found" });
    await req.db.query("UPDATE users SET banned = ? WHERE id = ?", [
      req.body.banned ? 1 : 0,
      req.params.id,
    ]);
    res.json({ success: true });
  })
);

/**
 * @route GET /api/admin/payments
 */
router.get(
  "/payments",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req);
    const [[{ total }]] = await req.db.query("SELECT COUNT(*) AS total FROM payments");
    const [payments] = await req.db.query(
      `SELECT p.id, p.user_id, p.stripe_payment_intent_id, p.amount, p.currency, p.description,
              p.status, p.created_at, u.name AS user_name
       FROM payments p LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: payments, meta: buildMeta({ page, limit }, total) });
  })
);

/**
 * @route GET /api/admin/service-requests
 */
router.get(
  "/service-requests",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req);
    const [[{ total }]] = await req.db.query("SELECT COUNT(*) AS total FROM service_requests");
    const [requests] = await req.db.query(
      `SELECT s.id, s.user_id, s.service_type, s.description, s.status,
              s.quote_amount_cents, s.quote_message, s.quoted_at, s.created_at,
              u.name AS user_name, u.email AS user_email
       FROM service_requests s LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: requests, meta: buildMeta({ page, limit }, total) });
  })
);

/**
 * @route PUT /api/admin/service-requests/:id
 * Admin responds to a service request with a status change and/or a quote.
 * When a quote is included, the customer is emailed the quote details.
 */
router.put(
  "/service-requests/:id",
  [
    param("id").isInt(),
    body("status").optional().isIn(["Pending", "In Progress", "Completed", "Cancelled"]),
    body("quote_amount_cents").optional({ nullable: true }).isInt({ min: 100 }),
    body("quote_message").optional({ nullable: true }).isString().trim().isLength({ max: 3000 }),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [rows] = await req.db.query(
      `SELECT s.*, u.email AS user_email, u.name AS user_name
       FROM service_requests s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [req.params.id]
    );
    const request = rows[0];
    if (!request) return res.status(404).json({ message: "Service request not found" });

    const { status, quote_amount_cents, quote_message } = req.body;
    const hasQuote = quote_amount_cents !== undefined || quote_message !== undefined;

    const updates = [];
    const values = [];
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }
    if (hasQuote) {
      updates.push("quote_amount_cents = ?", "quote_message = ?", "quoted_at = NOW()");
      values.push(quote_amount_cents ?? null, quote_message ?? null);
    }
    if (!updates.length) return res.status(400).json({ message: "Nothing to update" });

    await req.db.query(`UPDATE service_requests SET ${updates.join(", ")} WHERE id = ?`, [
      ...values,
      req.params.id,
    ]);

    if (hasQuote && request.user_email) {
      await sendMail({
        to: request.user_email,
        subject: `Quote for your ${request.service_type} request`,
        html: `<p>Hi ${request.user_name || "there"},</p>
               <p>Here's a quote for your service request (${request.service_type}):</p>
               <p><strong>${
                 quote_amount_cents != null ? `$${(quote_amount_cents / 100).toFixed(2)}` : ""
               }</strong></p>
               <p>${quote_message || ""}</p>
               <p>Log in to your dashboard to review and pay online.</p>`,
      });
    }

    res.json({ success: true });
  })
);

/**
 * @route GET /api/admin/contact-messages
 */
router.get(
  "/contact-messages",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req);
    const [[{ total }]] = await req.db.query(
      "SELECT COUNT(*) AS total FROM feedback WHERE type = 'contact'"
    );
    const [messages] = await req.db.query(
      `SELECT id, name, company, email, phone, equipment_type, comment AS message, created_at
       FROM feedback WHERE type = 'contact' ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: messages, meta: buildMeta({ page, limit }, total) });
  })
);

/**
 * @route GET /api/admin/feedback
 */
router.get(
  "/feedback",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req);
    const [[{ total }]] = await req.db.query(
      "SELECT COUNT(*) AS total FROM feedback WHERE type = 'feedback'"
    );
    const [feedback] = await req.db.query(
      `SELECT f.id, f.user_id, f.comment, f.status, f.created_at, u.name AS user_name
       FROM feedback f LEFT JOIN users u ON f.user_id = u.id
       WHERE f.type = 'feedback' ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: feedback, meta: buildMeta({ page, limit }, total) });
  })
);

/**
 * @route POST /api/admin/feedback/approve/:id
 */
router.post(
  "/feedback/approve/:id",
  [param("id").isInt()],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [result] = await req.db.query(
      "UPDATE feedback SET status = 'approved', is_read = 1 WHERE id = ?",
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Feedback not found" });
    res.json({ success: true });
  })
);

/**
 * @route POST /api/admin/feedback/reject/:id
 */
router.post(
  "/feedback/reject/:id",
  [param("id").isInt()],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [result] = await req.db.query(
      "UPDATE feedback SET status = 'rejected', is_read = 1 WHERE id = ?",
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Feedback not found" });
    res.json({ success: true });
  })
);

/**
 * @route PUT /api/admin/contact-messages/:id/read
 */
router.put(
  "/contact-messages/:id/read",
  [param("id").isInt()],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [result] = await req.db.query(
      "UPDATE feedback SET is_read = 1 WHERE id = ? AND type = 'contact'",
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Contact message not found" });
    res.json({ success: true });
  })
);

/**
 * @route GET /api/admin/alerts
 * Aggregates everything currently awaiting admin action: unread contact
 * messages, unreviewed feedback, and service requests that haven't been
 * quoted yet. Each item carries enough to render + act on it directly.
 */
router.get(
  "/alerts",
  asyncHandler(async (req, res) => {
    const [[contactMessages], [feedback], [serviceRequests]] = await Promise.all([
      req.db.query(
        `SELECT id, name, company, email, phone, equipment_type, comment AS message, created_at
         FROM feedback WHERE type = 'contact' AND is_read = 0 ORDER BY created_at ASC`
      ),
      req.db.query(
        `SELECT f.id, f.comment, f.created_at, u.name AS user_name
         FROM feedback f LEFT JOIN users u ON f.user_id = u.id
         WHERE f.type = 'feedback' AND f.is_read = 0 ORDER BY f.created_at ASC`
      ),
      req.db.query(
        `SELECT s.id, s.service_type, s.description, s.status, s.created_at, u.name AS user_name
         FROM service_requests s LEFT JOIN users u ON s.user_id = u.id
         WHERE s.status = 'Pending' AND s.quote_amount_cents IS NULL ORDER BY s.created_at ASC`
      ),
    ]);

    const items = [
      ...contactMessages.map((m) => ({ type: "contact_message", ...m })),
      ...feedback.map((f) => ({ type: "feedback", ...f })),
      ...serviceRequests.map((s) => ({ type: "service_request", ...s })),
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json({ total: items.length, items });
  })
);

/**
 * @route GET /api/admin/blogs
 */
router.get(
  "/blogs",
  asyncHandler(async (req, res) => {
    const [blogs] = await req.db.query(
      `SELECT b.id, b.title, b.content, b.created_at, b.updated_at, u.name AS author
       FROM blogs b JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC`
    );
    res.json(blogs);
  })
);

/**
 * @route POST /api/admin/blogs
 */
router.post(
  "/blogs",
  [
    body("title").isString().trim().isLength({ min: 1, max: 255 }).withMessage("Title is required"),
    body("content").isString().trim().isLength({ min: 1 }).withMessage("Content is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const [result] = await req.db.query(
      "INSERT INTO blogs (author_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title, content]
    );
    res.status(201).json({ id: result.insertId, success: true });
  })
);

/**
 * @route PUT /api/admin/blogs/:id
 */
router.put(
  "/blogs/:id",
  [
    param("id").isInt(),
    body("title").isString().trim().isLength({ min: 1, max: 255 }).withMessage("Title is required"),
    body("content").isString().trim().isLength({ min: 1 }).withMessage("Content is required"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const [blog] = await req.db.query("SELECT id FROM blogs WHERE id = ?", [req.params.id]);
    if (!blog.length) return res.status(404).json({ message: "Blog not found" });
    await req.db.query(
      "UPDATE blogs SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [title, content, req.params.id]
    );
    res.json({ success: true });
  })
);

/**
 * @route DELETE /api/admin/blogs/:id
 */
router.delete(
  "/blogs/:id",
  [param("id").isInt()],
  handleValidation,
  asyncHandler(async (req, res) => {
    const [result] = await req.db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Blog not found" });
    res.json({ success: true });
  })
);

module.exports = router;

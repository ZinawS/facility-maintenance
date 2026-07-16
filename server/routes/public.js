const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

/**
 * @route GET /api/public/feedback/approved
 */
router.get(
  "/feedback/approved",
  asyncHandler(async (req, res) => {
    const [feedback] = await req.db.query(
      `SELECT f.id, f.comment AS quote, u.name AS author
       FROM feedback f JOIN users u ON f.user_id = u.id
       WHERE f.status = 'approved' AND f.type = 'feedback'
       ORDER BY RAND() LIMIT 3`
    );
    res.json(feedback);
  })
);

/**
 * @route GET /api/public/blogs
 */
router.get(
  "/blogs",
  asyncHandler(async (req, res) => {
    const [blogs] = await req.db.query(
      `SELECT b.id, b.title, b.content, b.created_at, u.name AS author
       FROM blogs b JOIN users u ON b.author_id = u.id
       ORDER BY b.created_at DESC LIMIT 6`
    );
    res.json(blogs);
  })
);

module.exports = router;

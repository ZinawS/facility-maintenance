
const express = require('express');
const router = express.Router();

/**
 * Get three random approved feedback items for public display
 * @route GET /api/public/feedback/approved
 * @returns {Array} List of three random approved feedback items
 */
router.get('/feedback/approved', async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [feedback] = await connection.query(
      'SELECT f.id, f.comment AS quote, u.name AS author FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.status = "approved" AND f.type = "feedback" ORDER BY RAND() LIMIT 3'
    );
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching approved feedback:', err);
    res.status(500).json({
      message: 'Failed to fetch approved feedback',
      error: err.message,
    });
  } finally {
    connection.release();
  }
});

/**
 * Get all public blogs
 * @route GET /api/public/blogs
 * @returns {Array} List of blog posts
 */
router.get('/blogs', async (req, res) => {
  const connection = await req.db.getConnection();
  try {
    const [blogs] = await connection.query(
      'SELECT b.id, b.title, b.content, b.created_at, u.name AS author FROM blogs b JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC LIMIT 6'
    );
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({
      message: 'Failed to fetch blogs',
      error: err.message,
    });
  } finally {
    connection.release();
  }
});

module.exports = router;


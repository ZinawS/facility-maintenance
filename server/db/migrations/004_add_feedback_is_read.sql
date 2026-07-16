-- Backs the admin "needs attention" alerts queue (GET /api/admin/alerts):
-- a unified unread/unhandled flag for both contact messages (marked read)
-- and feedback submissions (set on approve/reject).

ALTER TABLE feedback ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0;

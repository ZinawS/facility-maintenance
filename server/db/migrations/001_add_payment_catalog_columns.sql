-- Additive, run-once migration for a `payments` table that predates the
-- plan/part checkout catalog (server/routes/payments.js). `db/schema.sql`'s
-- CREATE TABLE IF NOT EXISTS won't touch a table that already exists, so
-- this covers that gap. Already applied — running it again will error with
-- "Duplicate column name", which is a safe signal it's not needed.

ALTER TABLE payments
  ADD COLUMN plan_id INT NULL AFTER user_id,
  ADD COLUMN part_id INT NULL AFTER plan_id,
  ADD COLUMN quantity INT NULL AFTER part_id;

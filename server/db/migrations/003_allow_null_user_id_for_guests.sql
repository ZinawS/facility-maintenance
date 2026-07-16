-- Both `payments` and `feedback` predate guest/anonymous flows (guest
-- checkout for a plan/part; the public contact form, which has no user_id
-- at all) but were created with `user_id NOT NULL`. Under
-- STRICT_TRANS_TABLES (the default here) that makes both INSERTs fail with
-- "Field 'user_id' doesn't have a default value". Nothing else changes —
-- existing rows all already have a real user_id.

ALTER TABLE payments MODIFY COLUMN user_id BIGINT NULL;
ALTER TABLE feedback MODIFY COLUMN user_id BIGINT NULL;

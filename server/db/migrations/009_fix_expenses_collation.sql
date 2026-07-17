-- 008 created `expenses` without pinning a collation, so it picked up
-- whatever the MySQL server's current default is. On production that's
-- utf8mb4_uca1400_ai_ci (a newer default than when `payments` was
-- created), while `payments` itself is utf8mb4_0900_ai_ci — mixing the
-- two in the ledger's UNION query fails with "Illegal mix of collations".
-- Force `expenses` to match `payments`.

ALTER TABLE expenses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Manually-entered outgoing costs, for the admin ledger view. Income side
-- of the ledger is derived from `payments` (succeeded/refunded) rather
-- than duplicated here — see server/routes/ledger.js.

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  -- Dollars, matching payments.amount's convention (not cents) since the
  -- two are combined directly in the ledger query.
  amount DECIMAL(10, 2) NOT NULL,
  category ENUM('inventory', 'payroll', 'utilities', 'rent', 'marketing', 'equipment', 'other')
    NOT NULL DEFAULT 'other',
  expense_date DATE NOT NULL,
  -- BIGINT, not INT: matches users.id's actual deployed type.
  created_by BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

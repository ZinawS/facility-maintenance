-- Order lifecycle for parts purchases: separates the payment's financial
-- status (has money moved?) from fulfillment status (has it shipped?),
-- matching standard e-commerce practice (Stripe/Shopify/Amazon all keep
-- these distinct). Also adds cancel/refund audit fields.
--
-- Revenue reporting (server/routes/reports.js) already sums only
-- status = 'succeeded', so a refund (which moves status to 'refunded')
-- automatically drops out of revenue with no separate "negative entry"
-- needed — the row just stops counting, and Reports surfaces the refunded
-- total as its own metric so it's still visible, not silently gone.

ALTER TABLE payments MODIFY COLUMN status
  ENUM('pending', 'succeeded', 'failed', 'refunded', 'canceled') NOT NULL DEFAULT 'pending';

ALTER TABLE payments
  ADD COLUMN fulfillment_status
    ENUM('pending', 'accepted', 'processing', 'shipped', 'delivered', 'canceled')
    NOT NULL DEFAULT 'pending',
  ADD COLUMN tracking_number VARCHAR(100) NULL,
  ADD COLUMN cancel_reason VARCHAR(500) NULL,
  ADD COLUMN canceled_at TIMESTAMP NULL,
  ADD COLUMN refunded_at TIMESTAMP NULL;

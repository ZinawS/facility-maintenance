-- Additive, run-once migration adding the quote workflow to service_requests
-- (submit -> admin quotes -> customer pays) and linking payments back to the
-- request they paid for. Safe against the existing service_requests table
-- (status enum values already match: 'Pending','In Progress','Completed','Cancelled').

ALTER TABLE service_requests
  ADD COLUMN quote_amount_cents INT NULL,
  ADD COLUMN quote_message TEXT NULL,
  ADD COLUMN quoted_at TIMESTAMP NULL;

ALTER TABLE payments
  ADD COLUMN service_request_id INT NULL AFTER part_id;

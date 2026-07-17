-- Legal documents (Terms & Conditions, Disclaimer) as admin-editable
-- content, a registration-time acceptance audit trail (records the
-- *version* a user agreed to, so it stays valid even after the document
-- is later edited), and invoices for payments.

CREATE TABLE IF NOT EXISTS legal_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('terms', 'disclaimer') NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_id is BIGINT to match this database's users.id (a pre-existing
-- database this schema was reverse-engineered from; see migration 003 for
-- the same accommodation). A fresh install via schema.sql defines
-- users.id as INT throughout and stays self-consistent there.
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  document_type ENUM('terms', 'disclaimer') NOT NULL,
  document_version INT NOT NULL,
  accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(64) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(20) NOT NULL UNIQUE,
  payment_id BIGINT NOT NULL UNIQUE,
  user_id BIGINT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO legal_documents (type, title, content, version, is_published, published_at) VALUES
('terms', 'Terms & Conditions', '<h2>1. Acceptance of Terms</h2><p>By creating an account or using the services of One-Stop Utility Service ("we", "us", "our"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not register or use this site.</p><h2>2. Services</h2><p>We provide facility maintenance services, including HVAC, refrigeration, and related equipment maintenance, repair, and installation, along with a parts store and service plans, as described on this site. Service availability, pricing, and scope may change at our discretion.</p><h2>3. Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.</p><h2>4. Orders, Payments &amp; Pricing</h2><p>Prices for parts and service plans are as displayed at the time of purchase and are processed securely via Stripe. We do not store your card details. All charges are in USD unless otherwise stated.</p><h2>5. Cancellations &amp; Refunds</h2><p>Orders may be canceled prior to shipment for a full refund to your original payment method, processed automatically. Once an order has shipped, it is no longer eligible for self-service cancellation; contact us to arrange a return.</p><h2>6. Service Requests &amp; Quotes</h2><p>Submitting a service request does not obligate you to purchase. Quotes provided are estimates based on the information supplied and may be revised after an on-site inspection.</p><h2>7. Limitation of Liability</h2><p>To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of our services or this website.</p><h2>8. Changes to These Terms</h2><p>We may update these Terms from time to time. Continued use of the site after changes constitutes acceptance of the revised Terms.</p><h2>9. Contact</h2><p>Questions about these Terms can be directed to us via the Contact page.</p><p><em>This is template content and should be reviewed by qualified legal counsel before relying on it as a binding agreement.</em></p>', 1, 1, CURRENT_TIMESTAMP),
('disclaimer', 'Disclaimer', '<h2>General Information</h2><p>The content on this website, including service descriptions, guides, and knowledge base articles, is provided for general informational purposes only and does not constitute professional advice. Always consult a qualified technician before performing maintenance yourself.</p><h2>No Warranty</h2><p>While we strive for accuracy, we make no warranties about the completeness, reliability, or accuracy of this information. Any action you take based on the information on this site is strictly at your own risk.</p><h2>Third-Party Links</h2><p>This site may contain links to third-party websites. We are not responsible for the content or practices of any linked site.</p><h2>Service Outcomes</h2><p>Estimates, quotes, and timelines provided through the site are estimates only and are not guarantees of final cost or completion time, which may vary based on on-site conditions.</p><p><em>This is template content and should be reviewed by qualified legal counsel before relying on it as a binding agreement.</em></p>', 1, 1, CURRENT_TIMESTAMP);

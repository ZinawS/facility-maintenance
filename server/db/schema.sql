-- Facility Maintenance — reproducible schema, reverse-engineered from every
-- query in routes/*.js (no schema previously existed in source control).
-- Safe to run against a fresh database: `mysql -u root -p facilitypro < db/schema.sql`

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Core / auth
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  banned TINYINT(1) NOT NULL DEFAULT 0,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Client-facing operational data
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  service VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  model VARCHAR(150) NOT NULL,
  serial VARCHAR(100) NOT NULL,
  last_service DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A client submits a request (service_type + description); an admin
-- responds with a quote (quote_amount_cents + quote_message, emailed to the
-- customer) and/or a status change. Once quoted, the customer can pay for it
-- via POST /api/payments/create { kind: 'service_request' } — the server
-- reads quote_amount_cents itself, the client never supplies an amount.
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  service_type VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  quote_amount_cents INT NULL,
  quote_message TEXT NULL,
  quoted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- `type` distinguishes client feedback ('feedback') from public contact-form
-- submissions ('contact'); the original code queried this column but nothing
-- ever set it, so /api/public/feedback/approved could never return rows.
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(150) NULL,
  company VARCHAR(150) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  equipment_type VARCHAR(150) NULL,
  comment TEXT NOT NULL,
  type ENUM('feedback', 'contact') NOT NULL DEFAULT 'feedback',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  -- Unified "needs admin attention" flag for both contact messages (marked
  -- read) and feedback submissions (set on approve/reject) — see
  -- GET /api/admin/alerts.
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  plan_id INT NULL,
  part_id INT NULL,
  service_request_id INT NULL,
  quantity INT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  description VARCHAR(255) NOT NULL,
  -- Financial status (has money moved?) is intentionally separate from
  -- fulfillment_status (has it shipped?) — see db/migrations/006.
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'canceled') NOT NULL DEFAULT 'pending',
  fulfillment_status
    ENUM('pending', 'accepted', 'processing', 'shipped', 'delivered', 'canceled')
    NOT NULL DEFAULT 'pending',
  tracking_number VARCHAR(100) NULL,
  cancel_reason VARCHAR(500) NULL,
  canceled_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Blog (already admin-managed pre-existing feature)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Admin-managed marketing/content (new — replaces hardcoded frontend data)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  short_description VARCHAR(300) NOT NULL,
  description TEXT NULL,
  icon VARCHAR(50) NULL,
  image_url VARCHAR(500) NULL,
  features JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(150) NOT NULL,
  bio VARCHAR(1000) NULL,
  image_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(300) NOT NULL,
  answer VARCHAR(3000) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_cents INT NULL,
  price_label VARCHAR(50) NULL,
  billing_period VARCHAR(20) NULL,
  features JSON NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000) NULL,
  category VARCHAR(100) NULL,
  price_cents INT NOT NULL,
  sku VARCHAR(50) NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS knowledge_guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  steps JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS knowledge_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Legal documents (admin-managed content, required acceptance at signup)
-- and invoices — see db/migrations/007 for the full rationale.
-- ---------------------------------------------------------------------------

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

-- Records the *version* a user agreed to (not a live reference to the
-- document), so a later edit doesn't retroactively change what a past
-- registration legally agreed to.
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_type ENUM('terms', 'disclaimer') NOT NULL,
  document_version INT NOT NULL,
  accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(64) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(20) NOT NULL UNIQUE,
  payment_id INT NOT NULL UNIQUE,
  user_id INT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO legal_documents (type, title, content, version, is_published, published_at) VALUES
('terms', 'Terms & Conditions', '<h2>1. Acceptance of Terms</h2><p>By creating an account or using the services of One-Stop Utility Service ("we", "us", "our"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not register or use this site.</p><h2>2. Services</h2><p>We provide facility maintenance services, including HVAC, refrigeration, and related equipment maintenance, repair, and installation, along with a parts store and service plans, as described on this site. Service availability, pricing, and scope may change at our discretion.</p><h2>3. Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.</p><h2>4. Orders, Payments &amp; Pricing</h2><p>Prices for parts and service plans are as displayed at the time of purchase and are processed securely via Stripe. We do not store your card details. All charges are in USD unless otherwise stated.</p><h2>5. Cancellations &amp; Refunds</h2><p>Orders may be canceled prior to shipment for a full refund to your original payment method, processed automatically. Once an order has shipped, it is no longer eligible for self-service cancellation; contact us to arrange a return.</p><h2>6. Service Requests &amp; Quotes</h2><p>Submitting a service request does not obligate you to purchase. Quotes provided are estimates based on the information supplied and may be revised after an on-site inspection.</p><h2>7. Limitation of Liability</h2><p>To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of our services or this website.</p><h2>8. Changes to These Terms</h2><p>We may update these Terms from time to time. Continued use of the site after changes constitutes acceptance of the revised Terms.</p><h2>9. Contact</h2><p>Questions about these Terms can be directed to us via the Contact page.</p><p><em>This is template content and should be reviewed by qualified legal counsel before relying on it as a binding agreement.</em></p>', 1, 1, CURRENT_TIMESTAMP),
('disclaimer', 'Disclaimer', '<h2>General Information</h2><p>The content on this website, including service descriptions, guides, and knowledge base articles, is provided for general informational purposes only and does not constitute professional advice. Always consult a qualified technician before performing maintenance yourself.</p><h2>No Warranty</h2><p>While we strive for accuracy, we make no warranties about the completeness, reliability, or accuracy of this information. Any action you take based on the information on this site is strictly at your own risk.</p><h2>Third-Party Links</h2><p>This site may contain links to third-party websites. We are not responsible for the content or practices of any linked site.</p><h2>Service Outcomes</h2><p>Estimates, quotes, and timelines provided through the site are estimates only and are not guarantees of final cost or completion time, which may vary based on on-site conditions.</p><p><em>This is template content and should be reviewed by qualified legal counsel before relying on it as a binding agreement.</em></p>', 1, 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE type = type;

-- ---------------------------------------------------------------------------
-- Seed data — migrated from the frontend's previously-hardcoded arrays so
-- the site isn't empty on first boot. All of it is editable from the admin
-- dashboard from this point forward.
-- ---------------------------------------------------------------------------

INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('address', '123 Maintenance St, Virginia, VA'),
  ('email', 'service@onestoputilityservice.com'),
  ('phone', '(800) 987-6543'),
  ('working_hours', 'Mon-Fri 8AM-5PM, 24/7 Emergency Service')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

INSERT INTO services (name, slug, short_description, description, icon, features, sort_order) VALUES
  ('HVAC Maintenance & Repair', 'hvac',
   'Comprehensive HVAC maintenance and repair services to keep your systems running efficiently year-round.',
   'Our technicians provide thermostat calibration, condensate drain inspection, coil cleaning, refrigerant level checks, electrical connection tightening, and moving-parts lubrication on every visit. Regular maintenance can reduce energy bills by up to 15%, extend equipment lifespan, and prevent costly mid-season breakdowns. We also handle common repairs including compressor failures, refrigerant leaks, blower motor issues, and thermostat problems on all major brands.',
   'Settings', JSON_ARRAY('24/7 Emergency Service', 'Preventative Maintenance', 'System Diagnostics'), 1),
  ('Walk-in Cooler/Freezer Service', 'cooler',
   'Preventative maintenance and emergency repairs for walk-in units to protect your inventory.',
   'Every service visit includes door and gasket inspection, drain line cleaning and trap priming, evaporator and condenser coil cleaning, defrost cycle and heater element checks, temperature calibration and alarm testing, and lighting and shelving inspection — protecting the inventory that depends on consistent temperatures.',
   'Snowflake', JSON_ARRAY('Temperature Monitoring', 'Door Seal Replacement', 'Coil Cleaning'), 2),
  ('Commercial Refrigeration', 'refrigeration',
   'Expert service for reach-ins, display cases, and ice machines to keep your business running smoothly.',
   'From display cases to ice machines, our team keeps your commercial refrigeration equipment running reliably with routine compressor and condenser service.',
   'Thermometer', JSON_ARRAY('Display Case Maintenance', 'Compressor Repair', 'Condenser Cleaning'), 3),
  ('HVAC Installation', 'installation',
   'Professional installation of new HVAC systems tailored to your facility''s specific needs.',
   'We size, design, and install energy-efficient HVAC systems matched to your facility''s layout and load requirements, including full ductwork design.',
   'Wrench', JSON_ARRAY('System Sizing', 'Energy-Efficient Options', 'Ductwork Design'), 4),
  ('Energy Efficiency Auditing', 'energy',
   'Comprehensive energy audits to optimize your facility''s energy usage and reduce costs.',
   'Our audits combine utility bill analysis and infrared scanning to identify waste, backed by customized recommendations you can act on immediately.',
   'Zap', JSON_ARRAY('Utility Bill Analysis', 'Infrared Scanning', 'Customized Recommendations'), 5),
  ('Indoor Air Quality Solutions', 'iaq',
   'Advanced solutions to improve indoor air quality for healthier environments.',
   'We assess ventilation, install air purification and filtration systems, and tune your HVAC system for healthier indoor air.',
   'Wind', JSON_ARRAY('Air Purification', 'Ventilation Assessment', 'Filtration Systems'), 6)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO team_members (name, role, bio, sort_order) VALUES
  ('John Doe', 'CEO', '10 years of experience in the industry.', 1),
  ('Jane Smith', 'Lead Technician', 'Factory trained and certified.', 2),
  ('Mike Johnson', 'Service Manager', 'Expert in client relations and scheduling.', 3);

INSERT INTO faqs (question, answer, sort_order) VALUES
  ('How often should I service my HVAC?', 'We recommend semi-annual maintenance to ensure optimal performance.', 1),
  ('What should I check if my walk-in is warm?', 'Check the door gasket, power supply, and temperature settings. If issues persist, call us.', 2),
  ('Do you offer financing?', 'Yes, we offer flexible financing options for new installations.', 3),
  ('What is the average lifespan of a commercial rooftop unit?', 'Typically 15-20 years with proper maintenance.', 4);

INSERT INTO service_plans (name, price_label, features, sort_order) VALUES
  ('Basic', 'Contact Us', JSON_ARRAY('2 Annual Visits', 'Discounted Repairs'), 1),
  ('Silver', 'Contact Us', JSON_ARRAY('4 Annual Visits', 'Priority Service', '10% Off Repairs'), 2),
  ('Gold', 'Contact Us', JSON_ARRAY('6 Annual Visits', '24/7 Priority Service', '15% Off Repairs', 'No Overtime Charges'), 3);

INSERT INTO parts (name, description, category, price_cents, sort_order) VALUES
  ('HVAC Filter', 'This is a HVAC Filter', 'HVAC', 10000, 1),
  ('Cooler Filter', 'This is a Cooler Filter', 'Refrigeration', 10000, 2),
  ('Condenser Coil', 'This is a Condenser Coil', 'Refrigeration', 13000, 3);

INSERT INTO knowledge_guides (title, steps, sort_order) VALUES
  ('Walk-in Not Cooling? Check These 3 Things',
   JSON_ARRAY('Inspect door gasket for proper seal', 'Check power supply and circuit breaker', 'Verify temperature settings'), 1),
  ('How to Reset a Tripped HVAC Breaker',
   JSON_ARRAY('Locate the breaker panel', 'Find the HVAC circuit', 'Reset the breaker to ON position'), 2);

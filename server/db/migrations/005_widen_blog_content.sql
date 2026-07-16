-- The ReactQuill editor can embed images as base64 data URIs directly in
-- the HTML, which routinely exceeds TEXT's 64KB cap (ER_DATA_TOO_LONG).
-- LONGTEXT allows up to 4GB.

ALTER TABLE blogs MODIFY COLUMN content LONGTEXT NOT NULL;

-- file: src/worker/migrations/0029_add_quote_sort_order.sql
ALTER TABLE quotes ADD COLUMN sort_order INTEGER;

-- Migrate existing data from JSON to the new column if it exists, otherwise default to 0
UPDATE quotes SET sort_order = COALESCE(CAST(json_extract(data_json, '$.sortOrder') AS INTEGER), 0);

-- Index for faster sorting
CREATE INDEX IF NOT EXISTS idx_quotes_sort_order ON quotes(sort_order);

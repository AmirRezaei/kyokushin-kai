-- file: src/worker/migrations/0028_add_sort_order_column.sql
ALTER TABLE mottos ADD COLUMN sort_order INTEGER;

-- Migrate existing data from JSON to the new column
UPDATE mottos SET sort_order = CAST(json_extract(data_json, '$.sortOrder') AS INTEGER);

-- Index for faster sorting
CREATE INDEX IF NOT EXISTS idx_mottos_sort_order ON mottos(sort_order);

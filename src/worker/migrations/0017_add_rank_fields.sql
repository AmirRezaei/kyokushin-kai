-- file: src/worker/migrations/0017_add_rank_fields.sql
ALTER TABLE techniques ADD COLUMN rank INTEGER;
ALTER TABLE grades ADD COLUMN rank INTEGER;
ALTER TABLE katas ADD COLUMN rank INTEGER;

UPDATE grades
SET rank = CASE
  WHEN kind = 'Dan' THEN 10 + number
  WHEN kind = 'Kyu' AND number BETWEEN 1 AND 10 THEN 11 - number
  ELSE 0
END
WHERE rank IS NULL;

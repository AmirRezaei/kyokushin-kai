-- file: src/worker/migrations/0016_unique_grade_assignments.sql
DELETE FROM grade_techniques
WHERE rowid NOT IN (
  SELECT MIN(rowid)
  FROM grade_techniques
  GROUP BY technique_id
);

DELETE FROM grade_katas
WHERE rowid NOT IN (
  SELECT MIN(rowid)
  FROM grade_katas
  GROUP BY kata_id
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grade_techniques_unique_technique
  ON grade_techniques(technique_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grade_katas_unique_kata
  ON grade_katas(kata_id);

-- file: src/worker/migrations/0015_grades_katas_curriculum.sql
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  grading_system_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  number INTEGER NOT NULL,
  belt_color TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_grades_status ON grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_kind ON grades(kind);
CREATE INDEX IF NOT EXISTS idx_grades_sort_order ON grades(sort_order);

CREATE TABLE IF NOT EXISTS katas (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_katas_status ON katas(status);

CREATE TABLE IF NOT EXISTS grade_techniques (
  grade_id TEXT NOT NULL,
  technique_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (grade_id, technique_id)
);

CREATE INDEX IF NOT EXISTS idx_grade_techniques_grade ON grade_techniques(grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_techniques_technique ON grade_techniques(technique_id);

CREATE TABLE IF NOT EXISTS grade_katas (
  grade_id TEXT NOT NULL,
  kata_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (grade_id, kata_id)
);

CREATE INDEX IF NOT EXISTS idx_grade_katas_grade ON grade_katas(grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_katas_kata ON grade_katas(kata_id);

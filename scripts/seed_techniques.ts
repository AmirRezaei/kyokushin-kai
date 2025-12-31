import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

type TechniqueRecord = {
  id: string;
  kind: string;
  rank?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type GradeRecord = {
  id: string;
  gradingSystemId: string;
  kind: string;
  number: number;
  rank?: number;
  beltColor: string;
  sortOrder: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type KataRecord = {
  id: string;
  rank?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const catalogPath = resolve(__dirname, '../src/data/repo/catalog.json');
const outputPath = resolve(__dirname, './seed_techniques.sql');

const raw = readFileSync(catalogPath, 'utf-8');
const parsed = JSON.parse(raw) as {
  store?: {
    techniques?: Record<string, TechniqueRecord>;
    grades?: Record<string, GradeRecord>;
    katas?: Record<string, KataRecord>;
  };
  curriculum?: Record<string, { techIds?: string[]; kataIds?: string[] }>;
};

const techniques = Object.values(parsed.store?.techniques ?? {});
const grades = Object.values(parsed.store?.grades ?? {});
const katas = Object.values(parsed.store?.katas ?? {});
const curriculum = parsed.curriculum ?? {};
const now = new Date().toISOString();

const escapeSql = (value: string) => value.replace(/'/g, "''");
const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? Number(parsed) : null;
};

const deriveGradeRank = (kind: string, numberValue: number): number => {
  if (!Number.isFinite(numberValue)) return 0;
  if (kind === 'Dan') return numberValue > 0 ? 10 + numberValue : 0;
  if (kind === 'Kyu') {
    if (numberValue >= 1 && numberValue <= 10) return 11 - numberValue;
    return 0;
  }
  return 0;
};

const techniqueStatements = techniques
  .filter((technique) => typeof technique?.id === 'string' && typeof technique?.kind === 'string')
  .map((technique) => {
    const id = escapeSql(technique.id);
    const kind = escapeSql(technique.kind);
    const status = escapeSql(technique.status || 'draft');
    const createdAt = escapeSql(technique.createdAt || now);
    const updatedAt = escapeSql(technique.updatedAt || now);
    const rankValue = parseNumber(technique.rank);
    const dataJson = escapeSql(
      JSON.stringify({
        ...technique,
        ...(rankValue !== null ? { rank: rankValue } : {}),
      }),
    );
    const rankSql = rankValue === null ? 'NULL' : rankValue;

    return `INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('${id}', '${dataJson}', '${kind}', '${status}', ${rankSql}, '${createdAt}', '${updatedAt}', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;`;
  })
  .join('\n\n');

const gradeStatements = grades
  .filter(
    (grade) =>
      typeof grade?.id === 'string' &&
      typeof grade?.gradingSystemId === 'string' &&
      typeof grade?.kind === 'string',
  )
  .map((grade) => {
    const id = escapeSql(grade.id);
    const gradingSystemId = escapeSql(grade.gradingSystemId);
    const kind = escapeSql(grade.kind);
    const status = escapeSql(grade.status || 'draft');
    const beltColor = escapeSql(grade.beltColor || 'white');
    const numberValue = Number.isFinite(grade.number) ? grade.number : 0;
    const rankValue =
      Number.isFinite(grade.rank) ? Number(grade.rank) : deriveGradeRank(grade.kind, numberValue);
    const sortOrder = Number.isFinite(grade.sortOrder) ? grade.sortOrder : 0;
    const createdAt = escapeSql(grade.createdAt || now);
    const updatedAt = escapeSql(grade.updatedAt || now);
    const dataJson = escapeSql(JSON.stringify({ ...grade, rank: rankValue }));

    return `INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('${id}', '${dataJson}', '${gradingSystemId}', '${kind}', ${numberValue}, ${rankValue}, '${beltColor}', ${sortOrder}, '${status}', '${createdAt}', '${updatedAt}', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;`;
  })
  .join('\n\n');

const kataStatements = katas
  .filter((kata) => typeof kata?.id === 'string')
  .map((kata) => {
    const id = escapeSql(kata.id);
    const status = escapeSql(kata.status || 'draft');
    const createdAt = escapeSql(kata.createdAt || now);
    const updatedAt = escapeSql(kata.updatedAt || now);
    const rankValue = parseNumber(kata.rank);
    const dataJson = escapeSql(
      JSON.stringify({
        ...kata,
        ...(rankValue !== null ? { rank: rankValue } : {}),
      }),
    );
    const rankSql = rankValue === null ? 'NULL' : rankValue;

    return `INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('${id}', '${dataJson}', '${status}', ${rankSql}, '${createdAt}', '${updatedAt}', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;`;
  })
  .join('\n\n');

const seenTechniqueIds = new Set<string>();
const seenKataIds = new Set<string>();

const curriculumStatements = Object.entries(curriculum)
  .map(([gradeId, entry]) => {
    const gradeKey = escapeSql(gradeId);
    const techIds = Array.isArray(entry?.techIds) ? entry!.techIds : [];
    const kataIds = Array.isArray(entry?.kataIds) ? entry!.kataIds : [];

    const techniqueInserts = techIds
      .filter((techId) => typeof techId === 'string' && techId.length > 0)
      .filter((techId) => {
        if (seenTechniqueIds.has(techId)) return false;
        seenTechniqueIds.add(techId);
        return true;
      })
      .map(
        (techId) =>
          `INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('${gradeKey}', '${escapeSql(techId)}', '${escapeSql(now)}')
ON CONFLICT(grade_id, technique_id) DO NOTHING;`,
      )
      .join('\n');

    const kataInserts = kataIds
      .filter((kataId) => typeof kataId === 'string' && kataId.length > 0)
      .filter((kataId) => {
        if (seenKataIds.has(kataId)) return false;
        seenKataIds.add(kataId);
        return true;
      })
      .map(
        (kataId) =>
          `INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('${gradeKey}', '${escapeSql(kataId)}', '${escapeSql(now)}')
ON CONFLICT(grade_id, kata_id) DO NOTHING;`,
      )
      .join('\n');

    return [techniqueInserts, kataInserts].filter(Boolean).join('\n');
  })
  .filter(Boolean)
  .join('\n');

const statements = [
  techniqueStatements,
  gradeStatements,
  kataStatements,
  `DELETE FROM grade_techniques;`,
  `DELETE FROM grade_katas;`,
  curriculumStatements,
]
  .filter(Boolean)
  .join('\n\n');

writeFileSync(outputPath, `${statements}\n`);
console.log(
  `Wrote ${techniques.length} techniques, ${grades.length} grades, ${katas.length} katas to ${outputPath}`,
);

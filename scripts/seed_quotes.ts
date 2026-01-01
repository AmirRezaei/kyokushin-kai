import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { quotes } from '../src/react-app/Quote/quoteData';

type QuoteSeedRecord = {
  id: string;
  author: string;
  tags: string[];
  date?: string;
  text: string;
  meaning: string;
  history?: string;
  reference?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const outputPath = resolve(__dirname, './seed_quotes.sql');
const now = new Date().toISOString();

const escapeSql = (value: string) => value.replace(/'/g, "''");

const records: QuoteSeedRecord[] = quotes
  .filter((quote) => quote && typeof quote.id === 'string')
  .map((quote) => ({
    id: quote.id,
    author: quote.author,
    tags: Array.isArray(quote.tags) ? quote.tags : [],
    date: quote.date || undefined,
    text: quote.text,
    meaning: quote.meaning,
    history: quote.history || undefined,
    reference: quote.reference || undefined,
    status: 'published',
    createdAt: now,
    updatedAt: now,
  }));

const statements = records
  .filter((record) => record.author && record.text && record.meaning)
  .map((record) => {
    const id = escapeSql(record.id);
    const author = escapeSql(record.author);
    const status = escapeSql(record.status);
    const createdAt = escapeSql(record.createdAt);
    const updatedAt = escapeSql(record.updatedAt);
    const dataJson = escapeSql(JSON.stringify(record));

    return `INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('${id}', '${dataJson}', '${author}', '${status}', '${createdAt}', '${updatedAt}', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;`;
  })
  .join('\n\n');

writeFileSync(outputPath, `${statements}\n`);
console.log(`Wrote ${records.length} quotes to ${outputPath}`);

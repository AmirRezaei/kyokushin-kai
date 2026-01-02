import fs from 'node:fs';
import path from 'node:path';
import { Database } from 'bun:sqlite';

type D1RunMeta = {
  changes: number;
  last_row_id?: number;
};

type D1RunResult = {
  success: boolean;
  meta: D1RunMeta;
};

type D1AllResult<T> = {
  results: T[];
};

class TestStatement {
  private db: Database;
  private sql: string;
  private params: unknown[];

  constructor(db: Database, sql: string, params: unknown[] = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params: unknown[]) {
    return new TestStatement(this.db, this.sql, params);
  }

  async run(): Promise<D1RunResult> {
    const stmt = this.db.prepare(this.sql);
    const info = stmt.run(...this.params);
    return {
      success: true,
      meta: {
        changes: info.changes ?? 0,
        last_row_id: Number(info.lastInsertRowid ?? 0),
      },
    };
  }

  async all<T = unknown>(): Promise<D1AllResult<T>> {
    const stmt = this.db.prepare(this.sql);
    const rows = stmt.all(...this.params) as T[];
    return { results: rows };
  }

  async first<T = unknown>(): Promise<T | null> {
    const stmt = this.db.prepare(this.sql);
    const row = stmt.get(...this.params) as T | undefined;
    return row ?? null;
  }
}

export class TestD1Database {
  private db: Database;

  constructor() {
    this.db = new Database(':memory:');
  }

  prepare(sql: string) {
    return new TestStatement(this.db, sql);
  }

  exec(sql: string) {
    this.db.exec(sql);
  }

  async batch(statements: Array<{ run: () => Promise<D1RunResult> }>) {
    this.db.exec('BEGIN');
    try {
      for (const statement of statements) {
        await statement.run();
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  close() {
    this.db.close();
  }
}

export function applyMigrations(db: TestD1Database) {
  const migrationsDir = path.resolve(process.cwd(), 'src/worker/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    if (!sql.trim()) {
      continue;
    }
    db.exec(sql);
  }
}

export function createTestDb() {
  const db = new TestD1Database();
  applyMigrations(db);
  return db;
}

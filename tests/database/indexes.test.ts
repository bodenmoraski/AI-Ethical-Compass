/**
 * Database Indexes Test
 *
 * Verifies that performance-critical indexes are declared in migration SQL.
 * These assertions are environment-free on purpose: the previous version of this
 * suite needed live Supabase credentials and asserted `expect(true).toBe(true)`,
 * so it could never fail for a missing index.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

function migrationSql(): string {
  const roots = [
    path.join(process.cwd(), 'server/migrations'),
    path.join(process.cwd(), 'scripts/sql'),
  ];

  return roots
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) =>
      fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.sql'))
        .map((file) => fs.readFileSync(path.join(dir, file), 'utf-8'))
    )
    .join('\n')
    .toLowerCase();
}

const sql = migrationSql();

/** Matches `CREATE INDEX ... ON table(col` and `ON table (col` plus composite indexes. */
function hasIndexOn(table: string, column: string): boolean {
  const pattern = new RegExp(
    `create\\s+index[^;]*?on\\s+(?:public\\.)?${table}\\s*\\(([^)]*)\\)`,
    'gi'
  );

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sql)) !== null) {
    const columns = match[1].split(',').map((c) => c.trim().split(/\s+/)[0]);
    if (columns.includes(column)) return true;
  }
  return false;
}

describe('Database Indexes Verification', () => {
  describe('Performance-critical indexes are declared in migrations', () => {
    const required: Array<[string, string]> = [
      ['assignments', 'is_published'],
      ['assignment_submissions', 'status'],
      ['class_enrollments', 'status'],
      ['notifications', 'is_read'],
      ['notifications', 'recipient_id'],
    ];

    it.each(required)('has an index on %s.%s', (table, column) => {
      expect(hasIndexOn(table, column)).toBe(true);
    });
  });

  describe('Index helper correctness', () => {
    it('finds migration SQL to inspect', () => {
      expect(sql.length).toBeGreaterThan(0);
      expect(sql).toContain('create index');
    });

    it('does not report an index that was never declared', () => {
      expect(hasIndexOn('assignments', 'definitely_not_a_column')).toBe(false);
      expect(hasIndexOn('not_a_table', 'status')).toBe(false);
    });
  });
});

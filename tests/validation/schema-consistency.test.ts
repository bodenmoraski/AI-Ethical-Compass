/**
 * Deep validation — schema consistency between migrations and what APIs write.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

function walkSql(): string {
  const dirs = [
    path.join(root, 'server/migrations'),
    path.join(root, 'scripts/sql'),
  ];
  let out = '';
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.sql')) {
        out += `\n${fs.readFileSync(path.join(dir, file), 'utf8')}`;
      }
    }
  }
  return out;
}

describe('schema consistency — columns written by APIs exist in migrations', () => {
  const sql = walkSql();

  const requiredColumns: Array<{ table: string; column: string; why: string }> = [
    { table: 'assignment_submissions', column: 'rubric_scores', why: 'rubric grading persists breakdown' },
    { table: 'assignment_submissions', column: 'is_late', why: 'late policy marks submissions' },
    { table: 'assignment_submissions', column: 'final_score', why: 'grading stores final score' },
    { table: 'assignments', column: 'rubric', why: 'rubric authoring' },
    { table: 'assignments', column: 'allow_late_submissions', why: 'late policy toggle' },
    { table: 'assignments', column: 'late_penalty_per_day', why: 'late penalty config' },
    { table: 'notifications', column: 'recipient_id', why: 'notification targeting' },
    { table: 'notifications', column: 'is_read', why: 'unread badge' },
    { table: 'moderation_queue', column: 'status', why: 'moderation workflow' },
    { table: 'users', column: 'role', why: 'RBAC' },
  ];

  it.each(requiredColumns)('$table.$column exists ($why)', ({ table, column }) => {
    // Either CREATE TABLE ... column, or ALTER TABLE ... ADD COLUMN column
    const createOrAlter = new RegExp(
      `(CREATE TABLE[^;]*${table}[\\s\\S]{0,4000}?\\b${column}\\b)|` +
        `(ALTER TABLE\\s+${table}[\\s\\S]{0,200}?ADD COLUMN[^;]*\\b${column}\\b)`,
      'i'
    );
    expect(sql).toMatch(createOrAlter);
  });
});

describe('schema consistency — user_progress vs user_scenario_progress naming', () => {
  it('documents which progress table the live API uses', () => {
    const progressApi = read('api/user-progress.ts');
    // The live path writes to user_progress (integer user id). The older
    // user_scenario_progress table is a separate/legacy shape.
    expect(progressApi).toContain("from('user_progress')");
  });

  it('flags the dual progress-table situation so it cannot be forgotten', () => {
    const sql = walkSql();
    const hasLegacy = /user_scenario_progress/.test(sql);
    const hasLive = /user_progress/.test(sql) || read('api/user-progress.ts').includes('user_progress');
    // Record the dual-table situation; both may exist, but the live API must
    // only write one. This assertion documents the risk for operators.
    expect(hasLive).toBe(true);
    if (hasLegacy) {
      expect(read('docs/VALIDATION_LOG.md') + read('docs/FEATURES.md') + read('docs/COMPLETION_PLAN.md'))
        .toMatch(/user_progress|progress table|scenario_progress/i);
    }
  });
});

describe('schema consistency — migration 016 is the rubric/late/index pack', () => {
  it('ships rubric_scores + hot indexes together', () => {
    const mig = read('server/migrations/016_add_rubric_scores.sql');
    expect(mig).toContain('rubric_scores');
    expect(mig).toContain('idx_submissions_assignment_status');
    expect(mig).toContain('idx_moderation_queue_status');
  });
});

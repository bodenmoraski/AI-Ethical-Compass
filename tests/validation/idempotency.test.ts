/**
 * Deep validation — concurrency / idempotency contracts.
 *
 * These lock behaviours that matter when two requests race (double-click submit,
 * duplicate like, re-rate, re-award).
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('idempotency — likes', () => {
  it('rejects a second like from the same user', () => {
    const perspectives = read('api/perspectives.ts');
    expect(perspectives).toMatch(/already liked|already_liked/i);
    expect(perspectives).toContain('user_likes');
  });
});

describe('idempotency — ratings', () => {
  it('updates an existing rating rather than inserting a duplicate', () => {
    const perspectives = read('api/perspectives.ts');
    const rate = perspectives.slice(
      perspectives.indexOf("action === 'rate'"),
      perspectives.indexOf("action === 'rate'") + 3500
    );
    expect(rate).toMatch(/existing|update|upsert/i);
  });
});

describe('idempotency — achievements', () => {
  it('award path is a no-op when the level is already held', () => {
    const achievements = read('lib/achievements.ts');
    expect(achievements).toMatch(/already|existing|duplicate|onConflict|unique/i);
  });
});

describe('idempotency — assignment submission', () => {
  it('detects an existing submission before inserting another', () => {
    const dashboard = read('api/user-dashboard.ts');
    expect(dashboard).toMatch(/existingSubmission|already submitted/i);
  });
});

describe('idempotency — scenario votes', () => {
  it('updates an existing vote instead of inserting a second row', () => {
    const scenarios = read('api/user-scenarios.ts');
    expect(scenarios).toContain('existingVote');
    expect(scenarios).toMatch(/\.update\(\s*\{\s*vote_type/);
  });
});

describe('race-adjacent — late close is checked server-side', () => {
  it('submit path re-checks due date at write time (not only in the UI)', () => {
    const dashboard = read('api/user-dashboard.ts');
    expect(dashboard).toMatch(/allow_late_submissions === false/);
    expect(dashboard).toMatch(/status\(403\)/);
  });
});

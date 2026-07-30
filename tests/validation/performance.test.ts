/**
 * Deep validation — performance micro-checks that catch quadratic patterns
 * before they show up in a 200-student class.
 */
import { describe, it, expect } from '@jest/globals';
import { applyLatePenalty } from '../../lib/late-policy';
import { scoreRubric } from '../../lib/rubric-scoring';
import fs from 'fs';
import path from 'path';

const root = process.cwd();

describe('performance — class analytics stays linear', () => {
  it('builds the engagement trend with a Map, not filter-per-day', () => {
    const teacher = fs.readFileSync(path.join(root, 'api/teacher.ts'), 'utf8');
    const analytics = teacher.slice(
      teacher.indexOf('handleClassAnalytics'),
      teacher.indexOf('handleClassAnalytics') + 8000
    );
    expect(analytics).toContain('countsByDay');
    expect(analytics).toContain('submittedByAssignment');
    // The old O(days × submissions) pattern.
    expect(analytics).not.toMatch(
      /submissions\.filter\(\(s\) => s\.submitted_at\?\.startsWith\(key\)\)/
    );
  });
});

describe('performance — pure scoring stays fast under load', () => {
  it('scores 10_000 late penalties in under 200ms', () => {
    const assignment = {
      due_date: '2026-01-10T00:00:00.000Z',
      points_possible: 100,
      late_penalty_per_day: 5,
    };
    const start = Date.now();
    for (let i = 0; i < 10_000; i++) {
      applyLatePenalty(
        {
          is_late: true,
          submitted_at: new Date(Date.parse(assignment.due_date) + (i % 14) * 86400000).toISOString(),
        },
        assignment,
        80 + (i % 20)
      );
    }
    expect(Date.now() - start).toBeLessThan(200);
  });

  it('scores 5_000 rubrics in under 200ms', () => {
    const rubric = {
      criteria: Array.from({ length: 8 }, (_, i) => ({
        id: `c${i}`,
        name: `Criterion ${i}`,
        maxPoints: 10 + i,
      })),
    };
    const awards = Object.fromEntries(rubric.criteria.map((c) => [c.id, 5]));
    const start = Date.now();
    for (let i = 0; i < 5_000; i++) {
      scoreRubric(rubric, awards, 100);
    }
    expect(Date.now() - start).toBeLessThan(200);
  });
});

describe('performance — publish fan-out is concurrent, not serial awaits', () => {
  it('announcePublishedAssignment uses Promise.all', () => {
    const teacher = fs.readFileSync(path.join(root, 'api/teacher.ts'), 'utf8');
    const announce = teacher.slice(
      teacher.indexOf('announcePublishedAssignment'),
      teacher.indexOf('announcePublishedAssignment') + 2500
    );
    expect(announce).toContain('Promise.all');
    // Still a known scale risk: one DB write per student. Documented in VALIDATION_LOG.
    expect(announce).toContain('notifyStudentOfNewAssignment');
  });
});

/**
 * Phase 7 acceptance tests — schema/doc debt: build or demote.
 *
 * These are source-level checks. They exist to stop a feature from looking
 * finished (a switch in the UI, a table in the schema, a bullet in the docs)
 * when nothing behind it runs.
 */
import fs from 'fs';
import path from 'path';
import { applyLatePenalty } from '../../lib/late-policy';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('G7.1 — late policy is applied', () => {
  const submitApi = read('api/user-dashboard.ts');
  const gradeApi = read('api/teacher.ts');
  const form = read('client/src/components/teacher/AssignmentManager.tsx');

  it('exposes late settings on the assignment form', () => {
    expect(form).toContain('allow_late_submissions');
    expect(form).toContain('late_penalty_per_day');
    expect(form).toContain('LatePolicyFields');
  });

  it('marks a submission late from the due date', () => {
    expect(submitApi).toMatch(/const isLate = assignment\.due_date/);
    expect(submitApi).toContain('is_late: isLate');
  });

  it('rejects submissions when late work is disallowed', () => {
    expect(submitApi).toMatch(
      /if \(isLate && assignment\.allow_late_submissions === false\)[\s\S]{0,200}status\(403\)/
    );
  });

  it('applies the penalty to the stored final score', () => {
    expect(gradeApi).toContain("from '../lib/late-policy.js'");
    expect(gradeApi).toContain('applyLatePenalty(submission, assignment, finalScore)');
    expect(gradeApi).toContain('final_score: scoreAfterPenalty');
  });

  describe('penalty maths', () => {
    const assignment = {
      due_date: '2026-01-10T00:00:00.000Z',
      points_possible: 100,
      late_penalty_per_day: 10,
    };

    it('leaves on-time work untouched', () => {
      const result = applyLatePenalty(
        { is_late: false, submitted_at: '2026-01-09T00:00:00.000Z' },
        assignment,
        90
      );
      expect(result).toEqual({ score: 90, applied: false, daysLate: 0, deducted: 0 });
    });

    it('counts a partial day as a full day late', () => {
      const result = applyLatePenalty(
        { is_late: true, submitted_at: '2026-01-10T06:00:00.000Z' },
        assignment,
        90
      );
      expect(result.daysLate).toBe(1);
      expect(result.score).toBe(80);
    });

    it('scales with the number of days late', () => {
      const result = applyLatePenalty(
        { is_late: true, submitted_at: '2026-01-13T00:00:00.000Z' },
        assignment,
        90
      );
      expect(result.daysLate).toBe(3);
      expect(result.score).toBe(60);
    });

    it('never drops below zero', () => {
      const result = applyLatePenalty(
        { is_late: true, submitted_at: '2026-03-10T00:00:00.000Z' },
        assignment,
        20
      );
      expect(result.score).toBe(0);
      expect(result.deducted).toBe(20);
    });

    it('is a no-op when no penalty is configured', () => {
      const result = applyLatePenalty(
        { is_late: true, submitted_at: '2026-01-20T00:00:00.000Z' },
        { ...assignment, late_penalty_per_day: 0 },
        75
      );
      expect(result.applied).toBe(false);
      expect(result.score).toBe(75);
    });
  });

  it('tells students and teachers what the policy will do', () => {
    const studentView = read('client/src/components/student/StudentAssignmentView.tsx');
    expect(studentView).toContain('lateSubmissionsClosed');
    expect(studentView).toContain('Submissions are closed');
    expect(studentView).toMatch(/Late work loses \$\{latePenaltyPerDay\}%/);

    const gradingForm = read('client/src/components/teacher/SubmissionGradingForm.tsx');
    expect(gradingForm).toContain('submission.is_late');
    expect(gradingForm).toContain('latePenaltyPerDay');
  });
});

describe('G7.2 — assignment types behave differently or are removed', () => {
  const manager = read('client/src/components/teacher/AssignmentManager.tsx');
  const studentPage = read('client/src/pages/StudentAssignments.tsx');
  const studentView = read('client/src/components/student/StudentAssignmentView.tsx');

  it('no longer offers a discussion type with no discussion UI', () => {
    expect(manager).not.toMatch(/discussion/i);
  });

  it('offers exactly the types the student side handles', () => {
    const offered = Array.from(manager.matchAll(/<SelectItem value="(scenario|custom)"/g)).map(
      (m) => m[1]
    );
    expect(new Set(offered)).toEqual(new Set(['scenario', 'custom']));

    // Scenario work happens in the scenario runner; written responses happen inline.
    expect(studentPage).toContain("assignment.assignment_type === 'scenario'");
    expect(studentPage).toContain('?assignment=');
    expect(studentView).toContain('Your Response');
  });

  it('surfaces an error instead of silently ignoring a scenario-less assignment', () => {
    const handler = studentPage.slice(
      studentPage.indexOf('const handleAssignmentSelect'),
      studentPage.indexOf('const handleBackToList')
    );
    expect(handler).toContain('toast(');
    expect(handler).not.toMatch(/console\.error[\s\S]{0,80}return;\s*\}\s*navigate/);
  });
});

describe('G7.3 — unbuilt features demoted in docs', () => {
  const features = read('docs/FEATURES.md');

  const planned = [
    'Gradebook',
    'Parent/guardian',
    'Class groups',
    'CSV roster import',
    'Assignment template',
    'LMS passback',
  ];

  it.each(planned)('%s is marked Planned', (label) => {
    const line = features
      .split('\n')
      .find((l) => l.toLowerCase().includes(label.toLowerCase()) && l.includes('Planned'));
    expect(line).toBeDefined();
  });

  it('has a dedicated planned/not implemented section for schema-only tables', () => {
    expect(features).toContain('#### Planned / not implemented');
    expect(features).toMatch(/no product surface/i);
  });

  it('does not describe schema-only tables as shipped capability', () => {
    const plannedSection = features.slice(
      features.indexOf('#### Planned / not implemented'),
      features.indexOf('#### Shipped platform services')
    );
    expect(plannedSection).toContain('discussion_threads');
    expect(plannedSection).toContain('gradebook_entries');
    expect(plannedSection).toContain('class_groups');
  });

  it('does not promise email or push notification delivery', () => {
    expect(features).toMatch(/notifications are in-app only|No provider wired/i);
  });
});

describe('G7.4 — dead pages removed or routed', () => {
  const app = read('client/src/App.tsx');
  const pagesDir = path.join(root, 'client/src/pages');

  const pages = fs
    .readdirSync(pagesDir)
    .filter((f) => /\.tsx$/.test(f) && !f.includes('.test.'))
    .map((f) => f.replace(/\.tsx$/, ''));

  it.each(pages)('%s is reachable from the router', (page) => {
    expect(app).toContain(`@/pages/${page}`);
  });

  it('has no leftover duplicate pages', () => {
    for (const gone of ['Instructions', 'TermsOfService', 'not-found']) {
      expect(fs.existsSync(path.join(pagesDir, `${gone}.tsx`))).toBe(false);
    }
  });
});

/**
 * Phase 3 acceptance tests — grading that actually grades.
 *
 * Before this phase: api/assignment-communication.ts compared Supabase auth UUIDs to
 * integer user ids (so every authorization check silently failed) and wrote to three
 * tables that had no migration; the rubric column existed but nothing could author or
 * apply a rubric.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import { isRubric, scoreRubric, totalPossible } from '../../lib/rubric-scoring';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf-8');
const exists = (relativePath: string) => fs.existsSync(path.join(root, relativePath));

const migrationSql = fs
  .readdirSync(path.join(root, 'server/migrations'))
  .filter((file) => file.endsWith('.sql'))
  .map((file) => fs.readFileSync(path.join(root, 'server/migrations', file), 'utf-8'))
  .join('\n');

describe('Phase 3 — grading', () => {
  describe('G3.1 broken identity surface is gone', () => {
    it('removes the API that compared auth UUIDs to integer ids', () => {
      expect(exists('api/assignment-communication.ts')).toBe(false);
    });

    it('removes its orphaned client', () => {
      expect(exists('client/src/components/teacher/EnhancedFeedbackForm.tsx')).toBe(false);
    });

    it('leaves no references behind', () => {
      const clientFiles: string[] = [];
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (/\.(ts|tsx)$/.test(entry.name)) clientFiles.push(full);
        }
      };
      walk(path.join(root, 'client/src'));

      const offenders = clientFiles.filter((file) =>
        fs.readFileSync(file, 'utf-8').includes('assignment-communication')
      );
      expect(offenders).toEqual([]);
    });

    it('grading compares integer identities', () => {
      const teacher = read('api/teacher.ts');
      expect(teacher).toContain('classData.teacher_id !== userId');
    });
  });

  describe('G3.2 every table the API writes has a migration', () => {
    it('has no writes to tables without migrations', () => {
      ['assignment_messages', 'assignment_clarifications', 'assignment_feedback'].forEach((table) => {
        const apiFiles = fs
          .readdirSync(path.join(root, 'api'))
          .filter((file) => file.endsWith('.ts'))
          .map((file) => read(`api/${file}`));
        const referenced = apiFiles.some((source) => source.includes(`'${table}'`));
        expect(referenced).toBe(false);
      });
    });

    it('adds a column for per-criterion scores', () => {
      expect(migrationSql).toContain('rubric_scores');
      expect(migrationSql).toMatch(/ALTER TABLE\s+assignment_submissions/i);
    });

    it('keeps the rubric column the API reads', () => {
      expect(migrationSql).toContain('rubric JSONB');
    });
  });

  describe('G3.3 rubrics can be authored', () => {
    const manager = read('client/src/components/teacher/AssignmentManager.tsx');

    it('embeds a working rubric editor', () => {
      expect(exists('client/src/components/teacher/RubricEditor.tsx')).toBe(true);
      expect(manager).toContain("import RubricEditor, { Rubric } from './RubricEditor'");
    });

    it('renders the editor in both the create and edit dialogs', () => {
      const occurrences = manager.match(/<RubricEditor/g) || [];
      expect(occurrences.length).toBe(2);
    });

    it('sends the rubric with the assignment payload', () => {
      expect(manager).toContain('rubric: null as Rubric | null');
      expect(manager).toContain('rubric: assignment.rubric ?? null');
    });

    it('accepts a null rubric server-side so it can be cleared', () => {
      expect(read('api/teacher.ts')).toContain('rubric: z.record(z.any()).nullable().optional()');
    });

    it('drops the orphaned rubric component with broken imports', () => {
      expect(exists('client/src/components/teacher/GradingRubric.tsx')).toBe(false);
    });
  });

  describe('G3.4 grading consumes the rubric', () => {
    const form = read('client/src/components/teacher/SubmissionGradingForm.tsx');

    it('renders criteria when the assignment has a rubric', () => {
      expect(form).toContain('rubric.criteria.map');
      expect(form).toContain('isRubric(rubric)');
    });

    it('submits per-criterion scores', () => {
      expect(form).toContain('rubricScores: criterionScores');
    });

    it('shares the scoring implementation with the server', () => {
      expect(form).toContain("from '../../../../lib/rubric-scoring'");
      expect(read('api/teacher.ts')).toContain("from '../lib/rubric-scoring.js'");
    });

    it('threads the rubric from the page to the form', () => {
      expect(read('client/src/pages/AssignmentGrading.tsx')).toContain('rubric={assignment.rubric ?? null}');
      expect(read('client/src/components/teacher/AssignmentGradingView.tsx')).toContain('rubric={rubric}');
    });

    it('persists the breakdown, not just the total', () => {
      const teacher = read('api/teacher.ts');
      expect(teacher).toContain('rubric_scores: rubricResult ? rubricResult.perCriterion : null');
    });

    it('server recomputes the score instead of trusting the client total', () => {
      const teacher = read('api/teacher.ts');
      const start = teacher.indexOf("if (req.query.action === 'grade-submission')");
      const body = teacher.slice(start, start + 3000);
      expect(body).toContain('scoreRubric(assignment.rubric, rubricScores, assignment.points_possible)');
      expect(body).toContain('finalScore = rubricResult.points');
    });
  });

  describe('rubric scoring behaviour', () => {
    const rubric = {
      criteria: [
        { id: 'a', name: 'Reasoning', maxPoints: 40 },
        { id: 'b', name: 'Evidence', maxPoints: 60 },
      ],
    };

    it('sums awards and scales to the assignment total', () => {
      const result = scoreRubric(rubric, { a: 40, b: 30 }, 50);
      expect(result.earned).toBe(70);
      expect(result.possible).toBe(100);
      expect(result.percentage).toBe(70);
      expect(result.points).toBe(35);
    });

    it('defaults the scale to the rubric total when no points are given', () => {
      const result = scoreRubric(rubric, { a: 40, b: 60 });
      expect(result.points).toBe(100);
    });

    it('exposes a per-criterion breakdown for storage', () => {
      const result = scoreRubric(rubric, { a: 10, b: 20 }, 100);
      expect(result.perCriterion).toEqual([
        { id: 'a', name: 'Reasoning', awarded: 10, maxPoints: 40 },
        { id: 'b', name: 'Evidence', awarded: 20, maxPoints: 60 },
      ]);
    });

    it('reports the total possible points', () => {
      expect(totalPossible(rubric)).toBe(100);
    });

    it('rejects malformed rubrics so grading falls back to a single score', () => {
      expect(isRubric({ criteria: [{ name: 'no id', maxPoints: 5 }] })).toBe(false);
      expect(isRubric({ criteria: [{ id: 'a', name: 'x', maxPoints: 'ten' }] })).toBe(false);
      expect(isRubric(undefined)).toBe(false);
    });
  });

  describe('G3.5 grading notifies the student', () => {
    it('creates a notification row on grade', () => {
      const teacher = read('api/teacher.ts');
      const start = teacher.indexOf("if (req.query.action === 'grade-submission')");
      const body = teacher.slice(start, start + 3500);
      expect(body).toContain('await notifyStudentOfGrade(');
    });
  });
});

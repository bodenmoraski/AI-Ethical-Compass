/**
 * Phase 2 acceptance tests — real classroom events and class-scoped authorization.
 *
 * Before this phase the live monitor only ever showed activity created by its own
 * "Test Activity" button, and any authenticated user could read any class's feed.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8');

describe('Phase 2 — realtime producers and authorization', () => {
  describe('G2.1 real product events reach the activity feed', () => {
    it('exposes a shared best-effort recorder', () => {
      const feed = read('lib/activity-feed.ts');
      expect(feed).toContain('export async function recordActivity');
      expect(feed).toContain("from('realtime_activities')");
      // Failures must be swallowed so the triggering action still succeeds.
      expect(feed).toContain('catch');
      expect(feed).toContain('return false');
    });

    it('records enrollment', () => {
      const student = read('api/student.ts');
      expect(student).toContain("import { recordActivity } from '../lib/activity-feed.js'");
      expect(student).toContain('Student joined the class');
    });

    it('records assignment submission', () => {
      const dashboard = read('api/user-dashboard.ts');
      expect(dashboard).toContain("import { recordActivity } from '../lib/activity-feed.js'");
      expect(dashboard).toContain("type: 'submission'");
      expect(dashboard).toContain('Assignment submitted');
    });

    it('records grading', () => {
      const teacher = read('api/teacher.ts');
      expect(teacher).toContain('Submission graded');
    });

    it('records assignment publication', () => {
      const teacher = read('api/teacher.ts');
      expect(teacher).toContain('const announcePublishedAssignment');
      expect(teacher).toContain('Assignment published');
    });

    it('only announces on the draft to published transition', () => {
      const teacher = read('api/teacher.ts');
      expect(teacher).toContain('!assignment.is_published && updatedAssignment.is_published');
    });
  });

  describe('G2.2 classroom telemetry is class-scoped', () => {
    const api = read('api/realtime-classroom.ts');

    it('resolves the app user rather than trusting a raw token subject', () => {
      expect(api).toContain('requireAppUser');
      expect(api).not.toContain('return user.id; // Return the actual user ID');
    });

    it('checks class membership before any read', () => {
      expect(api).toContain('async function classAccess');
      expect(api).toContain("eq('student_id', user.id)");
      expect(api).toContain('Not a member of this class');
    });

    it('restricts the whole-class views to the class teacher or an admin', () => {
      expect(api).toContain('async function requireTeacherAccess');
      expect(api).toContain('Teacher access required for this class');

      ['handleLiveStats', 'handleRealTimeActivity', 'handleStudentEngagement'].forEach((handler) => {
        const start = api.indexOf(`const ${handler}`);
        expect(start).toBeGreaterThan(-1);
        const body = api.slice(start, start + 2500);
        expect(body).toContain('requireTeacherAccess(user, classId)');
      });
    });

    it('forces activity authorship to the caller', () => {
      expect(api).toContain('user_id: String(user.id)');
      // The client can no longer submit a user_id at all.
      expect(api).not.toMatch(/user_id:\s*z\.string\(\)/);
    });

    it('stops a student reporting engagement for someone else', () => {
      expect(api).toContain("access === 'teacher' ? validatedData.student_id ?? user.id : user.id");
    });

    it('returns 401/403 instead of a blanket 500', () => {
      expect(api).toContain('authErrorStatus');
      expect(api).not.toMatch(/return res\.status\(500\)\.json\(\{\s*success: false,\s*error: error instanceof Error \? error\.message : 'Internal server error'\s*\}\);\s*\}\s*$/);
    });

    it('rejects malformed bodies with 400 rather than 500', () => {
      expect(api).toContain('z.ZodError');
      expect(api).toContain("error: 'Invalid request body'");
    });
  });

  describe('G2.3 grading notifies the student', () => {
    const teacher = read('api/teacher.ts');

    it('sends a grade notification', () => {
      expect(teacher).toContain('notifyStudentOfGrade');
      const start = teacher.indexOf("if (req.query.action === 'grade-submission')");
      const body = teacher.slice(start, start + 3500);
      expect(body).toContain('notifyStudentOfGrade(');
      expect(body).toContain('submission.student_id');
    });

    it('notifies enrolled students when an assignment is published', () => {
      const start = teacher.indexOf('const announcePublishedAssignment');
      const body = teacher.slice(start, start + 1800);
      expect(body).toContain('notifyStudentOfNewAssignment');
      expect(body).toContain("eq('status', 'active')");
    });
  });
});

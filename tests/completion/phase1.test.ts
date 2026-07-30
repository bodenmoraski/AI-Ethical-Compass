/**
 * Phase 1 acceptance tests — classroom trust loop.
 *
 * Pre-change failures these lock in: AssignmentAnalytics was never rendered,
 * leave-class had no UI, teacher tabs always acted on classes[0], and the class
 * analytics tab drew a hardcoded "Engagement Chart Placeholder".
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8');

describe('Phase 1 — classroom trust loop', () => {
  describe('G1.1 assignment analytics is mounted and authorized', () => {
    const manager = read('client/src/components/teacher/AssignmentManager.tsx');

    it('imports the analytics component', () => {
      expect(manager).toContain("import AssignmentAnalytics from './AssignmentAnalytics'");
    });

    it('renders analytics for a chosen assignment', () => {
      expect(manager).toContain('<AssignmentAnalytics assignmentId={String(analyticsAssignment.id)} />');
      expect(manager).toContain('setAnalyticsAssignment(assignment)');
    });

    it('sends the auth token when fetching analytics', () => {
      const analytics = read('client/src/components/teacher/AssignmentAnalytics.tsx');
      expect(analytics).toContain('action=assignment-analytics');
      expect(analytics).toContain('Authorization');
    });

    it('API verifies the teacher owns the assignment class', () => {
      const api = read('api/teacher.ts');
      const handler = api.slice(
        api.indexOf('const handleAssignmentAnalytics'),
        api.indexOf('const handleAssignmentAnalytics') + 1600
      );
      expect(handler).toContain('teacher_id !== userId');
      expect(handler).toContain('Access denied');
    });
  });

  describe('G1.2 students can leave a class', () => {
    const list = read('client/src/components/student/StudentClassList.tsx');

    it('calls the leave-class action', () => {
      expect(list).toContain("'/api/student?action=leave-class'");
    });

    it('authenticates the request', () => {
      const start = list.indexOf('const handleLeaveClass');
      expect(start).toBeGreaterThan(-1);
      const handler = list.slice(start, start + 1800);
      expect(handler).toContain('Authorization');
      expect(handler).toContain('class_id: classItem.id');
    });

    it('confirms before leaving and refreshes afterwards', () => {
      expect(list).toContain('window.confirm');
      const start = list.indexOf('const handleLeaveClass');
      const handler = list.slice(start, start + 1800);
      expect(handler).toContain('fetchClasses()');
    });

    it('exposes a leave control on the class card', () => {
      expect(list).toContain('Leave Class');
      expect(list).toContain('onLeave(classItem)');
    });
  });

  describe('G1.3 teacher dashboard is multi-class aware', () => {
    const dashboard = read('client/src/pages/TeacherDashboard.tsx');

    it('never passes classes[0] as the active classId', () => {
      expect(dashboard).not.toMatch(/classId=\{classes\[0\]/);
    });

    it('tracks a selected class in state', () => {
      expect(dashboard).toContain('const [selectedClassId, setSelectedClassId]');
      expect(dashboard).toContain('setSelectedClassId(Number(value))');
    });

    it('passes the active class to the monitor and assignment manager', () => {
      expect(dashboard).toContain('classId={activeClass.id}');
      const monitorAndManager = dashboard.match(/classId=\{activeClass\.id\}/g) || [];
      expect(monitorAndManager.length).toBeGreaterThanOrEqual(2);
    });

    it('keeps the selection valid when the class list changes', () => {
      expect(dashboard).toContain('list.some((cls) => cls.id === current)');
    });

    it('replaces the no-op "Switch Class" button with a selector', () => {
      expect(dashboard).not.toContain('Switch Class');
      expect(dashboard).toContain('classSelector');
    });
  });

  describe('G1.4 class analytics uses real data', () => {
    const detail = read('client/src/components/teacher/ClassDetailView.tsx');
    const api = read('api/teacher.ts');

    it('has no placeholder chart', () => {
      expect(detail).not.toContain('Placeholder');
    });

    it('calls the dedicated analytics endpoint', () => {
      expect(detail).toContain('action=class-analytics');
      expect(api).toContain("case 'class-analytics'");
      expect(api).toContain('const handleClassAnalytics');
    });

    it('checks class ownership before returning analytics', () => {
      const handler = api.slice(
        api.indexOf('const handleClassAnalytics'),
        api.indexOf('const handleClassAnalytics') + 1200
      );
      expect(handler).toContain('classRow.teacher_id !== userId');
      expect(handler).toContain('Access denied');
    });

    it('returns per-assignment completion and a submission trend', () => {
      const handler = api.slice(
        api.indexOf('const handleClassAnalytics'),
        api.indexOf('// Main handler')
      );
      expect(handler).toContain('by_assignment');
      expect(handler).toContain('engagement_trends');
      expect(handler).toContain('completion_rate');
    });

    it('renders assignment titles rather than bare ids', () => {
      expect(detail).toContain('item.title');
      expect(detail).toContain('No assignments yet');
    });

    it('shows an explicit empty state instead of a fake chart', () => {
      const chart = read('client/src/components/teacher/SubmissionTrendChart.tsx');
      expect(chart).toContain('No submissions in the last 30 days');
      expect(chart).not.toContain('Placeholder');
    });
  });
});

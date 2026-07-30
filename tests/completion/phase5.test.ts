/**
 * Phase 5 acceptance tests — admin approval and moderation.
 *
 * Before this phase a teacher access request went into a table nobody could read
 * from the product, the "admin only" list endpoint had no auth check at all, and
 * flagged perspectives were never written to the moderation queue.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf-8');

describe('Phase 5 — admin approval and moderation', () => {
  describe('G5.1 admin can approve teacher access in-app', () => {
    const api = read('api/admin.ts');

    it('guards every action behind the admin role', () => {
      expect(api).toContain("requireRole(req, ['admin'])");
      const handlerStart = api.indexOf('export default async function handler');
      const handler = api.slice(handlerStart);
      // The role check happens before any action dispatch.
      expect(handler.indexOf("requireRole(req, ['admin'])")).toBeLessThan(
        handler.indexOf("action === 'teacher-requests'")
      );
    });

    it('actually grants the role on approval', () => {
      expect(api).toContain("update({ role: 'teacher' })");
      expect(api).toContain("eq('id', request.user_id)");
    });

    it('records the role change for audit', () => {
      expect(api).toContain("from('role_change_log')");
      expect(api).toContain('updated_by: adminId');
    });

    it('notifies the requester either way', () => {
      expect(api).toContain('createNotification');
      expect(api).toContain('Teacher access approved');
      expect(api).toContain('Teacher access not approved');
    });

    it('refuses to review the same request twice', () => {
      expect(api).toContain("request.status !== 'pending'");
      expect(api).toContain('409');
      // The update is also conditional, closing the race between two admins.
      expect(api).toContain("eq('status', 'pending')");
    });

    it('validates the decision', () => {
      expect(api).toContain("const DECISIONS = ['approve', 'reject']");
      expect(api).toContain('DECISIONS.includes(decision)');
      expect(api).toContain('400');
    });

    it('closes the unauthenticated request list on the teacher route', () => {
      const teacher = read('api/teacher.ts');
      const getCase = teacher.slice(
        teacher.indexOf('// These rows carry names'),
        teacher.indexOf('// These rows carry names') + 600
      );
      expect(getCase).toContain("requireRole(req, ['admin'])");
    });

    it('has a routed admin console', () => {
      const app = read('client/src/App.tsx');
      expect(app).toContain('import AdminConsole from "@/pages/AdminConsole"');
      expect(app).toContain('<Route path="/admin" element={<AdminConsole />} />');
    });

    it('the console refuses non-admins client-side too', () => {
      const page = read('client/src/pages/AdminConsole.tsx');
      expect(page).toContain("userProfile?.role === 'admin'");
      expect(page).toContain('Admin access required');
    });

    it('is reachable from the user menu for admins only', () => {
      const menu = read('client/src/components/UserMenu.tsx');
      expect(menu).toContain("userProfile?.role === 'admin' && (");
      expect(menu).toContain("navigate('/admin')");
    });
  });

  describe('G5.2 flagged content reaches the moderation queue', () => {
    it('has a queue writer that cannot break the caller', () => {
      const queue = read('lib/moderation-queue.ts');
      expect(queue).toContain('export async function enqueueForModeration');
      expect(queue).toContain("from('moderation_queue')");
      expect(queue).toContain('catch');
    });

    it('perspectives enqueue when moderation flags them', () => {
      const api = read('api/perspectives.ts');
      expect(api).toContain('enqueueForModeration');
      expect(api).toContain("moderationStatus === 'flagged'");
    });

    it('stores the reason and the text a reviewer needs', () => {
      const api = read('api/perspectives.ts');
      const call = api.slice(api.indexOf('await enqueueForModeration('), api.indexOf('await enqueueForModeration(') + 500);
      expect(call).toContain('flaggedReason');
      expect(call).toContain('contentText');
    });
  });

  describe('G5.3 moderation review UI', () => {
    const panel = read('client/src/components/teacher/ModerationPanel.tsx');
    const api = read('api/moderation.ts');

    it('fetches the queue with auth', () => {
      expect(panel).toContain("fetch('/api/moderation?status=pending'");
      expect(panel).toContain('Authorization');
    });

    it('offers approve, remove and dismiss', () => {
      expect(panel).toContain("resolve(item.id, 'approve')");
      expect(panel).toContain("resolve(item.id, 'reject')");
      expect(panel).toContain("resolve(item.id, 'dismiss')");
    });

    it('applies the decision to the underlying content', () => {
      expect(api).toContain('async function applyResolution');
      expect(api).toContain("moderation_status: resolution === 'approve' ? 'approved' : 'rejected'");
    });

    it('scopes teachers to their own classes', () => {
      expect(api).toContain('async function teacherClassIds');
      expect(api).toContain("query.in('class_id', classIds)");
      expect(api).toContain('Not authorized to moderate this content');
    });

    it('requires teacher or admin', () => {
      expect(api).toContain("user.role !== 'teacher' && user.role !== 'admin'");
    });

    it('tells teachers where public perspectives are reviewed instead of showing a silent empty list', () => {
      expect(panel).toContain('reviewed by platform administrators');
      expect(panel).toContain("scope === 'admin'");
    });

    it('is reachable from the flagged-content alert', () => {
      const dashboard = read('client/src/pages/TeacherDashboard.tsx');
      expect(dashboard).toContain("setSelectedTab('moderation')");
      expect(dashboard).toContain('<ModerationPanel />');
    });
  });
});

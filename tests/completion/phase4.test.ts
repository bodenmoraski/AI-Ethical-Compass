/**
 * Phase 4 acceptance tests — notifications.
 *
 * `lib/notifications.ts` already wrote rows, but nothing read them: there was no
 * API route and no UI, so every notification the app created was invisible.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf-8');

describe('Phase 4 — notifications', () => {
  describe('G4.1 notifications API', () => {
    const api = read('api/notifications.ts');

    it('exists as a route', () => {
      expect(fs.existsSync(path.join(root, 'api/notifications.ts'))).toBe(true);
      expect(api).toContain('export default async function handler');
    });

    it('requires authentication', () => {
      expect(api).toContain('await requireAppUser(req)');
      expect(api).toContain('authErrorStatus');
    });

    it('derives the recipient from the token, never from the query string', () => {
      expect(api).toContain("eq('recipient_id', user.id)");
      expect(api).not.toMatch(/req\.query\.(userId|user_id|email)/);
    });

    it('returns an unread count alongside the list', () => {
      expect(api).toContain('unreadCount');
      expect(api).toContain("count: 'exact'");
    });

    it('supports mark-one and mark-all', () => {
      expect(api).toContain('if (all === true)');
      expect(api).toContain('markedAll: true');
      expect(api).toContain("eq('id', notificationId)");
    });

    it('scopes mark-read by recipient so ids cannot be walked', () => {
      const patch = api.slice(api.indexOf("if (req.method === 'PATCH')"));
      const singleUpdate = patch.slice(patch.indexOf("eq('id', notificationId)"));
      expect(singleUpdate).toContain("eq('recipient_id', user.id)");
      expect(singleUpdate).toContain('404');
    });

    it('caps the page size', () => {
      expect(api).toContain('MAX_LIMIT');
      expect(api).toContain('Math.min(Number(req.query.limit)');
    });

    it('degrades gracefully when the table is missing', () => {
      expect(api).toContain('unavailable: true');
    });

    it('rejects other verbs', () => {
      expect(api).toContain("error: 'Method not allowed'");
    });
  });

  describe('G4.2 notification UI', () => {
    const bell = read('client/src/components/NotificationBell.tsx');
    const navbar = read('client/src/components/Navbar.tsx');

    it('is mounted in the navbar for signed-in users', () => {
      expect(navbar).toContain('import NotificationBell from "./NotificationBell"');
      expect(navbar).toContain('<NotificationBell />');
      const authSection = navbar.slice(navbar.indexOf('{/* Auth Section */}'), navbar.indexOf('material-icons mr-1'));
      // Rendered on the `user ?` branch, so signed-out visitors never see it.
      expect(authSection).toContain('<NotificationBell />');
    });

    it('calls the notifications API with auth', () => {
      expect(bell).toContain("fetch('/api/notifications?limit=15'");
      expect(bell).toContain('Authorization');
    });

    it('shows an unread badge', () => {
      expect(bell).toContain('unreadCount > 0');
      expect(bell).toContain("unreadCount > 9 ? '9+' : unreadCount");
    });

    it('can mark one and all as read', () => {
      expect(bell).toContain("JSON.stringify({ all: true })");
      expect(bell).toContain('JSON.stringify({ id })');
      expect(bell).toContain("method: 'PATCH'");
    });

    it('has an explicit empty state', () => {
      expect(bell).toContain("You're all caught up.");
    });

    it('is labelled for screen readers', () => {
      expect(bell).toContain('aria-label={unreadCount > 0');
    });

    it('refreshes on a timer and cleans the timer up', () => {
      expect(bell).toContain('setInterval(fetchNotifications, POLL_INTERVAL_MS)');
      expect(bell).toContain('clearInterval(interval)');
    });
  });

  describe('G4.3 producers beyond enrollment', () => {
    const teacher = read('api/teacher.ts');

    it('grading produces a notification', () => {
      expect(teacher).toContain('notifyStudentOfGrade');
    });

    it('publishing produces a notification for every enrolled student', () => {
      const announce = teacher.slice(
        teacher.indexOf('const announcePublishedAssignment'),
        teacher.indexOf('const announcePublishedAssignment') + 1800
      );
      expect(announce).toContain('notifyStudentOfNewAssignment');
      expect(announce).toContain('enrollments || []');
    });

    it('enrollment still produces notifications', () => {
      const student = read('api/student.ts');
      expect(student).toContain('notifyTeacherOfEnrollment');
      expect(student).toContain('notifyStudentOfEnrollment');
    });

    it('notification failures never break the triggering action', () => {
      const lib = read('lib/notifications.ts');
      const create = lib.slice(lib.indexOf('export async function createNotification'), lib.indexOf('export async function notifyTeacherOfEnrollment'));
      expect(create).toContain('catch');
      expect(create).toContain('return false');
    });
  });
});

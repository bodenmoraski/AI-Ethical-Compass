/**
 * Deep validation — security hardening beyond Phase 8.
 *
 * These are source-level and handler-level checks meant to catch regressions
 * that "look authenticated" but still trust client-supplied identity.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const apiDir = path.join(root, 'api');

function apiFiles(): string[] {
  return fs
    .readdirSync(apiDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => path.join(apiDir, f));
}

describe('security hardening — identity never comes from the body', () => {
  const writeApis = apiFiles().map((f) => ({
    name: path.basename(f),
    source: fs.readFileSync(f, 'utf8'),
  }));

  it.each([
    'userId',
    'user_id',
    'studentId',
    'student_id',
    'teacherId',
    'teacher_id',
    'author_email',
    'user_email',
  ])('no write handler trusts body.%s as the acting identity', (field) => {
    const offenders: string[] = [];

    for (const { name, source } of writeApis) {
      // Match: destructuring identity fields from req.body
      const pattern = new RegExp(
        `const\\s*\\{[^}]*\\b${field}\\b[^}]*\\}\\s*=\\s*req\\.body`,
        'm'
      );
      if (pattern.test(source)) {
        // Allowed only if the very next use is a comparison against the token user
        // (e.g. reject when body.email !== authEmail). Flag if used as a write key.
        const after = source.slice(source.search(pattern));
        const usedAsWriteKey =
          new RegExp(`\\.(eq|insert)\\([^)]*${field}`).test(after.slice(0, 800)) ||
          new RegExp(`${field}:\\s*${field}`).test(after.slice(0, 800));
        if (usedAsWriteKey) offenders.push(name);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('teacher enroll-by-email still verifies class ownership first', () => {
    // studentEmail in the body is a lookup key for "who to enroll", not "who is acting".
    // The dangerous pattern is using it without confirming the teacher owns the class.
    const teacher = read('api/teacher.ts');
    const enroll = teacher.slice(
      teacher.indexOf('Enroll student by email'),
      teacher.indexOf('Enroll student by email') + 2000
    );
    expect(enroll).toContain('studentEmail');
    expect(enroll).toMatch(/teacher_id|access denied/i);
  });

  it('every mutating method in api/ either requires auth or is a documented public read', () => {
    const mutating = /req\.method === ['"](POST|PUT|PATCH|DELETE)['"]/;
    const authGate =
      /requireAppUser|requireRole|resolveAppUser|requireAuthEmail|getUser\(token\)|Authentication required|Sign in to/;

    const offenders: string[] = [];
    for (const { name, source } of writeApis) {
      if (!mutating.test(source)) continue;
      // Public GET libraries are fine; mutating without an auth gate is not.
      if (!authGate.test(source)) offenders.push(name);
    }

    expect(offenders).toEqual([]);
  });

  it('no handler accepts Authorization: Bearer null / undefined as a token', () => {
    const auth = read('lib/api-auth.ts');
    expect(auth).toContain("token === 'null'");
    expect(auth).toContain("token === 'undefined'");
  });

  it('legacy routes use getBearerToken so null/undefined tokens are rejected', () => {
    for (const file of [
      'api/user-profile.ts',
      'api/user-dashboard.ts',
      'api/leaderboard.ts',
      'api/teacher.ts',
      'api/student.ts',
    ]) {
      const source = read(file);
      expect(source).toContain('getBearerToken');
      expect(source).not.toMatch(/authHeader\.substring\(7\)/);
    }
  });

  it('admin routes are role-gated, not just authenticated', () => {
    const admin = read('api/admin.ts');
    expect(admin).toMatch(/requireRole\(req,\s*\[[^\]]*['"]admin['"]/);
  });

  it('moderation resolve actions require teacher or admin', () => {
    const mod = read('api/moderation.ts');
    expect(mod).toMatch(
      /requireRole|role !== ['"]teacher['"].*role !== ['"]admin['"]|role === ['"]admin['"]|role === ['"]teacher['"]/
    );
  });

  it('grading refuses to grade a submission the teacher does not own', () => {
    const teacher = read('api/teacher.ts');
    const start = teacher.indexOf("req.query.action === 'grade-submission'");
    expect(start).toBeGreaterThan(-1);
    const gradeBlock = teacher.slice(start, start + 2500);
    expect(gradeBlock).toMatch(/teacher_id !== userId/);
    expect(gradeBlock).toMatch(/Access denied/);
  });

  it('class analytics refuses foreign classes', () => {
    const teacher = read('api/teacher.ts');
    expect(teacher).toContain('handleClassAnalytics');
    const analytics = teacher.slice(
      teacher.indexOf('handleClassAnalytics'),
      teacher.indexOf('handleClassAnalytics') + 2500
    );
    expect(analytics).toMatch(/teacher_id|Access denied|403/);
  });
});

describe('security hardening — CORS and error leakage', () => {
  it('auth errors do not dump stack traces to clients', () => {
    const auth = read('lib/api-auth.ts');
    expect(auth).toContain('AuthError');
    expect(auth).toContain('authErrorStatus');
  });

  it('notification mark-read is scoped to the recipient', () => {
    const notifications = read('api/notifications.ts');
    const patch = notifications.slice(notifications.indexOf("PATCH"));
    expect(patch).toContain("eq('recipient_id', user.id)");
  });

  it('achievements cannot be awarded for a different user via query/body', () => {
    const achievements = read('api/achievements.ts');
    expect(achievements).toMatch(/requireAppUser|resolveAppUser/);
    // POST award path must use the authenticated user's id
    expect(achievements).not.toMatch(/const \{[^}]*userId[^}]*\} = req\.body/);
  });
});

describe('security hardening — realtime classroom cannot spoof engagement', () => {
  const realtime = read('api/realtime-classroom.ts');

  it('derives user_id from the JWT', () => {
    expect(realtime).toMatch(/requireAppUser|resolveAppUser|user\.id/);
    expect(realtime).not.toMatch(/user_id:\s*req\.body\.user_id/);
  });

  it('scopes activity to class membership', () => {
    expect(realtime).toMatch(/classAccess|requireTeacherAccess|enrollment/);
  });
});

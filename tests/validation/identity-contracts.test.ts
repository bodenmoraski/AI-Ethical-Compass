/**
 * Deep validation — identity model consistency.
 *
 * The app has historically mixed Supabase UUIDs, integer users.id, and emails
 * as foreign keys. These checks lock the current contracts so they can't drift.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('identity contracts', () => {
  it('lib/api-auth resolves to integer users.id', () => {
    const auth = read('lib/api-auth.ts');
    expect(auth).toContain('id: number');
    expect(auth).toContain("eq('email', data.user.email)");
  });

  it('perspectives.user_id stores email (legacy contract), derived from JWT', () => {
    const perspectives = read('api/perspectives.ts');
    // After auth hardening the value still comes from the token email.
    expect(perspectives).toMatch(/authorUser\.email|userId = authorUser/);
  });

  it('assignment submissions use integer student_id', () => {
    const dashboard = read('api/user-dashboard.ts');
    expect(dashboard).toMatch(/student_id/);
  });

  it('class ownership compares integer teacher_id to integer userId', () => {
    const teacher = read('api/teacher.ts');
    expect(teacher).toMatch(/teacher_id !== userId/);
    // Must not compare UUID strings to teacher_id
    expect(teacher).not.toMatch(/teacher_id !== data\.user\.id/);
  });

  it('achievements collect metrics by email (matching perspectives.user_id)', () => {
    const achievements = read('lib/achievements.ts');
    expect(achievements).toContain("eq('user_id', userEmail)");
  });

  it('notifications target integer recipient_id', () => {
    const notifications = read('lib/notifications.ts');
    expect(notifications).toMatch(/recipient_id/);
  });
});

describe('identity — no UUID-vs-int comparison traps left in API', () => {
  const apiFiles = fs
    .readdirSync(path.join(root, 'api'))
    .filter((f) => f.endsWith('.ts'));

  it.each(apiFiles)('%s does not compare auth UUID to integer teacher/student ids', (file) => {
    const source = read(path.join('api', file));
    // Classic bug: teacher_id !== user.id where user comes from supabase.auth
    const trap =
      /teacher_id\s*!==\s*(data\.)?user\.id|student_id\s*!==\s*(data\.)?user\.id|teacher_id\s*===?\s*authUser\.id/;
    expect(source).not.toMatch(trap);
  });
});

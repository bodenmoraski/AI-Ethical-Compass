/**
 * Environment-free regression guards for the teacher-access vulnerability.
 *
 * The live-server version of these checks lives in tests/api/teacher-security.test.ts
 * and only runs under `npm run test:integration`. These assertions read the source
 * directly so the regression is caught in every ordinary test run.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const teacherApi = fs.readFileSync(path.join(process.cwd(), 'api', 'teacher.ts'), 'utf-8');

describe('Teacher access request security', () => {
  it('creates requests in a pending state', () => {
    expect(teacherApi).toContain("status: 'pending'");
  });

  it('never auto-approves a request', () => {
    const dangerous = [
      /update\([^)]*role:\s*'teacher'[^)]*\)[\s\S]{0,200}teacher_access_requests/i,
      /status:\s*'approved'[\s\S]{0,120}auto/i,
    ];
    dangerous.forEach((pattern) => expect(teacherApi).not.toMatch(pattern));
  });

  it('requires an authenticated caller before creating a request', () => {
    const start = teacherApi.indexOf('const handleTeacherAccess');
    expect(start).toBeGreaterThan(-1);
    const accessHandler = teacherApi.slice(start, start + 4000);
    expect(accessHandler).toContain('auth.getUser(token)');
    expect(accessHandler).toContain('401');
  });

  it('restricts teacher APIs to teacher or admin roles', () => {
    expect(teacherApi).toContain("userProfile.role !== 'teacher' && userProfile.role !== 'admin'");
    expect(teacherApi).toContain('Teacher access required');
  });

  it('maps authorization failures to 401/403 rather than 500', () => {
    const handlerTail = teacherApi.slice(teacherApi.lastIndexOf('} catch (error) {'));
    expect(handlerTail).toContain('403');
    expect(handlerTail).toContain('401');
  });
});

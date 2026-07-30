/**
 * Deep validation — input bounds / abuse resistance.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('input bounds — perspectives', () => {
  const source = read('api/perspectives.ts');

  it('rejects perspectives that are too short or too long', () => {
    expect(source).toMatch(/minimum 5 characters|too short/i);
    expect(source).toMatch(/2000 characters|maximum length/i);
  });

  it('rejects replies that are too short or too long', () => {
    expect(source).toMatch(/1000 characters/);
  });
});

describe('input bounds — user scenarios', () => {
  it('requires title and description', () => {
    const source = read('api/user-scenarios.ts');
    expect(source).toMatch(/Title and description are required|title.*description/i);
  });

  it('rejects too-short or too-long scenario text', () => {
    const source = read('api/user-scenarios.ts');
    expect(source).toContain('Title must be 5–200 characters');
    expect(source).toContain('Description must be 40–10000 characters');
  });
});

describe('input bounds — notifications', () => {
  it('clamps the list limit', () => {
    const source = read('api/notifications.ts');
    expect(source).toContain('MAX_LIMIT');
    expect(source).toMatch(/Math\.min\(/);
    expect(source).toMatch(/MAX_LIMIT/);
  });

  it('truncates title and message before insert', () => {
    const source = read('lib/notifications.ts');
    expect(source).toMatch(/title: String\(data\.title.*\)\.slice\(0,\s*200\)/);
    expect(source).toMatch(/message: String\(data\.message.*\)\.slice\(0,\s*2000\)/);
  });
});

describe('input bounds — moderation', () => {
  it('caps the queue page at 100', () => {
    const source = read('api/moderation.ts');
    expect(source).toMatch(/\.limit\(100\)/);
  });
});

describe('input bounds — grading score range', () => {
  it('rejects scores outside [0, points_possible]', () => {
    const teacher = read('api/teacher.ts');
    expect(teacher).toMatch(/Score out of range/);
  });

  it('rejects oversized feedback and assignment text', () => {
    const teacher = read('api/teacher.ts');
    expect(teacher).toMatch(/Feedback exceeds maximum length of 10000/);
    expect(teacher).toMatch(/description: z\.string\(\)\.max\(5000\)/);
    expect(teacher).toMatch(/instructions: z\.string\(\)\.max\(20000\)/);
  });
});

describe('input bounds — assignment submissions', () => {
  it('rejects oversized or empty written responses', () => {
    const source = read('api/user-dashboard.ts');
    expect(source).toContain('Submission is too large');
    expect(source).toContain('Written response is too short');
    expect(source).toContain('Written response exceeds 20000 characters');
  });
});

describe('security — production cannot skip moderation with a magic token', () => {
  it('gates the DEVYES bypass on a non-production environment', () => {
    const source = read('api/perspectives.ts');
    expect(source).toContain('{DEVYES}');
    expect(source).toMatch(/NODE_ENV !== ['"]production['"]/);
  });

  it('does not log the raw request body', () => {
    const source = read('api/perspectives.ts');
    expect(source).not.toMatch(/console\.log\([^)]*req\.body/);
  });
});

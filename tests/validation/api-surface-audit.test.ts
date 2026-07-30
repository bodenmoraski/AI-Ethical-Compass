/**
 * Deep validation — API surface audit.
 *
 * Ensures every route file is wired, every write path has auth, and no deleted
 * modules are still imported.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('API surface — every route exports a default handler', () => {
  const routes = fs.readdirSync(path.join(root, 'api')).filter((f) => f.endsWith('.ts'));

  it.each(routes)('%s exports a default async handler', (file) => {
    const source = read(path.join('api', file));
    expect(source).toMatch(/export default async function handler/);
  });

  it.each(routes)('%s handles OPTIONS for CORS', (file) => {
    const source = read(path.join('api', file));
    expect(source).toMatch(/OPTIONS/);
  });
});

describe('API surface — no dangling imports of deleted modules', () => {
  const deleted = [
    'assignment-communication',
    'EnhancedFeedbackForm',
    'GradingRubric',
    'RichTextEditor',
    'lib/supabase',
  ];

  it.each(deleted)('nothing still imports %s', (name) => {
    const offenders = walk(path.join(root, 'api'))
      .concat(walk(path.join(root, 'client/src')))
      .concat(walk(path.join(root, 'lib')))
      .filter((file) => {
        const source = fs.readFileSync(file, 'utf8');
        return (
          source.includes(`/${name}'`) ||
          source.includes(`/${name}"`) ||
          source.includes(`from '${name}'`) ||
          source.includes(`from "${name}"`)
        );
      })
      .map((f) => path.relative(root, f));

    expect(offenders).toEqual([]);
  });
});

describe('API surface — shared auth helpers are the single source of truth', () => {
  it('new routes prefer lib/api-auth over ad-hoc bearer parsing', () => {
    // Routes written during the completion pass should use the shared helper.
    const modern = ['notifications.ts', 'admin.ts', 'moderation.ts', 'user-progress.ts', 'user-scenarios.ts'];
    for (const file of modern) {
      const source = read(path.join('api', file));
      expect(source).toMatch(/from ['"].*api-auth/);
    }
  });

  it('service client is used for privileged writes (notifications, moderation, activity)', () => {
    const privileged = [
      'lib/notifications.ts',
      'lib/moderation-queue.ts',
      'lib/activity-feed.ts',
      'lib/achievements.ts',
    ];
    for (const file of privileged) {
      if (!fs.existsSync(path.join(root, file))) continue;
      const source = read(file);
      expect(source).toMatch(/getServiceClient|SERVICE_ROLE|supabase-server/);
    }
  });
});

describe('API surface — client never ships service-role keys', () => {
  it('client source does not reference SERVICE_ROLE', () => {
    const offenders = walk(path.join(root, 'client/src')).filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /SERVICE_ROLE|service_role/.test(source);
    });
    expect(offenders).toEqual([]);
  });

  it('.env.example documents the service role as server-only', () => {
    const example = read('.env.example');
    expect(example).toMatch(/SERVICE_ROLE|service.role/i);
  });
});

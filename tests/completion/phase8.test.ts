/**
 * Phase 8 acceptance tests — hardening.
 *
 * The write endpoints below used to take identity from the request body, so any
 * caller could record progress, submit scenarios, vote, or reply as somebody else.
 * These tests call the handlers directly with no Authorization header.
 */
import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { localeCodes, missingKeys, usedKeys } from '../../lib/i18n-coverage';

process.env.SUPABASE_URL ||= 'https://phase8.test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key';
process.env.SUPABASE_ANON_KEY ||= 'test-anon-key';
// api/user-scenarios pulls in the AI moderation helper, which builds an OpenAI
// client at import time. These tests never reach a model call.
process.env.OPENAI_API_KEY ||= 'test-openai-key';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

/** Minimal VercelResponse stand-in that records what the handler sent. */
function mockRes() {
  const res: any = {
    statusCode: 0,
    body: undefined,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      res.headers[key] = value;
      return res;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
}

const anonymousRequest = (method: string, body: unknown = {}, query: unknown = {}) =>
  ({ method, headers: {}, body, query, url: '/api/test' }) as any;

describe('G8.1 — remaining unauthenticated writes are closed', () => {
  let userProgress: any;
  let userScenarios: any;
  let userProfile: any;

  beforeAll(async () => {
    userProgress = (await import('../../api/user-progress')).default;
    userScenarios = (await import('../../api/user-scenarios')).default;
    userProfile = (await import('../../api/user-profile')).default;
  });

  it('rejects anonymous scenario progress writes', async () => {
    const res = mockRes();
    await userProgress(anonymousRequest('POST', { scenarioId: 1, completed: true }), res);
    expect(res.statusCode).toBe(401);
  });

  it('no longer accepts a user id from the progress body', () => {
    const source = read('api/user-progress.ts');
    expect(source).toContain('await requireAppUser(req, supabase)');
    expect(source).toContain('user_id: user.id');
    expect(source).not.toMatch(/const \{[^}]*userId[^}]*\} = req\.body/);
  });

  it('rejects anonymous scenario submissions', async () => {
    const res = mockRes();
    await userScenarios(
      anonymousRequest('POST', { title: 'Spoofed', description: 'x'.repeat(40) }),
      res
    );
    expect(res.statusCode).toBe(401);
  });

  it('rejects anonymous votes', async () => {
    const res = mockRes();
    await userScenarios(
      anonymousRequest('PUT', { scenario_id: 1, vote_type: 'up', user_email: 'victim@example.com' }),
      res
    );
    expect(res.statusCode).toBe(401);
  });

  it('rejects anonymous reads of pending submissions', async () => {
    const res = mockRes();
    await userScenarios(anonymousRequest('GET', {}, { status: 'all' }), res);
    expect(res.statusCode).toBe(401);
  });

  it('takes scenario attribution from the token, not the body', () => {
    const source = read('api/user-scenarios.ts');
    expect(source).toContain('author_email: author.email');
    expect(source).toContain('author_name: author.username');
    expect(source).toContain("user_email: voter.email");
    expect(source).not.toMatch(/const \{[^}]*author_email[^}]*\} = req\.body/);
    expect(source).not.toMatch(/const \{[^}]*user_email[^}]*\} = req\.body/);
  });

  it('rejects anonymous profile reads', async () => {
    const res = mockRes();
    await userProfile(anonymousRequest('GET', {}, { email: 'victim@example.com' }), res);
    expect(res.statusCode).toBe(401);
  });

  it('reads the profile of the token holder rather than the requested email', () => {
    const source = read('api/user-profile.ts');
    expect(source).toContain("eq('email', authEmail)");
    expect(source).not.toContain("eq('email', email)");
  });

  it('requires a signed-in account to like, rate, or reply', () => {
    const source = read('api/perspectives.ts');
    expect(source).toContain('Sign in to like perspectives');
    expect(source).toContain('Sign in to reply');
    expect(source).toContain("author_name: replier.username");
    // A reply must not be attributed to a client-supplied name.
    const replyBlock = source.slice(
      source.indexOf('Sign in to reply'),
      source.indexOf('Failed to create reply')
    );
    expect(replyBlock).not.toContain('authorName');
  });

  it('leaves public reads public', async () => {
    const source = read('api/user-scenarios.ts');
    // The approved list is the library everyone browses; it must not need a token.
    expect(source).toContain('const wantsPrivate = ');
    expect(source).toMatch(/if \(wantsPrivate\) \{[\s\S]{0,120}requireAppUser/);
  });
});

describe('G8.2 — i18n gaps closed or locales hidden', () => {
  it('finds the keys the UI renders', () => {
    const keys = usedKeys();
    expect(keys.length).toBeGreaterThan(20);
    expect(keys).toContain('navigation.scenarios');
    expect(keys).toContain('footer.copyright');
  });

  it('has every rendered key in every offered locale', () => {
    const keys = usedKeys();
    const gaps: Record<string, string[]> = {};
    for (const code of localeCodes()) {
      const missing = missingKeys(code, keys);
      if (missing.length) gaps[code] = missing;
    }
    expect(gaps).toEqual({});
  });

  it('offers only locales that have a bundle', () => {
    const selector = read('client/src/components/LanguageSelector.tsx');
    const offered = Array.from(selector.matchAll(/code: '([a-z-]+)'/g)).map((m) => m[1]);
    expect(offered.length).toBeGreaterThan(1);
    for (const code of offered) {
      expect(localeCodes()).toContain(code);
    }
  });

  it('says which parts of the app are translated instead of implying all of it', () => {
    const selector = read('client/src/components/LanguageSelector.tsx');
    expect(selector).toMatch(/English only for now/i);
  });

  it('has no components importing the translation hook without using it', () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '__tests__') continue;
          walk(full, out);
        } else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) {
          out.push(full);
        }
      }
      return out;
    };

    const unused = walk(path.join(root, 'client/src')).filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      if (!source.includes('useTranslation')) return false;
      // LanguageSelector legitimately uses the hook only for `i18n`.
      if (source.includes('const { i18n }')) return false;
      return !/\bt\(\s*['"]/.test(source);
    });

    expect(unused).toEqual([]);
  });
});

describe('G8.3 — placeholder tests replaced', () => {
  const testFiles: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(test|spec)\.(ts|tsx|js)$/.test(entry.name)) testFiles.push(full);
    }
  };

  beforeAll(() => {
    walk(path.join(root, 'tests'));
    walk(path.join(root, 'client/src'));
  });

  it('has no always-true assertions', () => {
    const offenders = testFiles.filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      // The indexes suite documents the placeholder it replaced, in prose.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '');
      return /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/.test(code)
        || /expect\(\s*1\s*\)\.toBe\(\s*1\s*\)/.test(code);
    });

    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });

  it('has no skipped or todo tests left behind', () => {
    const offenders = testFiles.filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /\b(it|test|describe)\.(skip|todo)\s*\(/.test(source);
    });

    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe('G8.4 — whole-project green', () => {
  it('has a type check that covers the server surface', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['check:api']).toBe('tsc --noEmit -p tsconfig.api.json');
    expect(fs.existsSync(path.join(root, 'tsconfig.api.json'))).toBe(true);
  });

  it('has an acceptance suite for every phase', () => {
    for (let phase = 0; phase <= 8; phase++) {
      expect(fs.existsSync(path.join(root, `tests/completion/phase${phase}.test.ts`))).toBe(true);
    }
  });

  it('has no orphaned modules left from the cleanup', () => {
    const gone = [
      'api/assignment-communication.ts',
      'client/src/components/teacher/EnhancedFeedbackForm.tsx',
      'client/src/components/teacher/GradingRubric.tsx',
      'client/src/components/student/RichTextEditor.tsx',
      'lib/supabase.ts',
    ];
    for (const file of gone) {
      expect(fs.existsSync(path.join(root, file))).toBe(false);
    }
  });

  it('records every goal in the completion plan', () => {
    const plan = read('docs/COMPLETION_PLAN.md');
    const rows = plan.split('\n').filter((l) => /^\| \d \| G\d\.\d/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(30);
    expect(rows.filter((r) => r.includes('[ ]'))).toEqual([]);
  });
});

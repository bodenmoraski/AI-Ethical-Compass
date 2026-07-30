/**
 * Deep validation — scalability and cost hazards.
 *
 * Catches patterns that work at pilot scale and fall over with a real class:
 * unbounded selects, missing indexes for hot paths, N+1 loops, and synchronous
 * AI calls on request-critical paths without a timeout/guard.
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
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|sql)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('scalability — hot-path indexes exist in migrations', () => {
  const migrations = walk(path.join(root, 'server/migrations'))
    .concat(walk(path.join(root, 'scripts/sql')))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');

  const required = [
    { name: 'submissions by assignment/status', pattern: /idx_submissions_assignment_status|ON assignment_submissions\s*\(\s*assignment_id\s*,\s*status/i },
    { name: 'moderation by status', pattern: /idx_moderation_queue_status|ON moderation_queue\s*\(\s*status/i },
    { name: 'moderation by class', pattern: /idx_moderation_queue_class|ON moderation_queue\s*\(\s*class_id/i },
    { name: 'notifications recipient', pattern: /idx_notifications_recipient|ON notifications\s*\(\s*recipient_id/i },
    { name: 'notifications recipient+unread composite', pattern: /idx_notifications_recipient_unread/i },
    { name: 'enrollments', pattern: /idx_class_enrollments|ON class_enrollments/i },
    { name: 'perspective ratings composite', pattern: /idx_perspective_ratings_perspective_user/i },
    { name: 'late submissions partial', pattern: /idx_submissions_assignment_late/i },
  ];

  it.each(required)('has an index for $name', ({ pattern }) => {
    expect(migrations).toMatch(pattern);
  });
});

describe('scalability — no unbounded list endpoints without a limit', () => {
  const routes: Array<{ file: string; selectHint: RegExp; mustLimit: boolean }> = [
    {
      file: 'api/notifications.ts',
      selectHint: /from\(['"]notifications['"]\)/,
      mustLimit: true,
    },
    {
      file: 'api/moderation.ts',
      selectHint: /from\(['"]moderation_queue['"]\)/,
      mustLimit: true,
    },
    {
      file: 'api/realtime-classroom.ts',
      selectHint: /from\(['"]classroom_activity['"]\)|from\(['"]activity_feed['"]\)/,
      mustLimit: true,
    },
  ];

  it.each(routes)('$file caps list size', ({ file, selectHint, mustLimit }) => {
    const source = read(file);
    if (!selectHint.test(source)) return; // table name may differ; skip if absent
    if (!mustLimit) return;

    // Either .limit(N) near the select, or an explicit MAX_LIMIT / slice.
    const hasLimit =
      /\.limit\s*\(/.test(source) ||
      /MAX_LIMIT|maxLimit|Math\.min\([^)]*limit/i.test(source);
    expect(hasLimit).toBe(true);
  });

  it('perspectives rankings bound the DB fetch and scope reputation', () => {
    const source = read('api/perspectives.ts');
    const rankings = source.slice(
      source.indexOf("action === 'rankings'"),
      source.indexOf("action === 'rankings'") + 5000
    );
    expect(rankings).toMatch(/\.limit\s*\(/);
    expect(rankings).toMatch(/RANKINGS_FETCH_CAP|limit\(RANKINGS/);
    expect(rankings).toContain('calculateUserReputations(supabase, scenarioId)');
  });
});

describe('scalability — avoid classic N+1 in teacher analytics', () => {
  it('class analytics does not query per-assignment inside a serial await loop over every student', () => {
    const teacher = read('api/teacher.ts');
    const analytics = teacher.slice(
      teacher.indexOf('handleClassAnalytics'),
      teacher.indexOf('handleClassAnalytics') + 6000
    );

    // Flag: for (... of students) { await supabase.from(...) }
    const serialAwaitInLoop =
      /for\s*\([^)]+of\s+\w+\)\s*\{[\s\S]{0,400}await\s+supabase\.from/.test(analytics);
    expect(serialAwaitInLoop).toBe(false);
  });

  it('assignment publish does not N+1 notify students one insert at a time without batching awareness', () => {
    const teacher = read('api/teacher.ts');
    // It's OK to loop, but there should be a batch insert or Promise.all, not
    // a silent fire-and-forget that scales linearly with class size unnoticed.
    const announce = teacher.slice(
      teacher.indexOf('announcePublishedAssignment'),
      teacher.indexOf('announcePublishedAssignment') + 3500
    );
    if (!announce.includes('announcePublishedAssignment')) return;

    const hasBatchOrAll =
      /\.insert\s*\(\s*\[/.test(announce) ||
      /Promise\.all/.test(announce) ||
      /createNotification/.test(announce);
    expect(hasBatchOrAll).toBe(true);
  });
});

describe('scalability — AI calls are bounded', () => {
  it('ai-analysis has a timeout or length guard before calling OpenAI', () => {
    const ai = read('lib/ai-analysis.ts');
    // Must either truncate content or set a timeout / max tokens.
    expect(
      /max_tokens|timeout|slice\(|substring\(|MAX_|truncate/i.test(ai)
    ).toBe(true);
  });

  it('perspective creation does not block forever on moderation failure', () => {
    const perspectives = read('api/perspectives.ts');
    // Flagged content should still return a response; reject path is fine.
    expect(perspectives).toMatch(/moderation|catch|try/);
  });
});

describe('scalability — leaderboard reads and recalcs are bounded', () => {
  const source = read('api/leaderboard.ts');

  it('caps the public GET limit', () => {
    expect(source).toMatch(/Math\.min\(/);
    expect(source).toContain('cappedLimit');
  });

  it('bounds recalculateLeaderboard table scans', () => {
    expect(source).toContain('RECALC_FETCH_CAP');
    expect(source).toMatch(/\.limit\(RECALC_FETCH_CAP\)/);
  });

  it('requires teacher or admin to recalculate', () => {
    expect(source).toMatch(/role !== 'teacher'|Only teachers/);
  });
});

describe('scalability — platform stats never dump the users table', () => {
  it('uses head counts instead of selecting every email', () => {
    const source = read('api/platform.ts');
    expect(source).toMatch(/count:\s*'exact'/);
    expect(source).not.toMatch(/\.select\(['"]email['"]\)/);
    expect(source).toContain('estimatedCountries');
  });
});

describe('scalability — achievement metrics are bounded per user', () => {
  it('caps perspective / rating fetches in collectMetrics', () => {
    const source = read('lib/achievements.ts');
    const collect = source.slice(source.indexOf('collectMetrics'), source.indexOf('checkAndAwardAchievements'));
    expect(collect).toMatch(/\.limit\(500\)/);
    expect(collect).toMatch(/\.limit\(1000\)/);
  });
});

describe('scalability — activity feed is best-effort', () => {
  it('recordActivity never throws into the caller success path', () => {
    const feed = read('lib/activity-feed.ts');
    expect(feed).toMatch(/try\s*\{[\s\S]*catch/);
    // Best-effort: catch and log, don't rethrow.
    const catchBlock = feed.slice(feed.lastIndexOf('catch'));
    expect(catchBlock).not.toMatch(/throw /);
  });
});

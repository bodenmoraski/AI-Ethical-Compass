/**
 * Phase 6 acceptance tests — recognition that can actually be earned.
 *
 * Before this phase achievements matched perspectives on `author_name` (a free-text
 * display name) so no user ever crossed a threshold; nothing in the product wrote to
 * `perspective_ratings`, so the "helpful reviewer" award and the "most helpful" sort
 * were permanently empty; and the award check only ran if a client asked for it.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import {
  ACHIEVEMENTS,
  highestLevelFor,
  metricFor,
  type AchievementMetrics,
} from '../../lib/achievements';
import { computeSdgImpact } from '../../lib/sdg-impact';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf-8');

const emptyMetrics: AchievementMetrics = {
  perspectivesCount: 0,
  likesReceived: 0,
  scenariosCreated: 0,
  ratingsGiven: 0,
  avgQualityScore: 0,
  uniqueFrameworks: 0,
};

describe('Phase 6 — achievements, ratings and SDG impact', () => {
  describe('G6.1 achievement matching uses real identity', () => {
    it('no longer matches perspectives by display name', () => {
      const lib = read('lib/achievements.ts');
      expect(lib).not.toContain("eq('author_name'");
      expect(lib).toContain("eq('user_id', userEmail)");
    });

    it('perspectives store an identity derived from the token', () => {
      const api = read('api/perspectives.ts');
      expect(api).toContain('const authorUser = await resolveAppUser(req)');
      expect(api).toContain('const userId = authorUser?.email || null');
      // The body no longer supplies identity for a submission.
      expect(api).not.toContain('const { scenarioId, content, authorName, userId, userEmail } = req.body');
    });

    it('the award check cannot be run for another user', () => {
      const api = read('api/achievements.ts');
      expect(api).toContain('const user = await requireAppUser(req)');
      expect(api).toContain('checkAndAwardAchievements(user.email)');
      expect(api).not.toContain('const { user_email } = req.body');
    });

    it('earned achievements are only readable by their owner', () => {
      const api = read('api/achievements.ts');
      expect(api).toContain('You can only read your own achievements');
      expect(api).toContain('user.email.toLowerCase() !== requested.toLowerCase()');
    });

    it('the achievement catalogue stays public', () => {
      const api = read('api/achievements.ts');
      expect(api).toContain('return res.status(200).json(ACHIEVEMENTS)');
    });
  });

  describe('achievement level maths', () => {
    const contributor = ACHIEVEMENTS.find((a) => a.type === 'thoughtful_contributor')!;

    it('awards nothing below the first threshold', () => {
      expect(highestLevelFor(contributor, 4)).toBeNull();
    });

    it('awards the highest threshold met, not the first', () => {
      expect(highestLevelFor(contributor, 5)).toBe('bronze');
      expect(highestLevelFor(contributor, 60)).toBe('gold');
      expect(highestLevelFor(contributor, 1000)).toBe('platinum');
    });

    it('maps each achievement to a distinct metric', () => {
      const metrics: AchievementMetrics = {
        ...emptyMetrics,
        perspectivesCount: 1,
        likesReceived: 2,
        scenariosCreated: 3,
        ratingsGiven: 4,
        avgQualityScore: 0.5,
        uniqueFrameworks: 6,
      };

      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'thoughtful_contributor')!, metrics)).toBe(1);
      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'community_favorite')!, metrics)).toBe(2);
      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'scenario_creator')!, metrics)).toBe(3);
      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'helpful_reviewer')!, metrics)).toBe(4);
      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'ethical_reasoner')!, metrics)).toBe(0.5);
      expect(metricFor(ACHIEVEMENTS.find((a) => a.type === 'diverse_thinker')!, metrics)).toBe(6);
    });

    it('every achievement has ascending thresholds', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        const { bronze, silver, gold, platinum } = achievement.levels;
        expect(bronze.threshold).toBeLessThanOrEqual(silver.threshold);
        expect(silver.threshold).toBeLessThanOrEqual(gold.threshold);
        expect(gold.threshold).toBeLessThanOrEqual(platinum.threshold);
      });
    });
  });

  describe('G6.2 perspective ratings can be submitted', () => {
    const api = read('api/perspectives.ts');
    const card = read('client/src/components/PerspectiveCard.tsx');

    it('has a rate action', () => {
      expect(api).toContain("if (action === 'rate' && req.method === 'POST')");
      expect(api).toContain("from('perspective_ratings')");
    });

    it('requires a signed-in rater and derives the email from the token', () => {
      expect(api).toContain('const rater = await resolveAppUser(req)');
      expect(api).toContain('Sign in to rate perspectives');
      expect(api).toContain('rater_email: rater.email');
    });

    it('validates the 1-5 range', () => {
      expect(api).toContain('qualityRating and thoughtfulnessRating must be integers from 1 to 5');
    });

    it('stops self-rating', () => {
      expect(api).toContain('You cannot rate your own perspective');
    });

    it('re-rating updates rather than duplicating', () => {
      expect(api).toContain("onConflict: 'perspective_id,rater_email'");
    });

    it('exposes a star control in the UI', () => {
      expect(card).toContain('const StarRating');
      expect(card).toContain("action=rate&id=");
      expect(card).toContain('qualityRating');
      expect(card).toContain('thoughtfulnessRating');
    });

    it('labels the stars for screen readers', () => {
      expect(card).toContain('aria-label={`Rate ${label.toLowerCase()} ${star} out of 5`}');
    });

    it('rolls the optimistic rating back on failure', () => {
      expect(card).toContain('setRating(previous)');
    });
  });

  describe('G6.3 awards are checked server-side', () => {
    const api = read('api/perspectives.ts');

    it('runs after a perspective is created', () => {
      expect(api).toContain('const awarded = await checkAndAwardAchievements(userId)');
    });

    it('runs after a rating is given', () => {
      expect(api).toContain('await checkAndAwardAchievements(rater.email)');
    });

    it('runs for the author after a like', () => {
      expect(api).toContain('await checkAndAwardAchievements(currentPerspective.user_id)');
    });

    it('likes require authentication so they cannot be inflated', () => {
      expect(api).toContain('Sign in to like perspectives');
      expect(api).toContain('const effectiveUserId = liker.email');
      expect(api).not.toContain("userId || userEmail || 'anonymous_user'");
    });

    it('the client no longer sends its own like identity', () => {
      const card = read('client/src/components/PerspectiveCard.tsx');
      expect(card).not.toContain('const likeUserKey');
    });

    it('award checks never break the action that triggered them', () => {
      const lib = read('lib/achievements.ts');
      const fn = lib.slice(lib.indexOf('export async function checkAndAwardAchievements'));
      expect(fn).toContain('catch');
      expect(fn).toContain('return [];');
    });

    it('awarding the same level twice is a no-op', () => {
      const lib = read('lib/achievements.ts');
      expect(lib).toContain('if (alreadyHeld) continue;');
    });
  });

  describe('G6.4 SDG impact is computed from engagement', () => {
    it('the dashboard derives SDGs from scenarios', () => {
      const api = read('api/user-dashboard.ts');
      expect(api).toContain('computeSdgImpact');
      expect(api).not.toMatch(/primary_sdgs:\s*\[\d/);
    });

    it('ranks the most-engaged SDG first and ignores untouched scenarios', () => {
      const impact = computeSdgImpact(
        [1, 2],
        [
          { id: 1, sdgTags: ['SDG 16'] },
          { id: 2, sdgTags: ['SDG 16', 'SDG 4'] },
          { id: 3, sdgTags: ['SDG 13'] },
        ],
        { total_perspectives: 1, total_likes_received: 0, scenarios_completed: 0 }
      );

      expect(impact.primary_sdgs[0]).toBe(16);
      expect(impact.primary_sdgs).toContain(4);
      expect(impact.primary_sdgs).not.toContain(13);
    });
  });
});

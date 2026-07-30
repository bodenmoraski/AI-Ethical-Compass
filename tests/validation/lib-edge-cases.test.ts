/**
 * Deep validation — library edge cases that acceptance tests skimmed.
 */
import { describe, it, expect } from '@jest/globals';
import { applyLatePenalty } from '../../lib/late-policy';
import { isRubric, scoreRubric, totalPossible } from '../../lib/rubric-scoring';
import {
  ACHIEVEMENTS,
  highestLevelFor,
  metricFor,
  type AchievementMetrics,
} from '../../lib/achievements';

describe('late policy — adversarial inputs', () => {
  const base = {
    due_date: '2026-01-10T00:00:00.000Z',
    points_possible: 100,
    late_penalty_per_day: 10,
  };

  it('ignores is_late=true when timestamps say on-time', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: '2026-01-09T23:59:59.000Z' },
      base,
      90
    );
    expect(result.applied).toBe(false);
    expect(result.score).toBe(90);
  });

  it('handles invalid date strings without NaN scores', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: 'not-a-date' },
      base,
      90
    );
    expect(Number.isFinite(result.score)).toBe(true);
    expect(result.applied).toBe(false);
  });

  it('handles zero points_possible without throwing', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: '2026-01-12T00:00:00.000Z' },
      { ...base, points_possible: 0 },
      0
    );
    expect(result.score).toBe(0);
  });

  it('rejects negative penalties by treating them as zero', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: '2026-01-12T00:00:00.000Z' },
      { ...base, late_penalty_per_day: -10 },
      80
    );
    expect(result.applied).toBe(false);
    expect(result.score).toBe(80);
  });

  it('caps a 100%/day penalty at zero rather than going negative', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: '2026-01-15T00:00:00.000Z' },
      { ...base, late_penalty_per_day: 100 },
      95
    );
    expect(result.score).toBe(0);
    expect(result.deducted).toBe(95);
  });

  it('uses ceil so 1ms late counts as a full day', () => {
    const result = applyLatePenalty(
      { is_late: true, submitted_at: '2026-01-10T00:00:00.001Z' },
      base,
      100
    );
    expect(result.daysLate).toBe(1);
    expect(result.score).toBe(90);
  });
});

describe('rubric scoring — adversarial inputs', () => {
  const rubric = {
    criteria: [
      { id: 'a', name: 'Analysis', maxPoints: 40 },
      { id: 'b', name: 'Writing', maxPoints: 60 },
    ],
  };

  it('rejects empty / malformed rubrics', () => {
    expect(isRubric(null)).toBe(false);
    expect(isRubric({})).toBe(false);
    expect(isRubric({ criteria: [] })).toBe(false);
    expect(isRubric({ criteria: [{ id: 1, maxPoints: 5 }] })).toBe(false);
    expect(isRubric(rubric)).toBe(true);
  });

  it('clamps over-awarded criteria', () => {
    const result = scoreRubric(rubric, { a: 999, b: 999 }, 100);
    expect(result.earned).toBe(100);
    expect(result.points).toBe(100);
  });

  it('treats missing awards as zero', () => {
    const result = scoreRubric(rubric, {}, 100);
    expect(result.earned).toBe(0);
    expect(result.points).toBe(0);
  });

  it('ignores awards for unknown criterion ids', () => {
    const result = scoreRubric(rubric, { a: 40, b: 60, ghost: 1000 }, 100);
    expect(result.earned).toBe(100);
  });

  it('handles stringy numbers from form inputs', () => {
    const result = scoreRubric(rubric, { a: '20', b: '30' } as any, 100);
    expect(result.earned).toBe(50);
    expect(result.points).toBe(50);
  });

  it('handles NaN / Infinity awards as zero', () => {
    const result = scoreRubric(rubric, { a: NaN, b: Infinity }, 100);
    expect(result.earned).toBe(0);
  });

  it('scales to a different points_possible than the rubric total', () => {
    const result = scoreRubric(rubric, { a: 20, b: 30 }, 50);
    expect(result.possible).toBe(100);
    expect(result.points).toBe(25);
  });

  it('returns 0 percentage for a zero-point rubric rather than NaN', () => {
    const empty = { criteria: [{ id: 'x', name: 'X', maxPoints: 0 }] };
    const result = scoreRubric(empty, { x: 0 }, 10);
    expect(result.percentage).toBe(0);
    expect(Number.isFinite(result.points)).toBe(true);
  });

  it('totalPossible ignores negative maxPoints', () => {
    const weird = {
      criteria: [
        { id: 'a', name: 'A', maxPoints: -10 },
        { id: 'b', name: 'B', maxPoints: 20 },
      ],
    };
    expect(totalPossible(weird)).toBe(20);
  });
});

describe('achievements — catalogue integrity', () => {
  it('every achievement has a unique type', () => {
    const types = ACHIEVEMENTS.map((a) => a.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('thresholds are strictly ascending', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.levels.bronze.threshold).toBeGreaterThan(0);
      expect(a.levels.silver.threshold).toBeGreaterThan(a.levels.bronze.threshold);
      expect(a.levels.gold.threshold).toBeGreaterThan(a.levels.silver.threshold);
      expect(a.levels.platinum.threshold).toBeGreaterThan(a.levels.gold.threshold);
    }
  });

  it('highestLevelFor never returns a level below a metric that qualifies', () => {
    for (const a of ACHIEVEMENTS) {
      const { bronze, silver, gold, platinum } = a.levels;
      expect(highestLevelFor(a, bronze.threshold - 0.001)).toBeNull();
      expect(highestLevelFor(a, bronze.threshold)).toBe('bronze');
      expect(highestLevelFor(a, silver.threshold)).toBe('silver');
      expect(highestLevelFor(a, gold.threshold)).toBe('gold');
      expect(highestLevelFor(a, platinum.threshold)).toBe('platinum');
      expect(highestLevelFor(a, platinum.threshold + 1000)).toBe('platinum');
    }
  });

  it('metricFor returns a finite number for every achievement against empty metrics', () => {
    const empty: AchievementMetrics = {
      perspectivesCount: 0,
      likesReceived: 0,
      scenariosCreated: 0,
      ratingsGiven: 0,
      avgQualityScore: 0,
      uniqueFrameworks: 0,
    };
    for (const a of ACHIEVEMENTS) {
      const value = metricFor(a, empty);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

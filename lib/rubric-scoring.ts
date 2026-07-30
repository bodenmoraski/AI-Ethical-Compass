export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  description?: string;
}

export interface Rubric {
  criteria: RubricCriterion[];
}

export interface RubricResult {
  /** Points awarded across all criteria, clamped to each criterion's maximum. */
  earned: number;
  /** Sum of every criterion's maxPoints. */
  possible: number;
  /** earned / possible as a 0-100 percentage (0 when the rubric has no points). */
  percentage: number;
  /** The percentage applied to the assignment's points_possible, rounded. */
  points: number;
  perCriterion: Array<{ id: string; name: string; awarded: number; maxPoints: number }>;
}

function toFiniteNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function isRubric(value: unknown): value is Rubric {
  if (!value || typeof value !== 'object') return false;
  const criteria = (value as Rubric).criteria;
  return (
    Array.isArray(criteria) &&
    criteria.length > 0 &&
    criteria.every(
      (criterion) =>
        criterion &&
        typeof criterion === 'object' &&
        typeof criterion.id === 'string' &&
        Number.isFinite(Number(criterion.maxPoints))
    )
  );
}

export function totalPossible(rubric: Rubric): number {
  return rubric.criteria.reduce(
    (sum, criterion) => sum + Math.max(0, toFiniteNumber(criterion.maxPoints)),
    0
  );
}

/**
 * Scores a submission against a rubric.
 *
 * Teachers award raw points per criterion. Anything missing counts as zero, and
 * awards above a criterion's maximum are clamped so a single criterion can never
 * inflate the total.
 */
export function scoreRubric(
  rubric: Rubric,
  awarded: Record<string, unknown>,
  pointsPossible?: number
): RubricResult {
  const perCriterion = rubric.criteria.map((criterion) => {
    const maxPoints = Math.max(0, toFiniteNumber(criterion.maxPoints));
    const raw = Math.max(0, toFiniteNumber(awarded?.[criterion.id]));
    return {
      id: criterion.id,
      name: criterion.name,
      awarded: Math.min(raw, maxPoints),
      maxPoints,
    };
  });

  const earned = perCriterion.reduce((sum, entry) => sum + entry.awarded, 0);
  const possible = perCriterion.reduce((sum, entry) => sum + entry.maxPoints, 0);
  const percentage = possible > 0 ? (earned / possible) * 100 : 0;
  const scale = Number.isFinite(Number(pointsPossible)) ? Number(pointsPossible) : possible;

  return {
    earned,
    possible,
    percentage: Math.round(percentage * 100) / 100,
    points: Math.round((percentage / 100) * scale),
    perCriterion,
  };
}

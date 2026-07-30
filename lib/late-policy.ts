export interface LatePenaltyResult {
  /** Score after the penalty, never below zero. */
  score: number;
  applied: boolean;
  daysLate: number;
  /** Points actually removed (clamped by the floor at zero). */
  deducted: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Deducts an assignment's configured late penalty from an earned score.
 *
 * The penalty is a percentage of the assignment total per day late. A partial day
 * counts as a full day, matching how teachers describe "one day late".
 */
export function applyLatePenalty(
  submission: { is_late?: boolean | null; submitted_at?: string | null },
  assignment: {
    due_date?: string | null;
    points_possible: number;
    late_penalty_per_day?: number | null;
  },
  earned: number
): LatePenaltyResult {
  const perDay = Number(assignment.late_penalty_per_day) || 0;
  const none: LatePenaltyResult = { score: earned, applied: false, daysLate: 0, deducted: 0 };

  if (!submission.is_late || perDay <= 0 || !assignment.due_date || !submission.submitted_at) {
    return none;
  }

  const msLate =
    new Date(submission.submitted_at).getTime() - new Date(assignment.due_date).getTime();
  if (!Number.isFinite(msLate) || msLate <= 0) return none;

  const daysLate = Math.ceil(msLate / MS_PER_DAY);
  const penalty = Math.round((perDay / 100) * assignment.points_possible * daysLate);
  const score = Math.max(0, earned - penalty);

  return { score, applied: true, daysLate, deducted: earned - score };
}

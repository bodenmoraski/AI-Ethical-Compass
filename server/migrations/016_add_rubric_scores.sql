-- Migration 016: Persist per-criterion rubric grades
-- Purpose: assignments.rubric already stores the criteria a teacher authors, but there
-- was nowhere to store the points awarded per criterion, so a rubric grade collapsed
-- into a single opaque number. This column keeps the breakdown alongside the score.

ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS rubric_scores JSONB;

COMMENT ON COLUMN assignment_submissions.rubric_scores IS
  'Array of {id, name, awarded, maxPoints} produced by lib/rubric-scoring.ts';

-- Grading views filter to a teacher's ungraded work constantly.
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_status
  ON assignment_submissions(assignment_id, status);

-- The moderation queue is read by status on every teacher dashboard load.
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status
  ON moderation_queue(status);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_class
  ON moderation_queue(class_id);

-- =============================================================================
-- PASTE THIS INTO SUPABASE → SQL Editor → Run
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- Covers migrations 016 + 017 from this release.
-- =============================================================================

-- 016: Persist per-criterion rubric grades + hot indexes for grading/moderation
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS rubric_scores JSONB;

COMMENT ON COLUMN assignment_submissions.rubric_scores IS
  'Array of {id, name, awarded, maxPoints} produced by lib/rubric-scoring.ts';

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_status
  ON assignment_submissions(assignment_id, status);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status
  ON moderation_queue(status);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_class
  ON moderation_queue(class_id);

-- 017: Composite indexes for notifications, activity, ratings, votes, late work
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications(recipient_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_realtime_activities_class_time
  ON realtime_activities(class_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_perspective_ratings_perspective_user
  ON perspective_ratings(perspective_id, user_email);

CREATE INDEX IF NOT EXISTS idx_scenario_votes_scenario_user
  ON scenario_votes(scenario_id, user_email);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_late
  ON assignment_submissions(assignment_id, is_late)
  WHERE is_late = true;

-- Sanity check: these should all return true / a row
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assignment_submissions' AND column_name = 'rubric_scores'
  ) AS has_rubric_scores,
  EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_recipient_unread'
  ) AS has_notifications_index,
  EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_submissions_assignment_status'
  ) AS has_submissions_index;

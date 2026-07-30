-- Migration 017: composite indexes for hot read paths found during overnight validation.
-- Safe to re-run (IF NOT EXISTS).

-- Notifications list + unread count: always filtered by recipient, often by is_read.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications(recipient_id, is_read, created_at DESC);

-- Classroom activity feed is polled by class + recency.
CREATE INDEX IF NOT EXISTS idx_realtime_activities_class_time
  ON realtime_activities(class_id, timestamp DESC);

-- Perspective ratings looked up by (perspective, rater) on every re-rate.
CREATE INDEX IF NOT EXISTS idx_perspective_ratings_perspective_user
  ON perspective_ratings(perspective_id, user_email);

-- Scenario votes looked up by (scenario, voter) on every re-vote.
CREATE INDEX IF NOT EXISTS idx_scenario_votes_scenario_user
  ON scenario_votes(scenario_id, user_email);

-- Late-submission queries filter by assignment + is_late.
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_late
  ON assignment_submissions(assignment_id, is_late)
  WHERE is_late = true;

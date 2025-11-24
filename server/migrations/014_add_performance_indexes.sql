-- Migration 014: Add Performance Indexes
-- Created: 2025-11-18
-- Purpose: Add missing indexes to improve query performance

-- Index on assignments.is_published (for filtering published assignments)
CREATE INDEX IF NOT EXISTS idx_assignments_is_published 
  ON assignments(is_published);

-- Index on assignment_submissions.status (for filtering by submission status)
CREATE INDEX IF NOT EXISTS idx_submissions_status 
  ON assignment_submissions(status);

-- Index on class_enrollments.status (for filtering active enrollments)
CREATE INDEX IF NOT EXISTS idx_enrollments_status 
  ON class_enrollments(status);

-- Index on notifications.is_read (for filtering unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON notifications(is_read);

-- Index on notifications.recipient_id (for user notification queries)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
  ON notifications(recipient_id);

-- Composite index for common assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_class_published 
  ON assignments(class_id, is_published);

-- Composite index for common enrollment queries
CREATE INDEX IF NOT EXISTS idx_enrollments_student_status 
  ON class_enrollments(student_id, status);

-- Index on assignment_submissions for grading queries
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by 
  ON assignment_submissions(graded_by) WHERE graded_by IS NOT NULL;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 014 complete: Added 8 performance indexes';
END $$;


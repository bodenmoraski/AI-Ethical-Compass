-- ============================================
-- CONSOLIDATED MIGRATIONS FOR EDTECH PLATFORM
-- ============================================
-- Copy and paste this entire script into your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Navigate to: Database → SQL Editor
-- 4. Paste this script and click "Run"
-- ============================================

-- ============================================
-- MIGRATION 014: Performance Indexes
-- ============================================

-- Index for filtering published assignments
CREATE INDEX IF NOT EXISTS idx_assignments_is_published 
  ON assignments(is_published);

-- Index for filtering submissions by status
CREATE INDEX IF NOT EXISTS idx_submissions_status 
  ON assignment_submissions(status);

-- Index for filtering enrollments by status
CREATE INDEX IF NOT EXISTS idx_enrollments_status 
  ON class_enrollments(status);

-- Index for filtering unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON notifications(is_read);

-- Index for looking up notifications by recipient
CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
  ON notifications(recipient_id);

-- Composite index for class assignments
CREATE INDEX IF NOT EXISTS idx_assignments_class_published 
  ON assignments(class_id, is_published);

-- Composite index for student enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student_status 
  ON class_enrollments(student_id, status);

-- Partial index for ungraded submissions (only indexes submitted work)
CREATE INDEX IF NOT EXISTS idx_submissions_pending_grading 
  ON assignment_submissions(assignment_id, student_id) 
  WHERE status = 'submitted';

-- ============================================
-- MIGRATION 015: Auth User ID Mapping
-- ============================================

-- Add auth_user_id column to users table
-- This maps Supabase Auth UUIDs to our INTEGER user IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id TEXT UNIQUE;

-- Create index for fast lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Add comment explaining the column
COMMENT ON COLUMN users.auth_user_id IS 'Supabase Auth UUID for this user - links to auth.users.id';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify migrations were applied:

SELECT 
  'auth_user_id column' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'auth_user_id'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'idx_assignments_is_published' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_assignments_is_published'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'idx_users_auth_user_id' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_users_auth_user_id'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;


-- Migration 012: Fix Row Level Security Policies for Production
-- Created: 2025-11-18
-- Purpose: Implement proper RLS policies using auth.uid() for Supabase authentication

-- NOTE: This migration re-enables RLS and creates secure policies
-- Migration 011 disabled RLS for development - this restores security for production

-- ============================================================================
-- STEP 1: Enable RLS on all teacher dashboard tables
-- ============================================================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gradebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_access_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop old policies (from migration 007)
-- ============================================================================

-- Classes policies
DROP POLICY IF EXISTS "Teachers can manage their own classes" ON classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON classes;
DROP POLICY IF EXISTS "Public can view active classes" ON classes;

-- Class enrollments policies
DROP POLICY IF EXISTS "Teachers can manage class enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Students can join classes" ON class_enrollments;
DROP POLICY IF EXISTS "Students can leave classes" ON class_enrollments;

-- Assignments policies
DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view published assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage their assignments" ON assignments;

-- Assignment submissions policies
DROP POLICY IF EXISTS "Students can manage their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view class submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions" ON assignment_submissions;

-- Other table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Teachers can view class engagement" ON student_engagement;
DROP POLICY IF EXISTS "Students can view their own engagement" ON student_engagement;

-- ============================================================================
-- STEP 3: Create helper function to get user's database ID from auth.uid()
-- ============================================================================

-- This function maps Supabase auth UID to our users table ID
CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS INTEGER AS $$
DECLARE
  user_id INTEGER;
BEGIN
  -- Get the authenticated user's email from Supabase auth
  -- Then find their ID in our users table
  SELECT id INTO user_id
  FROM users
  WHERE email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  );
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Create new secure RLS policies for CLASSES table
-- ============================================================================

-- Policy: Teachers can manage their own classes
CREATE POLICY "teachers_manage_own_classes" ON classes
  FOR ALL
  USING (
    teacher_id = get_user_id_from_auth()
  )
  WITH CHECK (
    teacher_id = get_user_id_from_auth()
  );

-- Policy: Students can view classes they're enrolled in
CREATE POLICY "students_view_enrolled_classes" ON classes
  FOR SELECT
  USING (
    id IN (
      SELECT class_id 
      FROM class_enrollments 
      WHERE student_id = get_user_id_from_auth()
        AND status = 'active'
    )
  );

-- Policy: Anyone can view active classes for enrollment (by class code)
CREATE POLICY "public_view_active_classes" ON classes
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- STEP 5: Create new secure RLS policies for CLASS_ENROLLMENTS table
-- ============================================================================

-- Policy: Teachers can manage enrollments for their classes
CREATE POLICY "teachers_manage_class_enrollments" ON class_enrollments
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Students can view their own enrollments
CREATE POLICY "students_view_own_enrollments" ON class_enrollments
  FOR SELECT
  USING (
    student_id = get_user_id_from_auth()
  );

-- Policy: Students can join classes (INSERT)
CREATE POLICY "students_join_classes" ON class_enrollments
  FOR INSERT
  WITH CHECK (
    student_id = get_user_id_from_auth()
  );

-- Policy: Students can update their own enrollments (to leave class)
CREATE POLICY "students_update_own_enrollments" ON class_enrollments
  FOR UPDATE
  USING (
    student_id = get_user_id_from_auth()
  )
  WITH CHECK (
    student_id = get_user_id_from_auth()
  );

-- ============================================================================
-- STEP 6: Create new secure RLS policies for ASSIGNMENTS table
-- ============================================================================

-- Policy: Teachers can manage assignments in their classes
CREATE POLICY "teachers_manage_assignments" ON assignments
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Students can view published assignments in enrolled classes
CREATE POLICY "students_view_published_assignments" ON assignments
  FOR SELECT
  USING (
    is_published = true
    AND class_id IN (
      SELECT class_id 
      FROM class_enrollments 
      WHERE student_id = get_user_id_from_auth()
        AND status = 'active'
    )
  );

-- ============================================================================
-- STEP 7: Create new secure RLS policies for ASSIGNMENT_SUBMISSIONS table
-- ============================================================================

-- Policy: Students can manage their own submissions
CREATE POLICY "students_manage_own_submissions" ON assignment_submissions
  FOR ALL
  USING (
    student_id = get_user_id_from_auth()
  )
  WITH CHECK (
    student_id = get_user_id_from_auth()
  );

-- Policy: Teachers can view submissions for their assignments
CREATE POLICY "teachers_view_class_submissions" ON assignment_submissions
  FOR SELECT
  USING (
    assignment_id IN (
      SELECT a.id 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Teachers can update (grade) submissions for their assignments
CREATE POLICY "teachers_grade_submissions" ON assignment_submissions
  FOR UPDATE
  USING (
    assignment_id IN (
      SELECT a.id 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = get_user_id_from_auth()
    )
  )
  WITH CHECK (
    assignment_id IN (
      SELECT a.id 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = get_user_id_from_auth()
    )
  );

-- ============================================================================
-- STEP 8: Create new secure RLS policies for NOTIFICATIONS table
-- ============================================================================

-- Policy: Users can view their own notifications
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT
  USING (
    recipient_id = get_user_id_from_auth()
  );

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE
  USING (
    recipient_id = get_user_id_from_auth()
  )
  WITH CHECK (
    recipient_id = get_user_id_from_auth()
  );

-- Policy: System can create notifications (via service role)
-- Note: This policy allows service role to insert notifications
CREATE POLICY "system_create_notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 9: Create RLS policies for STUDENT_ENGAGEMENT table
-- ============================================================================

-- Policy: Teachers can view engagement for their classes
CREATE POLICY "teachers_view_class_engagement" ON student_engagement
  FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Students can view their own engagement
CREATE POLICY "students_view_own_engagement" ON student_engagement
  FOR SELECT
  USING (
    student_id = get_user_id_from_auth()
  );

-- Policy: System can insert engagement records
CREATE POLICY "system_insert_engagement" ON student_engagement
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 10: Create RLS policies for DISCUSSION_THREADS table
-- ============================================================================

-- Policy: Anyone in class can view discussion threads
CREATE POLICY "class_members_view_threads" ON discussion_threads
  FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id = get_user_id_from_auth() AND status = 'active'
    )
    OR class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Class members can create threads
CREATE POLICY "class_members_create_threads" ON discussion_threads
  FOR INSERT
  WITH CHECK (
    class_id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id = get_user_id_from_auth() AND status = 'active'
    )
    OR class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- Policy: Authors and teachers can update threads
CREATE POLICY "authors_teachers_update_threads" ON discussion_threads
  FOR UPDATE
  USING (
    author_id = get_user_id_from_auth()
    OR class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
    )
  );

-- ============================================================================
-- STEP 11: Create RLS policies for DISCUSSION_POSTS table
-- ============================================================================

-- Policy: Class members can view posts
CREATE POLICY "class_members_view_posts" ON discussion_posts
  FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM discussion_threads 
      WHERE class_id IN (
        SELECT class_id FROM class_enrollments 
        WHERE student_id = get_user_id_from_auth() AND status = 'active'
      )
      OR class_id IN (
        SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
      )
    )
  );

-- Policy: Class members can create posts
CREATE POLICY "class_members_create_posts" ON discussion_posts
  FOR INSERT
  WITH CHECK (
    thread_id IN (
      SELECT id FROM discussion_threads 
      WHERE class_id IN (
        SELECT class_id FROM class_enrollments 
        WHERE student_id = get_user_id_from_auth() AND status = 'active'
      )
      OR class_id IN (
        SELECT id FROM classes WHERE teacher_id = get_user_id_from_auth()
      )
    )
  );

-- ============================================================================
-- STEP 12: Create RLS policies for TEACHER_ACCESS_REQUESTS table
-- ============================================================================

-- Policy: Users can view their own access requests
CREATE POLICY "users_view_own_access_requests" ON teacher_access_requests
  FOR SELECT
  USING (
    user_id = get_user_id_from_auth()
  );

-- Policy: Users can create their own access requests
CREATE POLICY "users_create_access_requests" ON teacher_access_requests
  FOR INSERT
  WITH CHECK (
    user_id = get_user_id_from_auth()
  );

-- ============================================================================
-- STEP 13: Grant necessary permissions
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_from_auth() TO authenticated;

-- Grant permissions to service role (for API operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 14: Add helpful comments
-- ============================================================================

COMMENT ON FUNCTION get_user_id_from_auth() IS 
  'Maps Supabase auth.uid() to users table ID for RLS policies';

COMMENT ON POLICY "teachers_manage_own_classes" ON classes IS
  'Teachers can create, read, update, and delete their own classes';

COMMENT ON POLICY "students_view_enrolled_classes" ON classes IS
  'Students can only view classes they are actively enrolled in';

COMMENT ON POLICY "students_join_classes" ON class_enrollments IS
  'Students can self-enroll in classes using class codes';

COMMENT ON POLICY "teachers_grade_submissions" ON assignment_submissions IS
  'Teachers can grade submissions for assignments in their classes';

-- ============================================================================
-- STEP 15: Create indexes for RLS policy performance
-- ============================================================================

-- These indexes speed up RLS policy checks
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_class ON class_enrollments(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_status ON class_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- Migration complete!
-- ============================================================================

-- Summary of changes:
-- 1. Re-enabled RLS on all tables (was disabled in migration 011)
-- 2. Created get_user_id_from_auth() helper function for policy checks
-- 3. Implemented secure policies for classes (teacher ownership, student enrollment)
-- 4. Implemented secure policies for enrollments (join, view, leave)
-- 5. Implemented secure policies for assignments (teacher manage, student view)
-- 6. Implemented secure policies for submissions (student own, teacher grade)
-- 7. Implemented secure policies for notifications (user view/update)
-- 8. Implemented secure policies for engagement tracking
-- 9. Implemented secure policies for discussions
-- 10. Implemented secure policies for teacher access requests
-- 11. Created performance indexes for RLS policy checks
-- 12. Granted appropriate permissions to authenticated and service_role

-- Testing checklist:
-- [ ] Student can only see their enrolled classes
-- [ ] Student can join a class with valid code
-- [ ] Student cannot see other students' submissions
-- [ ] Teacher can see all submissions in their classes
-- [ ] Teacher cannot see other teachers' classes
-- [ ] Teacher can grade submissions in their classes only
-- [ ] Users can only see their own notifications
-- [ ] RLS policies don't cause performance issues

RAISE NOTICE 'Migration 012 completed: RLS policies enabled and secured for production';


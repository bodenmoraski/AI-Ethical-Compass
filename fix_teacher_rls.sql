-- Fix RLS policies for teacher dashboard tables
-- This resolves the infinite recursion issue

-- Disable RLS on teacher-related tables for now to allow API access
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_engagement DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE gradebook_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_relationships DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on core tables that might be causing issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE perspectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- Keep teacher_access_requests RLS enabled but with simpler policies
ALTER TABLE teacher_access_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing complex policies
DROP POLICY IF EXISTS teacher_access_requests_own_select ON teacher_access_requests;
DROP POLICY IF EXISTS teacher_access_requests_own_insert ON teacher_access_requests;
DROP POLICY IF EXISTS teacher_access_requests_admin_all ON teacher_access_requests;

-- Create simpler policies
CREATE POLICY teacher_access_requests_select ON teacher_access_requests
    FOR SELECT USING (true);

CREATE POLICY teacher_access_requests_insert ON teacher_access_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY teacher_access_requests_update ON teacher_access_requests
    FOR UPDATE USING (true);

-- Also fix role_change_log policies
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS role_change_log_own_select ON role_change_log;
DROP POLICY IF EXISTS role_change_log_admin_select ON role_change_log;
DROP POLICY IF EXISTS role_change_log_admin_insert ON role_change_log;

CREATE POLICY role_change_log_select ON role_change_log
    FOR SELECT USING (true);

CREATE POLICY role_change_log_insert ON role_change_log
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to the authenticated role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 
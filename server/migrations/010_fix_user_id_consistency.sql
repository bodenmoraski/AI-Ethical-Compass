-- Migration 010: Fix user_id type consistency and complete perspectives table

-- First, temporarily disable RLS to allow schema changes
ALTER TABLE teacher_access_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE perspectives DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints that reference INTEGER user_id
ALTER TABLE teacher_access_requests DROP CONSTRAINT IF EXISTS teacher_access_requests_user_id_fkey;
ALTER TABLE role_change_log DROP CONSTRAINT IF EXISTS role_change_log_user_id_fkey;
ALTER TABLE role_change_log DROP CONSTRAINT IF EXISTS role_change_log_updated_by_fkey;

-- Drop policies that depend on user_id columns
DROP POLICY IF EXISTS "teacher_access_requests_own_select" ON teacher_access_requests;
DROP POLICY IF EXISTS "teacher_access_requests_own_insert" ON teacher_access_requests;
DROP POLICY IF EXISTS "teacher_access_requests_admin_all" ON teacher_access_requests;
DROP POLICY IF EXISTS "role_change_log_own_select" ON role_change_log;
DROP POLICY IF EXISTS "role_change_log_admin_select" ON role_change_log;
DROP POLICY IF EXISTS "role_change_log_admin_insert" ON role_change_log;

-- Change user_id columns from INTEGER to TEXT for Supabase Auth UUID compatibility
ALTER TABLE teacher_access_requests ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE teacher_access_requests ALTER COLUMN reviewed_by TYPE TEXT;
ALTER TABLE role_change_log ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE role_change_log ALTER COLUMN updated_by TYPE TEXT;

-- Add missing columns to perspectives table
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update perspectives table user_id to TEXT if it's still INTEGER (defensive programming)
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perspectives' 
        AND column_name = 'user_id' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE perspectives ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_perspectives_moderation_status ON perspectives(moderation_status);
CREATE INDEX IF NOT EXISTS idx_perspectives_likes ON perspectives(likes);
CREATE INDEX IF NOT EXISTS idx_perspectives_updated_at ON perspectives(updated_at);

-- Add trigger for perspectives updated_at
DROP TRIGGER IF EXISTS update_perspectives_updated_at ON perspectives;
CREATE TRIGGER update_perspectives_updated_at
    BEFORE UPDATE ON perspectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Re-enable RLS and recreate policies
ALTER TABLE teacher_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE perspectives ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for teacher_access_requests with email-based auth
CREATE POLICY "teacher_access_requests_own_select" ON teacher_access_requests
    FOR SELECT USING (
        user_id = auth.uid()::TEXT
    );

CREATE POLICY "teacher_access_requests_own_insert" ON teacher_access_requests
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::TEXT
    );

CREATE POLICY "teacher_access_requests_admin_all" ON teacher_access_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::TEXT = auth.uid()::TEXT
            AND role = 'admin'
        )
    );

-- Recreate RLS policies for role_change_log
CREATE POLICY "role_change_log_own_select" ON role_change_log
    FOR SELECT USING (
        user_id = auth.uid()::TEXT
    );

CREATE POLICY "role_change_log_admin_select" ON role_change_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::TEXT = auth.uid()::TEXT
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "role_change_log_admin_insert" ON role_change_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::TEXT = auth.uid()::TEXT
            AND role = 'admin'
        )
    );

-- Create RLS policies for perspectives table
CREATE POLICY "perspectives_public_read" ON perspectives
    FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "perspectives_insert_auth" ON perspectives
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "perspectives_update_own" ON perspectives
    FOR UPDATE USING (user_id = auth.uid()::TEXT);

-- Create function to handle auto-moderation for development
CREATE OR REPLACE FUNCTION check_perspective_content(content TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Check for development bypass keyword
    IF content LIKE '%{DEVYES}%' THEN
        RETURN 'approved';
    END IF;
    
    -- Basic content validation (can be expanded)
    IF LENGTH(content) < 10 THEN
        RETURN 'rejected';
    END IF;
    
    -- Default to pending for human review
    RETURN 'pending';
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the fix
COMMENT ON TABLE perspectives IS 'User perspectives on ethical scenarios - now with proper TEXT user_id for Supabase Auth';
COMMENT ON TABLE teacher_access_requests IS 'Teacher access requests - updated to use TEXT user_id for Supabase Auth';
COMMENT ON TABLE role_change_log IS 'Role change audit log - updated to use TEXT user_id for Supabase Auth'; 
-- Migration 011: Consolidate remaining fixes from standalone scripts

-- 1. Fix user_likes table (from fix_user_likes_table.sql)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_likes' 
        AND column_name = 'user_id' 
        AND data_type = 'integer'
    ) THEN
        -- Drop foreign key constraint first
        ALTER TABLE user_likes DROP CONSTRAINT IF EXISTS user_likes_user_id_fkey;
        
        -- Change user_id column from INTEGER to TEXT
        ALTER TABLE user_likes ALTER COLUMN user_id TYPE TEXT;
        
        -- Clean up any invalid data
        UPDATE user_likes SET user_id = NULL WHERE user_id = '' OR user_id = '0';
        
        RAISE NOTICE 'Fixed user_likes.user_id column type to TEXT';
    END IF;
END $$;

-- 2. Fix realtime_activities table (from fix_realtime_uuid.sql) 
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'realtime_activities'
    ) THEN
        -- Clear existing data since we can't safely convert UUID to TEXT
        TRUNCATE TABLE realtime_activities;
        
        -- Change columns to TEXT
        ALTER TABLE realtime_activities 
          ALTER COLUMN user_id TYPE TEXT,
          ALTER COLUMN created_by TYPE TEXT;
        
        -- Update constraints
        ALTER TABLE realtime_activities 
          DROP CONSTRAINT IF EXISTS realtime_activities_type_check,
          DROP CONSTRAINT IF EXISTS realtime_activities_priority_check;

        ALTER TABLE realtime_activities 
          ADD CONSTRAINT realtime_activities_type_check 
          CHECK (type IN ('discussion', 'submission', 'engagement', 'notification')),
          ADD CONSTRAINT realtime_activities_priority_check 
          CHECK (priority IN ('low', 'medium', 'high'));

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_realtime_activities_class_id ON realtime_activities(class_id);
        CREATE INDEX IF NOT EXISTS idx_realtime_activities_user_id ON realtime_activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_realtime_activities_timestamp ON realtime_activities(timestamp);
        
        RAISE NOTICE 'Fixed realtime_activities table UUID columns';
    END IF;
END $$;

-- 3. Add first_name and last_name columns to users table (from add_user_name_columns.sql)
DO $$ 
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
    
    -- Update first_name and last_name from existing name field
    UPDATE users 
    SET 
        first_name = CASE 
            WHEN name IS NOT NULL AND name != '' THEN 
                SPLIT_PART(name, ' ', 1)
            ELSE NULL
        END,
        last_name = CASE 
            WHEN name IS NOT NULL AND name != '' AND POSITION(' ' IN name) > 0 THEN 
                SUBSTRING(name FROM POSITION(' ' IN name) + 1)
            ELSE NULL
        END
    WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL;
    
    RAISE NOTICE 'Added first_name and last_name columns to users table';
END $$;

-- 4. Disable RLS on teacher dashboard tables for development (from fix_teacher_rls.sql)
-- Note: This is more comprehensive than what's in migration 010
DO $$
DECLARE
    tbl_name TEXT;
    table_names TEXT[] := ARRAY[
        'classes', 'class_enrollments', 'assignments', 'assignment_submissions',
        'student_engagement', 'discussion_threads', 'discussion_posts',
        'gradebook_entries', 'notifications', 'moderation_queue',
        'assignment_templates', 'class_groups', 'group_memberships',
        'parent_relationships', 'users', 'scenarios', 'replies',
        'user_progress', 'audit_log', 'user_likes', 'user_scenario_progress'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY table_names
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name AND table_schema = 'public'
        ) THEN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Disabled RLS on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments
COMMENT ON COLUMN users.first_name IS 'First name of the user';
COMMENT ON COLUMN users.last_name IS 'Last name of the user';

-- Migration completed: Consolidates remaining fixes from standalone SQL scripts - user_likes, realtime_activities, user names, and comprehensive RLS disabling 
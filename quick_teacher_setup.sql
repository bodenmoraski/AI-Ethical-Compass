-- Quick Teacher Setup Script
-- Run this directly in your Supabase SQL Editor

-- 1. Create user_role enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'teacher');
    ELSE
        -- Add teacher to existing enum if not present
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'teacher' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
        ) THEN
            ALTER TYPE user_role ADD VALUE 'teacher';
        END IF;
    END IF;
END $$;

-- 2. Convert users table role column to use enum (if it's currently TEXT)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Remove default constraint, convert type, add back default
        ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role;
    END IF;
END $$;

-- 3. Create teacher access requests table (simplified without RLS for now)
CREATE TABLE IF NOT EXISTS teacher_access_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    institution_name TEXT,
    institution_type TEXT,
    department TEXT,
    request_reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create role change log table (simplified)
CREATE TABLE IF NOT EXISTS role_change_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    previous_role TEXT,
    new_role TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_access_requests_user ON teacher_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_access_requests_status ON teacher_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_change_log_user ON role_change_log(user_id);

-- 6. Grant teacher role to current users (optional - uncomment to make existing users teachers)
-- UPDATE users SET role = 'teacher' WHERE email = 'your-email@example.com';

-- Success message
SELECT 'Teacher role setup completed successfully!' as message; 
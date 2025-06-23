-- Migration 008: Add Teacher Role and Access Request System

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
    END IF;
END $$;

-- Add 'teacher' to the enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'teacher' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'teacher';
    END IF;
END $$;

-- Convert the role column from TEXT to user_role enum if needed
DO $$ BEGIN
    -- Check if the column is already using the enum type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- First, remove the default constraint
        ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
        
        -- Convert existing role column to use the enum
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
        
        -- Add back the default constraint with the proper enum value
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role;
    END IF;
END $$;

-- Create teacher access requests table
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

-- Create role change log table for audit trail
CREATE TABLE IF NOT EXISTS role_change_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    previous_role TEXT,
    new_role TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_access_requests_user ON teacher_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_access_requests_status ON teacher_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_change_log_user ON role_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_log_date ON role_change_log(created_at);

-- Add Row Level Security policies for teacher access requests
ALTER TABLE teacher_access_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests (using email for auth matching)
CREATE POLICY teacher_access_requests_own_select ON teacher_access_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = teacher_access_requests.user_id 
            AND email = auth.email()
        )
    );

-- Users can create their own requests  
CREATE POLICY teacher_access_requests_own_insert ON teacher_access_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id 
            AND email = auth.email()
        )
    );

-- Admins can see and modify all requests
CREATE POLICY teacher_access_requests_admin_all ON teacher_access_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.email()
            AND role = 'admin'
        )
    );

-- Add RLS policies for role change log
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own role changes (using email for auth matching)
CREATE POLICY role_change_log_own_select ON role_change_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = role_change_log.user_id 
            AND email = auth.email()
        )
    );

-- Admins can see all role changes
CREATE POLICY role_change_log_admin_select ON role_change_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.email()
            AND role IN ('admin', 'moderator')
        )
    );

-- Admins can insert role change records
CREATE POLICY role_change_log_admin_insert ON role_change_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.email()
            AND role = 'admin'
        )
    );

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to teacher_access_requests table
DROP TRIGGER IF EXISTS update_teacher_access_requests_updated_at ON teacher_access_requests;
CREATE TRIGGER update_teacher_access_requests_updated_at
    BEFORE UPDATE ON teacher_access_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE teacher_access_requests IS 'Stores requests from users to gain teacher permissions';
COMMENT ON TABLE role_change_log IS 'Audit trail for all user role changes';

-- Create a function to safely request teacher access
CREATE OR REPLACE FUNCTION request_teacher_access(
    request_user_id INTEGER,
    inst_name TEXT DEFAULT NULL,
    inst_type TEXT DEFAULT NULL,
    dept TEXT DEFAULT NULL,
    reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    existing_request_count INTEGER;
    new_request_id INTEGER;
    user_current_role TEXT;
BEGIN
    -- Check if user exists and get current role
    SELECT role INTO user_current_role 
    FROM users 
    WHERE id = request_user_id;
    
    IF user_current_role IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Check if user already has teacher access
    IF user_current_role = 'teacher' THEN
        RETURN json_build_object('success', false, 'message', 'User already has teacher access');
    END IF;
    
    -- Check for existing pending requests
    SELECT COUNT(*) INTO existing_request_count
    FROM teacher_access_requests
    WHERE user_id = request_user_id AND status = 'pending';
    
    IF existing_request_count > 0 THEN
        RETURN json_build_object('success', false, 'message', 'Pending request already exists');
    END IF;
    
    -- Create new request
    INSERT INTO teacher_access_requests (
        user_id, 
        institution_name, 
        institution_type, 
        department, 
        request_reason
    ) VALUES (
        request_user_id, 
        inst_name, 
        inst_type, 
        dept, 
        COALESCE(reason, 'Teacher access requested')
    ) RETURNING id INTO new_request_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Teacher access request submitted successfully',
        'request_id', new_request_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Migration 015: Add auth_user_id column for Supabase Auth UUID mapping
-- This creates a proper mapping between Supabase Auth UUIDs and our INTEGER user IDs

-- Add auth_user_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id TEXT UNIQUE;

-- Create index for fast lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Add comment explaining the column
COMMENT ON COLUMN users.auth_user_id IS 'Supabase Auth UUID for this user - links to auth.users.id';

-- Create a function to get user by auth_user_id
CREATE OR REPLACE FUNCTION get_user_by_auth_id(p_auth_user_id TEXT)
RETURNS TABLE (
  id INTEGER,
  email TEXT,
  name TEXT,
  username TEXT,
  role TEXT,
  auth_user_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.username,
    u.role,
    u.auth_user_id
  FROM users u
  WHERE u.auth_user_id = p_auth_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to link an existing user to an auth user
CREATE OR REPLACE FUNCTION link_user_to_auth(p_user_id INTEGER, p_auth_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET auth_user_id = p_auth_user_id
  WHERE id = p_user_id
  AND auth_user_id IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


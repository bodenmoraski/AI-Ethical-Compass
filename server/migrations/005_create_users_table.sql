-- Migration: Create users table for user profiles
-- This creates the users table that was missing

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  username TEXT UNIQUE NOT NULL,
  institution_name TEXT,
  institution_type TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add RLS (Row Level Security) policies if needed
-- Note: These might need to be adjusted based on your security requirements
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = email);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = email);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = email); 
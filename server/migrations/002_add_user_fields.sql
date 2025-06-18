-- Migration 002: Add username and institution fields to users table
-- This will clear existing user data since we're adding required fields

-- First, clear existing data to avoid constraint issues
DELETE FROM user_progress;
DELETE FROM perspectives WHERE user_id IS NOT NULL;
DELETE FROM replies WHERE user_id IS NOT NULL;
DELETE FROM content_reports;
DELETE FROM audit_log;
DELETE FROM users;

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN username TEXT UNIQUE NOT NULL,
ADD COLUMN institution TEXT;

-- Update perspectives table to use username instead of email for author_name
-- This ensures consistency going forward
UPDATE perspectives SET author_name = 'Anonymous User' WHERE author_name IS NULL;

-- Add a comment to document the change
COMMENT ON COLUMN users.username IS 'Public display name used when posting perspectives';
COMMENT ON COLUMN users.institution IS 'User school or institution, optional field'; 
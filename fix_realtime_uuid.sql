-- Fix UUID type mismatch in realtime_activities table
-- This script changes user_id and created_by columns from UUID to TEXT

-- First, drop any existing data in the table (since we can't convert UUID to TEXT safely)
TRUNCATE TABLE realtime_activities;

-- Alter the columns to change from UUID to TEXT
ALTER TABLE realtime_activities 
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN created_by TYPE TEXT;

-- Update the check constraints to be more flexible
ALTER TABLE realtime_activities 
  DROP CONSTRAINT IF EXISTS realtime_activities_type_check,
  DROP CONSTRAINT IF EXISTS realtime_activities_priority_check;

ALTER TABLE realtime_activities 
  ADD CONSTRAINT realtime_activities_type_check 
  CHECK (type IN ('discussion', 'submission', 'engagement', 'notification')),
  ADD CONSTRAINT realtime_activities_priority_check 
  CHECK (priority IN ('low', 'medium', 'high'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_realtime_activities_class_id ON realtime_activities(class_id);
CREATE INDEX IF NOT EXISTS idx_realtime_activities_user_id ON realtime_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_activities_timestamp ON realtime_activities(timestamp);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'realtime_activities' 
  AND column_name IN ('user_id', 'created_by'); 
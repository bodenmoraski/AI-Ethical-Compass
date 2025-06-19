-- Add likes column to perspectives table
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Also add likes column to replies table for consistency
ALTER TABLE replies ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Update any existing perspectives to have 0 likes
UPDATE perspectives SET likes = 0 WHERE likes IS NULL; 
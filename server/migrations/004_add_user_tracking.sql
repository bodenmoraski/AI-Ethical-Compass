-- Migration: Add user tracking for dashboard
-- This adds tables to track user likes and scenario progress

-- Table to track which user liked which perspective
CREATE TABLE IF NOT EXISTS user_likes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT to match auth.users.id from Supabase Auth
  perspective_id INTEGER NOT NULL REFERENCES perspectives(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, perspective_id) -- Prevent duplicate likes
);

-- Table to track user progress through scenarios
CREATE TABLE IF NOT EXISTS user_scenario_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT to match auth.users.id
  scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  perspectives_submitted INTEGER DEFAULT 0,
  UNIQUE(user_id, scenario_id) -- One progress record per user per scenario
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_perspective_id ON user_likes(perspective_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_scenario_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_scenario_id ON user_scenario_progress(scenario_id);

-- Add user_id to perspectives table if not exists (for tracking who submitted what)
ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_perspectives_user_id ON perspectives(user_id); 
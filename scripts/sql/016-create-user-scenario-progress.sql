-- Run this in the Supabase SQL Editor if user_scenario_progress is still missing.
-- (Direct psql from this machine failed: DATABASE_URL password is stale.)

CREATE TABLE IF NOT EXISTS user_scenario_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  perspectives_submitted INTEGER DEFAULT 0,
  UNIQUE(user_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_scenario_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_scenario_id ON user_scenario_progress(scenario_id);

ALTER TABLE perspectives ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_perspectives_user_id ON perspectives(user_id);

-- Migration 006: Add Advanced Features
-- User-generated scenarios with AI moderation
CREATE TABLE user_scenarios (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  difficulty_level TEXT DEFAULT 'medium',
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  moderation_notes TEXT,
  ai_analysis JSONB, -- AI analysis results
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results for perspectives
CREATE TABLE perspective_analysis (
  id SERIAL PRIMARY KEY,
  perspective_id INTEGER REFERENCES perspectives(id) ON DELETE CASCADE,
  bias_score DECIMAL(3,2), -- 0.00 to 1.00
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  ethical_frameworks JSONB, -- detected ethical frameworks
  sentiment_analysis JSONB,
  key_themes JSONB,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements and badges
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- 'thoughtful_contributor', 'scenario_creator', 'ethical_reasoner', etc.
  achievement_level TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criteria_met JSONB -- what criteria were met to earn this
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  username TEXT NOT NULL,
  category TEXT NOT NULL, -- 'overall', 'monthly', 'scenario_creator', etc.
  score INTEGER DEFAULT 0,
  rank_position INTEGER,
  metrics JSONB, -- detailed metrics for this ranking
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User scenario votes
CREATE TABLE scenario_votes (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER REFERENCES user_scenarios(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  vote_type TEXT NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scenario_id, user_email)
);

-- Perspective quality ratings (for leaderboard calculation)
CREATE TABLE perspective_ratings (
  id SERIAL PRIMARY KEY,
  perspective_id INTEGER REFERENCES perspectives(id) ON DELETE CASCADE,
  rater_email TEXT NOT NULL,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  thoughtfulness_rating INTEGER CHECK (thoughtfulness_rating >= 1 AND thoughtfulness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(perspective_id, rater_email)
);

-- Add indexes for performance
CREATE INDEX idx_user_scenarios_status ON user_scenarios(status);
CREATE INDEX idx_user_scenarios_author ON user_scenarios(author_email);
CREATE INDEX idx_perspective_analysis_perspective ON perspective_analysis(perspective_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_email);
CREATE INDEX idx_leaderboard_category ON leaderboard_entries(category);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank_position);
CREATE INDEX idx_scenario_votes_scenario ON scenario_votes(scenario_id);
CREATE INDEX idx_perspective_ratings_perspective ON perspective_ratings(perspective_id);

-- Add RLS policies
ALTER TABLE user_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perspective_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perspective_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_scenarios
CREATE POLICY "Anyone can view approved scenarios" ON user_scenarios
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own scenarios" ON user_scenarios
  FOR SELECT USING (auth.jwt() ->> 'email' = author_email);

-- Temporary policy for testing - allows unauthenticated scenario creation
CREATE POLICY "Allow scenario creation for testing" ON user_scenarios
  FOR INSERT WITH CHECK (true);

-- RLS policies for other tables
CREATE POLICY "Anyone can view leaderboards" ON leaderboard_entries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on scenarios" ON scenario_votes
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can rate perspectives" ON perspective_ratings
  FOR ALL USING (auth.jwt() ->> 'email' = rater_email);

-- Allow anyone to view perspective analysis for now
CREATE POLICY "Anyone can view perspective analysis" ON perspective_analysis
  FOR SELECT USING (true); 
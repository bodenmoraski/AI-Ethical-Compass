-- Migration 009: Add realtime activities table for live classroom monitoring
-- This table stores real-time activity events for the classroom monitoring system

-- Create realtime_activities table
CREATE TABLE IF NOT EXISTS realtime_activities (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('discussion', 'submission', 'engagement', 'notification')),
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_realtime_activities_class_id ON realtime_activities(class_id);
CREATE INDEX IF NOT EXISTS idx_realtime_activities_timestamp ON realtime_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_realtime_activities_type ON realtime_activities(type);
CREATE INDEX IF NOT EXISTS idx_realtime_activities_priority ON realtime_activities(priority);

-- Enable Row Level Security
ALTER TABLE realtime_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Teachers can view activities for their classes
CREATE POLICY "Teachers can view their class activities" ON realtime_activities
    FOR SELECT USING (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
        )
    );

-- RLS Policy: Teachers can insert activities for their classes
CREATE POLICY "Teachers can create activities for their classes" ON realtime_activities
    FOR INSERT WITH CHECK (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
        )
    );

-- RLS Policy: Teachers can update activities for their classes
CREATE POLICY "Teachers can update their class activities" ON realtime_activities
    FOR UPDATE USING (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
        )
    );

-- RLS Policy: Teachers can delete activities for their classes
CREATE POLICY "Teachers can delete their class activities" ON realtime_activities
    FOR DELETE USING (
        class_id IN (
            SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
        )
    );

-- Enable real-time subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_activities;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_realtime_activities_updated_at 
    BEFORE UPDATE ON realtime_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE realtime_activities IS 'Stores real-time activity events for classroom monitoring'; 
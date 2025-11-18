-- Migration 013: Add missing columns to notifications table
-- Created: 2025-11-18
-- Purpose: Fix notifications table schema (discovered by tests!)

-- Add priority column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'priority'
    ) THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'medium';
        ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check 
          CHECK (priority IN ('low', 'medium', 'high'));
        RAISE NOTICE 'Added priority column to notifications';
    END IF;
END $$;

-- Add read_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
        RAISE NOTICE 'Added read_at column to notifications';
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN notifications.priority IS 'Notification priority level: low, medium, or high';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NOT NULL;

RAISE NOTICE 'Migration 013 completed: Added missing notification columns';


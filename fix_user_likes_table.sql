-- Fix user_likes table user_id column to be TEXT for Supabase Auth UUID consistency

-- Check if user_likes table exists and has INTEGER user_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_likes' 
        AND column_name = 'user_id' 
        AND data_type = 'integer'
    ) THEN
        -- Drop foreign key constraint first (this was causing the error)
        ALTER TABLE user_likes DROP CONSTRAINT IF EXISTS user_likes_user_id_fkey;
        
        -- Change user_id column from INTEGER to TEXT
        ALTER TABLE user_likes ALTER COLUMN user_id TYPE TEXT;
        
        -- Clean up any invalid data
        UPDATE user_likes SET user_id = NULL WHERE user_id = '' OR user_id = '0';
        
        RAISE NOTICE 'Fixed user_likes.user_id column type to TEXT';
    ELSE
        RAISE NOTICE 'user_likes.user_id is already TEXT or table does not exist';
    END IF;
END $$;

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_likes' 
AND column_name = 'user_id'; 
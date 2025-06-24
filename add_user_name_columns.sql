-- Add first_name and last_name columns to users table for better compatibility
-- This maintains backward compatibility while adding the expected columns

-- Add the columns if they don't exist
DO $$ 
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- Create a function to split the existing 'name' field into first_name and last_name
CREATE OR REPLACE FUNCTION split_user_name() RETURNS void AS $$
BEGIN
    -- Update first_name and last_name from existing name field
    UPDATE users 
    SET 
        first_name = CASE 
            WHEN name IS NOT NULL AND name != '' THEN 
                SPLIT_PART(name, ' ', 1)
            ELSE NULL
        END,
        last_name = CASE 
            WHEN name IS NOT NULL AND name != '' AND POSITION(' ' IN name) > 0 THEN 
                SUBSTRING(name FROM POSITION(' ' IN name) + 1)
            ELSE NULL
        END
    WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to populate the new columns
SELECT split_user_name();

-- Drop the function after use
DROP FUNCTION split_user_name();

-- Add comments
COMMENT ON COLUMN users.first_name IS 'First name of the user';
COMMENT ON COLUMN users.last_name IS 'Last name of the user'; 
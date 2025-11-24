-- Grant teacher access to user
-- Run this in your Supabase SQL editor

INSERT INTO users (
  email, 
  username, 
  role, 
  institution_name, 
  institution_type,
  created_at,
  updated_at
) VALUES (
  'bodenmoraski@gmail.com',
  'bodenmoraski',
  'teacher',
  'Test Institution',
  'University',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'teacher',
  updated_at = NOW();

-- Verify the user was created/updated
SELECT id, email, username, role, institution_name, institution_type 
FROM users 
WHERE email = 'bodenmoraski@gmail.com'; 
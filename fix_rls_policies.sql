-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Disable RLS temporarily for easier development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use these more permissive policies:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow profile creation" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow profile reading" ON users FOR SELECT USING (true);
-- CREATE POLICY "Allow profile updates" ON users FOR UPDATE USING (true);

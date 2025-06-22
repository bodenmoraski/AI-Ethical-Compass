-- Check what perspectives exist for this user
SELECT id, author_name, content, scenario_id, user_id, likes, created_at 
FROM perspectives 
WHERE author_name = 'shrigmamale11' OR author_name LIKE '%bodenmoraski%'
ORDER BY created_at DESC;

-- Check if user profile exists
SELECT * FROM users WHERE email = 'bodenmoraski@gmail.com';

-- Check user_likes table
SELECT * FROM user_likes WHERE user_id LIKE '%bodenmoraski%';

-- Count all perspectives by author name
SELECT author_name, COUNT(*) as count, SUM(likes) as total_likes
FROM perspectives 
GROUP BY author_name
ORDER BY count DESC;

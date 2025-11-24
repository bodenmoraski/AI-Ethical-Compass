-- Clear test submissions and data before deployment
-- Run this script before going live

-- Clear test submissions
DELETE FROM assignment_submissions WHERE created_at < NOW() - INTERVAL '30 days';

-- Clear test perspectives (keep only verified ones)
DELETE FROM perspectives WHERE author_name LIKE '%test%' OR author_name LIKE '%Test%';

-- Clear test user data
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Clear test classes
DELETE FROM classes WHERE name LIKE '%test%' OR name LIKE '%Test%';

-- Clear test enrollments
DELETE FROM class_enrollments WHERE created_at < NOW() - INTERVAL '30 days';

-- Clear old notifications
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '7 days';

-- Clear moderation queue older than 30 days
DELETE FROM moderation_queue WHERE created_at < NOW() - INTERVAL '30 days';

-- Reset auto-increment counters (optional)
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE classes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE assignment_submissions_id_seq RESTART WITH 1;

-- Vacuum tables for better performance
VACUUM ANALYZE users;
VACUUM ANALYZE classes;
VACUUM ANALYZE assignment_submissions;
VACUUM ANALYZE perspectives;

SELECT 'Test data cleanup completed successfully' AS status; 
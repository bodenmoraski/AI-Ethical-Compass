-- ============================================
-- CLEANUP TEST/UNSERIOUS DATA SCRIPT
-- AI Ethical Compass - Data Cleanup Utility
-- ============================================
-- 
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard/project/riaaolpwyphbtsxafgcw
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Run each section below one at a time
--
-- IMPORTANT: Always run the SELECT queries FIRST to review what will be deleted!
-- ============================================


-- ============================================
-- STEP 1: VIEW ALL PERSPECTIVES (to understand what you have)
-- ============================================
-- Run this first to see all perspectives
SELECT 
    id,
    scenario_id,
    author_name,
    LEFT(content, 100) AS content_preview,
    likes,
    moderation_status,
    created_at
FROM perspectives
ORDER BY created_at DESC;


-- ============================================
-- STEP 2: IDENTIFY LIKELY TEST/UNSERIOUS ENTRIES
-- ============================================
-- This query finds perspectives that are likely tests based on:
-- - Very short content (less than 20 chars)
-- - Common test phrases
-- - Author names like "test", "asdf", "123", etc.
-- - Contains {DEVYES} (development bypass flag)

SELECT 
    id,
    scenario_id,
    author_name,
    content,
    likes,
    moderation_status,
    created_at,
    CASE 
        WHEN LENGTH(content) < 20 THEN 'Very short'
        WHEN content ILIKE '%{DEVYES}%' THEN 'Dev bypass'
        WHEN content ILIKE '%test%' AND LENGTH(content) < 100 THEN 'Test content'
        WHEN author_name ILIKE '%test%' THEN 'Test author'
        WHEN author_name ILIKE '%asdf%' THEN 'Keyboard mash'
        WHEN author_name ~ '^[0-9]+$' THEN 'Numeric author'
        WHEN content ~ '^[a-zA-Z]{1,5}$' THEN 'Single word gibberish'
        WHEN content ILIKE '%lorem ipsum%' THEN 'Lorem ipsum'
        WHEN content ILIKE '%hello world%' THEN 'Hello world test'
        WHEN content ILIKE '%aaa%' OR content ILIKE '%bbb%' OR content ILIKE '%xxx%' THEN 'Repetitive chars'
        ELSE 'Manual review needed'
    END AS suspected_reason
FROM perspectives
WHERE 
    -- Very short content
    LENGTH(content) < 20
    -- Or contains development bypass
    OR content ILIKE '%{DEVYES}%'
    -- Or test-like author names
    OR author_name ILIKE '%test%'
    OR author_name ILIKE '%asdf%'
    OR author_name ILIKE '%qwerty%'
    OR author_name ~ '^[0-9]+$'
    -- Or test-like content
    OR (content ILIKE '%test%' AND LENGTH(content) < 100)
    OR content ~ '^[a-zA-Z]{1,5}$'
    OR content ILIKE '%lorem ipsum%'
    OR content ILIKE '%hello world%'
    OR content ILIKE '%aaa%'
    OR content ILIKE '%bbb%'
    OR content ILIKE '%xxx%'
    OR content ILIKE '%123%' AND LENGTH(content) < 50
ORDER BY created_at DESC;


-- ============================================
-- STEP 3: COUNT HOW MANY WILL BE DELETED
-- ============================================
SELECT COUNT(*) AS entries_to_delete
FROM perspectives
WHERE 
    LENGTH(content) < 20
    OR content ILIKE '%{DEVYES}%'
    OR author_name ILIKE '%test%'
    OR author_name ILIKE '%asdf%'
    OR author_name ILIKE '%qwerty%'
    OR author_name ~ '^[0-9]+$'
    OR (content ILIKE '%test%' AND LENGTH(content) < 100)
    OR content ~ '^[a-zA-Z]{1,5}$'
    OR content ILIKE '%lorem ipsum%'
    OR content ILIKE '%hello world%'
    OR content ILIKE '%aaa%'
    OR content ILIKE '%bbb%'
    OR content ILIKE '%xxx%'
    OR (content ILIKE '%123%' AND LENGTH(content) < 50);


-- ============================================
-- STEP 4: DELETE TEST ENTRIES
-- ============================================
-- ⚠️ ONLY RUN THIS AFTER REVIEWING THE ABOVE RESULTS!
-- Uncomment the DELETE statement below when ready

/*
DELETE FROM perspectives
WHERE 
    LENGTH(content) < 20
    OR content ILIKE '%{DEVYES}%'
    OR author_name ILIKE '%test%'
    OR author_name ILIKE '%asdf%'
    OR author_name ILIKE '%qwerty%'
    OR author_name ~ '^[0-9]+$'
    OR (content ILIKE '%test%' AND LENGTH(content) < 100)
    OR content ~ '^[a-zA-Z]{1,5}$'
    OR content ILIKE '%lorem ipsum%'
    OR content ILIKE '%hello world%'
    OR content ILIKE '%aaa%'
    OR content ILIKE '%bbb%'
    OR content ILIKE '%xxx%'
    OR (content ILIKE '%123%' AND LENGTH(content) < 50);
*/


-- ============================================
-- STEP 5: DELETE SPECIFIC IDs (MANUAL CLEANUP)
-- ============================================
-- If you want to delete specific entries by ID after reviewing:
-- Uncomment and add the IDs you want to delete

/*
DELETE FROM perspectives
WHERE id IN (
    -- Add IDs here, separated by commas:
    -- 1, 2, 3, 4, 5
);
*/


-- ============================================
-- BONUS: VIEW ASSIGNMENT SUBMISSIONS FOR CLEANUP
-- ============================================
-- If you also need to clean up assignment submissions:

SELECT 
    id,
    assignment_id,
    student_id,
    LEFT(submission_data::text, 100) AS data_preview,
    status,
    submitted_at
FROM assignment_submissions
ORDER BY submitted_at DESC;


-- ============================================
-- BONUS: CLEAN UP ASSOCIATED TABLES
-- ============================================
-- After deleting perspectives, you may want to clean up:
-- - perspective_analysis (AI analysis of perspectives)
-- - replies (replies to perspectives)
-- - user_likes (likes on perspectives)
-- 
-- These should cascade delete automatically if foreign keys are set up,
-- but if not, you can manually clean them:

/*
-- Delete orphaned analysis records
DELETE FROM perspective_analysis 
WHERE perspective_id NOT IN (SELECT id FROM perspectives);

-- Delete orphaned replies
DELETE FROM replies 
WHERE perspective_id NOT IN (SELECT id FROM perspectives);

-- Delete orphaned likes
DELETE FROM user_likes 
WHERE perspective_id NOT IN (SELECT id FROM perspectives);
*/


-- ============================================
-- VERIFICATION: Count remaining perspectives
-- ============================================
SELECT 
    COUNT(*) AS total_perspectives,
    COUNT(*) FILTER (WHERE moderation_status = 'approved') AS approved,
    COUNT(*) FILTER (WHERE moderation_status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE moderation_status = 'flagged') AS flagged
FROM perspectives;

-- SQL Queries to Extract Pilot Data Metrics
-- Run these queries in your Supabase SQL Editor or via psql
-- These queries extract the metrics mentioned in the grant feedback:
--   - Scenario completion rates
--   - Time spent on reflection activities
--   - Student engagement metrics
--   - Assignment completion rates

-- ============================================================================
-- 1. ASSIGNMENT COMPLETION RATES (Most Important for Grant Submission)
-- ============================================================================
-- This shows completion rates per assignment, which is what the reviewers want

SELECT 
  c.id AS class_id,
  c.name AS class_name,
  c.teacher_id,
  a.id AS assignment_id,
  a.title AS assignment_title,
  COUNT(DISTINCT ce.student_id) AS total_students,
  COUNT(DISTINCT asub.student_id) AS students_submitted,
  COUNT(DISTINCT CASE WHEN asub.status = 'graded' THEN asub.student_id END) AS students_graded,
  ROUND(
    COUNT(DISTINCT asub.student_id)::numeric / 
    NULLIF(COUNT(DISTINCT ce.student_id), 0) * 100, 
    2
  ) AS completion_rate_pct,
  ROUND(AVG(asub.final_score), 2) AS avg_score,
  MIN(asub.submitted_at) AS first_submission,
  MAX(asub.submitted_at) AS last_submission
FROM assignments a
JOIN classes c ON a.class_id = c.id
LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id 
  AND asub.status IN ('submitted', 'graded')
GROUP BY c.id, c.name, c.teacher_id, a.id, a.title
ORDER BY completion_rate_pct DESC, c.name, a.title;

-- ============================================================================
-- 2. TIME SPENT ON REFLECTION ACTIVITIES (Per Assignment)
-- ============================================================================
-- Average time students spent on scenarios per assignment

SELECT 
  c.name AS class_name,
  a.title AS assignment_title,
  COUNT(DISTINCT se.student_id) AS students_with_time_data,
  ROUND(AVG(se.time_spent_seconds) / 60.0, 2) AS avg_time_minutes,
  ROUND(MIN(se.time_spent_seconds) / 60.0, 2) AS min_time_minutes,
  ROUND(MAX(se.time_spent_seconds) / 60.0, 2) AS max_time_minutes,
  ROUND(AVG(se.engagement_score), 2) AS avg_engagement_score,
  ROUND(AVG(se.quality_score), 2) AS avg_quality_score
FROM assignments a
JOIN classes c ON a.class_id = c.id
LEFT JOIN student_engagement se ON se.class_id = c.id
  AND se.scenario_id = ANY(a.scenario_ids)
GROUP BY c.id, c.name, a.id, a.title
HAVING COUNT(se.id) > 0
ORDER BY avg_time_minutes DESC;

-- ============================================================================
-- 3. SCENARIO-LEVEL COMPLETION RATES (Across All Users)
-- ============================================================================
-- How many users completed each scenario (using user_scenario_progress table)

SELECT 
  s.id AS scenario_id,
  s.title AS scenario_title,
  COUNT(DISTINCT usp.user_id) AS users_completed,
  SUM(usp.perspectives_submitted) AS total_perspectives_submitted,
  ROUND(AVG(usp.perspectives_submitted), 2) AS avg_perspectives_per_user,
  MIN(usp.completed_at) AS first_completion,
  MAX(usp.completed_at) AS latest_completion
FROM scenarios s
LEFT JOIN user_scenario_progress usp ON s.id = usp.scenario_id
GROUP BY s.id, s.title
HAVING COUNT(usp.id) > 0
ORDER BY users_completed DESC, s.title;

-- ============================================================================
-- 4. SCENARIO-LEVEL TIME SPENT & ENGAGEMENT (Detailed)
-- ============================================================================
-- Average time spent per scenario with engagement metrics

SELECT 
  s.id AS scenario_id,
  s.title AS scenario_title,
  COUNT(DISTINCT se.student_id) AS students_engaged,
  COUNT(se.id) AS total_sessions,
  ROUND(AVG(se.time_spent_seconds) / 60.0, 2) AS avg_time_minutes,
  ROUND(AVG(se.engagement_score), 2) AS avg_engagement_score,
  ROUND(AVG(se.quality_score), 2) AS avg_quality_score,
  ROUND(AVG(se.perspectives_submitted), 2) AS avg_perspectives_submitted,
  MIN(se.session_start) AS first_session,
  MAX(se.session_start) AS latest_session
FROM scenarios s
LEFT JOIN student_engagement se ON s.id = se.scenario_id
GROUP BY s.id, s.title
HAVING COUNT(se.id) > 0
ORDER BY avg_time_minutes DESC;

-- ============================================================================
-- 5. STUDENT ENGAGEMENT OVERVIEW (Per Class)
-- ============================================================================
-- Overall engagement metrics per class

SELECT 
  c.id AS class_id,
  c.name AS class_name,
  c.teacher_id,
  COUNT(DISTINCT ce.student_id) AS total_students,
  COUNT(DISTINCT se.student_id) AS students_with_engagement_data,
  COUNT(DISTINCT se.scenario_id) AS unique_scenarios_used,
  ROUND(AVG(se.time_spent_seconds) / 60.0, 2) AS avg_time_minutes,
  ROUND(AVG(se.engagement_score), 2) AS avg_engagement_score,
  ROUND(AVG(se.quality_score), 2) AS avg_quality_score,
  SUM(se.perspectives_submitted) AS total_perspectives_submitted
FROM classes c
LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
LEFT JOIN student_engagement se ON se.class_id = c.id
GROUP BY c.id, c.name, c.teacher_id
HAVING COUNT(se.id) > 0
ORDER BY avg_engagement_score DESC;

-- ============================================================================
-- 6. COMPREHENSIVE PILOT DATA SUMMARY (Single Query for Grant Submission)
-- ============================================================================
-- This gives you all key metrics in one place

WITH assignment_stats AS (
  SELECT 
    a.id AS assignment_id,
    a.title AS assignment_title,
    c.name AS class_name,
    COUNT(DISTINCT ce.student_id) AS total_students,
    COUNT(DISTINCT asub.student_id) AS students_submitted,
    ROUND(COUNT(DISTINCT asub.student_id)::numeric / 
          NULLIF(COUNT(DISTINCT ce.student_id), 0) * 100, 2) AS completion_rate
  FROM assignments a
  JOIN classes c ON a.class_id = c.id
  LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
  LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id 
    AND asub.status IN ('submitted', 'graded')
  GROUP BY a.id, a.title, c.name
),
engagement_stats AS (
  SELECT 
    a.id AS assignment_id,
    ROUND(AVG(se.time_spent_seconds) / 60.0, 2) AS avg_time_minutes,
    ROUND(AVG(se.engagement_score), 2) AS avg_engagement_score
  FROM assignments a
  JOIN classes c ON a.class_id = c.id
  LEFT JOIN student_engagement se ON se.class_id = c.id 
    AND se.scenario_id = ANY(a.scenario_ids)
  GROUP BY a.id
  HAVING COUNT(se.id) > 0
)
SELECT 
  as_stats.class_name,
  as_stats.assignment_title,
  as_stats.total_students,
  as_stats.students_submitted,
  as_stats.completion_rate AS completion_rate_pct,
  es_stats.avg_time_minutes,
  es_stats.avg_engagement_score
FROM assignment_stats as_stats
LEFT JOIN engagement_stats es_stats ON as_stats.assignment_id = es_stats.assignment_id
ORDER BY as_stats.completion_rate DESC;

-- ============================================================================
-- 7. PER-STUDENT DETAILED METRICS (For Detailed Analysis)
-- ============================================================================
-- Individual student performance metrics

SELECT 
  u.id AS student_id,
  u.username,
  u.email,
  c.name AS class_name,
  COUNT(DISTINCT se.scenario_id) AS scenarios_completed,
  SUM(se.perspectives_submitted) AS total_perspectives,
  ROUND(AVG(se.time_spent_seconds) / 60.0, 2) AS avg_time_minutes,
  ROUND(AVG(se.engagement_score), 2) AS avg_engagement_score,
  ROUND(AVG(se.quality_score), 2) AS avg_quality_score,
  COUNT(DISTINCT asub.assignment_id) AS assignments_submitted
FROM users u
LEFT JOIN class_enrollments ce ON u.id = ce.student_id AND ce.status = 'active'
LEFT JOIN classes c ON ce.class_id = c.id
LEFT JOIN student_engagement se ON u.id = se.student_id
LEFT JOIN assignment_submissions asub ON u.id = asub.student_id
GROUP BY u.id, u.username, u.email, c.name
HAVING COUNT(se.id) > 0 OR COUNT(asub.id) > 0
ORDER BY avg_engagement_score DESC NULLS LAST;

-- ============================================================================
-- 8. PLATFORM-WIDE SUMMARY STATISTICS
-- ============================================================================
-- Overall platform usage metrics

SELECT 
  'Total Users' AS metric,
  COUNT(*)::text AS value
FROM users
UNION ALL
SELECT 
  'Total Classes' AS metric,
  COUNT(*)::text AS value
FROM classes
WHERE is_active = true
UNION ALL
SELECT 
  'Total Assignments' AS metric,
  COUNT(*)::text AS value
FROM assignments
UNION ALL
SELECT 
  'Total Active Students' AS metric,
  COUNT(DISTINCT student_id)::text AS value
FROM class_enrollments
WHERE status = 'active'
UNION ALL
SELECT 
  'Total Submissions' AS metric,
  COUNT(*)::text AS value
FROM assignment_submissions
WHERE status IN ('submitted', 'graded')
UNION ALL
SELECT 
  'Avg Completion Rate' AS metric,
  ROUND(
    (SELECT COUNT(DISTINCT student_id) FROM assignment_submissions WHERE status IN ('submitted', 'graded'))::numeric /
    NULLIF((SELECT COUNT(DISTINCT student_id) FROM class_enrollments WHERE status = 'active'), 0) * 100,
    2
  )::text || '%' AS value
UNION ALL
SELECT 
  'Avg Time Spent (minutes)' AS metric,
  ROUND(AVG(time_spent_seconds) / 60.0, 2)::text AS value
FROM student_engagement
WHERE time_spent_seconds > 0
UNION ALL
SELECT 
  'Avg Engagement Score' AS metric,
  ROUND(AVG(engagement_score), 2)::text AS value
FROM student_engagement
WHERE engagement_score IS NOT NULL;

-- ============================================================================
-- 9. TIMELINE ANALYSIS (Submission Trends)
-- ============================================================================
-- When students are submitting (useful for showing activity over time)

SELECT 
  DATE(submitted_at) AS submission_date,
  COUNT(*) AS submission_count,
  COUNT(DISTINCT student_id) AS unique_students,
  COUNT(DISTINCT assignment_id) AS unique_assignments
FROM assignment_submissions
WHERE submitted_at IS NOT NULL
GROUP BY DATE(submitted_at)
ORDER BY submission_date DESC
LIMIT 30;

-- ============================================================================
-- 10. QUALITY IMPROVEMENT METRICS (If Available)
-- ============================================================================
-- Show if students are improving over time (comparing first vs last submissions)

WITH student_first_last AS (
  SELECT 
    student_id,
    assignment_id,
    MIN(submitted_at) AS first_submission,
    MAX(submitted_at) AS last_submission
  FROM assignment_submissions
  GROUP BY student_id, assignment_id
  HAVING COUNT(*) > 1
)
SELECT 
  COUNT(DISTINCT sfl.student_id) AS students_with_multiple_submissions,
  ROUND(AVG(first_se.quality_score), 2) AS avg_first_quality,
  ROUND(AVG(last_se.quality_score), 2) AS avg_last_quality,
  ROUND(AVG(last_se.quality_score) - AVG(first_se.quality_score), 2) AS quality_improvement
FROM student_first_last sfl
LEFT JOIN student_engagement first_se ON sfl.student_id = first_se.student_id
  AND first_se.session_start <= sfl.first_submission + INTERVAL '1 hour'
LEFT JOIN student_engagement last_se ON sfl.student_id = last_se.student_id
  AND last_se.session_start <= sfl.last_submission + INTERVAL '1 hour'
WHERE first_se.quality_score IS NOT NULL AND last_se.quality_score IS NOT NULL;

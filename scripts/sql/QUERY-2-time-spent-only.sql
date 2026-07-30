-- ============================================================================
-- QUERY 2: Time Spent on Reflection Activities
-- ============================================================================
-- Copy and paste ONLY this query into Supabase SQL Editor
-- This shows average time students spent on scenarios per assignment

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

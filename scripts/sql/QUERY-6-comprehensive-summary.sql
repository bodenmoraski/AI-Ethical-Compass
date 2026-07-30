-- ============================================================================
-- QUERY 6: Comprehensive Pilot Data Summary (ALL METRICS TOGETHER)
-- ============================================================================
-- Copy and paste ONLY this query into Supabase SQL Editor
-- This gives you completion rates AND time spent in one table - perfect for grant submission!

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

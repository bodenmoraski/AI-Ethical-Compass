-- ============================================================================
-- QUERY 1: Assignment Completion Rates (MOST IMPORTANT FOR GRANT)
-- ============================================================================
-- Copy and paste ONLY this query into Supabase SQL Editor
-- This shows completion rates per assignment - exactly what the reviewers want
-- Run this first!

SELECT 
  c.name AS class_name,
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
GROUP BY c.id, c.name, a.id, a.title
ORDER BY completion_rate_pct DESC, c.name, a.title;

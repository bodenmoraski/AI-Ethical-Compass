import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';
import { computeSdgImpact } from '../lib/sdg-impact.js';
import { recordActivity } from '../lib/activity-feed.js';
import { getBearerToken } from '../lib/api-auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== USER DASHBOARD API CALLED ===', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  // Helper function to get user ID from email
  const getUserIdFromEmail = async (email: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new Error('User not found');
    }
    
    return user.id;
  };

  if (req.method === 'GET') {
    try {
      const { userId, userEmail, action } = req.query;
      let resolvedEmail = typeof userEmail === 'string' ? userEmail : undefined;
      let resolvedUserId = typeof userId === 'string' ? userId : undefined;

      // Always resolve identity from JWT when present; reject cross-user query params
      const token = getBearerToken(req);
      let authEmail: string | undefined;
      if (token) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (!authError && user?.email) {
          authEmail = user.email;
        }
      }

      if (authEmail) {
        // Ignore spoofable query identity — use the authenticated email
        resolvedEmail = authEmail;
        resolvedUserId = undefined;
      } else if (resolvedUserId || resolvedEmail) {
        // Sensitive dashboard data requires auth
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!resolvedUserId && !resolvedEmail) {
        return res.status(400).json({ 
          message: 'User ID or email is required' 
        });
      }

      const effectiveUserId = resolvedUserId || resolvedEmail || 'anonymous_user';
      console.log(`Getting dashboard data for user: ${effectiveUserId}`);
      
      // Handle assignment-specific actions
      if (action === 'assignments') {
        const userId = await getUserIdFromEmail(effectiveUserId as string);
        
        // First get enrolled class IDs
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .eq('student_id', userId)
          .eq('status', 'active');

        if (enrollmentError) {
          console.error('Error fetching enrollments:', enrollmentError);
          return res.status(500).json({ error: 'Failed to fetch enrollments' });
        }

        const classIds = enrollments?.map(e => e.class_id) || [];
        
        if (classIds.length === 0) {
          return res.status(200).json({ assignments: [] });
        }

        // Get all assignments for enrolled classes
        const { data: allAssignments, error: allAssignmentsError} = await supabase
          .from('assignments')
          .select(`
            *,
            classes (
              name,
              subject
            )
          `)
          // Only show published assignments to students
          .eq('is_published', true)
          .in('class_id', classIds);

        if (allAssignmentsError) {
          console.error('Error fetching assignments:', allAssignmentsError);
          return res.status(500).json({ error: 'Failed to fetch assignments' });
        }

        // Get submissions for these assignments
        const assignmentIds = allAssignments?.map(a => a.id) || [];
        
        if (assignmentIds.length === 0) {
          return res.status(200).json({ assignments: allAssignments || [] });
        }

        const { data: submissions, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            assignment_id,
            status,
            submitted_at,
            final_score,
            feedback,
            is_late,
            rubric_scores,
            submission_data
          `)
          .eq('student_id', userId)
          .in('assignment_id', assignmentIds);

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
        }

        // Merge assignments with their submissions
        const submissionsMap = new Map();
        submissions?.forEach(sub => {
          submissionsMap.set(sub.assignment_id, sub);
        });

        const assignmentsWithSubmissions = allAssignments?.map(assignment => ({
          ...assignment,
          submission: submissionsMap.get(assignment.id)
        })) || [];

        return res.status(200).json({ assignments: assignmentsWithSubmissions });
      }
      
      // Get user profile to find their username
      const { data: userProfile } = await supabase
        .from('users')
        .select('username')
        .eq('email', effectiveUserId)
        .single();
      
      const username = userProfile?.username;
      console.log(`Found username: ${username} for user: ${effectiveUserId}`);
      
      // Get user's submitted perspectives using multiple identifiers
      // Build query conditions properly - only use author_name since user_id is integer but we have email string
      let queryConditions = `author_name.eq.${effectiveUserId}`;
      if (username && username !== effectiveUserId) {
        queryConditions += `,author_name.eq.${username}`;
      }
      
      const { data: userPerspectives, error: perspectivesError } = await supabase
        .from('perspectives')
        .select(`
          id,
          content,
          scenario_id,
          author_name,
          likes,
          created_at,
          scenarios (
            id,
            title
          )
        `)
        .or(queryConditions)
        .order('created_at', { ascending: false });
      
      if (perspectivesError) {
        console.error('Error fetching user perspectives:', perspectivesError);
      }
      
      // Get user's liked perspectives
      const { data: likedRows, error: likedError } = await supabase
        .from('user_likes')
        .select(`
          perspective_id,
          created_at,
          perspectives (
            id,
            content,
            scenario_id,
            author_name,
            likes,
            scenarios (
              id,
              title
            )
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      
      if (likedError) {
        console.error('Error fetching user likes:', likedError);
      }

      // Flatten nested join so the dashboard UI can read perspective fields directly
      const likedPerspectives = (likedRows || []).map((row: any) => {
        const perspective = row.perspectives || {};
        return {
          id: perspective.id || row.perspective_id,
          content: perspective.content || '',
          scenario_id: perspective.scenario_id,
          author_name: perspective.author_name || 'Anonymous',
          likes: perspective.likes || 0,
          created_at: row.created_at,
          scenarios: perspective.scenarios,
        };
      });

      // Resolve numeric users.id for user_progress (integer FK)
      let numericUserId: number | null = null;
      try {
        if (typeof effectiveUserId === 'string' && effectiveUserId.includes('@')) {
          numericUserId = await getUserIdFromEmail(effectiveUserId);
        } else if (!Number.isNaN(Number(effectiveUserId))) {
          numericUserId = Number(effectiveUserId);
        }
      } catch (e) {
        console.warn('Could not resolve numeric user id for progress:', e);
      }

      let scenarioProgress: any[] = [];
      if (numericUserId != null) {
        const { data: progressRows, error: progressError } = await supabase
          .from('user_progress')
          .select(`
            scenario_id,
            completed,
            completed_at,
            scenarios (
              id,
              title
            )
          `)
          .eq('user_id', numericUserId)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (progressError) {
          console.error('Error fetching scenario progress:', progressError);
        } else {
          scenarioProgress = (progressRows || []).map((row: any) => ({
            scenario_id: row.scenario_id,
            completed_at: row.completed_at,
            perspectives_submitted: row.completed ? 1 : 0,
            scenarios: row.scenarios,
          }));
        }
      }
      
      // Calculate statistics
      const stats = {
        total_perspectives: userPerspectives?.length || 0,
        total_likes_received: userPerspectives?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0,
        total_likes_given: likedPerspectives?.length || 0,
        scenarios_engaged: new Set(userPerspectives?.map(p => p.scenario_id) || []).size,
        scenarios_completed: scenarioProgress?.length || 0
      };
      
      // Derive SDGs from the scenarios this learner actually engaged with
      const engagedScenarioIds = [
        ...(userPerspectives || []).map((p: any) => p.scenario_id),
        ...scenarioProgress.map((p: any) => p.scenario_id),
      ];

      let sdgImpact;
      try {
        const { getScenarios } = await import('../lib/scenarios-data.js');
        sdgImpact = computeSdgImpact(engagedScenarioIds, getScenarios() as any, stats);
      } catch (sdgError) {
        console.error('Failed to compute SDG impact from scenarios:', sdgError);
        sdgImpact = computeSdgImpact([], [], stats);
      }
      
      console.log(`Dashboard data compiled for ${effectiveUserId}:`, {
        perspectives: stats.total_perspectives,
        likes_received: stats.total_likes_received,
        likes_given: stats.total_likes_given,
        scenarios: stats.scenarios_engaged
      });
      
      res.status(200).json({
        user_id: effectiveUserId,
        statistics: stats,
        submitted_perspectives: userPerspectives || [],
        liked_perspectives: likedPerspectives || [],
        scenario_progress: scenarioProgress || [],
        sdg_impact: sdgImpact,
        last_updated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Dashboard API error:', error);
      res.status(500).json({
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { action } = req.query;
      
      if (action === 'submit-assignment') {
        const { assignmentId, submissionData } = req.body;
        
        if (!assignmentId || !submissionData) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Bound payload size so a single student cannot dump megabytes into JSONB.
        const serialized = JSON.stringify(submissionData);
        if (serialized.length > 50_000) {
          return res.status(400).json({ error: 'Submission is too large (max 50KB)' });
        }
        const perspectives = Array.isArray(submissionData.perspectives)
          ? submissionData.perspectives
          : [];
        const primary = typeof perspectives[0] === 'string' ? perspectives[0].trim() : '';
        if (primary.length < 5) {
          return res.status(400).json({ error: 'Written response is too short' });
        }
        if (primary.length > 20000) {
          return res.status(400).json({ error: 'Written response exceeds 20000 characters' });
        }

        // Get user ID from authorization header
        const token = getBearerToken(req);
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user ID from database
        const { data: dbUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError || !dbUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if assignment exists and is published
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', assignmentId)
          .eq('is_published', true)
          .single();

        if (assignmentError || !assignment) {
          return res.status(404).json({ error: 'Assignment not found or not published' });
        }

        // Check if student is enrolled in the class
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('class_enrollments')
          .select('*')
          .eq('class_id', assignment.class_id)
          .eq('student_id', dbUser.id)
          .eq('status', 'active')
          .single();

        if (enrollmentError || !enrollment) {
          return res.status(403).json({ error: 'Not enrolled in this class' });
        }

        const isLate = assignment.due_date
          ? new Date() > new Date(assignment.due_date)
          : false;

        // A closed assignment must actually reject work, otherwise the teacher's
        // "accept late submissions" switch is decorative.
        if (isLate && assignment.allow_late_submissions === false) {
          return res.status(403).json({
            error: 'This assignment is past its due date and no longer accepts submissions',
            due_date: assignment.due_date,
          });
        }

        // Check if already submitted
        const { data: existingSubmission, error: existingError } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', dbUser.id)
          .single();

        if (existingSubmission) {
          return res.status(400).json({ error: 'Assignment already submitted' });
        }

        // Create submission
        const { data: submission, error: submissionError } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: dbUser.id,
            submission_data: submissionData,
            submitted_at: new Date().toISOString(),
            is_late: isLate,
            status: 'submitted'
          })
          .select()
          .single();

        if (submissionError) {
          console.error('Error creating submission:', submissionError);
          return res.status(500).json({ error: 'Failed to submit assignment' });
        }

        await recordActivity({
          type: 'submission',
          classId: assignment.class_id,
          userId: dbUser.id,
          title: 'Assignment submitted',
          description: `${user.email} submitted "${assignment.title}"${submission.is_late ? ' (late)' : ''}`,
          priority: submission.is_late ? 'high' : 'medium',
          data: {
            assignment_id: assignment.id,
            submission_id: submission.id,
            is_late: submission.is_late,
          },
        });

        return res.status(201).json({ 
          success: true, 
          submission,
          message: 'Assignment submitted successfully'
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
      
    } catch (error) {
      console.error('Assignment submission error:', error);
      res.status(500).json({
        message: 'Failed to submit assignment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== USER DASHBOARD API CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
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
      
      if (!userId && !userEmail) {
        return res.status(400).json({ 
          message: 'User ID or email is required' 
        });
      }

      const effectiveUserId = userId || userEmail || 'anonymous_user';
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
          // Skip is_published filter if column doesn't exist
          // .eq('is_published', true)
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
      const { data: likedPerspectives, error: likedError } = await supabase
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
      
      // Get user's scenario progress
      const { data: scenarioProgress, error: progressError } = await supabase
        .from('user_scenario_progress')
        .select(`
          scenario_id,
          completed_at,
          perspectives_submitted,
          scenarios (
            id,
            title
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('completed_at', { ascending: false });
      
      if (progressError) {
        console.error('Error fetching scenario progress:', progressError);
      }
      
      // Calculate statistics
      const stats = {
        total_perspectives: userPerspectives?.length || 0,
        total_likes_received: userPerspectives?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0,
        total_likes_given: likedPerspectives?.length || 0,
        scenarios_engaged: new Set(userPerspectives?.map(p => p.scenario_id) || []).size,
        scenarios_completed: scenarioProgress?.length || 0
      };
      
      // Calculate SDG impact (simplified for now)
      const sdgImpact = {
        primary_sdgs: [4, 16, 17], // Education, Peace & Justice, Partnerships
        impact_score: Math.min(stats.total_perspectives * 10 + stats.total_likes_received * 2, 100)
      };
      
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

        // Get user ID from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
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
            is_late: assignment.due_date ? new Date() > new Date(assignment.due_date) : false,
            status: 'submitted'
          })
          .select()
          .single();

        if (submissionError) {
          console.error('Error creating submission:', submissionError);
          return res.status(500).json({ error: 'Failed to submit assignment' });
        }

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

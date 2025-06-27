import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, type UserProgress } from '../lib/supabase-server.js';
import { moderateScenario } from '../lib/ai-analysis.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== USER PROGRESS API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests (CORS) (https://vercel.com/docs/functions/edge-functions/cors)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route based on request type
  const isProgressRequest = req.method === 'POST' && req.body && (req.body.userId || req.body.scenarioId);
  const isUserScenariosRequest = req.method === 'GET' || (req.method === 'POST' && req.body && req.body.title);

  if (isProgressRequest) {
    // Handle progress operations (from progress.ts)
    try {
      console.log('Processing progress POST request...');
      
      const supabaseClient = getSupabaseClient();
      
      // Basic validation
      const { userId, scenarioId, completed } = req.body;
      
      if (!userId || !scenarioId) {
        return res.status(400).json({ 
          message: 'userId and scenarioId are required' 
        });
      }
      
      // Verify scenario exists
      const { data: scenarioCheck, error: scenarioError } = await supabaseClient
        .from('scenarios')
        .select('id')
        .eq('id', scenarioId)
        .eq('is_active', true)
        .single();
      
      if (scenarioError || !scenarioCheck) {
        console.error('Scenario check error:', scenarioError);
        return res.status(400).json({ 
          message: `Scenario with ID ${scenarioId} does not exist or is not active` 
        });
      }
      
      console.log(`Verified scenario ${scenarioId} exists`);
      
      // Check if progress record already exists
      const { data: existingProgress, error: checkError } = await supabaseClient
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Progress check error:', checkError);
        return res.status(500).json({
          message: 'Failed to check existing progress',
          error: checkError.message
        });
      }
      
      let progressRecord;
      
      if (existingProgress) {
        // Update existing progress
        const { data: updatedProgress, error: updateError } = await supabaseClient
          .from('user_progress')
          .update({
            completed: completed ?? existingProgress.completed,
            completed_at: completed ? new Date().toISOString() : existingProgress.completed_at,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('scenario_id', scenarioId)
          .select()
          .single();
        
        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({
            message: 'Failed to update progress',
            error: updateError.message
          });
        }
        
        progressRecord = updatedProgress;
        console.log(`Updated progress for user ${userId}, scenario ${scenarioId}`);
      } else {
        // Create new progress record
        const { data: newProgress, error: insertError } = await supabaseClient
          .from('user_progress')
          .insert({
            user_id: userId,
            scenario_id: scenarioId,
            completed: completed ?? false,
            completed_at: completed ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Insert error:', insertError);
          return res.status(500).json({
            message: 'Failed to create progress',
            error: insertError.message
          });
        }
        
        progressRecord = newProgress;
        console.log(`Created new progress for user ${userId}, scenario ${scenarioId}`);
      }
      
      // Format the response to match expected format
      res.status(200).json({
        id: progressRecord.id,
        userId: progressRecord.user_id,
        scenarioId: progressRecord.scenario_id,
        completed: progressRecord.completed,
        completedAt: progressRecord.completed_at,
        createdAt: progressRecord.created_at,
        updatedAt: progressRecord.updated_at
      });
      
    } catch (error) {
      console.error('Progress API error:', error);
      res.status(500).json({
        message: 'Failed to update progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  else if (isUserScenariosRequest) {
    // Handle user scenarios operations (from user-scenarios.ts)
    try {
      if (req.method === 'GET') {
        // Get user scenarios (approved ones for public, all for admin)
        const { status = 'approved', author_email } = req.query;
        
        let query = supabase
          .from('user_scenarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (status === 'approved') {
          query = query.eq('status', 'approved');
        }

        if (author_email) {
          query = query.eq('author_email', author_email);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching user scenarios:', error);
          return res.status(500).json({ error: 'Failed to fetch scenarios' });
        }

        return res.status(200).json(data);
      }

      if (req.method === 'POST') {
        // Submit new user scenario
        const { title, description, category, author_name, author_email } = req.body;

        if (!title || !description || !author_name || !author_email) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // AI moderation
        console.log('Moderating scenario:', title);
        const moderationResult = await moderateScenario(title, description);

        // Save to database
        const { data, error } = await supabase
          .from('user_scenarios')
          .insert({
            title,
            description,
            category: category || moderationResult.category_suggestion,
            difficulty_level: moderationResult.difficulty_suggestion,
            author_name,
            author_email,
            status: moderationResult.is_appropriate ? 'approved' : 'pending',
            moderation_notes: moderationResult.issues.length > 0 
              ? moderationResult.issues.join('; ') 
              : null,
            ai_analysis: {
              quality_score: moderationResult.quality_score,
              suggestions: moderationResult.suggestions,
              moderated_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating scenario:', error);
          return res.status(500).json({ error: 'Failed to create scenario' });
        }

        return res.status(201).json({
          scenario: data,
          moderation: moderationResult
        });
      }

      if (req.method === 'PUT') {
        // Vote on a scenario
        const { scenario_id, user_email, vote_type } = req.body;

        if (!scenario_id || !user_email || !['up', 'down'].includes(vote_type)) {
          return res.status(400).json({ error: 'Invalid vote data' });
        }

        // Check if user already voted
        const { data: existingVote } = await supabase
          .from('scenario_votes')
          .select('*')
          .eq('scenario_id', scenario_id)
          .eq('user_email', user_email)
          .single();

        if (existingVote) {
          // Update existing vote
          const { error } = await supabase
            .from('scenario_votes')
            .update({ vote_type })
            .eq('id', existingVote.id);

          if (error) {
            console.error('Error updating vote:', error);
            return res.status(500).json({ error: 'Failed to update vote' });
          }
        } else {
          // Create new vote
          const { error } = await supabase
            .from('scenario_votes')
            .insert({
              scenario_id,
              user_email,
              vote_type
            });

          if (error) {
            console.error('Error creating vote:', error);
            return res.status(500).json({ error: 'Failed to create vote' });
          }
        }

        // Update scenario vote counts
        const { data: votes } = await supabase
          .from('scenario_votes')
          .select('vote_type')
          .eq('scenario_id', scenario_id);

        const votesUp = votes?.filter(v => v.vote_type === 'up').length || 0;
        const votesDown = votes?.filter(v => v.vote_type === 'down').length || 0;

        await supabase
          .from('user_scenarios')
          .update({
            votes_up: votesUp,
            votes_down: votesDown
          })
          .eq('id', scenario_id);

        return res.status(200).json({ success: true, votes_up: votesUp, votes_down: votesDown });
      }

      if (req.method === 'PATCH') {
        // Handle assignment submission completion
        const { assignmentId, studentEmail, scenarioId, perspectiveContent } = req.body;

        if (!assignmentId || !studentEmail || !scenarioId || !perspectiveContent) {
          return res.status(400).json({ error: 'Missing required fields for scenario completion' });
        }

        // Get student ID from email (but don't fail if user doesn't exist)
        const { data: student, error: studentError } = await supabase
          .from('users')
          .select('id, username, email')
          .eq('email', studentEmail)
          .single();

        // Create perspective entry (handle case where user might not exist in users table)
        const authorName = student?.username || studentEmail.split('@')[0] || 'Anonymous Student';
        
        const { data: perspective, error: perspectiveError } = await supabase
          .from('perspectives')
          .insert({
            scenario_id: scenarioId,
            content: perspectiveContent,
            author_name: authorName,
            user_id: student?.id || null
          })
          .select()
          .single();

        if (perspectiveError) {
          console.error('Error creating perspective:', perspectiveError);
          return res.status(500).json({ error: 'Failed to create perspective' });
        }

        // Track student engagement (only if we have a valid student)
        if (student?.id) {
          const { error: engagementError } = await supabase
            .from('student_engagement')
            .upsert({
              student_id: student.id,
              class_id: null, // Will be updated with proper class_id from assignment
              scenario_id: scenarioId,
              session_start: new Date().toISOString(),
              session_end: new Date().toISOString(),
              engagement_score: 85, // Default score
              completion_status: 'completed'
            });

          if (engagementError) {
            console.error('Error tracking engagement:', engagementError);
          }
        }

        return res.status(200).json({
          success: true,
          perspective: {
            id: perspective.id,
            content: perspective.content,
            author_name: perspective.author_name,
            created_at: perspective.created_at
          }
        });
      }

    } catch (error) {
      console.error('User scenarios API error:', error);
      res.status(500).json({
        message: 'Failed to process user scenarios request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
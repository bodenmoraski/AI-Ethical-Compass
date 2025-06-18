import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type UserProgress } from '../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PROGRESS DB API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('Processing POST request...');
      
      const supabase = getSupabaseClient();
      
      // Basic validation
      const { userId, scenarioId, completed } = req.body;
      
      if (!userId || !scenarioId) {
        return res.status(400).json({ 
          message: 'userId and scenarioId are required' 
        });
      }
      
      // Verify scenario exists
      const { data: scenarioCheck, error: scenarioError } = await supabase
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
      const { data: existingProgress, error: checkError } = await supabase
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
        const { data: updatedProgress, error: updateError } = await supabase
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
        const { data: newProgress, error: insertError } = await supabase
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
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to update progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
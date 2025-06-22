import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Perspective } from '../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES DB API CALLED ===');
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
      const { scenarioId, content, authorName, userId, userEmail } = req.body;
      
      if (!scenarioId || !content) {
        return res.status(400).json({ 
          message: 'scenarioId and content are required' 
        });
      }
      
      if (!authorName || authorName.trim().length === 0) {
        return res.status(400).json({ 
          message: 'authorName is required' 
        });
      }
      
      if (content.trim().length < 5) {
        return res.status(400).json({ 
          message: 'Perspective content is too short (minimum 5 characters)' 
        });
      }
      
      if (content.trim().length > 2000) {
        return res.status(400).json({ 
          message: 'Perspective content exceeds maximum length of 2000 characters' 
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
      
      // Insert the perspective
      const { data: perspective, error: insertError } = await supabase
        .from('perspectives')
        .insert({
          scenario_id: scenarioId,
          author_name: authorName.trim(),
          content: content.trim(),
          user_id: userId || userEmail || null,
          moderation_status: 'approved'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({
          message: 'Failed to create perspective',
          error: insertError.message
        });
      }
      
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenario_id}`);
      
      // Format the response to match the expected format
      res.status(201).json({
        id: perspective.id,
        scenarioId: perspective.scenario_id,
        authorName: perspective.author_name,
        content: perspective.content,
        likes: perspective.likes,
        moderationStatus: perspective.moderation_status,
        createdAt: perspective.created_at,
        updatedAt: perspective.updated_at
      });
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to create perspective',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
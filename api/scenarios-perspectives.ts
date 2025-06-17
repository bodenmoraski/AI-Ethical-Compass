import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Perspective } from '../lib/supabase-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SCENARIOS PERSPECTIVES API CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { scenarioId } = req.query;
      
      if (!scenarioId) {
        return res.status(400).json({ 
          message: 'scenarioId is required' 
        });
      }
      
      console.log(`Processing GET request for perspectives of scenario ${scenarioId}...`);
      
      const supabase = getSupabaseClient();
      
      // Verify scenario exists
      const { data: scenarioCheck, error: scenarioError } = await supabase
        .from('scenarios')
        .select('id')
        .eq('id', scenarioId)
        .eq('is_active', true)
        .single();
      
      if (scenarioError || !scenarioCheck) {
        console.error('Scenario check error:', scenarioError);
        return res.status(404).json({ 
          message: `Scenario with ID ${scenarioId} not found or not active` 
        });
      }
      
      // Fetch perspectives for the scenario
      const { data: perspectives, error } = await supabase
        .from('perspectives')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({
          message: 'Failed to fetch perspectives',
          error: error.message
        });
      }
      
      console.log(`Found ${perspectives?.length || 0} perspectives for scenario ${scenarioId}`);
      
      // Format the response to match expected format
      const formattedPerspectives = perspectives?.map(perspective => ({
        id: perspective.id,
        scenarioId: perspective.scenario_id,
        authorName: perspective.author_name,
        content: perspective.content,
        likes: perspective.likes,
        moderationStatus: perspective.moderation_status,
        createdAt: perspective.created_at,
        updatedAt: perspective.updated_at
      })) || [];
      
      res.status(200).json(formattedPerspectives);
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to fetch perspectives',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
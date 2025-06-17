import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Scenario } from '../lib/supabase-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SCENARIOS API CALLED ===');
  console.log('Method:', req.method);
  
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
      console.log('Processing GET request for scenarios...');
      
      const supabase = getSupabaseClient();
      
      // Fetch all active scenarios
      const { data: scenarios, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({
          message: 'Failed to fetch scenarios',
          error: error.message
        });
      }
      
      console.log(`Found ${scenarios?.length || 0} active scenarios`);
      
      // Format the response to match expected format
      const formattedScenarios = scenarios?.map(scenario => ({
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        difficultyLevel: scenario.difficulty_level,
        isActive: scenario.is_active,
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      })) || [];
      
      res.status(200).json(formattedScenarios);
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to fetch scenarios',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
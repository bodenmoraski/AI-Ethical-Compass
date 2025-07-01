import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Scenario } from '../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type } = req.query;
  
  console.log('=== PLATFORM API CALLED ===');
  console.log('Method:', req.method);
  console.log('Type:', type);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (type === 'scenarios') {
      return await handleScenarios(req, res);
    } else if (type === 'stats') {
      return await handlePlatformStats(req, res);
    } else {
      return res.status(400).json({ 
        error: 'Invalid type parameter. Use ?type=scenarios or ?type=stats' 
      });
    }
  } catch (error) {
    console.error('Platform API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle scenarios endpoint (from scenarios.ts)
async function handleScenarios(req: VercelRequest, res: VercelResponse) {
  console.log('Processing GET request for scenarios...');
  
  try {
    // Import scenarios from JSON file instead of database
    const fs = await import('fs');
    const path = await import('path');
    
    // Read scenarios from shared/scenarios.json
    const scenariosPath = path.join(process.cwd(), 'shared', 'scenarios.json');
    const scenariosData = fs.readFileSync(scenariosPath, 'utf8');
    const scenarios = JSON.parse(scenariosData);
    
    console.log(`Found ${scenarios?.length || 0} scenarios in JSON file`);
    
    // Format the response to match expected format
    const formattedScenarios = scenarios?.map((scenario: any) => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      resolutions: scenario.resolutions,
      options: scenario.options,
      ethicalConsiderations: scenario.ethicalConsiderations,
      sdgTags: scenario.sdgTags,
      resources: scenario.resources
    })) || [];
    
    res.status(200).json(formattedScenarios);
  } catch (error) {
    console.error('Error reading scenarios:', error);
    return res.status(500).json({
      message: 'Failed to load scenarios',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Handle platform stats endpoint (from platform-stats.ts)
async function handlePlatformStats(req: VercelRequest, res: VercelResponse) {
  console.log('Processing GET request for platform stats...');
  
  const supabase = getSupabaseClient();

  // Get total users count
  const { count: usersCount, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Get total perspectives count
  const { count: perspectivesCount, error: perspectivesError } = await supabase
    .from('perspectives')
    .select('*', { count: 'exact', head: true });

  // Get total scenarios analyzed (both built-in and user-created)
  const { count: builtInScenariosCount, error: builtInError } = await supabase
    .from('scenarios')
    .select('*', { count: 'exact', head: true });

  const { count: userScenariosCount, error: userScenariosError } = await supabase
    .from('user_scenarios')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Get unique countries (this is a bit tricky, we'll estimate based on user diversity)
  const { data: userEmails, error: emailsError } = await supabase
    .from('users')
    .select('email');

  if (usersError || perspectivesError || builtInError || userScenariosError || emailsError) {
    console.error('Database errors:', { usersError, perspectivesError, builtInError, userScenariosError, emailsError });
    throw new Error('Failed to fetch statistics');
  }

  // Estimate countries based on email domains and user diversity
  const uniqueDomains = new Set(
    userEmails?.map((u: any) => u.email?.split('@')[1]?.toLowerCase()).filter(Boolean) || []
  );
  
  // Conservative estimate: assume 1 country per 3-4 unique domains, minimum 1
  const estimatedCountries = Math.max(1, Math.floor(uniqueDomains.size / 3));

  const stats = {
    users: usersCount || 0,
    perspectives: perspectivesCount || 0,
    scenarios_analyzed: (builtInScenariosCount || 0) + (userScenariosCount || 0),
    countries: estimatedCountries
  };

  console.log('Platform stats:', stats);

  res.status(200).json({
    success: true,
    stats
  });
} 
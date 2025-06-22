import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PLATFORM STATS API CALLED ===');
  console.log('Method:', req.method);
  
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

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch platform statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
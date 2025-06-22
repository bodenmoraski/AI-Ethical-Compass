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

  if (req.method === 'GET') {
    try {
      const { userId, userEmail } = req.query;
      
      if (!userId && !userEmail) {
        return res.status(400).json({ 
          message: 'User ID or email is required' 
        });
      }

      const effectiveUserId = userId || userEmail || 'anonymous_user';
      console.log(`Getting dashboard data for user: ${effectiveUserId}`);
      
      const supabase = getSupabaseClient();
      
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
      
      // Skip user_likes for now due to table structure issues
      const likedPerspectives = [];
      const likedError = null;
      
      // Skip scenario progress for now due to table structure issues  
      const scenarioProgress: any[] = [];
      const progressError = null;
      
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
        liked_perspectives: [],
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { calculateUserScore } from '../lib/ai-analysis.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { category = 'overall', period = 'all_time', limit = 50 } = req.query;

      // Get existing leaderboard entries
      let query = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('category', category)
        .order('rank_position', { ascending: true })
        .limit(parseInt(limit as string));

      if (period !== 'all_time') {
        const now = new Date();
        let startDate: Date;
        
        switch (period) {
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0); // All time
        }
        
        query = query.gte('period_start', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return res.status(500).json({ error: 'Failed to fetch leaderboard' });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      // Recalculate leaderboard (admin function)
      console.log('Recalculating leaderboard...');
      
      await recalculateLeaderboard();
      
      return res.status(200).json({ success: true, message: 'Leaderboard recalculated' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function recalculateLeaderboard() {
  try {
    // Get all users with their contributions
    const { data: perspectives } = await supabase
      .from('perspectives')
      .select(`
        author_name,
        likes,
        created_at,
        perspective_analysis (
          quality_score,
          bias_score
        )
      `);

    const { data: userScenarios } = await supabase
      .from('user_scenarios')
      .select('author_name, author_email, status, votes_up, votes_down')
      .eq('status', 'approved');

         const { data: perspectiveRatings } = await supabase
       .from('perspective_ratings')
       .select(`
         perspectives (author_name),
         quality_rating,
         thoughtfulness_rating
       `);

     // Aggregate user metrics
     const userMetrics = new Map<string, any>();

     // Process perspectives
     perspectives?.forEach((p: any) => {
       if (!p.author_name) return;
       
       const metrics = userMetrics.get(p.author_name) || {
         username: p.author_name,
         user_email: '', // We'll need to get this from somewhere
         perspectives_count: 0,
         total_quality_score: 0,
         quality_scores: [],
         likes_received: 0,
         scenarios_created: 0,
         helpful_ratings: 0
       };

       metrics.perspectives_count++;
       metrics.likes_received += p.likes || 0;
       
       // Add quality score if available
       if (p.perspective_analysis?.[0]?.quality_score) {
         metrics.quality_scores.push(p.perspective_analysis[0].quality_score);
         metrics.total_quality_score += p.perspective_analysis[0].quality_score;
       }

       userMetrics.set(p.author_name, metrics);
     });

     // Process user scenarios
     userScenarios?.forEach((s: any) => {
       if (!s.author_name) return;
       
       const metrics = userMetrics.get(s.author_name) || {
         username: s.author_name,
         user_email: s.author_email,
         perspectives_count: 0,
         total_quality_score: 0,
         quality_scores: [],
         likes_received: 0,
         scenarios_created: 0,
         helpful_ratings: 0
       };

       metrics.scenarios_created++;
       metrics.user_email = s.author_email;
       userMetrics.set(s.author_name, metrics);
     });

     // Process perspective ratings
     perspectiveRatings?.forEach((r: any) => {
       const authorName = r.perspectives?.author_name;
       if (!authorName) return;
       
       const metrics = userMetrics.get(authorName);
       if (metrics && r.quality_rating >= 4) {
         metrics.helpful_ratings++;
       }
     });

     // Calculate scores and create leaderboard entries
     const leaderboardEntries = Array.from(userMetrics.entries()).map(([username, metrics]) => {
       const avgQualityScore = metrics.quality_scores.length > 0 
         ? metrics.total_quality_score / metrics.quality_scores.length 
         : 0.5;

       const score = calculateUserScore({
         perspectives_count: metrics.perspectives_count,
         avg_quality_score: avgQualityScore,
         likes_received: metrics.likes_received,
         scenarios_created: metrics.scenarios_created,
         helpful_ratings: metrics.helpful_ratings
       });

       return {
         user_email: metrics.user_email || `${username}@unknown.com`,
         username: username,
         category: 'overall',
         score: score,
         rank_position: 0, // Will be set below
         metrics: {
           perspectives_count: metrics.perspectives_count,
           avg_quality_score: avgQualityScore,
           likes_received: metrics.likes_received,
           scenarios_created: metrics.scenarios_created,
           helpful_ratings: metrics.helpful_ratings,
           quality_scores: metrics.quality_scores
         },
         period_start: '2024-01-01',
         period_end: new Date().toISOString().split('T')[0]
       };
     });

     // Sort by score and assign ranks
     leaderboardEntries.sort((a, b) => b.score - a.score);
     leaderboardEntries.forEach((entry, index) => {
       entry.rank_position = index + 1;
     });

    // Clear existing leaderboard
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category', 'overall');

    // Insert new leaderboard entries
    if (leaderboardEntries.length > 0) {
      const { error } = await supabase
        .from('leaderboard_entries')
        .insert(leaderboardEntries);

      if (error) {
        console.error('Error inserting leaderboard entries:', error);
      } else {
        console.log(`Leaderboard updated with ${leaderboardEntries.length} entries`);
      }
    }

  } catch (error) {
    console.error('Error recalculating leaderboard:', error);
  }
} 
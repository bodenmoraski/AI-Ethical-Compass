import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';

interface UserReputation {
  user_email: string;
  reputation_score: number;
  total_perspectives: number;
  avg_quality_score: number;
  total_likes: number;
  helpful_ratings: number;
  scenarios_created: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVE RANKINGS API CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseClient();
      const { 
        scenarioId, 
        rankBy = 'smart_ranking', 
        limit = '50',
        offset = '0',
        includeAnalysis = 'true'
      } = req.query;

      if (!scenarioId) {
        return res.status(400).json({ 
          message: 'scenarioId is required' 
        });
      }

      // First, get user reputation scores
      const userReputations = await calculateUserReputations(supabase);
      const reputationMap = new Map(userReputations.map(u => [u.user_email, u.reputation_score]));

      // Build the base query
      let selectFields = `
        *,
        ${includeAnalysis === 'true' ? `
        perspective_analysis (
          bias_score,
          quality_score,
          ethical_frameworks,
          sentiment_analysis,
          key_themes,
          improvement_suggestions
        ),` : ''}
                 perspective_ratings (
           quality_rating,
           thoughtfulness_rating
         )
      `;

      const { data: perspectives, error } = await supabase
        .from('perspectives')
        .select(selectFields)
        .eq('scenario_id', scenarioId)
        .eq('moderation_status', 'approved');

      if (error) {
        console.error('Error fetching perspectives:', error);
        return res.status(500).json({
          message: 'Failed to fetch perspectives',
          error: error.message
        });
      }

      // Calculate ranking scores and sort
      const rankedPerspectives = (perspectives || []).map((perspective: any) => {
        const userReputation = reputationMap.get(perspective.user_id) || 0;
        const qualityScore = perspective.perspective_analysis?.[0]?.quality_score || 0.5;
        const likes = perspective.likes || 0;
        const helpfulRatings = perspective.perspective_ratings?.reduce((sum: number, r: any) => sum + (r.quality_rating || 0) + (r.thoughtfulness_rating || 0), 0) || 0;
        const recencyBonus = getRecencyBonus(perspective.created_at);

        let rankingScore = 0;

        switch (rankBy) {
          case 'most_liked':
            rankingScore = likes;
            break;
          case 'highest_quality':
            rankingScore = qualityScore * 100;
            break;
          case 'most_reputable':
            rankingScore = userReputation;
            break;
          case 'most_recent':
            rankingScore = new Date(perspective.created_at as string).getTime();
            break;
          case 'oldest_first':
            rankingScore = new Date(perspective.created_at as string).getTime();
            break;
          case 'most_helpful':
            rankingScore = helpfulRatings;
            break;
          case 'smart_ranking':
          default:
            // Smart ranking algorithm combining multiple factors
            rankingScore = (
              (qualityScore * 40) +           // 40% quality
              (userReputation * 0.3) +        // 30% user reputation (scaled)
              (likes * 2) +                   // 20% likes (2 points each)
              (helpfulRatings * 1.5) +        // 15% helpful ratings
              (recencyBonus * 10)             // 10% recency bonus
            );
            break;
        }

        return {
          ...(perspective as object),
          ranking_score: rankingScore,
          user_reputation: userReputation,
          quality_score: qualityScore,
          helpful_count: helpfulRatings,
          recency_bonus: recencyBonus
        };
      });

      // Sort by ranking score (handle different sorting directions)
      rankedPerspectives.sort((a, b) => {
        if (rankBy === 'oldest_first') {
          // For oldest first, sort timestamps in ascending order (older = smaller timestamp)
          return a.ranking_score - b.ranking_score;
        } else {
          // For all other cases, sort in descending order (higher score first)
          return b.ranking_score - a.ranking_score;
        }
      });

      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;
      const paginatedResults = rankedPerspectives.slice(offsetNum, offsetNum + limitNum);

      res.status(200).json({
        perspectives: paginatedResults,
        pagination: {
          offset: offsetNum,
          limit: limitNum,
          total: rankedPerspectives.length
        },
        ranking: {
          rankBy,
          availableOptions: [
            'smart_ranking',
            'most_liked', 
            'highest_quality',
            'most_reputable',
            'most_recent',
            'oldest_first',
            'most_helpful'
          ],
          description: getRankingDescription(rankBy as string)
        },
        metadata: {
          total_users_with_reputation: userReputations.length,
          avg_quality_score: rankedPerspectives.reduce((sum, p) => sum + p.quality_score, 0) / rankedPerspectives.length || 0
        }
      });

    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to rank perspectives',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

async function calculateUserReputations(supabase: any): Promise<UserReputation[]> {
  try {
    // Get user statistics
    const { data: userStats, error } = await supabase
      .from('perspectives')
      .select(`
        user_id,
        perspective_analysis (quality_score),
        likes
      `)
      .not('user_id', 'is', null);

    if (error) {
      console.error('Error fetching user stats:', error);
      return [];
    }

    // Aggregate user data
    const userMap = new Map<string, any>();
    
    userStats?.forEach((perspective: any) => {
      const userId = perspective.user_id;
      if (!userId) return;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_email: userId,
          total_perspectives: 0,
          total_likes: 0,
          quality_scores: [],
          helpful_ratings: 0,
          scenarios_created: 0
        });
      }

      const user = userMap.get(userId);
      user.total_perspectives++;
      user.total_likes += perspective.likes || 0;
      
      if (perspective.perspective_analysis?.[0]?.quality_score) {
        user.quality_scores.push(perspective.perspective_analysis[0].quality_score);
      }
    });

    // Calculate reputation scores
    const reputations: UserReputation[] = Array.from(userMap.values()).map(user => {
      const avgQuality = user.quality_scores.length > 0 
        ? user.quality_scores.reduce((sum: number, score: number) => sum + score, 0) / user.quality_scores.length 
        : 0.5;

      // Reputation formula: weighted combination of factors
      const reputationScore = (
        (user.total_perspectives * 5) +      // 5 points per perspective
        (avgQuality * 50) +                  // Up to 50 points for quality
        (user.total_likes * 2) +             // 2 points per like
        (user.helpful_ratings * 3) +         // 3 points per helpful rating
        (user.scenarios_created * 15)       // 15 points per scenario
      );

      return {
        user_email: user.user_email,
        reputation_score: Math.round(reputationScore),
        total_perspectives: user.total_perspectives,
        avg_quality_score: Math.round(avgQuality * 100) / 100,
        total_likes: user.total_likes,
        helpful_ratings: user.helpful_ratings,
        scenarios_created: user.scenarios_created
      };
    });

    return reputations.sort((a, b) => b.reputation_score - a.reputation_score);

  } catch (error) {
    console.error('Error calculating user reputations:', error);
    return [];
  }
}

function getRecencyBonus(createdAt: string): number {
  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
  
  // Recency bonus: 1.0 for today, decreasing to 0 over 30 days
  return Math.max(0, 1 - (daysDiff / 30));
}

function getRankingDescription(rankBy: string): string {
  const descriptions = {
    'smart_ranking': 'Intelligent ranking combining quality, reputation, engagement, and recency',
    'most_liked': 'Sorted by number of likes received',
    'highest_quality': 'Sorted by AI-assessed quality score',
    'most_reputable': 'Sorted by author reputation score',
    'most_recent': 'Newest perspectives first',
    'oldest_first': 'Oldest perspectives first',
    'most_helpful': 'Sorted by helpful ratings from community'
  };
  
  return descriptions[rankBy as keyof typeof descriptions] || 'Custom ranking';
} 
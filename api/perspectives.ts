import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Perspective } from '../lib/supabase-server.js';
import { analyzePerspective, moderatePerspective } from '../lib/ai-analysis.js';
import { getScenarioById } from '../lib/scenarios-data.js';

// ============================================
// RANKING HELPER FUNCTIONS (merged from perspective-rankings.ts)
// ============================================

interface UserReputation {
  user_email: string;
  reputation_score: number;
  total_perspectives: number;
  avg_quality_score: number;
  total_likes: number;
  helpful_ratings: number;
  scenarios_created: number;
}

async function calculateUserReputations(supabase: any): Promise<UserReputation[]> {
  try {
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

    const reputations: UserReputation[] = Array.from(userMap.values()).map(user => {
      const avgQuality = user.quality_scores.length > 0 
        ? user.quality_scores.reduce((sum: number, score: number) => sum + score, 0) / user.quality_scores.length 
        : 0.5;

      const reputationScore = (
        (user.total_perspectives * 5) +
        (avgQuality * 50) +
        (user.total_likes * 2) +
        (user.helpful_ratings * 3) +
        (user.scenarios_created * 15)
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
  return Math.max(0, 1 - (daysDiff / 30));
}

function getRankingDescription(rankBy: string): string {
  const descriptions: Record<string, string> = {
    'smart_ranking': 'Intelligent ranking combining quality, reputation, engagement, and recency',
    'most_liked': 'Sorted by number of likes received',
    'highest_quality': 'Sorted by AI-assessed quality score',
    'most_reputable': 'Sorted by author reputation score',
    'most_recent': 'Newest perspectives first',
    'oldest_first': 'Oldest perspectives first',
    'most_helpful': 'Sorted by helpful ratings from community'
  };
  return descriptions[rankBy] || 'Custom ranking';
}

// ============================================
// MAIN HANDLER
// ============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES DB API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================
  // RANKINGS ACTION (merged from perspective-rankings.ts)
  // ============================================
  const { action } = req.query;
  
  if (action === 'rankings' && req.method === 'GET') {
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

      // Get user reputation scores
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
            rankingScore = (
              (qualityScore * 40) +
              (userReputation * 0.3) +
              (likes * 2) +
              (helpfulRatings * 1.5) +
              (recencyBonus * 10)
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

      // Sort by ranking score
      rankedPerspectives.sort((a, b) => {
        if (rankBy === 'oldest_first') {
          return a.ranking_score - b.ranking_score;
        } else {
          return b.ranking_score - a.ranking_score;
        }
      });

      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;
      const paginatedResults = rankedPerspectives.slice(offsetNum, offsetNum + limitNum);

      return res.status(200).json({
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
      console.error('Rankings API error:', error);
      return res.status(500).json({
        message: 'Failed to rank perspectives',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Parse URL / query to determine sub-route.
  // Prefer ?action=like|replies&id=... because Vercel only mounts api/perspectives.ts at /api/perspectives
  const url = req.url || '';
  let pathParts = url.split('/').filter(part => part && part !== 'api' && part !== 'perspectives' && !part.includes('?'));

  if ((action === 'like' || action === 'replies') && req.query.id) {
    pathParts = [String(req.query.id), String(action)];
  }
  
  // Handle like functionality: /api/perspectives/[id]/like or ?action=like&id=
  if (pathParts.length === 2 && pathParts[1] === 'like' && req.method === 'POST') {
    const perspectiveId = pathParts[0];
    const { userId, userEmail } = req.body;
    
    if (!perspectiveId) {
      return res.status(400).json({ message: 'Perspective ID is required' });
    }

    const effectiveUserId = userId || userEmail || 'anonymous_user';
    
    try {
      const supabase = getSupabaseClient();
      
      // Check if user already liked this perspective
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('perspective_id', perspectiveId)
        .single();
      
      if (existingLike) {
        return res.status(400).json({
          message: 'You have already liked this perspective',
          already_liked: true
        });
      }
      
      // Add the like to user_likes table
      const { data: newLike, error: insertError } = await supabase
        .from('user_likes')
        .insert({
          user_id: effectiveUserId,
          perspective_id: parseInt(perspectiveId)
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Insert like error:', insertError);
        return res.status(500).json({
          message: 'Failed to record like',
          error: insertError.message
        });
      }
      
      // Get current perspective and increment likes
      const { data: currentPerspective, error: fetchError } = await supabase
        .from('perspectives')
        .select('likes')
        .eq('id', perspectiveId)
        .single();
      
      if (fetchError) {
        return res.status(404).json({
          message: 'Perspective not found',
          error: fetchError.message
        });
      }
      
      // Increment the likes count
      const { data: perspective, error } = await supabase
        .from('perspectives')
        .update({ likes: (currentPerspective.likes || 0) + 1 })
        .eq('id', perspectiveId)
        .select('id, likes')
        .single();
      
      if (error) {
        return res.status(500).json({
          message: 'Failed to like perspective',
          error: error.message
        });
      }
      
      return res.status(200).json({
        id: perspective.id,
        likes: perspective.likes,
        user_like_id: newLike.id,
        message: 'Perspective liked successfully'
      });
      
    } catch (error) {
      console.error('Like error:', error);
      return res.status(500).json({
        message: 'Failed to like perspective',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Handle replies functionality: /api/perspectives/[id]/replies or ?action=replies&id=
  if (pathParts.length === 2 && pathParts[1] === 'replies') {
    const perspectiveId = pathParts[0];
    
    if (!perspectiveId) {
      return res.status(400).json({ message: 'Perspective ID is required' });
    }

    try {
      const supabase = getSupabaseClient();

      if (req.method === 'GET') {
        // Fetch replies
        const { data: replies, error } = await supabase
          .from('replies')
          .select('id, content, author_name, likes, created_at, updated_at')
          .eq('perspective_id', perspectiveId)
          .order('created_at', { ascending: true });
        
        if (error) {
          return res.status(500).json({
            message: 'Failed to fetch replies',
            error: error.message
          });
        }
        
        const formattedReplies = replies?.map(reply => ({
          id: reply.id,
          content: reply.content,
          authorName: reply.author_name,
          likes: reply.likes || 0,
          createdAt: reply.created_at,
          updatedAt: reply.updated_at
        })) || [];
        
        return res.status(200).json(formattedReplies);
        
      } else if (req.method === 'POST') {
        // Create reply
        const { content, authorName } = req.body;
        
        if (!content || !authorName) {
          return res.status(400).json({ message: 'content and authorName are required' });
        }
        
        if (content.trim().length < 5) {
          return res.status(400).json({ message: 'Reply content is too short (minimum 5 characters)' });
        }
        
        if (content.trim().length > 1000) {
          return res.status(400).json({ message: 'Reply content exceeds maximum length of 1000 characters' });
        }
        
        // Verify perspective exists
        const { data: perspectiveCheck, error: perspectiveError } = await supabase
          .from('perspectives')
          .select('id')
          .eq('id', perspectiveId)
          .single();
        
        if (perspectiveError || !perspectiveCheck) {
          return res.status(400).json({ message: `Perspective with ID ${perspectiveId} does not exist` });
        }
        
        // Insert the reply
        const { data: reply, error: insertError } = await supabase
          .from('replies')
          .insert({
            perspective_id: perspectiveId,
            author_name: authorName.trim(),
            content: content.trim(),
            moderation_status: 'approved'
          })
          .select('id, content, author_name, likes, created_at, updated_at')
          .single();
        
        if (insertError) {
          return res.status(500).json({
            message: 'Failed to create reply',
            error: insertError.message
          });
        }
        
        return res.status(201).json({
          id: reply.id,
          content: reply.content,
          authorName: reply.author_name,
          likes: reply.likes || 0,
          createdAt: reply.created_at,
          updatedAt: reply.updated_at
        });
      }
      
    } catch (error) {
      console.error('Replies error:', error);
      return res.status(500).json({
        message: 'Failed to handle replies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Default perspectives functionality (GET and POST for perspectives)
  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseClient();
      const { 
        scenarioId, 
        sortBy = 'newest', 
        limit = '50',
        offset = '0',
        status = 'approved'
      } = req.query;

      if (!scenarioId) {
        return res.status(400).json({ 
          message: 'scenarioId is required' 
        });
      }

      // Build the query
      let query = supabase
        .from('perspectives')
        .select(`
          *,
          perspective_analysis (
            bias_score,
            quality_score,
            ethical_frameworks,
            sentiment_analysis,
            key_themes
          )
        `)
        .eq('scenario_id', scenarioId)
        .eq('moderation_status', status);

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_liked':
          query = query.order('likes', { ascending: false });
          break;
        case 'quality':
          // Join with analysis table and sort by quality score
          query = query.order('created_at', { ascending: false }); // Fallback to newest for now
          break;
        case 'controversial':
          // Sort by perspectives with mixed reactions (high engagement but moderate likes)
          query = query.order('likes', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data: perspectives, error } = await query;

      if (error) {
        console.error('Error fetching perspectives:', error);
        return res.status(500).json({
          message: 'Failed to fetch perspectives',
          error: error.message
        });
      }

      // Post-process sorting for quality-based sorting
      let sortedPerspectives = perspectives || [];
      if (sortBy === 'quality') {
        sortedPerspectives = sortedPerspectives.sort((a, b) => {
          const aQuality = a.perspective_analysis?.[0]?.quality_score || 0;
          const bQuality = b.perspective_analysis?.[0]?.quality_score || 0;
          return bQuality - aQuality;
        });
      }

      res.status(200).json({
        perspectives: sortedPerspectives,
        pagination: {
          offset: offsetNum,
          limit: limitNum,
          total: sortedPerspectives.length
        },
        sorting: {
          sortBy,
          availableOptions: ['newest', 'oldest', 'most_liked', 'quality', 'controversial']
        }
      });

    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to fetch perspectives',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('Processing POST request...');
      
      const supabase = getSupabaseClient();

      // Simple keyword-based relevance guard (deterministic safety net)
      const STOPWORDS = new Set([
        'the','a','an','and','or','but','if','then','else','for','of','on','in','to','from','by','with','is','are','was','were','be','been','being','it','its','as','at','that','this','these','those','about','into','over','under','after','before','while','during','do','does','did','doing','have','has','had','having','i','you','he','she','they','we','them','us','our','your','his','her','their','my','mine','yours','theirs','me'
      ]);
      const normalize = (s: string) => s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const extractKeywords = (title: string, description: string, maxKeywords: number = 25): string[] => {
        const tokens = (normalize(title) + ' ' + normalize(description))
          .split(' ')
          .filter(t => t.length >= 4 && !STOPWORDS.has(t));
        const unique: string[] = [];
        const seen = new Set<string>();
        for (const t of tokens) {
          if (!seen.has(t)) {
            unique.push(t);
            seen.add(t);
          }
          if (unique.length >= maxKeywords) break;
        }
        return unique;
      };
      const countKeywordMatches = (text: string, keywords: string[]): number => {
        const ntext = normalize(text);
        let count = 0;
        for (const kw of keywords) {
          if (ntext.includes(kw)) count++;
        }
        return count;
      };
      
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
      
      // Verify scenario exists and get title/description for moderation
      // Scenarios are bundled from shared/scenarios.json (fs paths break on Vercel)
      const scenarioCheck = getScenarioById(parseInt(scenarioId));
        
      if (!scenarioCheck) {
        console.error(`Scenario ${scenarioId} not found in scenarios.json`);
        return res.status(400).json({ 
          message: `Scenario with ID ${scenarioId} does not exist` 
        });
      }
      
      console.log(`Verified scenario ${scenarioId} exists: "${scenarioCheck.title}"`);

      // Deterministic off-topic rejection if user content does not reference scenario at all
      const scenarioKeywords = extractKeywords(scenarioCheck.title || '', scenarioCheck.description || '');
      const keywordMatches = countKeywordMatches(content, scenarioKeywords);
      if (keywordMatches < 2) {
        return res.status(400).json({
          message: 'Perspective appears off-topic for this scenario',
          issues: ['Insufficient references to scenario details'],
          suggestions: [
            'Reference at least two concrete details from the scenario (e.g., key terms, stakeholders, constraints).',
            'Explain how your points relate to the ethical dilemma described in the scenario.'
          ],
          moderation_result: {
            is_appropriate: true,
            is_on_topic: false,
            quality_score: 0.4,
            issues: ['Insufficient scenario linkage'],
            suggestions: ['Ground your analysis in the scenario context.'],
            moderation_action: 'reject',
            confidence_score: 0.9
          }
        });
      }
      
      // Check for development bypass first
      let moderationStatus = 'approved';
      let moderation;
      
      if (content.includes('{DEVYES}')) {
        console.log('Development bypass detected - auto-approving');
        moderationStatus = 'approved';
        moderation = {
          moderation_action: 'approve',
          is_appropriate: true,
          is_on_topic: true,
          issues: [],
          suggestions: ['Development bypass used']
        };
      } else {
        // Perform AI moderation (include scenario description for relevance checks)
        console.log(`Moderating perspective for scenario: ${scenarioCheck.title}`);
        moderation = await moderatePerspective(
          content.trim(), 
          scenarioCheck.title,
          (scenarioCheck.description || '').toString().slice(0, 1200)
        );
        
        console.log('Moderation result:', {
          action: moderation.moderation_action,
          is_appropriate: moderation.is_appropriate,
          is_on_topic: moderation.is_on_topic,
          issues: moderation.issues,
          suggestions: moderation.suggestions
        });
        
        // Server-side safety net: if model marked off-topic in any case, convert to reject
        if (moderation.is_on_topic === false) {
          console.log('Safety net: Off-topic content converted to reject');
          return res.status(400).json({
            message: 'Perspective was rejected as off-topic',
            issues: [...(moderation.issues || []), 'Off-topic: does not reference the specific scenario details'],
            suggestions: [
              'Explicitly reference details from the scenario (names, constraints, stakeholders) to demonstrate relevance.',
              'Explain how your argument applies to the ethical dilemma described in the scenario.'
            ],
            moderation_result: { ...moderation, moderation_action: 'reject' }
          });
        }

        if (moderation.moderation_action === 'reject') {
          console.log('Moderation rejected the content, returning 400');
          return res.status(400).json({
            message: 'Perspective was rejected by moderation',
            issues: moderation.issues,
            suggestions: moderation.suggestions,
            moderation_result: moderation
          });
        } else if (moderation.moderation_action === 'flag') {
          moderationStatus = 'flagged';
        }
      }
      
      console.log('Preparing to insert perspective with data:', {
        scenario_id: scenarioId,
        author_name: authorName.trim(),
        content_length: content.trim().length,
        user_id: userId || null,
        moderation_status: moderationStatus
      });
      
      // Insert the perspective
      const { data: perspective, error: insertError } = await supabase
        .from('perspectives')
        .insert({
          scenario_id: scenarioId,
          author_name: authorName.trim(),
          content: content.trim(),
          user_id: userId || null,
          moderation_status: moderationStatus
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Database insert error details:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        return res.status(500).json({
          message: 'Failed to create perspective',
          error: insertError.message,
          details: insertError.details
        });
      }
      
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenario_id}`);
      
      // Perform AI analysis in the background (don't block the response)
      analyzePerspective(content.trim())
        .then(async (analysis) => {
          const { error: analysisError } = await supabase
            .from('perspective_analysis')
            .insert({
              perspective_id: perspective.id,
              bias_score: analysis.bias_score,
              quality_score: analysis.quality_score,
              ethical_frameworks: analysis.ethical_frameworks,
              sentiment_analysis: analysis.sentiment_analysis,
              key_themes: analysis.key_themes,
              improvement_suggestions: analysis.improvement_suggestions
            });
          
          if (analysisError) {
            console.error('Error saving AI analysis:', analysisError);
          } else {
            console.log(`AI analysis saved for perspective ${perspective.id}`);
          }
        })
        .catch(error => {
          console.error('Error performing AI analysis:', error);
        });
      
      // Format the response to match the expected format
      res.status(201).json({
        id: perspective.id,
        scenarioId: perspective.scenario_id,
        authorName: perspective.author_name,
        content: perspective.content,
        likes: perspective.likes,
        moderationStatus: perspective.moderation_status,
        createdAt: perspective.created_at,
        updatedAt: perspective.updated_at,
        moderation_result: moderation
      });
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to create perspective',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 
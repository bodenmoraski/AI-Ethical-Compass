import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type Perspective } from '../lib/supabase-server.js';
import { analyzePerspective, moderatePerspective } from '../lib/ai-analysis.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES DB API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
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
      
      // Verify scenario exists and get title for moderation
      const { data: scenarioCheck, error: scenarioError } = await supabase
        .from('scenarios')
        .select('id, title')
        .eq('id', scenarioId)
        .single();
      
      if (scenarioError || !scenarioCheck) {
        console.error('Scenario check error:', scenarioError);
        return res.status(400).json({ 
          message: `Scenario with ID ${scenarioId} does not exist or is not active` 
        });
      }
      
      console.log(`Verified scenario ${scenarioId} exists: "${scenarioCheck.title}"`);
      
      // Perform AI moderation
      console.log(`Moderating perspective for scenario: ${scenarioCheck.title}`);
      const moderation = await moderatePerspective(content.trim(), scenarioCheck.title);
      
      let moderationStatus = 'approved';
      
      if (moderation.moderation_action === 'reject') {
        return res.status(400).json({
          message: 'Perspective was rejected by moderation',
          issues: moderation.issues,
          suggestions: moderation.suggestions,
          moderation_result: moderation
        });
      } else if (moderation.moderation_action === 'flag') {
        moderationStatus = 'flagged';
      }
      
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
        console.error('Insert error:', insertError);
        return res.status(500).json({
          message: 'Failed to create perspective',
          error: insertError.message
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
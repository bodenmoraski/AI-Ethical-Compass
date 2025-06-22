import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { moderateScenario } from '../lib/ai-analysis.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get user scenarios (approved ones for public, all for admin)
      const { status = 'approved', author_email } = req.query;
      
      let query = supabase
        .from('user_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (status === 'approved') {
        query = query.eq('status', 'approved');
      }

      if (author_email) {
        query = query.eq('author_email', author_email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user scenarios:', error);
        return res.status(500).json({ error: 'Failed to fetch scenarios' });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Submit new user scenario
      const { title, description, category, author_name, author_email } = req.body;

      if (!title || !description || !author_name || !author_email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // AI moderation
      console.log('Moderating scenario:', title);
      const moderationResult = await moderateScenario(title, description);

      // Save to database
      const { data, error } = await supabase
        .from('user_scenarios')
        .insert({
          title,
          description,
          category: category || moderationResult.category_suggestion,
          difficulty_level: moderationResult.difficulty_suggestion,
          author_name,
          author_email,
          status: moderationResult.is_appropriate ? 'approved' : 'pending',
          moderation_notes: moderationResult.issues.length > 0 
            ? moderationResult.issues.join('; ') 
            : null,
          ai_analysis: {
            quality_score: moderationResult.quality_score,
            suggestions: moderationResult.suggestions,
            moderated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating scenario:', error);
        return res.status(500).json({ error: 'Failed to create scenario' });
      }

      return res.status(201).json({
        scenario: data,
        moderation: moderationResult
      });
    }

    if (req.method === 'PUT') {
      // Vote on a scenario
      const { scenario_id, user_email, vote_type } = req.body;

      if (!scenario_id || !user_email || !['up', 'down'].includes(vote_type)) {
        return res.status(400).json({ error: 'Invalid vote data' });
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('scenario_votes')
        .select('*')
        .eq('scenario_id', scenario_id)
        .eq('user_email', user_email)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('scenario_votes')
          .update({ vote_type })
          .eq('id', existingVote.id);

        if (error) {
          console.error('Error updating vote:', error);
          return res.status(500).json({ error: 'Failed to update vote' });
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('scenario_votes')
          .insert({
            scenario_id,
            user_email,
            vote_type
          });

        if (error) {
          console.error('Error creating vote:', error);
          return res.status(500).json({ error: 'Failed to create vote' });
        }
      }

      // Update scenario vote counts
      const { data: votes } = await supabase
        .from('scenario_votes')
        .select('vote_type')
        .eq('scenario_id', scenario_id);

      const votesUp = votes?.filter(v => v.vote_type === 'up').length || 0;
      const votesDown = votes?.filter(v => v.vote_type === 'down').length || 0;

      await supabase
        .from('user_scenarios')
        .update({
          votes_up: votesUp,
          votes_down: votesDown
        })
        .eq('id', scenario_id);

      return res.status(200).json({ success: true, votes_up: votesUp, votes_down: votesDown });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
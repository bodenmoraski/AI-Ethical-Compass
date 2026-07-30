import { VercelRequest, VercelResponse } from '@vercel/node';
import { moderateScenario } from '../lib/ai-analysis.js';
import {
  authErrorStatus,
  getServiceClient,
  requireAppUser,
  setCors,
} from '../lib/api-auth.js';

const supabase = getServiceClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { status = 'approved', author_email } = req.query;

      // Anything other than the approved list is private: it can expose pending or
      // rejected submissions, so it is limited to the author and to admins.
      const wantsPrivate = status !== 'approved';
      let scopedEmail = typeof author_email === 'string' ? author_email : undefined;

      if (wantsPrivate) {
        const viewer = await requireAppUser(req, supabase);
        if (viewer.role !== 'admin') {
          if (scopedEmail && scopedEmail !== viewer.email) {
            return res.status(403).json({ error: 'You can only list your own submissions' });
          }
          scopedEmail = viewer.email;
        }
      }

      let query = supabase
        .from('user_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wantsPrivate) {
        query = query.eq('status', 'approved');
      }

      if (scopedEmail) {
        query = query.eq('author_email', scopedEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user scenarios:', error);
        return res.status(500).json({ error: 'Failed to fetch scenarios' });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const author = await requireAppUser(req, supabase);
      const { title, description, category } = req.body || {};

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const cleanTitle = String(title).trim();
      const cleanDescription = String(description).trim();
      if (cleanTitle.length < 5 || cleanTitle.length > 200) {
        return res.status(400).json({ error: 'Title must be 5–200 characters' });
      }
      if (cleanDescription.length < 40 || cleanDescription.length > 10000) {
        return res.status(400).json({ error: 'Description must be 40–10000 characters' });
      }

      const moderationResult = await moderateScenario(cleanTitle, cleanDescription);

      const { data, error } = await supabase
        .from('user_scenarios')
        .insert({
          title: cleanTitle,
          description: cleanDescription,
          category: typeof category === 'string' ? category.slice(0, 100) : moderationResult.category_suggestion,
          difficulty_level: moderationResult.difficulty_suggestion,
          author_name: author.username,
          author_email: author.email,
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
      const voter = await requireAppUser(req, supabase);
      const { scenario_id, vote_type } = req.body || {};

      if (!scenario_id || !['up', 'down'].includes(vote_type)) {
        return res.status(400).json({ error: 'Invalid vote data' });
      }

      const { data: existingVote } = await supabase
        .from('scenario_votes')
        .select('id')
        .eq('scenario_id', scenario_id)
        .eq('user_email', voter.email)
        .maybeSingle();

      if (existingVote) {
        const { error } = await supabase
          .from('scenario_votes')
          .update({ vote_type })
          .eq('id', existingVote.id);

        if (error) {
          console.error('Error updating vote:', error);
          return res.status(500).json({ error: 'Failed to update vote' });
        }
      } else {
        const { error } = await supabase
          .from('scenario_votes')
          .insert({
            scenario_id,
            user_email: voter.email,
            vote_type
          });

        if (error) {
          console.error('Error creating vote:', error);
          return res.status(500).json({ error: 'Failed to create vote' });
        }
      }

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
    const status = authErrorStatus(error);
    if (status === 500) console.error('API Error:', error);
    return res.status(status).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

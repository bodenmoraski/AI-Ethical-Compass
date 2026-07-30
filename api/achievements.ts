import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  authErrorStatus,
  getServiceClient,
  requireAppUser,
  resolveAppUser,
  setCors,
} from '../lib/api-auth.js';
import { ACHIEVEMENTS, checkAndAwardAchievements } from '../lib/achievements.js';

const supabase = getServiceClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const requested = typeof req.query.user_email === 'string' ? req.query.user_email : null;

      if (!requested) {
        // The catalogue itself is public — it is what the badges legend renders from.
        return res.status(200).json(ACHIEVEMENTS);
      }

      // A user's earned achievements are personal, so only the owner may read them.
      const user = await resolveAppUser(req);
      if (!user || user.email.toLowerCase() !== requested.toLowerCase()) {
        return res.status(403).json({ error: 'You can only read your own achievements' });
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_email', user.email)
        .order('earned_date', { ascending: false });

      if (error) {
        console.error('Error fetching user achievements:', error);
        return res.status(500).json({ error: 'Failed to fetch achievements' });
      }

      const withDefinitions = (data || []).map((achievement) => ({
        ...achievement,
        definition: ACHIEVEMENTS.find((a) => a.type === achievement.achievement_type),
      }));

      return res.status(200).json(withDefinitions);
    }

    if (req.method === 'POST') {
      // Identity comes from the token: a caller cannot run award checks for someone else.
      const user = await requireAppUser(req);
      const newAchievements = await checkAndAwardAchievements(user.email);

      return res.status(200).json({
        success: true,
        new_achievements: newAchievements,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const status = authErrorStatus(error);
    if (status === 500) console.error('Achievements API error:', error);
    return res.status(status).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

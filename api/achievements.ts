import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface Achievement {
  type: string;
  name: string;
  description: string;
  icon: string;
  levels: {
    bronze: { threshold: number; description: string };
    silver: { threshold: number; description: string };
    gold: { threshold: number; description: string };
    platinum: { threshold: number; description: string };
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    type: 'thoughtful_contributor',
    name: 'Thoughtful Contributor',
    description: 'Recognized for high-quality ethical perspectives',
    icon: '🧠',
    levels: {
      bronze: { threshold: 5, description: 'Submit 5 quality perspectives' },
      silver: { threshold: 15, description: 'Submit 15 quality perspectives' },
      gold: { threshold: 50, description: 'Submit 50 quality perspectives' },
      platinum: { threshold: 100, description: 'Submit 100 quality perspectives' }
    }
  },
  {
    type: 'scenario_creator',
    name: 'Scenario Creator',
    description: 'Creates engaging ethical dilemmas for the community',
    icon: '✨',
    levels: {
      bronze: { threshold: 1, description: 'Create your first approved scenario' },
      silver: { threshold: 5, description: 'Create 5 approved scenarios' },
      gold: { threshold: 15, description: 'Create 15 approved scenarios' },
      platinum: { threshold: 50, description: 'Create 50 approved scenarios' }
    }
  },
  {
    type: 'community_favorite',
    name: 'Community Favorite',
    description: 'Receives appreciation from fellow users',
    icon: '❤️',
    levels: {
      bronze: { threshold: 10, description: 'Receive 10 likes on your perspectives' },
      silver: { threshold: 50, description: 'Receive 50 likes on your perspectives' },
      gold: { threshold: 200, description: 'Receive 200 likes on your perspectives' },
      platinum: { threshold: 500, description: 'Receive 500 likes on your perspectives' }
    }
  },
  {
    type: 'ethical_reasoner',
    name: 'Ethical Reasoner',
    description: 'Demonstrates sophisticated ethical reasoning',
    icon: '⚖️',
    levels: {
      bronze: { threshold: 0.7, description: 'Maintain 70% average quality score' },
      silver: { threshold: 0.8, description: 'Maintain 80% average quality score' },
      gold: { threshold: 0.9, description: 'Maintain 90% average quality score' },
      platinum: { threshold: 0.95, description: 'Maintain 95% average quality score' }
    }
  },
  {
    type: 'helpful_reviewer',
    name: 'Helpful Reviewer',
    description: 'Provides constructive feedback to others',
    icon: '🤝',
    levels: {
      bronze: { threshold: 10, description: 'Rate 10 perspectives as helpful' },
      silver: { threshold: 50, description: 'Rate 50 perspectives as helpful' },
      gold: { threshold: 200, description: 'Rate 200 perspectives as helpful' },
      platinum: { threshold: 500, description: 'Rate 500 perspectives as helpful' }
    }
  },
  {
    type: 'diverse_thinker',
    name: 'Diverse Thinker',
    description: 'Engages with multiple ethical frameworks',
    icon: '🌈',
    levels: {
      bronze: { threshold: 3, description: 'Use 3 different ethical frameworks' },
      silver: { threshold: 5, description: 'Use 5 different ethical frameworks' },
      gold: { threshold: 8, description: 'Use 8 different ethical frameworks' },
      platinum: { threshold: 10, description: 'Use 10+ different ethical frameworks' }
    }
  }
];

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
      const { user_email } = req.query;

      if (user_email) {
        // Get user's achievements
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_email', user_email)
          .order('earned_date', { ascending: false });

        if (error) {
          console.error('Error fetching user achievements:', error);
          return res.status(500).json({ error: 'Failed to fetch achievements' });
        }

        // Add achievement definitions
        const achievementsWithDefs = data?.map(achievement => ({
          ...achievement,
          definition: ACHIEVEMENTS.find(a => a.type === achievement.achievement_type)
        }));

        return res.status(200).json(achievementsWithDefs || []);
      } else {
        // Return all achievement definitions
        return res.status(200).json(ACHIEVEMENTS);
      }
    }

    if (req.method === 'POST') {
      // Check and award achievements for a user
      const { user_email } = req.body;

      if (!user_email) {
        return res.status(400).json({ error: 'User email required' });
      }

      const newAchievements = await checkAndAwardAchievements(user_email);
      
      return res.status(200).json({ 
        success: true, 
        new_achievements: newAchievements 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkAndAwardAchievements(userEmail: string): Promise<any[]> {
  try {
    // Get user's current achievements
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_type, achievement_level')
      .eq('user_email', userEmail);

    // Get user's statistics
    const { data: perspectives } = await supabase
      .from('perspectives')
      .select(`
        *,
        perspective_analysis (
          quality_score,
          ethical_frameworks
        )
      `)
      .eq('author_name', userEmail); // Assuming author_name stores email for now

    const { data: userScenarios } = await supabase
      .from('user_scenarios')
      .select('*')
      .eq('author_email', userEmail)
      .eq('status', 'approved');

    const { data: perspectiveRatings } = await supabase
      .from('perspective_ratings')
      .select('*')
      .eq('rater_email', userEmail);

    // Calculate metrics
    const perspectivesCount = perspectives?.length || 0;
    const likesReceived = perspectives?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;
    const scenariosCreated = userScenarios?.length || 0;
    const ratingsGiven = perspectiveRatings?.length || 0;

    // Calculate quality scores
    const qualityScores = perspectives
      ?.map(p => p.perspective_analysis?.[0]?.quality_score)
      .filter(score => score !== undefined) || [];
    
    const avgQualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0;

    // Calculate unique ethical frameworks used
    const allFrameworks = perspectives
      ?.flatMap(p => p.perspective_analysis?.[0]?.ethical_frameworks || [])
      .filter(Boolean) || [];
    const uniqueFrameworks = Array.from(new Set(allFrameworks)).length;

    const newAchievements: any[] = [];

    // Check each achievement type
    for (const achievement of ACHIEVEMENTS) {
      let currentValue = 0;
      
      switch (achievement.type) {
        case 'thoughtful_contributor':
          currentValue = perspectivesCount;
          break;
        case 'scenario_creator':
          currentValue = scenariosCreated;
          break;
        case 'community_favorite':
          currentValue = likesReceived;
          break;
        case 'ethical_reasoner':
          currentValue = avgQualityScore;
          break;
        case 'helpful_reviewer':
          currentValue = ratingsGiven;
          break;
        case 'diverse_thinker':
          currentValue = uniqueFrameworks;
          break;
      }

      // Determine highest level achieved
      let highestLevel: string | null = null;
      for (const [level, criteria] of Object.entries(achievement.levels)) {
        if (currentValue >= criteria.threshold) {
          highestLevel = level;
        }
      }

      if (highestLevel) {
        // Check if user already has this achievement at this level
        const existingAchievement = existingAchievements?.find(
          a => a.achievement_type === achievement.type && a.achievement_level === highestLevel
        );

        if (!existingAchievement) {
          // Award new achievement
          const { data: newAchievement, error } = await supabase
            .from('user_achievements')
            .insert({
              user_email: userEmail,
              achievement_type: achievement.type,
              achievement_level: highestLevel,
              criteria_met: {
                current_value: currentValue,
                threshold: achievement.levels[highestLevel as keyof typeof achievement.levels].threshold,
                description: achievement.levels[highestLevel as keyof typeof achievement.levels].description
              }
            })
            .select()
            .single();

          if (!error && newAchievement) {
            newAchievements.push({
              ...newAchievement,
              definition: achievement
            });
          }
        }
      }
    }

    return newAchievements;

  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
} 
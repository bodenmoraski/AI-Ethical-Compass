import { getServiceClient } from './api-auth.js';

export interface AchievementLevel {
  threshold: number;
  description: string;
}

export interface Achievement {
  type: string;
  name: string;
  description: string;
  icon: string;
  levels: {
    bronze: AchievementLevel;
    silver: AchievementLevel;
    gold: AchievementLevel;
    platinum: AchievementLevel;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
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

export interface AchievementMetrics {
  perspectivesCount: number;
  likesReceived: number;
  scenariosCreated: number;
  ratingsGiven: number;
  avgQualityScore: number;
  uniqueFrameworks: number;
}

const LEVEL_ORDER = ['bronze', 'silver', 'gold', 'platinum'] as const;

/** Returns the highest level whose threshold the value meets, or null. */
export function highestLevelFor(achievement: Achievement, value: number): string | null {
  let highest: string | null = null;
  for (const level of LEVEL_ORDER) {
    if (value >= achievement.levels[level].threshold) highest = level;
  }
  return highest;
}

export function metricFor(achievement: Achievement, metrics: AchievementMetrics): number {
  switch (achievement.type) {
    case 'thoughtful_contributor':
      return metrics.perspectivesCount;
    case 'scenario_creator':
      return metrics.scenariosCreated;
    case 'community_favorite':
      return metrics.likesReceived;
    case 'ethical_reasoner':
      return metrics.avgQualityScore;
    case 'helpful_reviewer':
      return metrics.ratingsGiven;
    case 'diverse_thinker':
      return metrics.uniqueFrameworks;
    default:
      return 0;
  }
}

/**
 * Reads the counters an award decision depends on.
 *
 * Perspectives are matched on `user_id`, which stores the author's email and is set
 * from the JWT on submission. The previous implementation matched `author_name`,
 * a free-text display name, so no user ever reached a threshold.
 */
export async function collectMetrics(userEmail: string): Promise<AchievementMetrics> {
  const supabase = getServiceClient();

  const { data: perspectives } = await supabase
    .from('perspectives')
    .select('likes, perspective_analysis (quality_score, ethical_frameworks)')
    .eq('user_id', userEmail)
    .limit(500);

  const { data: userScenarios } = await supabase
    .from('user_scenarios')
    .select('id')
    .eq('author_email', userEmail)
    .eq('status', 'approved')
    .limit(200);

  const { data: perspectiveRatings } = await supabase
    .from('perspective_ratings')
    .select('id')
    .eq('rater_email', userEmail)
    .limit(1000);

  const rows = perspectives || [];

  const qualityScores = rows
    .map((row: any) => row.perspective_analysis?.[0]?.quality_score)
    .filter((score: unknown): score is number => typeof score === 'number');

  const frameworks = rows.flatMap(
    (row: any) => row.perspective_analysis?.[0]?.ethical_frameworks || []
  );

  return {
    perspectivesCount: rows.length,
    likesReceived: rows.reduce((sum: number, row: any) => sum + (row.likes || 0), 0),
    scenariosCreated: userScenarios?.length || 0,
    ratingsGiven: perspectiveRatings?.length || 0,
    avgQualityScore:
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0,
    uniqueFrameworks: new Set(frameworks.filter(Boolean)).size,
  };
}

/**
 * Awards any achievement level the user newly qualifies for.
 *
 * Safe to call after any qualifying action: it is idempotent (existing levels are
 * skipped) and swallows its own errors so it can never fail the triggering request.
 */
export async function checkAndAwardAchievements(userEmail: string): Promise<any[]> {
  if (!userEmail) return [];

  try {
    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_type, achievement_level')
      .eq('user_email', userEmail);

    const metrics = await collectMetrics(userEmail);
    const awarded: any[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const value = metricFor(achievement, metrics);
      const level = highestLevelFor(achievement, value);
      if (!level) continue;

      const alreadyHeld = (existing || []).some(
        (row) => row.achievement_type === achievement.type && row.achievement_level === level
      );
      if (alreadyHeld) continue;

      const criteria = achievement.levels[level as keyof typeof achievement.levels];
      const { data: row, error } = await supabase
        .from('user_achievements')
        .insert({
          user_email: userEmail,
          achievement_type: achievement.type,
          achievement_level: level,
          criteria_met: {
            current_value: value,
            threshold: criteria.threshold,
            description: criteria.description,
          },
        })
        .select()
        .single();

      if (!error && row) {
        awarded.push({ ...row, definition: achievement });
      }
    }

    return awarded;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

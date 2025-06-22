import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PerspectiveAnalysis {
  bias_score: number;
  quality_score: number;
  ethical_frameworks: string[];
  sentiment_analysis: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
  key_themes: string[];
  improvement_suggestions: string;
}

export interface ScenarioModerationResult {
  is_appropriate: boolean;
  quality_score: number;
  issues: string[];
  suggestions: string[];
  category_suggestion: string;
  difficulty_suggestion: 'easy' | 'medium' | 'hard';
}

export interface PerspectiveModerationResult {
  is_appropriate: boolean;
  is_on_topic: boolean;
  quality_score: number;
  issues: string[];
  suggestions: string[];
  moderation_action: 'approve' | 'flag' | 'reject';
  confidence_score: number;
}

export async function analyzePerspective(content: string): Promise<PerspectiveAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key not found, returning mock analysis');
    return getMockPerspectiveAnalysis();
  }

  try {
    const prompt = `
Analyze this ethical perspective for bias, quality, and reasoning patterns:

"${content}"

Please provide a JSON response with:
1. bias_score (0.0-1.0, where 0 is unbiased and 1 is highly biased)
2. quality_score (0.0-1.0, where 1 is highest quality reasoning)
3. ethical_frameworks (array of detected frameworks like "utilitarianism", "deontology", "virtue ethics", "care ethics", etc.)
4. sentiment_analysis (sentiment: positive/neutral/negative, confidence: 0.0-1.0)
5. key_themes (array of main themes discussed)
6. improvement_suggestions (constructive feedback for the author)

Focus on:
- Logical consistency
- Evidence-based reasoning
- Consideration of multiple stakeholders
- Awareness of ethical complexities
- Respectful tone and language
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in ethics and critical thinking. Provide thoughtful, constructive analysis of ethical reasoning. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(response);
    
    // Validate and normalize the response
    return {
      bias_score: Math.max(0, Math.min(1, analysis.bias_score || 0)),
      quality_score: Math.max(0, Math.min(1, analysis.quality_score || 0.5)),
      ethical_frameworks: Array.isArray(analysis.ethical_frameworks) ? analysis.ethical_frameworks : [],
      sentiment_analysis: {
        sentiment: ['positive', 'neutral', 'negative'].includes(analysis.sentiment_analysis?.sentiment) 
          ? analysis.sentiment_analysis.sentiment 
          : 'neutral',
        confidence: Math.max(0, Math.min(1, analysis.sentiment_analysis?.confidence || 0.5))
      },
      key_themes: Array.isArray(analysis.key_themes) ? analysis.key_themes : [],
      improvement_suggestions: analysis.improvement_suggestions || 'Keep up the thoughtful analysis!'
    };

  } catch (error) {
    console.error('Error analyzing perspective:', error);
    return getMockPerspectiveAnalysis();
  }
}

export async function moderatePerspective(content: string, scenarioTitle: string): Promise<PerspectiveModerationResult> {
  // Secret testing bypasses for development
  if (content.includes('__DEV_APPROVE__')) {
    console.log('🧪 DEV: Using secret approve bypass');
    return {
      is_appropriate: true,
      is_on_topic: true,
      quality_score: 0.85,
      issues: [],
      suggestions: ['This is a development test - approved automatically.'],
      moderation_action: 'approve',
      confidence_score: 1.0
    };
  }
  
  if (content.includes('__DEV_REJECT__')) {
    console.log('🧪 DEV: Using secret reject bypass');
    return {
      is_appropriate: false,
      is_on_topic: false,
      quality_score: 0.1,
      issues: ['Development test content', 'Automatically flagged for testing'],
      suggestions: ['This is a development test - rejected automatically.'],
      moderation_action: 'reject',
      confidence_score: 1.0
    };
  }
  
  if (content.includes('__DEV_FLAG__')) {
    console.log('🧪 DEV: Using secret flag bypass');
    return {
      is_appropriate: true,
      is_on_topic: true,
      quality_score: 0.6,
      issues: ['Borderline content for testing'],
      suggestions: ['This is a development test - flagged for review.'],
      moderation_action: 'flag',
      confidence_score: 0.7
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key not found, returning mock moderation');
    return getMockPerspectiveModeration();
  }

  try {
    const prompt = `
Moderate this user-submitted perspective for an ethical discussion platform:

Scenario: "${scenarioTitle}"
Perspective: "${content}"

Please provide a JSON response with:
1. is_appropriate (boolean - is this suitable for an educational ethics platform?)
2. is_on_topic (boolean - does this directly address the ethical scenario?)
3. quality_score (0.0-1.0, where 1 is highest quality ethical reasoning)
4. issues (array of any problems found)
5. suggestions (array of improvement suggestions)
6. moderation_action ("approve", "flag", or "reject")
7. confidence_score (0.0-1.0, how confident you are in this assessment)

Check for:
- Appropriate content (no hate speech, violence, explicit content, harassment)
- On-topic discussion (addresses the ethical dilemma presented)
- Constructive contribution (adds value to the discussion)
- Respectful tone (civil discourse)
- Ethical reasoning (attempts to engage with moral principles)
- Spam or low-effort content

Actions:
- "approve": High quality, appropriate, on-topic
- "flag": Borderline content that needs human review
- "reject": Clearly inappropriate or off-topic
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a content moderator for an educational ethics platform. Be thorough but fair in your assessment. Err on the side of allowing thoughtful discourse while protecting against harmful content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const moderation = JSON.parse(response);
    
    return {
      is_appropriate: Boolean(moderation.is_appropriate),
      is_on_topic: Boolean(moderation.is_on_topic),
      quality_score: Math.max(0, Math.min(1, moderation.quality_score || 0.5)),
      issues: Array.isArray(moderation.issues) ? moderation.issues : [],
      suggestions: Array.isArray(moderation.suggestions) ? moderation.suggestions : [],
      moderation_action: ['approve', 'flag', 'reject'].includes(moderation.moderation_action) 
        ? moderation.moderation_action 
        : 'flag',
      confidence_score: Math.max(0, Math.min(1, moderation.confidence_score || 0.7))
    };

  } catch (error) {
    console.error('Error moderating perspective:', error);
    return getMockPerspectiveModeration();
  }
}

export async function moderateScenario(title: string, description: string): Promise<ScenarioModerationResult> {
  // Secret testing bypasses for development
  if (description.includes('__DEV_APPROVE__')) {
    console.log('🧪 DEV: Using secret scenario approve bypass');
    return {
      is_appropriate: true,
      quality_score: 0.9,
      issues: [],
      suggestions: ['This is a development test scenario - approved automatically.'],
      category_suggestion: 'Development Testing',
      difficulty_suggestion: 'medium'
    };
  }
  
  if (description.includes('__DEV_REJECT__')) {
    console.log('🧪 DEV: Using secret scenario reject bypass');
    return {
      is_appropriate: false,
      quality_score: 0.2,
      issues: ['Development test scenario', 'Automatically rejected for testing'],
      suggestions: ['This is a development test scenario - rejected automatically.'],
      category_suggestion: 'Invalid',
      difficulty_suggestion: 'easy'
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key not found, returning mock moderation');
    return getMockScenarioModeration();
  }

  try {
    const prompt = `
Moderate this user-submitted ethical scenario:

Title: "${title}"
Description: "${description}"

Please provide a JSON response with:
1. is_appropriate (boolean - is this suitable for an educational ethics platform?)
2. quality_score (0.0-1.0, where 1 is highest quality)
3. issues (array of any problems found)
4. suggestions (array of improvement suggestions)
5. category_suggestion (suggested category like "AI Ethics", "Medical Ethics", "Environmental Ethics", etc.)
6. difficulty_suggestion ("easy", "medium", or "hard")

Check for:
- Appropriate content (no hate speech, violence, explicit content)
- Clear ethical dilemma present
- Educational value
- Realistic scenario
- Balanced presentation without obvious bias
- Sufficient detail for meaningful discussion
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a content moderator for an educational ethics platform. Be thorough but fair in your assessment. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const moderation = JSON.parse(response);
    
    return {
      is_appropriate: Boolean(moderation.is_appropriate),
      quality_score: Math.max(0, Math.min(1, moderation.quality_score || 0.5)),
      issues: Array.isArray(moderation.issues) ? moderation.issues : [],
      suggestions: Array.isArray(moderation.suggestions) ? moderation.suggestions : [],
      category_suggestion: moderation.category_suggestion || 'General Ethics',
      difficulty_suggestion: ['easy', 'medium', 'hard'].includes(moderation.difficulty_suggestion) 
        ? moderation.difficulty_suggestion 
        : 'medium'
    };

  } catch (error) {
    console.error('Error moderating scenario:', error);
    return getMockScenarioModeration();
  }
}

function getMockPerspectiveAnalysis(): PerspectiveAnalysis {
  return {
    bias_score: 0.2,
    quality_score: 0.8,
    ethical_frameworks: ['utilitarianism', 'care ethics'],
    sentiment_analysis: {
      sentiment: 'neutral',
      confidence: 0.7
    },
    key_themes: ['stakeholder impact', 'long-term consequences'],
    improvement_suggestions: 'Consider exploring alternative viewpoints to strengthen your analysis.'
  };
}

function getMockPerspectiveModeration(): PerspectiveModerationResult {
  return {
    is_appropriate: true,
    is_on_topic: true,
    quality_score: 0.8,
    issues: [],
    suggestions: ['Consider providing more specific examples to support your reasoning.'],
    moderation_action: 'approve',
    confidence_score: 0.9
  };
}

function getMockScenarioModeration(): ScenarioModerationResult {
  return {
    is_appropriate: true,
    quality_score: 0.7,
    issues: [],
    suggestions: ['Consider adding more specific details about the stakeholders involved.'],
    category_suggestion: 'General Ethics',
    difficulty_suggestion: 'medium'
  };
}

export function calculateUserScore(metrics: {
  perspectives_count: number;
  avg_quality_score: number;
  likes_received: number;
  scenarios_created: number;
  helpful_ratings: number;
}): number {
  const {
    perspectives_count,
    avg_quality_score,
    likes_received,
    scenarios_created,
    helpful_ratings
  } = metrics;

  // Weighted scoring system
  const perspectiveScore = perspectives_count * 10; // 10 points per perspective
  const qualityBonus = (avg_quality_score || 0.5) * perspectiveScore; // Quality multiplier
  const socialScore = likes_received * 5; // 5 points per like
  const creatorScore = scenarios_created * 25; // 25 points per approved scenario
  const helpfulnessScore = helpful_ratings * 3; // 3 points per helpful rating

  return Math.round(perspectiveScore + qualityBonus + socialScore + creatorScore + helpfulnessScore);
} 
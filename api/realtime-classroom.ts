import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Validation schemas
const ActivitySchema = z.object({
  type: z.enum(['discussion', 'submission', 'engagement', 'notification']),
  class_id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  data: z.record(z.any()).optional()
});

const EngagementSchema = z.object({
  class_id: z.number(),
  student_id: z.number(),
  scenario_id: z.number().optional(),
  session_start: z.string().datetime().optional(),
  session_end: z.string().datetime().optional(),
  time_spent_seconds: z.number().optional(),
  actions_taken: z.record(z.any()).optional(),
  perspectives_submitted: z.number().optional(),
  quality_score: z.number().min(0).max(1).optional(),
  engagement_score: z.number().min(0).max(1).optional()
});

// Helper function to authenticate user
const authenticateUser = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify the JWT token and extract user ID
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid or expired token');
    }
    
    return user.id; // Return the actual user ID, not the JWT token
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed');
  }
};

// Real-time activity handlers
const handleRealTimeActivity = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'POST': {
      // Create a new real-time activity
      const validatedData = ActivitySchema.parse(req.body);
      
      const { data: activity, error } = await supabase
        .from('realtime_activities')
        .insert({
          ...validatedData,
          created_by: userId,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, activity });
    }

    case 'GET': {
      // Get recent activities for a class
      const { classId, limit = 50 } = req.query;
      
      if (!classId) throw new Error('Class ID required');

      const { data: activities, error } = await supabase
        .from('realtime_activities')
        .select('*')
        .eq('class_id', classId)
        .order('timestamp', { ascending: false })
        .limit(Number(limit));

      if (error) throw error;

      return res.json({ success: true, activities });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

// Student engagement tracking
const handleStudentEngagement = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'POST': {
      // Update student engagement
      const validatedData = EngagementSchema.parse(req.body);
      
      const { data: engagement, error } = await supabase
        .from('student_engagement')
        .upsert({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Also create a real-time activity for engagement updates
      if (validatedData.engagement_score && validatedData.engagement_score < 30) {
        await supabase
          .from('realtime_activities')
          .insert({
            type: 'engagement',
            class_id: validatedData.class_id,
            user_id: userId,
            title: 'Low Engagement Alert',
            description: `Student showing decreased activity (${validatedData.engagement_score}% engagement)`,
            priority: 'high',
            timestamp: new Date().toISOString(),
            created_by: userId,
            data: { engagement_score: validatedData.engagement_score }
          });
      }

      return res.json({ success: true, engagement });
    }

    case 'GET': {
      // Get engagement data for a class
      const { classId } = req.query;
      
      if (!classId) throw new Error('Class ID required');

      const { data: engagements, error } = await supabase
        .from('student_engagement')
        .select(`
          *,
          users(id, email, name, first_name, last_name, username)
        `)
        .eq('class_id', classId)
        .order('last_active', { ascending: false });

      if (error) throw error;

      return res.json({ success: true, engagements });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

// Live statistics
const handleLiveStats = async (req: VercelRequest, res: VercelResponse) => {
  await authenticateUser(req);

  if (req.method !== 'GET') {
    throw new Error(`Method ${req.method} not allowed`);
  }

  const { classId } = req.query;
  if (!classId) throw new Error('Class ID required');

  // Get active students (engaged in last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  const { data: activeStudents, error: activeError } = await supabase
    .from('student_engagement')
    .select('student_id')
    .eq('class_id', classId)
    .gte('session_start', tenMinutesAgo);

  if (activeError) throw activeError;

  // Get recent activities count
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: recentActivities, error: activitiesError } = await supabase
    .from('realtime_activities')
    .select('type')
    .eq('class_id', classId)
    .gte('timestamp', oneHourAgo);

  if (activitiesError) throw activitiesError;

  // Count by type
  const stats = {
    activeStudents: activeStudents?.length || 0,
    newPosts: recentActivities?.filter(a => a.type === 'discussion').length || 0,
    newSubmissions: recentActivities?.filter(a => a.type === 'submission').length || 0,
    pendingNotifications: recentActivities?.filter(a => a.type === 'notification').length || 0
  };

  return res.json({ success: true, stats });
};

// Connection monitoring
const handleConnectionStatus = async (req: VercelRequest, res: VercelResponse) => {
  await authenticateUser(req);

  if (req.method !== 'GET') {
    throw new Error(`Method ${req.method} not allowed`);
  }

  // Simple health check for real-time connection
  try {
    const { data, error } = await supabase
      .from('realtime_activities')
      .select('id')
      .limit(1);

    if (error) throw error;

    return res.json({ 
      success: true, 
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'activities':
        return await handleRealTimeActivity(req, res);
      case 'engagement':
        return await handleStudentEngagement(req, res);
      case 'stats':
        return await handleLiveStats(req, res);
      case 'connection':
        return await handleConnectionStatus(req, res);
      default:
        throw new Error('Invalid action parameter');
    }
  } catch (error) {
    console.error('Real-time classroom API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 
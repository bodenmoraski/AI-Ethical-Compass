import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  AppUser,
  AuthError,
  authErrorStatus,
  getServiceClient,
  requireAppUser,
  setCors,
} from '../lib/api-auth.js';

const supabase = getServiceClient();

// Validation schemas
const ActivitySchema = z.object({
  type: z.enum(['discussion', 'submission', 'engagement', 'notification']),
  class_id: z.number(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  data: z.record(z.any()).optional()
});

const EngagementSchema = z.object({
  class_id: z.number(),
  student_id: z.number().optional(),
  scenario_id: z.number().optional(),
  session_start: z.string().datetime().optional(),
  session_end: z.string().datetime().optional(),
  time_spent_seconds: z.number().optional(),
  actions_taken: z.record(z.any()).optional(),
  perspectives_submitted: z.number().optional(),
  quality_score: z.number().min(0).max(1).optional(),
  engagement_score: z.number().min(0).max(1).optional()
});

type ClassAccess = 'teacher' | 'student';

/**
 * Classroom telemetry exposes every student's activity, so access is scoped to the
 * class: its teacher (or an admin) may read everything, an enrolled student may only
 * write their own engagement.
 */
async function classAccess(user: AppUser, classId: number): Promise<ClassAccess> {
  if (!Number.isInteger(classId) || classId <= 0) {
    throw new AuthError('A numeric class id is required', 400);
  }

  const { data: classRow } = await supabase
    .from('classes')
    .select('id, teacher_id')
    .eq('id', classId)
    .single();

  if (!classRow) {
    throw new AuthError('Class not found', 404);
  }

  if (user.role === 'admin' || classRow.teacher_id === user.id) {
    return 'teacher';
  }

  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (enrollment) return 'student';

  throw new AuthError('Not a member of this class', 403);
}

async function requireTeacherAccess(user: AppUser, classId: number): Promise<void> {
  const access = await classAccess(user, classId);
  if (access !== 'teacher') {
    throw new AuthError('Teacher access required for this class', 403);
  }
}

// Real-time activity handlers
const handleRealTimeActivity = async (req: VercelRequest, res: VercelResponse, user: AppUser) => {
  switch (req.method) {
    case 'POST': {
      const validatedData = ActivitySchema.parse(req.body);
      await classAccess(user, validatedData.class_id);

      const { data: activity, error } = await supabase
        .from('realtime_activities')
        .insert({
          ...validatedData,
          // The author is always the caller; a client cannot attribute activity to someone else.
          user_id: String(user.id),
          created_by: String(user.id),
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, activity });
    }

    case 'GET': {
      const { limit = 50 } = req.query;
      const classId = Number(req.query.classId);
      await requireTeacherAccess(user, classId);

      const { data: activities, error } = await supabase
        .from('realtime_activities')
        .select('*')
        .eq('class_id', classId)
        .order('timestamp', { ascending: false })
        .limit(Math.min(Number(limit) || 50, 200));

      if (error) throw error;

      return res.json({ success: true, activities });
    }

    default:
      throw new AuthError(`Method ${req.method} not allowed`, 405);
  }
};

// Student engagement tracking
const handleStudentEngagement = async (req: VercelRequest, res: VercelResponse, user: AppUser) => {
  switch (req.method) {
    case 'POST': {
      const validatedData = EngagementSchema.parse(req.body);
      const access = await classAccess(user, validatedData.class_id);

      // Students may only report their own engagement.
      const studentId =
        access === 'teacher' ? validatedData.student_id ?? user.id : user.id;

      const { data: engagement, error } = await supabase
        .from('student_engagement')
        .upsert({
          ...validatedData,
          student_id: studentId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (validatedData.engagement_score !== undefined && validatedData.engagement_score < 0.3) {
        await supabase
          .from('realtime_activities')
          .insert({
            type: 'engagement',
            class_id: validatedData.class_id,
            user_id: String(studentId),
            title: 'Low Engagement Alert',
            description: `Student showing decreased activity (${Math.round(validatedData.engagement_score * 100)}% engagement)`,
            priority: 'high',
            timestamp: new Date().toISOString(),
            created_by: String(user.id),
            data: { engagement_score: validatedData.engagement_score }
          });
      }

      return res.json({ success: true, engagement });
    }

    case 'GET': {
      const classId = Number(req.query.classId);
      await requireTeacherAccess(user, classId);

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
      throw new AuthError(`Method ${req.method} not allowed`, 405);
  }
};

// Live statistics
const handleLiveStats = async (req: VercelRequest, res: VercelResponse, user: AppUser) => {
  if (req.method !== 'GET') {
    throw new AuthError(`Method ${req.method} not allowed`, 405);
  }

  const classId = Number(req.query.classId);
  await requireTeacherAccess(user, classId);

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

  const stats = {
    activeStudents: new Set((activeStudents || []).map((row) => row.student_id)).size,
    newPosts: recentActivities?.filter(a => a.type === 'discussion').length || 0,
    newSubmissions: recentActivities?.filter(a => a.type === 'submission').length || 0,
    pendingNotifications: recentActivities?.filter(a => a.type === 'notification').length || 0
  };

  return res.json({ success: true, stats });
};

// Connection monitoring
const handleConnectionStatus = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    throw new AuthError(`Method ${req.method} not allowed`, 405);
  }

  const { error } = await supabase
    .from('realtime_activities')
    .select('id')
    .limit(1);

  if (error) {
    return res.status(503).json({
      success: false,
      status: 'error',
      error: error.message
    });
  }

  return res.json({
    success: true,
    status: 'connected',
    timestamp: new Date().toISOString()
  });
};

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const user = await requireAppUser(req);
    const { action } = req.query;

    switch (action) {
      case 'activities':
        return await handleRealTimeActivity(req, res, user);
      case 'engagement':
        return await handleStudentEngagement(req, res, user);
      case 'stats':
        return await handleLiveStats(req, res, user);
      case 'connection':
        return await handleConnectionStatus(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action parameter' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid request body', details: error.errors });
    }
    const status = authErrorStatus(error);
    if (status === 500) console.error('Real-time classroom API error:', error);
    return res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

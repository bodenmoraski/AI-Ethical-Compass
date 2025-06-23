import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Auth helper
const authenticateUser = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, jwtSecret) as any;
  return decoded.sub;
};

// Student Analytics Handlers
const handleStudentAnalytics = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);
  
  switch (req.method) {
    case 'GET': {
      const { classId, studentId, timeframe = '30d' } = req.query;

      if (!classId) {
        throw new Error('Class ID is required');
      }

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Build analytics query
      let query = supabase
        .from('student_engagement')
        .select(`
          *,
          user_profiles(display_name, email)
        `)
        .eq('class_id', classId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data: engagementData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate analytics
      const analytics = {
        totalEngagements: engagementData?.length || 0,
        averageScore: engagementData?.reduce((sum, eng) => sum + (eng.quality_score || 0), 0) / (engagementData?.length || 1),
        totalTimeSpent: engagementData?.reduce((sum, eng) => sum + (eng.time_spent || 0), 0),
        activityByDay: {},
        studentStats: {}
      };

      // Group by student
      engagementData?.forEach(engagement => {
        const studentId = engagement.student_id;
        if (!analytics.studentStats[studentId]) {
          analytics.studentStats[studentId] = {
            displayName: engagement.user_profiles?.display_name || 'Unknown',
            email: engagement.user_profiles?.email,
            totalEngagements: 0,
            averageScore: 0,
            totalTimeSpent: 0,
            lastActivity: null
          };
        }

        const stats = analytics.studentStats[studentId];
        stats.totalEngagements++;
        stats.totalTimeSpent += engagement.time_spent || 0;
        stats.lastActivity = engagement.created_at;
        
        // Calculate running average
        stats.averageScore = ((stats.averageScore * (stats.totalEngagements - 1)) + (engagement.quality_score || 0)) / stats.totalEngagements;
      });

      return res.json({ success: true, analytics });
    }

    case 'POST': {
      const { classId, studentId, activityType, scenarioId, timeSpent, qualityScore, metadata } = req.body;

      if (!classId || !studentId || !activityType) {
        throw new Error('Class ID, student ID, and activity type are required');
      }

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      const { data: engagement, error } = await supabase
        .from('student_engagement')
        .insert({
          class_id: classId,
          student_id: studentId,
          activity_type: activityType,
          scenario_id: scenarioId,
          time_spent: timeSpent || 0,
          quality_score: qualityScore,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, engagement });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

// Real-time Classroom Handlers
const handleRealtimeClassroom = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'GET': {
      const { classId, type } = req.query;

      if (!classId) {
        throw new Error('Class ID is required');
      }

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id, name')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      switch (type) {
        case 'activity': {
          // Get recent activity feed
          const { data: activities, error } = await supabase
            .from('student_engagement')
            .select(`
              *,
              user_profiles(display_name)
            `)
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          return res.json({ success: true, activities });
        }

        case 'discussions': {
          // Get recent discussion threads
          const { data: discussions, error } = await supabase
            .from('discussion_threads')
            .select(`
              *,
              user_profiles(display_name),
              discussion_posts(count)
            `)
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          return res.json({ success: true, discussions });
        }

        case 'submissions': {
          // Get recent assignment submissions
          const { data: submissions, error } = await supabase
            .from('assignment_submissions')
            .select(`
              *,
              assignments(title),
              user_profiles(display_name)
            `)
            .eq('assignments.class_id', classId)
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          return res.json({ success: true, submissions });
        }

        case 'notifications': {
          // Get recent notifications for the class
          const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('class_id', classId)
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          return res.json({ success: true, notifications });
        }

        default: {
          // Return overall classroom status
          const now = new Date();
          const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

          // Get active students (those who had activity in last 10 minutes)
          const { data: activeStudents, error: studentsError } = await supabase
            .from('student_engagement')
            .select('student_id, user_profiles(display_name)')
            .eq('class_id', classId)
            .gte('created_at', tenMinutesAgo.toISOString())
            .order('created_at', { ascending: false });

          if (studentsError) throw studentsError;

          // Get total student count
          const { count: totalStudents } = await supabase
            .from('class_students')
            .select('*', { count: 'exact' })
            .eq('class_id', classId);

          // Get recent activity count
          const { count: recentActivity } = await supabase
            .from('student_engagement')
            .select('*', { count: 'exact' })
            .eq('class_id', classId)
            .gte('created_at', tenMinutesAgo.toISOString());

          const status = {
            className: classData.name,
            totalStudents: totalStudents || 0,
            activeStudents: activeStudents?.length || 0,
            recentActivity: recentActivity || 0,
            activeStudentsList: activeStudents || [],
            lastUpdated: now.toISOString()
          };

          return res.json({ success: true, status });
        }
      }
    }

    case 'POST': {
      const { classId, type, data } = req.body;

      if (!classId || !type) {
        throw new Error('Class ID and type are required');
      }

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      switch (type) {
        case 'notification': {
          const { message, priority = 'normal', targetStudents } = data;

          if (!message) {
            throw new Error('Message is required for notifications');
          }

          // Send notification to specific students or all class members
          const recipients = targetStudents || [];
          
          if (recipients.length === 0) {
            // Get all students in class if no specific targets
            const { data: students } = await supabase
              .from('class_students')
              .select('student_id')
              .eq('class_id', classId);

            recipients.push(...(students?.map(s => s.student_id) || []));
          }

          const notifications = recipients.map(studentId => ({
            recipient_id: studentId,
            sender_id: userId,
            class_id: classId,
            type: 'classroom_update',
            title: 'Classroom Notification',
            message,
            priority,
            metadata: { source: 'live_classroom' }
          }));

          const { data: createdNotifications, error } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

          if (error) throw error;

          return res.status(201).json({ 
            success: true, 
            message: 'Notifications sent',
            count: createdNotifications?.length || 0
          });
        }

        case 'moderation': {
          const { discussionId, postId, action, reason } = data;

          if (!discussionId || !action) {
            throw new Error('Discussion ID and action are required');
          }

          // Add moderation entry
          const { data: moderation, error } = await supabase
            .from('moderation_queue')
            .insert({
              class_id: classId,
              discussion_id: discussionId,
              post_id: postId,
              moderator_id: userId,
              action,
              reason: reason || `Teacher ${action} content`,
              status: 'resolved'
            })
            .select()
            .single();

          if (error) throw error;

          return res.status(201).json({ success: true, moderation });
        }

        default:
          throw new Error(`Unknown type: ${type}`);
      }
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint } = req.query;

    switch (endpoint) {
      case 'analytics':
        return await handleStudentAnalytics(req, res);
      case 'realtime':
        return await handleRealtimeClassroom(req, res);
      default:
        // Default to analytics if no endpoint specified
        return await handleStudentAnalytics(req, res);
    }
  } catch (error: any) {
    console.error('Teacher Analytics API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
} 
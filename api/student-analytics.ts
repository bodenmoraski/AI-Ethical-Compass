import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';
import { z } from 'zod';

// Validation schemas
const engagementTrackingSchema = z.object({
  studentId: z.number(),
  classId: z.number(),
  scenarioId: z.number(),
  actionType: z.string(),
  sessionData: z.object({
    timeSpent: z.number(),
    actionsCount: z.number(),
    qualityIndicators: z.object({
      wordCount: z.number().optional(),
      sentimentScore: z.number().optional(),
      complexityScore: z.number().optional(),
    }).optional(),
  }),
});

const exportRequestSchema = z.object({
  classId: z.number(),
  format: z.enum(['pdf', 'csv', 'excel']),
  includeStudentDetails: z.boolean().default(true),
  includeEngagementMetrics: z.boolean().default(true),
  timeRange: z.string().default('30d'),
  dataType: z.string().optional(),
});

// Helper function to get user ID from email
async function getUserIdFromEmail(supabase: any, email: string): Promise<number | null> {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  
  return user?.id || null;
}

// Helper function to verify teacher owns the class
async function verifyClassOwnership(supabase: any, classId: number, teacherId: number): Promise<boolean> {
  const { data: classData } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', teacherId)
    .single();
  
  return !!classData;
}

// Helper function to calculate engagement level
function calculateEngagementLevel(timeSpent: number, perspectivesCount: number, qualityScore: number): string {
  const score = (timeSpent / 3600) * 0.3 + perspectivesCount * 0.4 + qualityScore * 0.3;
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

// Helper function to get date range
function getDateRange(timeRange: string): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
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
  
  return { startDate, endDate };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  try {
    // Mock teacher authentication
    const teacherId = 1;

    // Handle different endpoints based on URL path
    if (req.url?.includes('/engagement')) {
      return await getEngagementMetrics(req, res, supabase, teacherId);
    } else if (req.url?.includes('/progress')) {
      return await getStudentProgress(req, res, supabase, teacherId);
    } else if (req.url?.includes('/class-overview')) {
      return await getClassOverview(req, res, supabase, teacherId);
    } else if (req.url?.includes('/export')) {
      return await exportAnalytics(req, res, supabase, teacherId);
    }

    return res.status(404).json({ message: 'Endpoint not found' });
  } catch (error) {
    console.error('Student Analytics API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getEngagementMetrics(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId, timeRange = '30d', filter } = req.query;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  // Mock engagement data for testing
  const mockEngagementData = {
    classId: parseInt(classId as string),
    timeRange,
    totalStudents: 25,
    activeStudents: 23,
    averageSessionTime: 1240,
    engagementTrends: [
      { date: '2024-10-01', activeStudents: 20, avgTimeSpent: 1200 },
      { date: '2024-10-02', activeStudents: 22, avgTimeSpent: 1300 },
      { date: '2024-10-03', activeStudents: 23, avgTimeSpent: 1240 },
    ],
    studentMetrics: [
      {
        studentId: 2,
        studentName: 'John Doe',
        totalTimeSpent: 4800,
        sessionsCount: 8,
        perspectivesSubmitted: 12,
        averageQualityScore: 0.85,
        lastActive: '2024-10-15T14:30:00Z',
        engagementLevel: 'high'
      },
    ],
  };

  return res.status(200).json(mockEngagementData);
}

async function getStudentProgress(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { studentId, classId } = req.query;

  if (!studentId || !classId) {
    return res.status(400).json({ message: 'Student ID and Class ID are required' });
  }

  // Mock student progress data
  const mockProgressData = {
    studentId: parseInt(studentId as string),
    studentName: 'John Doe',
    overallProgress: {
      scenariosCompleted: 8,
      totalScenarios: 10,
      averageScore: 87.5,
      timeSpent: 4800,
      rank: 3,
    },
    scenarioProgress: [
      {
        scenarioId: 1,
        scenarioTitle: 'AI-Generated Essay',
        completed: true,
        completedAt: '2024-10-10T15:20:00Z',
        perspectivesSubmitted: 2,
        qualityScore: 0.90,
        timeSpent: 480,
      },
    ],
  };

  return res.status(200).json(mockProgressData);
}

async function getClassOverview(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId } = req.query;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  // Mock class overview data
  const mockClassOverview = {
    classId: parseInt(classId as string),
    className: 'Ethics in AI',
    totalStudents: 25,
    analyticsTimeRange: '30d',
    overallMetrics: {
      averageCompletionRate: 0.78,
      averageEngagement: 0.82,
      averageQualityScore: 0.76,
      totalTimeSpent: 32400,
      totalPerspectives: 189,
    },
  };

  return res.status(200).json(mockClassOverview);
}

async function exportAnalytics(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId, format = 'pdf' } = req.body;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  // Mock export response
  const reportId = `report_${Date.now()}`;
  const response = {
    reportId,
    downloadUrl: `/api/reports/download/${reportId}.${format}`,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return res.status(200).json(response);
} 
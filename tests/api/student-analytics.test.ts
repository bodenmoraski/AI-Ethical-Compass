import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/teacher', () => ({ default: mockHandler }));

describe('Student Analytics API', () => {
  beforeEach(() => {
    mockHandler.mockReset();
  });

  describe('GET /api/teacher-analytics/engagement', () => {
    it('should return detailed engagement metrics for a class', async () => {
      const mockEngagementData = {
        classId: 1,
        timeRange: '30d',
        totalStudents: 25,
        activeStudents: 23,
        averageSessionTime: 1240, // seconds
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

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.url?.includes('/engagement')) {
          res.status(200).json(mockEngagementData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/teacher-analytics/engagement',
        query: { classId: '1', timeRange: '30d' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEngagementData);
    });

    it('should filter by low engagement students', async () => {
      const mockLowEngagementData = {
        classId: 1,
        lowEngagementStudents: [
          {
            studentId: 4,
            studentName: 'Bob Wilson',
            totalTimeSpent: 600,
            sessionsCount: 2,
            perspectivesSubmitted: 1,
            lastActive: '2024-10-05T09:15:00Z',
            engagementLevel: 'low',
            concerns: ['infrequent_access', 'low_participation']
          },
        ],
        recommendedActions: [
          {
            studentId: 4,
            actions: ['send_reminder', 'schedule_checkin', 'provide_support_resources']
          }
        ]
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.url?.includes('/engagement') && req.query?.filter === 'low') {
          res.status(200).json(mockLowEngagementData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/teacher-analytics/engagement',
        query: { classId: '1', filter: 'low' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockLowEngagementData);
    });
  });

  describe('GET /api/teacher-analytics/progress', () => {
    it('should return individual student progress details', async () => {
      const mockProgressData = {
        studentId: 2,
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
        assignmentProgress: [
          {
            assignmentId: 1,
            assignmentTitle: 'AI Ethics Discussion',
            submittedAt: '2024-10-15T16:45:00Z',
            score: 92,
            feedback: 'Excellent critical thinking and ethical reasoning.',
            isLate: false,
          },
        ],
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.url?.includes('/progress')) {
          res.status(200).json(mockProgressData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/teacher-analytics/progress',
        query: { studentId: '2', classId: '1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProgressData);
    });
  });

  describe('GET /api/teacher-analytics/class-overview', () => {
    it('should return comprehensive class analytics', async () => {
      const mockClassOverview = {
        classId: 1,
        className: 'Ethics in AI',
        totalStudents: 25,
        analyticsTimeRange: '30d',
        overallMetrics: {
          averageCompletionRate: 0.78,
          averageEngagement: 0.82,
          averageQualityScore: 0.76,
          totalTimeSpent: 32400, // seconds
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.url?.includes('/class-overview')) {
          res.status(200).json(mockClassOverview);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/teacher-analytics/class-overview',
        query: { classId: '1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClassOverview);
    });
  });
}); 
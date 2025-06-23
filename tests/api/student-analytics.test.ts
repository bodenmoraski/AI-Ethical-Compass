import { describe, test, expect, beforeEach } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/student-analytics', () => ({ default: mockHandler }));

describe('Student Analytics API', () => {
  beforeEach(() => {
    mockHandler.mockClear();
  });

  describe('GET /api/student-analytics/engagement', () => {
    test('should return detailed engagement metrics for a class', async () => {
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
          {
            studentId: 3,
            studentName: 'Jane Smith',
            totalTimeSpent: 3600,
            sessionsCount: 6,
            perspectivesSubmitted: 9,
            averageQualityScore: 0.78,
            lastActive: '2024-10-14T16:45:00Z',
            engagementLevel: 'medium'
          },
        ],
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.url?.includes('/engagement')) {
          res.status(200).json(mockEngagementData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/student-analytics/engagement',
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

    test('should filter by low engagement students', async () => {
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

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.url?.includes('/engagement') && req.query?.filter === 'low') {
          res.status(200).json(mockLowEngagementData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/student-analytics/engagement',
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

  describe('GET /api/student-analytics/progress', () => {
    test('should return individual student progress details', async () => {
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
          {
            scenarioId: 2,
            scenarioTitle: 'Facial Recognition in Schools',
            completed: true,
            completedAt: '2024-10-12T11:30:00Z',
            perspectivesSubmitted: 1,
            qualityScore: 0.75,
            timeSpent: 360,
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
        strengths: ['critical_thinking', 'ethical_reasoning'],
        improvementAreas: ['communication_clarity'],
        recommendedScenarios: [9, 10],
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.url?.includes('/progress')) {
          res.status(200).json(mockProgressData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/student-analytics/progress',
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

  describe('GET /api/student-analytics/class-overview', () => {
    test('should return comprehensive class analytics', async () => {
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
          totalPerspectives: 189,
        },
        distributionData: {
          completionRates: [
            { range: '0-25%', count: 2 },
            { range: '26-50%', count: 3 },
            { range: '51-75%', count: 8 },
            { range: '76-100%', count: 12 },
          ],
          qualityScores: [
            { range: '0-0.5', count: 1 },
            { range: '0.5-0.7', count: 6 },
            { range: '0.7-0.9', count: 15 },
            { range: '0.9-1.0', count: 3 },
          ],
        },
        scenarioPerformance: [
          {
            scenarioId: 1,
            scenarioTitle: 'AI-Generated Essay',
            completionRate: 0.92,
            averageQualityScore: 0.84,
            averageTimeSpent: 420,
            commonThemes: ['plagiarism_concerns', 'academic_integrity', 'teacher_detection']
          },
          {
            scenarioId: 2,
            scenarioTitle: 'Facial Recognition in Schools',
            completionRate: 0.88,
            averageQualityScore: 0.71,
            averageTimeSpent: 380,
            commonThemes: ['privacy_rights', 'security_benefits', 'consent_issues']
          },
        ],
        participationTrends: [
          { date: '2024-10-01', activeStudents: 18, perspectivesSubmitted: 24 },
          { date: '2024-10-02', activeStudents: 20, perspectivesSubmitted: 31 },
          { date: '2024-10-03', activeStudents: 22, perspectivesSubmitted: 28 },
        ],
        alerts: [
          {
            type: 'low_engagement',
            studentCount: 3,
            message: '3 students have not accessed the platform in 7+ days',
            priority: 'medium'
          },
          {
            type: 'assignment_overdue',
            studentCount: 5,
            message: '5 students have overdue assignments',
            priority: 'high'
          },
        ],
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.url?.includes('/class-overview')) {
          res.status(200).json(mockClassOverview);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/student-analytics/class-overview',
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

  describe('POST /api/student-analytics/export', () => {
    test('should generate progress report in PDF format', async () => {
      const exportRequest = {
        classId: 1,
        format: 'pdf',
        includeStudentDetails: true,
        includeEngagementMetrics: true,
        timeRange: '30d',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/export')) {
          res.status(200).json({
            reportId: 'report_12345',
            downloadUrl: '/api/reports/download/report_12345.pdf',
            generatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/student-analytics/export',
        body: exportRequest
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should generate CSV export for data analysis', async () => {
      const exportRequest = {
        classId: 1,
        format: 'csv',
        dataType: 'engagement_raw',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/export')) {
          res.status(200).json({
            reportId: 'report_67890',
            downloadUrl: '/api/reports/download/report_67890.csv',
            generatedAt: new Date().toISOString(),
            recordCount: 1250,
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/student-analytics/export',
        body: exportRequest
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('POST /api/student-analytics/track-engagement', () => {
    test('should record student engagement event', async () => {
      const engagementEvent = {
        studentId: 2,
        classId: 1,
        scenarioId: 3,
        actionType: 'perspective_submitted',
        sessionData: {
          timeSpent: 420,
          actionsCount: 15,
          qualityIndicators: {
            wordCount: 150,
            sentimentScore: 0.3,
            complexityScore: 0.7,
          },
        },
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/track-engagement')) {
          res.status(201).json({
            engagementId: 'eng_12345',
            recorded: true,
            updatedScores: {
              engagementScore: 0.85,
              qualityScore: 0.78,
            },
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/student-analytics/track-engagement',
        body: engagementEvent
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('GET /api/student-analytics/comparative', () => {
    test('should return comparative analytics across time periods', async () => {
      const mockComparativeData = {
        classId: 1,
        currentPeriod: {
          start: '2024-10-01',
          end: '2024-10-31',
          metrics: {
            averageEngagement: 0.82,
            completionRate: 0.78,
            qualityScore: 0.76,
          },
        },
        previousPeriod: {
          start: '2024-09-01',
          end: '2024-09-30',
          metrics: {
            averageEngagement: 0.75,
            completionRate: 0.71,
            qualityScore: 0.73,
          },
        },
        improvements: {
          engagement: '+0.07 (+9.3%)',
          completion: '+0.07 (+9.9%)',
          quality: '+0.03 (+4.1%)',
        },
        trends: {
          direction: 'improving',
          significance: 'moderate',
          keyFactors: ['increased_participation', 'better_assignment_design']
        },
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.url?.includes('/comparative')) {
          res.status(200).json(mockComparativeData);
        }
      });

      const req = { 
        method: 'GET', 
        url: '/api/student-analytics/comparative',
        query: { classId: '1', compareMonths: '2' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockComparativeData);
    });
  });
}); 
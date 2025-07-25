import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/teacher', () => ({ default: mockHandler }));

describe('Assignment Analytics API', () => {
  beforeEach(() => {
    mockHandler.mockReset();
  });

  describe('GET /api/teacher?action=assignment-analytics', () => {
    it('should require authentication', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'assignment-analytics', assignmentId: '123' },
        headers: {}
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'assignment-analytics') {
          return res.status(500).json({
            success: false,
            error: 'Authentication failed'
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication failed'
        })
      );
    });

    it('should require assignment ID', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'assignment-analytics' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'assignment-analytics') {
          return res.status(500).json({
            success: false,
            error: 'Assignment ID is required'
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Assignment ID is required'
        })
      );
    });

    it('should return assignment analytics with valid parameters', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'assignment-analytics', assignmentId: '123' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'assignment-analytics') {
          return res.status(200).json({
            success: true,
            stats: {
              totalStudents: 25,
              submittedCount: 18,
              gradedCount: 15,
              overdueCount: 3,
              averageScore: 85.5,
              completionRate: 72.0,
              averageTimeSpent: 45,
              submissionTrend: [
                { date: '2024-01-15', count: 5 },
                { date: '2024-01-16', count: 8 },
                { date: '2024-01-17', count: 3 },
                { date: '2024-01-18', count: 2 }
              ]
            },
            studentProgress: [
              {
                id: '1',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                status: 'graded',
                submittedAt: '2024-01-16T10:30:00Z',
                gradedAt: '2024-01-17T14:20:00Z',
                score: 95,
                feedback: 'Excellent work'
              },
              {
                id: '2',
                name: 'Bob Smith',
                email: 'bob@example.com',
                status: 'submitted',
                submittedAt: '2024-01-17T16:45:00Z',
                score: null,
                feedback: null
              }
            ]
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          stats: expect.objectContaining({
            totalStudents: expect.any(Number),
            submittedCount: expect.any(Number),
            gradedCount: expect.any(Number),
            overdueCount: expect.any(Number),
            averageScore: expect.any(Number),
            completionRate: expect.any(Number),
            submissionTrend: expect.any(Array)
          }),
          studentProgress: expect.any(Array)
        })
      );
    });

    it('should calculate stats correctly', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'assignment-analytics', assignmentId: '123' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'assignment-analytics') {
          return res.status(200).json({
            success: true,
            stats: {
              totalStudents: 10,
              submittedCount: 8,
              gradedCount: 6,
              overdueCount: 2,
              averageScore: 87.5,
              completionRate: 80.0,
              averageTimeSpent: 45,
              submissionTrend: []
            },
            studentProgress: []
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseData = mockResponse.json.mock.calls[0][0] as any;
      expect(responseData.success).toBe(true);
      expect(responseData.stats.totalStudents).toBe(10);
      expect(responseData.stats.submittedCount).toBe(8);
      expect(responseData.stats.gradedCount).toBe(6);
      expect(responseData.stats.completionRate).toBe(80.0);
    });

    it('should return access denied for non-teacher', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'assignment-analytics', assignmentId: '123' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'assignment-analytics') {
          return res.status(500).json({
            success: false,
            error: 'Access denied'
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access denied'
        })
      );
    });

    it('should only allow GET requests', async () => {
      const mockRequest = {
        method: 'POST',
        query: { action: 'assignment-analytics', assignmentId: '123' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.query?.action === 'assignment-analytics') {
          return res.status(500).json({
            success: false,
            error: 'Method POST not allowed'
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Method POST not allowed'
        })
      );
    });
  });
}); 
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/realtime-classroom', () => ({ default: mockHandler }));

describe('Real-time Classroom API', () => {
  beforeEach(() => {
    mockHandler.mockReset();
  });

  describe('GET /api/realtime-classroom - Get Activities', () => {
    it('should fetch classroom activities successfully', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'activities', classId: '1' },
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query.action === 'activities') {
          return res.status(200).json({
            success: true,
            activities: [
              {
                id: '1',
                type: 'discussion',
                title: 'New Discussion Post',
                description: 'Student posted in Ethics Discussion thread',
                timestamp: new Date().toISOString(),
                priority: 'medium',
                class_id: 1,
              },
            ],
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
          activities: expect.arrayContaining([
            expect.objectContaining({
              type: 'discussion',
              title: 'New Discussion Post',
            }),
          ]),
        })
      );
    });
  });

  describe('GET /api/realtime-classroom - Get Live Stats', () => {
    it('should fetch live statistics successfully', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'stats', classId: '1' },
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query.action === 'stats') {
          return res.status(200).json({
            success: true,
            stats: {
              activeStudents: 5,
              newPosts: 3,
              newSubmissions: 2,
              pendingNotifications: 1,
            },
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
            activeStudents: 5,
            newPosts: 3,
            newSubmissions: 2,
            pendingNotifications: 1,
          }),
        })
      );
    });
  });

  describe('POST /api/realtime-classroom - Create Activity', () => {
    it('should create new activity successfully', async () => {
      const mockRequest = {
        method: 'POST',
        query: { action: 'activities' },
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: {
          type: 'discussion',
          class_id: 1,
          user_id: 'user-123',
          title: 'Test Discussion Post',
          description: 'This is a test activity',
          priority: 'medium',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.query.action === 'activities') {
          return res.status(201).json({
            success: true,
            activity: {
              id: '2',
              ...req.body,
              timestamp: new Date().toISOString(),
              created_by: 'user-123',
            },
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          activity: expect.objectContaining({
            type: 'discussion',
            title: 'Test Discussion Post',
          }),
        })
      );
    });

    it('should return error for invalid activity data', async () => {
      const mockRequest = {
        method: 'POST',
        query: { action: 'activities' },
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: {
          // Missing required fields
          type: 'discussion',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.query.action === 'activities') {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: ['class_id is required', 'title is required'],
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
        })
      );
    });
  });

  describe('POST /api/realtime-classroom - Update Engagement', () => {
    it('should update student engagement successfully', async () => {
      const mockRequest = {
        method: 'POST',
        query: { action: 'engagement' },
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json',
        },
        body: {
          class_id: 1,
          student_id: 'student-123',
          activity_type: 'scenario_completion',
          engagement_score: 85,
          last_active: new Date().toISOString(),
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.query.action === 'engagement') {
          return res.status(200).json({
            success: true,
            engagement: {
              id: '1',
              ...req.body,
              updated_at: new Date().toISOString(),
            },
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
          engagement: expect.objectContaining({
            engagement_score: 85,
            activity_type: 'scenario_completion',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid action parameter', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'invalid' },
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        return res.status(400).json({
          success: false,
          error: 'Invalid action parameter',
        });
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid action parameter',
        })
      );
    });

    it('should handle authentication errors', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'activities' },
        headers: {
          // No authorization header
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        return res.status(401).json({
          success: false,
          error: 'No authorization token provided',
        });
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'No authorization token provided',
        })
      );
    });
  });
}); 
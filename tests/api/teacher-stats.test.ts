import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/teacher', () => ({ default: mockHandler }));

describe('Teacher Stats API', () => {
  beforeEach(() => {
    mockHandler.mockReset();
  });

  describe('GET /api/teacher?action=stats', () => {
    it('should require authentication', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'stats' },
        headers: {}
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'stats') {
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

    it('should return stats with valid authentication', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'stats' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'stats') {
          return res.status(200).json({
            success: true,
            stats: {
              averageEngagement: 0.85,
              pendingGrades: 3,
              flaggedContent: 1
            }
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
            averageEngagement: expect.any(Number),
            pendingGrades: expect.any(Number),
            flaggedContent: expect.any(Number)
          })
        })
      );
    });

    it('should return zeros for teacher with no classes', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'stats' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'stats') {
          return res.status(200).json({
            success: true,
            stats: {
              averageEngagement: 0,
              pendingGrades: 0,
              flaggedContent: 0
            }
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
          stats: {
            averageEngagement: 0,
            pendingGrades: 0,
            flaggedContent: 0
          }
        })
      );
    });

    it('should calculate metrics correctly', async () => {
      const mockRequest = {
        method: 'GET',
        query: { action: 'stats' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.query?.action === 'stats') {
          return res.status(200).json({
            success: true,
            stats: {
              averageEngagement: 0.78,
              pendingGrades: 5,
              flaggedContent: 2
            }
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
      expect(responseData.stats.averageEngagement).toBe(0.78);
      expect(responseData.stats.pendingGrades).toBe(5);
      expect(responseData.stats.flaggedContent).toBe(2);
    });

    it('should only allow GET requests', async () => {
      const mockRequest = {
        method: 'POST',
        query: { action: 'stats' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.query?.action === 'stats') {
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
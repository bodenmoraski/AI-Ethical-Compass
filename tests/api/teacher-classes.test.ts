import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/teacher', () => ({ default: mockHandler }));

// Access global mock data
declare const global: any;

describe('Teacher Classes API', () => {
  beforeEach(() => {
    mockHandler.mockReset();
  });

  describe('POST /api/teacher - Create Class', () => {
    it('should create a new class successfully', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/api/teacher/classes',
        headers: { 
          'content-type': 'application/json',
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
        body: {
          name: 'Introduction to AI Ethics',
          description: 'A comprehensive course on ethical AI principles',
          school_year: '2024',
          semester: 'Fall',
          subject: 'Computer Science',
          grade_level: '12',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.url?.includes('/classes')) {
          return res.status(201).json({
            success: true,
            class: {
              id: 1,
              name: 'Introduction to AI Ethics',
              class_code: 'AIETHICS2024',
              ...global.mockClass,
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
          class: expect.objectContaining({
            name: 'Introduction to AI Ethics',
            class_code: 'AIETHICS2024',
          }),
        })
      );
    });

    it('should return error for invalid class data', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/api/teacher/classes',
        headers: { 
          'content-type': 'application/json',
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
        body: {
          name: '', // Invalid: empty name
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'POST' && req.url?.includes('/classes')) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: ['Name is required'],
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

  describe('GET /api/teacher - Get Teacher Classes', () => {
    it('should return teacher classes successfully', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/teacher/classes',
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'GET' && req.url?.includes('/classes')) {
          return res.status(200).json({
            success: true,
            classes: [global.mockClass],
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
          classes: expect.arrayContaining([
            expect.objectContaining({
              name: 'Introduction to AI Ethics',
            }),
          ]),
        })
      );
    });
  });

  describe('PUT /api/teacher - Update Class', () => {
    it('should update class successfully', async () => {
      const mockRequest = {
        method: 'PUT',
        url: '/api/teacher/classes/1',
        headers: { 
          'content-type': 'application/json',
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
        body: {
          name: 'Advanced AI Ethics',
          description: 'Updated description',
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'PUT' && req.url?.includes('/classes')) {
          return res.status(200).json({
            success: true,
            class: {
              ...global.mockClass,
              name: 'Advanced AI Ethics',
              description: 'Updated description',
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
          class: expect.objectContaining({
            name: 'Advanced AI Ethics',
          }),
        })
      );
    });

    it('should return error for unauthorized update', async () => {
      const mockRequest = {
        method: 'PUT',
        url: '/api/teacher/classes/1',
        headers: {
          get: jest.fn().mockReturnValue('Bearer invalid-token'),
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'PUT' && req.url?.includes('/classes')) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized: You can only update your own classes',
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Unauthorized'),
        })
      );
    });
  });

  describe('DELETE /api/teacher - Delete Class', () => {
    it('should delete class successfully', async () => {
      const mockRequest = {
        method: 'DELETE',
        url: '/api/teacher/classes/1',
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'DELETE' && req.url?.includes('/classes')) {
          return res.status(200).json({
            success: true,
            message: 'Class deleted successfully',
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
          message: 'Class deleted successfully',
        })
      );
    });

    it('should return error for non-existent class', async () => {
      const mockRequest = {
        method: 'DELETE',
        url: '/api/teacher/classes/999',
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
      };

      mockHandler.mockImplementation((req: any, res: any) => {
        if (req.method === 'DELETE' && req.url?.includes('/classes')) {
          return res.status(404).json({
            success: false,
            error: 'Class not found',
          });
        }
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Class not found',
        })
      );
    });
  });
}); 
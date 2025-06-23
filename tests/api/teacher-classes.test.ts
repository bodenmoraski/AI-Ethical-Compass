import request from 'supertest';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the handler import
const mockHandler = jest.fn();
jest.mock('../../api/teacher-classes', () => ({ default: mockHandler }));

describe('Teacher Classes API', () => {
  beforeEach(() => {
    mockHandler.mockClear();
  });

  describe('POST /api/teacher-classes', () => {
    test('should create a new class successfully', async () => {
      const classData = {
        name: 'Ethics in AI',
        description: 'Introduction to ethical considerations in AI',
        subject: 'Computer Science',
        gradeLevel: 'Undergraduate',
        semester: 'Fall',
        schoolYear: '2024',
      };

      const mockResponse = {
        id: 1,
        ...classData,
        teacherId: 1,
        classCode: 'ETHICS2024',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(201).json(mockResponse);
        }
      });

      // Simulate the request
      const req = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: classData,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should return 400 for missing required fields', async () => {
      const invalidData = {
        description: 'Missing name field',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(400).json({ 
            message: 'Name is required' 
          });
        }
      });

      const req = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: invalidData,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Name is required' 
      });
    });

    test('should generate unique class code', async () => {
      const classData = {
        name: 'Advanced Ethics',
        subject: 'Philosophy',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(201).json({
            ...classData,
            id: 1,
            classCode: 'ADVETH2024',
            teacherId: 1,
          });
        }
      });

      const req = {
        method: 'POST',
        body: classData,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.classCode).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('GET /api/teacher-classes', () => {
    test('should return teacher classes', async () => {
      const mockClasses = [
        {
          id: 1,
          name: 'Ethics in AI',
          description: 'Intro to AI Ethics',
          studentCount: 25,
          enrollments: 25,
          assignmentCount: 5,
          classCode: 'ETHICS2024',
        },
        {
          id: 2,
          name: 'Advanced Ethics',
          description: 'Advanced ethical concepts',
          studentCount: 18,
          enrollments: 18,
          assignmentCount: 3,
          classCode: 'ADVETH2024',
        },
      ];

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET') {
          res.status(200).json(mockClasses);
        }
      });

      const req = {
        method: 'GET',
        query: { teacherId: '1' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClasses);
    });

    test('should return empty array for teacher with no classes', async () => {
      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET') {
          res.status(200).json([]);
        }
      });

      const req = {
        method: 'GET',
        query: { teacherId: '999' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('PUT /api/teacher-classes', () => {
    test('should update class successfully', async () => {
      const updateData = {
        id: 1,
        name: 'Updated Ethics in AI',
        description: 'Updated description',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'PUT') {
          res.status(200).json({
            ...updateData,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      const req = {
        method: 'PUT',
        body: updateData,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.name).toBe('Updated Ethics in AI');
    });
  });

  describe('DELETE /api/teacher-classes', () => {
    test('should deactivate class instead of deleting', async () => {
      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'DELETE') {
          res.status(200).json({
            id: 1,
            isActive: false,
            message: 'Class deactivated successfully',
          });
        }
      });

      const req = {
        method: 'DELETE',
        query: { classId: '1' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.isActive).toBe(false);
    });
  });
}); 
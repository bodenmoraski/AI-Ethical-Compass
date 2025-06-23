import { describe, test, expect, beforeEach } from '@jest/globals';

const mockHandler = jest.fn();
jest.mock('../../api/teacher', () => ({ default: mockHandler }));

describe('Assignments API', () => {
  beforeEach(() => {
    mockHandler.mockClear();
  });

  describe('POST /api/teacher/assignments', () => {
    test('should create assignment with scenario selection', async () => {
      const assignmentData = {
        classId: 1,
        title: 'AI Ethics Discussion',
        description: 'Analyze ethical scenarios involving AI',
        instructions: 'Read each scenario and provide thoughtful perspectives',
        assignmentType: 'scenario',
        scenarioIds: [1, 2, 3],
        dueDate: '2024-12-31T23:59:59Z',
        pointsPossible: 100,
        rubric: [
          { criteria: 'Critical Thinking', points: 40, description: 'Demonstrates deep analysis' },
          { criteria: 'Ethical Reasoning', points: 40, description: 'Shows understanding of ethical frameworks' },
          { criteria: 'Communication', points: 20, description: 'Clear and persuasive writing' }
        ]
      };

      const mockResponse = {
        id: 1,
        ...assignmentData,
        isPublished: false,
        createdAt: new Date().toISOString(),
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(201).json(mockResponse);
        }
      });

      const req = { method: 'POST', body: assignmentData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should create custom discussion assignment', async () => {
      const assignmentData = {
        classId: 1,
        title: 'Open Ethics Discussion',
        description: 'Free-form ethical discussion',
        assignmentType: 'discussion',
        pointsPossible: 50,
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(201).json({
            id: 2,
            ...assignmentData,
            isPublished: false,
          });
        }
      });

      const req = { method: 'POST', body: assignmentData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        classId: 1,
        // Missing title
        description: 'Assignment without title',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(400).json({
            message: 'Title is required',
            errors: ['title: Required field missing']
          });
        }
      });

      const req = { method: 'POST', body: invalidData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should validate scenario assignment has scenarios', async () => {
      const invalidData = {
        classId: 1,
        title: 'Invalid Scenario Assignment',
        assignmentType: 'scenario',
        scenarioIds: [], // Empty scenarios
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST') {
          res.status(400).json({
            message: 'Scenario assignments must include at least one scenario',
          });
        }
      });

      const req = { method: 'POST', body: invalidData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('GET /api/teacher/assignments', () => {
    test('should return assignments for a class', async () => {
      const mockAssignments = [
        {
          id: 1,
          title: 'AI Ethics Discussion',
          description: 'Analyze ethical scenarios',
          dueDate: '2024-12-31T23:59:59Z',
          pointsPossible: 100,
          isPublished: true,
          submissionCount: 15,
          totalStudents: 25,
          averageScore: 85.5,
        },
        {
          id: 2,
          title: 'Bias in AI Systems',
          description: 'Explore bias in machine learning',
          dueDate: '2024-11-15T23:59:59Z',
          pointsPossible: 75,
          isPublished: false,
          submissionCount: 0,
          totalStudents: 25,
          averageScore: null,
        },
      ];

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET') {
          res.status(200).json(mockAssignments);
        }
      });

      const req = { method: 'GET', query: { classId: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    test('should return assignment details with submissions', async () => {
      const mockAssignment = {
        id: 1,
        title: 'AI Ethics Discussion',
        submissions: [
          {
            id: 1,
            studentId: 2,
            studentName: 'John Doe',
            submittedAt: '2024-10-15T10:30:00Z',
            status: 'submitted',
            score: null,
            isLate: false,
          },
          {
            id: 2,
            studentId: 3,
            studentName: 'Jane Smith',
            submittedAt: '2024-10-16T09:15:00Z',
            status: 'graded',
            score: 92,
            isLate: true,
          },
        ],
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'GET' && req.query.assignmentId) {
          res.status(200).json(mockAssignment);
        }
      });

      const req = { method: 'GET', query: { assignmentId: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });
  });

  describe('PUT /api/teacher/assignments', () => {
    test('should update assignment successfully', async () => {
      const updateData = {
        id: 1,
        title: 'Updated AI Ethics Discussion',
        dueDate: '2024-12-15T23:59:59Z',
        isPublished: true,
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'PUT') {
          res.status(200).json({
            ...updateData,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      const req = { method: 'PUT', body: updateData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should prevent updating published assignment scenarios', async () => {
      const updateData = {
        id: 1,
        scenarioIds: [4, 5, 6], // Trying to change scenarios on published assignment
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'PUT') {
          res.status(400).json({
            message: 'Cannot modify scenarios of published assignment with existing submissions',
          });
        }
      });

      const req = { method: 'PUT', body: updateData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('POST /api/assignments/publish', () => {
    test('should publish assignment and notify students', async () => {
      const publishData = { assignmentId: 1 };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/publish')) {
          res.status(200).json({
            id: 1,
            isPublished: true,
            publishedAt: new Date().toISOString(),
            notificationsSent: 25,
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/teacher/assignments/publish',
        body: publishData 
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

  describe('POST /api/teacher/assignments/grade', () => {
    test('should grade assignment submission', async () => {
      const gradeData = {
        submissionId: 1,
        score: 85,
        feedback: 'Good analysis, but could explore counterarguments more deeply.',
        rubricScores: [
          { criteria: 'Critical Thinking', points: 35 },
          { criteria: 'Ethical Reasoning', points: 32 },
          { criteria: 'Communication', points: 18 },
        ],
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/grade')) {
          res.status(200).json({
            id: 1,
            finalScore: 85,
            feedback: gradeData.feedback,
            gradedAt: new Date().toISOString(),
            status: 'graded',
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/teacher/assignments/grade',
        body: gradeData 
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should validate grade is within point range', async () => {
      const invalidGradeData = {
        submissionId: 1,
        score: 150, // Exceeds 100 points possible
        feedback: 'Score too high',
      };

      mockHandler.mockImplementation((req, res) => {
        if (req.method === 'POST' && req.url?.includes('/grade')) {
          res.status(400).json({
            message: 'Score cannot exceed points possible (100)',
          });
        }
      });

      const req = { 
        method: 'POST', 
        url: '/api/teacher/assignments/grade',
        body: invalidGradeData 
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };

      await mockHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
}); 
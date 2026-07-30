import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { isRubric, scoreRubric } from '../../lib/rubric-scoring';

// Define types for the mock API
interface TemplateData {
  name: string;
  description: string;
  rubric: any;
  assignmentType: string;
  defaultPoints: number;
  defaultDuration: number;
}

interface TemplateResponse {
  success: boolean;
  template?: any;
  error?: string;
  code?: string;
}

interface TemplatesResponse {
  success: boolean;
  templates?: any[];
  error?: string;
}

interface ApplyTemplateResponse {
  success: boolean;
  assignment?: any;
  error?: string;
}

// Mock the teacher API for template functionality
const mockTeacherAPI = {
  createTemplate: jest.fn(),
  getTemplates: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  applyTemplate: jest.fn()
};

describe('Assignment Templates and Rubrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rubric Data Structure', () => {
    it('should validate rubric structure', () => {
      const validRubric = {
        id: 'rubric-1',
        name: 'Ethical Analysis Rubric',
        description: 'Comprehensive rubric for evaluating ethical analysis',
        criteria: [
          {
            id: 'criteria-1',
            name: 'Ethical Framework',
            description: 'Demonstrates understanding of ethical principles',
            maxPoints: 25,
            weight: 25
          },
          {
            id: 'criteria-2',
            name: 'Analysis Depth',
            description: 'Thorough analysis of ethical implications',
            maxPoints: 30,
            weight: 30
          },
          {
            id: 'criteria-3',
            name: 'Critical Thinking',
            description: 'Demonstrates critical evaluation skills',
            maxPoints: 25,
            weight: 25
          },
          {
            id: 'criteria-4',
            name: 'Communication',
            description: 'Clear and effective communication',
            maxPoints: 20,
            weight: 20
          }
        ],
        levels: [
          { id: '1', name: 'Excellent', description: 'Outstanding work', points: 100, color: 'bg-green-100 text-green-800' },
          { id: '2', name: 'Good', description: 'Solid work', points: 85, color: 'bg-blue-100 text-blue-800' },
          { id: '3', name: 'Satisfactory', description: 'Adequate work', points: 70, color: 'bg-yellow-100 text-yellow-800' },
          { id: '4', name: 'Needs Improvement', description: 'Below expectations', points: 55, color: 'bg-orange-100 text-orange-800' },
          { id: '5', name: 'Unsatisfactory', description: 'Significantly below expectations', points: 40, color: 'bg-red-100 text-red-800' }
        ],
        totalPoints: 100
      };

      expect(validRubric.id).toBeDefined();
      expect(validRubric.name).toBeDefined();
      expect(validRubric.criteria).toBeInstanceOf(Array);
      expect(validRubric.criteria.length).toBeGreaterThan(0);
      expect(validRubric.levels).toBeInstanceOf(Array);
      expect(validRubric.levels.length).toBeGreaterThan(0);
      expect(validRubric.totalPoints).toBeGreaterThan(0);
    });

    it('should validate criteria structure', () => {
      const validCriteria = {
        id: 'criteria-1',
        name: 'Ethical Framework',
        description: 'Demonstrates understanding of ethical principles',
        maxPoints: 25,
        weight: 25
      };

      expect(validCriteria.id).toBeDefined();
      expect(validCriteria.name).toBeDefined();
      expect(validCriteria.description).toBeDefined();
      expect(validCriteria.maxPoints).toBeGreaterThan(0);
      expect(validCriteria.weight).toBeGreaterThan(0);
      expect(validCriteria.weight).toBeLessThanOrEqual(100);
    });

    it('should validate grading levels', () => {
      const validLevel = {
        id: '1',
        name: 'Excellent',
        description: 'Outstanding work that exceeds expectations',
        points: 100,
        color: 'bg-green-100 text-green-800'
      };

      expect(validLevel.id).toBeDefined();
      expect(validLevel.name).toBeDefined();
      expect(validLevel.description).toBeDefined();
      expect(validLevel.points).toBeGreaterThanOrEqual(0);
      expect(validLevel.points).toBeLessThanOrEqual(100);
      expect(validLevel.color).toBeDefined();
    });
  });

  describe('Template Management', () => {
    it('should create assignment template successfully', async () => {
      const templateData: TemplateData = {
        name: 'AI Ethics Analysis Template',
        description: 'Standard template for AI ethics assignments',
        rubric: {
          id: 'rubric-1',
          name: 'Ethical Analysis Rubric',
          criteria: [
            { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 },
            { id: '2', name: 'Analysis Depth', maxPoints: 30, weight: 30 },
            { id: '3', name: 'Critical Thinking', maxPoints: 25, weight: 25 },
            { id: '4', name: 'Communication', maxPoints: 20, weight: 20 }
          ],
          levels: [
            { id: '1', name: 'Excellent', points: 100 },
            { id: '2', name: 'Good', points: 85 },
            { id: '3', name: 'Satisfactory', points: 70 }
          ],
          totalPoints: 100
        },
        assignmentType: 'scenario',
        defaultPoints: 100,
        defaultDuration: 60 // minutes
      };

      mockTeacherAPI.createTemplate.mockResolvedValue({
        success: true,
        template: { id: 'template-1', ...templateData }
      });

      const result = await mockTeacherAPI.createTemplate(templateData);
      
      expect(result.success).toBe(true);
      expect(result.template?.id).toBeDefined();
      expect(result.template?.name).toBe(templateData.name);
      expect(result.template?.rubric).toBeDefined();
    });

    it('should retrieve assignment templates', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'AI Ethics Analysis Template',
          description: 'Standard template for AI ethics assignments',
          assignmentType: 'scenario',
          defaultPoints: 100
        },
        {
          id: 'template-2',
          name: 'Discussion Template',
          description: 'Template for discussion assignments',
          assignmentType: 'discussion',
          defaultPoints: 50
        }
      ];

      mockTeacherAPI.getTemplates.mockResolvedValue({
        success: true,
        templates: mockTemplates
      });

      const result = await mockTeacherAPI.getTemplates();
      
      expect(result.success).toBe(true);
      expect(result.templates).toBeInstanceOf(Array);
      expect(result.templates?.length).toBe(2);
      expect(result.templates?.[0].id).toBeDefined();
      expect(result.templates?.[0].name).toBeDefined();
    });

    it('should apply template to assignment', async () => {
      const templateId = 'template-1';
      const assignmentId = 'assignment-1';

      mockTeacherAPI.applyTemplate.mockResolvedValue({
        success: true,
        assignment: {
          id: assignmentId,
          rubric: {
            id: 'rubric-1',
            name: 'Ethical Analysis Rubric',
            criteria: [
              { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 },
              { id: '2', name: 'Analysis Depth', maxPoints: 30, weight: 30 }
            ],
            totalPoints: 100
          }
        }
      });

      const result = await mockTeacherAPI.applyTemplate(templateId, assignmentId);
      
      expect(result.success).toBe(true);
      expect(result.assignment?.id).toBe(assignmentId);
      expect(result.assignment?.rubric).toBeDefined();
      expect(result.assignment?.rubric.criteria.length).toBeGreaterThan(0);
    });
  });

  describe('Rubric Scoring Logic', () => {
    it('should calculate total points correctly', () => {
      const criteria = [
        { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 },
        { id: '2', name: 'Analysis Depth', maxPoints: 30, weight: 30 },
        { id: '3', name: 'Critical Thinking', maxPoints: 25, weight: 25 },
        { id: '4', name: 'Communication', maxPoints: 20, weight: 20 }
      ];

      const totalPoints = criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
      expect(totalPoints).toBe(100);
    });

    it('should validate weight percentages', () => {
      const criteria = [
        { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 },
        { id: '2', name: 'Analysis Depth', maxPoints: 30, weight: 30 },
        { id: '3', name: 'Critical Thinking', maxPoints: 25, weight: 25 },
        { id: '4', name: 'Communication', maxPoints: 20, weight: 20 }
      ];

      const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('should validate scoring ranges', () => {
      const levels = [
        { id: '1', name: 'Excellent', points: 100 },
        { id: '2', name: 'Good', points: 85 },
        { id: '3', name: 'Satisfactory', points: 70 },
        { id: '4', name: 'Needs Improvement', points: 55 },
        { id: '5', name: 'Unsatisfactory', points: 40 }
      ];

      levels.forEach(level => {
        expect(level.points).toBeGreaterThanOrEqual(0);
        expect(level.points).toBeLessThanOrEqual(100);
      });

      // Check descending order
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i - 1].points).toBeGreaterThan(levels[i].points);
      }
    });
  });

  describe('Auto-scoring Functionality', () => {
    const rubric = {
      criteria: [
        { id: '1', name: 'Ethical Framework', maxPoints: 25 },
        { id: '2', name: 'Analysis Depth', maxPoints: 30 },
        { id: '3', name: 'Critical Thinking', maxPoints: 25 },
        { id: '4', name: 'Communication', maxPoints: 20 }
      ]
    };

    it('should apply rubric scoring to submission', () => {
      // 20 + 30 + 18 + 17 = 85 of 100 possible points
      const result = scoreRubric(rubric, { '1': 20, '2': 30, '3': 18, '4': 17 }, 100);

      expect(result.earned).toBe(85);
      expect(result.possible).toBe(100);
      expect(result.percentage).toBe(85);
      expect(result.points).toBe(85);
    });

    it('should handle missing criteria scores', () => {
      const partialRubric = {
        criteria: [
          { id: '1', name: 'Ethical Framework', maxPoints: 25 },
          { id: '2', name: 'Analysis Depth', maxPoints: 30 }
        ]
      };

      // Only the first criterion was scored: 20 of 55 possible.
      const result = scoreRubric(partialRubric, { '1': 20 }, 100);

      expect(result.earned).toBe(20);
      expect(result.possible).toBe(55);
      expect(result.points).toBe(36); // round(20/55 * 100)
    });

    it('should clamp an award above a criterion maximum', () => {
      const result = scoreRubric(rubric, { '1': 999, '2': 0, '3': 0, '4': 0 }, 100);
      expect(result.earned).toBe(25);
      expect(result.perCriterion[0].awarded).toBe(25);
    });

    it('should treat negative and non-numeric awards as zero', () => {
      const result = scoreRubric(rubric, { '1': -10, '2': 'abc', '3': null, '4': undefined }, 100);
      expect(result.earned).toBe(0);
      expect(result.points).toBe(0);
    });

    it('should scale to the assignment points possible', () => {
      const result = scoreRubric(rubric, { '1': 25, '2': 30, '3': 25, '4': 20 }, 50);
      expect(result.percentage).toBe(100);
      expect(result.points).toBe(50);
    });

    it('should not divide by zero for an empty rubric', () => {
      const result = scoreRubric({ criteria: [] }, {}, 100);
      expect(result.percentage).toBe(0);
      expect(result.points).toBe(0);
    });

    it('should recognise valid and invalid rubric shapes', () => {
      expect(isRubric(rubric)).toBe(true);
      expect(isRubric({ criteria: [] })).toBe(false);
      expect(isRubric({})).toBe(false);
      expect(isRubric(null)).toBe(false);
    });
  });

  describe('Template Validation', () => {
    it('should validate template data structure', () => {
      const validTemplate = {
        id: 'template-1',
        name: 'AI Ethics Analysis Template',
        description: 'Standard template for AI ethics assignments',
        rubric: {
          id: 'rubric-1',
          name: 'Ethical Analysis Rubric',
          criteria: [
            { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 }
          ],
          levels: [
            { id: '1', name: 'Excellent', points: 100 }
          ],
          totalPoints: 25
        },
        assignmentType: 'scenario',
        defaultPoints: 100,
        defaultDuration: 60
      };

      expect(validTemplate.id).toBeDefined();
      expect(validTemplate.name).toBeDefined();
      expect(validTemplate.rubric).toBeDefined();
      expect(validTemplate.assignmentType).toBeDefined();
      expect(validTemplate.defaultPoints).toBeGreaterThan(0);
      expect(validTemplate.defaultDuration).toBeGreaterThan(0);
    });

    it('should reject invalid template data', () => {
      const invalidTemplate = {
        name: '', // Empty name
        description: 'Valid description',
        rubric: null, // Missing rubric
        assignmentType: 'invalid_type', // Invalid type
        defaultPoints: -10, // Negative points
        defaultDuration: 0 // Zero duration
      };

      const validateTemplate = (template: any) => {
        const errors = [];
        
        if (!template.name || template.name.trim() === '') {
          errors.push('Template name is required');
        }
        
        if (!template.rubric) {
          errors.push('Rubric is required');
        }
        
        if (!['scenario', 'discussion', 'custom'].includes(template.assignmentType)) {
          errors.push('Invalid assignment type');
        }
        
        if (template.defaultPoints <= 0) {
          errors.push('Default points must be positive');
        }
        
        if (template.defaultDuration <= 0) {
          errors.push('Default duration must be positive');
        }
        
        return errors;
      };

      const errors = validateTemplate(invalidTemplate);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Template name is required');
      expect(errors).toContain('Rubric is required');
      expect(errors).toContain('Invalid assignment type');
      expect(errors).toContain('Default points must be positive');
      expect(errors).toContain('Default duration must be positive');
    });
  });

  describe('API Response Formats', () => {
    it('should format successful template creation response', () => {
      const response: TemplateResponse = {
        success: true,
        template: {
          id: 'template-1',
          name: 'AI Ethics Analysis Template',
          description: 'Standard template for AI ethics assignments',
          rubric: {
            id: 'rubric-1',
            name: 'Ethical Analysis Rubric',
            criteria: [
              { id: '1', name: 'Ethical Framework', maxPoints: 25, weight: 25 }
            ],
            totalPoints: 25
          },
          assignmentType: 'scenario',
          defaultPoints: 100,
          defaultDuration: 60,
          created_at: '2024-01-15T10:00:00Z'
        }
      };

      expect(response.success).toBe(true);
      expect(response.template?.id).toBeDefined();
      expect(response.template?.name).toBeDefined();
      expect(response.template?.rubric).toBeDefined();
      expect(response.template?.created_at).toBeDefined();
    });

    it('should format error responses', () => {
      const errorResponse: TemplateResponse = {
        success: false,
        error: 'Template name is required',
        code: 'VALIDATION_ERROR'
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.code).toBeDefined();
    });
  });
}); 
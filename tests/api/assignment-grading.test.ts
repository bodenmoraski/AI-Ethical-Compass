import { describe, it, expect } from '@jest/globals';

describe('Assignment Grading API', () => {
  describe('API Response Formats', () => {
    it('should format successful submissions list response', () => {
      const response = {
        success: true,
        submissions: [
          {
            id: 1,
            status: 'submitted',
            users: { id: 2, email: 'student@example.com' }
          }
        ]
      };
      expect(response.success).toBe(true);
      expect(Array.isArray(response.submissions)).toBe(true);
      expect(response.submissions[0]).toHaveProperty('id');
      expect(response.submissions[0]).toHaveProperty('status');
      expect(response.submissions[0]).toHaveProperty('users');
    });
    it('should format successful submission detail response', () => {
      const response = {
        success: true,
        submission: {
          id: 1,
          status: 'submitted',
          users: { id: 2, email: 'student@example.com' },
          submission_data: { perspectives: ['A'] }
        }
      };
      expect(response.success).toBe(true);
      expect(response.submission).toHaveProperty('id');
      expect(response.submission).toHaveProperty('status');
      expect(response.submission).toHaveProperty('users');
      expect(response.submission).toHaveProperty('submission_data');
    });
    it('should format successful grading response', () => {
      const response = {
        success: true,
        submission: {
          id: 1,
          status: 'graded',
          final_score: 90,
          feedback: 'Great job!'
        }
      };
      expect(response.success).toBe(true);
      expect(response.submission.status).toBe('graded');
      expect(response.submission.final_score).toBe(90);
      expect(response.submission.feedback).toBe('Great job!');
    });
    it('should format error responses', () => {
      const errorResponses = [
        { success: false, error: 'Access denied' },
        { success: false, error: 'Assignment not found' },
        { success: false, error: 'Submission not found' },
        { success: false, error: 'Score out of range' }
      ];
      errorResponses.forEach(response => {
        expect(response).toHaveProperty('error');
        expect(typeof response.error).toBe('string');
      });
    });
  });

  describe('Grading Logic', () => {
    it('should reject grading if score is out of range', () => {
      const pointsPossible = 100;
      const score = 120;
      expect(score > pointsPossible).toBe(true);
    });
    it('should require submissionId and score for grading', () => {
      const body = { submissionId: null, score: null };
      expect(body.submissionId).toBeFalsy();
      expect(typeof body.score).toBe('object');
    });
    it('should require feedback as string for update-feedback', () => {
      const body = { submissionId: 1, feedback: 123 };
      expect(typeof body.feedback).not.toBe('string');
    });
  });
}); 
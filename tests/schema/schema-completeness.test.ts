/**
 * Schema Completeness Test
 * 
 * This test verifies that ALL database tables from migrations
 * are properly defined in lib/db-schema.ts
 * 
 * This test should FAIL initially, proving the issue exists.
 * After fixing, it should PASS.
 */

import { describe, it, expect } from '@jest/globals';

describe('Schema Completeness Verification', () => {
  describe('Teacher Dashboard Tables', () => {
    it('should have classes table defined in schema', async () => {
      try {
        // Try to import the classes table from schema
        const schema = await import('../../lib/db-schema');
        
        expect(schema.classes).toBeDefined();
        expect(schema.classes).toHaveProperty('id');
        expect(schema.classes).toHaveProperty('name');
        expect(schema.classes).toHaveProperty('teacherId');
        expect(schema.classes).toHaveProperty('classCode');
      } catch (error) {
        throw new Error('classes table not found in lib/db-schema.ts');
      }
    });

    it('should have class_enrollments table defined in schema', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.classEnrollments).toBeDefined();
        expect(schema.classEnrollments).toHaveProperty('id');
        expect(schema.classEnrollments).toHaveProperty('classId');
        expect(schema.classEnrollments).toHaveProperty('studentId');
      } catch (error) {
        throw new Error('class_enrollments table not found in lib/db-schema.ts');
      }
    });

    it('should have assignments table with isPublished field', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.assignments).toBeDefined();
        expect(schema.assignments).toHaveProperty('id');
        expect(schema.assignments).toHaveProperty('classId');
        expect(schema.assignments).toHaveProperty('title');
        expect(schema.assignments).toHaveProperty('isPublished'); // ← CRITICAL
      } catch (error) {
        throw new Error('assignments table not complete in lib/db-schema.ts');
      }
    });

    it('should have assignment_submissions table defined', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.assignmentSubmissions).toBeDefined();
        expect(schema.assignmentSubmissions).toHaveProperty('id');
        expect(schema.assignmentSubmissions).toHaveProperty('assignmentId');
        expect(schema.assignmentSubmissions).toHaveProperty('studentId');
      } catch (error) {
        throw new Error('assignment_submissions table not found in lib/db-schema.ts');
      }
    });

    it('should have notifications table defined', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.notifications).toBeDefined();
        expect(schema.notifications).toHaveProperty('id');
        expect(schema.notifications).toHaveProperty('recipientId');
      } catch (error) {
        throw new Error('notifications table not found in lib/db-schema.ts');
      }
    });

    it('should have student_engagement table defined', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.studentEngagement).toBeDefined();
      } catch (error) {
        throw new Error('student_engagement table not found in lib/db-schema.ts');
      }
    });

    it('should have gradebook_entries table defined', async () => {
      try {
        const schema = await import('../../lib/db-schema');
        
        expect(schema.gradebookEntries).toBeDefined();
      } catch (error) {
        throw new Error('gradebook_entries table not found in lib/db-schema.ts');
      }
    });
  });

  describe('Schema Export Verification', () => {
    it('should export all required tables', async () => {
      const schema = await import('../../lib/db-schema');
      
      const requiredTables = [
        'users',
        'scenarios',
        'perspectives',
        'replies',
        'userProgress',
        'classes',
        'classEnrollments',
        'assignments',
        'assignmentSubmissions',
        'notifications',
        'studentEngagement',
        'gradebookEntries',
      ];

      const missingTables: string[] = [];
      
      for (const tableName of requiredTables) {
        if (!(tableName in schema)) {
          missingTables.push(tableName);
        }
      }

      if (missingTables.length > 0) {
        throw new Error(
          `Missing tables in lib/db-schema.ts: ${missingTables.join(', ')}`
        );
      }

      expect(missingTables.length).toBe(0);
    });
  });
});


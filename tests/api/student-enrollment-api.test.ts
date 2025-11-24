/**
 * Student Enrollment API Test
 * 
 * Verifies the student enrollment API endpoint works correctly
 * This should PASS since we implemented it during integration testing
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

describe('Student Enrollment API', () => {
  let testTeacher: any;
  let testStudent: any;
  let testClass: any;

  beforeAll(async () => {
    // Create test teacher
    const teacherEmail = `test-enroll-teacher-${Date.now()}@test.com`;
    const { data: authData } = await supabase.auth.signUp({
      email: teacherEmail,
      password: 'TestPassword123!',
    });

    await supabase.from('users').insert({
      email: teacherEmail,
      role: 'teacher',
      username: `teacher_${Date.now()}`,
    });

    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: teacherEmail,
      password: 'TestPassword123!',
    });

    testTeacher = {
      email: teacherEmail,
      token: sessionData.session?.access_token,
    };

    // Create test student
    const studentEmail = `test-enroll-student-${Date.now()}@test.com`;
    const { data: studentAuth } = await supabase.auth.signUp({
      email: studentEmail,
      password: 'TestPassword123!',
    });

    await supabase.from('users').insert({
      email: studentEmail,
      role: 'user',
      username: `student_${Date.now()}`,
    });

    const { data: studentSession } = await supabase.auth.signInWithPassword({
      email: studentEmail,
      password: 'TestPassword123!',
    });

    testStudent = {
      email: studentEmail,
      token: studentSession.session?.access_token,
    };

    // Create test class
    const classResponse = await fetch(
      `${API_BASE}/api/teacher?action=classes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testTeacher.token}`,
        },
        body: JSON.stringify({
          name: 'Test Enrollment Class',
          subject: 'Testing',
        }),
      }
    );

    const classData = await classResponse.json();
    testClass = classData.class;
  });

  afterAll(async () => {
    // Cleanup
    if (testClass) {
      await supabase.from('classes').delete().eq('id', testClass.id);
    }
    if (testTeacher) {
      await supabase.from('users').delete().eq('email', testTeacher.email);
    }
    if (testStudent) {
      await supabase.from('users').delete().eq('email', testStudent.email);
    }
  });

  describe('POST /api/student?action=join-class', () => {
    it('should allow student to join class with valid code', async () => {
      const response = await fetch(
        `${API_BASE}/api/student?action=join-class`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testStudent.token}`,
          },
          body: JSON.stringify({
            class_code: testClass.class_code,
          }),
        }
      );

      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.enrollment).toBeDefined();
      expect(data.enrollment.class_id).toBe(testClass.id);
    });

    it('should reject invalid class code', async () => {
      const response = await fetch(
        `${API_BASE}/api/student?action=join-class`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testStudent.token}`,
          },
          body: JSON.stringify({
            class_code: 'INVALID123',
          }),
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should prevent duplicate enrollments', async () => {
      // Try to join the same class again
      const response = await fetch(
        `${API_BASE}/api/student?action=join-class`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testStudent.token}`,
          },
          body: JSON.stringify({
            class_code: testClass.class_code,
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already enrolled');
    });
  });

  describe('GET /api/student?action=classes', () => {
    it('should return enrolled classes for student', async () => {
      const response = await fetch(
        `${API_BASE}/api/student?action=classes`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testStudent.token}`,
          },
        }
      );

      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.classes).toBeDefined();
      expect(Array.isArray(data.classes)).toBe(true);
      
      // Should include the class we just joined
      const enrolledClass = data.classes.find((c: any) => c.id === testClass.id);
      expect(enrolledClass).toBeDefined();
    });
  });
});


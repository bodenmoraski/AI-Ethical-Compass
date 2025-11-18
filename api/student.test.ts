/**
 * Student API Tests
 * 
 * Tests all student enrollment endpoints without mocking
 * Uses real Supabase client with test database
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;
let testTeacherId: number;
let testStudentId: number;
let testClassId: number;
let testClassCode: string;
let testStudentToken: string;
let testTeacherToken: string;

// Helper to make API requests
async function callStudentAPI(action: string, method: string, token: string, body?: any) {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/student?action=${action}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  return { response, data };
}

describe('Student API - Real Integration Tests', () => {
  
  beforeAll(async () => {
    // Initialize Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Create test teacher user
    const { data: teacherAuth, error: teacherAuthError } = await supabase.auth.signUp({
      email: `test-teacher-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });
    
    if (teacherAuthError) throw teacherAuthError;
    testTeacherToken = teacherAuth.session!.access_token;
    
    const { data: teacherUser, error: teacherError } = await supabase
      .from('users')
      .insert({
        email: teacherAuth.user!.email,
        username: `test_teacher_${Date.now()}`,
        role: 'teacher'
      })
      .select()
      .single();
    
    if (teacherError) throw teacherError;
    testTeacherId = teacherUser.id;
    
    // Create test student user
    const { data: studentAuth, error: studentAuthError } = await supabase.auth.signUp({
      email: `test-student-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });
    
    if (studentAuthError) throw studentAuthError;
    testStudentToken = studentAuth.session!.access_token;
    
    const { data: studentUser, error: studentError } = await supabase
      .from('users')
      .insert({
        email: studentAuth.user!.email,
        username: `test_student_${Date.now()}`,
        role: 'user'
      })
      .select()
      .single();
    
    if (studentError) throw studentError;
    testStudentId = studentUser.id;
    
    // Create test class
    testClassCode = 'TST' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .insert({
        name: 'Test Ethics Class',
        teacher_id: testTeacherId,
        class_code: testClassCode,
        is_active: true,
        subject: 'Computer Science',
        grade_level: 'High School'
      })
      .select()
      .single();
    
    if (classError) throw classError;
    testClassId = classData.id;
  });
  
  afterAll(async () => {
    // Clean up test data
    if (testClassId) {
      await supabase.from('class_enrollments').delete().eq('class_id', testClassId);
      await supabase.from('classes').delete().eq('id', testClassId);
    }
    if (testTeacherId) {
      await supabase.from('users').delete().eq('id', testTeacherId);
    }
    if (testStudentId) {
      await supabase.from('users').delete().eq('id', testStudentId);
    }
  });
  
  describe('POST /api/student?action=join-class', () => {
    
    test('should successfully join class with valid code', async () => {
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: testClassCode }
      );
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Successfully joined');
      expect(data.class).toBeDefined();
      expect(data.class.id).toBe(testClassId);
      expect(data.enrollment).toBeDefined();
      
      // Verify enrollment in database
      const { data: enrollment } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('class_id', testClassId)
        .eq('student_id', testStudentId)
        .single();
      
      expect(enrollment).toBeDefined();
      expect(enrollment.status).toBe('active');
    });
    
    test('should reject invalid class code', async () => {
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: 'INVALID' }
      );
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Class not found');
    });
    
    test('should reject duplicate enrollment', async () => {
      // Student already enrolled from previous test
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: testClassCode }
      );
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already enrolled');
    });
    
    test('should require authentication', async () => {
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        'invalid-token',
        { class_code: testClassCode }
      );
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
    
    test('should validate class code format', async () => {
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: 'A' } // Too short
      );
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
    
    test('should convert class code to uppercase', async () => {
      // Create another test class with lowercase code
      const lowercaseCode = 'abc123';
      const { data: newClass } = await supabase
        .from('classes')
        .insert({
          name: 'Lowercase Test Class',
          teacher_id: testTeacherId,
          class_code: lowercaseCode.toUpperCase(),
          is_active: true
        })
        .select()
        .single();
      
      const { response, data } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: lowercaseCode } // Send lowercase
      );
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      
      // Clean up
      await supabase.from('class_enrollments').delete().eq('class_id', newClass!.id);
      await supabase.from('classes').delete().eq('id', newClass!.id);
    });
  });
  
  describe('GET /api/student?action=classes', () => {
    
    test('should return enrolled classes', async () => {
      const { response, data } = await callStudentAPI(
        'classes',
        'GET',
        testStudentToken
      );
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.classes)).toBe(true);
      expect(data.classes.length).toBeGreaterThan(0);
      
      // Verify class details
      const enrolledClass = data.classes.find((c: any) => c.id === testClassId);
      expect(enrolledClass).toBeDefined();
      expect(enrolledClass.name).toBe('Test Ethics Class');
      expect(enrolledClass.class_code).toBe(testClassCode);
      expect(enrolledClass.teacher_name).toBeDefined();
      expect(enrolledClass.enrollment_date).toBeDefined();
      expect(typeof enrolledClass.assignment_count).toBe('number');
    });
    
    test('should return empty array when no enrollments', async () => {
      // Create new student with no enrollments
      const { data: newStudentAuth } = await supabase.auth.signUp({
        email: `test-student-empty-${Date.now()}@example.com`,
        password: 'TestPassword123!'
      });
      
      const newToken = newStudentAuth!.session!.access_token;
      
      await supabase.from('users').insert({
        email: newStudentAuth!.user!.email,
        username: `test_student_empty_${Date.now()}`,
        role: 'user'
      });
      
      const { response, data } = await callStudentAPI(
        'classes',
        'GET',
        newToken
      );
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.classes).toEqual([]);
    });
    
    test('should require authentication', async () => {
      const { response, data } = await callStudentAPI(
        'classes',
        'GET',
        'invalid-token'
      );
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
  
  describe('POST /api/student?action=leave-class', () => {
    
    test('should successfully leave class', async () => {
      // First ensure student is enrolled
      await supabase.from('class_enrollments').upsert({
        class_id: testClassId,
        student_id: testStudentId,
        status: 'active'
      });
      
      const { response, data } = await callStudentAPI(
        'leave-class',
        'POST',
        testStudentToken,
        { class_id: testClassId }
      );
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Successfully left');
      
      // Verify enrollment status changed to 'dropped'
      const { data: enrollment } = await supabase
        .from('class_enrollments')
        .select('status')
        .eq('class_id', testClassId)
        .eq('student_id', testStudentId)
        .single();
      
      expect(enrollment?.status).toBe('dropped');
    });
    
    test('should reject leaving non-enrolled class', async () => {
      // Create class student is not enrolled in
      const { data: newClass } = await supabase
        .from('classes')
        .insert({
          name: 'Not Enrolled Class',
          teacher_id: testTeacherId,
          class_code: 'NEC123',
          is_active: true
        })
        .select()
        .single();
      
      const { response, data } = await callStudentAPI(
        'leave-class',
        'POST',
        testStudentToken,
        { class_id: newClass!.id }
      );
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not enrolled');
      
      // Clean up
      await supabase.from('classes').delete().eq('id', newClass!.id);
    });
    
    test('should require authentication', async () => {
      const { response, data } = await callStudentAPI(
        'leave-class',
        'POST',
        'invalid-token',
        { class_id: testClassId }
      );
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
    
    test('should validate class_id parameter', async () => {
      const { response, data } = await callStudentAPI(
        'leave-class',
        'POST',
        testStudentToken,
        { class_id: -1 }
      );
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
  
  describe('Notifications Integration', () => {
    
    test('should create notifications when joining class', async () => {
      // Re-enroll to trigger notifications
      await supabase.from('class_enrollments').delete()
        .eq('class_id', testClassId)
        .eq('student_id', testStudentId);
      
      // Clear previous notifications
      await supabase.from('notifications').delete()
        .or(`recipient_id.eq.${testStudentId},recipient_id.eq.${testTeacherId}`);
      
      const { response } = await callStudentAPI(
        'join-class',
        'POST',
        testStudentToken,
        { class_code: testClassCode }
      );
      
      expect(response.status).toBe(201);
      
      // Give it a moment for notifications to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check student notification
      const { data: studentNotif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testStudentId)
        .eq('type', 'enrollment_confirmed')
        .single();
      
      expect(studentNotif).toBeDefined();
      expect(studentNotif.title).toContain('Enrolled');
      expect(studentNotif.priority).toBe('high');
      
      // Check teacher notification
      const { data: teacherNotif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testTeacherId)
        .eq('type', 'student_joined')
        .single();
      
      expect(teacherNotif).toBeDefined();
      expect(teacherNotif.title).toContain('Student Enrolled');
      expect(teacherNotif.priority).toBe('medium');
    });
    
    test('should create notification when leaving class', async () => {
      // Clear previous notifications
      await supabase.from('notifications').delete()
        .eq('recipient_id', testTeacherId)
        .eq('type', 'student_left');
      
      const { response } = await callStudentAPI(
        'leave-class',
        'POST',
        testStudentToken,
        { class_id: testClassId }
      );
      
      expect(response.status).toBe(200);
      
      // Give it a moment for notification to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check teacher notification
      const { data: teacherNotif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testTeacherId)
        .eq('type', 'student_left')
        .single();
      
      expect(teacherNotif).toBeDefined();
      expect(teacherNotif.title).toContain('Left Class');
      expect(teacherNotif.priority).toBe('low');
    });
  });
});


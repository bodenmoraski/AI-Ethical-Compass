/**
 * Teacher Access Security Tests
 * 
 * CRITICAL: Tests that the security vulnerability is fixed
 * Teacher access requests MUST stay pending and NOT auto-approve
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;
let testUserId: number;
let testUserEmail: string;
let testUserToken: string;

async function callTeacherAccessAPI(token: string, body: any) {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/teacher?action=access`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  return { response, data };
}

describe('Teacher Access Security Tests - CRITICAL', () => {
  
  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Create test user
    testUserEmail = `test-security-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: 'TestPassword123!'
    });
    
    if (authError) throw authError;
    testUserToken = authData.session!.access_token;
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: testUserEmail,
        username: `test_security_${Date.now()}`,
        role: 'user' // Start as regular user
      })
      .select()
      .single();
    
    if (userError) throw userError;
    testUserId = userData.id;
  });
  
  afterAll(async () => {
    // Clean up
    if (testUserId) {
      await supabase.from('teacher_access_requests').delete().eq('user_id', testUserId);
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });
  
  describe('🔒 CRITICAL SECURITY TEST: No Auto-Approval', () => {
    
    test('SECURITY: Teacher access request must stay PENDING', async () => {
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        institution_name: 'Test High School',
        institution_type: 'High School',
        department: 'Computer Science',
        request_reason: 'Testing that requests stay pending and not auto-approved'
      });
      
      // Should succeed in creating request
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      
      // CRITICAL: Status must be 'pending', NOT 'approved'
      expect(data.status).toBe('pending');
      expect(data.message).toContain('submitted');
      expect(data.message).toContain('review');
      
      // CRITICAL: Should NOT return role = 'teacher'
      expect(data.role).toBeUndefined();
      
      // Verify in database: User role should NOT have changed
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', testUserId)
        .single();
      
      // 🚨 CRITICAL ASSERTION 🚨
      expect(user?.role).toBe('user');
      expect(user?.role).not.toBe('teacher');
      
      // Verify request is pending in database
      const { data: request } = await supabase
        .from('teacher_access_requests')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // 🚨 CRITICAL ASSERTIONS 🚨
      expect(request).toBeDefined();
      expect(request.status).toBe('pending');
      expect(request.reviewed_at).toBeNull();
      expect(request.reviewed_by).toBeNull();
    });
    
    test('SECURITY: No role_change_log entry should exist for pending request', async () => {
      // Check role change log - should be empty
      const { data: logs } = await supabase
        .from('role_change_log')
        .select('*')
        .eq('user_id', testUserId)
        .eq('new_role', 'teacher');
      
      // 🚨 CRITICAL ASSERTION 🚨
      // There should be NO role change logs for this user
      expect(logs).toEqual([]);
    });
    
    test('SECURITY: User should NOT be able to access teacher endpoints', async () => {
      // Try to access teacher dashboard API
      const baseUrl = process.env.API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/teacher?action=classes`, {
        headers: {
          'Authorization': `Bearer ${testUserToken}`
        }
      });
      
      const data = await response.json();
      
      // Should fail because user is not a teacher
      expect(response.status).not.toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Teacher access required');
    });
    
    test('SECURITY: Multiple requests should all stay pending', async () => {
      // Submit another request
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        institution_name: 'Test University',
        institution_type: 'University',
        department: 'Ethics',
        request_reason: 'Second test request to verify all stay pending'
      });
      
      expect(response.status).toBe(201);
      expect(data.status).toBe('pending');
      
      // Verify user still not a teacher
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', testUserId)
        .single();
      
      expect(user?.role).toBe('user');
      
      // Verify all requests are pending
      const { data: requests } = await supabase
        .from('teacher_access_requests')
        .select('status')
        .eq('user_id', testUserId);
      
      expect(requests).toBeDefined();
      requests?.forEach(req => {
        expect(req.status).toBe('pending');
      });
    });
  });
  
  describe('Request Validation', () => {
    
    test('should require institution name', async () => {
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        request_reason: 'Test without institution'
      });
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
    
    test('should require request reason with minimum length', async () => {
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        institution_name: 'Test School',
        request_reason: 'Short' // Too short (< 10 chars)
      });
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
    
    test('should accept valid request', async () => {
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        institution_name: 'Valid Test School',
        institution_type: 'High School',
        department: 'Computer Science',
        request_reason: 'This is a valid request reason with sufficient length'
      });
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.status).toBe('pending');
    });
  });
  
  describe('Already Teacher Check', () => {
    
    test('should reject request if user already has teacher role', async () => {
      // Manually grant teacher role
      await supabase
        .from('users')
        .update({ role: 'teacher' })
        .eq('id', testUserId);
      
      const { response, data } = await callTeacherAccessAPI(testUserToken, {
        userEmail: testUserEmail,
        institution_name: 'Test School',
        request_reason: 'Should be rejected because already teacher'
      });
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.message).toContain('already has teacher access');
      
      // Reset for other tests
      await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', testUserId);
    });
  });
});

describe('🔥 REGRESSION TEST: Verify Old Vulnerability is Fixed', () => {
  
  test('CRITICAL: Confirm auto-approval code has been removed', async () => {
    // Read the actual teacher.ts file
    const fs = await import('fs');
    const path = await import('path');
    const teacherApiPath = path.join(process.cwd(), 'api', 'teacher.ts');
    
    if (fs.existsSync(teacherApiPath)) {
      const content = fs.readFileSync(teacherApiPath, 'utf8');
      
      // Check for dangerous auto-approval patterns
      const dangerousPatterns = [
        /update.*role.*teacher.*status.*approved/i,
        /\.update\(\{\s*role:\s*['"]teacher['"]/i,
        /status:\s*['"]approved['"]/i
      ];
      
      // Look for the security fix comment
      expect(content).toContain('SECURITY FIX');
      expect(content).toContain('pending');
      
      // Ensure no auto-approval code exists
      const hasAutoApproval = dangerousPatterns.some(pattern => 
        pattern.test(content)
      );
      
      if (hasAutoApproval) {
        console.error('🚨 CRITICAL SECURITY VULNERABILITY DETECTED 🚨');
        console.error('Auto-approval code still exists in teacher.ts');
        console.error('The security fix was not properly applied!');
      }
      
      expect(hasAutoApproval).toBe(false);
    }
  });
});


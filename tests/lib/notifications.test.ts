/**
 * Notifications System Tests
 * 
 * Tests all notification functions with real database
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  createNotification,
  notifyTeacherOfEnrollment,
  notifyStudentOfEnrollment,
  notifyTeacherOfUnenrollment,
  notifyStudentOfManualEnrollment,
  notifyStudentOfRemoval,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  getRecentNotifications
} from './notifications';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;
let testUserId: number;
let testTeacherId: number;
let testClassId: number;

describe('Notifications System Tests', () => {
  
  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Create test users
    const { data: user } = await supabase
      .from('users')
      .insert({
        email: `test-notif-user-${Date.now()}@example.com`,
        username: `test_user_${Date.now()}`,
        role: 'user'
      })
      .select()
      .single();
    
    testUserId = user!.id;
    
    const { data: teacher } = await supabase
      .from('users')
      .insert({
        email: `test-notif-teacher-${Date.now()}@example.com`,
        username: `test_teacher_${Date.now()}`,
        role: 'teacher',
        first_name: 'Test',
        last_name: 'Teacher'
      })
      .select()
      .single();
    
    testTeacherId = teacher!.id;
    
    // Create test class
    const { data: classData } = await supabase
      .from('classes')
      .insert({
        name: 'Test Notification Class',
        teacher_id: testTeacherId,
        class_code: 'NTFY01',
        is_active: true
      })
      .select()
      .single();
    
    testClassId = classData!.id;
  });
  
  afterAll(async () => {
    // Clean up
    await supabase.from('notifications').delete().or(`recipient_id.eq.${testUserId},recipient_id.eq.${testTeacherId}`);
    await supabase.from('classes').delete().eq('id', testClassId);
    await supabase.from('users').delete().eq('id', testUserId);
    await supabase.from('users').delete().eq('id', testTeacherId);
  });
  
  describe('createNotification', () => {
    
    test('should create notification successfully', async () => {
      const result = await createNotification({
        recipient_id: testUserId,
        type: 'test_notification',
        title: 'Test Title',
        message: 'Test message content',
        priority: 'medium'
      });
      
      expect(result).toBe(true);
      
      // Verify in database
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUserId)
        .eq('type', 'test_notification')
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toBe('Test Title');
      expect(notif.message).toBe('Test message content');
      expect(notif.priority).toBe('medium');
      expect(notif.is_read).toBe(false);
    });
    
    test('should handle optional sender_id', async () => {
      const result = await createNotification({
        recipient_id: testUserId,
        sender_id: testTeacherId,
        type: 'test_with_sender',
        title: 'Test',
        message: 'Test'
      });
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'test_with_sender')
        .single();
      
      expect(notif.sender_id).toBe(testTeacherId);
    });
    
    test('should handle custom data object', async () => {
      const customData = {
        class_id: testClassId,
        event: 'test_event',
        metadata: { key: 'value' }
      };
      
      const result = await createNotification({
        recipient_id: testUserId,
        type: 'test_with_data',
        title: 'Test',
        message: 'Test',
        data: customData
      });
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'test_with_data')
        .single();
      
      expect(notif.data).toEqual(customData);
    });
  });
  
  describe('notifyTeacherOfEnrollment', () => {
    
    test('should create teacher enrollment notification', async () => {
      const result = await notifyTeacherOfEnrollment(
        testTeacherId,
        'John Doe',
        'john@example.com',
        'Ethics 101',
        testClassId
      );
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testTeacherId)
        .eq('type', 'student_joined')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Student Enrolled');
      expect(notif.message).toContain('John Doe');
      expect(notif.message).toContain('john@example.com');
      expect(notif.message).toContain('Ethics 101');
      expect(notif.priority).toBe('medium');
      expect(notif.data.class_id).toBe(testClassId);
    });
  });
  
  describe('notifyStudentOfEnrollment', () => {
    
    test('should create student enrollment confirmation', async () => {
      const result = await notifyStudentOfEnrollment(
        testUserId,
        'Ethics 101',
        'Prof. Smith',
        testClassId
      );
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUserId)
        .eq('type', 'enrollment_confirmed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Successfully Enrolled');
      expect(notif.message).toContain('Ethics 101');
      expect(notif.message).toContain('Prof. Smith');
      expect(notif.priority).toBe('high');
    });
  });
  
  describe('notifyTeacherOfUnenrollment', () => {
    
    test('should create teacher unenrollment notification', async () => {
      const result = await notifyTeacherOfUnenrollment(
        testTeacherId,
        'Jane Smith',
        'jane@example.com',
        'Ethics 101',
        testClassId
      );
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testTeacherId)
        .eq('type', 'student_left')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Student Left Class');
      expect(notif.message).toContain('Jane Smith');
      expect(notif.priority).toBe('low');
    });
  });
  
  describe('notifyStudentOfManualEnrollment', () => {
    
    test('should create manual enrollment notification', async () => {
      const result = await notifyStudentOfManualEnrollment(
        testUserId,
        'Advanced Ethics',
        'Dr. Johnson',
        testClassId
      );
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUserId)
        .eq('type', 'teacher_added')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Added to Class');
      expect(notif.message).toContain('Dr. Johnson');
      expect(notif.message).toContain('Advanced Ethics');
      expect(notif.priority).toBe('high');
    });
  });
  
  describe('notifyStudentOfRemoval', () => {
    
    test('should create removal notification', async () => {
      const result = await notifyStudentOfRemoval(
        testUserId,
        'Ethics 101',
        'Prof. Wilson',
        testClassId
      );
      
      expect(result).toBe(true);
      
      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUserId)
        .eq('type', 'removed_from_class')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Removed from Class');
      expect(notif.message).toContain('Ethics 101');
      expect(notif.priority).toBe('high');
    });
  });
  
  describe('markNotificationAsRead', () => {
    
    test('should mark notification as read', async () => {
      // Create unread notification
      const { data: newNotif } = await supabase
        .from('notifications')
        .insert({
          recipient_id: testUserId,
          type: 'test_read',
          title: 'Test',
          message: 'Test',
          is_read: false
        })
        .select()
        .single();
      
      const result = await markNotificationAsRead(newNotif!.id);
      
      expect(result).toBe(true);
      
      // Verify updated
      const { data: updated } = await supabase
        .from('notifications')
        .select('is_read, read_at')
        .eq('id', newNotif!.id)
        .single();
      
      expect(updated!.is_read).toBe(true);
      expect(updated!.read_at).not.toBeNull();
    });
  });
  
  describe('markAllNotificationsAsRead', () => {
    
    test('should mark all user notifications as read', async () => {
      // Create multiple unread notifications
      await supabase.from('notifications').insert([
        {
          recipient_id: testUserId,
          type: 'test_bulk_1',
          title: 'Test 1',
          message: 'Test 1',
          is_read: false
        },
        {
          recipient_id: testUserId,
          type: 'test_bulk_2',
          title: 'Test 2',
          message: 'Test 2',
          is_read: false
        }
      ]);
      
      const result = await markAllNotificationsAsRead(testUserId);
      
      expect(result).toBe(true);
      
      // Verify all marked as read
      const { data: notifs } = await supabase
        .from('notifications')
        .select('is_read')
        .eq('recipient_id', testUserId);
      
      notifs?.forEach(notif => {
        expect(notif.is_read).toBe(true);
      });
    });
  });
  
  describe('getUnreadCount', () => {
    
    test('should return correct unread count', async () => {
      // Clear existing notifications
      await supabase.from('notifications').delete().eq('recipient_id', testUserId);
      
      // Create mix of read and unread
      await supabase.from('notifications').insert([
        {
          recipient_id: testUserId,
          type: 'test_count_1',
          title: 'Test',
          message: 'Test',
          is_read: false
        },
        {
          recipient_id: testUserId,
          type: 'test_count_2',
          title: 'Test',
          message: 'Test',
          is_read: false
        },
        {
          recipient_id: testUserId,
          type: 'test_count_3',
          title: 'Test',
          message: 'Test',
          is_read: true
        }
      ]);
      
      const count = await getUnreadCount(testUserId);
      
      expect(count).toBe(2); // Only 2 unread
    });
    
    test('should return 0 when no unread notifications', async () => {
      await markAllNotificationsAsRead(testUserId);
      
      const count = await getUnreadCount(testUserId);
      
      expect(count).toBe(0);
    });
  });
  
  describe('getRecentNotifications', () => {
    
    test('should return recent notifications in order', async () => {
      const notifs = await getRecentNotifications(testUserId, 5);
      
      expect(Array.isArray(notifs)).toBe(true);
      expect(notifs.length).toBeLessThanOrEqual(5);
      
      // Verify order (most recent first)
      if (notifs.length > 1) {
        for (let i = 0; i < notifs.length - 1; i++) {
          const current = new Date(notifs[i].created_at);
          const next = new Date(notifs[i + 1].created_at);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
    
    test('should respect limit parameter', async () => {
      const notifs = await getRecentNotifications(testUserId, 3);
      
      expect(notifs.length).toBeLessThanOrEqual(3);
    });
  });
  
  describe('Error Handling', () => {
    
    test('should gracefully handle invalid recipient_id', async () => {
      const result = await createNotification({
        recipient_id: -999999,
        type: 'invalid_test',
        title: 'Test',
        message: 'Test'
      });
      
      // Should return false but not throw
      expect(result).toBe(false);
    });
    
    test('should handle network errors gracefully', async () => {
      // This will fail but should return 0, not throw
      const count = await getUnreadCount(-999999);
      
      expect(typeof count).toBe('number');
    });
  });
});


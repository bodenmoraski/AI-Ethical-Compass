import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for notifications');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// TypeScript interfaces
interface NotificationData {
  recipient_id: number;
  sender_id?: number | null;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Create a notification in the database
 */
export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: data.recipient_id,
        sender_id: data.sender_id || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        priority: data.priority || 'medium',
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }

    console.log(`Notification created: ${data.type} for user ${data.recipient_id}`);
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Notify teacher when a student joins their class
 */
export async function notifyTeacherOfEnrollment(
  teacherId: number,
  studentName: string,
  studentEmail: string,
  className: string,
  classId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: teacherId,
    type: 'student_joined',
    title: '🎓 New Student Enrolled',
    message: `${studentName} (${studentEmail}) has joined your class: ${className}`,
    data: {
      event: 'enrollment',
      class_id: classId,
      student_email: studentEmail
    },
    priority: 'medium'
  });
}

/**
 * Notify student when they successfully enroll in a class
 */
export async function notifyStudentOfEnrollment(
  studentId: number,
  className: string,
  teacherName: string,
  classId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: studentId,
    type: 'enrollment_confirmed',
    title: '✅ Successfully Enrolled',
    message: `You've been enrolled in ${className} taught by ${teacherName}`,
    data: {
      event: 'enrollment_confirmed',
      class_id: classId
    },
    priority: 'high'
  });
}

/**
 * Notify teacher when a student leaves their class
 */
export async function notifyTeacherOfUnenrollment(
  teacherId: number,
  studentName: string,
  studentEmail: string,
  className: string,
  classId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: teacherId,
    type: 'student_left',
    title: '👋 Student Left Class',
    message: `${studentName} (${studentEmail}) has left your class: ${className}`,
    data: {
      event: 'unenrollment',
      class_id: classId,
      student_email: studentEmail
    },
    priority: 'low'
  });
}

/**
 * Notify student when teacher manually adds them to a class
 */
export async function notifyStudentOfManualEnrollment(
  studentId: number,
  className: string,
  teacherName: string,
  classId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: studentId,
    type: 'teacher_added',
    title: '🎓 Added to Class',
    message: `${teacherName} has added you to ${className}`,
    data: {
      event: 'manual_enrollment',
      class_id: classId
    },
    priority: 'high'
  });
}

/**
 * Notify student when teacher removes them from a class
 */
export async function notifyStudentOfRemoval(
  studentId: number,
  className: string,
  teacherName: string,
  classId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: studentId,
    type: 'removed_from_class',
    title: '⚠️ Removed from Class',
    message: `You have been removed from ${className} by ${teacherName}`,
    data: {
      event: 'removal',
      class_id: classId
    },
    priority: 'high'
  });
}

/**
 * Notify student of new assignment
 */
export async function notifyStudentOfNewAssignment(
  studentId: number,
  assignmentTitle: string,
  className: string,
  dueDate: string | null,
  assignmentId: number
): Promise<boolean> {
  const dueDateStr = dueDate 
    ? ` (Due: ${new Date(dueDate).toLocaleDateString()})`
    : '';
  
  return await createNotification({
    recipient_id: studentId,
    type: 'new_assignment',
    title: '📝 New Assignment',
    message: `New assignment in ${className}: ${assignmentTitle}${dueDateStr}`,
    data: {
      event: 'new_assignment',
      assignment_id: assignmentId,
      due_date: dueDate
    },
    priority: 'high'
  });
}

/**
 * Notify student when their submission is graded
 */
export async function notifyStudentOfGrade(
  studentId: number,
  assignmentTitle: string,
  score: number,
  maxScore: number,
  submissionId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: studentId,
    type: 'grade_received',
    title: '✅ Assignment Graded',
    message: `Your submission for "${assignmentTitle}" has been graded: ${score}/${maxScore}`,
    data: {
      event: 'graded',
      submission_id: submissionId,
      score,
      max_score: maxScore
    },
    priority: 'high'
  });
}

/**
 * Notify teacher of new submission
 */
export async function notifyTeacherOfSubmission(
  teacherId: number,
  studentName: string,
  assignmentTitle: string,
  className: string,
  submissionId: number
): Promise<boolean> {
  return await createNotification({
    recipient_id: teacherId,
    type: 'new_submission',
    title: '📬 New Submission',
    message: `${studentName} submitted "${assignmentTitle}" in ${className}`,
    data: {
      event: 'submission',
      submission_id: submissionId
    },
    priority: 'medium'
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get recent notifications for a user
 */
export async function getRecentNotifications(
  userId: number,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}


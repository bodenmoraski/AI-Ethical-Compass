import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  notifyTeacherOfEnrollment,
  notifyStudentOfEnrollment,
  notifyTeacherOfUnenrollment
} from '../lib/notifications.js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Validation schemas
const JoinClassSchema = z.object({
  class_code: z.string()
    .min(4, 'Class code must be at least 4 characters')
    .max(20, 'Class code is too long')
    .regex(/^[A-Za-z0-9]+$/, 'Class code must contain only letters and numbers')
    .transform(val => val.toUpperCase())
});

const LeaveClassSchema = z.object({
  class_id: z.number().int('Class ID must be an integer')
});

// TypeScript interfaces
interface StudentAuthResult {
  userId: number;
  email: string;
}

interface ClassData {
  id: number;
  name: string;
  subject: string;
  grade_level: string;
  teacher_id: number;
  is_active: boolean;
}

// Auth helper - validates student authentication
const authenticateStudent = async (req: VercelRequest): Promise<StudentAuthResult> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.substring(7);
  
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Invalid authorization token');
  }
  
  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid or expired token');
    }
    
    // Get the user's profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single();
    
    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }
    
    return {
      userId: userProfile.id,
      email: userProfile.email
    };
  } catch (error) {
    console.error('Student authentication error:', error);
    throw new Error('Authentication failed');
  }
};

// Handler: Join a class using class code
const handleJoinClass = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }
  
  try {
    // Authenticate student
    const { userId, email } = await authenticateStudent(req);
    
    // Validate request body
    const { class_code } = JoinClassSchema.parse(req.body);
    
    // Convert to uppercase for case-insensitive lookup
    const normalizedCode = class_code.toUpperCase();
    
    // Find class by code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, subject, grade_level, teacher_id, is_active')
      .eq('class_code', normalizedCode)
      .eq('is_active', true)
      .single();
    
    if (classError || !classData) {
      console.log('Class not found:', class_code, classError);
      return res.status(404).json({ 
        success: false, 
        error: 'Class not found or inactive. Please check the code and try again.' 
      });
    }
    
    // Check if already enrolled
    const { data: existing, error: checkError } = await supabase
      .from('class_enrollments')
      .select('id')
      .eq('class_id', classData.id)
      .eq('student_id', userId)
      .maybeSingle();
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are already enrolled in this class.' 
      });
    }
    
    // Enroll student
    const { data: enrollment, error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classData.id,
        student_id: userId,
        status: 'active',
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to enroll in class. Please try again.' 
      });
    }
    
    // Get teacher info for response
    const { data: teacher } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', classData.teacher_id)
      .single();
    
    const teacherName = teacher 
      ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email
      : 'Unknown';
    
    // Get student info for notifications
    const { data: student } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();
    
    const studentName = student
      ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email
      : email;
    
    // Send notifications (don't fail enrollment if notifications fail)
    try {
      await Promise.all([
        notifyTeacherOfEnrollment(
          classData.teacher_id,
          studentName,
          email,
          classData.name,
          classData.id
        ),
        notifyStudentOfEnrollment(
          userId,
          classData.name,
          teacherName,
          classData.id
        )
      ]);
      console.log('Enrollment notifications sent successfully');
    } catch (notifError) {
      console.error('Failed to send enrollment notifications:', notifError);
      // Continue anyway - enrollment was successful
    }
    
    console.log(`Student ${userId} successfully enrolled in class ${classData.id}`);
    
    return res.status(201).json({ 
      success: true, 
      message: `Successfully joined ${classData.name}!`,
      enrollment: {
        id: enrollment.id,
        class_id: classData.id,
        student_id: enrollment.student_id,
        status: enrollment.status,
        enrollment_date: enrollment.enrollment_date,
        // Include class info for convenience
        class_name: classData.name,
        class_subject: classData.subject,
        class_grade_level: classData.grade_level,
        teacher_name: teacherName
      }
    });
    
  } catch (error) {
    console.error('Join class error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: error.errors[0].message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

// Handler: Get student's enrolled classes
const handleGetClasses = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }
  
  try {
    // Authenticate student
    const { userId } = await authenticateStudent(req);
    
    // Fetch enrollments with class and teacher details
    const { data: enrollments, error } = await supabase
      .from('class_enrollments')
      .select(`
        *,
        classes!inner (
          id,
          name,
          description,
          subject,
          grade_level,
          class_code,
          school_year,
          semester,
          is_active,
          teacher_id,
          created_at
        )
      `)
      .eq('student_id', userId)
      .eq('status', 'active')
      .order('enrollment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching classes:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch classes' 
      });
    }
    
    // Get teacher info and assignment counts for each class
    const classIds = enrollments?.map((e: any) => e.classes.id) || [];
    
    // Fetch teacher info for all classes
    const teacherIds = [...new Set(enrollments?.map((e: any) => e.classes.teacher_id) || [])];
    const { data: teachers } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', teacherIds);
    
    const teacherMap = new Map(
      teachers?.map(t => [
        t.id, 
        {
          name: `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email,
          email: t.email
        }
      ])
    );
    
    // Fetch assignment counts
    const { data: assignments } = await supabase
      .from('assignments')
      .select('class_id, id')
      .in('class_id', classIds)
      .eq('is_published', true);
    
    const assignmentCounts = assignments?.reduce((acc: any, a: any) => {
      acc[a.class_id] = (acc[a.class_id] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // Transform response data
    const classes = enrollments?.map((e: any) => {
      const cls = e.classes;
      const teacher = teacherMap.get(cls.teacher_id) || { name: 'Unknown', email: '' };
      
      return {
        id: cls.id,
        name: cls.name,
        description: cls.description,
        subject: cls.subject,
        grade_level: cls.grade_level,
        class_code: cls.class_code,
        school_year: cls.school_year,
        semester: cls.semester,
        is_active: cls.is_active,
        teacher_name: teacher.name,
        teacher_email: teacher.email,
        enrollment_date: e.enrollment_date,
        assignment_count: assignmentCounts[cls.id] || 0,
        created_at: cls.created_at
      };
    }) || [];
    
    return res.json({ 
      success: true, 
      classes 
    });
    
  } catch (error) {
    console.error('Get classes error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

// Handler: Leave (unenroll from) a class
const handleLeaveClass = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST or DELETE.' 
    });
  }
  
  try {
    // Authenticate student
    const { userId } = await authenticateStudent(req);
    
    // Get class_id from query (DELETE) or body (POST)
    const class_id = req.method === 'DELETE' 
      ? parseInt(req.query.class_id as string)
      : req.body.class_id;
    
    // Validate
    const validated = LeaveClassSchema.parse({ class_id });
    
    // Check if enrolled
    const { data: enrollment, error: checkError } = await supabase
      .from('class_enrollments')
      .select(`
        id,
        classes!inner(
          name,
          teacher_id
        )
      `)
      .eq('class_id', validated.class_id)
      .eq('student_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking enrollment:', checkError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check enrollment status.' 
      });
    }
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        error: 'You are not enrolled in this class.' 
      });
    }
    
    // Update status to 'dropped' instead of deleting (preserves history)
    const { error: updateError } = await supabase
      .from('class_enrollments')
      .update({ 
        status: 'dropped'
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      console.error('Error leaving class:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to leave class. Please try again.' 
      });
    }
    
    // Get class info for response
    const classInfo: any = enrollment.classes || {};
    
    // Get student info for notification
    const { data: student } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();
    
    const studentName = student
      ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email
      : 'Student';
    const studentEmail = student?.email || '';
    
    // Notify teacher (don't fail unenrollment if notification fails)
    try {
      await notifyTeacherOfUnenrollment(
        classInfo.teacher_id,
        studentName,
        studentEmail,
        classInfo.name,
        validated.class_id
      );
      console.log('Unenrollment notification sent to teacher');
    } catch (notifError) {
      console.error('Failed to send unenrollment notification:', notifError);
      // Continue anyway - unenrollment was successful
    }
    
    console.log(`Student ${userId} left class ${validated.class_id}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `Successfully left ${classInfo.name || 'class'}.`
    });
    
  } catch (error) {
    console.error('Leave class error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: error.errors[0].message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};

// Main handler - routes by action parameter
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { action } = req.query;
    
    console.log(`=== STUDENT API CALLED ===`);
    console.log(`Action: ${action}`);
    console.log(`Method: ${req.method}`);
    
    switch (action) {
      case 'join-class':
        return await handleJoinClass(req, res);
        
      case 'classes':
        return await handleGetClasses(req, res);
        
      case 'leave-class':
        return await handleLeaveClass(req, res);
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action parameter. Valid actions: join-class, classes, leave-class' 
        });
    }
  } catch (error) {
    console.error('Student API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}


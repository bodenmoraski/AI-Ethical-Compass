import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schemas
const ClassSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(50),
  grade_level: z.string().min(1).max(20),
  description: z.string().optional(),
  max_students: z.number().int().min(1).max(1000).optional()
});

const AssignmentSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scenario_id: z.string().optional(),
  due_date: z.string().datetime().optional(),
  points_possible: z.number().int().min(0).max(1000).optional(),
  rubric: z.record(z.any()).optional(),
  instructions: z.string().optional()
});

const TeacherAccessSchema = z.object({
  institution: z.string().min(1).max(200),
  department: z.string().min(1).max(100),
  justification: z.string().min(10).max(1000)
});

// Auth helper
const authenticateUser = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, jwtSecret) as any;
  return decoded.sub;
};

// Generate unique class code
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Route handlers
const handleTeacherClasses = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'GET': {
      const { data: classes, error } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          class_students!inner(count),
          assignments(count)
        `)
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classesWithCounts = classes?.map(cls => ({
        ...cls,
        student_count: cls.class_students?.[0]?.count || 0,
        assignment_count: cls.assignments?.[0]?.count || 0
      })) || [];

      return res.json({ success: true, classes: classesWithCounts });
    }

    case 'POST': {
      const validatedData = ClassSchema.parse(req.body);
      
      let classCode = generateClassCode();
      let codeExists = true;
      
      while (codeExists) {
        const { data } = await supabase
          .from('teacher_classes')
          .select('id')
          .eq('class_code', classCode)
          .single();
        
        if (!data) {
          codeExists = false;
        } else {
          classCode = generateClassCode();
        }
      }

      const { data: newClass, error } = await supabase
        .from('teacher_classes')
        .insert({
          ...validatedData,
          teacher_id: userId,
          class_code: classCode
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, class: newClass });
    }

    case 'PUT': {
      const { classId } = req.query;
      if (!classId) throw new Error('Class ID required');

      const validatedData = ClassSchema.partial().parse(req.body);

      const { data: updatedClass, error } = await supabase
        .from('teacher_classes')
        .update(validatedData)
        .eq('id', classId)
        .eq('teacher_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!updatedClass) throw new Error('Class not found or access denied');

      return res.json({ success: true, class: updatedClass });
    }

    case 'DELETE': {
      const { classId } = req.query;
      if (!classId) throw new Error('Class ID required');

      const { error } = await supabase
        .from('teacher_classes')
        .delete()
        .eq('id', classId)
        .eq('teacher_id', userId);

      if (error) throw error;

      return res.json({ success: true, message: 'Class deleted successfully' });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

const handleAssignments = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'GET': {
      const { classId } = req.query;

      let query = supabase
        .from('assignments')
        .select(`
          *,
          teacher_classes!inner(teacher_id),
          assignment_submissions(count)
        `)
        .eq('teacher_classes.teacher_id', userId);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data: assignments, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const assignmentsWithCounts = assignments?.map(assignment => ({
        ...assignment,
        submission_count: assignment.assignment_submissions?.[0]?.count || 0
      })) || [];

      return res.json({ success: true, assignments: assignmentsWithCounts });
    }

    case 'POST': {
      const validatedData = AssignmentSchema.parse(req.body);

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id')
        .eq('id', validatedData.class_id)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          ...validatedData,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, assignment });
    }

    case 'PUT': {
      const { assignmentId } = req.query;
      if (!assignmentId) throw new Error('Assignment ID required');

      const validatedData = AssignmentSchema.partial().parse(req.body);

      const { data: assignment, error } = await supabase
        .from('assignments')
        .update(validatedData)
        .eq('id', assignmentId)
        .eq('created_by', userId)
        .select()
        .single();

      if (error) throw error;
      if (!assignment) throw new Error('Assignment not found or access denied');

      return res.json({ success: true, assignment });
    }

    case 'DELETE': {
      const { assignmentId } = req.query;
      if (!assignmentId) throw new Error('Assignment ID required');

      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId)
        .eq('created_by', userId);

      if (error) throw error;

      return res.json({ success: true, message: 'Assignment deleted successfully' });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

const handleTeacherAccess = async (req: VercelRequest, res: VercelResponse) => {
  switch (req.method) {
    case 'POST': {
      const userId = await authenticateUser(req);
      const validatedData = TeacherAccessSchema.parse(req.body);

      // Check if user already has teacher role
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (userProfile?.role === 'teacher') {
        return res.status(400).json({
          success: false,
          error: 'User already has teacher access'
        });
      }

      // Check for existing pending request
      const { data: existingRequest } = await supabase
        .from('teacher_access_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          error: 'Teacher access request already pending'
        });
      }

      // Create access request
      const { data: request, error: requestError } = await supabase
        .from('teacher_access_requests')
        .insert({
          user_id: userId,
          ...validatedData,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Auto-approve for demo purposes
      const { error: approveError } = await supabase
        .from('teacher_access_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'system'
        })
        .eq('id', request.id);

      if (approveError) throw approveError;

      // Update user role to teacher
      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'teacher' })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Log role change
      await supabase
        .from('role_change_log')
        .insert({
          user_id: userId,
          old_role: userProfile?.role || 'user',
          new_role: 'teacher',
          changed_by: 'system',
          reason: 'Teacher access request approved'
        });

      return res.json({
        success: true,
        message: 'Teacher access granted successfully!',
        request: { ...request, status: 'approved' }
      });
    }

    case 'GET': {
      const userId = await authenticateUser(req);

      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (userProfile?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const { data: requests, error } = await supabase
        .from('teacher_access_requests')
        .select(`
          *,
          user_profiles(display_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({ success: true, requests });
    }

    case 'PUT': {
      const userId = await authenticateUser(req);
      const { requestId, action } = req.query;
      
      if (!requestId || !action) {
        throw new Error('Request ID and action required');
      }

      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (userProfile?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const status = action === 'approve' ? 'approved' : 'rejected';

      const { data: request, error: updateError } = await supabase
        .from('teacher_access_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (status === 'approved') {
        // Update user role to teacher
        const { error: roleError } = await supabase
          .from('user_profiles')
          .update({ role: 'teacher' })
          .eq('user_id', request.user_id);

        if (roleError) throw roleError;

        // Log role change
        await supabase
          .from('role_change_log')
          .insert({
            user_id: request.user_id,
            old_role: 'user',
            new_role: 'teacher',
            changed_by: userId,
            reason: 'Teacher access request approved by admin'
          });
      }

      return res.json({
        success: true,
        message: `Teacher access request ${status}`,
        request
      });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { endpoint } = req.query;

    switch (endpoint) {
      case 'classes':
        return await handleTeacherClasses(req, res);
      case 'assignments':
        return await handleAssignments(req, res);
      case 'access':
        return await handleTeacherAccess(req, res);
      default:
        // Default to classes if no endpoint specified
        return await handleTeacherClasses(req, res);
    }
  } catch (error: any) {
    console.error('Teacher API Error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
} 
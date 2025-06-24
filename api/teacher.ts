import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Validation schemas
const ClassSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(50),
  grade_level: z.string().min(1).max(20),
  description: z.string().optional(),
  school_year: z.string().optional(),
  semester: z.string().optional()
});

const AssignmentSchema = z.object({
  class_id: z.number().int(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  assignment_type: z.enum(['scenario', 'custom', 'discussion']).default('scenario'),
  scenario_ids: z.array(z.number()).optional(),
  due_date: z.string().datetime().optional(),
  points_possible: z.number().int().min(0).max(1000).default(100),
  rubric: z.record(z.any()).optional(),
  allow_late_submissions: z.boolean().default(true),
  late_penalty_per_day: z.number().int().min(0).max(100).default(0)
});

const TeacherAccessSchema = z.object({
  institution_name: z.string().min(1).max(200),
  institution_type: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  request_reason: z.string().min(10).max(1000)
});

// Auth helper - simplified for demo purposes
const authenticateUser = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  // For demo purposes, we'll extract user ID from the token
  // In production, you'd verify the JWT token properly
  const token = authHeader.substring(7);
  
  // Simple check - in production, verify the actual JWT
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Invalid authorization token');
  }
  
  // For now, return a mock user ID - in production, decode the JWT
  return 1; // Mock teacher user ID
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
        .from('classes')
        .select(`
          *,
          class_enrollments(count),
          assignments(count)
        `)
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classesWithCounts = classes?.map(cls => ({
        ...cls,
        student_count: cls.class_enrollments?.length || 0,
        assignment_count: cls.assignments?.length || 0
      })) || [];

      return res.json({ success: true, classes: classesWithCounts });
    }

    case 'POST': {
      const validatedData = ClassSchema.parse(req.body);
      
      let classCode = generateClassCode();
      let codeExists = true;
      
      // Ensure unique class code
      while (codeExists) {
        const { data } = await supabase
          .from('classes')
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
        .from('classes')
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
        .from('classes')
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
        .from('classes')
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
          classes!inner(teacher_id),
          assignment_submissions(count)
        `)
        .eq('classes.teacher_id', userId);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data: assignments, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const assignmentsWithCounts = assignments?.map(assignment => ({
        ...assignment,
        submission_count: assignment.assignment_submissions?.length || 0
      })) || [];

      return res.json({ success: true, assignments: assignmentsWithCounts });
    }

    case 'POST': {
      const validatedData = AssignmentSchema.parse(req.body);

      // Verify teacher owns the class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', validatedData.class_id)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert(validatedData)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, assignment });
    }

    case 'PUT': {
      const { assignmentId } = req.query;
      if (!assignmentId) throw new Error('Assignment ID required');

      const validatedData = AssignmentSchema.partial().parse(req.body);

      // Verify teacher owns the class this assignment belongs to
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          classes!inner(teacher_id)
        `)
        .eq('id', assignmentId)
        .eq('classes.teacher_id', userId)
        .single();

      if (assignmentError || !assignment) {
        throw new Error('Assignment not found or access denied');
      }

      const { data: updatedAssignment, error } = await supabase
        .from('assignments')
        .update(validatedData)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;

      return res.json({ success: true, assignment: updatedAssignment });
    }

    case 'DELETE': {
      const { assignmentId } = req.query;
      if (!assignmentId) throw new Error('Assignment ID required');

      // Verify teacher owns the class this assignment belongs to
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          id,
          classes!inner(teacher_id)
        `)
        .eq('id', assignmentId)
        .eq('classes.teacher_id', userId)
        .single();

      if (assignmentError || !assignment) {
        throw new Error('Assignment not found or access denied');
      }

      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      return res.json({ success: true, message: 'Assignment deleted successfully' });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

const handleStudents = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'GET': {
      const { classId } = req.query;
      if (!classId) throw new Error('Class ID required');

      // Verify teacher owns this class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      const { data: students, error } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          users(id, email, first_name, last_name)
        `)
        .eq('class_id', classId)
        .eq('status', 'active');

      if (error) throw error;

      return res.json({ success: true, students });
    }

    case 'POST': {
      // Enroll student by email or student ID
      const { classId } = req.query;
      const { studentEmail, studentId } = req.body;
      
      if (!classId) throw new Error('Class ID required');
      if (!studentEmail && !studentId) throw new Error('Student email or ID required');

      // Verify teacher owns this class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      // Find student by email or ID
      let studentQuery = supabase.from('users').select('id');
      if (studentEmail) {
        studentQuery = studentQuery.eq('email', studentEmail);
      } else {
        studentQuery = studentQuery.eq('id', studentId);
      }

      const { data: student, error: studentError } = await studentQuery.single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      // Enroll student
      const { data: enrollment, error } = await supabase
        .from('class_enrollments')
        .insert({
          class_id: classId,
          student_id: student.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Student is already enrolled in this class');
        }
        throw error;
      }

      return res.status(201).json({ success: true, enrollment });
    }

    case 'DELETE': {
      // Remove student from class
      const { classId, studentId } = req.query;
      
      if (!classId || !studentId) {
        throw new Error('Class ID and Student ID required');
      }

      // Verify teacher owns this class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', userId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found or access denied');
      }

      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) throw error;

      return res.json({ success: true, message: 'Student removed from class' });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

const handleTeacherAccess = async (req: VercelRequest, res: VercelResponse) => {
  switch (req.method) {
    case 'POST': {
      const validatedData = TeacherAccessSchema.parse(req.body);
      const { userEmail } = req.body;

      if (!userEmail) {
        throw new Error('User email required');
      }

      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', userEmail)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Check if user already has teacher access
      if (user.role === 'teacher') {
        return res.json({ 
          success: false, 
          message: 'User already has teacher access' 
        });
      }

      // For demo purposes, immediately grant teacher access
      // In production, you'd want to review requests manually
      
      // Update user role to teacher
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'teacher',
          institution_name: validatedData.institution_name,
          institution_type: validatedData.institution_type
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Create a record of this access grant for audit purposes
      const { error: accessError } = await supabase
        .from('teacher_access_requests')
        .insert({
          user_id: user.id,
          institution_name: validatedData.institution_name,
          institution_type: validatedData.institution_type,
          department: validatedData.department,
          request_reason: validatedData.request_reason,
          status: 'approved',
          reviewed_at: new Date().toISOString()
        });

      // Don't fail if audit record creation fails
      if (accessError) {
        console.warn('Failed to create audit record:', accessError);
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Teacher access granted successfully! You can now access the teacher dashboard.',
        role: 'teacher'
      });
    }

    case 'GET': {
      // Get all teacher access requests (admin only)
      const { data: requests, error } = await supabase
        .from('teacher_access_requests')
        .select(`
          *,
          users(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({ success: true, requests });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'classes':
        return await handleTeacherClasses(req, res);
      case 'assignments':
        return await handleAssignments(req, res);
      case 'students':
        return await handleStudents(req, res);
      case 'access':
        return await handleTeacherAccess(req, res);
      default:
        throw new Error('Invalid action parameter');
    }
  } catch (error) {
    console.error('Teacher API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 
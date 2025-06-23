import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';
import { z } from 'zod';

// Validation schemas
const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  semester: z.string().default('Fall'),
  schoolYear: z.string().default(new Date().getFullYear().toString()),
});

const updateClassSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  semester: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Helper function to generate unique class codes
function generateClassCode(name: string, year: string): string {
  const nameCode = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const yearCode = year.substring(2);
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${nameCode}${yearCode}${randomSuffix}`;
}

// Helper function to get user ID from email
async function getUserIdFromEmail(supabase: any, email: string): Promise<number | null> {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  
  return user?.id || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  try {
    // Extract user information (in production, this would come from JWT)
    const userEmail = req.headers.authorization?.replace('Bearer ', '') || 'teacher@test.com';
    const teacherId = await getUserIdFromEmail(supabase, userEmail);

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    switch (req.method) {
      case 'POST':
        return await createClass(req, res, supabase, teacherId);
      case 'GET':
        return await getClasses(req, res, supabase, teacherId);
      case 'PUT':
        return await updateClass(req, res, supabase, teacherId);
      case 'DELETE':
        return await deactivateClass(req, res, supabase, teacherId);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Teacher Classes API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function createClass(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  try {
    const validatedData = createClassSchema.parse(req.body);
    
    // Generate unique class code
    let classCode = generateClassCode(validatedData.name, validatedData.schoolYear);
    
    // Ensure class code is unique
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('classes')
        .select('id')
        .eq('class_code', classCode)
        .single();
      
      if (!existing) break;
      
      classCode = generateClassCode(validatedData.name, validatedData.schoolYear);
      attempts++;
    }

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        ...validatedData,
        teacher_id: teacherId,
        class_code: classCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      id: newClass.id,
      name: newClass.name,
      description: newClass.description,
      subject: newClass.subject,
      gradeLevel: newClass.grade_level,
      semester: newClass.semester,
      schoolYear: newClass.school_year,
      classCode: newClass.class_code,
      teacherId: newClass.teacher_id,
      isActive: newClass.is_active,
      createdAt: newClass.created_at,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    throw error;
  }
}

async function getClasses(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId } = req.query;

  if (classId) {
    // Get specific class with detailed information
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        enrollments:class_enrollments(count),
        assignments(count)
      `)
      .eq('id', classId)
      .eq('teacher_id', teacherId)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get student list
    const { data: students } = await supabase
      .from('class_enrollments')
      .select(`
        student_id,
        enrollment_date,
        status,
        users!student_id(id, username, email, name)
      `)
      .eq('class_id', classId);

    return res.status(200).json({
      ...classData,
      studentCount: classData.enrollments[0]?.count || 0,
      assignmentCount: classData.assignments[0]?.count || 0,
      students: students || [],
    });
  } else {
    // Get all classes for teacher
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        enrollments:class_enrollments(count),
        assignments(count)
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const formattedClasses = classes.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      description: cls.description,
      subject: cls.subject,
      gradeLevel: cls.grade_level,
      semester: cls.semester,
      schoolYear: cls.school_year,
      classCode: cls.class_code,
      studentCount: cls.enrollments[0]?.count || 0,
      assignmentCount: cls.assignments[0]?.count || 0,
      createdAt: cls.created_at,
      isActive: cls.is_active,
    }));

    return res.status(200).json(formattedClasses);
  }
}

async function updateClass(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  try {
    const validatedData = updateClassSchema.parse(req.body);
    const { id, ...updateFields } = validatedData;

    // Verify ownership
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('teacher_id', teacherId)
      .single();

    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      id: updatedClass.id,
      name: updatedClass.name,
      description: updatedClass.description,
      subject: updatedClass.subject,
      gradeLevel: updatedClass.grade_level,
      semester: updatedClass.semester,
      schoolYear: updatedClass.school_year,
      isActive: updatedClass.is_active,
      updatedAt: updatedClass.updated_at,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    throw error;
  }
}

async function deactivateClass(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId } = req.query;

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required' });
  }

  // Verify ownership
  const { data: existingClass } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .eq('teacher_id', teacherId)
    .single();

  if (!existingClass) {
    return res.status(404).json({ message: 'Class not found or unauthorized' });
  }

  // Deactivate instead of deleting to preserve data integrity
  const { data: deactivatedClass, error } = await supabase
    .from('classes')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', classId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return res.status(200).json({
    id: deactivatedClass.id,
    isActive: false,
    message: 'Class deactivated successfully',
  });
} 
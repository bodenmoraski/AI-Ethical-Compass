import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';
import { z } from 'zod';

// Validation schemas
const createAssignmentSchema = z.object({
  classId: z.number(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  assignmentType: z.enum(['scenario', 'discussion', 'custom']).default('scenario'),
  scenarioIds: z.array(z.number()).optional(),
  dueDate: z.string().optional(),
  pointsPossible: z.number().min(0).max(1000).default(100),
  rubric: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    description: z.string().optional(),
  })).optional(),
  allowLateSubmissions: z.boolean().default(true),
  latePenaltyPerDay: z.number().min(0).max(100).default(0),
});

const updateAssignmentSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().optional(),
  pointsPossible: z.number().min(0).max(1000).optional(),
  rubric: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    description: z.string().optional(),
  })).optional(),
  isPublished: z.boolean().optional(),
  allowLateSubmissions: z.boolean().optional(),
  latePenaltyPerDay: z.number().min(0).max(100).optional(),
});

const gradeSubmissionSchema = z.object({
  submissionId: z.number(),
  score: z.number().min(0),
  feedback: z.string().optional(),
  rubricScores: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
  })).optional(),
});

// Helper function to get user ID from email
async function getUserIdFromEmail(supabase: any, email: string): Promise<number | null> {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  
  return user?.id || null;
}

// Helper function to verify teacher owns the class
async function verifyClassOwnership(supabase: any, classId: number, teacherId: number): Promise<boolean> {
  const { data: classData } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', teacherId)
    .single();
  
  return !!classData;
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

    // Handle different endpoints
    if (req.url?.includes('/publish')) {
      return await publishAssignment(req, res, supabase, teacherId);
    } else if (req.url?.includes('/grade')) {
      return await gradeSubmission(req, res, supabase, teacherId);
    }

    switch (req.method) {
      case 'POST':
        return await createAssignment(req, res, supabase, teacherId);
      case 'GET':
        return await getAssignments(req, res, supabase, teacherId);
      case 'PUT':
        return await updateAssignment(req, res, supabase, teacherId);
      case 'DELETE':
        return await deleteAssignment(req, res, supabase, teacherId);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Assignments API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function createAssignment(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  try {
    const validatedData = createAssignmentSchema.parse(req.body);
    
    // Verify teacher owns the class
    const ownsClass = await verifyClassOwnership(supabase, validatedData.classId, teacherId);
    if (!ownsClass) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this class' });
    }

    // Validate scenario assignment has scenarios
    if (validatedData.assignmentType === 'scenario' && (!validatedData.scenarioIds || validatedData.scenarioIds.length === 0)) {
      return res.status(400).json({ message: 'Scenario assignments must include at least one scenario' });
    }

    const { data: newAssignment, error } = await supabase
      .from('assignments')
      .insert({
        class_id: validatedData.classId,
        title: validatedData.title,
        description: validatedData.description,
        instructions: validatedData.instructions,
        assignment_type: validatedData.assignmentType,
        scenario_ids: validatedData.scenarioIds,
        due_date: validatedData.dueDate,
        points_possible: validatedData.pointsPossible,
        rubric: validatedData.rubric,
        allow_late_submissions: validatedData.allowLateSubmissions,
        late_penalty_per_day: validatedData.latePenaltyPerDay,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      id: newAssignment.id,
      classId: newAssignment.class_id,
      title: newAssignment.title,
      description: newAssignment.description,
      instructions: newAssignment.instructions,
      assignmentType: newAssignment.assignment_type,
      scenarioIds: newAssignment.scenario_ids,
      dueDate: newAssignment.due_date,
      pointsPossible: newAssignment.points_possible,
      rubric: newAssignment.rubric,
      isPublished: newAssignment.is_published,
      allowLateSubmissions: newAssignment.allow_late_submissions,
      latePenaltyPerDay: newAssignment.late_penalty_per_day,
      createdAt: newAssignment.created_at,
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

async function getAssignments(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { classId, assignmentId } = req.query;

  if (assignmentId) {
    // Get specific assignment with submissions
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        classes!inner(teacher_id)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment || assignment.classes.teacher_id !== teacherId) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    // Get submissions for this assignment
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users!student_id(id, username, name, email)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    return res.status(200).json({
      ...assignment,
      submissions: submissions || [],
    });
  } else if (classId) {
    // Verify teacher owns the class
    const ownsClass = await verifyClassOwnership(supabase, parseInt(classId as string), teacherId);
    if (!ownsClass) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this class' });
    }

    // Get all assignments for the class
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        submissions:assignment_submissions(count),
        students:class_enrollments(count)
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const formattedAssignments = assignments.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      assignmentType: assignment.assignment_type,
      dueDate: assignment.due_date,
      pointsPossible: assignment.points_possible,
      isPublished: assignment.is_published,
      submissionCount: assignment.submissions[0]?.count || 0,
      totalStudents: assignment.students[0]?.count || 0,
      createdAt: assignment.created_at,
    }));

    return res.status(200).json(formattedAssignments);
  } else {
    return res.status(400).json({ message: 'Class ID or Assignment ID is required' });
  }
}

async function updateAssignment(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  try {
    const validatedData = updateAssignmentSchema.parse(req.body);
    const { id, ...updateFields } = validatedData;

    // Verify ownership through class
    const { data: assignment } = await supabase
      .from('assignments')
      .select(`
        id,
        is_published,
        classes!inner(teacher_id)
      `)
      .eq('id', id)
      .single();

    if (!assignment || assignment.classes.teacher_id !== teacherId) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    // Check if trying to modify scenarios on published assignment with submissions
    if (assignment.is_published && updateFields.hasOwnProperty('scenarioIds')) {
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', id)
        .limit(1);

      if (submissions && submissions.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot modify scenarios of published assignment with existing submissions' 
        });
      }
    }

    const { data: updatedAssignment, error } = await supabase
      .from('assignments')
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
      id: updatedAssignment.id,
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      dueDate: updatedAssignment.due_date,
      pointsPossible: updatedAssignment.points_possible,
      isPublished: updatedAssignment.is_published,
      updatedAt: updatedAssignment.updated_at,
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

async function publishAssignment(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { assignmentId } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ message: 'Assignment ID is required' });
  }

  // Verify ownership
  const { data: assignment } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      class_id,
      classes!inner(teacher_id)
    `)
    .eq('id', assignmentId)
    .single();

  if (!assignment || assignment.classes.teacher_id !== teacherId) {
    return res.status(404).json({ message: 'Assignment not found or unauthorized' });
  }

  // Publish the assignment
  const { data: publishedAssignment, error } = await supabase
    .from('assignments')
    .update({
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Get student count for notifications
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id')
    .eq('class_id', assignment.class_id)
    .eq('status', 'active');

  // Create notifications for all students (simplified for now)
  const notificationPromises = (enrollments || []).map((enrollment: any) => 
    supabase.from('notifications').insert({
      recipient_id: enrollment.student_id,
      type: 'assignment_published',
      title: 'New Assignment Published',
      message: `A new assignment "${assignment.title}" has been published`,
      data: { assignmentId, classId: assignment.class_id },
    })
  );

  await Promise.all(notificationPromises);

  return res.status(200).json({
    id: publishedAssignment.id,
    isPublished: true,
    publishedAt: publishedAssignment.updated_at,
    notificationsSent: enrollments?.length || 0,
  });
}

async function gradeSubmission(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  try {
    const validatedData = gradeSubmissionSchema.parse(req.body);
    
    // Verify the submission belongs to teacher's assignment
    const { data: submission } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        assignment_id,
        assignments!inner(
          points_possible,
          classes!inner(teacher_id)
        )
      `)
      .eq('id', validatedData.submissionId)
      .single();

    if (!submission || submission.assignments.classes.teacher_id !== teacherId) {
      return res.status(404).json({ message: 'Submission not found or unauthorized' });
    }

    // Validate score doesn't exceed points possible
    if (validatedData.score > submission.assignments.points_possible) {
      return res.status(400).json({ 
        message: `Score cannot exceed points possible (${submission.assignments.points_possible})` 
      });
    }

    const { data: gradedSubmission, error } = await supabase
      .from('assignment_submissions')
      .update({
        manual_score: validatedData.score,
        final_score: validatedData.score,
        feedback: validatedData.feedback,
        status: 'graded',
        graded_at: new Date().toISOString(),
        graded_by: teacherId,
      })
      .eq('id', validatedData.submissionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      id: gradedSubmission.id,
      finalScore: gradedSubmission.final_score,
      feedback: gradedSubmission.feedback,
      gradedAt: gradedSubmission.graded_at,
      status: gradedSubmission.status,
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

async function deleteAssignment(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any,
  teacherId: number
) {
  const { assignmentId } = req.query;

  if (!assignmentId) {
    return res.status(400).json({ message: 'Assignment ID is required' });
  }

  // Verify ownership and check for submissions
  const { data: assignment } = await supabase
    .from('assignments')
    .select(`
      id,
      is_published,
      classes!inner(teacher_id),
      submissions:assignment_submissions(count)
    `)
    .eq('id', assignmentId)
    .single();

  if (!assignment || assignment.classes.teacher_id !== teacherId) {
    return res.status(404).json({ message: 'Assignment not found or unauthorized' });
  }

  // Prevent deletion if published and has submissions
  if (assignment.is_published && assignment.submissions[0]?.count > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete published assignment with existing submissions' 
    });
  }

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    throw new Error(error.message);
  }

  return res.status(200).json({ 
    message: 'Assignment deleted successfully' 
  });
} 
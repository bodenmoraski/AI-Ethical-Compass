import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  notifyStudentOfManualEnrollment,
  notifyStudentOfRemoval,
  notifyStudentOfGrade,
  notifyStudentOfNewAssignment,
} from '../lib/notifications.js';
import { recordActivity } from '../lib/activity-feed.js';
import { isRubric, scoreRubric } from '../lib/rubric-scoring.js';
import { requireRole, getBearerToken } from '../lib/api-auth.js';
import { applyLatePenalty } from '../lib/late-policy.js';

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
  description: z.string().max(5000).optional(),
  school_year: z.string().max(20).optional(),
  semester: z.string().max(20).optional()
});

const AssignmentSchema = z.object({
  class_id: z.number().int(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  instructions: z.string().max(20000).optional(),
  assignment_type: z.enum(['scenario', 'custom', 'discussion']).default('scenario'),
  scenario_ids: z.array(z.number()).optional(),
  due_date: z.string().nullable().optional().refine((val) => {
    if (!val || val === null) return true; // Allow empty string or null
    try {
      new Date(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid date format" }),
  points_possible: z.number().int().min(0).max(1000).default(100),
  rubric: z.record(z.any()).nullable().optional(),
  allow_late_submissions: z.boolean().default(true),
  late_penalty_per_day: z.number().int().min(0).max(100).default(0),
  is_published: z.boolean().optional()
});

const TeacherAccessSchema = z.object({
  institution_name: z.string().min(1).max(200),
  institution_type: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  request_reason: z.string().min(10).max(1000)
});

// Auth helper - proper JWT verification
const authenticateUser = async (req: VercelRequest) => {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error('No authorization token provided');
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
      .select('id, role')
      .eq('email', user.email)
      .single();
    
    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }
    
    // Teachers and admins can access teacher APIs
    if (userProfile.role !== 'teacher' && userProfile.role !== 'admin') {
      throw new Error('Teacher access required');
    }
    
    return userProfile.id;
  } catch (error) {
    console.error('Authentication error:', error);
    // Re-throw specific errors as-is
    if (error instanceof Error && error.message === 'Teacher access required') {
      throw error;
    }
    throw new Error('Authentication failed');
  }
};

/** Supabase `relation(count)` returns `[{ count: N }]`, not a row array. */
const relationCount = (rel: unknown): number => {
  if (!Array.isArray(rel) || rel.length === 0) return 0;
  const first = rel[0] as { count?: number };
  if (typeof first?.count === 'number') return first.count;
  return rel.length;
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

/**
 * Tells enrolled students an assignment went live and drops a matching event on
 * the class activity feed. Best-effort: publishing must not fail on notification errors.
 */
const announcePublishedAssignment = async (
  assignment: { id: number; class_id: number; title: string; due_date?: string | null },
  teacherId: number
) => {
  try {
    const { data: classRow } = await supabase
      .from('classes')
      .select('name')
      .eq('id', assignment.class_id)
      .single();

    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('student_id')
      .eq('class_id', assignment.class_id)
      .eq('status', 'active');

    await Promise.all(
      (enrollments || []).map((enrollment) =>
        notifyStudentOfNewAssignment(
          enrollment.student_id,
          assignment.title,
          classRow?.name || 'your class',
          assignment.due_date || null,
          assignment.id
        )
      )
    );

    await recordActivity({
      type: 'notification',
      classId: assignment.class_id,
      userId: teacherId,
      title: 'Assignment published',
      description: `"${assignment.title}" is now available to students`,
      priority: 'medium',
      data: { assignment_id: assignment.id },
    });
  } catch (error) {
    console.error('Failed to announce published assignment:', error);
  }
};

// Route handlers
const handleTeacherClasses = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  switch (req.method) {
    case 'GET': {
      const { classId } = req.query;
      
      if (classId) {
        // Get a specific class
        const { data: classData, error } = await supabase
          .from('classes')
          .select(`
            *,
            class_enrollments(count),
            assignments(count)
          `)
          .eq('id', classId)
          .eq('teacher_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Class not found');
          }
          throw error;
        }

        const studentCount = relationCount(classData.class_enrollments);
        const assignmentCount = relationCount(classData.assignments);

        // Count aggregates are `[{ count: N }]` — fetch real assignment IDs for completion %
        let completionRate = 0;
        if (assignmentCount > 0 && studentCount > 0) {
          const { data: classAssignments } = await supabase
            .from('assignments')
            .select('id')
            .eq('class_id', classId);

          const assignmentIds = classAssignments?.map((a) => a.id) || [];
          if (assignmentIds.length > 0) {
            const { data: submissions, error: submissionError } = await supabase
              .from('assignment_submissions')
              .select('id, assignment_id, student_id')
              .in('assignment_id', assignmentIds)
              .in('status', ['submitted', 'graded', 'completed']);

            if (!submissionError && submissions) {
              const totalExpected = assignmentIds.length * studentCount;
              completionRate = totalExpected > 0
                ? Math.round((submissions.length / totalExpected) * 100)
                : 0;
            }
          }
        }

        const classWithCounts = {
          ...classData,
          student_count: studentCount,
          assignment_count: assignmentCount,
          completion_rate: completionRate
        };

        return res.json({ success: true, data: classWithCounts });
      } else {
        // Get all classes
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
          student_count: relationCount(cls.class_enrollments),
          assignment_count: relationCount(cls.assignments)
        })) || [];

        return res.json({ success: true, classes: classesWithCounts });
      }
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
      const { classId, assignmentId } = req.query;

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

      if (assignmentId) {
        query = query.eq('id', assignmentId);
      }

      const { data: assignments, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const assignmentsWithCounts = assignments?.map(assignment => ({
        ...assignment,
        submission_count: relationCount(assignment.assignment_submissions)
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

      if (assignment.is_published) {
        await announcePublishedAssignment(assignment, userId);
      }

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

      // Only announce on the draft -> published transition, never on every edit.
      if (!assignment.is_published && updatedAssignment.is_published) {
        await announcePublishedAssignment(updatedAssignment, userId);
      }

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
          users(id, email, name, first_name, last_name, username)
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

      // Send notification to student (don't fail enrollment if notification fails)
      try {
        const { data: classInfo } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .single();
        
        const { data: teacher } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', userId)
          .single();
        
        const teacherName = teacher
          ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email
          : 'Your teacher';
        
        await notifyStudentOfManualEnrollment(
          student.id,
          classInfo?.name || 'Class',
          teacherName,
          parseInt(classId as string)
        );
        console.log('Manual enrollment notification sent to student');
      } catch (notifError) {
        console.error('Failed to send manual enrollment notification:', notifError);
        // Continue anyway - enrollment was successful
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

      // Send notification to student (don't fail if notification fails)
      try {
        const { data: classInfo } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .single();
        
        const { data: teacher } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', userId)
          .single();
        
        const teacherName = teacher
          ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email
          : 'Your teacher';
        
        await notifyStudentOfRemoval(
          parseInt(studentId as string),
          classInfo?.name || 'Class',
          teacherName,
          parseInt(classId as string)
        );
        console.log('Removal notification sent to student');
      } catch (notifError) {
        console.error('Failed to send removal notification:', notifError);
        // Continue anyway - removal was successful
      }

      return res.json({ success: true, message: 'Student removed from class' });
    }

    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

const handleTeacherAccess = async (req: VercelRequest, res: VercelResponse) => {
  switch (req.method) {
    case 'POST': {
      try {
        // Require a real JWT so callers cannot submit requests for arbitrary emails
        const token = getBearerToken(req);
        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized'
          });
        }

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser?.email) {
          return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
          });
        }

        const validatedData = TeacherAccessSchema.parse(req.body);
        const userEmail = authUser.email;

        // Find user by email
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, role')
          .eq('email', userEmail)
          .single();

        if (userError || !user) {
          return res.status(400).json({
            success: false,
            error: 'User not found'
          });
        }

        // Check if user already has teacher access
        if (user.role === 'teacher') {
          return res.status(200).json({ 
            success: false, 
            message: 'User already has teacher access' 
          });
        }

        // SECURITY FIX: Do NOT auto-approve teacher access
        // Create pending request that requires admin review
        
        // Create teacher access request with 'pending' status
        const { data: request, error: requestError } = await supabase
          .from('teacher_access_requests')
          .insert({
            user_id: user.id,
            institution_name: validatedData.institution_name,
            institution_type: validatedData.institution_type,
            department: validatedData.department,
            request_reason: validatedData.request_reason,
            status: 'pending', // Keep as pending for admin review
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (requestError) {
          console.error('Failed to create teacher access request:', requestError);
          return res.status(500).json({
            success: false,
            error: 'Failed to submit teacher access request'
          });
        }

        console.log(`Teacher access request created (pending): user_id=${user.id}, request_id=${request.id}`);

        return res.status(201).json({ 
          success: true, 
          message: 'Teacher access request submitted. An administrator reviews requests in the admin console; teacher tools unlock on this account as soon as it is approved.',
          status: 'pending',
          request_id: request.id
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            success: false, 
            error: error.errors[0].message 
          });
        }
        throw error;
      }
    }

    case 'GET': {
      // These rows carry names, emails and institutions, so the list is admin-only.
      const admin = await requireRole(req, ['admin']);
      console.log(`Admin ${admin.id} listed teacher access requests`);

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

// Grading endpoints
const handleGrading = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);
  const { assignmentId, submissionId } = req.query;

  switch (req.method) {
    case 'GET': {
      // List all submissions for an assignment
      if (req.query.action === 'assignment-submissions') {
        if (!assignmentId) throw new Error('Assignment ID required');
        // Verify teacher owns the assignment
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('id, class_id')
          .eq('id', assignmentId)
          .single();
        if (assignmentError || !assignment) throw new Error('Assignment not found');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', assignment.class_id)
          .single();
        if (classError || !classData || classData.teacher_id !== userId) throw new Error('Access denied');
        // Get all submissions
        const { data: submissions, error } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            users!assignment_submissions_student_id_fkey(id, email, first_name, last_name, username)
          `)
          .eq('assignment_id', assignmentId);
        if (error) throw error;
        return res.json({ success: true, submissions });
      }
      // Get a specific submission
      if (req.query.action === 'submission-detail') {
        if (!submissionId) throw new Error('Submission ID required');
        const { data: submission, error } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            users!assignment_submissions_student_id_fkey(id, email, first_name, last_name, username)
          `)
          .eq('id', submissionId)
          .single();
        if (error || !submission) throw new Error('Submission not found');
        // Verify teacher owns the assignment
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('id, class_id')
          .eq('id', submission.assignment_id)
          .single();
        if (assignmentError || !assignment) throw new Error('Assignment not found');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', assignment.class_id)
          .single();
        if (classError || !classData || classData.teacher_id !== userId) throw new Error('Access denied');
        return res.json({ success: true, submission });
      }
      throw new Error('Invalid grading GET action');
    }
    case 'POST': {
      // Grade a submission
      if (req.query.action === 'grade-submission') {
        const { submissionId, score, feedback, rubricScores } = req.body;
        if (!submissionId) throw new Error('Submission ID required');
        if (typeof feedback === 'string' && feedback.length > 10000) {
          throw new Error('Feedback exceeds maximum length of 10000 characters');
        }
        // Get submission and verify teacher owns it
        const { data: submission, error } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();
        if (error || !submission) throw new Error('Submission not found');
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('id, class_id, points_possible, title, rubric, due_date, late_penalty_per_day')
          .eq('id', submission.assignment_id)
          .single();
        if (assignmentError || !assignment) throw new Error('Assignment not found');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id, name')
          .eq('id', assignment.class_id)
          .single();
        if (classError || !classData || classData.teacher_id !== userId) throw new Error('Access denied');

        // A rubric grade derives the score from per-criterion awards so the
        // stored score always matches the criteria the teacher actually filled in.
        let finalScore: number;
        let rubricResult: ReturnType<typeof scoreRubric> | null = null;

        if (rubricScores && isRubric(assignment.rubric)) {
          rubricResult = scoreRubric(assignment.rubric, rubricScores, assignment.points_possible);
          finalScore = rubricResult.points;
        } else {
          if (typeof score !== 'number') throw new Error('Submission ID and score required');
          finalScore = score;
        }

        if (finalScore < 0 || finalScore > assignment.points_possible) throw new Error('Score out of range');

        const latePenalty = applyLatePenalty(submission, assignment, finalScore);
        const scoreAfterPenalty = latePenalty.score;

        // Update submission
        const { data: updated, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            manual_score: finalScore,
            final_score: scoreAfterPenalty,
            feedback: feedback || null,
            rubric_scores: rubricResult ? rubricResult.perCriterion : null,
            status: 'graded',
            graded_at: new Date().toISOString(),
            graded_by: userId
          })
          .eq('id', submissionId)
          .select()
          .single();
        if (updateError) throw updateError;

        await notifyStudentOfGrade(
          submission.student_id,
          assignment.title,
          scoreAfterPenalty,
          assignment.points_possible,
          Number(submissionId)
        );

        await recordActivity({
          type: 'notification',
          classId: assignment.class_id,
          userId,
          title: 'Submission graded',
          description: `"${assignment.title}" graded ${scoreAfterPenalty}/${assignment.points_possible}`,
          priority: 'low',
          data: { assignment_id: assignment.id, submission_id: Number(submissionId) },
        });

        return res.json({
          success: true,
          submission: updated,
          rubric: rubricResult,
          latePenalty: latePenalty.applied ? latePenalty : null,
        });
      }
      throw new Error('Invalid grading POST action');
    }
    case 'PUT': {
      // Update feedback
      if (req.query.action === 'update-feedback') {
        const { submissionId, feedback } = req.body;
        if (!submissionId || typeof feedback !== 'string') throw new Error('Submission ID and feedback required');
        // Get submission and verify teacher owns it
        const { data: submission, error } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();
        if (error || !submission) throw new Error('Submission not found');
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('id, class_id')
          .eq('id', submission.assignment_id)
          .single();
        if (assignmentError || !assignment) throw new Error('Assignment not found');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', assignment.class_id)
          .single();
        if (classError || !classData || classData.teacher_id !== userId) throw new Error('Access denied');
        // Update feedback
        const { data: updated, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            feedback
          })
          .eq('id', submissionId)
          .select()
          .single();
        if (updateError) throw updateError;
        return res.json({ success: true, submission: updated });
      }
      throw new Error('Invalid grading PUT action');
    }
    default:
      throw new Error(`Method ${req.method} not allowed`);
  }
};

// Assignment Analytics endpoint
const handleAssignmentAnalytics = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);
  
  if (req.method !== 'GET') {
    throw new Error(`Method ${req.method} not allowed`);
  }
  
  const { assignmentId } = req.query;
  
  if (!assignmentId) {
    throw new Error('Assignment ID is required');
  }
  
  try {
    // Verify the assignment belongs to the teacher
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, class_id, title, points_possible')
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError || !assignment) {
      throw new Error('Assignment not found');
    }
    
    // Verify the teacher owns the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('teacher_id')
      .eq('id', assignment.class_id)
      .single();
    
    if (classError || !classData || classData.teacher_id !== userId) {
      throw new Error('Access denied');
    }
    
    // Get assignment submissions with user data
    // Specify the foreign key explicitly since there are multiple FK relationships
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        users!assignment_submissions_student_id_fkey(id, first_name, last_name, email)
      `)
      .eq('assignment_id', assignmentId);
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      throw submissionsError;
    }
    
    // Get class enrollment count
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_enrollments')
      .select('student_id')
      .eq('class_id', assignment.class_id)
      .eq('status', 'active');
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
    }
    
    const totalStudents = enrollments?.length || 0;
    const submittedCount = submissions?.length || 0;
    const gradedCount = submissions?.filter(s => s.status === 'graded').length || 0;
    const overdueCount = submissions?.filter(s => s.is_late).length || 0;
    
    // Calculate average score
    const gradedSubmissions = submissions?.filter(s => s.final_score !== null) || [];
    const averageScore = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / gradedSubmissions.length
      : 0;
    
    // Calculate completion rate
    const completionRate = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;
    
    // Calculate submission trend (last 7 days)
    const now = new Date();
    const submissionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions?.filter(s => 
        s.submitted_at && s.submitted_at.startsWith(dateStr)
      ).length || 0;
      
      submissionTrend.push({
        date: dateStr,
        count: daySubmissions
      });
    }
    
    // Calculate average time spent from student_engagement table
    let averageTimeSpent = 0;
    if (submissions && submissions.length > 0) {
      const studentIds = submissions.map(s => s.student_id);
      
      // Query student_engagement for time spent on this assignment's scenarios
      const { data: engagementData, error: engagementError } = await supabase
        .from('student_engagement')
        .select('time_spent_seconds, student_id')
        .in('student_id', studentIds)
        .eq('class_id', assignment.class_id);
      
      if (!engagementError && engagementData && engagementData.length > 0) {
        // Calculate average time in minutes
        const totalSeconds = engagementData.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0);
        averageTimeSpent = Math.round((totalSeconds / engagementData.length) / 60);
      } else {
        // Fallback: calculate from submission data if timeSpent is stored there
        const timesFromSubmissions = submissions
          .filter(s => s.submission_data?.timeSpent)
          .map(s => s.submission_data.timeSpent as number);
        
        if (timesFromSubmissions.length > 0) {
          averageTimeSpent = Math.round(
            timesFromSubmissions.reduce((sum, t) => sum + t, 0) / timesFromSubmissions.length
          );
        }
      }
    }
    
    // Prepare student progress data
    const studentProgress = submissions?.map(submission => {
      const user = submission.users as any;
      return {
        student_id: submission.student_id,
        id: submission.id,
        name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown',
        email: user?.email || 'unknown@example.com',
        status: submission.status,
        submitted_at: submission.submitted_at,
        graded_at: submission.graded_at,
        score: submission.final_score,
        feedback: submission.feedback
      };
    }) || [];
    
    // Add students who haven't submitted yet
    const submittedStudentIds = new Set(submissions?.map(s => s.student_id) || []);
    const { data: allStudents, error: studentsError } = await supabase
      .from('class_enrollments')
      .select(`
        student_id,
        users(id, first_name, last_name, email)
      `)
      .eq('class_id', assignment.class_id)
      .eq('status', 'active');
    
    if (!studentsError && allStudents) {
      allStudents.forEach(enrollment => {
        if (!submittedStudentIds.has(enrollment.student_id)) {
          const user = enrollment.users as any;
          studentProgress.push({
            student_id: enrollment.student_id,
            id: null,
            name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown',
            email: user?.email || 'unknown@example.com',
            status: 'not_started',
            submitted_at: null,
            graded_at: null,
            score: null,
            feedback: null
          });
        }
      });
    }
    
    const stats = {
      totalStudents,
      submittedCount,
      gradedCount,
      overdueCount,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTimeSpent, // Now calculated from real data
      submissionTrend
    };
    
    return res.json({
      success: true,
      stats,
      studentProgress
    });
    
  } catch (error) {
    console.error('Error fetching assignment analytics:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics'
    });
  }
};

// Stats endpoint
const handleStats = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);

  if (req.method !== 'GET') {
    throw new Error(`Method ${req.method} not allowed`);
  }

  try {
    // Get teacher's classes
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', userId);

    if (classesError) throw classesError;

    const classIds = classes?.map(cls => cls.id) || [];
    
    if (classIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          averageEngagement: 0,
          pendingGrades: 0,
          flaggedContent: 0
        }
      });
    }

    // Calculate average engagement from student_engagement table
    const { data: engagementData, error: engagementError } = await supabase
      .from('student_engagement')
      .select('engagement_score')
      .in('class_id', classIds)
      .not('engagement_score', 'is', null);

    if (engagementError) {
      console.error('Error fetching engagement data:', engagementError);
    }

    const averageEngagement = engagementData && engagementData.length > 0
      ? engagementData.reduce((sum, item) => sum + (item.engagement_score || 0), 0) / engagementData.length
      : 0;

    // Calculate pending grades from assignment_submissions table
    // First get all assignment IDs for the teacher's classes
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id')
      .in('class_id', classIds);

    if (assignmentsError) {
      console.error('Error fetching assignments data:', assignmentsError);
    }

    const assignmentIds = assignmentsData?.map(a => a.id) || [];
    
    let pendingGrades = 0;
    if (assignmentIds.length > 0) {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('status', 'submitted')
        .in('assignment_id', assignmentIds);

      if (submissionsError) {
        console.error('Error fetching submissions data:', submissionsError);
      }

      pendingGrades = submissionsData?.length || 0;
    }

    // Calculate flagged content from moderation_queue table
    const { data: flaggedData, error: flaggedError } = await supabase
      .from('moderation_queue')
      .select('id')
      .eq('status', 'pending')
      .in('class_id', classIds);

    if (flaggedError) {
      console.error('Error fetching flagged content:', flaggedError);
    }

    const flaggedContent = flaggedData?.length || 0;

    return res.json({
      success: true,
      stats: {
        averageEngagement: Math.round(averageEngagement * 100) / 100, // Round to 2 decimal places
        pendingGrades,
        flaggedContent
      }
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate stats'
    });
  }
};

// Per-class analytics: real completion per assignment plus a submission trend.
const handleClassAnalytics = async (req: VercelRequest, res: VercelResponse) => {
  const userId = await authenticateUser(req);
  const classId = Number(req.query.classId);

  if (!Number.isInteger(classId) || classId <= 0) {
    return res.status(400).json({ success: false, error: 'A numeric classId is required' });
  }

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id, teacher_id')
    .eq('id', classId)
    .single();

  if (classError || !classRow || classRow.teacher_id !== userId) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('status', 'active');

  const totalStudents = enrollments?.length || 0;

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, title, due_date')
    .eq('class_id', classId)
    .order('created_at', { ascending: true });

  const assignmentIds = (assignments || []).map((a) => a.id);

  let submissions: Array<{ assignment_id: number; submitted_at: string | null; status: string }> = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from('assignment_submissions')
      .select('assignment_id, submitted_at, status')
      .in('assignment_id', assignmentIds)
      .in('status', ['submitted', 'graded', 'completed']);
    submissions = data || [];
  }

  const submittedByAssignment = new Map<number, number>();
  for (const s of submissions) {
    submittedByAssignment.set(
      s.assignment_id,
      (submittedByAssignment.get(s.assignment_id) || 0) + 1
    );
  }

  const byAssignment = (assignments || []).map((assignment) => {
    const submitted = submittedByAssignment.get(assignment.id) || 0;
    return {
      assignment_id: assignment.id,
      title: assignment.title,
      submitted,
      total_students: totalStudents,
      completion_rate: totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0,
    };
  });

  const totalExpected = assignmentIds.length * totalStudents;
  const overallCompletion =
    totalExpected > 0 ? Math.round((submissions.length / totalExpected) * 100) : 0;

  // Submissions per day for the last 30 days — O(submissions), not O(days × submissions).
  const countsByDay = new Map<string, number>();
  for (const s of submissions) {
    if (!s.submitted_at) continue;
    const key = s.submitted_at.slice(0, 10);
    countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
  }

  const trend: Array<{ date: string; submissions: number }> = [];
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const key = date.toISOString().split('T')[0];
    trend.push({ date: key, submissions: countsByDay.get(key) || 0 });
  }

  return res.json({
    success: true,
    analytics: {
      total_students: totalStudents,
      completion_rates: {
        total: overallCompletion,
        by_assignment: byAssignment,
      },
      engagement_trends: trend,
    },
  });
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
      case 'stats':
        return await handleStats(req, res);
      case 'assignment-analytics':
        return await handleAssignmentAnalytics(req, res);
      case 'class-analytics':
        return await handleClassAnalytics(req, res);
      case 'assignment-submissions':
      case 'submission-detail':
      case 'grade-submission':
      case 'update-feedback':
        return await handleGrading(req, res);
      default:
        throw new Error('Invalid action parameter');
    }
  } catch (error) {
    console.error('Teacher API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status =
      message === 'Teacher access required' ? 403
      : message === 'Authentication failed' || message === 'No authorization token provided' || message === 'Invalid or expired token'
        ? 401
        : 500;
    return res.status(status).json({
      success: false,
      error: message
    });
  }
} 
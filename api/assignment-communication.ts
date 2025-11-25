import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schemas
const FeedbackSchema = z.object({
  submissionId: z.number(),
  feedback: z.string().min(1, 'Feedback cannot be empty'),
  score: z.number().min(0).max(100).optional(),
  rubricScores: z.record(z.number()).optional(),
  isPublic: z.boolean().default(true),
  allowResubmission: z.boolean().default(false)
});

const MessageSchema = z.object({
  assignmentId: z.number(),
  recipientId: z.number(),
  subject: z.string().min(1, 'Subject cannot be empty'),
  message: z.string().min(1, 'Message cannot be empty'),
  messageType: z.enum(['clarification', 'feedback', 'general']).default('general'),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

const ClarificationRequestSchema = z.object({
  assignmentId: z.number(),
  question: z.string().min(1, 'Question cannot be empty'),
  context: z.string().optional(),
  isUrgent: z.boolean().default(false)
});

const DiscussionPostSchema = z.object({
  threadId: z.number(),
  content: z.string().min(1, 'Content cannot be empty'),
  parentPostId: z.number().optional(),
  isTeacherPost: z.boolean().default(false)
});

// Helper function to authenticate user
const authenticateUser = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authorization token');
  }

  return user;
};

// Helper function to check if user is teacher
const isTeacher = async (userId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return false;
  }

  return user.role === 'teacher' || user.role === 'admin';
};

// Helper function to check if user is enrolled in class
const isEnrolledInClass = async (userId: string, classId: number) => {
  const { data: enrollment, error } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('student_id', userId)
    .eq('class_id', classId)
    .single();

  return !error && enrollment;
};

// Helper function to check if user is teacher of class
const isTeacherOfClass = async (userId: string, classId: number) => {
  const { data: classData, error } = await supabase
    .from('classes')
    .select('teacher_id')
    .eq('id', classId)
    .single();

  if (error || !classData) {
    return false;
  }

  return classData.teacher_id === userId;
};

// Enhanced feedback system
const handleEnhancedFeedback = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const isUserTeacher = await isTeacher(user.id);

    if (!isUserTeacher) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only teachers can provide enhanced feedback' 
      });
    }

    const validatedData = FeedbackSchema.parse(req.body);

    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments!inner(
          id,
          class_id,
          title
        ),
        users!inner(
          id,
          name,
          email
        )
      `)
      .eq('id', validatedData.submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }

    // Check if teacher is authorized for this class
    const isAuthorized = await isTeacherOfClass(user.id, submission.assignments.class_id);
    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to grade this submission' 
      });
    }

    // Update submission with enhanced feedback
    const updateData: any = {
      feedback: validatedData.feedback,
      graded_at: new Date().toISOString(),
      graded_by: user.id
    };

    if (validatedData.score !== undefined) {
      updateData.manual_score = validatedData.score;
      updateData.final_score = validatedData.score;
    }

    if (validatedData.rubricScores) {
      updateData.rubric_scores = validatedData.rubricScores;
    }

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('assignment_submissions')
      .update(updateData)
      .eq('id', validatedData.submissionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update submission' 
      });
    }

    // Create feedback record for tracking
    const { error: feedbackError } = await supabase
      .from('assignment_feedback')
      .insert({
        submission_id: validatedData.submissionId,
        teacher_id: user.id,
        feedback: validatedData.feedback,
        score: validatedData.score,
        rubric_scores: validatedData.rubricScores,
        is_public: validatedData.isPublic,
        allow_resubmission: validatedData.allowResubmission,
        created_at: new Date().toISOString()
      });

    if (feedbackError) {
      console.error('Error creating feedback record:', feedbackError);
    }

    return res.json({
      success: true,
      feedback: {
        id: updatedSubmission.id,
        feedback: updatedSubmission.feedback,
        score: updatedSubmission.final_score,
        gradedAt: updatedSubmission.graded_at,
        allowResubmission: validatedData.allowResubmission
      }
    });

  } catch (error) {
    console.error('Enhanced feedback error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Student-teacher messaging system
const handleAssignmentMessage = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const validatedData = MessageSchema.parse(req.body);

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, class_id, title')
      .eq('id', validatedData.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found' 
      });
    }

    // Check if sender is enrolled in class or is teacher
    const isEnrolled = await isEnrolledInClass(user.id, assignment.class_id);
    const isClassTeacher = await isTeacherOfClass(user.id, assignment.class_id);
    const isUserTeacher = await isTeacher(user.id);

    if (!isEnrolled && !isClassTeacher) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to send messages for this assignment' 
      });
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('assignment_messages')
      .insert({
        assignment_id: validatedData.assignmentId,
        sender_id: user.id,
        recipient_id: validatedData.recipientId,
        subject: validatedData.subject,
        message: validatedData.message,
        message_type: validatedData.messageType,
        priority: validatedData.priority,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send message' 
      });
    }

    return res.json({
      success: true,
      message: {
        id: message.id,
        subject: message.subject,
        messageType: message.message_type,
        priority: message.priority,
        sentAt: message.created_at
      }
    });

  } catch (error) {
    console.error('Assignment message error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Assignment clarification requests
const handleClarificationRequest = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const validatedData = ClarificationRequestSchema.parse(req.body);

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, class_id, title, teacher_id')
      .eq('id', validatedData.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found' 
      });
    }

    // Check if user is enrolled in class
    const isEnrolled = await isEnrolledInClass(user.id, assignment.class_id);
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not enrolled in this class' 
      });
    }

    // Create clarification request
    const { data: request, error: requestError } = await supabase
      .from('assignment_clarifications')
      .insert({
        assignment_id: validatedData.assignmentId,
        student_id: user.id,
        teacher_id: assignment.teacher_id,
        question: validatedData.question,
        context: validatedData.context,
        is_urgent: validatedData.isUrgent,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating clarification request:', requestError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create clarification request' 
      });
    }

    return res.json({
      success: true,
      clarification: {
        id: request.id,
        question: request.question,
        isUrgent: request.is_urgent,
        status: request.status,
        createdAt: request.created_at
      }
    });

  } catch (error) {
    console.error('Clarification request error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Enhanced discussion system
const handleDiscussionPost = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const validatedData = DiscussionPostSchema.parse(req.body);

    // Get thread details
    const { data: thread, error: threadError } = await supabase
      .from('discussion_threads')
      .select('id, assignment_id, class_id, is_locked')
      .eq('id', validatedData.threadId)
      .single();

    if (threadError || !thread) {
      return res.status(404).json({ 
        success: false, 
        error: 'Discussion thread not found' 
      });
    }

    if (thread.is_locked) {
      return res.status(403).json({ 
        success: false, 
        error: 'Discussion thread is locked' 
      });
    }

    // Check if user is enrolled in class or is teacher
    const isEnrolled = await isEnrolledInClass(user.id, thread.class_id);
    const isClassTeacher = await isTeacherOfClass(user.id, thread.class_id);

    if (!isEnrolled && !isClassTeacher) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to post in this discussion' 
      });
    }

    // Create discussion post
    const { data: post, error: postError } = await supabase
      .from('discussion_posts')
      .insert({
        thread_id: validatedData.threadId,
        author_id: user.id,
        content: validatedData.content,
        parent_post_id: validatedData.parentPostId,
        is_teacher_post: validatedData.isTeacherPost,
        moderation_status: 'approved',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating discussion post:', postError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create discussion post' 
      });
    }

    return res.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        isTeacherPost: post.is_teacher_post,
        createdAt: post.created_at
      }
    });

  } catch (error) {
    console.error('Discussion post error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get messages for user
const handleGetMessages = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const { assignmentId, type = 'all' } = req.query;

    let query = supabase
      .from('assignment_messages')
      .select(`
        *,
        assignments!inner(
          id,
          title
        ),
        senders:users!assignment_messages_sender_id_fkey(
          id,
          name,
          email
        ),
        recipients:users!assignment_messages_recipient_id_fkey(
          id,
          name,
          email
        )
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }

    if (type !== 'all') {
      query = query.eq('message_type', type);
    }

    const { data: messages, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch messages' 
      });
    }

    return res.json({
      success: true,
      messages: messages || []
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Get clarification requests
const handleGetClarifications = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await authenticateUser(req);
    const { assignmentId, status = 'all' } = req.query;
    const isUserTeacher = await isTeacher(user.id);

    let query = supabase
      .from('assignment_clarifications')
      .select(`
        *,
        assignments!inner(
          id,
          title
        ),
        students:users!assignment_clarifications_student_id_fkey(
          id,
          name,
          email
        ),
        teachers:users!assignment_clarifications_teacher_id_fkey(
          id,
          name,
          email
        )
      `);

    if (isUserTeacher) {
      // Teachers see all clarifications for their assignments
      query = query.eq('teacher_id', user.id);
    } else {
      // Students see only their own clarifications
      query = query.eq('student_id', user.id);
    }

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: clarifications, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clarifications:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch clarifications' 
      });
    }

    return res.json({
      success: true,
      clarifications: clarifications || []
    });

  } catch (error) {
    console.error('Get clarifications error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'enhanced-feedback':
        return await handleEnhancedFeedback(req, res);
      
      case 'send-message':
        return await handleAssignmentMessage(req, res);
      
      case 'clarification-request':
        return await handleClarificationRequest(req, res);
      
      case 'discussion-post':
        return await handleDiscussionPost(req, res);
      
      case 'get-messages':
        return await handleGetMessages(req, res);
      
      case 'get-clarifications':
        return await handleGetClarifications(req, res);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action specified' 
        });
    }
  } catch (error) {
    console.error('Assignment communication error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal, unique } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  username: text('username').unique().notNull(), // Public display name for perspectives
  institutionName: text('institution_name'), // Name of school/organization, optional
  institutionType: text('institution_type'), // Type of institution, optional
  role: text('role').default('user'), // 'user', 'moderator', 'admin'
  authUserId: text('auth_user_id').unique(), // Supabase Auth UUID mapping
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Scenarios table
export const scenarios = pgTable('scenarios', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  context: text('context').notNull(),
  dilemma: text('dilemma').notNull(),
  stakeholders: jsonb('stakeholders').notNull(), // Array of stakeholder objects
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Perspectives table
export const perspectives = pgTable('perspectives', {
  id: serial('id').primaryKey(),
  scenarioId: integer('scenario_id').notNull().references(() => scenarios.id),
  userId: integer('user_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  
  // Content moderation fields
  moderationStatus: text('moderation_status').default('pending'), // 'pending', 'approved', 'rejected', 'flagged'
  moderationScore: integer('moderation_score').default(0), // AI-generated toxicity score (0-100)
  moderationFlags: jsonb('moderation_flags'), // Array of detected issues
  moderatedBy: integer('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Replies table (for threaded discussions)
export const replies = pgTable('replies', {
  id: serial('id').primaryKey(),
  perspectiveId: integer('perspective_id').notNull().references(() => perspectives.id),
  userId: integer('user_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  
  // Content moderation fields
  moderationStatus: text('moderation_status').default('pending'),
  moderationScore: integer('moderation_score').default(0),
  moderationFlags: jsonb('moderation_flags'),
  moderatedBy: integer('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User progress tracking
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  scenarioId: integer('scenario_id').notNull().references(() => scenarios.id),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Content reports (for community moderation)
export const contentReports = pgTable('content_reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').references(() => users.id),
  contentType: text('content_type').notNull(), // 'perspective', 'reply'
  contentId: integer('content_id').notNull(),
  reason: text('reason').notNull(), // 'spam', 'inappropriate', 'harassment', etc.
  description: text('description'),
  status: text('status').default('pending'), // 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit log for moderation actions
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // 'approve', 'reject', 'flag', 'ban', etc.
  entityType: text('entity_type').notNull(), // 'perspective', 'reply', 'user'
  entityId: integer('entity_id').notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// TEACHER DASHBOARD & CLASSROOM MANAGEMENT TABLES
// ============================================================================

// Classes/Sections table
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  teacherId: integer('teacher_id').references(() => users.id),
  schoolYear: text('school_year'),
  semester: text('semester').default('Fall'),
  subject: text('subject'),
  gradeLevel: text('grade_level'),
  classCode: text('class_code').unique().notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Class enrollments (many-to-many relationship between users and classes)
export const classEnrollments = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id),
  studentId: integer('student_id').references(() => users.id),
  enrollmentDate: timestamp('enrollment_date').defaultNow(),
  status: text('status').default('active'), // active, dropped, completed
  createdAt: timestamp('created_at').defaultNow(),
});

// Groups within classes
export const classGroups = pgTable('class_groups', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id),
  name: text('name').notNull(),
  description: text('description'),
  maxMembers: integer('max_members').default(6),
  createdAt: timestamp('created_at').defaultNow(),
});

// Group memberships
export const groupMemberships = pgTable('group_memberships', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => classGroups.id),
  studentId: integer('student_id').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Assignments
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id),
  title: text('title').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  assignmentType: text('assignment_type').default('scenario'), // scenario, custom, discussion
  scenarioIds: jsonb('scenario_ids'), // Array of scenario IDs
  dueDate: timestamp('due_date'),
  pointsPossible: integer('points_possible').default(100),
  rubric: jsonb('rubric'), // Rubric criteria and scoring
  isPublished: boolean('is_published').default(false), // ← CRITICAL FIX
  allowLateSubmissions: boolean('allow_late_submissions').default(true),
  latePenaltyPerDay: integer('late_penalty_per_day').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assignment submissions
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignments.id),
  studentId: integer('student_id').references(() => users.id),
  submissionData: jsonb('submission_data').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow(),
  isLate: boolean('is_late').default(false),
  status: text('status').default('submitted'), // submitted, graded, returned
  autoScore: integer('auto_score'),
  manualScore: integer('manual_score'),
  finalScore: integer('final_score'),
  feedback: text('feedback'),
  gradedAt: timestamp('graded_at'),
  gradedBy: integer('graded_by').references(() => users.id),
});

// Student engagement tracking
export const studentEngagement = pgTable('student_engagement', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id),
  classId: integer('class_id').references(() => classes.id),
  scenarioId: integer('scenario_id').references(() => scenarios.id),
  sessionStart: timestamp('session_start').defaultNow(),
  sessionEnd: timestamp('session_end'),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  actionsTaken: jsonb('actions_taken'),
  perspectivesSubmitted: integer('perspectives_submitted').default(0),
  qualityScore: decimal('quality_score', { precision: 3, scale: 2 }),
  engagementScore: decimal('engagement_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Gradebook entries
export const gradebookEntries = pgTable('gradebook_entries', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id),
  assignmentId: integer('assignment_id').references(() => assignments.id),
  studentId: integer('student_id').references(() => users.id),
  category: text('category').default('assignment'), // assignment, participation, quiz, project
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }),
  pointsPossible: decimal('points_possible', { precision: 5, scale: 2 }),
  letterGrade: text('letter_grade'),
  isExcused: boolean('is_excused').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientId: integer('recipient_id').references(() => users.id),
  senderId: integer('sender_id').references(() => users.id),
  type: text('type').notNull(), // assignment_due, grade_posted, discussion_reply, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'), // Additional data (assignment_id, class_id, etc.)
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Moderation queue
export const moderationQueue = pgTable('moderation_queue', {
  id: serial('id').primaryKey(),
  contentType: text('content_type').notNull(), // discussion_post, perspective, assignment_submission
  contentId: integer('content_id').notNull(),
  classId: integer('class_id').references(() => classes.id),
  flaggedBy: integer('flagged_by').references(() => users.id),
  flaggedReason: text('flagged_reason'),
  contentText: text('content_text'),
  aiAnalysis: jsonb('ai_analysis'), // AI moderation results
  status: text('status').default('pending'), // pending, reviewed, approved, rejected
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assignment templates
export const assignmentTemplates = pgTable('assignment_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  templateData: jsonb('template_data').notNull(),
  category: text('category').default('ethics'), // ethics, critical_thinking, discussion
  isPublic: boolean('is_public').default(false),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}); 
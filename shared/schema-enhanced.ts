import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for content moderation
export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'approved', 'rejected', 'flagged']);
export const userRoleEnum = pgEnum('user_role', ['user', 'teacher', 'moderator', 'admin']);
export const reportReasonEnum = pgEnum('report_reason', ['inappropriate', 'spam', 'harassment', 'misinformation', 'other']);

// Enhanced users table with roles and moderation fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default('user').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  name: text("name"),
  institutionName: text("institution_name"),
  institutionType: text("institution_type"),
  department: text("department"),
  bio: text("bio"),
  phone: text("phone"),
  officeHours: text("office_hours"),
  preferredCommunication: text("preferred_communication").default("email"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scenarios table (same as before)
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  options: json("options").$type<string[]>().notNull(),
  aiUseAnswer: text("ai_use_answer").notNull(),
  sdgTags: json("sdg_tags").$type<string[]>().notNull(),
  sdgDetails: json("sdg_details").$type<{
    goal: string,
    description: string,
    relevance: string,
    icon: string
  }[]>().default([]).notNull(),
  relatedResources: json("related_resources").$type<{
    title: string, 
    source: string, 
    type: string, 
    link: string
  }[]>().notNull(),
  order: integer("order").notNull(),
});

// Enhanced perspectives table with moderation
export const perspectives = pgTable("perspectives", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  userId: integer("user_id"), // Can be null for anonymous submissions
  content: text("content").notNull(),
  authorName: text("author_name").default("Anonymous").notNull(),
  likes: integer("likes").default(0).notNull(),
  parentId: integer("parent_id"), // For replies
  
  // Moderation fields
  moderationStatus: moderationStatusEnum("moderation_status").default('pending').notNull(),
  moderatedBy: integer("moderated_by"), // Reference to moderator user
  moderatedAt: timestamp("moderated_at"),
  moderationNotes: text("moderation_notes"),
  
  // Auto-moderation metadata
  autoModerationScore: integer("auto_moderation_score"), // 0-100 toxicity score
  flaggedKeywords: json("flagged_keywords").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPerspectiveSchema = createInsertSchema(perspectives).pick({
  scenarioId: true,
  userId: true,
  content: true,
  authorName: true,
  parentId: true,
});

export type InsertPerspective = z.infer<typeof insertPerspectiveSchema>;
export type Perspective = typeof perspectives.$inferSelect;

// Content reports table
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  perspectiveId: integer("perspective_id").notNull(),
  reporterId: integer("reporter_id"), // Can be null for anonymous reports
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  status: moderationStatusEnum("status").default('pending').notNull(),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentReportSchema = createInsertSchema(contentReports).pick({
  perspectiveId: true,
  reporterId: true,
  reason: true,
  description: true,
});

export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type ContentReport = typeof contentReports.$inferSelect;

// User progress table (enhanced)
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  scenarioId: integer("scenario_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  
  // Additional analytics
  timeSpent: integer("time_spent_seconds"), // Time spent on scenario
  submissionCount: integer("submission_count").default(0), // Number of perspectives submitted
});

// Moderation queue for efficient workflow
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  classId: integer("class_id"),
  flaggedBy: integer("flagged_by"),
  flaggedReason: text("flagged_reason"),
  contentText: text("content_text"),
  aiAnalysis: json("ai_analysis").$type<{
    toxicity: number,
    sentiment: number,
    flags: string[]
  }>(),
  status: text("status").default("pending"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit log for all moderation actions
export const moderationAuditLog = pgTable("moderation_audit_log", {
  id: serial("id").primaryKey(),
  perspectiveId: integer("perspective_id").notNull(),
  moderatorId: integer("moderator_id").notNull(),
  action: text("action").notNull(), // 'approved', 'rejected', 'flagged', 'edited'
  previousStatus: moderationStatusEnum("previous_status"),
  newStatus: moderationStatusEnum("new_status"),
  reason: text("reason"),
  metadata: json("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User sessions for authentication
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(), // Session token
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSessionSchema = createInsertSchema(userSessions);
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// New teacher dashboard tables
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  schoolYear: text("school_year").default(new Date().getFullYear().toString()),
  semester: text("semester").default("Fall"),
  subject: text("subject"),
  gradeLevel: text("grade_level"),
  classCode: text("class_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  studentId: integer("student_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  status: text("status").default("active").notNull(),
});

export const classGroups = pgTable("class_groups", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members").default(6),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  studentId: integer("student_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  assignmentType: text("assignment_type").default("scenario"),
  scenarioIds: json("scenario_ids").$type<number[]>(),
  dueDate: timestamp("due_date"),
  pointsPossible: integer("points_possible").default(100),
  rubric: json("rubric").$type<{
    criteria: string,
    points: number,
    description: string
  }[]>(),
  isPublished: boolean("is_published").default(false),
  allowLateSubmissions: boolean("allow_late_submissions").default(true),
  latePenaltyPerDay: integer("late_penalty_per_day").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  studentId: integer("student_id").notNull(),
  submissionData: json("submission_data").$type<{
    perspectives: string[],
    answers: Record<string, any>,
    timeSpent: number
  }>().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  isLate: boolean("is_late").default(false),
  status: text("status").default("submitted"),
  autoScore: integer("auto_score"),
  manualScore: integer("manual_score"),
  finalScore: integer("final_score"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
  gradedBy: integer("graded_by"),
});

export const studentEngagement = pgTable("student_engagement", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  scenarioId: integer("scenario_id").notNull(),
  sessionStart: timestamp("session_start").defaultNow().notNull(),
  sessionEnd: timestamp("session_end"),
  timeSpentSeconds: integer("time_spent_seconds").default(0),
  actionsTaken: json("actions_taken").$type<{
    timestamp: string,
    action: string,
    data?: any
  }[]>(),
  perspectivesSubmitted: integer("perspectives_submitted").default(0),
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }),
  engagementScore: decimal("engagement_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discussionThreads = pgTable("discussion_threads", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  classId: integer("class_id").notNull(),
  title: text("title").notNull(),
  initialPost: text("initial_post"),
  createdBy: integer("created_by").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discussionPosts = pgTable("discussion_posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  authorId: integer("author_id").notNull(),
  content: text("content").notNull(),
  parentPostId: integer("parent_post_id"),
  isTeacherPost: boolean("is_teacher_post").default(false),
  moderationStatus: text("moderation_status").default("approved"),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gradebookEntries = pgTable("gradebook_entries", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  assignmentId: integer("assignment_id").notNull(),
  studentId: integer("student_id").notNull(),
  category: text("category").default("assignment"),
  pointsEarned: decimal("points_earned", { precision: 5, scale: 2 }),
  pointsPossible: decimal("points_possible", { precision: 5, scale: 2 }),
  letterGrade: text("letter_grade"),
  isExcused: boolean("is_excused").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull(),
  senderId: integer("sender_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: json("data").$type<Record<string, any>>(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignmentTemplates = pgTable("assignment_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  templateData: json("template_data").$type<{
    instructions: string,
    scenarioIds: number[],
    rubric: any[],
    pointsPossible: number
  }>().notNull(),
  category: text("category").default("ethics"),
  isPublic: boolean("is_public").default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validation
export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertStudentEngagementSchema = createInsertSchema(studentEngagement).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;

export type StudentEngagement = typeof studentEngagement.$inferSelect;
export type InsertStudentEngagement = z.infer<typeof insertStudentEngagementSchema>;

export type DiscussionThread = typeof discussionThreads.$inferSelect;
export type DiscussionPost = typeof discussionPosts.$inferSelect;

export type GradebookEntry = typeof gradebookEntries.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type ModerationQueueItem = typeof moderationQueue.$inferSelect;
export type AssignmentTemplate = typeof assignmentTemplates.$inferSelect;

// Teacher access request tables
export const teacherAccessRequests = pgTable("teacher_access_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  institutionName: text("institution_name"),
  institutionType: text("institution_type"),
  department: text("department"),
  requestReason: text("request_reason").notNull(),
  status: text("status").default("pending"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roleChangeLog = pgTable("role_change_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  previousRole: text("previous_role"),
  newRole: text("new_role").notNull(),
  updatedBy: integer("updated_by"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeacherAccessRequestSchema = createInsertSchema(teacherAccessRequests).pick({
  userId: true,
  institutionName: true,
  institutionType: true,
  department: true,
  requestReason: true,
});

export type TeacherAccessRequest = typeof teacherAccessRequests.$inferSelect;
export type InsertTeacherAccessRequest = z.infer<typeof insertTeacherAccessRequestSchema>;
export type RoleChangeLog = typeof roleChangeLog.$inferSelect; 
import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for content moderation
export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'approved', 'rejected', 'flagged']);
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);
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
  perspectiveId: integer("perspective_id").notNull(),
  priority: integer("priority").default(1).notNull(), // 1=low, 5=high
  assignedTo: integer("assigned_to"), // Moderator assigned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
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
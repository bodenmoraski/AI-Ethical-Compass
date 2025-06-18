import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  username: text('username').unique().notNull(), // Public display name for perspectives
  institutionName: text('institution_name'), // Name of school/organization, optional
  institutionType: text('institution_type'), // Type of institution, optional
  role: text('role').default('user'), // 'user', 'moderator', 'admin'
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
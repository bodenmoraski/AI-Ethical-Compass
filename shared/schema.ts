import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  options: json("options").$type<string[]>().notNull(),
  aiUseAnswer: text("ai_use_answer").notNull(),
  sdgTags: json("sdg_tags").$type<string[]>().notNull(),
  relatedResources: json("related_resources").$type<{title: string, source: string, type: string, link: string}[]>().notNull(),
  order: integer("order").notNull(),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

export const perspectives = pgTable("perspectives", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerspectiveSchema = createInsertSchema(perspectives).omit({
  id: true,
  createdAt: true,
});

export type InsertPerspective = z.infer<typeof insertPerspectiveSchema>;
export type Perspective = typeof perspectives.$inferSelect;

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  scenarioId: integer("scenario_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

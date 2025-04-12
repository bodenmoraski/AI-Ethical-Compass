import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export interface Option {
  text: string;
  consequence: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  options: jsonb("options").$type<Option[]>().notNull(),
  ethicalConsiderations: jsonb("ethical_considerations").$type<string[]>().notNull(),
  sdgTags: jsonb("sdg_tags").$type<string[]>().notNull(),
  resources: jsonb("resources").$type<Resource[]>().notNull(),
  order: integer("order").notNull(),
});

export const perspectives = pgTable("perspectives", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: integer("parent_id"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  scenarioId: integer("scenario_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
}); 
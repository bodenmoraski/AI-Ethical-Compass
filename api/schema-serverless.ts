import { z } from "zod";

export const insertPerspectiveSchema = z.object({
  scenarioId: z.number(),
  content: z.string(),
  authorName: z.string().optional(),
  likes: z.number().optional(),
  parentId: z.number().nullable().optional(),
});

export type InsertPerspective = z.infer<typeof insertPerspectiveSchema>;

export type Perspective = {
  id: number;
  scenarioId: number;
  content: string;
  authorName: string;
  likes: number;
  parentId: number | null;
  createdAt: Date;
};

export const insertUserProgressSchema = z.object({
  userId: z.number().nullable().optional(),
  scenarioId: z.number(),
  completed: z.boolean().default(true)
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>; 
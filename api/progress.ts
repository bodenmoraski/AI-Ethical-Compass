import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import { storage } from "../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Simple validation
      const schema = z.object({
        userId: z.number().nullable().optional(),
        scenarioId: z.number(),
        completed: z.boolean().default(true)
      });
      
      const progressData = schema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      return res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update progress" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
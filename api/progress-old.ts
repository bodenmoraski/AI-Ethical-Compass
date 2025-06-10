import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for serverless - in production this would be a database
let progressData: Array<{ userId: number | null; scenarioId: number; completed: boolean }> = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PROGRESS API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));

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
      const { userId, scenarioId, completed } = req.body;
      
      // Basic validation
      if (!scenarioId || typeof scenarioId !== 'number') {
        return res.status(400).json({ message: "scenarioId is required and must be a number" });
      }
      
      // Simple storage - just add to array
      const progress = {
        id: progressData.length + 1,
        userId: userId || null,
        scenarioId,
        completed: completed !== false, // default to true
        completedAt: new Date()
      };
      
      progressData.push({
        userId: progress.userId,
        scenarioId: progress.scenarioId,
        completed: progress.completed
      });
      
      console.log(`Progress updated for scenario ${scenarioId}`);
      
      return res.json(progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      return res.status(500).json({ message: "Failed to update progress" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
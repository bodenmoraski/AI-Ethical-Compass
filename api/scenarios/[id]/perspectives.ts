import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const scenarioId = parseInt(id as string);
      
      if (isNaN(scenarioId)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }
      
      // Add debug logging
      console.log(`Fetching perspectives for scenario ID: ${scenarioId}`);
      
      // Get all perspectives from storage
      const perspectives = await storage.getPerspectivesByScenarioId(scenarioId);
      
      // Log the results
      console.log(`Found ${perspectives.length} perspectives for scenario ${scenarioId}`);
      perspectives.forEach(p => {
        console.log(`- Perspective ID ${p.id}, scenarioId: ${p.scenarioId}, author: ${p.authorName}`);
      });
      
      return res.json(perspectives);
    } catch (error) {
      console.error("Error retrieving perspectives:", error);
      return res.status(500).json({ message: "Failed to retrieve perspectives" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
import type { VercelRequest, VercelResponse } from '@vercel/node';
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

  if (req.method === 'GET') {
    try {
      console.log("GET /api/scenarios - Fetching all scenarios");
      const scenarios = await storage.getAllScenarios();
      console.log(`Found ${scenarios.length} scenarios`);
      scenarios.forEach(s => {
        console.log(`- Scenario ${s.id}: ${s.title}`);
      });
      return res.json(scenarios);
    } catch (error) {
      console.error("Error retrieving scenarios:", error);
      return res.status(500).json({ message: "Failed to retrieve scenarios" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
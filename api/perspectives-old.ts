import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage
let perspectives: Array<{
  id: number;
  scenarioId: number;
  content: string;
  authorName: string;
  likes: number;
  parentId: number | null;
  createdAt: Date;
}> = [
  {
    id: 1,
    scenarioId: 1,
    content: "I believe AI was definitely used in this scenario. The sudden improvement in writing quality, especially from a student who speaks English as a second language, is a telltale sign. Educators need to establish clear guidelines on acceptable AI use for editing vs. generating content.",
    authorName: "Teacher23",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: 2,
    scenarioId: 1,
    content: "As someone who struggled with English growing up, I think we should consider that the student might have worked extra hard on this assignment. Before assuming AI was used, the teacher should have a conversation with the student about their process.",
    authorName: "ESL_Advocate",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T11:00:00Z')
  },
  {
    id: 3,
    scenarioId: 2,
    content: "Facial recognition in schools raises serious privacy concerns. While security is important, students shouldn't have to sacrifice their biometric data just to attend class. There are less invasive security measures that could be implemented instead.",
    authorName: "PrivacyFirst",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T12:00:00Z')
  }
];

let currentId = 4;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('Processing POST request...');
      console.log("Received perspective submission request:", req.body);
      
      const { scenarioId, content, authorName } = req.body;
      
      // Basic validation
      if (!scenarioId || typeof scenarioId !== 'number') {
        return res.status(400).json({ message: "scenarioId is required and must be a number" });
      }
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "content is required and cannot be empty" });
      }
      
      if (content.trim().length < 5) {
        return res.status(400).json({ message: "content is too short (minimum 5 characters)" });
      }
      
      if (content.trim().length > 2000) {
        return res.status(400).json({ message: "content is too long (maximum 2000 characters)" });
      }
      
      // Validate scenario exists (simple check for IDs 1-10)
      if (scenarioId < 1 || scenarioId > 10) {
        return res.status(400).json({ message: `Scenario with ID ${scenarioId} does not exist` });
      }
      
                    // Create the perspective
       const perspective = {
         id: currentId++,
         scenarioId,
         content: content.trim(),
         authorName: authorName || "Anonymous",
         likes: 0,
         parentId: null,
         createdAt: new Date()
       };
       
       perspectives.push(perspective);
      
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenarioId}`);
      
      return res.status(201).json(perspective);
    } catch (error) {
      console.error("=== ERROR IN PERSPECTIVES API ===");
      console.error("Error:", error);
      
      return res.status(500).json({ 
        message: "Failed to create perspective", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  console.log('Method not allowed:', req.method);
  return res.status(405).json({ message: 'Method not allowed' });
} 
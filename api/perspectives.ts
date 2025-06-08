import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import { storage } from "../server/storage";
import { insertPerspectiveSchema } from "../shared/schema";

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
      console.log("Received perspective submission request:", req.body);
      
      // Validate the data structure with Zod schema
      const perspectiveData = insertPerspectiveSchema.parse(req.body);
      
      console.log("Validated perspective data:", perspectiveData);
      
      // Additional validation for content
      if (!perspectiveData.content || perspectiveData.content.trim().length === 0) {
        console.log("Rejected: Empty content");
        return res.status(400).json({ message: "Perspective content cannot be empty" });
      }
      
      if (perspectiveData.content.trim().length < 5) {
        console.log("Rejected: Content too short");
        return res.status(400).json({ message: "Perspective content is too short" });
      }
      
      if (perspectiveData.content.trim().length > 2000) {
        console.log("Rejected: Content too long");
        return res.status(400).json({ message: "Perspective content exceeds maximum length of 2000 characters" });
      }
      
      // Basic content moderation (check for obvious inappropriate content)
      const inappropriateWords = ['profanity1', 'profanity2']; // Add actual inappropriate words
      const contentLowerCase = perspectiveData.content.toLowerCase();
      const containsInappropriate = inappropriateWords.some(word => 
        contentLowerCase.includes(word.toLowerCase())
      );
      
      if (containsInappropriate) {
        console.log("Rejected: Contains inappropriate content");
        return res.status(400).json({ 
          message: "Perspective contains inappropriate content. Please revise your submission." 
        });
      }
      
      // Ensure the scenario ID actually exists
      const scenario = await storage.getScenarioById(perspectiveData.scenarioId);
      if (!scenario) {
        console.log(`Rejected: Invalid scenario ID ${perspectiveData.scenarioId}`);
        return res.status(400).json({ message: `Scenario with ID ${perspectiveData.scenarioId} does not exist` });
      }
      
      console.log(`Verified scenario ${perspectiveData.scenarioId} exists: ${scenario.title}`);
      
      // Validated, create the perspective
      const perspective = await storage.createPerspective(perspectiveData);
      
      // Log successful storage for debugging
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenarioId}`);
      
      return res.status(201).json(perspective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid perspective data", errors: error.errors });
      }
      console.error("Error creating perspective:", error);
      return res.status(500).json({ message: "Failed to create perspective" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
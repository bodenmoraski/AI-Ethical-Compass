import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES API CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));

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
      
      // Try to import storage
      console.log('Importing storage...');
      let storage;
      try {
        const storageModule = await import("../server/storage");
        storage = storageModule.storage;
        console.log('Storage imported successfully:', !!storage);
      } catch (importError) {
        console.error('Failed to import storage:', importError);
        return res.status(500).json({ 
          message: "Storage import failed", 
          error: importError instanceof Error ? importError.message : String(importError)
        });
      }

      // Try to import schema
      console.log('Importing schema...');
      let insertPerspectiveSchema;
      try {
        const schemaModule = await import("../shared/schema");
        insertPerspectiveSchema = schemaModule.insertPerspectiveSchema;
        console.log('Schema imported successfully:', !!insertPerspectiveSchema);
      } catch (importError) {
        console.error('Failed to import schema:', importError);
        return res.status(500).json({ 
          message: "Schema import failed", 
          error: importError instanceof Error ? importError.message : String(importError)
        });
      }

      console.log("Received perspective submission request:", req.body);
      
      // Validate the data structure with Zod schema
      console.log('Validating with schema...');
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
      console.log('Checking if scenario exists...');
      const scenario = await storage.getScenarioById(perspectiveData.scenarioId);
      if (!scenario) {
        console.log(`Rejected: Invalid scenario ID ${perspectiveData.scenarioId}`);
        return res.status(400).json({ message: `Scenario with ID ${perspectiveData.scenarioId} does not exist` });
      }
      
      console.log(`Verified scenario ${perspectiveData.scenarioId} exists: ${scenario.title}`);
      
      // Validated, create the perspective
      console.log('Creating perspective...');
      const perspective = await storage.createPerspective(perspectiveData);
      
      // Log successful storage for debugging
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenarioId}`);
      
      return res.status(201).json(perspective);
    } catch (error) {
      console.error("=== ERROR IN PERSPECTIVES API ===");
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("Full error object:", error);
      
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid perspective data", errors: error.errors });
      }
      
      return res.status(500).json({ 
        message: "Failed to create perspective", 
        error: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name
      });
    }
  }

  console.log('Method not allowed:', req.method);
  return res.status(405).json({ message: 'Method not allowed' });
} 
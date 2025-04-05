import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPerspectiveSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get all scenarios
  app.get("/api/scenarios", async (_req: Request, res: Response) => {
    try {
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve scenarios" });
    }
  });
  
  // Get scenario by ID
  app.get("/api/scenarios/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }
      
      const scenario = await storage.getScenarioById(id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve scenario" });
    }
  });
  
  // Get perspectives by scenario ID
  app.get("/api/scenarios/:id/perspectives", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }
      
      const perspectives = await storage.getPerspectivesByScenarioId(id);
      res.json(perspectives);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve perspectives" });
    }
  });
  
  // Add a new perspective
  app.post("/api/perspectives", async (req: Request, res: Response) => {
    try {
      const perspectiveData = insertPerspectiveSchema.parse(req.body);
      const perspective = await storage.createPerspective(perspectiveData);
      res.status(201).json(perspective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid perspective data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create perspective" });
    }
  });
  
  // Like a perspective
  app.post("/api/perspectives/:id/like", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid perspective ID" });
      }
      
      const perspective = await storage.likePerspective(id);
      res.json(perspective);
    } catch (error) {
      res.status(500).json({ message: "Failed to like perspective" });
    }
  });
  
  // Get replies to a perspective
  app.get("/api/perspectives/:id/replies", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid perspective ID" });
      }
      
      const replies = await storage.getRepliesByPerspectiveId(id);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve replies" });
    }
  });
  
  // Update user progress
  app.post("/api/progress", async (req: Request, res: Response) => {
    try {
      // Simple validation
      const schema = z.object({
        userId: z.number().nullable().optional(),
        scenarioId: z.number(),
        completed: z.boolean().default(true)
      });
      
      const progressData = schema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

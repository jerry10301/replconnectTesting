import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authMiddleware, 
  adminMiddleware, 
  hashPassword, 
  comparePassword, 
  generateToken,
  type AuthenticatedRequest 
} from "./auth";
import { loginSchema, createUserSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { username, password } = result.data;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValid = await comparePassword(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      res.json({ 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const result = createUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { username, email, password, name, role } = result.data;

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
        role,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const result = updateUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates = { ...result.data };

      if (updates.username && updates.username !== existingUser.username) {
        const existingUsername = await storage.getUserByUsername(updates.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      if (updates.email && updates.email !== existingUser.email) {
        const existingEmail = await storage.getUserByEmail(updates.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/stats", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const [totalUsers, adminUsers, regularUsers, recentUsers] = await Promise.all([
        storage.getUserCount(),
        storage.getAdminCount(),
        storage.getRegularUserCount(),
        storage.getRecentUserCount(7),
      ]);

      res.json({
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

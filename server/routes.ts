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
import { loginSchema, createUserSchema, updateUserSchema, updateProfileSchema, requestPasswordResetSchema, resetPasswordSchema } from "@shared/schema";
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

      await storage.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        action: "login",
        details: `User logged in successfully`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

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

      await storage.createAuditLog({
        actorId: req.user?.id,
        actorName: req.user?.name || "System",
        action: "create_user",
        targetId: user.id,
        targetName: user.name,
        details: `Created user ${user.username} (${user.email}) with role ${user.role}`,
        ipAddress: req.ip || req.socket.remoteAddress,
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

      await storage.createAuditLog({
        actorId: req.user?.id,
        actorName: req.user?.name || "System",
        action: "update_user",
        targetId: user.id,
        targetName: user.name,
        details: `Updated user ${user.username}: ${Object.keys(result.data).join(", ")}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

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

      const userToDelete = await storage.getUser(id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        actorId: req.user?.id,
        actorName: req.user?.name || "System",
        action: "delete_user",
        targetId: id,
        targetName: userToDelete.name,
        details: `Deleted user ${userToDelete.username} (${userToDelete.email})`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

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

  app.post("/api/auth/request-password-reset", async (req, res) => {
    try {
      const result = requestPasswordResetSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { email } = result.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.json({ 
          message: "If an account exists with this email, a password reset link will be sent.",
          success: true
        });
      }

      await storage.invalidateUserPasswordResetTokens(user.id);
      const resetToken = await storage.createPasswordResetToken(user.id);

      console.log(`[Password Reset] Token created for ${email}: ${resetToken.token}`);
      console.log(`[Password Reset] Reset link: /reset-password?token=${resetToken.token}`);

      res.json({ 
        message: "If an account exists with this email, a password reset link will be sent.",
        success: true,
        token: resetToken.token
      });
    } catch (error) {
      console.error("Request password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { token, password } = result.data;
      const resetToken = await storage.getValidPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUser(resetToken.userId, { password: hashedPassword });

      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ 
        message: "Password has been reset successfully. You can now log in with your new password.",
        success: true
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token is required", valid: false });
      }

      const resetToken = await storage.getValidPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token", valid: false });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = updateProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { name, email, currentPassword, newPassword } = result.data;
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates: Partial<{ name: string; email: string; password: string }> = {};

      if (name) {
        updates.name = name;
      }

      if (email && email !== user.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
        updates.email = email;
      }

      if (newPassword && currentPassword) {
        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        updates.password = await hashPassword(newPassword);
      }

      if (Object.keys(updates).length === 0) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }

      const updatedUser = await storage.updateUser(req.user.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateDetails = [];
      if (name) updateDetails.push("name");
      if (email) updateDetails.push("email");
      if (newPassword) updateDetails.push("password");

      await storage.createAuditLog({
        actorId: req.user.id,
        actorName: user.name,
        action: newPassword ? "password_change" : "profile_update",
        targetId: req.user.id,
        targetName: updatedUser.name,
        details: `Updated profile: ${updateDetails.join(", ")}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/audit-logs", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const [logs, totalCount] = await Promise.all([
        storage.getAuditLogs(limit, offset),
        storage.getAuditLogCount(),
      ]);

      res.json({
        logs,
        total: totalCount,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

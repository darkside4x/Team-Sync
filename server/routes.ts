import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { insertUserSchema, insertTeamSchema, insertTeamRequestSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Configure session
const sessionConfig = {
  secret: "teamSync2024SecureRandomString12345",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false for localhost development
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Configure Google OAuth with hardcoded credentials
passport.use(new GoogleStrategy({
  clientID: "13934850304-ag07i5ppra9rbrmlkk7a25hfjum6562t.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("No email found"), undefined);

    // Check if domain is allowed (not gmail.com)
    const domain = email.split('@')[1];
    if (domain === 'gmail.com') {
      return done(new Error("Gmail accounts are not allowed. Please use your institutional email."), undefined);
    }

    // Check if user exists
    let user = await storage.getUserByGoogleId(profile.id);
    
    if (!user) {
      // Create new user
      user = await storage.createUser({
        googleId: profile.id,
        email: email,
        name: profile.displayName || "",
        avatar: profile.photos?.[0]?.value,
        university: domain.includes('vit') ? 'VIT University' : domain.split('.')[0].toUpperCase(),
        isProfileComplete: false
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/?error=auth_failed" }),
    (req, res) => {
      const user = req.user as any;
      if (!user.isProfileComplete) {
        res.redirect("/profile");
      } else {
        res.redirect("/dashboard");
      }
    }
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // User routes
  app.post("/api/users/profile", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser((req.user as any).id, {
        ...userData,
        isProfileComplete: true
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/users", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        university: user.university,
        department: user.department,
        skills: user.skills,
        bio: user.bio
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      res.json({ available: !user });
    } catch (error) {
      res.status(500).json({ error: "Failed to check username" });
    }
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const { category } = req.query;
      let teams;
      
      if (category && typeof category === 'string') {
        teams = await storage.getTeamsByCategory(category);
      } else {
        teams = await storage.getRecommendedTeams((req.user as any).id);
      }
      
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/my", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const teams = await storage.getTeamsByUser((req.user as any).id);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const teamData = insertTeamSchema.parse({
        ...req.body,
        leaderId: (req.user as any).id
      });
      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) return res.status(404).json({ error: "Team not found" });
      
      const members = await storage.getTeamMembers(team.id);
      res.json({ ...team, members });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  // Team request routes
  app.post("/api/teams/:id/join", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const requestData = insertTeamRequestSchema.parse({
        teamId: req.params.id,
        userId: (req.user as any).id,
        message: req.body.message
      });
      const request = await storage.createTeamRequest(requestData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/teams/:id/requests", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) return res.status(404).json({ error: "Team not found" });
      if (team.leaderId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const requests = await storage.getTeamRequests(req.params.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.put("/api/team-requests/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const { status } = z.object({ status: z.enum(["approved", "rejected"]) }).parse(req.body);
      const request = await storage.updateTeamRequest(req.params.id, status);
      
      // If approved, add user to team
      if (status === "approved") {
        await storage.addTeamMember({
          teamId: request.teamId,
          userId: request.userId,
          status: "approved",
          role: "member"
        });
      }
      
      res.json(request);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Message routes
  app.get("/api/teams/:id/messages", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      // Check if user is a member of the team
      const members = await storage.getTeamMembers(req.params.id);
      const isMember = members.some(member => member.userId === (req.user as any).id && member.status === "approved");
      
      if (!isMember) {
        return res.status(403).json({ error: "Not a team member" });
      }
      
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Save message to database
          const savedMessage = await storage.createMessage(insertMessageSchema.parse({
            teamId: message.teamId,
            userId: message.userId,
            content: message.content
          }));
          
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                message: savedMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
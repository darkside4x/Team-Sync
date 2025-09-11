import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { insertUserSchema, insertTeamSchema, insertTeamRequestSchema, insertMessageSchema, insertEventSchema } from "@shared/schema";
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

  // Institution auth (simple session-based)
  app.post("/api/auth/institution/login", (req, res) => {
    const { email, password, domain } = req.body || {};
    if (
      email === "admin@vit.ac.in" &&
      password === "vit" &&
      domain === "vitstudent.ac.in"
    ) {
      // Store minimal institution session separate from passport user session
      (req.session as any).institution = {
        email,
        domain,
        role: "institution"
      };
      return res.json({ success: true });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/institution/logout", (req, res) => {
    if ((req.session as any).institution) {
      delete (req.session as any).institution;
    }
    res.json({ success: true });
  });

  app.get("/api/auth/institution/me", (req, res) => {
    const inst = (req.session as any).institution;
    if (inst) {
      return res.json(inst);
    }
    return res.status(401).json({ error: "Not authenticated" });
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

  app.get("/api/users/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        university: user.university,
        department: user.department,
        skills: user.skills,
        bio: user.bio,
        socialLinks: user.socialLinks,
        achievements: user.achievements,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
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

  // Public: get user profile by username (no auth required)
  app.get("/api/public/users/:username", async (req, res) => {
    try {
      const username = req.params.username?.replace(/^@/, "");
      if (!username) return res.status(400).json({ error: "Username required" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        university: user.university,
        department: user.department,
        bio: user.bio,
        skills: user.skills,
        achievements: user.achievements,
        socialLinks: user.socialLinks,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    try {
      const { category, all } = req.query as { category?: string; all?: string };
      let teams;
      if (all === 'true') {
        teams = await storage.getAllActiveTeams();
      } else if (category && typeof category === 'string') {
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
      const raw = req.body || {};
      const teamData = insertTeamSchema.parse({
        ...raw,
        leaderId: (req.user as any).id,
        // Coerce types from JSON
        maxMembers: typeof raw.maxMembers === 'string' ? parseInt(raw.maxMembers, 10) : raw.maxMembers,
        deadline: raw.deadline ? new Date(raw.deadline) : undefined,
        requiredSkills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : undefined,
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
      // Prevent duplicates and members re-requesting
      const teamId = req.params.id;
      const userId = (req.user as any).id;
      const existingMembers = await storage.getTeamMembers(teamId);
      const isAlreadyMember = existingMembers.some(m => m.userId === userId && m.status === "approved");
      if (isAlreadyMember) {
        return res.status(409).json({ error: "Already a team member" });
      }
      const existingRequests = await storage.getTeamRequestsByTeamAndUser(teamId, userId);
      if (existingRequests.length > 0) {
        // Keep the latest pending, remove duplicates for cleanliness
        await storage.deleteTeamRequestsExceptLatest(teamId, userId);
        const latest = existingRequests[0];
        if (latest.status === "pending") {
          return res.status(409).json({ error: "You have already requested to join this team." });
        }
        if (latest.status === "approved") {
          return res.status(409).json({ error: "Already a team member." });
        }
        if (latest.status === "rejected") {
          return res.status(409).json({ error: "Your previous request was rejected." });
        }
      }

      const requestData = insertTeamRequestSchema.parse({
        teamId,
        userId,
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
      
      // Cleanup duplicates before returning
      const allForTeam = await storage.getTeamRequests(req.params.id);
      const byUser = new Map<string, any[]>();
      for (const r of allForTeam) {
        const arr = byUser.get(r.userId) || [];
        arr.push(r);
        byUser.set(r.userId, arr);
      }
      for (const [userId, list] of byUser) {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 1) {
          await storage.deleteTeamRequestsExceptLatest(req.params.id, userId);
        }
      }
      let requests = await storage.getTeamRequests(req.params.id);
      // Only return pending requests for visibility in Manage tab
      requests = requests.filter(r => r.status === "pending");
      // Attach basic user info for display
      const requestsWithUsers = await Promise.all(requests.map(async (r) => {
        try {
          const u = await storage.getUser(r.userId);
          return { ...r, user: u ? { id: u.id, name: u.name, avatar: u.avatar, email: u.email } : undefined };
        } catch {
          return r as any;
        }
      }));
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Clear all requests for a specific team (leader only)
  app.delete("/api/teams/:id/requests", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) return res.status(404).json({ error: "Team not found" });
      if (team.leaderId !== (req.user as any).id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const cleared = await storage.deleteAllTeamRequests(team.id);
      res.json({ success: true, cleared });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear requests" });
    }
  });

  // Clear all requests for teams led by the current user
  app.delete("/api/teams/my/requests", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    try {
      const myTeams = await storage.getTeamsByUser((req.user as any).id);
      const leaderTeams = myTeams.filter(t => t.leaderId === (req.user as any).id);
      let deleted = 0;
      for (const t of leaderTeams) {
        const reqs = await storage.getTeamRequests(t.id);
        for (const r of reqs) {
          // reuse existing update to mark as rejected for audit or hard delete? We'll hard delete for clear
        }
      }
      // Hard delete all requests for leader teams
      // Direct access via storage is not defined; use db via storage helper: delete all except none
      // For simplicity, mark all as rejected and then filter them out from GET. We'll just mark rejected here.
      for (const t of leaderTeams) {
        const reqs = await storage.getTeamRequests(t.id);
        for (const r of reqs) {
          await storage.updateTeamRequest(r.id, "rejected");
          deleted++;
        }
      }
      res.json({ success: true, cleared: deleted });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear requests" });
    }
  });

  app.get("/api/teams/my/requests/pending", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    try {
      const myTeams = await storage.getTeamsByUser((req.user as any).id);
      const leaderTeams = myTeams.filter(t => t.leaderId === (req.user as any).id);
      const all = await Promise.all(leaderTeams.map(t => storage.getTeamRequests(t.id)));
      const requests = all.flat().filter(r => r.status === "pending");
      res.json({ count: requests.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending requests" });
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
      const { domain } = req.query as { domain?: string };
      let events = await storage.getActiveEvents();
      if (domain && typeof domain === "string") {
        events = events.filter(e => (e as any).domain === domain);
      } else if (req.user) {
        // If a student/user is logged in and no explicit domain specified,
        // filter by their email domain so they only see institution events for their domain
        const email = (req.user as any).email as string | undefined;
        const userDomain = email ? email.split('@')[1] : undefined;
        if (userDomain) {
          events = events.filter(e => (e as any).domain === userDomain);
        }
      }
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Create event (institution only)
  app.post("/api/events", async (req, res) => {
    try {
      const inst = (req.session as any).institution;
      if (!inst) {
        return res.status(403).json({ error: "Only institutions can create events" });
      }
      const raw = req.body || {};
      const payload = insertEventSchema.parse({
        ...raw,
        // Ensure dates are Date objects
        startDate: raw.startDate ? new Date(raw.startDate) : undefined,
        endDate: raw.endDate ? new Date(raw.endDate) : undefined,
        registrationDeadline: raw.registrationDeadline ? new Date(raw.registrationDeadline) : undefined,
        domain: inst.domain,
        organizer: raw.organizer || inst.email
      });
      const created = await storage.createEvent(payload);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Institution: list students of own domain
  app.get("/api/institution/students", async (req, res) => {
    try {
      const inst = (req.session as any).institution;
      if (!inst) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const domain = inst.domain as string;
      const students = await storage.getUsersByEmailDomain(domain);
      const minimal = students.map(u => ({ id: u.id, name: u.name, department: u.department }));
      res.json(minimal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
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
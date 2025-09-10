import { 
  users, teams, teamMembers, teamRequests, messages, events,
  type User, type InsertUser, type Team, type InsertTeam, 
  type TeamMember, type InsertTeamMember, type TeamRequest, type InsertTeamRequest,
  type Message, type InsertMessage, type Event, type InsertEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, ilike, not, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Team methods
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByUser(userId: string): Promise<Team[]>;
  getTeamsByCategory(category: string): Promise<Team[]>;
  getRecommendedTeams(userId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team>;
  
  // Team member methods
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  getTeamMembersByUser(userId: string): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(teamId: string, userId: string, status: string): Promise<TeamMember>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  
  // Team request methods
  getTeamRequests(teamId: string): Promise<TeamRequest[]>;
  getTeamRequestsByUser(userId: string): Promise<TeamRequest[]>;
  createTeamRequest(request: InsertTeamRequest): Promise<TeamRequest>;
  updateTeamRequest(id: string, status: string): Promise<TeamRequest>;
  
  // Message methods
  getMessages(teamId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set({
      ...insertUser,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Team methods
  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    return await db.select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      leaderId: teams.leaderId,
      maxMembers: teams.maxMembers,
      requiredSkills: teams.requiredSkills,
      category: teams.category,
      eventName: teams.eventName,
      deadline: teams.deadline,
      isActive: teams.isActive,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.status, "approved")));
  }

  async getTeamsByCategory(category: string): Promise<Team[]> {
    return await db.select().from(teams).where(and(eq(teams.category, category), eq(teams.isActive, true)));
  }

  async getRecommendedTeams(userId: string): Promise<Team[]> {
    // For now, return all active teams that the user is not already a member of
    const userTeams = await this.getTeamsByUser(userId);
    const userTeamIds = userTeams.map(team => team.id);
    
    if (userTeamIds.length > 0) {
      return await db.select().from(teams).where(
        and(
          eq(teams.isActive, true),
          not(inArray(teams.id, userTeamIds))
        )
      );
    } else {
      return await db.select().from(teams).where(eq(teams.isActive, true));
    }
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    
    // Add the creator as the team leader
    await this.addTeamMember({
      teamId: team.id,
      userId: team.leaderId,
      status: "approved",
      role: "leader"
    });
    
    return team;
  }

  async updateTeam(id: string, insertTeam: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db.update(teams).set({
      ...insertTeam,
      updatedAt: new Date()
    }).where(eq(teams.id, id)).returning();
    return team;
  }

  // Team member methods
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db.insert(teamMembers).values(member).returning();
    return teamMember;
  }

  async updateTeamMember(teamId: string, userId: string, status: string): Promise<TeamMember> {
    const [teamMember] = await db.update(teamMembers).set({ status })
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .returning();
    return teamMember;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await db.delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }

  // Team request methods
  async getTeamRequests(teamId: string): Promise<TeamRequest[]> {
    return await db.select().from(teamRequests).where(eq(teamRequests.teamId, teamId));
  }

  async getTeamRequestsByUser(userId: string): Promise<TeamRequest[]> {
    return await db.select().from(teamRequests).where(eq(teamRequests.userId, userId));
  }

  async createTeamRequest(request: InsertTeamRequest): Promise<TeamRequest> {
    const [teamRequest] = await db.insert(teamRequests).values(request).returning();
    return teamRequest;
  }

  async updateTeamRequest(id: string, status: string): Promise<TeamRequest> {
    const [teamRequest] = await db.update(teamRequests).set({ status })
      .where(eq(teamRequests.id, id)).returning();
    return teamRequest;
  }

  // Message methods
  async getMessages(teamId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.teamId, teamId))
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getActiveEvents(): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.startDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [evt] = await db.insert(events).values(event).returning();
    return evt;
  }
}

export const storage = new DatabaseStorage();

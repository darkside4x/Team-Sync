import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamCard } from "@/components/team-card";
import { SkillTag } from "@/components/skill-tag";
import { 
  Users, 
  UserPlus, 
  Star, 
  Trophy, 
  Bell, 
  Plus,
  Calendar,
  Settings,
  Search,
  MessageCircle,
  User
} from "lucide-react";
import type { Team, Event } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated
  });

  const { data: myTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    enabled: isAuthenticated
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAuthenticated
  });

  if (!isAuthenticated || !user) {
    return <Link href="/" />;
  }

  if (!user.isProfileComplete) {
    return <Link href="/profile" />;
  }

  const userSkills = Array.isArray(user.skills) ? user.skills : [];
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back! Find your perfect team for upcoming hackathons.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button className="bg-primary text-primary-foreground" data-testid="button-create-team">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground">{myTeams.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary text-xl" />
                  </div>
                </div>
                <p className="text-xs text-accent mt-2">
                  <span className="text-accent">↗</span> Great progress!
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Requests</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="text-accent text-xl" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  No pending requests
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                    <p className="text-2xl font-bold text-foreground">94%</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <Star className="text-chart-3 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-accent mt-2">
                  Excellent compatibility
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hackathons</p>
                    <p className="text-2xl font-bold text-foreground">{events.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Trophy className="text-chart-4 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {upcomingEvents.length} upcoming events
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommended Teams */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recommended Teams</CardTitle>
                      <CardDescription>Based on your skills and interests</CardDescription>
                    </div>
                    <Button variant="ghost" asChild data-testid="link-view-all-teams">
                      <Link href="/teams">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {teamsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded w-16"></div>
                            <div className="h-6 bg-muted rounded w-20"></div>
                            <div className="h-6 bg-muted rounded w-14"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : teams.length > 0 ? (
                    <div className="space-y-4">
                      {teams.slice(0, 3).map((team) => (
                        <TeamCard 
                          key={team.id} 
                          team={team} 
                          showJoinButton={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recommended teams found</p>
                      <Button asChild className="mt-4" data-testid="button-explore-teams">
                        <Link href="/teams">Explore Teams</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString()} • {event.category}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              {/* Your Skills */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Your Skills</CardTitle>
                    <Button variant="ghost" size="sm" asChild data-testid="link-edit-skills">
                      <Link href="/profile">Edit</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userSkills.length > 0 ? (
                    <div className="space-y-3">
                      {userSkills.slice(0, 4).map((skill: any, index: number) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{skill.name}</span>
                            <span className="text-muted-foreground">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                        <Link href="/profile">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Skill
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">No skills added yet</p>
                      <Button size="sm" asChild data-testid="button-add-skills">
                        <Link href="/profile">Add Skills</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="button-find-teammates">
                    <Link href="/teams">
                      <Search className="mr-2 h-4 w-4" />
                      Find Teammates
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="button-create-project">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="button-view-events">
                    <Link href="/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Events
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="button-settings">
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Stay updated with your team interactions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Join a team or create a project to see activity here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

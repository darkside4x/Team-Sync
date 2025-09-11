import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  Clock, 
  Trophy, 
  Plus,
  MessageCircle,
  Settings,
  ExternalLink,
  GitBranch,
  Target
} from "lucide-react";
import type { Team, TeamMember } from "@shared/schema";
import { Link } from "wouter";

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: myTeams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    enabled: isAuthenticated
  });

  const fetchRequests = (teamId: string) => ({
    queryKey: ["/api/teams", teamId, "requests"],
    queryFn: () => apiRequest("GET", `/api/teams/${teamId}/requests`),
    enabled: isAuthenticated
  } as const);

  const updateRequestMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: "approved" | "rejected" }) =>
      apiRequest("PUT", `/api/team-requests/${requestId}`, { status }),
    onSuccess: (_data, variables) => {
      // Invalidate all team requests queries
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      // Refetch all manage dialogs by team id after change
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "/api/teams" && q.queryKey[2] === "requests" });
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my/requests/pending"] });
    }
  });

  const clearAllRequestsMutation = useMutation({
    mutationFn: ({ teamId }: { teamId: string }) => apiRequest("DELETE", `/api/teams/${teamId}/requests`),
    onSuccess: async () => {
      // Refresh all requests and pending count
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "/api/teams" && q.queryKey[2] === "requests" });
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my/requests/pending"] });
    }
  });

  if (!isAuthenticated || !user) {
    return <Link href="/" />;
  }

  if (!user.isProfileComplete) {
    return <Link href="/profile" />;
  }

  const getProjectStatus = (team: Team) => {
    if (!team.deadline) return "ongoing";
    const now = new Date();
    const deadline = new Date(team.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return "completed";
    if (daysLeft <= 7) return "urgent";
    return "ongoing";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-muted text-muted-foreground";
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "ongoing": return "bg-accent text-accent-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "urgent": return "Due Soon";
      case "ongoing": return "In Progress";
      default: return "Unknown";
    }
  };

  const calculateProgress = (team: Team): number => {
    if (!team.deadline) return 25; // Default progress for ongoing projects
    const start = new Date(team.createdAt || Date.now());
    const end = new Date(team.deadline);
    const now = new Date();
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const formatDeadline = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysLeft = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
              <p className="text-muted-foreground">Manage your team projects and collaborations</p>
            </div>
            <Button className="bg-primary text-primary-foreground" data-testid="button-create-project">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground">
                      {myTeams.filter(team => getProjectStatus(team) !== "completed").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GitBranch className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {myTeams.filter(team => getProjectStatus(team) === "completed").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Trophy className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                    <p className="text-2xl font-bold text-foreground">
                      {myTeams.filter(team => getProjectStatus(team) === "urgent").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Clock className="text-chart-4 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Role</p>
                    <p className="text-2xl font-bold text-foreground">
                      {myTeams.filter(team => team.leaderId === user.id).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <Users className="text-chart-3 text-xl" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Leading teams
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                All Projects
                <Badge variant="secondary" className="ml-2">
                  {myTeams.length}
                </Badge>
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myTeams.length > 0 ? (
              <div className="space-y-4">
                {myTeams.map((team) => {
                  const status = getProjectStatus(team);
                  const progress: number = calculateProgress(team);
                  const isLeader = team.leaderId === user.id;
                  const daysLeft = team.deadline ? getDaysLeft(team.deadline) : null;

                  return (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-foreground text-lg">{team.name}</h4>
                              <Badge className={getStatusColor(status)}>
                                {getStatusLabel(status)}
                              </Badge>
                              {isLeader && (
                                <Badge variant="outline" className="text-xs">
                                  Team Leader
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {team.description || "No description provided"}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {/* Mock member count - would be from team members relation */}
                                3/{team.maxMembers} Members
                              </span>
                              
                              {team.category && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  {team.category}
                                </span>
                              )}
                              
                              {team.eventName && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4" />
                                  {team.eventName}
                                </span>
                              )}
                              
                              {team.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Due {formatDeadline(team.deadline)}
                                  {daysLeft !== null && daysLeft > 0 && (
                                    <span className={`ml-1 ${daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                      ({daysLeft} days left)
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild data-testid={`button-chat-${team.id}`}>
                              <Link href="/chat">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Link>
                            </Button>
                            {isLeader && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" data-testid={`button-manage-${team.id}`}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Manage Requests</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-end mb-3">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => clearAllRequestsMutation.mutate({ teamId: team.id })}
                                      disabled={clearAllRequestsMutation.isPending}
                                      data-testid={`button-clear-all-requests-${team.id}`}
                                    >
                                      {clearAllRequestsMutation.isPending ? "Clearing..." : "Clear All"}
                                    </Button>
                                  </div>
                                  <RequestsList teamId={team.id} onAction={(id, status) => updateRequestMutation.mutate({ requestId: id, status })} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Required Skills */}
                          {team.requiredSkills && Array.isArray(team.requiredSkills) && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Required Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {team.requiredSkills.slice(0, 5).map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {team.requiredSkills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{team.requiredSkills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Team Members Preview */}
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Team Members</p>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {/* Mock avatars - would be from actual team members */}
                                {[1, 2, 3].map((i) => (
                                  <Avatar key={i} className="h-8 w-8 border-2 border-card">
                                    <AvatarFallback className="text-xs">M{i}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground ml-2">
                                and {Math.max(0, (team.maxMembers || 4) - 3)} others
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first project or join an existing team to get started
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button data-testid="button-create-first-project">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                    <Button variant="outline" asChild data-testid="button-join-existing-team">
                      <Link href="/teams">
                        <Users className="mr-2 h-4 w-4" />
                        Join Team
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RequestsList({ teamId, onAction }: { teamId: string; onAction: (requestId: string, status: "approved" | "rejected") => void }) {
  const { data: requests = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/teams", teamId, "requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}/requests`);
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="space-y-2 text-sm text-muted-foreground">Loading requests...</div>;
  }
  if (!requests.length) {
    return <div className="text-sm text-muted-foreground">No pending requests</div>;
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div key={req.id} className="flex items-center justify-between border rounded-md p-3">
          <div>
            <div className="font-medium text-foreground">{req.user?.name || req.userId}</div>
            {req.message && <div className="text-sm text-muted-foreground">{req.message}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { onAction(req.id, "rejected"); setTimeout(() => refetch(), 100); }}>Deny</Button>
            <Button size="sm" onClick={() => { onAction(req.id, "approved"); setTimeout(() => refetch(), 100); }}>Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

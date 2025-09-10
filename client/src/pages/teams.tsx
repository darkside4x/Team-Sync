import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { TeamCard } from "@/components/team-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Filter, Users, Plus } from "lucide-react";
import type { Team } from "@shared/schema";
import { Link } from "wouter";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "hackathon", label: "Hackathons" },
  { value: "competition", label: "Competitions" },
  { value: "research", label: "Research Projects" },
  { value: "symposium", label: "Symposiums" }
];

export default function Teams() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams", selectedCategory === "all" ? undefined : selectedCategory],
    enabled: isAuthenticated
  });

  const joinTeamMutation = useMutation({
    mutationFn: ({ teamId, message }: { teamId: string; message: string }) =>
      apiRequest("POST", `/api/teams/${teamId}/join`, { message }),
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your request to join the team has been sent to the team leader."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (!isAuthenticated || !user) {
    return <Link href="/" />;
  }

  if (!user.isProfileComplete) {
    return <Link href="/profile" />;
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinTeam = (teamId: string) => {
    joinTeamMutation.mutate({
      teamId,
      message: "Hi! I'm interested in joining your team. I believe my skills would be a great fit for your project."
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Find Teams</h2>
              <p className="text-muted-foreground">Discover teams that match your skills and interests</p>
            </div>
            <Button className="bg-primary text-primary-foreground" data-testid="button-create-team">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-teams"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Teams Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Available Teams
                <Badge variant="secondary" className="ml-2">
                  {filteredTeams.length}
                </Badge>
              </h3>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-6 bg-muted rounded w-16"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onJoin={handleJoinTeam}
                    showJoinButton={team.leaderId !== user.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Be the first to create a team for your next project!"
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {(searchTerm || selectedCategory !== "all") && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                        }}
                        data-testid="button-clear-filters"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button data-testid="button-create-first-team">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Team
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

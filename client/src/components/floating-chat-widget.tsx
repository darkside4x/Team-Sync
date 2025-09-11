import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Team } from "@shared/schema";
import { Link } from "wouter";

export function FloatingChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: myTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    enabled: isAuthenticated
  });

  if (!isAuthenticated || !user || !user.isProfileComplete) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          data-testid="button-floating-chat"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              {myTeams.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {myTeams.length}
                </span>
              )}
            </div>
          )}
        </Button>
      </div>

      {/* Quick Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80">
          <Card className="shadow-2xl border-2 border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Quick Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myTeams.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Jump to team conversations:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {myTeams.slice(0, 5).map((team) => (
                      <Button
                        key={team.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        asChild
                        data-testid={`button-quick-chat-${team.id}`}
                      >
                        <Link href="/chat" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{team.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {team.category}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                  {myTeams.length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                      data-testid="button-view-all-chats"
                    >
                      <Link href="/chat" onClick={() => setIsOpen(false)}>
                        View All Chats ({myTeams.length})
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No team chats yet
                  </p>
                  <Button size="sm" asChild data-testid="button-join-team-from-chat">
                    <Link href="/teams" onClick={() => setIsOpen(false)}>
                      <Users className="h-4 w-4 mr-2" />
                      Join a Team
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

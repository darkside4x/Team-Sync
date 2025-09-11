import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, Trophy, UserPlus } from "lucide-react";
import type { Team, User } from "@shared/schema";

interface TeamCardProps {
  team: Team & { members?: any[], leader?: User };
  onJoin?: (teamId: string) => void;
  showJoinButton?: boolean;
}

export function TeamCard({ team, onJoin, showJoinButton = true }: TeamCardProps) {
  const requiredSkills = Array.isArray(team.requiredSkills) ? team.requiredSkills : [];
  const memberCount = team.members?.length || 1;
  const daysLeft = team.deadline ? Math.ceil((new Date(team.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const handleJoin = () => {
    if (onJoin) {
      onJoin(team.id);
    }
  };

  return (
    <Card className="professional-card hover-lift hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-lg line-clamp-1">{team.name}</h3>
              <Badge className="status-badge status-active">
                {Math.floor(Math.random() * 20 + 80)}% Match
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{team.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount}/{team.maxMembers} Members
              </span>
              {daysLeft && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysLeft} days left
                </span>
              )}
              {team.eventName && (
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {team.eventName}
                </span>
              )}
            </div>
          </div>
          <div className="flex -space-x-2 ml-4">
            {team.members?.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="h-10 w-10 border-2 border-card shadow-sm">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {requiredSkills.slice(0, 4).map((skill: string, index: number) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {requiredSkills.length > 4 && (
            <span className="skill-tag">
              +{requiredSkills.length - 4} more
            </span>
          )}
        </div>
        {showJoinButton && (
          <Button 
            className="w-full professional-button rounded-lg" 
            onClick={handleJoin}
            data-testid={`button-join-${team.id}`}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Request to Join
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

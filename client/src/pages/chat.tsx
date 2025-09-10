import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, MessageCircle } from "lucide-react";
import type { Team, Message } from "@shared/schema";
import { Link } from "wouter";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, messages: wsMessages, sendMessage, setMessages } = useWebSocket();
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: myTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    enabled: isAuthenticated
  });

  const { data: teamMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/teams", selectedTeam?.id, "messages"],
    enabled: !!selectedTeam?.id
  });

  useEffect(() => {
    if (teamMessages.length > 0) {
      setMessages(teamMessages);
    }
  }, [teamMessages, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [wsMessages]);

  if (!isAuthenticated || !user) {
    return <Link href="/" />;
  }

  if (!user.isProfileComplete) {
    return <Link href="/profile" />;
  }

  const handleSendMessage = () => {
    if (!selectedTeam || !newMessage.trim()) return;
    
    sendMessage(selectedTeam.id, user.id, newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredMessages = wsMessages.filter(msg => msg.teamId === selectedTeam?.id);

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 flex">
        {/* Team List */}
        <div className="w-80 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Team Chats
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a team to start messaging
            </p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-2 space-y-1">
              {myTeams.length > 0 ? (
                myTeams.map((team) => (
                  <Button
                    key={team.id}
                    variant={selectedTeam?.id === team.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedTeam(team)}
                    data-testid={`button-select-team-${team.id}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm truncate">{team.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {team.category} • {team.eventName}
                        </p>
                      </div>
                      {/* Unread indicator could go here */}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No teams joined yet</p>
                  <Button size="sm" asChild data-testid="button-join-team">
                    <Link href="/teams">Join a Team</Link>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedTeam ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedTeam.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTeam.category} • {selectedTeam.eventName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex gap-3 ${
                          message.userId === user.id ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {message.userId === user.id ? "You" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.userId === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : "Now"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start the conversation with your team!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                    data-testid="input-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reconnecting to chat...
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a team to start chatting</h3>
                <p className="text-muted-foreground">
                  Choose a team from the sidebar to view and send messages
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

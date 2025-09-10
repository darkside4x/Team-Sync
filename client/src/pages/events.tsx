import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Trophy, Search, Filter, ExternalLink } from "lucide-react";
import type { Event } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";

const EVENT_CATEGORIES = [
  { value: "all", label: "All Events" },
  { value: "hackathon", label: "Hackathons" },
  { value: "competition", label: "Competitions" },
  { value: "research", label: "Research Events" },
  { value: "symposium", label: "Symposiums" }
];

export default function Events() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAuthenticated
  });

  if (!isAuthenticated || !user) {
    return <Link href="/" />;
  }

  if (!user.isProfileComplete) {
    return <Link href="/profile" />;
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.startDate) > new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.startDate) <= new Date());

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysUntil = (dateString: string | Date) => {
    const targetDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const days = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hackathon': return 'bg-primary/10 text-primary';
      case 'competition': return 'bg-accent/10 text-accent';
      case 'research': return 'bg-chart-3/10 text-chart-3';
      case 'symposium': return 'bg-chart-4/10 text-chart-4';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Events & Competitions</h2>
              <p className="text-muted-foreground">Discover hackathons, competitions, and academic events</p>
            </div>
            <Button className="bg-primary text-primary-foreground" data-testid="button-create-event">
              <Calendar className="mr-2 h-4 w-4" />
              Create Event
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
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-events"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="select-event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Upcoming Events */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Upcoming Events
                <Badge variant="secondary" className="ml-2">
                  {upcomingEvents.length}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => {
                  const daysUntil = getDaysUntil(event.startDate);
                  const isRegistrationOpen = event.registrationDeadline ? 
                    new Date(event.registrationDeadline) > new Date() : true;

                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground text-lg line-clamp-1">{event.name}</h4>
                              <Badge className={getCategoryColor(event.category || '')}>
                                {event.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {event.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Starts at {formatTime(event.startDate)}</span>
                          </div>

                          {event.organizer && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>by {event.organizer}</span>
                            </div>
                          )}

                          {event.registrationDeadline && (
                            <div className="flex items-center gap-2 text-sm">
                              <Trophy className="h-4 w-4" />
                              <span className={isRegistrationOpen ? "text-accent" : "text-destructive"}>
                                Registration {isRegistrationOpen ? 
                                  `until ${formatDate(event.registrationDeadline)}` : 
                                  "closed"
                                }
                              </span>
                            </div>
                          )}

                          {daysUntil > 0 && (
                            <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"} className="w-fit">
                              {daysUntil === 1 ? "Tomorrow" : `${daysUntil} days to go`}
                            </Badge>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              disabled={!isRegistrationOpen}
                              data-testid={`button-register-${event.id}`}
                            >
                              {isRegistrationOpen ? "Register Now" : "Registration Closed"}
                            </Button>
                            {event.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={event.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
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
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming events found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Check back later for new events and competitions!"
                    }
                  </p>
                  {(searchTerm || selectedCategory !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      data-testid="button-clear-event-filters"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Past Events
                  <Badge variant="outline" className="ml-2">
                    {pastEvents.length}
                  </Badge>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.slice(0, 6).map((event) => (
                  <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground text-lg line-clamp-1">{event.name}</h4>
                        <Badge variant="outline" className={getCategoryColor(event.category || '')}>
                          {event.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description || "No description available"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      {event.organizer && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{event.organizer}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className="mt-3">
                        Completed
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

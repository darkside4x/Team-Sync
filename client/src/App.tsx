import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";

// Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Teams from "@/pages/teams";
import Chat from "@/pages/chat";
import Projects from "@/pages/projects";
import Events from "@/pages/events";
import PublicProfile from "@/pages/public-profile.tsx";
import NotFound from "@/pages/not-found";
import InstitutionDashboard from "@/pages/institution-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/teams" component={Teams} />
      <Route path="/projects" component={Projects} />
      <Route path="/events" component={Events} />
      <Route path="/institution" component={InstitutionDashboard} />
      <Route path="/users/:handle" component={PublicProfile} />
      <Route path="/chat" component={Chat} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

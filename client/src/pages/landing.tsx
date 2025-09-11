import TeamSyncLogo from "../assets/teamsync-logo.png";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Zap, Shield, Star, Github, Linkedin } from "lucide-react";
import { GOOGLE_AUTH_URL } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  if (isAuthenticated && user) {
    if (!user.isProfileComplete) {
      return <Link href="/profile" />;
    } else {
      return <Link href="/dashboard" />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Built for Digital Dawn Hackathon 🏆 Code2Create ASM VIT Vellore
              </Badge>
            </div>
            
            <h1 
              className={`text-4xl md:text-6xl font-bold text-foreground mb-6 transition-all duration-1000 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              Find Your Perfect
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}Team Mate
              </span>
            </h1>
            
            <p 
              className={`text-xl text-muted-foreground mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              TeamSync is a specialized team formation platform designed to revolutionize 
              how students at Indian technical universities collaborate for hackathons, competitions, and academic projects.
            </p>
            
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-400 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                <a href={GOOGLE_AUTH_URL} data-testid="button-get-started">
                  <Users className="mr-2 h-5 w-5" />
                  Get Started with Google
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                🎓 Only for University Students (no gmail.com accounts)
              </p>
            </div>
          </div>

          {/* Institutional Login */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Institutional Login</CardTitle>
                <CardDescription>Institutions can log in to create events and view students by domain.</CardDescription>
              </CardHeader>
              <CardContent>
                <InstitutionLoginForm />
              </CardContent>
            </Card>
          </div>

          {/* Floating Team Cards Animation */}
          <div className="mt-16 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  name: "AI-Powered EdTech Team", 
                  match: "95%", 
                  skills: ["React", "Python", "ML", "UI/UX"],
                  event: "Smart India Hackathon"
                },
                { 
                  name: "Blockchain Fintech Innovators", 
                  match: "87%", 
                  skills: ["Solidity", "Node.js", "Crypto", "Backend"],
                  event: "NASSCOM Hackathon"
                },
                { 
                  name: "Green Energy IoT Solutions", 
                  match: "79%", 
                  skills: ["Arduino", "C++", "IoT", "Data Analysis"],
                  event: "Climate Change Hackathon"
                }
              ].map((team, index) => (
                <Card 
                  key={team.name}
                  className={`hover:shadow-lg transition-all duration-500 delay-${600 + index * 200} ${
                    isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge className="bg-accent text-accent-foreground">{team.match} Match</Badge>
                    </div>
                    <CardDescription className="text-sm">{team.event}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {team.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose TeamSync?
            </h2>
            <p className="text-xl text-muted-foreground">
              Built specifically for Indian technical universities with institutional security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Institutional Security",
                description: "Google Workspace authentication ensures only verified university students can join"
              },
              {
                icon: Zap,
                title: "Smart Matching",
                description: "AI-driven algorithm matches you with teammates based on complementary skills and interests"
              },
              {
                icon: Trophy,
                title: "Competition Focus",
                description: "Specialized for hackathons, coding competitions, and academic project collaboration"
              },
              {
                icon: Users,
                title: "Team Formation",
                description: "Easy team creation, member approval system, and real-time collaboration tools"
              },
              {
                icon: Star,
                title: "Skill Profiles",
                description: "Comprehensive profiles with technical skills, project portfolios, and achievements"
              },
              {
                icon: Users,
                title: "Real-time Chat",
                description: "Built-in team communication with project management and file sharing"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Find Your Dream Team?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students from VIT, NIT, and other premier institutions
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
            <a href={GOOGLE_AUTH_URL} data-testid="button-join-now">
              Join TeamSync Now
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src={TeamSyncLogo} alt="TeamSync Logo" className="w-6 h-6 object-contain" />
              <h3 className="text-lg font-bold text-foreground">TeamSync</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Made with ❤️ by <strong>Team N00B</strong> for Digital Dawn Hackathon
            </p>
            <p className="text-sm text-muted-foreground">
              Code2Create ASM VIT Vellore Chapter • Empowering Student Collaboration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InstitutionLoginForm() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("admin@vit.ac.in");
  const [password, setPassword] = useState("vit");
  const [domain, setDomain] = useState("vitstudent.ac.in");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/institution/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, domain })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      setMessage("Logged in successfully as institution.");
      navigate("/institution");
    } catch (err: any) {
      setMessage(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="inst-email">Email</Label>
          <Input id="inst-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vit.ac.in" />
        </div>
        <div>
          <Label htmlFor="inst-password">Password</Label>
          <Input id="inst-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
        </div>
        <div>
          <Label htmlFor="inst-domain">Domain</Label>
          <Input id="inst-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="vitstudent.ac.in" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading} data-testid="button-institution-login">
          {loading ? "Logging in..." : "Institution Login"}
        </Button>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    </form>
  );
}

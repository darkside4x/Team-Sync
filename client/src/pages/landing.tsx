import TeamSyncLogo from "../assets/teamsync-logo.png";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Zap, Shield, Star, Github, Linkedin, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { GOOGLE_AUTH_URL } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.isProfileComplete) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen subtle-animated-bg overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden section-padding">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Badge variant="secondary" className="px-6 py-3 text-sm font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Built for Digital Dawn Hackathon • Code2Create ASM VIT Vellore
              </Badge>
            </div>
            
            <h1 
              className={`brand-title text-5xl md:text-7xl font-bold text-foreground mb-8 transition-all duration-1000 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Team Mate
              </span>
            </h1>
            
            <p 
              className={`text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              TeamSync is a specialized team formation platform designed to revolutionize 
              how students at Indian technical universities collaborate for hackathons, competitions, and academic projects.
            </p>
            
            <div 
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-400 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <Button size="lg" asChild className="professional-button text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl group">
                <a href={GOOGLE_AUTH_URL} data-testid="button-get-started">
                  <Users className="mr-3 h-5 w-5" />
                  Get Started with Google
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                Only for University Students (no gmail.com accounts)
              </div>
              </p>
            </div>
          </div>

          {/* Institutional Login */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="brand-title">Institutional Login</CardTitle>
                <CardDescription>Institutions can log in to create events and view students by domain.</CardDescription>
              </CardHeader>
              <CardContent>
                <InstitutionLoginForm />
              </CardContent>
            </Card>
          </div>

          {/* Floating Team Cards Animation */}
          <div className="mt-20 relative">
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
                  className={`professional-card hover-lift delay-${600 + index * 200} ${
                    isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                      <Badge className="status-badge status-active">{team.match} Match</Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">{team.event}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {team.skills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
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
      <section className="section-padding bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose TeamSync?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Built specifically for Indian technical universities with institutional security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                <Card key={feature.title} className="professional-card text-center hover-lift group">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base leading-relaxed">
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
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center container-padding">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Find Your Dream Team?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Join thousands of students from VIT, NIT, and other premier institutions
          </p>
          <Button size="lg" asChild className="professional-button text-lg px-12 py-5 rounded-xl shadow-lg hover:shadow-xl group">
            <a href={GOOGLE_AUTH_URL} data-testid="button-join-now">
              Join TeamSync Now
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border py-16">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src={TeamSyncLogo} alt="TeamSync Logo" className="w-10 h-10 object-contain" />
              <h3 className="brand-title text-xl font-bold text-foreground">TeamSync</h3>
            </div>
            <p className="text-muted-foreground mb-8 text-lg">
              Made with ❤️ by <strong>Team N00B</strong> for Digital Dawn Hackathon
            </p>
            <p className="text-muted-foreground">
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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="inst-email" className="text-sm font-medium text-foreground">Email</Label>
          <Input id="inst-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vit.ac.in" className="professional-input mt-2" />
        </div>
        <div>
          <Label htmlFor="inst-password" className="text-sm font-medium text-foreground">Password</Label>
          <Input id="inst-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="professional-input mt-2" />
        </div>
        <div>
          <Label htmlFor="inst-domain" className="text-sm font-medium text-foreground">Domain</Label>
          <Input id="inst-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="vitstudent.ac.in" className="professional-input mt-2" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} data-testid="button-institution-login" className="professional-button">
          {loading ? "Logging in..." : "Institution Login"}
        </Button>
        {message && <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{message}</span>}
      </div>
    </form>
  );
}

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Users, 
  MessageCircle, 
  User, 
  Settings,
  Calendar,
  Trophy
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Find Teams", href: "/teams", icon: Search },
  { name: "My Projects", href: "/projects", icon: Users },
  { name: "Messages", href: "/chat", icon: MessageCircle },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Events", href: "/events", icon: Calendar },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="bg-card/95 backdrop-blur-xl border-r border-border/50 w-72 flex-shrink-0 sidebar-transition shadow-sm">
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Users className="text-primary text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground brand-title">TeamSync</h1>
            <p className="text-sm text-muted-foreground font-medium">{user.university}</p>
          </div>
        </div>

        <nav className="space-y-3">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 rounded-xl font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 pt-8 border-t border-border/50">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={user.avatar || ""} alt={user.name} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

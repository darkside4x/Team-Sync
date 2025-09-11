import { Button } from "@/components/ui/button";
import { GOOGLE_AUTH_URL, logout } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

import TeamSyncLogo from "../assets/teamsync-logo.png";
import { Users, LogOut, User, Settings } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [institution, setInstitution] = useState<{ email: string; domain: string; role: string } | null>(null);
  const [location, navigate] = useLocation();

  // Lazy import to avoid circular deps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _noop = useLocation;

  // Detect institution session
  // We keep it lightweight; no react-query to avoid coupling with user auth
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/institution/me", { credentials: "include" });
        if (res.ok) {
          setInstitution(await res.json());
        } else {
          setInstitution(null);
        }
      } catch {
        setInstitution(null);
      }
    })();
  }, [location]);

  return (
    <nav className="bg-card/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-20">
          <Link href="/">
            <div className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <img src={TeamSyncLogo} alt="TeamSync Logo" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="brand-title text-2xl font-bold text-foreground">TeamSync</h1>
                <p className="text-sm text-muted-foreground font-medium">by Team N00B</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            {institution ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline bg-muted/50 px-3 py-1 rounded-full">{institution.domain}</span>
                <Button variant="outline" className="rounded-lg" onClick={async () => {
                  try {
                    await fetch("/api/auth/institution/logout", { method: "POST", credentials: "include" });
                  } finally {
                    setInstitution(null);
                    navigate("/");
                  }
                }}>
                  Logout Institution
                </Button>
              </div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 w-12 rounded-full p-0 hover:bg-muted/50">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border-border/50">
                  <div className="flex items-center justify-start gap-3 p-4">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center px-4 py-2">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center px-4 py-2">
                      <Users className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="px-4 py-2 text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="professional-button rounded-lg">
                <a href={GOOGLE_AUTH_URL} data-testid="button-login">
                  Sign in with Google
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

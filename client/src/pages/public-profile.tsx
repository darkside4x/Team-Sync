import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export default function PublicProfile() {
  const params = useParams<{ handle: string }>();
  const handle = params?.handle || "";
  const username = handle.replace(/^@/, "");

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/users", username],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!data || (data as any).error || error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Link href="/teams" className="text-primary">Go back</Link>
        </div>
      </div>
    );
  }

  const user = data;
  const skills: any[] = Array.isArray(user.skills) ? user.skills : [];

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback>{(user.name || username).split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name || username}</CardTitle>
            <p className="text-muted-foreground">@{user.username || username}</p>
            {user.university && (
              <p className="text-sm text-muted-foreground mt-1">{user.university}{user.department ? ` • ${user.department}` : ''}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.bio && (
            <div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s: any, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{typeof s === 'string' ? s : s.name || ''}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}



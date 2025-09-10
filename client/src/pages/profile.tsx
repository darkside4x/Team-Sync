import { useAuth } from "@/hooks/use-auth";
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleProfileSubmit = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {user.isProfileComplete ? "Edit Profile" : "Complete Your Profile"}
              </CardTitle>
              <p className="text-muted-foreground">
                {user.isProfileComplete 
                  ? "Update your information and skills to improve team matching"
                  : "Please complete your profile to start finding and joining teams"
                }
              </p>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                onSubmit={handleProfileSubmit}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

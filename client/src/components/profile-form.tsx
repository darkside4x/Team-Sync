import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { checkUsername } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  age: z.number().min(16).max(100),
  gender: z.string().min(1),
  department: z.string().min(1),
  bio: z.string().max(500),
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    portfolio: z.string().url().optional().or(z.literal(""))
  }),
  achievements: z.array(z.string()).optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.number().min(1).max(100)
  })).optional(),
  interests: z.array(z.string()).optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "React", "Node.js", "Java", "C++", "Machine Learning",
  "UI/UX Design", "Data Science", "Blockchain", "Mobile Development", "DevOps",
  "Cybersecurity", "Cloud Computing", "Artificial Intelligence"
];

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics", "Mechanical Engineering",
  "Civil Engineering", "Electrical Engineering", "Biomedical Engineering", "Chemical Engineering"
];

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

export function ProfileForm({ onSubmit, isLoading }: ProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<Array<{ name: string; level: number }>>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState(50);
  const [newInterest, setNewInterest] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skills: [],
      interests: [],
      achievements: [],
      socialLinks: {
        github: "",
        linkedin: "",
        portfolio: ""
      }
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest("POST", "/api/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated successfully!",
        description: "Your profile has been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUsernameBlur = async (username: string) => {
    if (username.length >= 3) {
      setUsernameChecking(true);
      try {
        const isAvailable = await checkUsername(username);
        if (!isAvailable) {
          form.setError("username", { message: "Username is already taken" });
        }
      } catch (error) {
        console.error("Username check error:", error);
      }
      setUsernameChecking(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.some(skill => skill.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { name: newSkill.trim(), level: skillLevel }]);
      setNewSkill("");
      setSkillLevel(50);
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: ProfileFormData) => {
    const formData = {
      ...data,
      skills,
      interests,
      achievements
    };
    updateProfileMutation.mutate(formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              {...form.register("username")}
              onBlur={(e) => handleUsernameBlur(e.target.value)}
              data-testid="input-username"
            />
            {usernameChecking && <p className="text-sm text-muted-foreground">Checking availability...</p>}
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age", { valueAsNumber: true })}
                data-testid="input-age"
              />
              {form.formState.errors.age && (
                <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => form.setValue("gender", value)}>
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select onValueChange={(value) => form.setValue("department", value)}>
              <SelectTrigger data-testid="select-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-sm text-destructive">{form.formState.errors.department.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Tell us about yourself..."
              data-testid="textarea-bio"
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                list="skills-suggestions"
                data-testid="input-new-skill"
              />
              <datalist id="skills-suggestions">
                {SKILL_SUGGESTIONS.map((skill) => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>
            </div>
            <div className="w-20">
              <Input
                type="number"
                min="1"
                max="100"
                value={skillLevel}
                onChange={(e) => setSkillLevel(Number(e.target.value))}
                placeholder="Level"
                data-testid="input-skill-level"
              />
            </div>
            <Button type="button" onClick={addSkill} data-testid="button-add-skill">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill.name} ({skill.level}%)
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeSkill(index)}
                  data-testid={`button-remove-skill-${index}`}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              data-testid="input-new-interest"
            />
            <Button type="button" onClick={addInterest} data-testid="button-add-interest">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} variant="outline" className="flex items-center gap-1">
                {interest}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeInterest(interest)}
                  data-testid={`button-remove-interest-${interest}`}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              {...form.register("socialLinks.github")}
              placeholder="https://github.com/username"
              data-testid="input-github"
            />
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              {...form.register("socialLinks.linkedin")}
              placeholder="https://linkedin.com/in/username"
              data-testid="input-linkedin"
            />
          </div>

          <div>
            <Label htmlFor="portfolio">Portfolio</Label>
            <Input
              id="portfolio"
              {...form.register("socialLinks.portfolio")}
              placeholder="https://yourportfolio.com"
              data-testid="input-portfolio"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an achievement..."
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              data-testid="input-new-achievement"
            />
            <Button type="button" onClick={addAchievement} data-testid="button-add-achievement">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{achievement}</span>
                <X
                  className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() => removeAchievement(index)}
                  data-testid={`button-remove-achievement-${index}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || updateProfileMutation.isPending}
        data-testid="button-save-profile"
      >
        {isLoading || updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

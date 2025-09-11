import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Event } from "@shared/schema";

const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  eventName: z.string().min(1, "Please select an event"),
  maxMembers: z.number().min(2).max(10),
  deadline: z.date().optional(),
  deadlineTime: z.string().optional(),
  requiredSkills: z.array(z.string()).optional()
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

const CATEGORIES = [
  { value: "hackathon", label: "Hackathon" },
  { value: "competition", label: "Competition" },
  { value: "research", label: "Research Project" },
  { value: "symposium", label: "Symposium" }
];

const SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "React", "Node.js", "Java", "C++", "Machine Learning",
  "UI/UX Design", "Data Science", "Blockchain", "Mobile Development", "DevOps",
  "Cybersecurity", "Cloud Computing", "Artificial Intelligence"
];

interface CreateTeamModalProps {
  children: React.ReactNode;
}

export function CreateTeamModal({ children }: CreateTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      maxMembers: 4,
      requiredSkills: []
    }
  });

  const createTeamMutation = useMutation({
    mutationFn: (data: CreateTeamFormData) => {
      const payload = {
        ...data,
        requiredSkills: skills,
        deadline: data.deadline
          ? new Date(
              `${format(data.deadline, "yyyy-MM-dd")}T${data.deadlineTime || "23:59"}:00`
            ).toISOString()
          : undefined
      };
      return apiRequest("POST", "/api/teams", payload);
    },
    onSuccess: () => {
      toast({
        title: "Team created successfully!",
        description: "Your team has been created and you've been added as the leader."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams", "?all=true"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my"] });
      setOpen(false);
      form.reset();
      setSkills([]);
    },
    onError: (error) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const [institution, setInstitution] = useState<{ email: string; domain: string; role: string } | null>(null);
  const [domainEvents, setDomainEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ures = await fetch("/api/auth/me", { credentials: "include" });
        const user = await ures.json().catch(() => null);
        const ires = await fetch("/api/auth/institution/me", { credentials: "include" });
        const inst = ires.ok ? await ires.json() : null;
        setInstitution(inst);
        const domain = inst?.domain || (typeof user?.email === 'string' ? user.email.split('@')[1] : undefined);
        if (domain) {
          const es = await fetch(`/api/events?domain=${encodeURIComponent(domain)}`, { credentials: "include" });
          if (es.ok) {
            const list = await es.json();
            setDomainEvents(list);
          }
          // Fallback: attempt without explicit domain (server will auto-filter for authenticated users)
          if (!Array.isArray(domainEvents) || domainEvents.length === 0) {
            const es2 = await fetch(`/api/events`, { credentials: "include" });
            if (es2.ok) {
              const list2 = await es2.json();
              setDomainEvents(list2);
            }
          }
        }
      } catch {
        setDomainEvents([]);
      }
    })();
  }, []);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = (data: CreateTeamFormData) => {
    createTeamMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a team for your next project, hackathon, or competition. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter team name..."
                data-testid="input-team-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe your project and what you're looking to accomplish..."
                rows={3}
                data-testid="textarea-team-description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger data-testid="select-team-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="10"
                  {...form.register("maxMembers", { valueAsNumber: true })}
                  data-testid="input-max-members"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="eventName">Event/Competition</Label>
              <Select
                value={form.watch("eventName") || undefined}
                onValueChange={(v) => form.setValue("eventName", v, { shouldValidate: true })}
                disabled={domainEvents.length === 0}
              >
                <SelectTrigger data-testid="select-event-name">
                  <SelectValue placeholder={domainEvents.length === 0 ? "No events available" : "Choose event from your institution"} />
                </SelectTrigger>
                <SelectContent>
                  {domainEvents.map((evt) => (
                    <SelectItem key={evt.id} value={evt.name}>
                      {evt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.eventName && (
                <p className="text-sm text-destructive">{form.formState.errors.eventName.message as string}</p>
              )}
            </div>

            <div>
              <Label>Project Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("deadline") && "text-muted-foreground"
                    )}
                    data-testid="button-select-deadline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("deadline") ? (
                      format(form.watch("deadline")!, "PPP")
                    ) : (
                      <span>Pick a deadline</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("deadline")}
                    onSelect={(date) => form.setValue("deadline", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.watch("deadline") && (
                <div className="mt-2">
                  <Label htmlFor="deadlineTime" className="text-xs text-muted-foreground">Time</Label>
                  <Input
                    id="deadlineTime"
                    type="time"
                    step="60"
                    {...form.register("deadlineTime")}
                    data-testid="input-deadline-time"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Required Skills</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a required skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    list="skills-suggestions"
                    data-testid="input-required-skill"
                  />
                  <datalist id="skills-suggestions">
                    {SKILL_SUGGESTIONS.map((skill) => (
                      <option key={skill} value={skill} />
                    ))}
                  </datalist>
                  <Button type="button" onClick={addSkill} data-testid="button-add-required-skill">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                        data-testid={`button-remove-skill-${skill}`}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-create-team"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTeamMutation.isPending}
              data-testid="button-submit-create-team"
            >
              {createTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

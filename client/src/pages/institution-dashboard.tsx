import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function InstitutionDashboard() {
  const [institution, setInstitution] = useState<{ email: string; domain: string; role: string } | null>(null);
  const [students, setStudents] = useState<Array<{ id: string; name: string; department: string | null }>>([]);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    category: "hackathon",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    website: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/institution/me", { credentials: "include" });
        if (res.ok) {
          const inst = await res.json();
          setInstitution(inst);
          const sres = await fetch("/api/institution/students", { credentials: "include" });
          if (sres.ok) setStudents(await sres.json());
        }
      } catch {}
    })();
  }, []);

  const createEvent = async () => {
    if (!newEvent.name || !newEvent.startDate || !newEvent.endDate) {
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...newEvent,
        startDate: newEvent.startDate ? new Date(newEvent.startDate).toISOString() : undefined,
        endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : undefined,
        registrationDeadline: newEvent.registrationDeadline ? new Date(newEvent.registrationDeadline).toISOString() : undefined
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewEvent({ name: "", description: "", category: "hackathon", startDate: "", endDate: "", registrationDeadline: "", website: "" });
        // Optionally fetch students again or show a small confirmation
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Institution Dashboard</h2>
            <p className="text-muted-foreground">Domain: {institution?.domain || "-"}</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>Events will be visible only to students in {institution?.domain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="evt-name">Name</Label>
                <Input id="evt-name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="evt-category">Category</Label>
                <Input id="evt-category" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="evt-start">Start DateTime</Label>
                <Input id="evt-start" type="datetime-local" value={newEvent.startDate} onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="evt-end">End DateTime</Label>
                <Input id="evt-end" type="datetime-local" value={newEvent.endDate} onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="evt-reg">Registration Deadline</Label>
                <Input id="evt-reg" type="datetime-local" value={newEvent.registrationDeadline} onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="evt-website">Website</Label>
                <Input id="evt-website" value={newEvent.website} onChange={(e) => setNewEvent({ ...newEvent, website: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="evt-desc">Description</Label>
                <Input id="evt-desc" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>
            </div>
            <div className="mt-4">
              <Button disabled={creating} onClick={createEvent}>
                <Calendar className="mr-2 h-4 w-4" />
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
            <CardDescription>Students in {institution?.domain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map((s) => (
                <div key={s.id} className="text-sm flex items-center justify-between border rounded px-3 py-2">
                  <span>{s.name}</span>
                  <Badge variant="secondary">{s.department || "N/A"}</Badge>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-sm text-muted-foreground">No students found for this domain.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



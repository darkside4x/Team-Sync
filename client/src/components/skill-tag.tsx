import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  skill: string;
  level?: number;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
}

export function SkillTag({ skill, level, variant = "default", className }: SkillTagProps) {
  const getSkillColor = (skillName: string) => {
    const colors = [
      "bg-primary/10 text-primary",
      "bg-accent/10 text-accent",
      "bg-chart-3/10 text-chart-3", 
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5"
    ];
    
    const hash = skillName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Badge 
      variant={variant}
      className={cn(
        "text-xs",
        variant === "default" && getSkillColor(skill),
        className
      )}
    >
      {skill}
      {level && (
        <span className="ml-1 text-xs opacity-75">
          {level}%
        </span>
      )}
    </Badge>
  );
}

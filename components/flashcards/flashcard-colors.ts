export const subjectColors: Record<string, { bg: string; border: string; text: string; dot: string; gradient: string; glow: string }> = {
  Biochemistry: { 
    bg: "bg-violet/8", 
    border: "border-violet/20", 
    text: "text-violet", 
    dot: "bg-violet",
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    glow: "shadow-violet-500/20"
  },
  Anatomy: { 
    bg: "bg-cyan/8", 
    border: "border-cyan/20", 
    text: "text-cyan", 
    dot: "bg-cyan",
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    glow: "shadow-cyan-500/20"
  },
  Physiology: { 
    bg: "bg-emerald/8", 
    border: "border-emerald/20", 
    text: "text-emerald", 
    dot: "bg-emerald",
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    glow: "shadow-emerald-500/20"
  },
};

export function getSubjectColor(subjectName: string | null) {
  if (!subjectName) return { 
    bg: "bg-border/10", 
    border: "border-border/20", 
    text: "text-text-muted", 
    dot: "bg-text-muted",
    gradient: "from-text-muted/5 via-text-muted/2 to-transparent",
    glow: "shadow-text-muted/10"
  };
  return subjectColors[subjectName] ?? { 
    bg: "bg-border/10", 
    border: "border-border/20", 
    text: "text-text-muted", 
    dot: "bg-text-muted",
    gradient: "from-text-muted/5 via-text-muted/2 to-transparent",
    glow: "shadow-text-muted/10"
  };
}
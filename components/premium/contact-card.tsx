import { format } from "date-fns";
import { Building2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProfessionalContact } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

function strengthLabel(value: number | null) {
  if (value == null) return "New";
  if (value >= 8) return "Strong";
  if (value >= 5) return "Active";
  if (value >= 3) return "Warm";
  return "Cold";
}

function strengthTone(value: number | null) {
  if (value == null) return "text-muted-2";
  if (value >= 8) return "text-emerald";
  if (value >= 5) return "text-cyan";
  if (value >= 3) return "text-gold";
  return "text-muted-2";
}

export function ContactCard({ contact }: { contact: ProfessionalContact }) {
  const strength = strengthLabel(contact.relationshipStrength);
  const tone = strengthTone(contact.relationshipStrength);

  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">{contact.name}</h4>
          {contact.role ? <p className="mt-0.5 truncate text-xs text-muted">{contact.role}</p> : null}
          {contact.institution ? (
            <div className="mt-1 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-muted-2" />
              <p className="truncate text-[11px] text-muted-2">{contact.institution}</p>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("h-3 w-3", i < ((contact.relationshipStrength ?? 0) + 1) / 2 ? "text-gold" : "text-white/10")}
              fill={i < ((contact.relationshipStrength ?? 0) + 1) / 2 ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-2">
        <span className={cn("font-medium", tone)}>{strength}</span>
        {contact.lastContactedAt ? <span>Last: {format(contact.lastContactedAt, "d MMM")}</span> : null}
        {contact.nextFollowUpAt ? <span>Follow-up: {format(contact.nextFollowUpAt, "d MMM")}</span> : null}
      </div>

      {contact.notes ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-2">{contact.notes}</p> : null}
    </div>
  );
}

export function FollowUpItem({ contact }: { contact: ProfessionalContact }) {
  const isOverdue = contact.nextFollowUpAt ? contact.nextFollowUpAt < new Date() : false;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3 transition hover:bg-white/[0.04]", isOverdue ? "border-danger/20 bg-danger/[0.03]" : "border-white/10 bg-white/[0.02]")}>
      <div className={cn("h-2 w-2 shrink-0 rounded-full", isOverdue ? "bg-danger" : "bg-cyan")} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{contact.name}</p>
        {contact.role ? <p className="truncate text-xs text-muted">{contact.role}</p> : null}
      </div>
      {contact.nextFollowUpAt ? (
        <Badge variant={isOverdue ? "danger" : "muted"} className="shrink-0 text-[10px]">
          {isOverdue ? "Overdue" : format(contact.nextFollowUpAt, "d MMM")}
        </Badge>
      ) : null}
    </div>
  );
}

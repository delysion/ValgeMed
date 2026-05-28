"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Building2, Edit3, Eye, Star } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordDrawer } from "@/components/ui/record-drawer";
import { deleteProfessionalContactAction } from "@/lib/actions/resources";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { ProfessionalContact } from "@/lib/db/schema";
import type { TranslationKey } from "@/lib/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

function strengthLabel(value: number | null, t: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  if (value == null) return t("contactCard.strengthNew");
  if (value >= 8) return t("contactCard.strengthStrong");
  if (value >= 5) return t("contactCard.strengthActive");
  if (value >= 3) return t("contactCard.strengthWarm");
  return t("contactCard.strengthCold");
}

function strengthTone(value: number | null) {
  if (value == null) return "text-muted-2";
  if (value >= 8) return "text-emerald";
  if (value >= 5) return "text-cyan";
  if (value >= 3) return "text-gold";
  return "text-muted-2";
}

export function ContactCard({ contact }: { contact: ProfessionalContact }) {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const strength = strengthLabel(contact.relationshipStrength, t);
  const tone = strengthTone(contact.relationshipStrength);

  return (
    <>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04]">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <h4 className="truncate text-sm font-semibold text-white">{contact.name}</h4>
            {contact.role ? <p className="mt-0.5 truncate text-xs text-muted">{contact.role}</p> : null}
            {contact.institution ? (
              <div className="mt-1 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-2" />
                <p className="truncate text-[11px] text-muted-2">{contact.institution}</p>
              </div>
            ) : null}
          </button>
          <div className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("h-3 w-3", i < ((contact.relationshipStrength ?? 0) + 1) / 2 ? "text-gold" : "text-white/[0.08]")}
                fill={i < ((contact.relationshipStrength ?? 0) + 1) / 2 ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-2">
          <span className={cn("font-medium", tone)}>{strength}</span>
          {contact.lastContactedAt ? <span>{t("contactCard.lastContact", { date: format(contact.lastContactedAt, "d MMM") })}</span> : null}
          {contact.nextFollowUpAt ? <span>{t("contactCard.followUp", { date: format(contact.nextFollowUpAt, "d MMM") })}</span> : null}
        </div>

        {contact.notes ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-2">{contact.notes}</p> : null}

        <div className="mt-3 flex justify-end gap-1 border-t border-white/[0.06] pt-3">
          <Button type="button" variant="ghost" size="icon" aria-label={t("common.open")} onClick={() => setDetailsOpen(true)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={t("common.edit")}>
            <a href={`/network?edit=${contact.id}`}>
              <Edit3 className="h-4 w-4" />
            </a>
          </Button>
          <DeleteButton action={deleteProfessionalContactAction} id={contact.id} label={t("common.delete")} returnTo="/network" />
        </div>
      </div>
      <RecordDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        record={contact}
        type="contact"
        editBasePath="/network"
      />
    </>
  );
}

export function FollowUpItem({ contact }: { contact: ProfessionalContact }) {
  const { t } = useTranslation();
  const isOverdue = contact.nextFollowUpAt ? contact.nextFollowUpAt < new Date() : false;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3 transition hover:bg-white/[0.03]", isOverdue ? "border-danger/15 bg-danger/[0.03]" : "border-white/[0.06] bg-white/[0.02]")}>
      <div className={cn("h-2 w-2 shrink-0 rounded-full", isOverdue ? "bg-danger" : "bg-cyan")} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{contact.name}</p>
        {contact.role ? <p className="truncate text-xs text-muted">{contact.role}</p> : null}
      </div>
      {contact.nextFollowUpAt ? (
        <Badge variant={isOverdue ? "danger" : "muted"} className="shrink-0 text-[10px]">
          {isOverdue ? t("contactCard.overdue") : format(contact.nextFollowUpAt, "d MMM")}
        </Badge>
      ) : null}
    </div>
  );
}

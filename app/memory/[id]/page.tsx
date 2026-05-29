import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getIdentityNotes } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";
import { ArrowLeft, Calendar, Clock, Hash, Edit3, BookOpen, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireApprovedUser();
  const { id } = await params;

  const identityNotes = await getIdentityNotes();
  const note = identityNotes.find((n) => n.id === id);

  if (!note) {
    notFound();
  }

  const relatedNotes = identityNotes
    .filter((n) => n.id !== note.id && n.category === note.category)
    .slice(0, 6);

  const categoryConfig: Record<string, { gradient: string; icon: string; label: string }> = {
    professional_identity: { gradient: "from-cyan/20 via-cyan/10 to-transparent", icon: "text-cyan", label: "Professional Identity" },
    academic_identity: { gradient: "from-ice/20 via-ice/10 to-transparent", icon: "text-ice", label: "Academic Identity" },
    personal_values: { gradient: "from-emerald/20 via-emerald/10 to-transparent", icon: "text-emerald", label: "Personal Values" },
    career_aspiration: { gradient: "from-amber/20 via-amber/10 to-transparent", icon: "text-amber", label: "Career Aspiration" },
    strengths: { gradient: "from-rose/20 via-rose/10 to-transparent", icon: "text-rose", label: "Strengths" },
  };

  const config = categoryConfig[note.category] || { gradient: "from-muted/20 via-muted/10 to-transparent", icon: "text-muted", label: humanize(note.category) };

  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 opacity-60 hover:opacity-100 transition-opacity">
            <Link href="/memory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Memory
            </Link>
          </Button>

          <div className="mb-6">
            <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-gradient-to-r ${config.gradient} border border-border/50 mb-4`}>
              <span className={`${config.icon} mr-2`}>
                <Sparkles className="h-4 w-4" />
              </span>
              {config.label}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{note.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {fmtDate(note.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {readTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" />
                {wordCount} words
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${config.gradient} opacity-30 blur-xl`} />
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
            <CardContent className="p-10">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono">
                  {note.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/memory?edit=${note.id}`}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Note
            </Link>
          </Button>
        </div>

        {relatedNotes.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Related Notes</h2>
              <Badge variant="outline" className="text-xs">
                {humanize(note.category)}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedNotes.map((related) => (
                <Link
                  key={related.id}
                  href={`/memory/${related.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-muted/5 p-5 transition-all duration-300 hover:bg-muted/10 hover:border-border"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-cyan transition-colors">
                        {related.title}
                      </h3>
                      <ArrowLeft className="h-3.5 w-3.5 text-muted rotate-180 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{related.content}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted/60">
                      <Clock className="h-3 w-3" />
                      {fmtDate(related.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted/50">
            <Clock className="h-3.5 w-3.5" />
            Created {fmtDate(note.createdAt)}
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span>• Updated {fmtDate(note.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

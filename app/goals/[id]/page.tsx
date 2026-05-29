import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedUser } from "@/lib/auth/supabase";
import { getGoalPageData } from "@/lib/data/queries";
import { fmtDate, humanize } from "@/lib/labels";
import { Calendar, CheckCircle2, Clock, Flag, ArrowLeft, Target, Zap, TrendingUp, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireApprovedUser();
  const { id } = await params;

  const data = await getGoalPageData();
  const goal = data.goals.find((g) => g.id === id);

  if (!goal) {
    notFound();
  }

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; bg: string }> = {
    active: { color: "text-emerald", icon: Zap, bg: "bg-emerald/10 border-emerald/20" },
    completed: { color: "text-cyan", icon: CheckCircle2, bg: "bg-cyan/10 border-cyan/20" },
    archived: { color: "text-muted", icon: Clock, bg: "bg-muted/10 border-muted/20" },
  };

  const priorityConfig = goal.priority >= 8
    ? { label: "Critical", color: "text-rose", bg: "bg-rose/10 border-rose/20" }
    : goal.priority >= 6
    ? { label: "High", color: "text-amber", bg: "bg-amber/10 border-amber/20" }
    : goal.priority >= 4
    ? { label: "Medium", color: "text-ice", bg: "bg-ice/10 border-ice/20" }
    : { label: "Low", color: "text-muted", bg: "bg-muted/10 border-muted/20" };

  const targetDays = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = targetDays !== null && targetDays < 0;
  const isCompleted = goal.status === "completed";

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <Link href="/goals">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${priorityConfig.bg} ${priorityConfig.color}`}>
                  <Flame className="mr-1.5 h-3 w-3" />
                  {priorityConfig.label}
                </span>
                <Badge className={`${statusConfig[goal.status]?.bg || "bg-muted/10"} ${statusConfig[goal.status]?.color || "text-muted"}`}>
                  {humanize(goal.status)}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{goal.title}</h1>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/goals?editGoal=${goal.id}`}>
              Edit Goal
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">Priority</CardTitle>
              <Flag className="h-4 w-4 text-amber" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{goal.priority}<span className="text-lg text-muted">/10</span></div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber to-amber/60" style={{ width: `${goal.priority * 10}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">Target Date</CardTitle>
              <Calendar className="h-4 w-4 text-cyan" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isOverdue ? "text-rose" : ""}`}>
                {goal.targetDate ? fmtDate(goal.targetDate) : "—"}
              </div>
              {targetDays !== null && (
                <p className={`text-xs mt-1 ${isOverdue ? "text-rose" : "text-muted"}`}>
                  {isOverdue
                    ? `${Math.abs(targetDays)} days overdue`
                    : targetDays === 0
                    ? "Due today"
                    : `${targetDays} days remaining`}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{humanize(goal.status)}</div>
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isCompleted ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"}`}>
                  {isCompleted ? "Achieved" : "In Progress"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ice/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">Type</CardTitle>
              <Target className="h-4 w-4 text-ice" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold capitalize">{humanize(goal.goalType)}</div>
              <p className="text-xs text-muted mt-1">Goal category</p>
            </CardContent>
          </Card>
        </div>

        {goal.description && (
          <Card className="group relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10">
                  <TrendingUp className="h-4 w-4 text-cyan" />
                </div>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted">{goal.description}</p>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
                <Target className="h-4 w-4 text-amber" />
              </div>
              Action Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/5 mb-4">
                <Target className="h-8 w-8 text-muted" />
              </div>
              <p className="text-muted mb-4">Tasks are managed in the Goals tab</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/goals">
                  View All Goals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4" />
            <span>Created {fmtDate(goal.createdAt)}</span>
            {goal.updatedAt && goal.updatedAt !== goal.createdAt && (
              <span className="opacity-60">• Updated {fmtDate(goal.updatedAt)}</span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {humanize(goal.goalType)}
          </Badge>
        </div>
      </div>
    </AppShell>
  );
}

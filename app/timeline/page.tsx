import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { TimelineView } from "@/components/premium/timeline-view";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const session = await requireOwnerSession();
  const data = await getCoreData();

  return (
    <AppShell session={session}>
      <PageHeader title="Timeline" description="Unified view of study, exams, tasks, follow-ups and opportunities." />

      <GlassCard>
        <SectionHeader title="Next 30 Days" description="All operational events in one stream" />
        <div className="mt-5">
          <TimelineView
            exams={data.exams}
            studySessions={data.studySessions}
            reviewItems={data.reviewItems}
            tasks={data.tasks}
            errorLogs={data.errorLogs}
            contacts={data.professionalContacts}
            opportunities={data.opportunities}
            dailyLogs={data.dailyLogs}
            days={30}
          />
        </div>
      </GlassCard>
    </AppShell>
  );
}

import { AppShell, PageHeader } from "@/components/app-shell";
import { GlassCard } from "@/components/premium/glass-card";
import { SectionHeader } from "@/components/premium/section-header";
import { TimelineView } from "@/components/premium/timeline-view";
import { requireUser } from "@/lib/auth/supabase";
import { getCoreData } from "@/lib/data/queries";
import { getI18n } from "@/lib/i18n/server-i18n";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const user = await requireUser();
  const { t } = await getI18n();
  const data = await getCoreData();

  return (
    <AppShell user={user}>
      <PageHeader title={t("timeline.title")} description={t("timeline.subtitle")} />

      <GlassCard>
        <SectionHeader title={t("timeline.next30")} description={t("timeline.allEvents")} />
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

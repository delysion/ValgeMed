import { PageHeader } from "@/components/app-shell";
import { getI18n } from "@/lib/i18n/server-i18n";

export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div>
      <PageHeader
        eyebrow={t("research.title")}
        title={t("research.title")}
        description={t("research.description")}
      />
      {children}
    </div>
  );
}

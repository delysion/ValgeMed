import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/supabase";
import { getI18n } from "@/lib/i18n/server-i18n";
import { ExportButtons } from "@/components/export-buttons";

export const dynamic = "force-dynamic";

export default async function ImportExportPage() {
  const user = await requireUser();
  const { t } = await getI18n();

  return (
    <AppShell user={user}>
      <PageHeader title={t("settings.importExportTitle")} description={t("settings.importExportDesc")} />
      <div className="grid gap-6">
        {/* Quick Export */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.quickExport")}</CardTitle>
            <CardDescription>{t("settings.quickExportDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportButtons />
          </CardContent>
        </Card>

        {/* Legacy Export */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.exportJson")}</CardTitle>
              <CardDescription>{t("settings.exportJsonDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/api/export/json">{t("settings.downloadJson")}</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.exportCsv")}</CardTitle>
              <CardDescription>{t("settings.exportCsvDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href="/api/export/csv">{t("settings.downloadCsv")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

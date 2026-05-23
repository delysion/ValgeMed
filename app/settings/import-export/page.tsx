import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/supabase";
import { ExportButtons } from "@/components/export-buttons";

export const dynamic = "force-dynamic";

export default async function ImportExportPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <PageHeader title="Import / Export" description="Local data export. Import is create-only and remains on the roadmap to avoid accidental overwrites." />
      <div className="grid gap-6">
        {/* Quick Export */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Export</CardTitle>
            <CardDescription>Export all your data as ZIP and save to cloud storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportButtons />
          </CardContent>
        </Card>

        {/* Legacy Export */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export JSON</CardTitle>
              <CardDescription>Full backup including life and elite tables.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/api/export/json">Download JSON</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Export CSV</CardTitle>
              <CardDescription>Tabular format for external review.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href="/api/export/csv">Download CSV</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

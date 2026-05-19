import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ImportExportPage() {
  const session = await requireOwnerSession();

  return (
    <AppShell session={session}>
      <PageHeader title="Import / Export" description="Export locale dei dati. Import create-only resta in roadmap per evitare sovrascritture accidentali." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export JSON</CardTitle>
            <CardDescription>Backup completo, incluse tabelle life/elite.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/api/export/json">Scarica JSON</a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export CSV</CardTitle>
            <CardDescription>Formato tabellare per revisione esterna.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/api/export/csv">Scarica CSV</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

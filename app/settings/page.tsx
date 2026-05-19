import Link from "next/link";
import { Database, Download, Shield } from "lucide-react";

import packageJson from "@/package.json";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getDatabaseStatus } from "@/lib/db";
import { burnoutWeights, efficiencyWeights, eliteIndexWeights, readinessWeights } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireOwnerSession();
  const dbStatus = getDatabaseStatus();

  return (
    <AppShell session={session}>
      <PageHeader title="Settings" description="Stato database, export e note privacy." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
            <CardDescription>Neon Postgres via Drizzle ORM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={dbStatus.configured ? "success" : "danger"}>
              {dbStatus.configured ? "configured" : "missing DATABASE_URL"}
            </Badge>
            <p className="text-sm text-muted">{dbStatus.provider}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </CardTitle>
            <CardDescription>Export locale dei dati principali.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/api/export/json">Export JSON</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/export/csv">Export CSV</a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/settings/import-export">Import/export</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </CardTitle>
            <CardDescription>Niente AI cloud, niente SaaS, niente billing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>Owner: {session.email}</p>
            <p>Versione app: {packageJson.version}</p>
            <p>Cookie sessione httpOnly, secure in produzione, sameSite=lax.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <WeightCard title="Exam readiness weights" weights={readinessWeights} />
        <WeightCard title="Study efficiency weights" weights={efficiencyWeights} />
        <WeightCard title="Burnout weights" weights={burnoutWeights} />
        <WeightCard title="Elite Index weights" weights={eliteIndexWeights} />
      </div>
    </AppShell>
  );
}

function WeightCard({ title, weights }: { title: string; weights: Record<string, number> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Editabili in modo esplicito da codice per mantenere audit semplice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
            <span className="text-muted">{key}</span>
            <span className="font-mono text-white">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const session = await requireOwnerSession();

  return (
    <AppShell session={session}>
      <PageHeader
        title="AI Governance"
        description="Prima versione: AI disattivata. Nessun dato viene inviato a OpenAI, Gemini, Groq, OpenRouter, Ollama o altri servizi."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider mode</CardTitle>
            <CardDescription>AI_PROVIDER=none nella versione MVP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Il documento esteso prevede una futura Command Layer con AI locale o manual packet. Qui non viene implementata per rispettare il vincolo iniziale: niente AI cloud nella prima versione.</p>
            <p>Le decisioni operative attuali vengono da scoring locale, next-best-action deterministico e dati inseriti dalla proprietaria.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manual AI packet</CardTitle>
            <CardDescription>Governance pronta, esecuzione rimandata.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            <p>Quando verra abilitato, export per AI dovra essere esplicito, minimale, revisionabile e senza invio automatico di dati personali. La roadmap e in TODO.md.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

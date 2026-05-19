import { AppShell, PageHeader } from "@/components/app-shell";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { buildEliteIndex } from "@/lib/scoring/engine";

export const dynamic = "force-dynamic";

export default async function EliteIndexPage() {
  const session = await requireOwnerSession();
  const data = await getCoreData();
  const elite = buildEliteIndex(data);

  const scores = [
    { title: "Medical Mastery", result: elite.medicalMastery },
    { title: "Exam Readiness", result: elite.examReadiness },
    { title: "Time Leverage", result: elite.timeLeverage },
    { title: "Error Destruction", result: elite.errorDestruction },
    { title: "Energy Integrity", result: elite.energyIntegrity },
    { title: "Estonia Integration", result: elite.estoniaIntegration },
    { title: "Reputation Capital", result: elite.reputationCapital },
    { title: "Opportunity Capture", result: elite.opportunityCapture },
  ];

  return (
    <AppShell session={session}>
      <PageHeader
        title="Elite Index"
        description="Indice composito locale: utile per orientare la settimana, mai da trattare come verita oggettiva."
      />
      <Card className="mb-4 border-ice/20 bg-ice/5">
        <CardHeader>
          <CardTitle>Elise Elite Index: {elite.eliteIndex.score.toFixed(1)}/10</CardTitle>
          <CardDescription>{elite.eliteIndex.label}. Segnale strategico, non giudizio personale.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreBreakdown result={elite.eliteIndex} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {scores.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.result.score.toFixed(1)}/10</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown result={item.result} compact />
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

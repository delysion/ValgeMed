import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { buildCsvExport } from "@/lib/export/serialize";

export async function GET() {
  await requireOwnerSession();
  const data = await getCoreData();

  return new Response(buildCsvExport(data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tartu-med-os-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}

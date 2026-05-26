import { requireApprovedUser } from "@/lib/auth/supabase";
import { getExportData } from "@/lib/data/queries";
import { buildCsvExport } from "@/lib/export/serialize";

export async function GET() {
  const user = await requireApprovedUser();
  const data = await getExportData(user.id);

  return new Response(buildCsvExport(data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tartu-med-os-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}

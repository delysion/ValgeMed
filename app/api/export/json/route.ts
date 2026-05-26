import { requireApprovedUser } from "@/lib/auth/supabase";
import { getExportData } from "@/lib/data/queries";
import { buildJsonExport } from "@/lib/export/serialize";

export async function GET() {
  const user = await requireApprovedUser();
  const data = await getExportData(user.id);

  return Response.json(buildJsonExport(data), {
    headers: {
      "Content-Disposition": `attachment; filename="tartu-med-os-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}

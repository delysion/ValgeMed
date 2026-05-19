import { requireOwnerSession } from "@/lib/auth/session";
import { getCoreData } from "@/lib/data/queries";
import { buildJsonExport } from "@/lib/export/serialize";

export async function GET() {
  await requireOwnerSession();
  const data = await getCoreData();

  return Response.json(buildJsonExport(data), {
    headers: {
      "Content-Disposition": `attachment; filename="tartu-med-os-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}

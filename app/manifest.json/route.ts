import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const manifest = readFileSync(join(process.cwd(), "public/manifest.json"), "utf-8");
  return new Response(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
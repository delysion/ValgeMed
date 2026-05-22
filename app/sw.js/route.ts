import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const sw = readFileSync(join(process.cwd(), "public/sw.js"), "utf-8");
  return new Response(sw, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=86400",
      "Service-Worker-Allowed": "/",
    },
  });
}
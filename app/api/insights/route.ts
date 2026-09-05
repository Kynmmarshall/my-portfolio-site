import { readInsights } from "@/lib/server/read-models";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(readInsights(), {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
    },
  });
}

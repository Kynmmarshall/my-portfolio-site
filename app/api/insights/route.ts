import { readInsights } from "@/lib/server/insights";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET() {
  const snapshot = await readInsights();
  return Response.json(snapshot, {
    status: snapshot.data ? 200 : 503,
    headers: {
      "Cache-Control": snapshot.data
        ? "public, max-age=60, stale-while-revalidate=60"
        : "no-store",
    },
  });
}

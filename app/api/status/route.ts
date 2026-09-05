import { readStatus } from "@/lib/server/read-models";
export const dynamic = "force-dynamic";
export function GET() { return Response.json(readStatus(), { headers: { "Cache-Control": "public, max-age=30" } }); }
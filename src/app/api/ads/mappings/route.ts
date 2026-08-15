import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { adMappings } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const campaignId = typeof body?.campaignId === "string" ? body.campaignId : null;
  const adSetIds: string[] = Array.isArray(body?.adSetIds) ? body.adSetIds : [];
  const adIds: string[] = Array.isArray(body?.adIds) ? body.adIds : [];
  const segmentIds: string[] = Array.isArray(body?.segmentIds) ? body.segmentIds : [];

  if (!campaignId || adSetIds.length === 0 || adIds.length === 0 || segmentIds.length === 0) {
    return NextResponse.json(
      { error: "A campaign, at least one ad set, at least one ad, and at least one segment are all required." },
      { status: 400 },
    );
  }

  const id = `map_${crypto.randomUUID()}`;
  await db.insert(adMappings).values({ id, campaignId, adSetIds, adIds, segmentIds });

  return NextResponse.json({ id });
}

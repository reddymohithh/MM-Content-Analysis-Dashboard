import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adMappings } from "@/lib/db/schema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  await db.update(adMappings).set({ campaignId, adSetIds, adIds, segmentIds }).where(eq(adMappings.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(adMappings).where(eq(adMappings.id, id));
  return NextResponse.json({ ok: true });
}

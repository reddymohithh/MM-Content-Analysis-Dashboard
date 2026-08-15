import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adMappings } from "@/lib/db/schema";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(adMappings).where(eq(adMappings.id, id));
  return NextResponse.json({ ok: true });
}

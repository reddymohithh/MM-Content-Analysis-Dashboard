import { NextResponse } from "next/server";
import { syncBeehiivData } from "@/lib/beehiiv/sync";

export const maxDuration = 300;

/**
 * Manually-triggered by the navbar "Fetch" button — pulls every confirmed,
 * dual-platform edition from Beehiiv into whatever DATABASE_URL currently
 * points to, so a click always brings the DB fully in sync (not just recent
 * editions). Deliberately separate from content-quality scoring (a
 * different button, a different route): fetching new edition data and
 * analyzing it with an LLM are two distinct actions with two distinct
 * costs, and the user asked for them to stay that way rather than be
 * combined.
 */
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set. Nothing to sync into." },
      { status: 400 },
    );
  }
  if (!process.env.BEEHIIV_API_KEY) {
    return NextResponse.json(
      { error: "BEEHIIV_API_KEY is not set. Can't fetch from Beehiiv." },
      { status: 400 },
    );
  }
  if (!process.env.BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json({ error: "BEEHIIV_PUBLICATION_ID is not set." }, { status: 400 });
  }

  try {
    const result = await syncBeehiivData();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

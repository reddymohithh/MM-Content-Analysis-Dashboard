import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { editions, contentQualityScores } from "@/lib/db/schema";
import { getPost } from "@/lib/beehiiv/client";
import { extractPlainTextFromHtml } from "@/lib/scoring/extract-content";
import { scoreEditionContentQuality } from "@/lib/scoring/score-content-quality";

export const maxDuration = 300;

/**
 * Manually-triggered batch job (the navbar refresh button), not run on a
 * schedule or on every Beehiiv sync — LLM calls cost money per edition, and
 * this pipeline is new enough to want a review step rather than firing
 * automatically. Scores every real (beehiiv_live) edition that doesn't
 * already have a content_quality_scores row; fetches and stores the
 * edition's plain-text content first if it isn't already cached.
 *
 * Requires BEEHIIV_API_KEY (to fetch content) and OPENAI_API_KEY (to score
 * it) to be set wherever this runs — returns a clear 400 instead of running
 * partially if either is missing.
 */
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set. Nothing to score against." },
      { status: 400 },
    );
  }
  if (!process.env.BEEHIIV_API_KEY) {
    return NextResponse.json(
      { error: "BEEHIIV_API_KEY is not set. Can't fetch edition content." },
      { status: 400 },
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Can't run content-quality scoring." },
      { status: 400 },
    );
  }

  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    return NextResponse.json({ error: "BEEHIIV_PUBLICATION_ID is not set." }, { status: 400 });
  }

  const pending = await db.query.editions.findMany({
    where: eq(editions.dataSource, "beehiiv_live"),
    with: { contentQualityScore: true },
  });
  const unscored = pending.filter((e) => !e.contentQualityScore);

  let scored = 0;
  const errors: { editionId: string; message: string }[] = [];

  for (const edition of unscored) {
    try {
      let content = edition.content;

      if (!content) {
        const post = await getPost(publicationId, edition.id, { expand: ["free_web_content"] });
        const html = post.data.content?.free?.web;
        if (!html) {
          throw new Error("Beehiiv returned no free_web_content for this post.");
        }
        content = extractPlainTextFromHtml(html);
        await db.update(editions).set({ content }).where(eq(editions.id, edition.id));
      }

      const result = await scoreEditionContentQuality(edition.subject, content);

      // Everything Section 23 asks for besides the 12 category scores;
      // total/categories get their own columns, and classification is
      // derived from total on read (classifyContentQuality) rather than
      // stored, so it can never drift from the number next to it.
      const analysis = {
        verdict: result.verdict,
        audienceFit: result.audienceFit,
        readerOutcome: result.readerOutcome,
        storyByStory: result.storyByStory,
        whatWorked: result.whatWorked,
        whatDidntWork: result.whatDidntWork,
        biggestMissedOpportunity: result.biggestMissedOpportunity,
        batch1: result.batch1,
        batch2: result.batch2,
        crossBatch: result.crossBatch,
        recommendedImprovements: result.recommendedImprovements,
        nextEditionPlan: result.nextEditionPlan,
        contentOpportunities: result.contentOpportunities,
        strengthsToPreserve: result.strengthsToPreserve,
        criticalFailures: result.criticalFailures,
        finalSummary: result.finalSummary,
      };

      await db
        .insert(contentQualityScores)
        .values({
          editionId: edition.id,
          provider: result.provider,
          model: result.model,
          total: result.total,
          categories: result.categories,
          analysis,
        })
        .onConflictDoUpdate({
          target: contentQualityScores.editionId,
          set: {
            provider: result.provider,
            model: result.model,
            total: result.total,
            categories: result.categories,
            analysis,
            scoredAt: new Date(),
          },
        });

      scored += 1;
    } catch (err) {
      errors.push({
        editionId: edition.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    scored,
    skipped: pending.length - unscored.length,
    errors,
  });
}

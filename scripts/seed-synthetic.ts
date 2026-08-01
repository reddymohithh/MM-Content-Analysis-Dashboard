/**
 * Seeds whatever DATABASE_URL currently points to with the synthetic demo
 * dataset (src/lib/synthetic-data.ts). Intended for the public deployment's
 * Neon branch — real Marketing Monk numbers never run through this script,
 * see BUILD_LOG.md "public vs. real data split".
 *
 * Run: npm run seed:synthetic
 * (reads DATABASE_URL from .env.local — point it at the demo branch first)
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { db } from "../src/lib/db";
import {
  editions,
  pollTallies,
  topLinks,
  promotedLinks,
  comments,
  publicationSnapshots,
} from "../src/lib/db/schema";
import {
  SYNTHETIC_EDITIONS,
  SYNTHETIC_PUBLICATION,
  buildSyntheticTopLinks,
  buildSyntheticPromoted,
  buildSyntheticComments,
} from "../src/lib/synthetic-data";
import { classifyHookType, subjectCharLength, subjectHasEmoji, subjectHasNumber } from "../src/lib/scoring/subject-line";

async function main() {
  console.log("Seeding synthetic demo data...");

  await db.insert(publicationSnapshots).values({
    id: `${SYNTHETIC_PUBLICATION.id}:seed`,
    publicationId: SYNTHETIC_PUBLICATION.id,
    name: SYNTHETIC_PUBLICATION.name,
    activeSubscribers: SYNTHETIC_PUBLICATION.activeSubscribers,
    openRate: SYNTHETIC_PUBLICATION.openRate,
    clickRate: SYNTHETIC_PUBLICATION.clickRate,
    newSubscribers: SYNTHETIC_PUBLICATION.newSubscribers,
    churnedSubscribers: SYNTHETIC_PUBLICATION.churnedSubscribers,
    netSubscribers: SYNTHETIC_PUBLICATION.netSubscribers,
    dataSource: "synthetic_demo",
  });

  for (const [idx, e] of SYNTHETIC_EDITIONS.entries()) {
    await db.insert(editions).values({
      id: e.id,
      publicationId: SYNTHETIC_PUBLICATION.id,
      subject: e.subject,
      preview: e.preview,
      publishedAt: new Date(`${e.date}T17:57:00Z`),
      openRate: e.open,
      ctrRaw: e.ctr,
      ctrVerified: Math.round(e.ctr * 0.45 * 100) / 100,
      unsubRate: e.unsub,
      spamRate: 0,
      avgSentenceLength: null,
      bannedPhraseHits: null,
      hookType: classifyHookType(e.subject),
      hasEmoji: subjectHasEmoji(e.subject),
      hasNumber: subjectHasNumber(e.subject),
      charLength: subjectCharLength(e.subject),
      dataSource: "synthetic_demo",
    });

    if (e.pollTotal > 0) {
      await db.insert(pollTallies).values({
        editionId: e.id,
        total: e.pollTotal,
        lovedIt: e.loved,
        prettyUseful: e.pretty,
        itWasOkay: e.okay,
        notHelpful: e.notHelpful,
        exact: true,
        note: null,
      });
    }

    for (const link of buildSyntheticTopLinks(e, idx)) {
      await db.insert(topLinks).values({ ...link, editionId: e.id });
    }
    for (const promoted of buildSyntheticPromoted(e, idx)) {
      await db.insert(promotedLinks).values({ ...promoted, editionId: e.id });
    }
    for (const comment of buildSyntheticComments(e)) {
      await db.insert(comments).values({ ...comment, editionId: e.id });
    }
  }

  console.log(`Seeded ${SYNTHETIC_EDITIONS.length} synthetic editions.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

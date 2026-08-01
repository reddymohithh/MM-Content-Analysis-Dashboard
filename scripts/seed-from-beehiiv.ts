/**
 * Syncs real Marketing Monk data from Beehiiv into whatever DATABASE_URL
 * currently points to. Intended for a private, local-only Neon branch — see
 * BUILD_LOG.md "public vs. real data split". Never run this against the
 * branch the public Vercel deployment reads from.
 *
 * Requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local.
 *
 * Run: npm run seed:beehiiv
 * (reads env vars from .env.local via Node's --env-file flag, wired up in
 * package.json)
 */
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  editions,
  pollTallies,
  topLinks,
  promotedLinks,
  publicationSnapshots,
} from "../src/lib/db/schema";
import {
  getPublication,
  listPosts,
  listPolls,
  computeEditionPollTally,
  isExcludedFromEditorialCtr,
  type BeehiivPost,
} from "../src/lib/beehiiv/client";
import {
  classifyHookType,
  subjectCharLength,
  subjectHasEmoji,
  subjectHasNumber,
} from "../src/lib/scoring/subject-line";

const TRAILING_DAYS = 30;

function subjectLineOf(post: BeehiivPost): string {
  // PROJECT_SPEC.md: pull the real sent subject line, which can differ from
  // the post title. `subject_line` is not confirmed present on every post
  // response shape — verify against a real payload on first run; falls back
  // to title so the sync never silently drops an edition.
  return post.subject_line ?? post.title;
}

async function main() {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new Error("BEEHIIV_PUBLICATION_ID is not set in .env.local");
  }

  console.log(`Syncing publication ${publicationId} from Beehiiv...`);

  const pub = await getPublication(publicationId);
  const stats = pub.data.stats;
  if (stats) {
    await db.insert(publicationSnapshots).values({
      id: `${publicationId}:${new Date().toISOString()}`,
      publicationId,
      name: pub.data.name,
      activeSubscribers: stats.active_subscriptions,
      openRate: stats.average_open_rate,
      clickRate: stats.average_click_rate,
      // Beehiiv's publication stats endpoint doesn't break out new/churned
      // subscriber counts the way get_publication_stats did over MCP during
      // design (see docs/DATA_FINDINGS.md); leaving these at 0 rather than
      // guessing until a confirmed source is wired in.
      newSubscribers: 0,
      churnedSubscribers: 0,
      netSubscribers: 0,
      dataSource: "beehiiv_live",
    });
  }

  const cutoff = Date.now() - TRAILING_DAYS * 24 * 60 * 60 * 1000;
  const postsRes = await listPosts(publicationId, {
    limit: 50,
    status: "confirmed",
    orderBy: "publish_date",
    direction: "desc",
    expand: ["stats"],
  });
  const recentPosts = postsRes.data.filter(
    (p) => (p.publish_date ?? 0) * 1000 >= cutoff,
  );

  // Find the recurring reader-feedback poll (see docs/DATA_FINDINGS.md: "Did
  // you find this edition helpful", 46 polls exist on the publication).
  const pollsRes = await listPolls(publicationId, { limit: 100 });
  const feedbackPoll =
    pollsRes.data.find((p) => /helpful/i.test(p.question ?? p.name ?? "")) ??
    pollsRes.data[0] ??
    null;
  if (feedbackPoll) {
    console.log(`Using poll "${feedbackPoll.name}" (${feedbackPoll.id}) for per-edition tallies.`);
  } else {
    console.log("No polls found on this publication; skipping poll tallies.");
  }

  for (const post of recentPosts) {
    const subject = subjectLineOf(post);
    const emailStats = post.stats?.email;
    if (!emailStats) {
      console.log(`Skipping ${post.id} (${subject}): no stats returned.`);
      continue;
    }

    // Beehiiv's post-stats `open_rate`/`click_rate` fields are already plain
    // percentages (e.g. 28.93 means 28.93%), confirmed by inspecting a real
    // response during this build — not fractions of 1, despite that being a
    // more common API convention. Do not re-multiply by 100 here.
    const openRate = Math.round(emailStats.open_rate * 100) / 100;
    const ctrRaw = Math.round(emailStats.click_rate * 100) / 100;
    const ctrVerified = emailStats.delivered
      ? Math.round((emailStats.unique_verified_clicks / emailStats.delivered) * 10000) / 100
      : 0;
    const unsubRate = emailStats.delivered
      ? Math.round((emailStats.unsubscribes / emailStats.delivered) * 10000) / 100
      : 0;
    const spamRate = emailStats.delivered
      ? Math.round((emailStats.spam_reports / emailStats.delivered) * 10000) / 100
      : 0;

    await db
      .insert(editions)
      .values({
        id: post.id,
        publicationId,
        subject,
        preview: post.preview_text ?? "",
        publishedAt: new Date((post.publish_date ?? Date.now() / 1000) * 1000),
        openRate,
        ctrRaw,
        ctrVerified,
        unsubRate,
        spamRate,
        avgSentenceLength: null,
        bannedPhraseHits: null,
        hookType: classifyHookType(subject),
        hasEmoji: subjectHasEmoji(subject),
        hasNumber: subjectHasNumber(subject),
        charLength: subjectCharLength(subject),
        dataSource: "beehiiv_live",
      })
      .onConflictDoUpdate({
        target: editions.id,
        set: {
          subject,
          preview: post.preview_text ?? "",
          openRate,
          ctrRaw,
          ctrVerified,
          unsubRate,
          spamRate,
          hookType: classifyHookType(subject),
          hasEmoji: subjectHasEmoji(subject),
          hasNumber: subjectHasNumber(subject),
          charLength: subjectCharLength(subject),
          syncedAt: new Date(),
        },
      });

    // Top links / promoted lines, from the per-URL click breakdown on the
    // post's own stats payload (see lib/beehiiv/client.ts header comment).
    await db.delete(topLinks).where(eq(topLinks.editionId, post.id));
    await db.delete(promotedLinks).where(eq(promotedLinks.editionId, post.id));

    const clickDetails = (post.stats?.clicks ?? [])
      .slice()
      .sort((a, b) => b.total_clicks - a.total_clicks);

    let rank = 1;
    for (const click of clickDetails) {
      const excluded = isExcludedFromEditorialCtr(click.url);
      if (excluded === "magic") {
        await db.insert(promotedLinks).values({
          id: `${post.id}-promoted-${click.url}`.slice(0, 250),
          editionId: post.id,
          sponsor: "Sponsored placement",
          description: click.base_url,
          clicks: click.total_clicks,
          uniqueClicks: click.total_unique_clicks,
        });
        continue;
      }
      if (excluded === "social" || excluded === "audio") continue;
      if (rank > 10) continue;

      await db.insert(topLinks).values({
        id: `${post.id}-link-${rank}`,
        editionId: post.id,
        label: click.base_url,
        url: click.url,
        clicks: click.total_clicks,
        rank,
      });
      rank += 1;
    }

    // Real per-edition poll tally, walking every response page filtered to
    // this post (see lib/beehiiv/client.ts computeEditionPollTally).
    await db.delete(pollTallies).where(eq(pollTallies.editionId, post.id));
    if (feedbackPoll) {
      const tally = await computeEditionPollTally(publicationId, feedbackPoll.id, post.id);
      if (tally.total > 0) {
        await db.insert(pollTallies).values({
          editionId: post.id,
          total: tally.total,
          lovedIt: tally.lovedIt,
          prettyUseful: tally.prettyUseful,
          itWasOkay: tally.itWasOkay,
          notHelpful: tally.notHelpful,
          exact: true,
          note: tally.other > 0 ? `${tally.other} response(s) matched an unrecognized poll choice label.` : null,
        });
      }
    }

    console.log(`Synced ${post.id}: ${subject}`);
  }

  console.log(`Done. Synced ${recentPosts.length} editions from the trailing ${TRAILING_DAYS} days.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

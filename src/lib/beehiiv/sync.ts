/**
 * Core Beehiiv -> Neon sync logic, shared between the CLI script
 * (scripts/seed-from-beehiiv.ts) and the navbar "Fetch" button's API route
 * (src/app/api/beehiiv/refresh/route.ts) — one implementation, two triggers.
 */
import { and, eq, gte, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  editions,
  pollTallies,
  topLinks,
  promotedLinks,
  publicationSnapshots,
} from "@/lib/db/schema";
import {
  getPublication,
  listPosts,
  listPolls,
  computeEditionPollTally,
  isExcludedFromEditorialCtr,
  type BeehiivPost,
} from "./client";
import {
  classifyHookType,
  subjectCharLength,
  subjectHasEmoji,
  subjectHasNumber,
} from "@/lib/scoring/subject-line";

const TRAILING_DAYS = 30;

function subjectLineOf(post: BeehiivPost): string {
  // PROJECT_SPEC.md: pull the real sent subject line, which can differ from
  // the post title. `subject_line` is not confirmed present on every post
  // response shape — verify against a real payload on first run; falls back
  // to title so the sync never silently drops an edition.
  return post.subject_line ?? post.title;
}

export interface BeehiivSyncResult {
  synced: number;
  removed: number;
  skippedForPlatform: number;
  messages: string[];
}

export async function syncBeehiivData(): Promise<BeehiivSyncResult> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new Error("BEEHIIV_PUBLICATION_ID is not set.");
  }

  const messages: string[] = [];
  const log = (msg: string) => {
    messages.push(msg);
    console.log(msg);
  };

  log(`Syncing publication ${publicationId} from Beehiiv...`);

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
  const withinWindow = postsRes.data.filter((p) => (p.publish_date ?? 0) * 1000 >= cutoff);
  // Only editions sent on both email and web count as a real edition here —
  // web-only posts have no email stats (open rate is meaningless for them,
  // as discovered when a web-only post was showing 0%/0% before this
  // filter existed) and email-only posts aren't the newsletter's normal
  // dual-channel format.
  const recentPosts = withinWindow.filter((p) => p.platform === "both");
  const skippedForPlatform = withinWindow.length - recentPosts.length;
  if (skippedForPlatform > 0) {
    log(
      `Skipping ${skippedForPlatform} post(s) in this window that weren't published on both email and web.`,
    );
  }

  // Find the recurring reader-feedback poll (see docs/DATA_FINDINGS.md: "Did
  // you find this edition helpful", 46 polls exist on the publication).
  const pollsRes = await listPolls(publicationId, { limit: 100 });
  const feedbackPoll =
    pollsRes.data.find((p) => /helpful/i.test(p.question ?? p.name ?? "")) ??
    pollsRes.data[0] ??
    null;
  if (feedbackPoll) {
    log(`Using poll "${feedbackPoll.name}" (${feedbackPoll.id}) for per-edition tallies.`);
  } else {
    log("No polls found on this publication; skipping poll tallies.");
  }

  let synced = 0;
  for (const post of recentPosts) {
    const subject = subjectLineOf(post);
    const emailStats = post.stats?.email;
    if (!emailStats) {
      log(`Skipping ${post.id} (${subject}): no stats returned.`);
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
        webUrl: post.web_url ?? null,
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
          webUrl: post.web_url ?? null,
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

    // Top links, from the per-URL click breakdown on the post's own stats
    // payload (see lib/beehiiv/client.ts header comment). Promoted/sponsored
    // ("magic") links are deliberately skipped, not just hidden from the UI:
    // Beehiiv's per-click breakdown for these is a personalized tracking URL
    // per recipient (it embeds the subscriber's email as a query param), so
    // storing it as a "promoted link" row was both persisting subscriber PII
    // for no reason and, once two personalized URLs collided after being
    // truncated to fit the row id, crashing the sync outright.
    await db.delete(topLinks).where(eq(topLinks.editionId, post.id));
    await db.delete(promotedLinks).where(eq(promotedLinks.editionId, post.id));

    const clickDetails = (post.stats?.clicks ?? [])
      .slice()
      .sort((a, b) => b.total_clicks - a.total_clicks);

    let rank = 1;
    for (const click of clickDetails) {
      const excluded = isExcludedFromEditorialCtr(click.url);
      if (excluded === "magic" || excluded === "social" || excluded === "audio") continue;
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
          note:
            tally.other > 0
              ? `${tally.other} response(s) matched an unrecognized poll choice label.`
              : null,
        });
      }
    }

    log(`Synced ${post.id}: ${subject}`);
    synced += 1;
  }

  // Clean up editions previously synced into this window that no longer
  // belong (e.g. a post that used to be "both" and got pulled from web, or
  // simply aged out of the trailing window on this run).
  const keepIds = recentPosts.map((p) => p.id);
  const staleCondition =
    keepIds.length > 0
      ? and(
          eq(editions.dataSource, "beehiiv_live"),
          gte(editions.publishedAt, new Date(cutoff)),
          notInArray(editions.id, keepIds),
        )
      : and(eq(editions.dataSource, "beehiiv_live"), gte(editions.publishedAt, new Date(cutoff)));
  const removedRows = await db.delete(editions).where(staleCondition).returning({ id: editions.id });
  if (removedRows.length > 0) {
    log(`Removed ${removedRows.length} stale edition(s) no longer in this window/platform filter.`);
  }

  log(`Done. Synced ${synced} editions from the trailing ${TRAILING_DAYS} days.`);

  return { synced, removed: removedRows.length, skippedForPlatform, messages };
}

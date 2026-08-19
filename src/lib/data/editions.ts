import "server-only";
import { desc, eq } from "drizzle-orm";
import type { Edition, PublicationSnapshot } from "@/lib/types";
import type { HookType } from "@/lib/scoring/subject-line";
import type { ContentQualityCategoryResult, ContentQualityResult } from "@/lib/scoring/content-quality";
import {
  SYNTHETIC_EDITIONS,
  SYNTHETIC_PUBLICATION,
  buildSyntheticTopLinks,
  buildSyntheticPromoted,
  buildSyntheticComments,
} from "@/lib/synthetic-data";

/**
 * Data-access layer with a synthetic-data fallback. When DATABASE_URL isn't
 * set yet (e.g. local preview before Neon is wired up), every read below
 * transparently serves the same synthetic demo dataset that seeds the public
 * deployment, so the app is fully browsable without a database. Once
 * DATABASE_URL is set, this switches to real Neon reads with no code changes
 * elsewhere in the app.
 */
const USE_DB = !!process.env.DATABASE_URL;

function syntheticEditions(): Edition[] {
  return SYNTHETIC_EDITIONS.map((e, idx) => ({
    id: e.id,
    subject: e.subject,
    preview: e.preview,
    publishedAt: new Date(`${e.date}T17:57:00Z`),
    webUrl: null,
    openRate: e.open,
    ctrOverall: e.ctr,
    unsubRate: e.unsub,
    spamRate: 0,
    hookType: e.hookType,
    hasEmoji: /\p{Extended_Pictographic}/u.test(e.subject),
    hasNumber: /\d/.test(e.subject),
    charLength: e.subject.length,
    poll:
      e.pollTotal > 0
        ? {
            total: e.pollTotal,
            lovedIt: e.loved,
            prettyUseful: e.pretty,
            itWasOkay: e.okay,
            notHelpful: e.notHelpful,
            exact: true,
          }
        : null,
    topLinks: buildSyntheticTopLinks(e, idx),
    promotedLinks: buildSyntheticPromoted(e, idx),
    comments: buildSyntheticComments(e),
    voice: { avgSentenceLength: 18, bannedPhraseHits: 0, computed: false },
    dataSource: "synthetic_demo",
  }));
}

function syntheticPublication(): PublicationSnapshot {
  return {
    name: SYNTHETIC_PUBLICATION.name,
    activeSubscribers: SYNTHETIC_PUBLICATION.activeSubscribers,
    openRate: SYNTHETIC_PUBLICATION.openRate,
    clickRate: SYNTHETIC_PUBLICATION.clickRate,
    newSubscribers: SYNTHETIC_PUBLICATION.newSubscribers,
    churnedSubscribers: SYNTHETIC_PUBLICATION.churnedSubscribers,
    netSubscribers: SYNTHETIC_PUBLICATION.netSubscribers,
    dataSource: "synthetic_demo",
  };
}

export async function getAllEditions(): Promise<Edition[]> {
  if (!USE_DB) {
    return syntheticEditions().sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
  }

  const { db } = await import("@/lib/db");
  const { editions } = await import("@/lib/db/schema");

  const rows = await db.query.editions.findMany({
    orderBy: [desc(editions.publishedAt)],
    with: { poll: true, topLinks: true, promotedLinks: true, comments: true },
  });

  return rows.map(mapDbEditionToEdition);
}

export async function getEditionById(id: string): Promise<Edition | null> {
  if (!USE_DB) {
    return syntheticEditions().find((e) => e.id === id) ?? null;
  }

  const { db } = await import("@/lib/db");
  const { editions } = await import("@/lib/db/schema");

  const row = await db.query.editions.findFirst({
    where: eq(editions.id, id),
    with: { poll: true, topLinks: true, promotedLinks: true, comments: true },
  });

  return row ? mapDbEditionToEdition(row) : null;
}

export async function getPublicationSnapshot(): Promise<PublicationSnapshot> {
  if (!USE_DB) return syntheticPublication();

  const { db } = await import("@/lib/db");
  const { publicationSnapshots } = await import("@/lib/db/schema");

  const [row] = await db
    .select()
    .from(publicationSnapshots)
    .orderBy(desc(publicationSnapshots.capturedAt))
    .limit(1);

  if (!row) return syntheticPublication();

  return {
    name: row.name,
    activeSubscribers: row.activeSubscribers,
    openRate: row.openRate,
    clickRate: row.clickRate,
    newSubscribers: row.newSubscribers,
    churnedSubscribers: row.churnedSubscribers,
    netSubscribers: row.netSubscribers,
    dataSource: row.dataSource as "beehiiv_live" | "synthetic_demo",
  };
}

interface DbEditionRow {
  id: string;
  subject: string;
  preview: string;
  publishedAt: string | Date;
  webUrl: string | null;
  openRate: number;
  ctrRaw: number;
  unsubRate: number;
  spamRate: number | null;
  hookType: string | null;
  hasEmoji: boolean;
  hasNumber: boolean;
  charLength: number;
  avgSentenceLength: number | null;
  bannedPhraseHits: number | null;
  dataSource: string;
  poll: {
    total: number | null;
    lovedIt: number | null;
    prettyUseful: number | null;
    itWasOkay: number | null;
    notHelpful: number | null;
    exact: boolean;
    note: string | null;
  } | null;
  topLinks: { id: string; label: string; url: string; clicks: number; rank: number }[];
  promotedLinks: {
    id: string;
    sponsor: string;
    description: string;
    clicks: number;
    uniqueClicks: number | null;
  }[];
  comments: { id: string; author: string | null; body: string; createdAt: string | Date }[];
}

function mapDbEditionToEdition(row: DbEditionRow): Edition {
  return {
    id: row.id,
    subject: row.subject,
    preview: row.preview,
    publishedAt: new Date(row.publishedAt),
    webUrl: row.webUrl,
    openRate: row.openRate,
    ctrOverall: row.ctrRaw,
    unsubRate: row.unsubRate,
    spamRate: row.spamRate ?? 0,
    hookType: (row.hookType as HookType) ?? "direct_stake",
    hasEmoji: row.hasEmoji,
    hasNumber: row.hasNumber,
    charLength: row.charLength,
    poll:
      row.poll && row.poll.total != null
        ? {
            total: row.poll.total,
            lovedIt: row.poll.lovedIt ?? 0,
            prettyUseful: row.poll.prettyUseful ?? 0,
            itWasOkay: row.poll.itWasOkay ?? 0,
            notHelpful: row.poll.notHelpful ?? 0,
            exact: row.poll.exact,
            note: row.poll.note,
          }
        : null,
    topLinks: (row.topLinks ?? [])
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((l) => ({ id: l.id, label: l.label, url: l.url, clicks: l.clicks })),
    promotedLinks: (row.promotedLinks ?? []).map((p) => ({
      id: p.id,
      sponsor: p.sponsor,
      description: p.description,
      clicks: p.clicks,
      uniqueClicks: p.uniqueClicks,
    })),
    comments: (row.comments ?? []).map((c) => ({
      id: c.id,
      author: c.author,
      body: c.body,
      createdAt: new Date(c.createdAt),
    })),
    voice: {
      avgSentenceLength: row.avgSentenceLength ?? 18,
      bannedPhraseHits: row.bannedPhraseHits ?? 0,
      computed: row.avgSentenceLength != null,
    },
    dataSource: row.dataSource as "beehiiv_live" | "synthetic_demo",
  };
}

export interface StoredContentQualityScore extends ContentQualityResult {
  provider: string;
  model: string;
  scoredAt: Date;
}

/** Real-DB-only — synthetic demo data never has an LLM-scored content
 * quality result, since that pipeline only ever runs against real Beehiiv
 * content. */
export async function getContentQualityScore(
  editionId: string,
): Promise<StoredContentQualityScore | null> {
  if (!USE_DB) return null;

  const { db } = await import("@/lib/db");
  const { contentQualityScores } = await import("@/lib/db/schema");

  const row = await db.query.contentQualityScores.findFirst({
    where: eq(contentQualityScores.editionId, editionId),
  });
  if (!row) return null;

  return {
    total: row.total,
    categories: row.categories as ContentQualityCategoryResult[],
    batch1: row.batchFeedback.batch1,
    batch2: row.batchFeedback.batch2,
    provider: row.provider,
    model: row.model,
    scoredAt: new Date(row.scoredAt),
  };
}

export function trailingAverages(editions: Edition[]) {
  const withCtr = editions.filter((e) => typeof e.ctrOverall === "number");
  const avgCtr = withCtr.length
    ? withCtr.reduce((s, e) => s + e.ctrOverall, 0) / withCtr.length
    : 0;
  const avgUnsub = editions.length
    ? editions.reduce((s, e) => s + e.unsubRate, 0) / editions.length
    : 0;
  const avgSpam = editions.length
    ? editions.reduce((s, e) => s + e.spamRate, 0) / editions.length
    : 0;
  return { avgCtr, avgUnsub, avgSpam };
}

export function canFlag(publishedAt: Date): boolean {
  const hoursSincePublish = (Date.now() - publishedAt.getTime()) / 3_600_000;
  return hoursSincePublish >= 24;
}

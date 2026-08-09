import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Singleton row (id is always "default") holding the current site-auth
 * token, so the shared dashboard password can be changed at runtime — env
 * vars can't be rewritten by a running Vercel deployment. See
 * src/lib/site-auth.ts. Only created the first time "change password" is
 * used; until then SITE_PASSWORD (env var) is authoritative.
 */
export const siteAuthSettings = pgTable("site_auth_settings", {
  id: text("id").primaryKey(),
  authToken: text("auth_token").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One row per Beehiiv publication snapshot (rolling-window stats), captured on
 * each sync. Multiple rows accumulate a history; the app reads the latest one.
 */
export const publicationSnapshots = pgTable("publication_snapshots", {
  id: text("id").primaryKey(), // e.g. `${publicationId}:${capturedAt}`
  publicationId: text("publication_id").notNull(),
  name: text("name").notNull(),
  activeSubscribers: integer("active_subscribers").notNull(),
  openRate: doublePrecision("open_rate").notNull(), // percent, e.g. 29.79
  clickRate: doublePrecision("click_rate").notNull(),
  newSubscribers: integer("new_subscribers").notNull(),
  churnedSubscribers: integer("churned_subscribers").notNull(),
  netSubscribers: integer("net_subscribers").notNull(),
  dataSource: text("data_source").notNull(), // 'beehiiv_live' | 'synthetic_demo'
  capturedAt: timestamp("captured_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One row per Marketing Monk edition (Beehiiv post). Real metrics pulled via
 * lib/beehiiv.ts, or synthetic-but-realistic values from the demo seed script.
 */
export const editions = pgTable("editions", {
  id: text("id").primaryKey(), // Beehiiv post id, e.g. post_xxxx
  publicationId: text("publication_id").notNull(),
  subject: text("subject").notNull(), // real sent subject line, with emoji
  preview: text("preview").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),

  openRate: doublePrecision("open_rate").notNull(),
  ctrRaw: doublePrecision("ctr_raw").notNull(),
  ctrVerified: doublePrecision("ctr_verified").notNull(),
  unsubRate: doublePrecision("unsub_rate").notNull(),
  spamRate: doublePrecision("spam_rate").default(0),

  // Voice/writing-compliance inputs (placeholder pass for v1, see BUILD_LOG.md)
  avgSentenceLength: doublePrecision("avg_sentence_length"),
  bannedPhraseHits: integer("banned_phrase_hits"),

  // Subject-line tagging (Subject Line Lab)
  hookType: text("hook_type"), // curiosity_gap | number_contrast | name_drop | contrarian | personal_risk | direct_stake
  hasEmoji: boolean("has_emoji").notNull().default(false),
  hasNumber: boolean("has_number").notNull().default(false),
  charLength: integer("char_length").notNull(),

  // Plain-text extracted from Beehiiv's free_web_content HTML, used as the
  // source text for LLM-based content-quality scoring. Null until a refresh
  // has pulled it (see scripts fetch / the navbar refresh trigger).
  content: text("content"),

  dataSource: text("data_source").notNull(), // 'beehiiv_live' | 'synthetic_demo'
  syncedAt: timestamp("synced_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const editionsRelations = relations(editions, ({ one, many }) => ({
  poll: one(pollTallies, {
    fields: [editions.id],
    references: [pollTallies.editionId],
  }),
  topLinks: many(topLinks),
  promotedLinks: many(promotedLinks),
  comments: many(comments),
  contentQualityScore: one(contentQualityScores, {
    fields: [editions.id],
    references: [contentQualityScores.editionId],
  }),
}));

/**
 * Editorial content-quality score from an LLM pass against the global
 * newsletter content-analysis checklist (12 weighted categories, 0-5 each,
 * N/A excluded and its weight redistributed proportionally) — deliberately
 * independent of the engagement-metric-based score in quality-score.ts,
 * since open rate/CTR/polls/unsub are explicitly *not* valid content-quality
 * signals per that checklist. One row per edition, overwritten on re-score.
 */
export const contentQualityScores = pgTable("content_quality_scores", {
  editionId: text("edition_id")
    .primaryKey()
    .references(() => editions.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // e.g. 'openai'
  model: text("model").notNull(), // e.g. 'gpt-5.6-luna'
  total: doublePrecision("total").notNull(), // 0-100, weight-redistributed
  /** CategoryResult[] — see src/lib/scoring/content-quality.ts */
  categories: jsonb("categories").notNull(),
  narrative: text("narrative").notNull(),
  scoredAt: timestamp("scored_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentQualityScoresRelations = relations(contentQualityScores, ({ one }) => ({
  edition: one(editions, {
    fields: [contentQualityScores.editionId],
    references: [editions.id],
  }),
}));

/**
 * Per-edition poll tally for the recurring "Did you find this edition
 * helpful" poll. `exact=false` means responses were recorded but the
 * per-choice split hasn't been computed (see DATA_FINDINGS.md).
 */
export const pollTallies = pgTable("poll_tallies", {
  editionId: text("edition_id")
    .primaryKey()
    .references(() => editions.id, { onDelete: "cascade" }),
  total: integer("total"),
  lovedIt: integer("loved_it"),
  prettyUseful: integer("pretty_useful"),
  itWasOkay: integer("it_was_okay"),
  notHelpful: integer("not_helpful"),
  exact: boolean("exact").notNull().default(false),
  note: text("note"),
});

export const topLinks = pgTable("top_links", {
  id: text("id").primaryKey(),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  clicks: integer("clicks").notNull(),
  rank: integer("rank").notNull(),
});

export const promotedLinks = pgTable("promoted_links", {
  id: text("id").primaryKey(),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id, { onDelete: "cascade" }),
  sponsor: text("sponsor").notNull(),
  description: text("description").notNull(),
  clicks: integer("clicks").notNull(),
  uniqueClicks: integer("unique_clicks"),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id, { onDelete: "cascade" }),
  author: text("author"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const topLinksRelations = relations(topLinks, ({ one }) => ({
  edition: one(editions, {
    fields: [topLinks.editionId],
    references: [editions.id],
  }),
}));

export const promotedLinksRelations = relations(promotedLinks, ({ one }) => ({
  edition: one(editions, {
    fields: [promotedLinks.editionId],
    references: [editions.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  edition: one(editions, {
    fields: [comments.editionId],
    references: [editions.id],
  }),
}));

export const pollTalliesRelations = relations(pollTallies, ({ one }) => ({
  edition: one(editions, {
    fields: [pollTallies.editionId],
    references: [editions.id],
  }),
}));

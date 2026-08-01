import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

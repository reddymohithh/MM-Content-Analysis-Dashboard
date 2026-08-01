/**
 * Realistic-but-fake demo dataset for the public Vercel deployment.
 *
 * This is the same 16-edition window crafted during the wireframe design
 * session (chat-transcript.md), reused verbatim rather than re-invented,
 * since it was already built to the "richer 30-day placeholder data" spec
 * with deliberate variety in hook type, poll response volume, and comments.
 * Real Marketing Monk performance numbers never appear here or in the public
 * repo/deploy; those stay local-only via lib/beehiiv/client.ts + a private
 * .env.local, see BUILD_LOG.md.
 */

import type { HookType } from "./scoring/subject-line";

export interface SyntheticEdition {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  preview: string;
  open: number;
  ctr: number;
  unsub: number;
  hookType: HookType;
  pollTotal: number;
  loved: number;
  pretty: number;
  okay: number;
  notHelpful: number;
  comments: string[];
}

export const SYNTHETIC_PUBLICATION = {
  id: "pub_demo0000-0000-0000-0000-000000000000",
  name: "Marketing Monk (demo data)",
  activeSubscribers: 56828,
  openRate: 29.79,
  clickRate: 0.79,
  newSubscribers: 722,
  churnedSubscribers: 1707,
  netSubscribers: -985,
};

export const SYNTHETIC_EDITIONS: SyntheticEdition[] = [
  { id: "demo_p16", date: "2026-07-30", subject: "🤔 ChatGPT's Grip on AI Search Just Broke", preview: "It fell from 76% to 53% in a single year", open: 15.22, ctr: 0.42, unsub: 0.02, hookType: "number_contrast", pollTotal: 0, loved: 0, pretty: 0, okay: 0, notHelpful: 0, comments: [] },
  { id: "demo_p15", date: "2026-07-29", subject: "😰 Your Claude Chats Might Be on Google", preview: "Plus: Ladder's bold body-image pivot", open: 26.6, ctr: 1.15, unsub: 0.03, hookType: "personal_risk", pollTotal: 22, loved: 9, pretty: 7, okay: 4, notHelpful: 2, comments: ["Didn't realize this was happening, useful heads up.", "Would love a follow-up on how to opt out."] },
  { id: "demo_p14", date: "2026-07-28", subject: "😎 500 Followers Is Enough To Get Paid Now", preview: "Brands are courting nano-creators for real budget", open: 27.29, ctr: 0.69, unsub: 0.04, hookType: "number_contrast", pollTotal: 19, loved: 8, pretty: 6, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p13", date: "2026-07-27", subject: "💰 He Fired His Agency. AI Cut CAC 20%", preview: "The math behind cutting the middleman", open: 28.35, ctr: 0.96, unsub: 0.04, hookType: "direct_stake", pollTotal: 20, loved: 9, pretty: 6, okay: 3, notHelpful: 2, comments: ["This is the kind of breakdown I subscribe for."] },
  { id: "demo_p12", date: "2026-07-26", subject: "📈 The $180K Side Hustle From 100K Followers", preview: "Creator economics keep getting stranger", open: 28.58, ctr: 0.67, unsub: 0.04, hookType: "number_contrast", pollTotal: 0, loved: 0, pretty: 0, okay: 0, notHelpful: 0, comments: [] },
  { id: "demo_p11", date: "2026-07-21", subject: "🥤 Coca-Cola's Rebrand Skips the Logo", preview: "A century of brand equity, redrawn", open: 31.88, ctr: 1.27, unsub: 0.03, hookType: "contrarian", pollTotal: 24, loved: 12, pretty: 7, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p10", date: "2026-07-20", subject: "📺 Nielsen Just Rewrote Your TV Ad Math", preview: "The measurement model marketers relied on just moved", open: 30.18, ctr: 0.88, unsub: 0.05, hookType: "direct_stake", pollTotal: 19, loved: 8, pretty: 6, okay: 3, notHelpful: 2, comments: ["Solid explainer, shared with my team."] },
  { id: "demo_p9", date: "2026-07-19", subject: "🛒 Google's $1.27B Shopping Bill", preview: "A number big enough to change the vendor conversation", open: 31.82, ctr: 0.84, unsub: 0.05, hookType: "number_contrast", pollTotal: 20, loved: 9, pretty: 6, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p8", date: "2026-07-18", subject: "🤖 Google Just Lost Android's Biggest Edge", preview: "The default that defaults were built on", open: 31.35, ctr: 0.8, unsub: 0.06, hookType: "contrarian", pollTotal: 18, loved: 7, pretty: 6, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p7", date: "2026-07-17", subject: "🎨 AI Made Creative Faster. Not Better.", preview: "Speed and quality split apart this year", open: 30.31, ctr: 0.79, unsub: 0.04, hookType: "contrarian", pollTotal: 17, loved: 7, pretty: 5, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p6", date: "2026-07-14", subject: "🔇 The Algorithm Change Nobody Announced", preview: "Reach dropped 30% and platforms stayed quiet", open: 29.44, ctr: 0.91, unsub: 0.04, hookType: "curiosity_gap", pollTotal: 18, loved: 8, pretty: 5, okay: 3, notHelpful: 2, comments: ["Confirmed we saw the same drop."] },
  { id: "demo_p5", date: "2026-07-13", subject: "🏢 Why CMOs Are Cutting Agency Retainers", preview: "In-house is winning the budget argument", open: 29.9, ctr: 0.85, unsub: 0.03, hookType: "direct_stake", pollTotal: 19, loved: 9, pretty: 5, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p4", date: "2026-07-10", subject: "📬 The $2M Newsletter Nobody Talks About", preview: "A niche list, a real business", open: 31.02, ctr: 1.05, unsub: 0.03, hookType: "number_contrast", pollTotal: 21, loved: 10, pretty: 6, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p3", date: "2026-07-09", subject: "🔍 Meta's Ad Manager Just Got a Quiet Overhaul", preview: "Small UI change, big targeting implications", open: 28.77, ctr: 0.74, unsub: 0.04, hookType: "curiosity_gap", pollTotal: 16, loved: 6, pretty: 5, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p2", date: "2026-07-08", subject: "🎥 The Creator Who Beat a Legacy Brand at Its Own Game", preview: "One person, one camera, one bigger audience", open: 29.61, ctr: 0.88, unsub: 0.03, hookType: "name_drop", pollTotal: 19, loved: 8, pretty: 6, okay: 3, notHelpful: 2, comments: [] },
  { id: "demo_p1", date: "2026-07-07", subject: "🔎 Search Traffic Is Down. Intent Traffic Is Up.", preview: "The metric marketers should be watching instead", open: 30.85, ctr: 0.93, unsub: 0.04, hookType: "contrarian", pollTotal: 18, loved: 8, pretty: 5, okay: 3, notHelpful: 2, comments: [] },
];

const LINK_POOL = [
  { label: "Marketing Monk, article page", url: "https://www.marketingmonk.so/p/edition" },
  { label: "Axios, marketing and media desk", url: "https://www.axios.com/" },
  { label: "Search Engine Land, news desk", url: "https://searchengineland.com/" },
  { label: "Digiday, media and ad tech coverage", url: "https://digiday.com/" },
  { label: "Marketing Brew, daily issue", url: "https://www.marketingbrew.com/" },
  { label: "AdExchanger, programmatic roundup", url: "https://www.adexchanger.com/" },
  { label: "Lenny's Newsletter, growth essay", url: "https://www.lennysnewsletter.com/" },
  { label: "Ahrefs blog, SEO breakdown", url: "https://ahrefs.com/blog/" },
  { label: "Adweek, industry trade piece", url: "https://www.adweek.com/" },
  { label: "HubSpot blog, tactical guide", url: "https://blog.hubspot.com/" },
];

const SPONSOR_POOL = [
  { sponsor: "The Rundown AI", desc: "Sponsored newsletter placement" },
  { sponsor: "Superhuman AI", desc: "Prompt pack lead magnet" },
  { sponsor: "AirOps", desc: "Webinar registration placement" },
  { sponsor: "Notion", desc: "Template gallery placement" },
];

export function buildSyntheticTopLinks(edition: SyntheticEdition, idx: number) {
  const start = idx % LINK_POOL.length;
  return Array.from({ length: 6 }, (_, i) => {
    const base = LINK_POOL[(start + i) % LINK_POOL.length];
    const clicks = Math.max(8, Math.round(60 - i * 7 + edition.ctr * 10));
    return {
      id: `${edition.id}-link-${i}`,
      label: base.label,
      url: base.url,
      clicks,
      rank: i + 1,
    };
  });
}

export function buildSyntheticPromoted(edition: SyntheticEdition, idx: number) {
  const s = SPONSOR_POOL[idx % SPONSOR_POOL.length];
  return [
    {
      id: `${edition.id}-promoted-0`,
      sponsor: s.sponsor,
      description: s.desc,
      clicks: Math.round(20 + (idx % 5) * 35),
      uniqueClicks: null as number | null,
    },
  ];
}

export function buildSyntheticComments(edition: SyntheticEdition) {
  return edition.comments.map((body, i) => ({
    id: `${edition.id}-comment-${i}`,
    author: null as string | null,
    body,
    createdAt: new Date(
      new Date(`${edition.date}T17:57:00Z`).getTime() + (3 + i * 2) * 3600 * 1000,
    ),
  }));
}

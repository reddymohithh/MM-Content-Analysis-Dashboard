import type { HookType } from "./scoring/subject-line";

export interface PollTally {
  total: number;
  lovedIt: number;
  prettyUseful: number;
  itWasOkay: number;
  notHelpful: number;
  exact: boolean;
  note?: string | null;
}

export interface TopLink {
  id: string;
  label: string;
  url: string;
  clicks: number;
}

export interface PromotedLink {
  id: string;
  sponsor: string;
  description: string;
  clicks: number;
  uniqueClicks: number | null;
}

export interface EditionComment {
  id: string;
  author: string | null;
  body: string;
  createdAt: Date;
}

export interface Edition {
  id: string;
  subject: string;
  preview: string;
  publishedAt: Date;
  /** Real published URL on the newsletter's own site. Null for synthetic
   * demo data, or a real edition that hasn't been re-synced since this
   * field was added. */
  webUrl: string | null;
  openRate: number;
  ctrOverall: number;
  unsubRate: number;
  spamRate: number;
  hookType: HookType;
  hasEmoji: boolean;
  hasNumber: boolean;
  charLength: number;
  poll: PollTally | null;
  topLinks: TopLink[];
  promotedLinks: PromotedLink[];
  comments: EditionComment[];
  voice: {
    avgSentenceLength: number;
    bannedPhraseHits: number;
    computed: boolean;
  };
  dataSource: "beehiiv_live" | "synthetic_demo";
}

export interface PublicationSnapshot {
  name: string;
  activeSubscribers: number;
  openRate: number;
  clickRate: number;
  newSubscribers: number;
  churnedSubscribers: number;
  netSubscribers: number;
  dataSource: "beehiiv_live" | "synthetic_demo";
}

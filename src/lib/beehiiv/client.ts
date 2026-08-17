/**
 * Beehiiv REST API v2 client.
 *
 * Every endpoint below is verified against developers.beehiiv.com (fetched live
 * during this build, see BUILD_LOG.md), not guessed at. The prior project
 * skeleton (../MM Content Analysis Dashboard/lib/beehiiv.js) had thrown
 * "verify or replace with MCP" on the analytics-heavy calls because it could
 * not reach the docs at the time; this version replaces every one of those
 * with a real, confirmed REST call:
 *
 *   - Per-edition opens/clicks/unsubscribes/spam AND per-URL click breakdown
 *     come from GET /posts/:postId with expand[]=stats (not a separate
 *     "list clicks" endpoint).
 *   - The real per-edition poll tally (previously "needs automation") comes
 *     from GET /polls/:pollId/responses filtered by post_id, see
 *     computeEditionPollTally() below.
 *   - Publication-level rolling stats come from GET /publications/:id with
 *     expand[]=stats.
 *   - Day-by-day engagement trend comes from GET /publications/:id/engagements.
 *
 * The one endpoint that is NOT confirmed to exist publicly is a dedicated
 * comments endpoint — no such path was found in the docs. This matches
 * docs/DATA_FINDINGS.md in the old scaffold, which found comments were zero
 * on every edition checked anyway. listPostComments() below is therefore a
 * clearly-labeled stub, not a guess.
 */

const BASE_URL = "https://api.beehiiv.com/v2";

function authHeaders(): HeadersInit {
  const key = process.env.BEEHIIV_API_KEY;
  if (!key) {
    throw new Error(
      "BEEHIIV_API_KEY is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function beehiivFetch<T>(
  path: string,
  params: Record<string, string | number | string[] | undefined> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(`${key}[]`, v));
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Beehiiv API error ${res.status} on ${path}: ${body}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

// --- Types (partial, only the fields this app reads) -----------------------

export interface BeehiivPublicationStats {
  active_subscriptions: number;
  active_premium_subscriptions: number;
  active_free_subscriptions: number;
  average_open_rate: number;
  average_click_rate: number;
  total_sent: number;
  total_unique_opened: number;
  total_clicked: number;
}

export interface BeehiivPublication {
  id: string;
  name: string;
  organization_name: string;
  stats?: BeehiivPublicationStats;
}

export interface BeehiivUrlClickDetail {
  url: string;
  base_url: string;
  email?: { clicks: number; unique_clicks: number; verified_clicks?: number };
  web?: { clicks: number; unique_clicks: number };
  total_clicks: number;
  total_unique_clicks: number;
  total_click_through_rate: number;
}

export interface BeehiivPostStats {
  email: {
    recipients: number;
    delivered: number;
    opens: number;
    unique_opens: number;
    open_rate: number;
    clicks: number;
    unique_clicks: number;
    verified_clicks: number;
    unique_verified_clicks: number;
    click_rate: number;
    unsubscribes: number;
    spam_reports: number;
  };
  web?: { views: number; clicks: number };
  clicks?: BeehiivUrlClickDetail[];
}

export interface BeehiivPost {
  id: string;
  publication_id: string;
  title: string;
  subtitle?: string;
  subject_line?: string;
  preview_text?: string;
  status: "draft" | "confirmed" | "archived";
  publish_date?: number; // unix seconds
  displayed_date?: number;
  authors?: string[];
  content_tags?: string[];
  /** Which channel(s) this post actually went out on. */
  platform?: "both" | "web" | "email";
  stats?: BeehiivPostStats;
  /** Present when fetched with expand=free_web_content or free_email_content. */
  content?: {
    free?: { web?: string; email?: string };
    premium?: { web?: string; email?: string };
  };
}

export interface BeehiivEngagementPoint {
  date: string;
  total_opens: number;
  unique_opens: number;
  total_clicks: number;
  total_verified_clicks: number;
  unique_clicks: number;
  unique_verified_clicks: number;
}

export interface BeehiivPoll {
  id: string;
  name: string;
  question: string;
  poll_type: string;
  status: string;
  created_at: number;
  poll_choices: { id: string; label: string }[];
}

export interface BeehiivPollResponse {
  id: string;
  subscription_id: string | null;
  poll_choice_id: string;
  poll_choice_label: string;
  created_at: number;
  extended_feedback?: string;
  post_id?: string;
  post_title?: string;
}

interface PagedResponse<T> {
  data: T[];
  limit: number;
  has_more?: boolean;
  next_cursor?: string;
  total_results?: number;
}

// --- Publications ------------------------------------------------------------

export async function listPublications() {
  return beehiivFetch<{ data: BeehiivPublication[] }>("/publications");
}

export async function getPublication(publicationId: string) {
  return beehiivFetch<{ data: BeehiivPublication }>(
    `/publications/${publicationId}`,
    { expand: ["stats"] },
  );
}

// --- Posts ---------------------------------------------------------------

export async function listPosts(
  publicationId: string,
  opts: {
    limit?: number;
    page?: number;
    status?: "draft" | "confirmed" | "archived" | "all";
    orderBy?: "created" | "publish_date" | "displayed_date";
    direction?: "asc" | "desc";
    expand?: ("stats" | "free_web_content" | "free_email_content")[];
  } = {},
) {
  return beehiivFetch<PagedResponse<BeehiivPost>>(
    `/publications/${publicationId}/posts`,
    {
      limit: opts.limit ?? 50,
      page: opts.page ?? 1,
      status: opts.status ?? "confirmed",
      order_by: opts.orderBy ?? "publish_date",
      direction: opts.direction ?? "desc",
      expand: opts.expand,
    },
  );
}

export async function getPost(
  publicationId: string,
  postId: string,
  opts: { expand?: string[] } = { expand: ["stats"] },
) {
  return beehiivFetch<{ data: BeehiivPost }>(
    `/publications/${publicationId}/posts/${postId}`,
    { expand: opts.expand },
  );
}

export async function getAggregateStats(
  publicationId: string,
  opts: { audience?: "free" | "premium" | "all" } = {},
) {
  return beehiivFetch<{ data: { stats: unknown } }>(
    `/publications/${publicationId}/posts/aggregate_stats`,
    { audience: opts.audience ?? "all" },
  );
}

// --- Engagement (day-by-day trend) ------------------------------------------

export async function getEngagements(
  publicationId: string,
  opts: {
    startDate?: string; // YYYY-MM-DD
    numberOfDays?: number; // 1-31
    granularity?: "day" | "week" | "month";
    emailType?: "all" | "post" | "message";
  } = {},
) {
  return beehiivFetch<{ data: BeehiivEngagementPoint[] }>(
    `/publications/${publicationId}/engagements`,
    {
      start_date: opts.startDate,
      number_of_days: opts.numberOfDays ?? 30,
      granularity: opts.granularity ?? "day",
      email_type: opts.emailType ?? "post",
      direction: "asc",
    },
  );
}

// --- Polls -------------------------------------------------------------------

export async function listPolls(
  publicationId: string,
  opts: { limit?: number; cursor?: string } = {},
) {
  return beehiivFetch<PagedResponse<BeehiivPoll>>(
    `/publications/${publicationId}/polls`,
    { limit: opts.limit ?? 25, cursor: opts.cursor },
  );
}

export async function listPollResponses(
  publicationId: string,
  pollId: string,
  opts: { postId?: string; limit?: number; cursor?: string } = {},
) {
  return beehiivFetch<PagedResponse<BeehiivPollResponse>>(
    `/publications/${publicationId}/polls/${pollId}/responses`,
    {
      post_id: opts.postId,
      limit: opts.limit ?? 100,
      cursor: opts.cursor,
      expand: ["post"],
    },
  );
}

/**
 * Walks every page of a poll's responses filtered to one post, tallying real
 * per-edition counts. This replaces the old "hand-tally, not yet automated"
 * TODO from docs/DATA_FINDINGS.md — GET /polls/:pollId/responses?post_id=
 * turns out to support server-side filtering, so no client-side matching
 * against list_post_clicks/pcid is needed at all.
 *
 * Category matching is done by keyword against `poll_choice_label` since the
 * exact label strings depend on how the poll was authored in Beehiiv. Verify
 * these keywords against the real recurring poll's choice labels on first
 * sync (docs/DATA_FINDINGS.md names it "Did you find this edition helpful"
 * with options Loved it / Pretty useful / It was okay / Not helpful).
 */
export async function computeEditionPollTally(
  publicationId: string,
  pollId: string,
  postId: string,
) {
  const tally = {
    total: 0,
    lovedIt: 0,
    prettyUseful: 0,
    itWasOkay: 0,
    notHelpful: 0,
    other: 0,
  };

  let cursor: string | undefined;
  do {
    const page = await listPollResponses(publicationId, pollId, {
      postId,
      limit: 100,
      cursor,
    });
    for (const response of page.data) {
      tally.total += 1;
      const label = response.poll_choice_label.toLowerCase();
      if (label.includes("love")) tally.lovedIt += 1;
      else if (label.includes("useful")) tally.prettyUseful += 1;
      else if (label.includes("okay") || label.includes("ok")) tally.itWasOkay += 1;
      else if (label.includes("not") || label.includes("didn")) tally.notHelpful += 1;
      else tally.other += 1;
    }
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  return tally;
}

// --- Comments -----------------------------------------------------------

/**
 * No public REST endpoint for post comments was found in the current Beehiiv
 * API docs (developers.beehiiv.com) as of this build. This is a stub, not a
 * guess: it returns an empty list rather than fabricating one. Every edition
 * checked in the old scaffold's design session (docs/DATA_FINDINGS.md) had
 * zero comments anyway, so the UI's "no comments" empty state is expected to
 * be the common case regardless.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function listPostComments(_publicationId: string, _postId: string) {
  return { data: [] as { id: string; author?: string; body: string; created_at: number }[] };
}

// --- Segments ----------------------------------------------------------------

/**
 * Confirmed live against the real REST API (not just the MCP tool used for
 * Round 33's research, whose response shape turned out to be enriched
 * beyond what this public endpoint actually returns — verified by curling
 * both the list and single-segment endpoints directly before writing this).
 *
 * Two real surprises: (1) this endpoint's pagination is page/limit-based
 * ({page, limit, total_results, total_pages}), not the cursor-based
 * {data, has_more, next_cursor} shape every other list endpoint in this
 * client uses. (2) open_rate/clickthrough_rate/subscriber counts are NOT
 * included by default — they only appear with `expand[]=stats`, same
 * pattern as posts.
 */
export interface BeehiivSegment {
  id: string;
  name: string;
  type: string;
  status: string;
  active: boolean;
  total_results: number; // member count as of last_calculated
  last_calculated: number; // unix seconds
  stats?: {
    open_rate: number;
    clickthrough_rate: number;
    total_subscribers: number;
    total_sent: number;
    unsubscribed_rate: number;
  };
}

interface SegmentsPage {
  data: BeehiivSegment[];
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
}

export async function listSegments(publicationId: string) {
  return beehiivFetch<SegmentsPage>(`/publications/${publicationId}/segments`, {
    limit: 100,
    expand: ["stats"],
  });
}

/**
 * Subscriptions listing NOT built, on purpose (BUILD_LOG.md Round 48):
 * the real `/publications/:id/subscriptions` endpoint silently ignores
 * both `segment_id` and `subscribed_after`/`subscribed_before` for this
 * account -- confirmed live by passing a nonexistent segment id and
 * getting the exact same results back as no filter at all. A per-day or
 * per-source Beehiiv subscriber count isn't reliably obtainable from
 * the public API today.
 */

// --- Non-editorial link exclusion (see docs/PROJECT_SPEC.md rule 3) --------

const SOCIAL_HOST_PATTERNS = [
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "linkedin.com",
];

export function isExcludedFromEditorialCtr(url: string): "magic" | "social" | "audio" | null {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (host.includes("magic.beehiiv.com")) return "magic";
  if (url.includes("beehiiv-audio-tts-id")) return "audio";
  if (SOCIAL_HOST_PATTERNS.some((p) => host.includes(p))) return "social";
  return null;
}

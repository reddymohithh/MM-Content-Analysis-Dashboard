# Build Log — Marketing Monk Content Analysis Dashboard

This file logs the full build conversation for this project, word for word in
substance (paraphrased where tool output would be too long to reproduce), in the
order it happened. Started 2026-08-01.

---

## Session start — inputs provided

The user opened this session by attaching two files and asking to build the real
app:

- `Content Analysis Dashboard (standalone).html` — a self-contained, offline-capable
  HTML/CSS/vanilla-JS wireframe of the dashboard (tabbed control-room layout:
  Overview, Editions, Subject Line Lab, Retention), produced in a prior claude.ai
  design session.
- `chat-transcript.md` — the full transcript of that prior design session (see
  "Prior design session" section below for its contents).

The user's instructions for this session:

1. We will build this and host it on Vercel.
2. The database would be Neon.
3. This will also go on to GitHub as a repo contributing for the user's AI Product
   Manager portfolio.
4. Ensure to create a `.md` file and log everything in it throughout this chat
   without missing a word.

The user asked Claude to ask any questions before starting.

## Prior design session (chat-transcript.md, summarized)

A prior claude.ai session used the user's uploaded project files (`CONTEXT.md`,
`README.md`, `PROJECT_SPEC.md`, editorial instructions, analytics framework,
Beehiiv data audit, `DATA_FINDINGS.md`, dashboard spec v4, `sample.json`,
`reference_mockup_v5.html`) to design the dashboard UI.

Key steps in that session:

1. Claude proposed 4 design directions (sidebar+detail, single scrolling report,
   tabbed control-room, card-grid with drill-in), all built on the existing
   orange/amber/cream/black palette with Fraunces/Manrope/JetBrains Mono, editorial
   density, illustrated-infographic charts, and a 30-day richer placeholder dataset.
2. The user picked **1c, tabbed control-room**, then asked for the full multi-view
   app: Overview, Editions (list -> post detail), Subject Line Lab, Retention tabs,
   wired to a Blended/Batch 1/Batch 2 audience lens and a 16-edition placeholder
   dataset.
3. Several bugs were found and fixed: tab bar / audience-lens buttons wrapping,
   Editions list not rendering (an unsupported `b-value-negate` attribute), poll/
   comments empty states breaking on another unsupported negate attribute.
4. The user gave a detailed, numbered punch list of UX/data-correctness fixes
   across all four tabs. In full:

   **Overview tab:**
   - Chart needs real X-axis (dates) / Y-axis (percentages); hover shows subject
     line + open rate + CTR together via a vertical crosshair line; clicking the
     subject line jumps to that post in Editions.
   - Content quality score should depend less on poll response (many posts get no
     poll responses at all) — rely on the fuller content-analysis metric set
     instead.
   - Remove the "Editorial lens, not a data split" label from the navbar.
   - Lock the Blended / Batch 1 / Batch 2 buttons on every page except when a
     specific edition is open in Editions.
   - Remove extra whitespace above the navbar and above the footer.
   - CTR should be an overall metric, not one that excludes ad/social links,
     because Marketing Monk's own social/link inserts are educational/guide
     content, not unrelated promotional jargon.

   **Editions tab:**
   - Same lens-button locking rule applies here.
   - Date column should show the year; use USA date format throughout the
     dashboard.
   - Subject lines must be pulled correctly from Beehiiv — nearly every real
     subject line has an emoji prefix, but only a few were showing one.

   **Specific edition page:**
   - Replace the 4 horizontal stat boxes (Open rate, CTR raw/verified, Unsub rate,
     Quality) with a 2x2 grid on the left half of the container (row 1: open rate,
     CTR; row 2: unsub rate, quality).
   - Right half of the container: Reader Feedback section with the actual Beehiiv
     poll rendered visually, numeric + word axis labels, hover-per-bar shows the
     response count; this covers ~75% of that container's height.
   - Remaining ~25% of that container: comments if any exist, otherwise an
     explicit "no comments" state — always reserve the space.
   - Quality scoring follows the Overview tab's poll-deemphasized approach.
   - "Why this edition scored X%" section: convert the 4 weighted parameters into
     horizontal donut charts, with the center of each donut showing the weight and
     the score, and the explanation text below.

   **Subject Line Lab:**
   - Clicking a subject line jumps to that edition's detail page in Editions.
   - Same lens-button locking rule applies here.
   - Length column shows character count explicitly (e.g. "41 char", "30 char").

5. Claude implemented all of the above, plus fixed a header-logo / chart-title
   text-wrap/overlap bug found by a verifier pass.
6. The user then asked for a plain, portable download (the `.dc.html` canvas
   format doesn't render outside this platform's template runtime — raw
   `{{ }}` placeholders showed up unresolved when downloaded). Claude rebuilt the
   entire dashboard as a self-contained plain HTML + vanilla JS file with the same
   content, copy, and design, but real working tabs/hover/click-through, so it
   opens correctly in any browser.
7. A verifier pass found KPI numbers and headings rendering invisible (white text
   on white background) due to the dark page background triggering browser
   dark-mode text-color heuristics. Fixed by adding
   `<meta name="color-scheme" content="light">` and an explicit `color:#0D0D0D` on
   `html`/`body`.
8. The user asked to convert that whole chat to a markdown file (produced as
   `chat-transcript.md`) and to update it after the final fix — which is the file
   handed into this session.

That standalone HTML file (`Content Analysis Dashboard (standalone).html`) is the
UI/UX target for the real build: same layout, copy, and interaction pattern, now to
be rebuilt as a real full-stack app against real data instead of a static mockup.

## Prior scaffold discovered on disk

Before asking questions, Claude found an existing, separate project folder,
`MM Content Analysis Dashboard/`, one level up from this project, which is an
earlier attempt at the real (non-wireframe) build. It contains:

- `CONTEXT.md` — full original design conversation (a different, earlier one than
  `chat-transcript.md`) that produced the initial spec.
- `docs/PROJECT_SPEC.md` — consolidated spec, source of truth for what to build
  (ground rules, home page, edition detail, quality score formula, audience lens,
  suggested build order).
- `docs/DATA_FINDINGS.md` — real numbers pulled live from Beehiiv during the design
  session (publication id `pub_a5a04dd9-d851-4864-bf87-7a105c812c27`, workspace id
  `work_656c4710-0aa9-4c17-af2e-ff71fab9f386`, recurring poll id
  `e51d97ad-30c5-4bb1-94eb-6a903e0be6b8`, 56,828 active subscribers, 10-edition real
  sample July 17-30, three fully-verified editions with real poll tallies and top
  links, confirmed platform facts about comments/polls/exclusion rules).
- `docs/00_editorial_instructions.md` (930 lines) — locked editorial voice spec and
  banned-phrase list (Section 5.2), referenced by the voice-compliance score
  component.
- `docs/01_analytics_framework.md`, `docs/02_beehiiv_data_audit.md`,
  `docs/03_dashboard_spec_v3.md`, `docs/04_dashboard_spec_v4.md` — earlier spec
  iterations, superseded by `PROJECT_SPEC.md` but kept as history.
- `docs/reference_mockup_v5.html` — an earlier static mockup, superseded by the
  newer wireframe handed into this session.
- `server.js`, `lib/beehiiv.js`, `lib/qualityScore.js`, `public/` — a working
  Node/Express skeleton with a fully implemented quality-score module and a
  Beehiiv REST client that is **intentionally incomplete**: `listPublications`,
  `listPosts`, `getPost` are implemented against documented Beehiiv API v2 shape;
  `getPublicationStats`, `getEngagements`, `getPostStats`, `listPostClicks`,
  `listPostComments`, `listPolls`, `getPoll` all throw, flagged as needing REST
  verification because those specific calls were only ever proven through Beehiiv's
  MCP server during design, not raw REST.
- `public/data/sample.json` — real seed data (the 3 fully-verified editions plus a
  10-point trend) pulled from Beehiiv during design, used as fallback data.
- `.env.example` — placeholder `BEEHIIV_API_KEY`, plus the real
  `BEEHIIV_PUBLICATION_ID`.

This project supersedes that skeleton's frontend (using the newer wireframe as the
UI target) but reuses its data model, quality-score formula, ground rules, and
Beehiiv integration notes as the foundation for the real build.

## Clarifying questions — round 1

Claude asked 4 questions before starting:

1. **Tech stack** — Next.js + React vs. vanilla HTML/JS + Vercel serverless
   functions.
   **Answer: Next.js + React.**
2. **Data source at launch** — sample/placeholder data seeded into Neon vs. real
   live Beehiiv data from day one.
   **Answer: Real live Beehiiv data from day one.**
3. **Public-deploy data** — since the GitHub repo and Vercel deploy are a public
   portfolio piece, should the public deployment show real Marketing Monk numbers
   or synthetic ones?
   **Answer: Synthetic/sample data on the public deploy** (real data, if used,
   stays local-only, never committed).
4. **Access control** — fully public vs. password-gated deployment.
   **Answer: Password-gated** (single shared password via env var / middleware).

## Clarifying questions — round 2

Claude asked 4 more questions, since round 1 created a tension (real Beehiiv data
day one, but synthetic data on the public deploy) that needed resolving, plus
practical setup questions:

1. **Beehiiv ingestion method** — use this session's already-connected Beehiiv MCP
   tools to pull a real snapshot right now (no API key needed today) vs. build live
   REST integration against a user-supplied API key (documented endpoints only;
   analytics-heavy endpoints stay placeholders until their REST shape is
   confirmed).
   **Answer: Build live REST integration with the user's API key.**
2. **Neon setup** — does the user already have a Neon project?
   **Answer: No — walk the user through creating one.**
3. **GitHub repo visibility** — public vs. private.
   **Answer: Public repo** (for the portfolio), with real credentials kept out via
   `.env` / `.gitignore` regardless.
4. **Voice-compliance / audience-fit LLM scoring** — wire real Claude API calls now
   vs. keep the existing placeholder logic for v1.
   **Answer: Placeholder for v1**, documented as a known next step, no
   `ANTHROPIC_API_KEY` needed today.

## Resulting architecture decisions (locked)

- **Framework:** Next.js (App Router, TypeScript, Tailwind), deployed to Vercel.
- **Database:** Neon Postgres (new project, user will create it with Claude's
  walkthrough), accessed via an ORM (Drizzle, decided during scaffolding).
- **Data sourcing:** Live Beehiiv REST integration using a user-supplied API key,
  built against documented Beehiiv public API v2 endpoints. Endpoints without a
  confirmed public REST shape (the analytics-heavy ones flagged in the old
  `lib/beehiiv.js`) are verified against current Beehiiv docs during the build;
  where no public REST equivalent exists, this is stated plainly rather than
  guessed at.
- **Public vs. real data split:** the public Vercel deployment runs on realistic
  synthetic data seeded into its own Neon data (not real Marketing Monk
  performance numbers). Real Beehiiv credentials and any real-data sync stay
  local-only, excluded from git via `.gitignore`.
- **Access control:** the public deployment sits behind a single shared-password
  gate (Next.js middleware, password in an env var).
- **Scoring logic:** quality score and Batch 1 / Batch 2 audience-lens fit
  judgment carry over the placeholder/rule-based logic from the old skeleton for
  v1 (poll-deemphasized weighting per the wireframe punch list), with real
  Claude-API-backed scoring documented as a follow-up, not built now.
- **Repo:** public GitHub repo, part of the user's AI Product Manager portfolio.
- **UI target:** `Content Analysis Dashboard (standalone).html` (the fully punch-
  listed wireframe) is the visual/UX spec to port faithfully into React
  components; the old `docs/reference_mockup_v5.html` and superseded numbered spec
  docs are historical reference only.

## Next steps (as of this entry)

Task list created to track the build (design-token extraction from the wireframe,
Next.js scaffold, Neon schema + Drizzle, Beehiiv REST client, quality-score port,
the four dashboard views, password gate, seed scripts, git/GitHub/Vercel setup).
Continuing now to request the Beehiiv API key and walk through Neon project
creation.

## Requested from user

Asked the user for two things, to be pasted in chat and stored only in a local,
git-ignored `.env.local` (never committed):

1. **Beehiiv API key** (Beehiiv -> Settings -> Integrations -> API). Publication ID
   already known from the old scaffold: `pub_a5a04dd9-d851-4864-bf87-7a105c812c27`.
2. **Neon connection string** — walked the user through: sign up at neon.tech,
   create a new project (e.g. `marketing-monk-dashboard`), copy the
   `postgresql://...` connection string it shows. Noted that Neon's branching
   feature will be used later to keep the public demo's synthetic data separate
   from real local data, but the user doesn't need to create a branch yet.

Proceeding to scaffold the Next.js app while these are pending, since scaffolding,
design tokens, and schema design don't require live credentials.

## Design-token / component extraction (subagent report)

Dispatched an Explore subagent to decode and analyze
`Content Analysis Dashboard (standalone).html` (a self-executing "bundler" wrapper;
the real app markup/CSS/JS is a ~64KB JSON-escaped string inside a
`<script type="__bundler/template">` tag, the rest of the 471KB is embedded woff2
font data). Full findings:

**Architecture of the wireframe itself:** single global `state` object
(`{tab, audience, selectedId, hoverIdx, hoverPollIdx}`), no virtual DOM — every
interaction mutates state then fully re-stringifies `#app.innerHTML` via a
`render()` function. This is the interaction model being ported to real React
state/components, not copied as-is.

**Design tokens (exact values to carry into Tailwind config):**

- Brand: `#0D0D0D` near-black (navbar bg, body text), `#FAF5EC` cream (app shell
  bg, navbar text), `#FF5500` primary orange (active tab pill, accent, chart open-
  rate line, quality color), `#FFB800` amber (gradient end, "Pretty useful" poll
  bar, hook-type bars)
- Neutrals: `#fff` card bg, `#fbfaf7` secondary card/table-header bg, `#E5E5E5`
  default card border, `#F1F1EE` hairline row dividers/gridlines, `#6B7280`
  secondary text, `#9a9284` tertiary/muted text, `#2A2A2A` secondary heading text,
  `#1e1e1e` lens-button pill container bg, `#d8cfc0` scrollbar thumb
- Semantic: `#d13c3c` negative/red, `#1a8f4c` positive/green, `#fff4ec` warning-
  banner tint, `#c9c2b4` tan (CTR legend / "Okay" poll bar), `#FF7A33` lighter
  orange (chart tooltip open-rate figure only), `#B8420A` link default color
- Fonts (Google Fonts, self-hosted woff2, weights 400/600/700/800): **Fraunces**
  (serif) for headings/titles/big stat numbers; **Manrope** (sans-serif) as the
  base body font; **JetBrains Mono** (monospace) for all-caps eyebrow labels,
  dates, chart axis text, table headers, char-count column
- Radii: 4px (progress bars, scrollbar), 6px (chips/comment bubbles), 8px (tab
  pills, badges), 9px (lens pill container), 10px (most cards/tables), 12px (top-
  row stat cards, hero cards). **No box-shadow anywhere** — flat fills + 1px
  borders only, zero elevation.

**Global layout:** single-page shell, `#app` flex column, full-bleed (no
sidebar). Dark navbar (`#0D0D0D`, `padding:14px 32px`) with logo left, 4 tab pills
(Overview/Editions/Subject Line Lab/Retention) next to it, and the 3-button
Blended/Batch 1/Batch 2 lens toggle right-aligned inside a dark `#1e1e1e` pill
container. Content area below is the only scrollable region. No footer element.

**Per-tab structure:**
- *Overview*: 4-col stat grid (Subscribers, Open rate, CTR overall, gradient
  Content-quality tile) -> line-chart card (SVG, dual independent Y scales for
  open rate vs CTR) with legend -> 2-col Tips row -> 2-col Batch 1/Batch 2
  editorial-feedback row.
- *Editions*: list view (single sortable table: Date/Subject/Open/CTR/Quality,
  clickable rows) or detail view (see interactions below) depending on
  `selectedId`.
- *Subject Line Lab*: "avg open rate by hook type" horizontal bar-row card, then
  a table (Subject/Hook type/Length in "N char"/Number Y-N/Open), clickable rows.
- *Retention*: 3-col stat grid (avg unsub, net subscribers, avg spam complaints)
  -> narrative callout card -> table (Date/Subject/Unsub/Flag, red "Above
  average" or green "Normal").
- Shared table pattern reused verbatim across tabs: white bg, `1px solid
  #E5E5E5` border, `10px` radius, `#fbfaf7` header row with uppercase monospace
  gray labels, `1px solid #F1F1EE` row dividers.

**Key interaction logic to reproduce:**
- Overview chart: evenly-spaced X per edition, independently-scaled Y axes for
  open rate (10-35%) and CTR (0.2-1.4%), solid orange polyline (open) + black
  dashed polyline (CTR), invisible per-point hover-target rects driving a
  vertical crosshair connector + two colored dots + a tooltip (subject line,
  clickable, US-formatted date, Open %/CTR %). Clicking the subject line
  navigates into Editions detail for that post.
- Lens buttons: editable only when `tab==='editions' && a specific edition is
  selected` — everywhere else the button group is visually dimmed
  (`opacity:0.45`) and click-disabled (`pointer-events:none`), double-guarded in
  the click handler itself. When editable, switching lens only changes the
  Tips/Suggestions copy (different framing per audience), never the underlying
  numbers.
- Edition detail: 2x2 stat grid (Open/CTR/Unsub/Quality, Quality as the gradient
  tile) on the left; right column is a poll bar chart (4 fixed categories, per-
  bar hover tooltip showing vote count, empty state if zero responses) sized to
  ~75% height and a comments panel sized to ~25% height via flex-grow ratios
  (3:1) — i.e. a vertical split, not horizontal. "Why this edition scored X%"
  renders each weighted component as a horizontal row of donut SVGs (progress
  arc via `stroke-dasharray`, score % centered in Fraunces bold, weight % in
  small mono text below it inside the same circle), followed by a narrative
  sentence and per-component raw-value/why detail list. A "too early to flag"
  banner conditionally replaces flagging copy for editions under 24h old.
- Subject Line Lab length column is literally `subject.length + " char"`
  (includes emoji in the count); all three entry points (chart tooltip,
  Editions list, Subject Lab rows) funnel into the same edition-detail view.
- US date formatting: `M/D` (charts/axis) or `M/D/YYYY` (tooltips/detail
  headers/tables), built by unary-plus-ing the ISO date parts to drop leading
  zeros.

**Other reusable patterns:** empty states are centered, small, muted-gray
sentences (no icon); badges/flags are plain colored text, not pill chips;
tooltips are dark (`#0D0D0D`/cream) floating divs; two card "weights" (white
bordered vs `#fbfaf7` unbordered-looking secondary); the gradient
(`135deg,#FF5500,#FFB800`) is reserved exclusively for the two Quality stat
tiles, always paired with black text; custom 8px scrollbar styling globally.

This report is the binding visual/interaction spec for every React component
built from here on, alongside the punch-list fixes already captured above.

## Proceeding to scaffold

Starting the Next.js (App Router, TypeScript, Tailwind) scaffold in this project
directory using the tokens above, while the Beehiiv API key and Neon connection
string are pending from the user.

## Build execution (single session, no further user input needed until review)

With the wireframe extraction done and scaffolding started, the rest of the build
proceeded end to end without further blocking questions. Summary, in order:

**Scaffold.** `create-next-app` doesn't allow uppercase/space package names, so it
was scaffolded into a temp dir (`mm-dashboard-tmp`) and moved up into this
directory (capital-letter path is fine for the project folder itself, just not the
npm package name, which was set to `marketing-monk-dashboard`). Stack: Next.js 16.2.12
(App Router, Turbopack), React 19.2.4, TypeScript, Tailwind v4, plus
`drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `tsx`, `dotenv`,
`server-only`.

**Design tokens.** Ported verbatim into `src/app/globals.css` as CSS custom
properties plus a Tailwind v4 `@theme inline` block (auto-generates utility
classes like `bg-orange`, `text-text-faint`, `font-serif` from the token names),
and Fraunces/Manrope/JetBrains Mono loaded via `next/font/google` in
`src/app/layout.tsx`, including the `color-scheme: light` fix from the original
wireframe session so nothing inherits browser dark-mode text color.

**Database schema** (`src/lib/db/schema.ts`, Drizzle + Postgres): `editions`
(one row per Beehiiv post, includes subject-line tagging columns and a
`data_source` flag distinguishing `beehiiv_live` from `synthetic_demo`),
`poll_tallies`, `top_links`, `promoted_links`, `comments` (all FK'd to
editions), and `publication_snapshots` (rolling publication-level stats
history). `src/lib/db/index.ts` connects via `drizzle-orm/neon-http`.
`drizzle.config.ts` supports running `db:generate` (schema -> SQL migration)
fully offline with no live DB connection required, only `db:push`/`db:studio`
need a real `DATABASE_URL`. Initial migration generated at
`drizzle/0000_lonely_thanos.sql`.

**Beehiiv REST client** (`src/lib/beehiiv/client.ts`). Rather than trust the old
scaffold's "these analytics endpoints may not have a public REST equivalent,
verify or fall back to MCP" notes, every endpoint was independently re-verified
live against `developers.beehiiv.com` during this build (that site is a
JS-rendered doc app; plain `WebFetch` returned useless 404 shells until the
`/*.md` per-page and `/llms-full.txt` index conventions were discovered, which
return real markdown). Result: every endpoint the app needs turned out to have a
confirmed public REST v2 path, contrary to the old scaffold's assumption:

- `GET /publications/:id` (`expand=stats`) — subscriber counts, avg open/click
  rate.
- `GET /publications/:id/posts` and `GET /publications/:id/posts/:postId`
  (`expand=stats`) — per-post opens/clicks/unsubscribes/spam **and** a
  per-URL click breakdown (`clicks[]`), which replaces the old "list post
  clicks, needs MCP" placeholder entirely — it's just part of the post stats
  payload, not a separate endpoint.
- `GET /publications/:id/posts/aggregate_stats` — aggregate stats across posts.
- `GET /publications/:id/engagements` — day-by-day opens/clicks trend.
- `GET /publications/:id/polls` and `GET /publications/:id/polls/:pollId/responses`
  (filterable by `post_id`, expandable to include `post_id`/`post_title` on each
  response) — this directly resolves the old README's "poll tally needs to be
  automated, currently hand-tallied for one edition" TODO. `computeEditionPollTally()`
  walks every page of a poll's responses filtered to one post and tallies real
  counts, no more manual `pcid`/click-log matching needed.
- **Not found:** no public REST endpoint for post comments. Documented as a
  clearly-labeled stub (`listPostComments()` returns empty), not a guess —
  matches the old scaffold's own finding that comments were zero on every real
  edition checked anyway.

**Scoring logic**, ported into TypeScript from the *final, punch-list-fixed*
wireframe JS (not the earlier version in the old project skeleton — the two had
diverged): `src/lib/scoring/quality-score.ts` (`computeQualityScore`, weights
20/35/25/20 when a poll has responses, 0/43.75/31.25/25 redistributed when it
doesn't, matching the user's "depend less on poll response" instruction),
`src/lib/scoring/subject-line.ts` (hook-type classification — the wireframe's
hook types were hand-tagged per demo edition, so a real rule-based heuristic
classifier was written against `docs/PROJECT_SPEC.md`'s six categories, clearly
documented as a placeholder pending real NLP/LLM classification, same status as
voice compliance), and `src/lib/scoring/insights.ts` (per-edition audience tips
ported verbatim from the wireframe's `generateTips`; the Overview page's "Tips
for improving open rate/CTR" and Batch 1/Batch 2 feedback cards were *not*
copied verbatim since the wireframe's versions were hardcoded demo copy — these
were rewritten to be genuinely computed from whatever real editions are passed
in, e.g. naming the actual lowest-open edition and its actual weakest quality
component, real hook-type CTR averages, real quality-vs-CTR correlation split by
window median).

**Synthetic demo dataset** (`src/lib/synthetic-data.ts`): reused the 16-edition
dataset crafted during the original wireframe design session verbatim (dates,
subjects, opens/CTR/unsub, poll splits, comments) rather than re-inventing one,
since it was already built to the "richer 30-day placeholder data" spec with
deliberate variety. This is what seeds the public deployment and what the app
falls back to automatically in local dev when `DATABASE_URL` isn't set yet.

**Data-access layer** (`src/lib/data/editions.ts`): transparently serves the
synthetic dataset when `DATABASE_URL` is unset, or real Drizzle/Neon reads when
it is, with no other code in the app needing to know which. This is what let the
UI be built and verified in a real browser before Neon credentials existed.

**Pages** (Next.js App Router, real routes rather than the wireframe's
client-side single-page state machine): `/overview`, `/editions`,
`/editions/[id]`, `/subject-line-lab`, `/retention`, under a
`(dashboard)` route group with a shared navbar. The audience lens
(Blended/Batch 1/Batch 2) is a `?audience=` URL search param rather than global
client state, shareable and only meaningful on the edition-detail route; the
navbar visually dims and disables the lens buttons (`pointer-events: none`)
everywhere else, exactly matching the wireframe's `lensEditable` behavior.
Interactive pieces (`OverviewChart`, `PollChart`) are client components with
hover-driven tooltips/crosshairs built as inline SVG, ported faithfully from the
wireframe's chart math (independently-scaled dual Y axes, invisible per-point
hover targets) but with dynamically-computed axis ranges instead of the
wireframe's hardcoded 10-35%/0.2-1.4% bounds, so it holds up against real data
outside that specific sample's range. `QualityDonuts` renders the weighted
quality-score breakdown as horizontal donut SVGs exactly per the punch list
(weight + score centered, explanation below).

**Verification in a real browser** (not just type-checking): ran `npm run dev`
via the Browser pane's preview tools and walked every tab — Overview chart
hover/tooltip/click-through, Editions list -> detail navigation, the poll bar
chart and quality donuts on an edition with a real synthetic poll split, the
audience-lens tips changing correctly between blended/batch1/batch2, and the
Subject Line Lab's hook-type bar chart and char-count column. Caught and fixed
one real bug this way: the "Tips for improving CTR" card's hook-type comparison
sentence was built from a list sorted by *open rate* while describing *click
rate* numbers, so the "ahead of" claim could be directionally backwards —
fixed by sorting that specific comparison by `avgCtr` instead. (Note: the
Browser pane's `screenshot` tool rendered visually squashed/overlapping layouts
at every viewport size tried in this sandbox, but `getBoundingClientRect()`
measurements taken directly against the live DOM confirmed the actual layout,
spacing, and navbar element positions were all correct — treated as a tool
rendering quirk, not an app bug, and cross-checked via `get_page_text` /
`read_page` for content correctness throughout.)

**Password gate.** Built as `src/proxy.ts` (Next.js 16 renamed the
`middleware.ts` convention to `proxy.ts` mid-cycle; built directly against the
current convention rather than the deprecated one). Single `SITE_PASSWORD` env
var; the cookie stores a SHA-256 token derived from the password (Web Crypto
API, edge-runtime-safe), never the password itself. `/login` page posts to
`/api/site-auth`, which verifies the password and sets an httpOnly cookie. Gate
is a no-op when `SITE_PASSWORD` is unset (local dev). Verified end-to-end with a
temporary test password: wrong password rejected, correct password set the
cookie and unlocked `/overview` (confirmed via a direct `fetch()` call in the
browser console after the Browser pane's simulated click/Enter-key input
proved unreliable for submitting this particular form in this sandbox — the
route logic itself was confirmed working, not just assumed). Test password was
then cleared back out of `.env.local`.

**Seed scripts.** `scripts/seed-synthetic.ts` inserts the synthetic dataset
into whatever `DATABASE_URL` currently points to (intended for the public
demo Neon branch). `scripts/seed-from-beehiiv.ts` syncs real data for the
trailing 30 days from the live Beehiiv client into whatever `DATABASE_URL`
currently points to (intended for a private, local-only Neon branch): finds
the recurring feedback poll by matching "helpful" in its question text, computes
real per-edition poll tallies, splits per-URL clicks into top links vs.
promoted/sponsored (via the `magic.beehiiv.com`/social/audio exclusion rules
from `docs/PROJECT_SPEC.md`), and upserts editions so repeated syncs don't
duplicate data. Neither script has been run yet — both need the user's real
Neon connection string and (for the Beehiiv one) API key.

**Repo cleanup for the portfolio.** Removed `create-next-app`'s default SVG
placeholder assets and its auto-generated `AGENTS.md`/`CLAUDE.md` boilerplate
(unrelated to this project). Replaced the default README with a real one
covering the stack, what's real vs. placeholder (stated plainly, matching the
project's own "never fabricate a number" rule turned inward on the build
itself), local dev, the two-Neon-branch data strategy, and deploy steps.

## Local commit

Made one local commit (`08ce1d9`, "Build Marketing Monk content analysis
dashboard on Next.js + Neon + Beehiiv") covering the full build above. Git
had no configured user identity on this machine, so it auto-filled one from
the OS username/hostname (`Reddy Mohith <reddymohith@Mac.lan>`) — flagged to
the user before pushing anywhere public, since that email isn't real. Nothing
was pushed to GitHub yet; creating/pushing to a public remote is treated as an
action needing explicit confirmation, not something to do unprompted.

## Outstanding, waiting on the user

1. ~~Neon connection string~~ — provided and wired up, see below.
2. Beehiiv API key (for `scripts/seed-from-beehiiv.ts`) — still needed, see
   below.
3. ~~Confirmation to create the public GitHub repo~~ — confirmed (name
   "MM Content Analysis Dashboard", public, GitHub username "Reddymohithh"),
   blocked on tooling, see below.
4. A real `SITE_PASSWORD` for the deployed gate (currently unset).

## Round 2: real Neon connected, GitHub push blocked on missing tooling

The user provided a Neon connection string, a GitHub repo name/visibility/
username, and asked to use their GitHub noreply email for commits.

**Neon wired up and verified live.** `DATABASE_URL` set in `.env.local`.
`npm run db:push` applied the schema to the real database (Drizzle's Neon
websocket driver, took a few seconds to connect but succeeded). `npm run
seed:synthetic` seeded all 16 demo editions into it successfully.

**Bug found and fixed during this step:** both seed scripts called
`config({ path: ".env.local" })` from the `dotenv` package *after* their own
`import { db } from "../src/lib/db"` line in source order, but ES module
`import` statements are hoisted and execute before any other top-level code
in the file, so `.env.local` was never actually loaded before `lib/db`
read `process.env.DATABASE_URL` and threw. Fixed by dropping the in-script
`dotenv` calls entirely and using Node's native `--env-file=.env.local` flag
on the `tsx` invocation in `package.json` instead, which loads the file
before the module graph executes at all. Re-verified both `db:push` and
`seed:synthetic` end to end after the fix, and re-confirmed the app reads
correctly from the real Neon database (not the synthetic in-memory fallback)
via the browser preview.

**Beehiiv API key: not actually provided yet.** The user's message labeled a
value "Beehiiv API" but it was `pub_a5a04dd9-d851-4864-bf87-7a105c812c27` —
that's the **publication ID**, already known and already set as
`BEEHIIV_PUBLICATION_ID` since the start of this build, not an API key. Real
API keys from Beehiiv (Settings -> Integrations -> API) look different and
are a separate value. Flagged back to the user rather than guessing or
silently treating the publication ID as a working key; `scripts/seed-from-
beehiiv.ts` has not been run.

**Git identity fixed before any push.** Set `git config user.name
"Reddymohithh"` and `user.email "Reddymohithh@users.noreply.github.com"`
locally for this repo only (not global), then `git commit --amend
--reset-author` on the sole existing local commit, since nothing had been
pushed anywhere yet and there was no reason to carry a machine-generated
placeholder identity into the first commit of a portfolio repo. Noted to the
user that GitHub's exact noreply-email format depends on their account
settings (Settings -> Emails) and may need correcting if this guessed format
doesn't attribute correctly once pushed.

**GitHub repo creation and push: blocked on missing tooling, not on
permission.** Neither the `gh` CLI nor Homebrew is installed in this
environment, and creating a GitHub repo requires either `gh` (authenticated)
or a personal access token against the GitHub API — the user hasn't been
asked for a token, and browser-based `gh auth login` isn't something this
session can complete unattended anyway. Rather than ask for a GitHub PAT
unprompted, the plan is: the user creates the empty repo themselves via
GitHub's web UI (fastest path, no local tooling needed), then this session
adds it as the `origin` remote and pushes the existing local commits.

## Round 3: real Beehiiv key verified, second Neon branch, GitHub pushed

The user pasted what they again labeled as the API key but which was still
the publication ID minus its `pub_` prefix; flagged again with exact
navigation steps (Beehiiv -> workspace/profile -> Settings -> Integrations ->
API -> Generate/copy API Key). The next message contained a real-looking key.
Verified it directly with a throwaway `fetch` against
`GET /publications/:id?expand[]=stats` (no DB writes) before trusting it:
returned real live data (Marketing Monk, Moonshot Technologies,
56,818 active subscribers, 30.97% avg open rate) with a 200, confirmed valid.
Temp test file deleted immediately after.

**Data-separation problem caught before writing anything.** The single Neon
database connected so far already held the seeded synthetic demo dataset and
was implicitly "the" database — running the real-data sync into it would have
mixed real Marketing Monk numbers into what's supposed to be the public
deployment's synthetic-only data source, directly against the earlier
"public vs. real data split" decision. Flagged this to the user before
proceeding rather than after.

**Second Neon branch created.** Renamed the mental model explicitly: the
existing branch is `production` (synthetic demo data, backs the public Vercel
deployment via its own env vars, never touched by the Beehiiv sync); a new
`local-real` branch was created off it, using Neon's "branch schema only"
option (copies table structure without the 16 synthetic rows) and with
auto-delete changed from the console's 1-day default to Never, since this is
a persistent local-use branch, not a throwaway. `.env.local`'s `DATABASE_URL`
now points at `local-real`; the `production` connection string is kept as a
comment in that same file for reference when setting Vercel's env vars later
(the file is git-ignored either way). `db:push` against `local-real` reported
"No changes detected", confirming the branch-schema-only copy already matched.

**Real sync running.** `npm run seed:beehiiv` kicked off against `local-real`
with the verified key. It walks every recent post's stats plus, per post,
every page of the recurring feedback poll's responses filtered to that post
(`computeEditionPollTally`), so it runs considerably longer than the
synthetic seed — moved to a background shell rather than blocking on it.

**GitHub repo pushed.** User created `MM-Content-Analysis-Dashboard` (public)
under GitHub username `reddymohithh` via the web UI. Added it as the `origin`
remote, renamed the local branch to `main`, and pushed both commits
(`git push -u origin main`) — succeeded on the first attempt, reusing a
GitHub credential already cached in the machine's Keychain from an earlier,
unrelated project (explained to the user when they asked why no new token
was needed, and the tradeoffs of reusing one token across projects vs.
minting a scoped one per project — left as their call, not acted on further
this session).

**Real sync verified, one real bug found and fixed.** First `seed:beehiiv`
run against `local-real` completed (31 editions, real per-edition poll
tallies via the "Curated Content Feedback" poll) but the browser check
immediately after showed absurd numbers: 2893% open rate, 79% CTR. Root
cause: Beehiiv's post-stats `open_rate`/`click_rate` fields are already
plain percentages (confirmed by inspecting a raw API response directly,
e.g. `"open_rate": 46.15` meaning 46.15%), but the script treated them as
0-1 fractions and multiplied by 100, inflating everything roughly 100x.
Fixed in `scripts/seed-from-beehiiv.ts` (removed the erroneous
multiplication, added a comment recording the confirmed field convention so
it doesn't get "fixed" back incorrectly later) and re-ran the sync
(`onConflictDoUpdate` made this a clean idempotent re-sync, no duplicate
rows). Re-verified in the browser: 28.94% open rate / 0.79% CTR trailing
averages, individual editions in the expected 17-33% open / 0.6-1.3% CTR
range, a real edition detail page (Coca-Cola rebrand) showing a real 4-
response poll tally, real ranked top links with real click counts, and an
edition with only 13 recipients (evidently a test/low-volume send) correctly
showing 0%/0% rather than erroring — all against the live Beehiiv-sourced
`local-real` Neon branch, not synthetic data.

## Round 4: git-credential question, Vercel import, and a real build bug

While the corrected `seed:beehiiv` ran in the background, the user asked why
pushing to the new repo hadn't required creating a new GitHub token, given
they'd previously made separate tokens per project ("digital library push",
"mba-prep push"). Explained that GitHub tokens are scoped by *permission*
(`repo` = access to everything owned by the account), not by project, and
that the push had silently reused whichever token was already cached in the
Mac's Keychain from an earlier project. Walked through the real trade-offs
of that (shared blast radius if the token leaks, shared expiration date,
shared revocation) without recommending a specific action. The user then
asked whether they should create a dedicated token for this repo; suggested
a fine-grained token scoped to just this repository as the better version of
that idea (true per-project isolation, unlike another classic token), gave
the exact GitHub steps, and left it as the user's call — not acted on further
this session, no new token was created.

**Vercel import didn't show the new repo.** The user's Vercel "Import Git
Repository" screen only listed an older project (`digital-library-dashboard`)
— Vercel's GitHub App only sees repos it's been explicitly granted access to,
and a newly created repo isn't added automatically. Directed the user to
"Adjust GitHub App Permissions" and grant access to
`MM-Content-Analysis-Dashboard` specifically (or all repos), after which the
import screen picked it up.

**SITE_PASSWORD chosen, deliberately not logged here.** The user picked a
password for the deployed gate. Recorded that a password was set and where
(Vercel env vars, `.env.local`), but not committed its literal value into
this file — `BUILD_LOG.md` is pushed to the public repo, so writing the real
gate password into it would defeat the entire point of having a gate. This is
one place the "log everything" instruction is deliberately overridden by not
publishing a live secret to a public file; the value itself lives only in
Vercel's dashboard and the user's local `.env.local`.

**Vercel build failed: a real, previously-undetected bug.** With the repo
importable and all three env vars set (`DATABASE_URL` pointed at the
`production`/synthetic branch, `SITE_PASSWORD`, `BEEHIIV_PUBLICATION_ID`),
the Vercel build failed with `NeonDbError: Error connecting to database:
TypeError: Cannot convert argument to a ByteString`, thrown while
prerendering `/editions`. Root cause: Next.js's App Router statically
prerenders any page that doesn't use a dynamic API at build time by default,
and none of `/overview`, `/editions`, `/editions/[id]`, `/subject-line-lab`,
or `/retention` used one — so all five were being data-fetched from Neon
*during the Vercel build step itself* (confirmed locally: the build's route
table showed `○ Static` for all of them, a detail missed during local
verification earlier since local builds had a working `DATABASE_URL`
available and never surfaced this). A build server failing to reach the
database, or an env var not yet fully propagated to that specific build
phase, is a real failure mode Vercel's build environment can hit that a
normal request-time serverless function wouldn't.

Fixed by adding `export const dynamic = "force-dynamic"` to all five pages,
so they render fresh from the database on every request instead of once at
build time — the architecturally correct choice regardless of the bug, since
edition data changes independently of deploys and shouldn't be cached at the
page level anyway. Verified locally two ways: the build's route table now
shows `ƒ Dynamic` for all five, and a full `npm run build` was run with
`.env.local` moved aside entirely (zero DB-related env vars present at all)
to directly simulate Vercel's build conditions — it still compiled and
succeeded, proving the build no longer touches the database under any
circumstance. Pushed to GitHub; Vercel redeploys automatically on push to
`main`.

**Vercel runtime error: a corrupted env var, not a code bug.** Even with the
force-dynamic fix deployed, `/overview` 500'd in production. Server-side
error digging (browser console redacts server errors in production, so
walked the user through Vercel's Logs UI, then a full JSON log export)
surfaced the real cause: `TypeError: Cannot convert argument to a ByteString
because the character at index 170 has a value of 8212 which is greater
than 255` — Unicode 8212 is an em dash (—). Somewhere in copying the
`production` branch's connection string into Vercel's env var field, a
hyphen had been typographically substituted into an em dash, which Neon's
HTTP driver can't send in a request header. Not a code issue; fixed by
having the user delete and re-add the env var using Neon's own copy-icon
button as the source (rather than manually selecting/copying text, which is
where the substitution most likely happened) and redeploying.

## Round 5: design polish, page by page — Overview

The user identified four buckets of remaining work: page design/architecture,
Beehiiv data fetching, LLM-based content analysis, and new features — and
asked to go through them one at a time, page by page, starting with
Overview's design. Their first message referenced two screenshots that
didn't actually attach; flagged this and proceeded with the unambiguous
parts of the request while waiting, then the user re-sent both images in a
follow-up message that arrived mid-turn.

Screenshot 1 confirmed the navbar's intended look (which mostly already
matched: dark bar, serif wordmark, orange active-tab pill). Screenshot 2 was
Beehiiv's own "Subscriber growth" chart — gradient-fill bars with a dashed
overlaid line for a second metric, a clean light tooltip card (date header,
colored-dot metric rows, a divider, then a post title/time row), and minimal
start/end-only date labels on the x-axis.

Changes made, all on the Overview page and shared Navbar:

- Header logo: replaced the "Marketing Monk." text wordmark with the real
  Beehiiv-hosted logo image (`next/image`, required adding
  `media.beehiiv.com` to `next.config.ts`'s `images.remotePatterns`).
- Nav tabs: inactive tabs set to bold + an ash gray (`text-muted`); active
  tab keeps its orange pill with black text (already was).
- Removed the redundant "Overview" title and "Trailing window · N editions ·
  data source" caption line — the active navbar tab already communicates
  which page you're on.
- Rebuilt the Overview trend chart from two overlapping line polylines
  (the user's core complaint: "very confusing") into gradient-fill bars for
  open rate (mirroring Beehiiv's bar treatment) with CTR as a dotted overlay
  line with visible point markers on every data point, not just on hover.
  Simplified the x-axis to start/end date labels only. Rebuilt the tooltip
  as a light card matching the reference: date, then Open rate and CTR as
  colored-dot rows with right-aligned values, a divider, then the post
  subject line as plain text — no click-through link this time (the user
  explicitly said not to link to the edition here anymore) and no extra
  fields, matching "post title, open rate, and CTR would be enough."
  Removed the "Hover a date..." helper caption line per instruction.

**Real bug found and fixed during verification, not by the user.** After
making the nav tabs "ash gray," they rendered as rust-orange instead —
`getComputedStyle` confirmed the color was `rgb(184, 66, 10)`, exactly
`--color-link`, the global anchor-tag color rule. Root cause: that rule
(`a { color: var(--color-link) }` in `globals.css`) was declared outside any
Tailwind cascade layer, and unlayered CSS always wins over layered CSS
(where Tailwind puts its own utility classes) regardless of specificity —
so no `text-*` utility on any `<Link>` anywhere in the app had ever actually
been able to override the default link color, a latent bug that simply
hadn't been visually obvious until the tabs were deliberately changed to a
color that clashed with it. Fixed by wrapping the rule in `@layer base`,
which is the idiomatic Tailwind v4 fix — verified both directions
afterward: the nav tabs now correctly show ash gray
(`getComputedStyle` → `rgb(107, 114, 128)`, matching `text-muted`), and the
edition detail page's "Top links clicked" list (which relies on that same
default, having no explicit color class of its own) still correctly shows
the rust link color, confirming the fix didn't break the one place that
default was actually wanted.

Verified the full page in the browser after all changes (logo, tab colors,
removed header lines, new chart with working hover tooltip) and ran a full
production build before committing.

## Round 6: Overview follow-up tweaks, and a push permission problem

A `git push` after the previous commit failed with a 403 ("Permission ...
denied to reddymohithh") — the macOS Keychain's cached GitHub credential had
been silently replaced (timestamped that same session) with the fine-grained
token from the earlier tangent, which apparently doesn't have working push
access to this repo yet. Asked the user whether they'd finished generating
and using that token; they redirected instead: keep working locally and
commit as normal, sort out the push once, later, in bulk. Adopted that as
the working pattern going forward — every change below is committed locally
immediately, push deferred.

Four more Overview-page tweaks from the user, based on the deployed
Vercel site:

- Chart tooltip: subject line was wrapping to two lines and the tooltip felt
  oversized. Narrowed it (220px -> 172px, tighter padding/spacing) and made
  the subject line `whitespace-nowrap overflow-hidden text-ellipsis` with a
  `title` attribute for the full text on native hover — verified via a
  dispatched `mouseenter` on the chart's hover-target rects plus
  `getComputedStyle`/`scrollWidth` checks that it now renders as a single,
  correctly truncating line (172px tooltip, 217px of text content, single
  23px-tall line).
- Chart header: "Open rate vs CTR, day by day" -> "OR vs CTR" (removed the
  redundant last-vs-day framing and abbreviated per the user's exact wording).
- Navbar logo: the Beehiiv-hosted logo image added last round wasn't
  rendering for the user ("not visible now") — reverted to the original text
  wordmark, now recolored to the brand's amber/yellow
  (`--color-amber`/`text-amber`) instead of cream, per instruction. Left
  `media.beehiiv.com` in `next.config.ts`'s image remote patterns in case a
  logo image comes back later.
- Removed the small caption line under all four Overview stat cards
  ("active", "trailing window average", "all links, every section",
  "engagement, retention, voice, poll") — just the label and number now.

Verified in the browser (screenshot + live DOM checks) and ran a full
production build before committing.

## Round 7: global fixes, Editions header, quality-box redesign

Three requests: two global (navbar dot, a Beehiiv data-correctness rule),
plus Editions-page and edition-detail tweaks.

**Global — navbar dot.** Removed the orange "." after "Marketing Monk" in
the navbar wordmark, per instruction.

**Global — email+web-only filter, a real data-correctness fix.** The user
pointed out that only posts published on *both* email and web should count
as an edition — not web-only or email-only posts. Checked Beehiiv's raw post
payload directly rather than assume a field name, and found a `platform`
field right on the post object itself (`"both"`, `"web"`, or `"email"` — not
something inferred from stats). This also retroactively explained an
earlier oddity: the "How AI is Affecting Behavioral Health SEO in 2026"
edition showing 0%/0% wasn't a low-volume test send as assumed at the time —
it was a **web-only** post with no email stats at all, so `open_rate`/
`click_rate` were meaningless zeros. Added `platform` to the `BeehiivPost`
type and filtered `scripts/seed-from-beehiiv.ts`'s trailing-window posts to
`platform === "both"` before syncing anything. Also added cleanup logic to
the same script: after computing the current run's kept-post-id set, delete
any previously-synced `beehiiv_live` edition inside the trailing window that
isn't in that set, so a post that used to qualify (or was synced before this
filter existed) gets removed on the next sync rather than lingering stale.
Re-ran `seed:beehiiv` against `local-real` to apply this to the already-
synced data.

**Editions list page.** Removed the "Editions / N editions in the trailing
window, newest first" header block, matching the same reasoning as
Overview's earlier header removal.

**Edition detail — quality section.** Two changes: the heading now reads
"Why this edition scored N% content quality" (was just "...N%"), and the
four quality-component donuts were restructured from "four donuts in a row,
then all four explanations pooled together below" into four self-contained
boxes — each one a bordered card holding its own donut directly beside its
own name/raw-value/benchmark/why text, in a 2x2 grid. Verified in the
browser: the Coca-Cola edition's quality section now shows each of Reader
satisfaction, Engagement depth, Retention signal, and Writing/voice
compliance as its own card.

Ran a full production build; committed locally (push still deferred per the
user's "do everything locally, push once at the end" instruction from
Round 6).

## Round 8: edition-detail layout — vertical boxes, Notices, merged links

Four more edition-detail-page requests:

1. **Quality boxes vertical, not a 2x2 grid.** Changed `QualityDonuts`
   from `grid-cols-2` to a single-column stack (`flex flex-col`), so the
   four component boxes (Reader satisfaction, Engagement depth, Retention
   signal, Writing/voice compliance) now run top to bottom.

2. **No internal dev-notes in user-facing copy — a real mistake, not a
   preference.** The voice-compliance box was literally rendering
   "(placeholder pending real text analysis, see BUILD_LOG.md)" to end
   users — a comment written for *this build log*, that had leaked into
   product copy. Stripped that clause from `quality-score.ts`'s raw text,
   added a `voiceComputed` flag to `QualityScoreResult`, and built a new
   **Notices** section on the edition detail page: an orange-bordered card
   (reusing the same warning-bg token as the "too early to flag" banner)
   that lists this kind of caveat instead of burying it inline. Currently
   surfaces the voice-compliance placeholder note, and — generically, for
   future cases — a poll's `note` field when a poll was recorded but not
   exactly tallied.

3. **Merged Top links + Promoted lines into one list**, in one card under
   one header ("Top links clicked"). Organic links still render as real
   `<a>` tags (clickable, rust link color); promoted/sponsored links render
   as plain, non-clickable rows with a small "Promoted" tag. First
   implementation put that tag inside the row's `truncate`-ellipsis text
   span, where it silently never rendered for any promoted line with a
   description long enough to truncate (i.e. almost always) — caught this
   during verification, not told by the user, by actually scrolling to a
   real edition with sponsored placements rather than trusting the code
   read-through. Fixed by moving the "Promoted" tag out to the row's
   flex-shrink-0 right-hand cluster next to the click count, where it can't
   get truncated away.

4. **Comments moved into the slot the old "Promoted lines" card used to
   occupy** (bottom-right, next to the merged links list), with the new
   Notices card stacked below it in that same column. The poll chart, no
   longer sharing its box with Comments, now fills that entire top-right
   card alone.

Noted but not changed (out of scope for this request): several real
editions show a long run of near-duplicate "Sponsored placement" rows, one
per `magic.beehiiv.com` redirect URL, since Beehiiv's per-link click data
treats each subscriber-specific redirect as a distinct URL. Pre-existing
behavior, not a regression from this merge — flagged to the user rather than
silently changed.

Verified every change in the browser against real synced data (including an
edition with actual sponsored placements, specifically to catch the
truncation bug above) and ran a full production build before committing.

## Round 9: poll chart color, drop promoted links from the display

Two quick edition-detail tweaks:

- Poll bar chart: all four categories (Loved it / Pretty useful / Okay / Not
  helpful) now render in the same neutral gray (`--color-text-muted`)
  instead of the previous four-color scheme (orange/amber/tan/faint).
- Removed promoted/sponsored links from the merged link list entirely —
  the "Top links clicked" card now only ever shows organic links. Left the
  underlying `promotedLinks` data/table/sync untouched (still fetched and
  stored), since the instruction was about what displays on this page, not
  about ripping out the data model — easy to bring back into view later if
  wanted.

Verified both in the browser (an edition with real sponsored placements
confirmed they no longer appear at all) and ran a full production build
before committing.

A message arrived mid-turn clarifying the earlier "vertical boxes" request
from Round 8: that one had stacked the four quality boxes vertically (one
per row) but each box still laid its donut and explanation out
side-by-side internally. The user meant the donut-then-explanation
relationship itself to be vertical too — donut on top, explanation below,
within each box. Fixed by changing that inner container from `flex` (row)
to `flex flex-col items-start` in `QualityDonuts.tsx`. Verified in the
browser and rebuilt before committing.

Two more quick follow-ups landed in quick succession right after: the user
clarified that "vertical" was about each box's *internal* donut/explanation
relationship, not the outer arrangement of the four boxes — those should be
side by side after all. Changed the outer wrapper from `flex flex-col` back
to `grid grid-cols-4`, keeping each individual box's internal `flex-col`
layout from the previous fix. Then asked for the donut itself bigger and
centered: bumped the SVG from 84px to 108px and changed each box's
alignment from `items-start` to `items-center` (the explanation text below
stays full-width and left-aligned regardless, since it has an explicit
`w-full`). Verified in the browser after each change and ran a full
production build before committing.

## Round 10: Subject Line Lab

Three changes, one of them against a reference screenshot:

- Removed the "Subject Line Lab / Every real subject line..." header block,
  same reasoning as every other page's header removal this session.
- Table rows previously wrapped every cell (Hook type, Length, Number, Open)
  in its own `<Link>` to the edition, all five cells independently
  clickable. Only the subject-line cell should be — the other four are now
  plain `<td>` text with no link, no href, not clickable.
- Rebuilt the "Average open rate by hook type" card to match the provided
  screenshot's layout: previously label/bar/value sat side by side in one
  row with the bar squeezed into a fixed middle column; now each row is
  label-and-value on one line (`justify-between`) with the bar spanning the
  *full* card width on the line below it, and the card title changed from a
  small uppercase mono eyebrow to an actual serif heading, matching the
  reference.

Verified in the browser (screenshot matched against the reference, and
`read_page`'s interactive-element list confirmed only the subject-line link
appears per row, not four extra ones) and ran a full production build
before committing.

## Round 11: search and filters on Editions and Subject Line Lab

The user asked for search + filters "across Editions, Subject Line Lab, and
Retention" but only specified criteria for the first two (Editions: subject
search, date-range/open-rate/CTR/quality filters; Subject Line Lab: subject
search, hook-type/length/open-rate filters) — Retention wasn't detailed, so
built the two specified pages now and left Retention for a follow-up once
its filter criteria are given, rather than guessing.

**Architecture choice:** client-side filtering over a fully server-fetched
dataset, not URL-search-param-driven server filtering. With ~30-40 editions
in the trailing window, there's no pagination/performance case for
round-tripping to the server per keystroke, and instant, no-reload filtering
is meaningfully better UX for a search box than a debounced server request.
Each page's Server Component still does all the data fetching and
score/label computation (quality score, hook-type label) as before, then
hands a small serializable array of rows to a new Client Component
(`EditionsExplorer`, `SubjectLineLabExplorer`) that owns the search/filter
state via `useState` + `useMemo`.

**Editions page** (`EditionsExplorer.tsx`): search box (subject substring
match, case-insensitive) plus four filters — date range (native `<input
type="date">` pair), open rate range, CTR range, content quality range (all
min/max number-input pairs). A "N of M editions" counter and a "Clear
filters" link (only shown when a filter is active) sit above the table. Row
click-through behavior unchanged from before (every cell in a row links to
the edition, matching this page's existing pattern — only Subject Line Lab
was changed to single-column-clickable, not Editions).

**Subject Line Lab page** (`SubjectLineLabExplorer.tsx`): same search box,
plus hook-type filter as a row of toggleable pill buttons (multi-select,
empty selection = show all types) rather than a dropdown, since there are
only six hook types and toggle chips make active filters visually obvious
at a glance. Length and open-rate range filters alongside it. The "Average
open rate by hook type" summary card above stays fixed to the full,
unfiltered dataset (a window-level aggregate, not something that should
shift as someone searches/filters the row-level table below it) — only the
table itself responds to search/filters, matching last round's
single-column-clickable behavior.

Verified interactively in the browser rather than just reading the code
back: typed "Reddit" into Editions' search (correctly narrowed 38 -> 2,
both real Reddit-related subject lines), set content-quality min to 85
(narrowed to 7, every row actually >=85%, "Clear filters" appeared), and
toggled the "Name-drop" hook-type chip on Subject Line Lab (narrowed to 8
rows, all tagged Name-drop, matching the "(8)" count already shown in the
aggregate card above). Ran a full production build before committing.

## Round 12: Retention search + single-column click-through

The user came back with Retention's criteria: just a subject-line search
(no range/date filters this time, unlike Editions), and the same
click-through change already made to Subject Line Lab and the merged
edition-detail links list — only the subject cell should navigate to the
edition, Date/Unsub/Flag now plain non-interactive text.

Built `RetentionExplorer.tsx` following the same client-component pattern as
the previous round (search state + `useMemo` filter over a server-fetched
row array), intentionally simpler than `EditionsExplorer`/
`SubjectLineLabExplorer` since only search was asked for here — no
speculative extra filter UI added.

Verified in the browser: `read_page`'s interactive-element list showed only
subject-line links (Date/Unsub/Flag cells absent from it entirely, not just
visually unstyled), and a dispatched `input` event on the search box
narrowed 38 -> 2 editions matching "Reddit," both genuinely
Reddit-related subject lines. Ran a full production build before
committing.

## Round 13: hook-type filter, chips -> dropdown

The user flagged a forward-looking concern with the hook-type toggle chips
from Round 11: they don't expect to stay locked to the current six hook
types, and each new one added over time would grow the chip row and clog up
the layout. Swapped it for a `<select>` dropdown ("All hook types" plus one
option per type) — scales to any number of categories without changing the
UI's footprint, at the cost of single-select instead of multi-select
(judged an acceptable trade given the actual complaint was about visual
clutter, not needing to filter by multiple hook types at once). Folded it
into the same row as the Length/Open rate range filters (`grid-cols-3`)
instead of its own full-width section above them, now that it's compact
enough to sit inline.

Verified via direct `<select>` value/`change`-event dispatch (native select
interaction doesn't reliably drive through simulated clicks) that choosing
"Name-drop" narrows 38 -> 8 rows, matching the "(8)" count already shown in
the aggregate card above. Ran a full production build before committing.

## Round 14: cap content width app-wide

The user sent an annotated screenshot (freehand red brackets on both edges
of the Overview chart) taken on a wide monitor, showing the page content
stretching edge to edge with no max-width — the chart's 38 bars spread
across nearly 2000px, and asked to trim that down to "this exact space,"
leaving the navbar untouched.

The edition detail page already had its own `mx-auto max-w-[1120px]`
wrapper (added back when it was originally built), but no other page did —
Overview, Editions, Subject Line Lab, and Retention all just used the
layout's flat `px-8` padding, so they stretched to fill whatever the
viewport was. Fixed at the shared layout level instead of per page: added
`mx-auto w-full max-w-[1120px]` around `{children}` in
`(dashboard)/layout.tsx`'s scroll container, below the navbar (which stays
outside that wrapper and still spans full width). Removed the now-redundant
per-page `max-w-[1120px]` wrapper from the edition detail page's own markup
since it's inherited from the shared layout now, avoiding a pointless
nested constraint.

Verified by resizing the browser viewport to 2000px wide and measuring the
actual rendered DOM: navbar `getBoundingClientRect().width` = 2000 (full
bleed, as intended), content wrapper width = 1120 (capped and centered, as
intended) on both Overview and Editions. Ran a full production build before
committing.

## Round 15: widen content back out

Immediate follow-up: another annotated screenshot, this time marking lines
much closer to the viewport edges than the 1120px cap from Round 14 landed
at — 1120px turned out too narrow once actually seen on the user's screen.
Increased the shared layout's `max-w-[1120px]` to `max-w-[1600px]`. Rather
than trying to reverse-engineer exact pixel coordinates from the annotated
screenshot (unreliable — no reliable way to know the physical-to-logical
pixel scaling of an image pasted from the user's own screen), verified the
result directly: resized the live browser to 2000px and measured the
rendered DOM, confirming content now renders at 1600px centered (200px
margin each side) versus the full viewport, a visibly wider but still
margined layout. Ran a full production build before committing.

The user reported no visible change and asked what the current px value
was. Diagnosed via `window.innerWidth` on the live tab: it was 733px at
that moment — far narrower than either the old 1120px or new 1600px cap, so
the content was already filling 100% of available width in both cases and
the change genuinely had no visible effect at that size. Explained this
(the cap only matters once the window exceeds it) and flagged the
mismatch with the earlier ~2000px-wide annotated screenshot, since the
pane's width isn't staying fixed between interactions. The user then gave a
direct value rather than another screenshot: bring 1600px down to 1400px.
Applied and verified the same way as the previous two rounds (live DOM
measurement at a 2000px test viewport: navbar 2000px, content 1400px). Ran
a full production build before committing.

## Round 16: dropdown arrow spacing

Small follow-up from an annotated screenshot pointing at the hook-type
select's native dropdown arrow sitting flush against the field's right
border. It was sharing the same `numberCls` padding as the plain number
inputs (`px-2.5` both sides), which doesn't leave enough room for a native
`<select>`'s built-in arrow icon. Gave it its own class with asymmetric
padding (`pl-2.5 pr-7`) instead of reusing the shared class, so the arrow
now sits with breathing room from the edge. Verified visually in the
browser and ran a full production build before committing.

## Round 17: content width 1400px -> 1300px

Another direct value from the user. Applied and verified the same way as
the last two width rounds (live DOM measurement at a 2000px test viewport:
navbar 2000px, content 1300px). Ran a full production build before
committing.

## Round 18: remove the width cap entirely

Another annotated screenshot, this time with the bracket marks sitting
almost flush against the viewport edges rather than a moderate margin —
the opposite direction from the last three rounds' narrowing (1600 -> 1400
-> 1300). Rather than guess another fixed pixel value from the annotation,
read it as "trim the cap down to just the container's own padding" and
removed the `max-w-[*]` constraint entirely, leaving only the layout's
existing `px-8` (32px) padding as the margin. Verified by DOM measurement
at a 2000px test viewport: content width 1936px, exactly 32px of margin on
each side, matching the thin margins in the annotation far more closely
than any of the fixed max-width values tried in Rounds 14-17. Ran a full
production build before committing.

## Round 19: the width cap was never really about raw pixels

The user corrected the direction from Round 18 immediately: removing the
cap wasn't the goal at all. The actual complaint, stated directly this
time, is that on a wide screen the table columns spread out so far that
there's excessive dead space between the left-aligned Subject text and the
right-aligned Open column — page margins were always the *mechanism* being
asked for toward that end, not an aesthetic preference for its own sake.
Restored `max-w-[1300px]` (the last value the user had explicitly
confirmed, before Round 18's misreading). Checked whether that alone fully
resolves the named symptom — at the current test viewport (872px, already
narrower than the cap) there's still a visible but fairly normal-looking
gap between Subject and Open, consistent with how left-aligned text next to
right-aligned numeric columns looks in most data tables, not the extreme
stretch seen at 2000px. Left it there rather than also restructuring
`DataTable`'s column-width behavior unprompted — flagged to the user that a
table-level fix (e.g. not stretching the Subject column to fill 100% of a
wide container) is available as a follow-up if the gap still bothers them
at their actual screen width, rather than silently changing more than what
was asked. Ran a full production build before committing.

## Round 20: revert the whole width thread

After six rounds of adjustment (14-19) chasing an exact width the user
seemingly could never quite confirm from annotated screenshots alone, the
answer was simpler: undo all of it. Rather than pick another guessed value,
restored both files to their exact state immediately before Round 14 via
`git checkout 01d0b3a -- "src/app/(dashboard)/layout.tsx"
"src/app/(dashboard)/editions/[id]/page.tsx"` — `01d0b3a` being the last
commit before "Cap content width app-wide" — putting the shared layout back
to no max-width wrapper at all, and the edition detail page back to owning
its own `mx-auto max-w-[1120px]` independently, exactly as it was before
this entire thread started. Verified via live DOM inspection that the
wrapper div's class is empty (no `max-w-*`) and content width simply equals
viewport width again. Ran a full production build before committing.

Takeaway for next time: when width/spacing feedback comes only as annotated
screenshots with no confirmed pixel value landing right after several
tries, it's worth stopping to ask for an exact number (or the user's actual
window width) rather than continuing to iterate blind — this thread went
six rounds before reverting to the pre-existing state turned out to be the
right call.

## Round 21: Retention header removal

Same header-removal pattern applied to every other page this session,
just reaching Retention last: removed the "Retention / Unsubscribe and
spam trend..." title and caption block. Verified via `get_page_text` that
the page now goes straight from the navbar into the stat cards, and ran a
full production build before committing.

## Round 22: a little more side margin, without reopening the width thread

Distinct from Rounds 14-20's fixed max-width saga: this time the ask was
just "move everything a little inward" — modest, uniform breathing room on
both sides, not a specific width target. Increased the layout's side
padding from `px-8` (32px) to `px-12` (48px), deliberately not
reintroducing a `max-w-*` cap, since that whole approach had just been
reverted at the user's request. Verified via computed-style check
(`paddingLeft`/`paddingRight` = 48px) and a screenshot. Ran a full
production build before committing.

## Round 23: Overview chart margins, date-field color match, lens buttons moved into edition detail

Three requests across three pages.

**Overview chart — a real bug, not a padding issue.** The user reported
large empty space on both sides of the OR vs CTR bars. Investigated rather
than just nudging padding numbers: the `<svg>` had `width="100%"` with a
fixed `viewBox="0 0 1120 240"` and no `preserveAspectRatio` override, so it
defaulted to `xMidYMid meet` — which locks the viewBox's aspect ratio
(1120:240) and letterboxes horizontally whenever the actual container is
wider than that ratio implies. As the page got wider over the last several
rounds, this letterboxing became the "empty space" the user was seeing; it
had been there since the chart was first built; it just wasn't visually
obvious back when the container was closer to 1120px itself. Fixed with
`preserveAspectRatio="none"`, letting the SVG stretch to fill its actual
container width. Verified with a screenshot: bars now run edge to edge.

**Editions date-range field color.** The `dd/mm/yyyy` date inputs and the
Min/Max number inputs shared one class with no explicit color, so the date
segments rendered in the default ink color while the Min/Max fields showed
their *placeholder* text in the browser's own default gray — visibly
different grays. Split into two classes: `numberCls` gets an explicit
`placeholder:text-text-faint` (real typed values stay ink-colored, only the
placeholder is faint), and a new `dateCls` sets the date input's base
`color` to `text-faint` directly, since native date inputs display
`dd/mm/yyyy` via the real `color` property, not a `::placeholder`
pseudo-element — there's no way to distinguish "empty" from "filled" state
for a date input via CSS alone, so a real selected date will also render in
the faint color, a reasonable tradeoff given the constraint. Verified via
`getComputedStyle` on both input types: date = `rgb(154, 146, 132)`
(`--color-text-faint`), matching the intent.

**Audience lens buttons moved out of the navbar into the edition detail
page, and made to actually affect the quality score.** Removed
Blended/Batch 1/Batch 2 entirely from `Navbar.tsx` (along with the
route-based locking/dimming logic, no longer needed once the buttons don't
live somewhere they could be clicked from the wrong page) and built a new
`AudienceLensButtons` client component, rendered directly inside the "Why
this edition scored X% content quality" card's header row, right-aligned
next to the heading on the same line. It reads/writes the same
`?audience=` URL param the page already used for the Tips section, so nav
away and back preserves nothing new architecturally — just relocated where
the control lives.

The more substantial part: the user explicitly asked that changing audience
affect *both* the Tips section (already audience-aware) *and* the quality
score explanation, which it didn't before — the numeric score and its "why"
text were audience-invariant. Added an optional `audience` field to
`computeQualityScore`'s input and threaded it through: the numeric score,
weights, and component scores stay exactly the same real numbers regardless
of audience (still blended, real data — not fabricated per-audience
numbers, consistent with how the audience lens has been described
throughout this project as an editorial reframing, not a data
segmentation), but the top-level narrative sentence and each component's
"why" text now render in practitioner-framed (Batch 1) or leadership-framed
(Batch 2) language when that lens is active, mirroring the tone already
established in `generateEditionTips`. Consolidated the `Audience` type to
live in `quality-score.ts` and re-exported it from `insights.ts` rather than
maintaining two duplicate definitions.

Hit a real debugging detour verifying this: clicking the relocated lens
buttons appeared to do nothing, and the console showed a `PageTitle is not
defined` error plus a syntax error at a line that didn't match the current
file — both stale leftovers from earlier mid-edit states in this same dev
server session (one from before Round 21 removed `PageTitle` from
Retention, one from a moment mid-edit this round when a `</Card>` tag got
dropped). Restarting the dev server and clearing `.next` didn't fix it
either — the same stale errors persisted with an identical error digest,
which turned out to be because the *browser tab* itself was stuck (its
HMR WebSocket had died and it was holding onto a crashed React error
overlay from a previous compile). A fresh tab against the same running
server loaded clean with no errors, confirming the code was fine and this
was a Browser-pane-tab-state issue, not an app bug. Re-verified the actual
feature there: clicking Batch 1 updated the URL to `?audience=batch1` and
both the quality narrative/why-text and the Tips section changed together,
confirming the fix worked correctly.

Ran a full production build and closed the stale tab before committing.

## Round 24: editorial content-quality scoring (new feature)

The user shared a real, detailed editorial rubric they'd been planning
separately: a "Global Newsletter Content Analysis Checklist" — 12 weighted
categories (Audience Relevance, Topic Selection, Editorial Value-Add,
Originality, Depth, Accuracy, Actionability, Readability, Narrative
Engagement, Curation Coherence, Voice/Brand Fit, Memorability), each scored
0-5, with an explicit rule that open rate/CTR/polls/unsub are *not* valid
content-quality signals. They asked how to take it forward.

**The core tension, stated plainly before building anything:** the existing
`computeQualityScore` engagement-metric score is built from exactly the
signals this new checklist says not to use. Recommended treating it as a
genuinely separate, second score rather than trying to reconcile them —
this checklist requires an LLM (or human) actually reading the edition's
content, which is real text we didn't even have in the database yet.
Recommendation (renaming the existing score, real content fetching, a
provider-agnostic LLM layer, a stored/cached score rather than computed
live, and a UI section with graphs) was laid out and the user confirmed the
direction, picking GPT-5.6 Luna as the model but explicitly asking for
architecture that can swap to *any* model later, not just Luna or Claude —
and asked for a manual navbar trigger button rather than a CLI script or
auto-run-on-sync, since LLM calls cost money per edition.

**What got built, in order:**

1. **Schema** (`src/lib/db/schema.ts`): added a `content` text column to
   `editions` (plain-text extracted edition body, null until fetched) and a
   new `content_quality_scores` table (one row per edition: provider, model,
   total, a `categories` jsonb array, narrative, `scoredAt`) with its own
   relation. Migration generated and pushed to the `local-real` branch.

2. **The rubric itself**, ported verbatim into
   `src/lib/scoring/content-quality.ts`: all 12 categories with their exact
   weights (sum to exactly 1.0, checked by hand: 14+14+14+9+9+9+9+5+5+5+4+3),
   core questions, and full criteria lists, used both to build the LLM
   prompt and to define the JSON schema for structured output.
   `computeContentQualityTotal()` deliberately does the N/A-redistribution
   math in our own code rather than trusting the LLM's arithmetic: it
   excludes null-scored categories from the denominator and redistributes
   their weight proportionally across the rest, exactly as the checklist's
   "Important Scoring Rule" section specifies.

3. **Provider-agnostic LLM layer** (`src/lib/llm/`): a small `LlmProvider`
   interface (`completeStructured<T>()`) that any adapter implements;
   `providers/openai.ts` is the first (and only, for now) implementation,
   using Chat Completions with `response_format: json_schema` (confirmed via
   OpenAI's docs that gpt-5.6-luna supports structured outputs before
   building against it). `getConfiguredLlmProvider()`/`getConfiguredLlmModel()`
   read `CONTENT_QUALITY_LLM_PROVIDER`/`CONTENT_QUALITY_LLM_MODEL` env vars
   (defaulting to openai/gpt-5.6-luna) — swapping models is an env-var
   change; swapping to a wholly new provider is "add one file implementing
   the interface, one line in the switch statement," not a rewrite of the
   scoring pipeline. This directly answers "flexibility to change to any
   model later, not just Luna or Claude."

4. **Real content fetching.** Discovered (via a live API call, not
   assumption) that Beehiiv's `expand=free_web_content` returns a full raw
   HTML document (fonts, inline `<style>` blocks, layout markup) under
   `data.content.free.web`, not plain text — feeding that directly to an
   LLM would waste tokens on CSS boilerplate and dilute the actual copy.
   Added `html-to-text` and `src/lib/scoring/extract-content.ts` to strip it
   to clean plain text before it ever reaches the model.

5. **The refresh pipeline**
   (`src/app/api/content-quality/refresh/route.ts`, `POST`): finds every
   real (`beehiiv_live`) edition without a `content_quality_scores` row,
   fetches and caches its content if missing, scores it, upserts the
   result. Explicit, clear error responses (not silent failures) when
   `DATABASE_URL`/`BEEHIIV_API_KEY`/`OPENAI_API_KEY`/`BEEHIIV_PUBLICATION_ID`
   aren't set — all local-only secrets by design, so this route is a
   documented no-op on the public deployment rather than an accident.

6. **UI**: `ContentQualityRefreshButton.tsx` in the navbar (loading state,
   inline result/error message, `router.refresh()` on success so any open
   edition page picks up new scores without a manual reload) and
   `ContentQualityPanel.tsx` on the edition detail page — an overall score,
   the narrative, and all 12 categories as labeled progress bars (color-
   coded by score tier, weight shown per category, N/A categories rendered
   distinctly) plus each category's own justification text. A clean empty
   state points back at the navbar button when nothing's been scored yet.

7. **Resolved a real naming collision** rather than leaving two things both
   labeled "Content quality" on the same page: renamed the existing
   engagement-metric score's stat tile and section heading to "Engagement
   score" throughout the edition detail page, reserving "Content quality
   (editorial)" for the new LLM-scored section, with an explicit note in the
   UI that it's independent of open rate/CTR/polls/unsubscribes.

**Not yet runnable — by design, not oversight.** No `OPENAI_API_KEY` has
been provided yet. Verified the whole pipeline compiles, migrates, and
renders correctly regardless: the new section shows its empty state
correctly on a real synced edition, and clicking "Analyze content" in the
navbar returns the exact expected error ("OPENAI_API_KEY is not set — can't
run content-quality scoring") rather than crashing — confirming the
env-var guard rails work before ever spending real money on a call. Ran a
full production build and typecheck/lint before committing.

**Found and fixed a real, longstanding bug while staging this commit:**
`.env.example` had never actually been committed to the repo, ever — the
`.gitignore`'s blanket `.env*` pattern was silently excluding it too,
despite the file's own header comment saying it's "the only env-related
file that belongs in the repo," and despite the README and multiple earlier
BUILD_LOG entries describing it as already there. Caught it because `git
status` after staging today's new files didn't list `.env.example` as
modified even though it clearly had new content in it. Fixed with a `!
.env.example` negation line in `.gitignore`, verified with `git add` that it
now actually stages, and confirmed its contents hold no real secrets (every
value blank except the already-public publication ID and non-sensitive
default config) before letting it into a public repo for the first time.

## Round 25: manual "Fetch" trigger button, and a real PII/crash bug it surfaced

**The ask.** Both data-changing actions in the app — pulling new editions
from Beehiiv, and running the LLM content-quality pass on them — needed to
be strictly manual, never automatic, and each should only ever touch *new*
work: fetch shouldn't re-download things it already has, and analyze
shouldn't re-score editions that already have a score. The dedup logic for
scoring already existed (Round 24's refresh route only ever selects
editions with no `content_quality_scores` row). What didn't exist yet was
any way to trigger the Beehiiv sync itself without dropping to a terminal
and running `npm run seed:beehiiv` — that script was CLI-only.

I also raised, as an open question rather than a decision: should "Analyze
content" additionally be locked to once per day? My recommendation was
against it — the existing skip-already-scored logic already prevents
redundant LLM spend on repeated clicks, so a time-lock would add UI
complexity (state, unlock timers, an admin override for a legitimate
same-day re-run) without buying additional protection over what dedup
already provides. Whether the actual worry was cost control or someone
else on the team spamming the button changes the right answer, so this is
left open pending clarification rather than built preemptively.

**What shipped.**

1. **Shared sync logic.** The Beehiiv-pull logic that used to live only in
   `scripts/seed-from-beehiiv.ts` moved to `src/lib/beehiiv/sync.ts`
   (`syncBeehiivData()`), with the CLI script reduced to a three-line
   wrapper that imports and calls it. One implementation, two triggers —
   the same principle already used for the content-quality scoring route.
   Hit one real snag doing this: the extracted module initially had
   `import "server-only"` at the top (copied out of habit from the rest of
   the `src/lib` tree), which threw immediately when the CLI script tried
   to load it with plain `tsx` outside Next.js's bundler. Removed the
   import — this module has to run in both a Next.js API route and a bare
   Node script, so it can't assume either environment.

2. **New route:** `POST /api/beehiiv/refresh`
   (`src/app/api/beehiiv/refresh/route.ts`) — guards on
   `DATABASE_URL`/`BEEHIIV_API_KEY`/`BEEHIIV_PUBLICATION_ID` being set,
   calls `syncBeehiivData()`, returns `{ synced, removed, skippedForPlatform,
   messages }` or a clear `{ error }`. `maxDuration = 300` since a full
   31-edition sync (each edition requires walking that edition's poll
   responses) took over 4 minutes end-to-end through the browser.

3. **Generic `NavTriggerButton`** replaced the single-purpose
   `ContentQualityRefreshButton` from Round 24, since the navbar now needed
   two near-identical buttons (idle/running label, an endpoint to POST to,
   a result formatter). Both "Fetch" and "Analyze content" now render side
   by side in the navbar as independent, separately-clickable actions —
   exactly the "both manual, both separate" requirement — each with its
   own inline success/error popover and a `router.refresh()` on success so
   any open page picks up new data immediately.

**A real bug the first live test caught — not a flake.** The first click
of the new "Fetch" button failed after 2.5 minutes with a 500. The error
(visible in the response body, not the server console — the route's catch
block wasn't logging it) was a Postgres insert failure on `promoted_links`,
and reading the actual query params revealed something worth stopping for:
Beehiiv's per-click breakdown for "magic"/sponsored links isn't an
aggregate URL, it's a *personalized tracking link containing the
subscriber's own email address* as a query parameter
(`?email=someone@domain.com&redirect_to=...`). The existing sync code was
building each `promoted_links.id` as `post-id + "-promoted-" + that_url`,
sliced to 250 characters — so two different subscribers' personalized
links for the same sponsor link were colliding after truncation and
tripping the primary key.

Before patching the crash, checked whether this table was even used:
`grep` across `src/app` and `src/components` confirmed `promotedLinks` is
fetched into the data layer (`src/lib/data/editions.ts`) but never rendered
anywhere — consistent with the "remove promoted or sponsored placement
links completely" instruction from an earlier round, which stripped it
from the UI but left the sync still faithfully writing it to the database
underneath. So the fix wasn't a workaround for the truncation collision;
it was to stop the sync from ever populating `promoted_links` at all —
"magic" links are now skipped in the same branch as the already-skipped
"social"/"audio" clicks. This simultaneously fixes the crash, deletes dead
write-only code, and — the part that actually mattered — stops a local dev
database from accumulating real subscriber email addresses for a feature
nobody sees. The `promoted_links` table itself and its schema/type
plumbing were left in place (unused, harmless) rather than torn out in the
same pass as a bug fix.

**Verified in the browser, not just by log-tailing.** Re-ran "Fetch" after
the fix: it sailed straight past the edition that previously crashed and
completed all 31 editions in ~4.4 minutes, surfacing "Synced 31 editions."
in the navbar popover. Clicked "Analyze content" immediately after — it
correctly failed fast with "OPENAI_API_KEY is not set — can't run
content-quality scoring" (that key still isn't configured, by design, per
Round 24), rendered in a visually distinct red error popover next to the
neutral gray success one for Fetch. `npx tsc --noEmit` clean after the
fix.

**Follow-up:** the result popover (e.g. "Synced 31 editions.") stuck around
indefinitely until the next click, which read as broken/stuck UI rather
than a one-off confirmation. `NavTriggerButton` now auto-dismisses it via
`setTimeout` 4 seconds after it appears (cleared and restarted on every new
click, and cleaned up on unmount) — success and error messages both behave
the same way. Verified via direct DOM inspection in the browser: the
popover is present immediately after a click and gone by 4.5s.

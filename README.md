# Marketing Monk — Content Analysis Dashboard

A content-analysis dashboard for the Marketing Monk (AI Marketing Brief) daily
Beehiiv newsletter: real open-rate/CTR trends, a per-edition content quality
score, an editorial Batch 1 / Batch 2 audience lens, a Subject Line Lab, and
retention tracking.

Built with Next.js (App Router, TypeScript, Tailwind), Neon Postgres (via
Drizzle ORM), and the Beehiiv REST API v2, deployed on Vercel.

The full build process — every decision, every question asked and answered,
word for word — is logged in [`BUILD_LOG.md`](./BUILD_LOG.md).

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind v4)
- **Database:** [Neon](https://neon.tech) Postgres, via [Drizzle ORM](https://orm.drizzle.team)
- **Data source:** [Beehiiv REST API v2](https://developers.beehiiv.com)
- **Hosting:** [Vercel](https://vercel.com)
- **Access control:** single shared-password gate (`src/proxy.ts`)

## What's real vs. placeholder

This is transparent by design (see `BUILD_LOG.md` for the full reasoning):

- **Real:** open rate, CTR, unsubscribe rate, per-edition poll tallies (walked
  live from Beehiiv's `/polls/:id/responses?post_id=` endpoint), top-link
  click counts, subject-line character length/emoji/number detection.
- **Placeholder, clearly labeled in the UI and code:** writing/voice-
  compliance scoring (assumes clean until a real text-analysis pass is
  wired up), subject-line hook-type classification (rule-based heuristic,
  not NLP/LLM), and the Batch 1/Batch 2 audience-fit commentary (template
  selection over real numbers, not a generated judgment). All three are
  scoped as documented follow-ups, not silently faked.
- **Public deployment:** runs on a realistic-but-synthetic 16-edition demo
  dataset (`src/lib/synthetic-data.ts`), never real Marketing Monk
  performance numbers. Real data, if synced, stays in a private Neon branch
  and local `.env.local` only — see "Data sources" below.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With `DATABASE_URL`
unset, the app automatically falls back to the bundled synthetic dataset, so
it's fully browsable with zero setup.

## Data sources

Two independent Neon branches are meant to back this project:

1. **Public/demo branch** — seeded with synthetic data, backs the deployed
   Vercel app. Seed it with:
   ```bash
   npm run seed:synthetic
   ```
2. **Private/local branch** — seeded with real Beehiiv data for personal use
   only, never deployed publicly. Requires `BEEHIIV_API_KEY` in
   `.env.local`:
   ```bash
   npm run seed:beehiiv
   ```

Point `DATABASE_URL` in `.env.local` at whichever branch you're working
against before running a seed script.

## Database

```bash
npm run db:generate   # diff schema -> SQL migration (offline, no DB needed)
npm run db:push        # apply schema to DATABASE_URL
npm run db:studio      # browse the DB
```

## Environment variables

See [`.env.example`](./.env.example) for the full list and where to get each
value (`DATABASE_URL`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`,
`SITE_PASSWORD`).

## Deploying

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set `DATABASE_URL` (public/demo Neon branch), `SITE_PASSWORD`, and
   optionally `BEEHIIV_PUBLICATION_ID` in the Vercel project's environment
   variables. Do not set `BEEHIIV_API_KEY` on the public deployment.
4. Run `npm run seed:synthetic` against the demo branch before or after first
   deploy.

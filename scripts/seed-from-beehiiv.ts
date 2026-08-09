/**
 * Syncs real Marketing Monk data from Beehiiv into whatever DATABASE_URL
 * currently points to. Intended for a private, local-only Neon branch — see
 * BUILD_LOG.md "public vs. real data split". Never run this against the
 * branch the public Vercel deployment reads from.
 *
 * The actual sync logic lives in src/lib/beehiiv/sync.ts, shared with the
 * navbar "Fetch" button's API route — this script is just a CLI wrapper.
 *
 * Requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local.
 *
 * Run: npm run seed:beehiiv
 * (reads env vars from .env.local via Node's --env-file flag, wired up in
 * package.json)
 */
import { syncBeehiivData } from "../src/lib/beehiiv/sync";

syncBeehiivData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

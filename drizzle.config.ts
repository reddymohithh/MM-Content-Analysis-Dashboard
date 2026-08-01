import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// `db:generate` diffs the schema and writes SQL migrations offline, no live
// connection needed. `db:push` and `db:studio` do need DATABASE_URL — they'll
// fail with drizzle-kit's own clear error if it's missing, no need to
// duplicate that check here.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});

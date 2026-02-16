import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/plm_system",
  },
  // Enable verbose output for debugging
  verbose: true,
  // Strict mode for type safety
  strict: true,
} satisfies Config;

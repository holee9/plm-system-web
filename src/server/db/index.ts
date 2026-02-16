import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Re-export all schema exports for convenience
export * from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/plm_system";

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getRadarDB() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= postgres(url, { max: 5, prepare: false });
  return drizzle(client, { schema });
}

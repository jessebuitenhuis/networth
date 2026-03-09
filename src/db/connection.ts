import { drizzle,type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

function initDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  const client = postgres(databaseUrl);
  _db = drizzle(client, { schema });
  return _db;
}

export const globalDb = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = initDb();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

import { PGlite } from "@electric-sql/pglite";
import { type PgDatabase } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { mkdirSync } from "fs";
import { dirname } from "path";
import postgres from "postgres";

import { CREATE_TABLES_SQL } from "./createTables";
import * as schema from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPgDb = PgDatabase<any, any, any>;

let _db: AnyPgDb | null = null;
let _ready: Promise<void> = Promise.resolve();

function initDb(): AnyPgDb {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const client = postgres(databaseUrl);
    _db = drizzlePostgres(client, { schema });
  } else {
    const dataDir = `${process.cwd()}/data/pglite`;
    mkdirSync(dirname(dataDir), { recursive: true });
    const pglite = new PGlite(dataDir);
    _db = drizzlePglite(pglite, { schema });
    _ready = pglite.exec(CREATE_TABLES_SQL).then(() => {});
  }

  return _db;
}

export const globalDb = new Proxy({} as AnyPgDb, {
  get(_target, prop, receiver) {
    const instance = initDb();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export function waitForDb(): Promise<void> {
  initDb();
  return _ready;
}

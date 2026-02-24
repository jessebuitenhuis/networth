import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";

import * as schema from "./schema";

const dbPath =
  process.env.DATABASE_PATH || `${process.cwd()}/data/networth.db`;

let _db: BetterSQLite3Database<typeof schema> | null = null;

function initDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  mkdirSync(dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath, { timeout: 10000 });
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      expected_return_rate REAL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      is_projected INTEGER,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      inflation_rate REAL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (user_id, key)
    );
  `);

  // Migrate existing tables to add category_id column if missing
  try {
    sqlite.exec(`ALTER TABLE transactions ADD COLUMN category_id TEXT`);
  } catch {
    // Column already exists
  }
  try {
    sqlite.exec(`ALTER TABLE recurring_transactions ADD COLUMN category_id TEXT`);
  } catch {
    // Column already exists
  }

  try {
    sqlite.exec(`ALTER TABLE scenarios ADD COLUMN inflation_rate REAL`);
  } catch {
    // Column already exists
  }

  // Migrate entity tables to add user_id column if missing
  const entityTables = [
    "accounts",
    "transactions",
    "recurring_transactions",
    "categories",
    "scenarios",
    "goals",
  ];
  for (const table of entityTables) {
    try {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT NOT NULL DEFAULT ''`);
      sqlite.exec(`UPDATE ${table} SET user_id = 'placeholder-user-id' WHERE user_id = ''`);
    } catch {
      // Column already exists
    }
  }

  // Migrate settings table: rebuild with compound PK (userId, key)
  const needsSettingsMigration = (() => {
    try {
      sqlite.exec(`ALTER TABLE settings ADD COLUMN user_id TEXT`);
      return true;
    } catch {
      return false;
    }
  })();
  if (needsSettingsMigration) {
    sqlite.exec(`
      ALTER TABLE settings RENAME TO settings_old;
      CREATE TABLE settings (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        PRIMARY KEY (user_id, key)
      );
      INSERT INTO settings SELECT 'placeholder-user-id', key, value FROM settings_old;
      DROP TABLE settings_old;
    `);
  }

  _db = drizzle(sqlite, { schema });
  return _db;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = initDb();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

import Database from "better-sqlite3";
import { drizzle as drizzleSqlite, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg, NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as pgSchema from "@shared/schema";
import * as sqliteSchema from "@shared/sqlite-schema";
import fs from "fs";
import path from "path";

export const isUsingPostgres = !!process.env.DATABASE_URL;

type DbType = NeonDatabase<typeof pgSchema> | BetterSQLite3Database<typeof sqliteSchema>;

let _db: DbType;
let _pool: Pool | null = null;
let _schema: typeof pgSchema | typeof sqliteSchema;

if (isUsingPostgres) {
  neonConfig.webSocketConstructor = ws;
  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzlePg({ client: _pool, schema: pgSchema });
  _schema = pgSchema;
  console.log("Using PostgreSQL database");
} else {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, "local.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  
  _db = drizzleSqlite(sqlite, { schema: sqliteSchema });
  _schema = sqliteSchema;
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('login', 'logout', 'create_user', 'update_user', 'delete_user', 'password_reset_request', 'password_reset_complete', 'profile_update', 'password_change')),
      target_id TEXT,
      target_name TEXT,
      details TEXT,
      ip_address TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);
  
  console.log("Using SQLite database at:", dbPath);
}

export const db = _db as any;
export const pool = _pool;
export const schema = _schema;

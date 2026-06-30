import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Lazy initialisation: the database connection is only created the first time
// `db` or `pool` is actually used. This lets the server boot (and the
// onboarding demo, which is pure in-memory computation, run) even when
// DATABASE_URL is not configured. DB-backed endpoints throw a clear error
// only when they are actually hit without a database provisioned.
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function ensureDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle({ client: _pool, schema });
  }
  return _db;
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    ensureDb();
    const value = (_pool as any)[prop];
    return typeof value === "function" ? value.bind(_pool) : value;
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const real = ensureDb();
    const value = (real as any)[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

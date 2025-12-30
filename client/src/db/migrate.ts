import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

const db = drizzle(pool);

export async function runMigrations() {
  console.log("🟡 Running database migrations...");

  await migrate(db, {
    migrationsFolder: "migrations",
  });

  console.log("🟢 Migrations completed");
}

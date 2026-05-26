import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

await loadEnvFile(path.join(repoRoot, ".env"), false);
await loadEnvFile(path.join(repoRoot, ".env.local"), true);

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is not set.");
}

const { Client } = pg;
const client = new Client({ connectionString });

await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = await getMigrationFiles();

  for (const file of files) {
    const applied = await client.query(
      "select 1 from schema_migrations where name = $1",
      [file.name],
    );

    if (applied.rowCount && applied.rowCount > 0) {
      continue;
    }

    const sql = await fs.readFile(file.fullPath, "utf8");

    if (!sql.trim()) {
      continue;
    }

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [
        file.name,
      ]);
      await client.query("commit");
      console.log(`Applied ${file.name}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
} finally {
  await client.end();
}

async function getMigrationFiles() {
  const directories = [
    path.join(repoRoot, "db", "schema"),
    path.join(repoRoot, "db", "migrations"),
  ];
  const files = [];

  for (const directory of directories) {
    try {
      const entries = await fs.readdir(directory);
      for (const entry of entries) {
        if (!entry.endsWith(".sql")) continue;
        files.push({
          name: `${path.basename(directory)}/${entry}`,
          fullPath: path.join(directory, entry),
        });
      }
    } catch {
      // Directory does not exist yet.
    }
  }

  const priority = (name) => (name.startsWith("schema/") ? 0 : 1);
  return files.sort((a, b) => {
    const priorityDiff = priority(a.name) - priority(b.name);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return a.name.localeCompare(b.name);
  });
}

async function loadEnvFile(filePath, override = false) {
  try {
    const contents = await fs.readFile(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const rawValue = trimmed.slice(index + 1).trim();
      if (!key) continue;
      if (!override && process.env[key]) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Ignore missing env files.
  }
}

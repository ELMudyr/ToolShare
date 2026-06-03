import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "toolshare.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Non-destructive migrations
try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch { /* column already exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    full_name        TEXT     NOT NULL,
    email            TEXT     NOT NULL UNIQUE,
    password_hash    TEXT     NOT NULL,
    apartment_number TEXT     NOT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    owner_id    INTEGER  NOT NULL,
    name        TEXT     NOT NULL,
    description TEXT,
    image_url   TEXT,
    status      TEXT     NOT NULL DEFAULT 'available'
                         CHECK(status IN ('available', 'borrowed')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lending_transactions (
    id           INTEGER  PRIMARY KEY AUTOINCREMENT,
    item_id      INTEGER  NOT NULL,
    borrower_id  INTEGER  NOT NULL,
    borrowed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date     DATE     NOT NULL,
    returned_at  DATETIME,
    notes        TEXT,
    status       TEXT     NOT NULL DEFAULT 'active'
                          CHECK(status IN ('active', 'returned', 'cancelled')),
    FOREIGN KEY (item_id)     REFERENCES items(id),
    FOREIGN KEY (borrower_id) REFERENCES users(id)
  );
`);

function seedIfEmpty() {
  const count = (
    db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number }
  ).n;
  if (count > 0) return;

  // Password for all seed accounts is "toolshare123"
  const hash = bcrypt.hashSync("toolshare123", 10);

  const insertUser = db.prepare(
    "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
  );

  const u1 = insertUser.run(
    "Ieva Kazlauskienė",
    "ieva.k@toolshare.lt",
    hash,
    "1C",
  ).lastInsertRowid;
  const u2 = insertUser.run(
    "Mantas Petrauskas",
    "mantas.p@toolshare.lt",
    hash,
    "2A",
  ).lastInsertRowid;
  const u3 = insertUser.run(
    "Rūta Stankevičiūtė",
    "ruta.s@toolshare.lt",
    hash,
    "3A",
  ).lastInsertRowid;
  insertUser.run("Lukas Žukauskas", "lukas.z@toolshare.lt", hash, "4B");
  const u5 = insertUser.run(
    "Simona Daukšaitė",
    "simona.d@toolshare.lt",
    hash,
    "5B",
  ).lastInsertRowid;

  const insertItem = db.prepare(
    "INSERT INTO items (owner_id, name, description, status) VALUES (?, ?, ?, ?)",
  );

  insertItem.run(
    u1,
    "Bosch combi-drill",
    "Comes with 3 drill bits and a carry case",
    "available",
  );
  insertItem.run(
    u3,
    "6m aluminium ladder",
    "Foldable, max load 150 kg",
    "available",
  );
  insertItem.run(
    u5,
    "Monopoly board game",
    "Complete set, all pieces present",
    "available",
  );
  const sander = insertItem.run(
    u1,
    "Electric sander",
    "Bosch finishing sander, 240W",
    "borrowed",
  ).lastInsertRowid;
  insertItem.run(
    u3,
    "Extension reel (10m)",
    "Schuko plug, 4 sockets",
    "available",
  );

  // Create the active lending transaction for the sander already marked as borrowed
  db.prepare(
    "INSERT INTO lending_transactions (item_id, borrower_id, due_date, status) VALUES (?, ?, ?, 'active')",
  ).run(sander, u2, "2026-06-15");
}

seedIfEmpty();

// Migrations for existing databases
try {
  db.exec("ALTER TABLE lending_transactions ADD COLUMN notes TEXT");
} catch {
  /* exists */
}
try {
  db.exec("ALTER TABLE items ADD COLUMN image_url TEXT");
} catch {
  /* exists */
}

// Seed images — always overwrite so they stay accurate after URL updates
const SEED_IMAGES: Record<string, string> = {
  // Confirmed free Unsplash photos matching each item
  "Bosch combi-drill":
    "https://images.unsplash.com/photo-1770763233593-74dfd0da7bf0?w=600&auto=format&fit=crop",
  "6m aluminium ladder":
    "https://images.unsplash.com/photo-1624629033893-50dea64f7b67?w=600&auto=format&fit=crop",
  "Monopoly board game":
    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&auto=format&fit=crop",
  "Electric sander":
    "https://images.unsplash.com/photo-1545275509-5c72cd888344?w=600&auto=format&fit=crop",
  "Extension reel (10m)":
    "https://images.unsplash.com/photo-1601467450590-8c3d11cde2fd?w=600&auto=format&fit=crop",
};
for (const [name, url] of Object.entries(SEED_IMAGES)) {
  db.prepare("UPDATE items SET image_url = ? WHERE name = ?").run(url, name);
}

export { db };

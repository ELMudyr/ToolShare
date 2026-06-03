import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function initializeDb() {
  // Create tables (idempotent)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id               INTEGER  PRIMARY KEY AUTOINCREMENT,
      full_name        TEXT     NOT NULL,
      email            TEXT     NOT NULL UNIQUE,
      password_hash    TEXT     NOT NULL,
      apartment_number TEXT     NOT NULL,
      avatar_url       TEXT,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`
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
    )
  `);
  await db.execute(`
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
    )
  `);

  // Seed if empty
  const { rows } = await db.execute("SELECT COUNT(*) as n FROM users");
  if (Number(rows[0].n) > 0) return;

  const hash = bcrypt.hashSync("toolshare123", 10);

  const r1 = await db.execute({
    sql: "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    args: ["Ieva Kazlauskienė", "ieva.k@toolshare.lt", hash, "1C"],
  });
  const r2 = await db.execute({
    sql: "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    args: ["Mantas Petrauskas", "mantas.p@toolshare.lt", hash, "2A"],
  });
  const r3 = await db.execute({
    sql: "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    args: ["Rūta Stankevičiūtė", "ruta.s@toolshare.lt", hash, "3A"],
  });
  await db.execute({
    sql: "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    args: ["Lukas Žukauskas", "lukas.z@toolshare.lt", hash, "4B"],
  });
  const r5 = await db.execute({
    sql: "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    args: ["Simona Daukšaitė", "simona.d@toolshare.lt", hash, "5B"],
  });

  const u1 = r1.lastInsertRowid;
  const u2 = r2.lastInsertRowid;
  const u3 = r3.lastInsertRowid;
  const u5 = r5.lastInsertRowid;

  await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, status, image_url) VALUES (?, ?, ?, ?, ?)",
    args: [u1, "Bosch combi-drill", "Comes with 3 drill bits and a carry case", "available",
      "https://images.unsplash.com/photo-1770763233593-74dfd0da7bf0?w=600&auto=format&fit=crop"],
  });
  await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, status, image_url) VALUES (?, ?, ?, ?, ?)",
    args: [u3, "6m aluminium ladder", "Foldable, max load 150 kg", "available",
      "https://images.unsplash.com/photo-1624629033893-50dea64f7b67?w=600&auto=format&fit=crop"],
  });
  await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, status, image_url) VALUES (?, ?, ?, ?, ?)",
    args: [u5, "Monopoly board game", "Complete set, all pieces present", "available",
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&auto=format&fit=crop"],
  });
  const sanderResult = await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, status, image_url) VALUES (?, ?, ?, ?, ?)",
    args: [u1, "Electric sander", "Bosch finishing sander, 240W", "borrowed",
      "https://images.unsplash.com/photo-1545275509-5c72cd888344?w=600&auto=format&fit=crop"],
  });
  await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, status, image_url) VALUES (?, ?, ?, ?, ?)",
    args: [u3, "Extension reel (10m)", "Schuko plug, 4 sockets", "available",
      "https://images.unsplash.com/photo-1601467450590-8c3d11cde2fd?w=600&auto=format&fit=crop"],
  });

  await db.execute({
    sql: "INSERT INTO lending_transactions (item_id, borrower_id, due_date, status) VALUES (?, ?, ?, 'active')",
    args: [sanderResult.lastInsertRowid, u2, "2026-06-15"],
  });
}

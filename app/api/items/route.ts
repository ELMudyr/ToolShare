import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Item } from "@/types";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { rows } = await db.execute(
      `SELECT
        i.id, i.owner_id, i.name, i.description, i.image_url, i.status, i.created_at,
        TRIM(SUBSTR(u.full_name, 1, INSTR(u.full_name, ' ') - 1)) AS owner_first_name,
        u.apartment_number AS owner_apartment
      FROM items i
      JOIN users u ON u.id = i.owner_id
      ORDER BY i.created_at DESC`,
    );

    return NextResponse.json(rows as unknown as Item[]);
  } catch {
    return NextResponse.json(
      { error: "Failed to load items" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { name, description, image_url } = body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Item name is required" },
      { status: 400 },
    );
  }

  const result = await db.execute({
    sql: "INSERT INTO items (owner_id, name, description, image_url, status) VALUES (?, ?, ?, ?, 'available')",
    args: [
      session.id,
      name.trim(),
      description?.trim() ?? null,
      image_url ?? null,
    ],
  });

  const { rows } = await db.execute({
    sql: `SELECT
      i.id, i.owner_id, i.name, i.description, i.image_url, i.status, i.created_at,
      TRIM(SUBSTR(u.full_name, 1, INSTR(u.full_name, ' ') - 1)) AS owner_first_name,
      u.apartment_number AS owner_apartment
    FROM items i
    JOIN users u ON u.id = i.owner_id
    WHERE i.id = ?`,
    args: [result.lastInsertRowid],
  });

  return NextResponse.json(rows[0] as unknown as Item, { status: 201 });
}

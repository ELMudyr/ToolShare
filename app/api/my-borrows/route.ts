import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ActiveBorrow } from "@/types";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rows = db
    .prepare(
      `SELECT
        lt.id AS transaction_id,
        lt.item_id,
        i.name AS item_name,
        i.description AS item_description,
        TRIM(SUBSTR(u.full_name, 1, INSTR(u.full_name, ' ') - 1)) AS owner_first_name,
        u.apartment_number AS owner_apartment,
        lt.borrowed_at,
        lt.due_date,
        lt.notes,
        CAST(
          (julianday(lt.due_date) - julianday('now'))
          AS INTEGER
        ) AS days_left
      FROM lending_transactions lt
      JOIN items i ON i.id = lt.item_id
      JOIN users u ON u.id = i.owner_id
      WHERE lt.borrower_id = ? AND lt.status = 'active'
      ORDER BY lt.due_date ASC`,
    )
    .all(session.id) as ActiveBorrow[];

  return NextResponse.json(rows);
}

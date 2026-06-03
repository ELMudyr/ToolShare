import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { item_id, due_date, notes } = body ?? {};

  if (!item_id || !due_date) {
    return NextResponse.json(
      { error: "item_id and due_date are required" },
      { status: 400 },
    );
  }

  // The batch prevents a TOCTOU race where two simultaneous requests
  // both read "available" before either write completes.
  try {
    const { rows } = await db.execute({
      sql: "SELECT id, status FROM items WHERE id = ?",
      args: [item_id],
    });
    const item = rows[0] as unknown as { id: number; status: string } | undefined;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.status !== "available") {
      return NextResponse.json({ error: "This item is already checked out" }, { status: 409 });
    }

    // Atomic update + insert
    await db.batch([
      {
        sql: "UPDATE items SET status = 'borrowed' WHERE id = ? AND status = 'available'",
        args: [item_id],
      },
      {
        sql: "INSERT INTO lending_transactions (item_id, borrower_id, due_date, notes) VALUES (?, ?, ?, ?)",
        args: [item_id, session.id, due_date, notes ?? null],
      },
    ], "write");

    const { rows: txRows } = await db.execute("SELECT last_insert_rowid() AS id");
    const transaction_id = Number(txRows[0].id);

    return NextResponse.json({ transaction_id, item_id, due_date }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Borrow request failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface BorrowResult {
  httpStatus: number;
  error?: string;
  transaction_id?: number;
  item_id?: number;
  due_date?: string;
}

export async function POST(req: NextRequest) {
  const session = getSession();
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

  // The transaction prevents a TOCTOU race where two simultaneous requests
  // both read "available" before either write completes.
  const attempt = db.transaction((): BorrowResult => {
    const item = db
      .prepare("SELECT id, status FROM items WHERE id = ?")
      .get(item_id) as { id: number; status: string } | undefined;

    if (!item) {
      return { httpStatus: 404, error: "Item not found" };
    }

    if (item.status !== "available") {
      return { httpStatus: 409, error: "This item is already checked out" };
    }

    db.prepare("UPDATE items SET status = 'borrowed' WHERE id = ?").run(
      item_id,
    );

    const row = db
      .prepare(
        "INSERT INTO lending_transactions (item_id, borrower_id, due_date, notes) VALUES (?, ?, ?, ?)",
      )
      .run(item_id, session.id, due_date, notes ?? null);

    return {
      httpStatus: 201,
      transaction_id: Number(row.lastInsertRowid),
      item_id,
      due_date,
    };
  });

  try {
    const result = attempt();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.httpStatus },
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Borrow request failed" },
      { status: 500 },
    );
  }
}

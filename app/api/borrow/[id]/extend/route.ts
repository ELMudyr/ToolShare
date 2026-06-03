import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const txId = parseInt(id, 10);
  if (isNaN(txId))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const { new_due_date } = body ?? {};
  if (!new_due_date || typeof new_due_date !== "string") {
    return NextResponse.json(
      { error: "new_due_date is required" },
      { status: 400 },
    );
  }

  // Validate date format
  const parsed = new Date(new_due_date);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const { rows } = await db.execute({
    sql: "SELECT * FROM lending_transactions WHERE id = ? AND borrower_id = ? AND status = 'active'",
    args: [txId, session.id],
  });
  const tx = rows[0] as unknown as
    | { id: number; due_date: string; item_id: number }
    | undefined;

  if (!tx)
    return NextResponse.json(
      { error: "Transaction not found or not yours" },
      { status: 404 },
    );

  // New date must be after current due date
  if (new_due_date <= String(tx.due_date)) {
    return NextResponse.json(
      { error: "New due date must be after the current due date" },
      { status: 409 },
    );
  }

  // Max 90 days from today
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  if (parsed > maxDate) {
    return NextResponse.json(
      { error: "Cannot extend more than 90 days from today" },
      { status: 409 },
    );
  }

  // Check for conflicting borrows after current due date
  const { rows: conflicts } = await db.execute({
    sql: `SELECT id FROM lending_transactions
       WHERE item_id = ? AND status = 'active' AND id != ? AND due_date > ?`,
    args: [Number(tx.item_id), txId, tx.due_date],
  });

  if (conflicts.length > 0) {
    return NextResponse.json(
      { error: "Item is already booked after your current due date" },
      { status: 409 },
    );
  }

  await db.execute({
    sql: "UPDATE lending_transactions SET due_date = ? WHERE id = ?",
    args: [new_due_date, txId],
  });

  return NextResponse.json({ due_date: new_due_date });
}

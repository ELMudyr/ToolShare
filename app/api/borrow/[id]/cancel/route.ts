import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const txId = Number(id);
  if (!Number.isInteger(txId) || txId <= 0) {
    return NextResponse.json(
      { error: "Invalid transaction id" },
      { status: 400 },
    );
  }

  const { rows } = await db.execute({
    sql: "SELECT id, item_id, borrower_id, status FROM lending_transactions WHERE id = ?",
    args: [txId],
  });
  const tx = rows[0] as unknown as
    | { id: number; item_id: number; borrower_id: number; status: string }
    | undefined;

  if (!tx) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }
  if (Number(tx.borrower_id) !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (tx.status !== "active") {
    return NextResponse.json(
      { error: "Only active borrows can be cancelled" },
      { status: 409 },
    );
  }

  await db.batch([
    {
      sql: "UPDATE lending_transactions SET status = 'cancelled' WHERE id = ?",
      args: [txId],
    },
    {
      sql: "UPDATE items SET status = 'available' WHERE id = ?",
      args: [Number(tx.item_id)],
    },
  ], "write");

  return NextResponse.json({ ok: true });
}

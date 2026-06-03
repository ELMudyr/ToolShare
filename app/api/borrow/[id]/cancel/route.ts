import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const txId = Number(params.id);
  if (!Number.isInteger(txId) || txId <= 0) {
    return NextResponse.json(
      { error: "Invalid transaction id" },
      { status: 400 },
    );
  }

  const tx = db
    .prepare(
      "SELECT id, item_id, borrower_id, status FROM lending_transactions WHERE id = ?",
    )
    .get(txId) as
    | { id: number; item_id: number; borrower_id: number; status: string }
    | undefined;

  if (!tx) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }
  if (tx.borrower_id !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (tx.status !== "active") {
    return NextResponse.json(
      { error: "Only active borrows can be cancelled" },
      { status: 409 },
    );
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE lending_transactions SET status = 'cancelled' WHERE id = ?",
    ).run(txId);
    db.prepare("UPDATE items SET status = 'available' WHERE id = ?").run(
      tx.item_id,
    );
  })();

  return NextResponse.json({ ok: true });
}

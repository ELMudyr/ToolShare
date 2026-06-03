import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface ItemRow {
  id: number;
  owner_id: number;
  status: string;
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const { rows } = await db.execute({
    sql: "SELECT id, owner_id, status FROM items WHERE id = ?",
    args: [itemId],
  });
  const item = rows[0] as unknown as ItemRow | undefined;

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (Number(item.owner_id) !== session.id) {
    return NextResponse.json(
      { error: "You do not own this item" },
      { status: 403 },
    );
  }

  if (item.status !== "borrowed") {
    return NextResponse.json(
      { error: "Item is not currently borrowed" },
      { status: 409 },
    );
  }

  await db.batch([
    { sql: "UPDATE items SET status = 'available' WHERE id = ?", args: [itemId] },
    {
      sql: "UPDATE lending_transactions SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE item_id = ? AND status = 'active'",
      args: [itemId],
    },
  ], "write");

  return NextResponse.json({ message: "Item marked as returned" });
}

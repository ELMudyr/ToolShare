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
  { params }: { params: { id: string } },
) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const itemId = parseInt(params.id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const item = db
    .prepare("SELECT id, owner_id, status FROM items WHERE id = ?")
    .get(itemId) as ItemRow | undefined;

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.owner_id !== session.id) {
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

  const markReturned = db.transaction(() => {
    db.prepare("UPDATE items SET status = 'available' WHERE id = ?").run(
      itemId,
    );
    db.prepare(
      "UPDATE lending_transactions SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE item_id = ? AND status = 'active'",
    ).run(itemId);
  });

  markReturned();

  return NextResponse.json({ message: "Item marked as returned" });
}

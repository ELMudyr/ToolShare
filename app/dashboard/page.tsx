import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { DashboardShell } from "@/components/DashboardShell";
import type { Item, ActiveBorrow } from "@/types";

export default function DashboardPage() {
  const session = getSession();
  if (!session) redirect("/");

  const items = db
    .prepare(
      `SELECT
        i.id, i.owner_id, i.name, i.description, i.image_url, i.status, i.created_at,
        TRIM(SUBSTR(u.full_name, 1, INSTR(u.full_name, ' ') - 1)) AS owner_first_name,
        u.apartment_number AS owner_apartment
      FROM items i
      JOIN users u ON u.id = i.owner_id
      ORDER BY i.created_at DESC`,
    )
    .all() as Item[];

  const myBorrows = db
    .prepare(
      `SELECT
        lt.id AS transaction_id,
        lt.item_id,
        i.name AS item_name,
        i.description AS item_description,
        i.image_url,
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

  const myListings = items.filter((i) => i.owner_id === session.id);
  const availableCount = items.filter((i) => i.status === "available").length;

  return (
    <>
      <Navbar user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {session.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share and borrow tools & items with your neighbours
          </p>
        </div>

        <DashboardShell
          items={items}
          myBorrows={myBorrows}
          myListings={myListings}
          currentUserId={session.id}
          totalItems={items.length}
          availableCount={availableCount}
        />
      </main>
    </>
  );
}

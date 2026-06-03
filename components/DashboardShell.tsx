"use client";

import { useState } from "react";
import { PlusCircle, LayoutGrid, Clock, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ItemFeed } from "@/components/ItemFeed";
import { MyBorrows } from "@/components/MyBorrows";
import { AddItemModal } from "@/components/AddItemModal";
import type { Item, ActiveBorrow } from "@/types";

interface DashboardShellProps {
  items: Item[];
  myBorrows: ActiveBorrow[];
  myListings: Item[];
  currentUserId: number;
  totalItems: number;
  availableCount: number;
}

export function DashboardShell({
  items: initialItems,
  myBorrows,
  myListings: initialListings,
  currentUserId,
  totalItems,
  availableCount,
}: DashboardShellProps) {
  const [allItems, setAllItems] = useState<Item[]>(initialItems);
  const [myItems, setMyItems] = useState<Item[]>(initialListings);
  const [showAdd, setShowAdd] = useState(false);

  function handleItemAdded(item: Item) {
    setAllItems((prev) => [item, ...prev]);
    setMyItems((prev) => [item, ...prev]);
    setShowAdd(false);
  }

  return (
    <>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total items"
          value={totalItems}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="Available now"
          value={availableCount}
          icon={<LayoutGrid className="h-4 w-4" />}
          highlight
        />
        <StatCard
          label="You borrowed"
          value={myBorrows.length}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Your listings"
          value={myItems.length}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="browse">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="browse" className="flex-1 gap-1.5 sm:flex-none">
              <LayoutGrid className="h-3.5 w-3.5" />
              Browse
              <span className="ml-1 hidden rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none sm:inline">
                {allItems.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="my-borrows" className="flex-1 gap-1.5 sm:flex-none">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My </span>Borrows
              {myBorrows.length > 0 && (
                <span className="ml-1 hidden rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground sm:inline">
                  {myBorrows.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="flex-1 gap-1.5 sm:flex-none">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My </span>Listings
            </TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            className="w-full gap-1.5 sm:w-auto"
            onClick={() => setShowAdd(true)}
          >
            <PlusCircle className="h-4 w-4" />
            List item
          </Button>
        </div>

        <Separator className="mb-6" />

        <TabsContent value="browse" className="mt-0">
          <ItemFeed initialItems={allItems} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="my-borrows" className="mt-0">
          <MyBorrows borrows={myBorrows} />
        </TabsContent>

        <TabsContent value="my-listings" className="mt-0">
          <MyListingsPanel items={myItems} />
        </TabsContent>
      </Tabs>

      {showAdd && (
        <AddItemModal
          onAdded={handleItemAdded}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-primary/20 bg-primary/5" : "bg-card"
      }`}
    >
      <div
        className={`mb-1 flex items-center gap-1.5 text-xs font-medium ${highlight ? "text-primary" : "text-muted-foreground"}`}
      >
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function MyListingsPanel({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">No items listed yet</p>
        <p className="text-sm text-muted-foreground">
          Use the &ldquo;List item&rdquo; button above to share something with
          your neighbours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.name}</p>
            {item.description && (
              <p className="truncate text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              item.status === "available"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {item.status === "available" ? "Available" : "Borrowed"}
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { BorrowModal } from "@/components/BorrowModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/types";

type SortOption = "newest" | "oldest" | "name-asc" | "available-first";
type FilterStatus = "all" | "available" | "borrowed";

interface ItemFeedProps {
  initialItems: Item[];
  currentUserId: number;
}

export function ItemFeed({ initialItems, currentUserId }: ItemFeedProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selected, setSelected] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterStatus>("all");

  function handleBorrowSuccess(borrowedId: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === borrowedId
          ? { ...item, status: "borrowed" as const }
          : item,
      ),
    );
    setSelected(null);
  }

  const displayed = useMemo(() => {
    let list = [...items];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.owner_first_name.toLowerCase().includes(q) ||
          i.owner_apartment.toLowerCase().includes(q),
      );
    }

    if (filter === "available")
      list = list.filter((i) => i.status === "available");
    if (filter === "borrowed")
      list = list.filter((i) => i.status === "borrowed");

    switch (sort) {
      case "oldest":
        list.sort((a, b) => a.id - b.id);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "available-first":
        list.sort((a, b) => {
          if (a.status === b.status) return 0;
          return a.status === "available" ? -1 : 1;
        });
        break;
      default:
        list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [items, query, sort, filter]);

  const availableCount = items.filter((i) => i.status === "available").length;

  return (
    <>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items, owners, apartments…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as FilterStatus)}
          >
            <SelectTrigger className="w-36 gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="available">Available only</SelectItem>
              <SelectItem value="borrowed">Checked out</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">A → Z</SelectItem>
              <SelectItem value="available-first">Available first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {displayed.length} item{displayed.length !== 1 ? "s" : ""}
        </span>
        {query && <Badge variant="secondary">&ldquo;{query}&rdquo;</Badge>}
        <span className="ml-auto">{availableCount} available</span>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              onBorrow={setSelected}
            />
          ))}
        </div>
      )}

      {selected && (
        <BorrowModal
          item={selected}
          onSuccess={handleBorrowSuccess}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

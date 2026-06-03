"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  StickyNote,
  Package,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getItemVisual } from "@/lib/itemVisuals";
import type { ActiveBorrow } from "@/types";

interface MyBorrowsProps {
  borrows: ActiveBorrow[];
}

function DueBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0)
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Overdue by {Math.abs(daysLeft)}d
      </Badge>
    );
  if (daysLeft === 0)
    return (
      <Badge className="gap-1 bg-orange-500 hover:bg-orange-500">
        <AlertTriangle className="h-3 w-3" />
        Due today
      </Badge>
    );
  if (daysLeft <= 3)
    return (
      <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
        <AlertTriangle className="h-3 w-3" />
        {daysLeft}d left
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1">
      <CalendarDays className="h-3 w-3" />
      {daysLeft}d left
    </Badge>
  );
}

function progressValue(daysLeft: number): number {
  if (daysLeft <= 0) return 100;
  if (daysLeft >= 30) return 5;
  return Math.round(((30 - daysLeft) / 30) * 100);
}

function progressColor(daysLeft: number): string {
  if (daysLeft < 0) return "bg-destructive";
  if (daysLeft <= 3) return "bg-amber-500";
  return "bg-primary";
}

function toDateInput(dateStr: string) {
  return new Date(dateStr).toISOString().split("T")[0];
}

export function MyBorrows({ borrows: initialBorrows }: MyBorrowsProps) {
  const router = useRouter();
  const [borrows, setBorrows] = useState<ActiveBorrow[]>(initialBorrows);
  const [cancelTarget, setCancelTarget] = useState<ActiveBorrow | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Extend state
  const [extendTarget, setExtendTarget] = useState<ActiveBorrow | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extending, setExtending] = useState(false);

  function openExtend(b: ActiveBorrow) {
    // Default: current due_date + 7 days
    const next = new Date(b.due_date);
    next.setDate(next.getDate() + 7);
    setExtendDate(toDateInput(next.toISOString()));
    setExtendTarget(b);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(
        `/api/borrow/${cancelTarget.transaction_id}/cancel`,
        {
          method: "PATCH",
        },
      );
      if (res.ok) {
        setBorrows((prev) =>
          prev.filter((b) => b.transaction_id !== cancelTarget.transaction_id),
        );
        toast.success(`Borrow for "${cancelTarget.item_name}" cancelled`);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Could not cancel");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  async function confirmExtend() {
    if (!extendTarget || !extendDate) return;
    setExtending(true);
    try {
      const res = await fetch(
        `/api/borrow/${extendTarget.transaction_id}/extend`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_due_date: extendDate }),
        },
      );
      if (res.ok) {
        const { due_date } = await res.json();
        setBorrows((prev) =>
          prev.map((b) =>
            b.transaction_id === extendTarget.transaction_id
              ? {
                  ...b,
                  due_date,
                  days_left: Math.round(
                    (new Date(due_date).getTime() - Date.now()) / 86400000,
                  ),
                }
              : b,
          ),
        );
        toast.success(
          `Borrow extended to ${new Date(due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        );
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Could not extend");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setExtending(false);
      setExtendTarget(null);
    }
  }

  if (borrows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Nothing borrowed right now</p>
        <p className="text-sm text-muted-foreground">
          Head over to Browse to find something useful.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {borrows.map((b) => {
          const visual = getItemVisual(b.item_name);
          return (
            <div
              key={b.transaction_id}
              className="group flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              {/* Icon block */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                {b.image_url ? (
                  <Image
                    src={b.image_url}
                    alt={b.item_name}
                    fill
                    className="object-cover"
                    unoptimized={b.image_url.startsWith("/uploads")}
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${visual.gradient}`}
                  >
                    <Package className="h-6 w-6 text-white/90" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold">{b.item_name}</span>
                  <DueBadge daysLeft={b.days_left} />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    From{" "}
                    <span className="font-medium text-foreground">
                      {b.owner_first_name}
                    </span>
                    {" · "}Apt {b.owner_apartment}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Return by{" "}
                    <span className="font-medium text-foreground">
                      {new Date(b.due_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>

                {b.notes && (
                  <div className="mt-1 flex items-start gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-sm">
                    <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{b.notes}</span>
                  </div>
                )}

                {/* Time progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor(b.days_left)}`}
                    style={{ width: `${progressValue(b.days_left)}%` }}
                  />
                </div>

                {/* Extend button */}
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground transition-opacity hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => openExtend(b)}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Extend period
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 self-start text-muted-foreground transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => setCancelTarget(b)}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Cancel</span>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <Dialog open onOpenChange={(open) => !open && setCancelTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Cancel this borrow?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              You&apos;re about to cancel your borrow of{" "}
              <span className="font-semibold text-foreground">
                {cancelTarget.item_name}
              </span>
              . The item will immediately become available to others.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Extend period dialog */}
      {extendTarget && (
        <Dialog open onOpenChange={(open) => !open && setExtendTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Extend borrow period
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Currently due{" "}
              <span className="font-semibold text-foreground">
                {new Date(extendTarget.due_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              . Choose a new return date.
            </p>
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="extend-date">New return date</Label>
              <Input
                id="extend-date"
                type="date"
                value={extendDate}
                onChange={(e) => setExtendDate(e.target.value)}
                min={(() => {
                  const d = new Date(extendTarget.due_date);
                  d.setDate(d.getDate() + 1);
                  return toDateInput(d.toISOString());
                })()}
                max={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 90);
                  return toDateInput(d.toISOString());
                })()}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setExtendTarget(null)}
                disabled={extending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmExtend}
                disabled={!extendDate || extending}
              >
                {extending ? "Extending…" : "Extend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarDays, StickyNote, User, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getItemVisual } from "@/lib/itemVisuals";
import type { Item } from "@/types";

interface BorrowModalProps {
  item: Item;
  onSuccess: (itemId: number) => void;
  onClose: () => void;
}

export function BorrowModal({ item, onSuccess, onClose }: BorrowModalProps) {
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const visual = getItemVisual(item.name);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  async function handleConfirm() {
    if (!dueDate) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          due_date: dueDate,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success(`"${item.name}" is now yours until ${dueDate}`, {
          description: "Remember to return it on time!",
        });
        onSuccess(item.id);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Something went wrong");
        if (res.status === 409) onClose();
      }
    } catch {
      toast.error("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm borrow request</DialogTitle>
        </DialogHeader>

        {/* Item preview banner */}
        <div
          className={`-mx-6 -mt-2 flex items-center gap-4 bg-gradient-to-r ${visual.gradient} p-4`}
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized={item.image_url.startsWith("/uploads")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/20">
                <Package className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-white/80">{visual.category}</p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">{item.owner_first_name}</span>
              <span className="text-muted-foreground">
                {" "}
                · Apartment {item.owner_apartment}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="due-date" className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Return by
            </Label>
            <Input
              id="due-date"
              type="date"
              min={minDate}
              max={maxDateStr}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 90 days from today
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Note to owner{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. I'll pick it up on Wednesday evening…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={300}
            />
            <p className="text-right text-xs text-muted-foreground">
              {notes.length}/300
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!dueDate || submitting}>
            {submitting ? "Confirming…" : "Confirm borrow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

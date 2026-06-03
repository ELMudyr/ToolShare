import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package, Clock, User } from "lucide-react";
import { getItemVisual } from "@/lib/itemVisuals";
import type { Item } from "@/types";

interface ItemCardProps {
  item: Item;
  currentUserId: number;
  onBorrow: (item: Item) => void;
}

export function ItemCard({ item, currentUserId, onBorrow }: ItemCardProps) {
  const available = item.status === "available";
  const isOwner = item.owner_id === currentUserId;
  const visual = getItemVisual(item.name);

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 sm:hover:shadow-lg sm:hover:-translate-y-0.5">
      <div
        className={`relative h-40 overflow-hidden bg-gradient-to-br ${visual.gradient}`}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 sm:group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={item.image_url.startsWith("/uploads")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-14 w-14 text-white/60" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {visual.category}
          </span>
        </div>
        <div className="absolute right-2.5 top-2.5">
          <Badge
            variant={available ? "default" : "secondary"}
            className={
              available
                ? "border-0 bg-emerald-500 text-white text-[10px]"
                : "border-0 bg-black/40 text-white/80 text-[10px]"
            }
          >
            {available ? "Available" : "Checked out"}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold leading-snug">{item.name}</h3>
        {item.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="font-medium text-foreground">
            {item.owner_first_name}
          </span>
          <span>· Apt {item.owner_apartment}</span>
          {isOwner && (
            <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium">
              Yours
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        {isOwner ? (
          <Button className="w-full" variant="outline" disabled>
            Your listing
          </Button>
        ) : available ? (
          <Button className="w-full" onClick={() => onBorrow(item)}>
            Borrow this item
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            <Clock className="mr-2 h-3.5 w-3.5" />
            Currently checked out
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

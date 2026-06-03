"use client";

import Link from "next/link";
import { Wrench, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import type { SessionUser } from "@/types";

interface NavbarProps {
  user: SessionUser;
}

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Navbar({ user }: NavbarProps) {
  const color = avatarColor(user.full_name);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-semibold"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline">ToolShare</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>
            Apt{" "}
            <span className="font-medium text-foreground">
              {user.apartment_number}
            </span>
          </span>
        </div>

        <div className="ml-auto">
          <ProfileDropdown user={user} color={color} />
        </div>
      </div>
    </header>
  );
}

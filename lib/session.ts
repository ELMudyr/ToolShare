import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

export function getSession(): SessionUser | null {
  const raw = cookies().get("toolshare_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8"),
    ) as SessionUser;
  } catch {
    return null;
  }
}

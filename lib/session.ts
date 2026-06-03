import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get("toolshare_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8"),
    ) as SessionUser;
  } catch {
    return null;
  }
}

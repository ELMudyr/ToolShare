import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { SessionUser } from "@/types";

interface UserRow {
  id: number;
  full_name: string;
  email: string;
  apartment_number: string;
  avatar_url: string | null;
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { full_name, email, apartment_number, avatar_url } = body;

  if (full_name !== undefined && (typeof full_name !== "string" || !full_name.trim())) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }
  if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Check email uniqueness if changing
  if (email && email !== session.email) {
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? AND id != ?",
      args: [email, session.id],
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (full_name !== undefined) {
    updates.push("full_name = ?");
    values.push(full_name.trim());
  }
  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email.trim());
  }
  if (apartment_number !== undefined) {
    updates.push("apartment_number = ?");
    values.push(apartment_number.trim());
  }
  if (avatar_url !== undefined) {
    updates.push("avatar_url = ?");
    values.push(avatar_url);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  values.push(session.id);
  await db.execute({
    sql: `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    args: values as import("@libsql/client").InValue[],
  });

  const { rows: updatedRows } = await db.execute({
    sql: "SELECT id, full_name, email, apartment_number, avatar_url FROM users WHERE id = ?",
    args: [session.id],
  });
  const updated = updatedRows[0] as unknown as UserRow;

  const newSession: SessionUser = {
    id: Number(updated.id),
    full_name: String(updated.full_name),
    email: String(updated.email),
    apartment_number: String(updated.apartment_number),
    avatar_url: updated.avatar_url as string | null ?? null,
  };

  const encoded = Buffer.from(JSON.stringify(newSession)).toString("base64");

  const res = NextResponse.json(newSession);
  res.cookies.set("toolshare_session", encoded, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

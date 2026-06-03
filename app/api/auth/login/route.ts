import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { SessionUser } from "@/types";

interface UserRow {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  apartment_number: string;
  avatar_url: string | null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const { rows } = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email],
  });
  const user = rows[0] as unknown as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, String(user.password_hash))) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const session: SessionUser = {
    id: Number(user.id),
    full_name: String(user.full_name),
    email: String(user.email),
    apartment_number: String(user.apartment_number),
    avatar_url: user.avatar_url as string | null ?? null,
  };

  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");

  const res = NextResponse.json({ id: Number(user.id), full_name: String(user.full_name) });
  res.cookies.set("toolshare_session", encoded, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}

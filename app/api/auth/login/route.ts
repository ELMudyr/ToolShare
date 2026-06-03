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

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const session: SessionUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    apartment_number: user.apartment_number,
  };

  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");

  const res = NextResponse.json({ id: user.id, full_name: user.full_name });
  res.cookies.set("toolshare_session", encoded, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}

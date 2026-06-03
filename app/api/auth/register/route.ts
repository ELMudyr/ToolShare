import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { full_name, email, password, apartment_number } = body ?? {};

  if (!full_name || !email || !password || !apartment_number) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email.toLowerCase().trim());

  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const result = db
    .prepare(
      "INSERT INTO users (full_name, email, password_hash, apartment_number) VALUES (?, ?, ?, ?)",
    )
    .run(
      full_name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      apartment_number.trim(),
    );

  const session: SessionUser = {
    id: Number(result.lastInsertRowid),
    full_name: full_name.trim(),
    email: email.toLowerCase().trim(),
    apartment_number: apartment_number.trim(),
  };

  const encoded = Buffer.from(JSON.stringify(session)).toString("base64");

  const res = NextResponse.json(
    { id: session.id, full_name: session.full_name },
    { status: 201 },
  );
  res.cookies.set("toolshare_session", encoded, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}

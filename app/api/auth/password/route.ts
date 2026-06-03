import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { current_password, new_password } = body ?? {};

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: "Both current and new passwords are required" },
      { status: 400 },
    );
  }
  if (new_password.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const { rows } = await db.execute({
    sql: "SELECT password_hash FROM users WHERE id = ?",
    args: [session.id],
  });
  const user = rows[0] as unknown as { password_hash: string } | undefined;

  if (!user || !bcrypt.compareSync(current_password, String(user.password_hash))) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  const hash = bcrypt.hashSync(new_password, 10);
  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [hash, session.id],
  });

  return NextResponse.json({ ok: true });
}

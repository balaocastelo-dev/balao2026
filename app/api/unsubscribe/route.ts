import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Insert into blacklist (idempotent por e-mail)
    await turso.execute({
      sql: `INSERT INTO unsubscribed_emails (id, email) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      args: [randomUUID(), String(email)],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

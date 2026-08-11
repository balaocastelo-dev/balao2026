import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Insert into blacklist
    const { error } = await supabaseAdmin
      .from('unsubscribed_emails')
      .upsert({ email }, { onConflict: 'email' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

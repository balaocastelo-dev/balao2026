import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(req: Request) {
  try {
    // Delete all orders
    const { error: errorOrders } = await supabaseAdmin
      .from('weekly_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (errorOrders) throw errorOrders;

    // Delete all expenses
    const { error: errorExpenses } = await supabaseAdmin
      .from('weekly_expenses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (errorExpenses) throw errorExpenses;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

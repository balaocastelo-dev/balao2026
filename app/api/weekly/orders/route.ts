import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('weekly_orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase
    const mappedData = data.map((item: any) => ({
      id: item.id,
      osNumber: item.os_number,
      status: item.status,
      date: item.date,
      laborIncome: Number(item.labor_income),
      partsIncome: Number(item.parts_income),
      laborExpense: Number(item.labor_expense),
      partsExpense: Number(item.parts_expense),
      paymentMethod: item.payment_method
    }));

    return NextResponse.json(mappedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Map camelCase to snake_case
    const dbPayload = {
      id: body.id,
      os_number: body.osNumber,
      status: body.status,
      date: body.date,
      labor_income: body.laborIncome,
      parts_income: body.partsIncome,
      labor_expense: body.laborExpense,
      parts_expense: body.partsExpense,
      payment_method: body.paymentMethod
    };

    const { data, error } = await supabaseAdmin
      .from('weekly_orders')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    // Map back to camelCase for response
    const mappedResponse = {
      id: data.id,
      osNumber: data.os_number,
      status: data.status,
      date: data.date,
      laborIncome: Number(data.labor_income),
      partsIncome: Number(data.parts_income),
      laborExpense: Number(data.labor_expense),
      partsExpense: Number(data.parts_expense),
      paymentMethod: data.payment_method
    };

    return NextResponse.json(mappedResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('weekly_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

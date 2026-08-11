import { NextResponse } from 'next/server';
import { saveImportHistory } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveImportHistory(body);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to save history' }, { status: 500 });
  }
}

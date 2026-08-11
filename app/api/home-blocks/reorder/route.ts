
import { NextResponse } from 'next/server';
import { updateHomeBlock } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Items array is required" }, { status: 400 });
        }

        // Process in parallel
        await Promise.all(items.map(async (item: any) => {
            if (item.id && typeof item.display_order === 'number') {
                await updateHomeBlock(item.id, { display_order: item.display_order });
            }
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error reordering home blocks:", error);
        return NextResponse.json({ error: "Failed to reorder home blocks" }, { status: 500 });
    }
}

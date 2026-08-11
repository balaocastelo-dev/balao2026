import { NextResponse } from 'next/server';
import { updateCarouselImage } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: "Items array is required" },
                { status: 400, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        // Process in parallel
        await Promise.all(items.map(async (item: any) => {
            if (item.id && typeof item.display_order === 'number') {
                await updateCarouselImage(item.id, { display_order: item.display_order });
            }
        }));

        return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error("Error reordering images:", error);
        return NextResponse.json(
            { error: "Failed to reorder images" },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

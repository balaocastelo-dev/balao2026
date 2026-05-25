import { NextResponse } from 'next/server';
import { getCarouselImages, addCarouselImage, deleteCarouselImage, updateCarouselImage } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const images = await getCarouselImages(false); // Fetch all, including inactive
  return NextResponse.json(images, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { imageUrl, title, metadata } = await request.json();
    if (!imageUrl) {
        return NextResponse.json({ error: "Image URL is required" }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const newImage = await addCarouselImage(imageUrl, title, metadata);
    return NextResponse.json(newImage, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Error adding carousel image:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updates } = data;
        
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        await updateCarouselImage(id, updates);
        return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error("Error updating carousel image:", error);
        return NextResponse.json({ error: "Failed to update image" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        await deleteCarouselImage(id);
        return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error("Error deleting carousel image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}

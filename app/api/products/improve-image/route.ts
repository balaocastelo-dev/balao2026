import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// Helper to create admin client for storage upload
const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, name, migrate = false } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    console.log(`[ImproveImage] Processing: ${imageUrl}`);

    // 1. Download image
    const response = await fetch(imageUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Process with Sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let processed = image;

    // Upscale if small (e.g., width < 1200)
    const targetWidth = 1200;
    if (metadata.width && metadata.width < targetWidth) {
        console.log(`[ImproveImage] Upscaling from ${metadata.width}px to ${targetWidth}px`);
        processed = processed.resize(targetWidth, null, {
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: false
        });
    }

    // Apply sharpening and quality improvements
    processed = processed
        .sharpen({ sigma: 1.0, m1: 0.5, m2: 0.5 }) // Subtle sharpening
        .webp({ quality: 90, lossless: false, effort: 6 }); // Convert to high-quality WebP

    const outputBuffer = await processed.toBuffer();

    if (migrate) {
        // 3. Upload to Supabase Storage if requested
        const adminClient = createAdminClient();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const bucket = "products";

        // Ensure bucket exists
        const { data: buckets } = await adminClient.storage.listBuckets();
        if (!buckets?.some(b => b.name === bucket)) {
            await adminClient.storage.createBucket(bucket, { public: true });
        }

        const { error: uploadError } = await adminClient.storage
            .from(bucket)
            .upload(fileName, outputBuffer, {
                contentType: 'image/webp',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = adminClient.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return NextResponse.json({ 
            success: true, 
            url: publicUrl,
            originalUrl: imageUrl,
            improved: true,
            migrated: true
        });
    }

    // If not migrating, return base64 or a local temp URL (but base64 is safer for preview)
    const base64 = outputBuffer.toString('base64');
    return NextResponse.json({ 
        success: true, 
        url: `data:image/webp;base64,${base64}`,
        originalUrl: imageUrl,
        improved: true,
        migrated: false
    });

  } catch (error: any) {
    console.error("[ImproveImage] Error:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar imagem" }, { status: 500 });
  }
}

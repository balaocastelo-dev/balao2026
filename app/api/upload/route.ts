import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para criar o cliente Supabase com privilégios administrativos
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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 1. Verificar/Criar Bucket
    try {
        const { data: buckets } = await adminClient.storage.listBuckets();
        const bucketExists = buckets?.some((b: any) => b.name === bucket);
        
        if (!bucketExists) {
            await adminClient.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 10485760,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
            });
        } else {
            // Se o bucket já existe, atualize para garantir que seja público
            await adminClient.storage.updateBucket(bucket, {
                public: true,
                fileSizeLimit: 10485760,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
            });
        }
    } catch (e) {
        console.warn("Aviso ao verificar buckets:", e);
    }

    // 2. Upload
    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 3. Obter URL Pública
    const { data: { publicUrl } } = adminClient.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 });
  }
}

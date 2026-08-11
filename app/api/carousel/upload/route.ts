import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para criar o cliente Supabase com privilégios administrativos
const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida. Impossível realizar operações administrativas.");
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
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Inicializa cliente admin
    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch (e: any) {
        console.error("Erro ao inicializar cliente admin:", e);
        return NextResponse.json({ 
            error: "Erro de Configuração: " + e.message + " Adicione a chave SUPABASE_SERVICE_ROLE_KEY ao arquivo .env." 
        }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const BUCKET_NAME = 'carousel';

    // 1. Verificar/Criar Bucket
    try {
        const { data: buckets } = await adminClient.storage.listBuckets();
        const bucketExists = buckets?.some((b: any) => b.name === BUCKET_NAME);
        
        if (!bucketExists) {
            console.log(`Bucket ${BUCKET_NAME} não encontrado. Criando...`);
            const { error: createError } = await adminClient.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
            });
            if (createError) {
                console.warn("Aviso: Falha ao criar bucket (pode já existir ou erro de permissão):", createError.message);
            }
        } else {
            // Se o bucket já existe, atualize para garantir que seja público
            await adminClient.storage.updateBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 10485760,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
            });
        }
    } catch (e) {
        console.warn("Aviso ao verificar buckets:", e);
    }

    // 2. Upload da Imagem
    const { error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Erro no upload (Storage):", uploadError);
      return NextResponse.json({ error: "Falha no upload da imagem: " + uploadError.message }, { status: 500 });
    }

    // 3. Obter URL Pública
    const { data: { publicUrl } } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // 4. Inserir no Banco de Dados
    // Buscar próximo display_order
    const { data: maxOrderData } = await adminClient
        .from('carousel_images')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
    
    const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

    const { data, error: dbError } = await adminClient
        .from('carousel_images')
        .insert({
            image_url: publicUrl,
            title: title || file.name,
            display_order: nextOrder,
            active: true,
            metadata: {
                size: file.size,
                type: file.type,
                origin: 'upload'
            }
        })
        .select()
        .single();

    if (dbError) {
        console.error("Erro na inserção (DB):", dbError);

        // Verifica se o erro é "tabela não existe" (código 42P01)
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist') || dbError.message?.includes('Could not find the table')) {
             return NextResponse.json({ 
                 error: "A tabela 'carousel_images' não existe. Execute o script 'supabase/setup.sql' no SQL Editor do Supabase." 
             }, { status: 500 });
        }

        // Tentar limpar a imagem enviada se falhar no banco (opcional, mas boa prática)
        await adminClient.storage.from(BUCKET_NAME).remove([fileName]);
        return NextResponse.json({ error: "Falha ao salvar registro no banco de dados: " + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Erro geral na rota de upload:", error);
    return NextResponse.json({ error: error.message || "Erro desconhecido no servidor" }, { status: 500 });
  }
}

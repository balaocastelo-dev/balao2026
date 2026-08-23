import { NextResponse } from 'next/server';

// Endpoint aposentado na migração Supabase -> Turso.
// As imagens agora são hospedadas localmente em /public/uploads
// e as URLs dos produtos apontam direto para lá.
export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint descontinuado',
      details: 'A migração de imagens para o Storage do Supabase foi aposentada. Imagens agora ficam em /uploads no próprio projeto.',
    },
    { status: 410 }
  );
}

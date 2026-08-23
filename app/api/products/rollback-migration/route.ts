import { NextResponse } from 'next/server';

// Endpoint aposentado na migração Supabase -> Turso.
// O rollback da antiga migração de imagens não se aplica mais.
export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint descontinuado',
      details: 'O rollback de migração de imagens do Supabase não é mais necessário.',
    },
    { status: 410 }
  );
}

import { NextResponse } from 'next/server';

// Esta rota servia a landing "H2 Fluxo", uma segunda pagina de vendas do
// mesmo produto. Duas paginas para um produto so dividem o SEO e confundem
// quem recebe o link, e esta versao ainda mostrava depoimentos de exemplo
// ("Depoimento em breve") visiveis ao visitante.
//
// A pagina oficial passa a ser /software/sistemadefila, que tem preco,
// prints reais do sistema e a oferta de licenca vitalicia.
//
// O HTML antigo continua no historico do git (commit anterior a este) e
// tambem em "Desktop/VENDA DO H2/h2fluxo-route.ts.bak", caso o hero e a
// copy de dor sejam reaproveitados depois.
export function GET() {
  return NextResponse.redirect(
    'https://www.balao.info/software/sistemadefila/',
    307, // temporario de proposito: 308 fica cacheado no navegador e e dificil de desfazer
  );
}

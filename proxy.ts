import { NextResponse, type NextRequest } from 'next/server'

/**
 * Tranca do administrativo.
 *
 * Até aqui, TODA a administração do site estava aberta na internet: qualquer
 * pessoa que soubesse o endereço podia abrir /admin/produtos, mudar preço,
 * apagar produto, trocar o carrossel, criar cupom ou rodar a "rollback" da
 * migração de imagens — sem senha nenhuma. As rotas de API por trás dessas
 * telas também aceitavam POST/PUT/DELETE de qualquer origem.
 *
 * A trava é a MESMA senha que já protege /crm e /painel (cookie de sessão do
 * painel): quem entrou em um, entra nos outros. Nada muda para quem usa a
 * loja — leitura (GET) continua pública, e as rotas do site (checkout,
 * contato, leads, validação de cupom, rastreio, descadastro, webhook do Pix)
 * ficam de fora desta lista de propósito.
 *
 * Para script ou automação sem navegador existe a alternativa do cabeçalho
 * `x-balao-admin-token`, conferido contra a variável ADMIN_API_TOKEN.
 * Enquanto essa variável não existir, só o cookie vale.
 */

const COOKIE = 'balao_painel_session'

// A loja tem DUAS portas de entrada, e as duas são legítimas:
//  - a senha do painel (cookie acima), que abre /crm, /painel e o /admin;
//  - a senha do dia do balcão (cookie abaixo), que abre /controle/admin e
//    /fechamento — é a que o pessoal da loja usa no dia a dia.
//
// A tranca do administrativo só conhecia a primeira. Resultado: quem entrava
// com a senha do dia para fechar a semana recebia 401 ao salvar, e o
// fechamento simplesmente não gravava. Aqui a segunda porta volta a valer,
// mas só nas rotas que são dela.
const COOKIE_BALCAO = 'controle_admin_auth'
const API_DO_BALCAO = ['/api/weekly', '/api/upload', '/api/controle']

/** A senha do dia: 56676009 + dia + mês + ano, no fuso de São Paulo. */
function senhaDoDia() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(new Date())
    .filter((p) => p.type !== 'literal')
  const m = Object.fromEntries(partes.map((p) => [p.type, p.value])) as Record<string, string>
  return `56676009${m.day}${m.month}${m.year}`
}

function ehApiDoBalcao(pathname: string) {
  return API_DO_BALCAO.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// Rotas de API em que só o administrador pode ESCREVER (GET segue liberado).
const API_SO_ESCRITA = [
  '/api/products',
  '/api/categories',
  '/api/carousel',
  '/api/coupons',
  '/api/home-blocks',
  '/api/topbar',
  '/api/seminovos',
  '/api/vitrine/pages',
  '/api/vitrine/images',
  '/api/weekly',
  '/api/upload',
  '/api/scrape',
  '/api/admin',
  '/api/ai',
  '/api/history',
]

// Dentro dos prefixos acima, estas continuam públicas (a loja depende delas).
const EXCECOES_PUBLICAS = ['/api/coupons/validate']

/**
 * Rotas em que NEM LER é público, porque o GET delas ESCREVE no banco.
 *
 * `/api/admin/seed-categories` começa com `DELETE FROM categories`: abrir esse
 * endereço no navegador apagava a árvore de categorias da loja inteira e
 * recriava a de fábrica. `/api/seed` insere a árvore de fábrica de novo, o que
 * duplica tudo. Nenhuma das duas pedia senha, e por serem GET a trava de
 * escrita acima não as pegava — bastava alguém ter o endereço.
 */
const API_PROTEGIDA_SEMPRE = ['/api/seed', '/api/admin/seed-categories']

function ehApiProtegidaSempre(pathname: string) {
  return API_PROTEGIDA_SEMPRE.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function ehApiProtegida(pathname: string) {
  if (EXCECOES_PUBLICAS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false
  return API_SO_ESCRITA.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * O mesmo token de sessão que `lib/painel-auth.ts` monta — só que aqui pelo
 * Web Crypto, porque o proxy não roda no Node.
 */
let tokenEsperado: Promise<string> | null = null
function calcularToken(senha: string) {
  if (!tokenEsperado) {
    tokenEsperado = crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(`${senha}:balao-painel`))
      .then((buf) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      )
  }
  return tokenEsperado
}

/** Comparação de tempo constante, para não vazar o token letra por letra. */
function iguais(a: string, b: string) {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diferenca === 0
}

async function estaAutenticado(request: NextRequest) {
  const senha = process.env.PAINEL_PASSWORD || ''
  // Sem senha configurada ninguém entra — a mesma guarda de lib/painel-auth.
  if (!senha) return false

  const token = process.env.ADMIN_API_TOKEN
  if (token) {
    const enviado = request.headers.get('x-balao-admin-token') || ''
    if (enviado && iguais(enviado, token)) return true
  }

  const sessao = request.cookies.get(COOKIE)?.value
  if (!sessao) return false
  return iguais(sessao, await calcularToken(senha))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const metodo = request.method.toUpperCase()

  // Telas do administrativo: pede a senha antes de mostrar qualquer coisa.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!(await estaAutenticado(request))) {
      const destino = request.nextUrl.clone()
      destino.pathname = '/painel'
      destino.search = ''
      return NextResponse.redirect(destino)
    }
    return NextResponse.next({ request })
  }

  // Rotas cujo GET escreve no banco: senha em qualquer método.
  if (ehApiProtegidaSempre(pathname)) {
    if (!(await estaAutenticado(request))) {
      return NextResponse.json(
        { ok: false, error: 'Acesso negado. Esta rota altera o banco e exige a senha do painel.' },
        { status: 401 }
      )
    }
  }

  // API: leitura continua pública; escrita pede a senha.
  if (metodo !== 'GET' && metodo !== 'HEAD' && metodo !== 'OPTIONS' && ehApiProtegida(pathname)) {
    // Nas rotas do balcão, a senha do dia também abre.
    const comSenhaDoDia =
      ehApiDoBalcao(pathname) && request.cookies.get(COOKIE_BALCAO)?.value === senhaDoDia()
    if (!comSenhaDoDia && !(await estaAutenticado(request))) {
      return NextResponse.json(
        {
          ok: false,
          error: ehApiDoBalcao(pathname)
            ? 'Acesso negado. Entre de novo com a senha do dia e tente outra vez.'
            : 'Acesso negado. Entre no painel do Balão antes de alterar o catálogo.',
        },
        { status: 401 }
      )
    }
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { MetadataRoute } from 'next'
import { getCachedCategories } from '@/lib/cache'
import { lerProdutosDoSitemap, dataDoProduto, fatiarProdutos, PRODUTOS_POR_ARQUIVO } from '@/lib/sitemap/produtos'
import { slugsAusentes } from '@/lib/sitemap/artigos'
import { lerCaminhosComProduto, categoriaTemProduto } from '@/lib/sitemap/categorias'
import { CATEGORIAS } from '@/lib/blog/categorias'
import { listarArtigosDaCasa, listarResumos, obterArtigo } from '@/lib/blog/repositorio'
import { LEAD_INTENTS } from '@/lib/lead-intents'
import { REGIONAL_CITIES, REGIONAL_SERVICES, buildRegionalServicePath } from '@/lib/local-seo'
import { CAMPINAS_NEIGHBORHOODS } from '@/lib/neighborhood-seo'
import { listVitrinePagesPublic } from '@/lib/vitrine/db'
import { paginaAssinadaPorSlug, SETUPS_ASSINADOS } from '@/lib/vitrine/assinadas'
import { getCachedProductByIdentifier } from '@/lib/cache'
import { PAGINAS } from '@/lib/landing/paginas'
import { listarConsignados, urlDoConsignado } from '@/lib/consignados'

const baseUrl = 'https://www.balao.info'

async function paginas(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/blog',
    '/blog/gta-6',
    '/servicos-e-ofertas',
    '/promocao',
    '/manutencao',
    '/upgrade-ssd',
    '/formatacao',
    '/notebook-dell',
    '/notebook-lenovo',
    '/notebook-acer',
    '/notebook-hp',
    '/notebook-asus',
    '/notebook-samsung',
    '/qual-pc-gamer',
    '/recuperacaodados',
    '/montagempc',
    '/sistemas',
    '/sistemasdeia',
    '/pcgamer3d',
    '/consignacao',
    '/consignados',
    '/premium',
    '/ia-local',
    '/pcgamer',
    '/notebooks',
    '/queda-de-preco',
    '/seminovos',
    '/monteseupc',
    '/departamentos',
    '/fale-conosco',
    '/especialidades',
    '/regiao',
    '/urgente',
    '/sobre-nos',
    '/sobre-a-empresa',
    '/assistenciagames',
    '/carregadores',
    '/microsoft',
    '/microsoft/windows',
    '/microsoft/windows-server',
    '/microsoft/office-365',
    '/reparoapple',
    '/macbook',
    '/imac',
    '/iphone',
    '/android',
    '/acer-aspire-go-15',
    '/telaiphone',
    '/toner',
    '/livros',
    '/vitrine',
    '/wendell/apple',
    '/wendell/apple/blog',
    '/wendell/apple/ipad',
    '/wendell/apple/apple-watch',
    '/wendell/apple/mac-mini',
    '/como-comprar',
    '/envio-e-entrega',
    '/trocas-e-devolucoes',
    '/seguranca-e-privacidade',
    '/overclock',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : PAGINAS[route.slice(1)] ? 0.9 : 0.7,
  }))

  const categories = await getCachedCategories().catch(() => [])
  const caminhosComProduto = await lerCaminhosComProduto().catch(() => [] as string[])
  const categoryRoutes = categories
    .filter((category) =>
      caminhosComProduto.length === 0 ||
      categoriaTemProduto(category.full_path, caminhosComProduto)
    )
    .map((category) => ({
      url: `${baseUrl}/categoria/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const artigos = await listarResumos({ tolerante: true }).catch(() => [])
  const daCasa = new Set((await listarArtigosDaCasa().catch(() => [])).map((a) => a.slug))
  const diarios = artigos.filter((a) => !daCasa.has(a.slug)).map((a) => a.slug)
  const mortos = await slugsAusentes(diarios, async (slug) => {
    try {
      return (await obterArtigo(slug)) ? 'existe' : 'ausente'
    } catch {
      return 'incerto'
    }
  }).catch(() => new Set<string>())
  const blogRoutes = [
    ...artigos
      .filter((artigo) => !mortos.has(artigo.slug))
      .map((artigo) => ({
        url: `${baseUrl}/blog/${artigo.slug}`,
        lastModified: new Date(artigo.publicadoEm),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    ...CATEGORIAS.filter((c) => artigos.some((a) => a.categoria === c.slug && !mortos.has(a.slug))).map((c) => ({
      url: `${baseUrl}/blog/categoria/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  const setupsVivos = (
    await Promise.all(
      SETUPS_ASSINADOS.map(async (s) => {
        const pagina = await paginaAssinadaPorSlug(s.slug, getCachedProductByIdentifier).catch(() => null)
        return pagina ? s : null
      })
    )
  ).filter((s): s is (typeof SETUPS_ASSINADOS)[number] => Boolean(s))

  const vitrinePages = [
    ...setupsVivos.map((s) => ({ slug: s.slug, data_publicacao: s.publicado_em, data_criacao: s.publicado_em })),
    ...(await listVitrinePagesPublic().catch(() => [])),
  ]
  const vitrineRoutes = vitrinePages.map((p) => ({
    url: `${baseUrl}/p/${p.slug}`,
    lastModified: new Date(p.data_publicacao || p.data_criacao || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const regionalRoutes = REGIONAL_CITIES.flatMap((city) =>
    REGIONAL_SERVICES.map((service) => ({
      url: `${baseUrl}${buildRegionalServicePath(city.slug, service.slug)}`,
      changeFrequency: 'weekly' as const,
      priority: city.slug === 'campinas' ? 0.82 : 0.76,
    }))
  )

  const urgentRoutes = LEAD_INTENTS.map((intent) => ({
    url: `${baseUrl}/urgente/${intent.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.78,
  }))

  const neighborhoodRoutes = CAMPINAS_NEIGHBORHOODS.map((neighborhood) => ({
    url: `${baseUrl}/bairro/${neighborhood.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const consignados = await listarConsignados().catch(() => [])
  const consignadoRoutes = consignados.map((item) => ({
    url: urlDoConsignado(item),
    lastModified: new Date(item.desde),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...consignadoRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...vitrineRoutes,
    ...regionalRoutes,
    ...urgentRoutes,
    ...neighborhoodRoutes,
  ]
}

async function produtosDoPedaco(indice: number): Promise<MetadataRoute.Sitemap> {
  const products = await lerProdutosDoSitemap()
  const fatia = fatiarProdutos(products, PRODUTOS_POR_ARQUIVO)[indice] || []
  return fatia.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: dataDoProduto(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
}

export async function generateSitemaps() {
  const products = await lerProdutosDoSitemap().catch(() => [])
  const fatias = products.length === 0 ? [] : fatiarProdutos(products, PRODUTOS_POR_ARQUIVO)
  return [
    { id: 'paginas' },
    ...fatias.map((_, i) => ({ id: `produtos-${i}` })),
  ]
}

export default async function sitemap(
  props: { id: Promise<string> | string }
): Promise<MetadataRoute.Sitemap> {
  const id = typeof props.id === 'string' ? props.id : await props.id
  if (id === 'paginas') return paginas()
  const indice = Number(String(id).replace('produtos-', ''))
  if (!Number.isFinite(indice) || indice < 0) return []
  return produtosDoPedaco(indice)
}

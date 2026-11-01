import { MetadataRoute } from 'next'
import { getCachedCategories } from '@/lib/cache'
import { lerProdutosDoSitemap, dataDoProduto } from '@/lib/sitemap/produtos'
import { CATEGORIAS } from '@/lib/blog/categorias'
import { listarResumos } from '@/lib/blog/repositorio'
import { LEAD_INTENTS } from '@/lib/lead-intents'
import { REGIONAL_CITIES, REGIONAL_SERVICES, buildRegionalServicePath } from '@/lib/local-seo'
import { CAMPINAS_NEIGHBORHOODS } from '@/lib/neighborhood-seo'
import { listVitrinePagesPublic } from '@/lib/vitrine/db'
import { SETUPS_ASSINADOS } from '@/lib/vitrine/assinadas'
import { PAGINAS } from '@/lib/landing/paginas'
import { listarConsignados, urlDoConsignado } from '@/lib/consignados'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.balao.info'
  
  // Rotas Estáticas
  const staticRoutes = [
    '',
    '/blog',
    '/servicos-e-ofertas',
    '/promocao',
    '/manutencao',
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
    '/reparoapple',
    '/avellstorm480',
    '/telaiphone',
    '/tonner',
    '/wendell/apple',
    '/wendell/apple/blog',
    '/wendell/apple/macbook',
    '/wendell/apple/imac',
    '/wendell/apple/ipad',
    '/wendell/apple/iphone',
    '/wendell/apple/apple-watch',
    '/wendell/apple/mac-mini',
    '/como-comprar',
    '/envio-e-entrega',
    '/trocas-e-devolucoes',
    '/seguranca-e-privacidade',
    '/overclock',
    '/mybots-app',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    // As páginas de captação (lib/landing/paginas) vêm logo depois da home.
    priority: route === '' ? 1 : PAGINAS[route.slice(1)] ? 0.9 : 0.7,
  }))

  // Categorias (com a cópia do catálogo de reserva quando o banco recusa)
  const categories = await getCachedCategories().catch(() => [])
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Produtos: o catálogo inteiro. Se o banco recusar (cota de conexões),
  // vêm da cópia do catálogo — ver lib/sitemap/produtos.ts.
  const products = await lerProdutosDoSitemap()
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: dataDoProduto(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Blog: cada artigo e cada categoria que já tem artigo. Se a leitura
  // falhar, o sitemap sai sem o blog — melhor do que não sair.
  const artigos = await listarResumos({ tolerante: true }).catch(() => [])
  const blogRoutes = [
    ...artigos.map((artigo) => ({
      url: `${baseUrl}/blog/${artigo.slug}`,
      lastModified: new Date(artigo.publicadoEm),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    ...CATEGORIAS.filter((c) => artigos.some((a) => a.categoria === c.slug)).map((c) => ({
      url: `${baseUrl}/blog/categoria/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  const vitrinePages = [
    ...SETUPS_ASSINADOS.map((s) => ({ slug: s.slug, data_publicacao: s.publicado_em, data_criacao: s.publicado_em })),
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

  // Consignados (MEU BLING): giram rápido, então só entram os que estão à
  // venda agora. Se o MEU BLING não responder, fica só a página da vitrine.
  const consignados = await listarConsignados().catch(() => [])
  const consignadoRoutes = consignados.map((item) => ({
    url: urlDoConsignado(item),
    lastModified: new Date(item.desde),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...consignadoRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes, ...vitrineRoutes, ...regionalRoutes, ...urgentRoutes, ...neighborhoodRoutes]
}

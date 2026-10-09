import { MetadataRoute } from 'next'
import { getCategories, getProductsForSitemap } from '@/lib/db'
import { CATEGORIAS } from '@/lib/blog/categorias'
import { listarResumos } from '@/lib/blog/repositorio'
import { LEAD_INTENTS } from '@/lib/lead-intents'
import { REGIONAL_CITIES, REGIONAL_SERVICES, buildRegionalServicePath } from '@/lib/local-seo'
import { CAMPINAS_NEIGHBORHOODS } from '@/lib/neighborhood-seo'
import { listVitrinePagesPublic } from '@/lib/vitrine/db'

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
    '/pcgamer',
    '/notebooks',
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
    '/macbookm5',
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }))

  // Categorias
  const categories = await getCategories()
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Produtos (Limitado aos 1000 mais recentes para performance)
  // Nota: getProducts já tem paginação interna, mas aqui vamos pegar tudo o que ele retornar
  // Se getProducts retornar muitos, pode ser lento.
  const products = await getProductsForSitemap(1000)
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug || product.id}`,
    lastModified: new Date(product.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Blog: cada artigo e cada categoria que já tem artigo. Se a leitura
  // falhar, o sitemap sai sem o blog — melhor do que não sair.
  const artigos = await listarResumos().catch(() => [])
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

  const vitrinePages = await listVitrinePagesPublic().catch(() => [])
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

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes, ...vitrineRoutes, ...regionalRoutes, ...urgentRoutes, ...neighborhoodRoutes]
}

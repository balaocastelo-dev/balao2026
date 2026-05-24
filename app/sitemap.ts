import { MetadataRoute } from 'next'
import { getCategories, getProductsForSitemap } from '@/lib/db'
import { listBlogPostsForPage } from '@/lib/blog-store'

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
    '/pcgamer3d',
    '/consignacao',
    '/pcgamer',
    '/notebooks',
    '/seminovos',
    '/monteseupc',
    '/departamentos',
    '/fale-conosco',
    '/sobre-nos',
    '/sobre-a-empresa',
    '/assistenciagames',
    '/carregadores',
    '/microsoft',
    '/reparoapple',
    '/telaiphone',
    '/tonner',
    '/como-comprar',
    '/envio-e-entrega',
    '/trocas-e-devolucoes',
    '/seguranca-e-privacidade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Categorias
  const categories = await getCategories()
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    lastModified: new Date(),
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

  const blogPosts = await listBlogPostsForPage({ take: 500 })
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes]
}

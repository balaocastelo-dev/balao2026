import { MetadataRoute } from 'next'
import { getLatestProductsForSitemap, getCategories } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.balao.info'
  
  // Rotas Estáticas
  const staticRoutes = [
    '',
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
    '/monte-seu-pc',
    '/departamentos',
    '/fale-conosco',
    '/sobre-nos',
    '/sobre-a-empresa',
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

  const products = await getLatestProductsForSitemap(1000)
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug || product.id}`,
    lastModified: new Date(product.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}

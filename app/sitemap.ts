import { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { BLOG_CATEGORIES } from '@/lib/blog/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.balao.info'
  
  // Rotas Estáticas
  const staticRoutes = [
    '',
    '/blog',
    '/blog/campinas',
    '/blog/videos',
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
  const products = await getProducts()
  const productRoutes = products.slice(0, 1000).map((product) => ({
    url: `${baseUrl}/product/${product.slug || product.id}`,
    lastModified: new Date(product.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const blogCategoryRoutes = BLOG_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/blog/categoria/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7
  }))

  let blogPostRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug,updated_at,published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(2000)
    blogPostRoutes = (data || []).map((p: any) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at || p.published_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }))
  } catch {
    blogPostRoutes = []
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogCategoryRoutes, ...blogPostRoutes]
}

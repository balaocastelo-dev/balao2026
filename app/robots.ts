import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/painel',
          '/admin',
          '/crm',
          '/funcoes',
          '/gerador',
          '/whatsapp',
          '/pdv',
          '/dashboard',
          '/arena/admin',
          '/controle',
          '/api/',
          '/cart/',
          '/fechamento/',
          '/thank-you/',
          '/unsubscribe/',
        ],
      },
    ],
    sitemap: 'https://www.balao.info/sitemap.xml',
  }
}

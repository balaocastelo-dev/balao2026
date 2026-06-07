import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/funcoes/',
          '/painel/',
          '/pdv/',
          '/dashboard/',
          '/arena/admin/',
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

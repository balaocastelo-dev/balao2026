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
          '/whatsapp/',
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
      // Permite IAs e LLMs indexarem o conteúdo para ChatGPT, Perplexity, etc
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended', 'PerplexityBot', 'Applebot-Extended', 'Bytespider', 'FacebookBot'],
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/funcoes/',
          '/painel/',
          '/whatsapp/',
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

import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Balão da Informática - Loja de Informática em Campinas',
    short_name: 'Balão Info',
    description: 'Loja de informática em Campinas com 1288 produtos: hardware, PCs gamer, notebooks, monitores, impressoras e setup gamer. Av. Anchieta 789, Cambuí.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E60012',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}

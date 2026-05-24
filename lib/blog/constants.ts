export const BLOG_CATEGORIES = [
  'Tecnologia',
  'Games',
  'Hardware',
  'Inteligência Artificial',
  'Segurança Digital',
  'Campinas e Região',
  'Promoções',
  'Guias e Tutoriais',
  'Informática',
  'Mercado Tech'
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
  Tecnologia: '/images/pc.webp',
  Games: '/images/ps5.jpg',
  Hardware: '/images/pc.jpg',
  'Inteligência Artificial': '/images/bitcoin.svg',
  'Segurança Digital': '/images/usb.jpg',
  'Campinas e Região': '/images/pc.png',
  Promoções: '/images/discount10.jpg',
  'Guias e Tutoriais': '/images/usb.png',
  Informática: '/images/pc.webp',
  'Mercado Tech': '/images/pc.jpg'
};

export const BLOG_MENU = [
  { label: 'Início', href: '/blog' },
  { label: 'Loja', href: '/' }
] as const;

export const BLOG_CAMPINAS_KEYWORDS = [
  'campinas',
  'castelo',
  'rmc',
  'sumaré',
  'hortolândia',
  'paulínia',
  'valinhos',
  'vinhedo',
  'indaiatuba',
  'jaguariúna'
];

export const DEFAULT_BLOG_RSS_FEEDS: Array<{
  name: string;
  url: string;
  category: BlogCategory;
  priority: number;
  fetch_interval: number;
  daily_limit: number;
  campinas_rule?: boolean;
  language?: string;
}> = [
  {
    name: 'G1 Campinas e Região',
    url: 'https://g1.globo.com/rss/g1/sp/campinas-regiao/',
    category: 'Campinas e Região',
    priority: 100,
    fetch_interval: 5,
    daily_limit: 24,
    campinas_rule: true,
    language: 'pt-BR'
  },
  {
    name: 'Tecnoblog',
    url: 'https://tecnoblog.net/feed/',
    category: 'Tecnologia',
    priority: 80,
    fetch_interval: 10,
    daily_limit: 24,
    language: 'pt-BR'
  },
  {
    name: 'Canaltech',
    url: 'https://canaltech.com.br/rss/',
    category: 'Tecnologia',
    priority: 70,
    fetch_interval: 10,
    daily_limit: 24,
    language: 'pt-BR'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Mercado Tech',
    priority: 40,
    fetch_interval: 20,
    daily_limit: 24,
    language: 'en'
  },
  {
    name: 'IGN Brasil',
    url: 'https://br.ign.com/rss.xml',
    category: 'Games',
    priority: 55,
    fetch_interval: 15,
    daily_limit: 24,
    language: 'pt-BR'
  }
];

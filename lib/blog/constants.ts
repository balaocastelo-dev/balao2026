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

const { createClient } = require('@libsql/client');
const fs = require('fs');
require('dotenv').config();

const FALLBACK_URL = 'libsql://balao2026-balao.aws-us-east-1.turso.io';
const url = process.env.TURSO_DATABASE_URL || FALLBACK_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || '';

if (!authToken && url !== FALLBACK_URL) {
  console.warn('Aviso: TURSO_AUTH_TOKEN não definido no .env. Configure as variáveis TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.');
  process.exit(1);
}

const turso = createClient({ url, authToken: authToken || undefined });

async function seed() {
  console.log('Seeding products and home blocks into Turso...');

  const homeBlocks = [
    ['hb-1', 'Destaques', 'PC Gamer', 1, 1],
    ['hb-2', 'Computadores Gamer', 'PC Gamer', 2, 1],
    ['hb-3', 'Notebooks & MacBooks', 'Notebooks', 3, 1],
    ['hb-4', 'Hardware & Placas de Vídeo', 'Hardware & Componentes', 4, 1],
    ['hb-5', 'Monitores', 'Computadores & Monitores', 5, 1]
  ];

  for (const block of homeBlocks) {
    try {
      await turso.execute({
        sql: 'INSERT OR REPLACE INTO home_blocks (id, title, category_id, display_order, active) VALUES (?, ?, ?, ?, ?)',
        args: block
      });
      console.log('Inserted home block:', block[1]);
    } catch (e) {
      console.error('Error inserting block:', e.message);
    }
  }

  const products = [
    [
      'prod-1',
      'Desktop Gamer Hard (Intel Core Ultra 7 + RTX 4070 Super 12GB + 32GB DDR5 + SSD 1TB)',
      '5999.00',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
      'PC Gamer',
      'desktop-gamer-hard-ult7-rtx4070',
      'PC Gamer de altíssima performance para jogos em 4K e tarefas pesadas.'
    ],
    [
      'prod-2',
      'Desktop Gamer Vanguard (Intel Core i5-14400F + RTX 4060 8GB + 16GB DDR5 + SSD 1TB)',
      '3999.00',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80',
      'PC Gamer',
      'desktop-gamer-vanguard-i5-rtx4060',
      'Excelente custo-benefício para jogos em Quad HD com Ray Tracing e DLSS 3.'
    ],
    [
      'prod-3',
      'Desktop Gamer Winner (AMD Ryzen 7 5700X3D + RTX 4070 12GB + 32GB DDR4 + SSD 1TB)',
      '4999.00',
      'https://images.unsplash.com/photo-1587202372616-b43bfa051433?w=600&auto=format&fit=crop&q=80',
      'PC Gamer',
      'desktop-gamer-winner-ryzen-rtx4070',
      'Dominador de FPS para jogos competitivos como Valorant, CS2 e Warzone.'
    ],
    [
      'prod-4',
      'Desktop Gamer Moon (AMD Ryzen 5 5600 + RTX 3060 12GB + 16GB DDR4 + SSD 512GB)',
      '3499.00',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=80',
      'PC Gamer',
      'desktop-gamer-moon-ryzen-rtx3060',
      'PC Gamer perfeito para Full HD com gráficos no Ultra.'
    ],
    [
      'prod-5',
      'Notebook Lenovo LOQ Gamer (Intel i5-12450H + RTX 3050 6GB + 16GB RAM + SSD 512GB)',
      '4299.00',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
      'Notebooks',
      'notebook-lenovo-loq-rtx3050',
      'Notebook gamer portátil com alta taxa de atualização e design ergonômico.'
    ],
    [
      'prod-6',
      'Apple MacBook Air M2 13.6" (8GB RAM + SSD 256GB - Cinza Espacial)',
      '6899.00',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      'Notebooks',
      'apple-macbook-air-m2-256gb',
      'Design ultrafino com bateria impressionante para o dia todo e chip Apple M2.'
    ],
    [
      'prod-7',
      'Placa de Vídeo RTX 4070 Super 12GB GDDR6X 192-bit',
      '3899.00',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
      'Hardware & Componentes',
      'gpu-rtx-4070-super-12gb',
      'Placa de vídeo com arquitetura Ada Lovelace, DLSS 3 e Ray Tracing avançado.'
    ],
    [
      'prod-8',
      'Processador AMD Ryzen 7 5700X3D (8-Cores, 16-Threads, 4.1GHz Turbo)',
      '1399.00',
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80',
      'Hardware & Componentes',
      'cpu-amd-ryzen-7-5700x3d',
      'Processador com tecnologia 3D V-Cache para máxima taxa de quadros em games.'
    ],
    [
      'prod-9',
      'Monitor Gamer LG UltraGear 27" IPS Full HD 180Hz 1ms G-Sync',
      '1099.00',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      'Computadores & Monitores',
      'monitor-lg-ultragear-27-180hz',
      'Painel IPS com cores vivas e resposta ultra-rápida de 1ms.'
    ]
  ];

  for (const prod of products) {
    try {
      await turso.execute({
        sql: 'INSERT OR REPLACE INTO products (id, name, price, image, category, slug, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: prod
      });
      console.log('Inserted product:', prod[1]);
    } catch (e) {
      console.error('Error inserting product:', e.message);
    }
  }

  const res = await turso.execute('SELECT COUNT(*) as total FROM products');
  console.log('Total products in Turso:', res.rows[0].total);

  turso.close();
}

seed();

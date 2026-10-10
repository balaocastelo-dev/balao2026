import type { NextConfig } from "next";
import { ENDERECOS_ANTIGOS } from "./lib/painel/enderecos-antigos";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // A troca do catálogo lê este arquivo do disco; sem declarar, ele não vai
  // junto com a função na Vercel.
  outputFileTracingIncludes: {
    "/api/precos/troca": ["./data/catalogo-inicial.json"],
  },
  // O Office 3D (escritório virtual) é uma página pronta, em public/3d: não
  // passa pelo layout da loja. O endereço /3d abre o index.html dela.
  // O código-fonte e o comando para republicar estão em office3d/README.md.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/3d", destination: "/3d/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
  // Motor, modelos e visual do Office 3D levam um código no nome que muda a
  // cada versão; por isso o navegador pode guardá-los sem voltar a perguntar
  // (são ~12 MB — sem isto seriam conferidos a cada visita).
  async headers() {
    return [
      {
        source: "/3d/:arquivo((?:assets|engine|ui)\\.[0-9a-f]{10}\\.(?:pack|js|css))",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      // "IA local" é uma categoria por regra, com página própria. Quem chegar
      // pelo endereço no formato das outras categorias cai nela.
      { source: "/categoria/ia-local", destination: "/ia-local", permanent: true },
      // Os artigos do Soro abriam por script em /blog?post=<slug>. Agora cada
      // um tem página própria; o endereço antigo leva para ela.
      {
        source: "/blog",
        has: [{ type: "query", key: "post", value: "(?<slug>[a-z0-9-]+)" }],
        destination: "/blog/:slug",
        permanent: true,
      },
      // A administração inteira mora em /painel. Os endereços de antes
      // (/admin, /crm, /arena/admin…) continuam valendo e levam para lá.
      // Temporário (307) de propósito: são endereços internos, e um 308 fica
      // gravado no navegador mesmo se um dia a área mudar de lugar de novo.
      ...ENDERECOS_ANTIGOS.map(({ de, para }) => ({
        source: de,
        destination: para,
        permanent: false,
      })),
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Next 16 exige declarar rotas locais que servem imagens com query string
    // (ex.: as capas OG geradas em /blog/api/og?title=...).
    localPatterns: [
      {
        pathname: "/blog/api/og",
        search: "**",
      },
      {
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default nextConfig;

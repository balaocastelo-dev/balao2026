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
  async redirects() {
    return [
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

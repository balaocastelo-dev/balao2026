import type { NextConfig } from "next";

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

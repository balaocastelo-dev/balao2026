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

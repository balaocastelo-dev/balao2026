import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
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

  /**
   * Endereços antigos que as pessoas ainda usam.
   *
   * `/politica-de-privacidade` respondia 404 — e é página que as pessoas
   * linkam e que a LGPD exige estar acessível. O conteúdo sempre esteve em
   * `/seguranca-e-privacidade`; faltava a ponte.
   */
  async redirects() {
    return [
      {
        source: "/politica-de-privacidade",
        destination: "/seguranca-e-privacidade",
        permanent: true,
      },
      {
        source: "/privacidade",
        destination: "/seguranca-e-privacidade",
        permanent: true,
      },
      {
        source: "/politica-de-troca",
        destination: "/trocas-e-devolucoes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { ENDERECOS_ANTIGOS } from "./lib/painel/enderecos-antigos";
import { rewritesDoPainel, TUNEL_HUB } from "./lib/soubots";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // A troca do catálogo lê este arquivo do disco; sem declarar, ele não vai
  // junto com a função na Vercel.
  outputFileTracingIncludes: {
    "/api/precos/troca": ["./data/catalogo-inicial.json"],
    "/api/precos/importar": ["./data/techsupri-catalogo.json"],
  },
  // A landing /mybots-app não lê public/ no servidor. Sem esta exclusão, o
  // file tracer leva vídeo, apk e imagem para dentro da função (passou de
  // 250 MB descompactados no deploy do PR #122). Os arquivos seguem em
  // public/ e continuam servidos como estáticos.
  outputFileTracingExcludes: {
    "/mybots-app": ["./public/**/*"],
  },
  // O Office 3D (escritório virtual) é uma página pronta, em public/3d: não
  // passa pelo layout da loja. O endereço /3d abre o index.html dela.
  // O código-fonte e o comando para republicar estão em office3d/README.md.
  // A Chácara 3D (passeio pelo terreno do Thiago) segue o mesmo esquema:
  // página pronta em public/chacara3d, aberta pelo endereço /chacara3d.
  // Fonte e como refazer em chacara3d/README.md.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/3d", destination: "/3d/index.html" },
        { source: "/chacara3d", destination: "/chacara3d/index.html" },
        // Painel do MyBots em www.soubots.com/app (e no apex). O Hub fica no
        // mesmo túnel de /mybots e não vê o prefixo /app. Só esses hosts:
        // www.balao.info/app não é o painel. /app/api/auth/google/callback e
        // /app/ws/* entram em /app/:caminho*. Não redirecionamos /app → /app/:
        // o 308 automático do Next só tira a barra (/app/ → /app) uma vez.
        ...rewritesDoPainel(),
      ],
      // MEU BLING (ERP próprio, substituto do Bling) mora na VPS da loja
      // (srv1963897.hstgr.cloud, Caddy → container meu-bling) e aparece aqui em
      // www.balao.info/sistema: a Vercel repassa a chamada e o endereço não muda.
      // Código e deploy: github.com/balaocastelo-dev/meu-bling (deploy/vps/).
      afterFiles: [
        { source: "/sistema", destination: "https://srv1963897.hstgr.cloud/sistema/" },
        { source: "/sistema/:caminho*", destination: "https://srv1963897.hstgr.cloud/sistema/:caminho*" },
        // MyBots Hub (PC do Thiago via tunel Cloudflare). Mesmo-origin p/ cookie de sessao.
        // /app no soubots usa o mesmo TUNEL_HUB (beforeFiles, só naqueles hosts).
        { source: "/mybots", destination: `${TUNEL_HUB}/` },
        { source: "/mybots/:caminho*", destination: `${TUNEL_HUB}/:caminho*` },
      ],
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
      {
        // APK do app MyBots (landing em /mybots-app). O tipo certo faz o
        // Android baixar e oferecer a instalação. Não tem relação com o
        // rewrite de /mybots, que continua sendo o Hub.
        source: "/downloads/MyBots.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          { key: "Content-Disposition", value: 'attachment; filename="MyBots.apk"' },
        ],
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
      // O produto white label ganhou nome: Overclock. Quem tiver o endereço
      // antigo (/whitelabel) cai na página de vendas dele.
      { source: "/whitelabel", destination: "/overclock", statusCode: 301 },
      // O endereço antigo da página de toner era /tonner. 301 permanente para /toner.
      { source: "/tonner", destination: "/toner", statusCode: 301 },
      // MacBook, iMac e iPhone ganharam slug curto. O endereço antigo, sob
      // /wendell/apple, leva para a página nova para não haver duas URLs.
      { source: "/wendell/apple/macbook", destination: "/macbook", statusCode: 301 },
      { source: "/wendell/apple/imac", destination: "/imac", statusCode: 301 },
      { source: "/wendell/apple/iphone", destination: "/iphone", statusCode: 301 },
      // O MacBook Pro M5 foi vendido e a página dele saiu (25/10). Quem chegar
      // por um link antigo ou pelo Google cai na home, onde está o destaque da vez.
      { source: "/macbookm5", destination: "/", permanent: true },
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

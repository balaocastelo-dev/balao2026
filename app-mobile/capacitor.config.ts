import type { CapacitorConfig } from "@capacitor/cli";

// App do Balão da Informática — casca Capacitor que abre o próprio site.
// Não tem conteúdo embutido: carrega https://www.balao.info ao vivo, então
// toda mudança no site já aparece no app sem precisar reenviar nada.
//
// `appendUserAgent: "BalaoApp"` é o que faz a loja reconhecer que a pessoa
// está no app (no navegador via navigator.userAgent e no servidor via header
// User-Agent) e dar os 15% a mais no Pix. Ver lib/app-balao.ts no site.
const config: CapacitorConfig = {
  appId: "info.balao.app",
  appName: "Balão da Informática",
  webDir: "www",
  appendUserAgent: "BalaoApp",
  backgroundColor: "#090d16",
  server: {
    url: "https://www.balao.info",
    androidScheme: "https",
    errorPath: "erro.html",
    allowNavigation: ["www.balao.info", "balao.info", "*.balao.info"],
  },
};

export default config;

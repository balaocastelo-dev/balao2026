// ============================================================
// Endereços antigos da administração.
//
// Antes do painel único, cada área tinha o próprio endereço e o próprio
// menu. Os endereços continuam valendo (favorito salvo, link em conversa
// antiga), só que agora levam para dentro do /painel. O next.config.ts monta
// os redirecionamentos a partir desta lista.
//
// Este arquivo não importa nada de propósito: ele é lido pelo next.config.ts,
// antes de o site existir.
//
// Ficam de fora, e continuam abrindo no endereço de sempre, as telas de
// balcão — /fechamento, /controle, /pdv e as páginas pessoais dos vendedores.
// Quem usa essas telas não tem a senha do painel.
// ============================================================

export const ENDERECOS_ANTIGOS: { de: string; para: string }[] = [
  { de: "/admin", para: "/painel" },
  { de: "/admin/:caminho*", para: "/painel/:caminho*" },
  { de: "/dashboard", para: "/painel/indicadores" },
  { de: "/crm", para: "/painel/crm" },
  { de: "/arena/admin", para: "/painel/arena" },
  { de: "/gerador", para: "/painel/gerador" },
  { de: "/funcoes", para: "/painel/mapa" },
];

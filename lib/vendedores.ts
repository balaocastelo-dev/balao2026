// ============================================================
// Registro de vendedores da equipe.
//
// Todos atendem pelo MESMO número da loja (SITE_CONFIG.whatsapp.number
// = 5519987510267). O WhatsApp é conectado UMA vez por QR Code no
// servidor (whatsapp-server); cada vendedor entra na sua própria página
// com o login pessoal daqui e recebe:
//   - a mesma caixa de conversas (é o número da loja, compartilhado);
//   - o SEU kanban pessoal (o servidor separa por `id`);
//   - a SUA assinatura automática nas mensagens;
//   - o filtro "Meus" e as conversas atribuídas a ele.
//
// Para adicionar um vendedor novo:
//   1. acrescente o registro nesta lista;
//   2. crie a pasta `app/<slug>/page.tsx` copiando outra existente;
//   3. espelhe o `id` e o `nome` em `whatsapp-server/vendedores-fixos.json`;
//   4. defina a variável de ambiente da senha na hospedagem e publique.
// ============================================================

export interface VendedorRegistro {
  /** Pedaço da URL: slug "brendon" => www.balao.info/brendon */
  slug: string;
  /**
   * Identificador estável do vendedor no servidor de WhatsApp.
   * É a chave do kanban pessoal (`kanbanPorVendedor[id]`) e da
   * atribuição de conversas (`chatAssignments`), então NUNCA deve mudar
   * depois que o vendedor começou a atender — mudar aqui zera o funil dele.
   */
  id: string;
  nome: string;
  cargo: string;
  /** Assinatura anexada automaticamente no fim das mensagens enviadas. */
  assinatura: string;
  /**
   * Nome da variável de ambiente que guarda a senha deste vendedor.
   *
   * A senha NÃO fica no código de propósito: este repositório é público, e
   * senha em código versionado vira senha pública — para sempre, porque o
   * histórico do git guarda. Sem a variável definida o acesso fica fechado,
   * em vez de abrir com um valor conhecido.
   */
  envSenha: string;
}

function registro(slug: string, nome: string): VendedorRegistro {
  return {
    slug,
    id: slug,
    nome,
    // Cargo igual para todo mundo, sem flexão de gênero — muda aqui se
    // alguém tiver função diferente.
    cargo: "Vendas",
    assinatura: `Atenciosamente,\n*${nome}* — Balão da Informática Castelo`,
    envSenha: `VENDEDOR_${slug.toUpperCase()}_SENHA`,
  };
}

export const VENDEDORES: VendedorRegistro[] = [
  registro("thiago", "Thiago"),
  registro("marcos", "Marcos"),
  registro("julia", "Julia"),
  registro("gabriel", "Gabriel"),
  registro("wendell", "Wendell"),
  registro("brendon", "Brendon"),
];

export function getVendedorPorSlug(slug: string): VendedorRegistro | null {
  const alvo = String(slug || "").trim().toLowerCase();
  return VENDEDORES.find((v) => v.slug === alvo) || null;
}

/**
 * Senha do vendedor, vinda só da variável de ambiente.
 * String vazia significa "não configurada" — e aí o login recusa tudo.
 */
export function getSenhaVendedor(vendedor: VendedorRegistro): string {
  const daEnv = process.env[vendedor.envSenha];
  return typeof daEnv === "string" ? daEnv.trim() : "";
}

/** Se o acesso deste vendedor já pode ser usado. */
export function temSenhaConfigurada(vendedor: VendedorRegistro): boolean {
  return getSenhaVendedor(vendedor).length > 0;
}

/** Dados que podem ir para o navegador (sem senha). */
export function vendedorPublico(vendedor: VendedorRegistro) {
  return {
    id: vendedor.id,
    slug: vendedor.slug,
    nome: vendedor.nome,
    cargo: vendedor.cargo,
    assinatura: vendedor.assinatura,
  };
}

export type VendedorPublico = ReturnType<typeof vendedorPublico>;

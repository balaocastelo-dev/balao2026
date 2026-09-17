import { supabaseAdmin } from "./supabase";

/* ================================================================== *
 * LIV.IA — a caixa de entrada da loja (balaocastelo@gmail.com).
 *
 * Ela lê o que chega, responde pedido de orçamento, arruma as pastas,
 * prospecta e passa o lead adiante: JUL.IA no WhatsApp, CECÍL.IA na URA.
 *
 * DUAS DECISÕES QUE MOLDAM TUDO AQUI
 *
 * 1. O worker da VPS só fala IMAP. Quem classifica, redige e decide é o
 *    site — é onde estão o banco e as chaves. Worker que pensa é worker
 *    que precisa de credencial de banco na máquina mais exposta do
 *    conjunto.
 *
 * 2. Resposta a cliente nasce como RASCUNHO. O modo automático existe e
 *    é uma chave só, mas o padrão é rascunho porque um orçamento errado
 *    respondido em nome da loja não se desfaz com um pedido de desculpas.
 *    É o mesmo desenho da JUL.IA (copiloto antes de autopiloto).
 *
 * 3. A prospecção fria sai do MESMO endereço da loja, por decisão do
 *    Thiago, avisado do risco. Então tudo que limita estrago está aqui:
 *    rampa de aquecimento, teto diário, supressão e alarme de rejeição.
 * ================================================================== */

export type Classificacao =
  | "orcamento"    // cliente querendo comprar — o que interessa
  | "suporte"      // cliente com problema, pedido já feito
  | "fornecedor"   // distribuidor, representante, cotação de compra
  | "financeiro"   // boleto, nota, banco
  | "rejeicao"     // mailer-daemon: e-mail que não chegou
  | "descadastro"  // pediu para parar de receber
  | "informativo"  // newsletter, no-reply, automático
  | "outro";

export interface EmailRecebido {
  messageId: string;
  remetente: string;
  nome?: string | null;
  assunto: string;
  corpo: string;
  recebidoEm?: string | null;
  /**
   * A mensagem traz cabeçalho de mala direta (`List-Unsubscribe`,
   * `Precedence: bulk`)?
   *
   * É o único sinal confiável de "isto foi disparado para uma lista, não
   * escrito para nós". Sem ele, toda newsletter vira pedido de descadastro,
   * porque toda newsletter tem "não quer mais receber" no rodapé.
   */
  mala?: boolean;
}

export interface Decisao {
  classificacao: Classificacao;
  /** Pasta/etiqueta onde o worker deve arquivar. */
  pasta: string;
  /** "responder" | "rascunho" | "arquivar" | "suprimir" | "nada" */
  acao: "responder" | "rascunho" | "arquivar" | "suprimir" | "nada";
  resposta?: string;
  /** Para onde mandar o lead, quando houver. */
  leadPara?: "julia" | "cecilia" | null;
  telefone?: string | null;
  motivo: string;
}

/* ------------------------------------------------------------------ *
 * Sinais determinísticos
 *
 * Tudo que dá para decidir por regra é decidido por regra. Modelo de
 * linguagem entra só no que sobra: mandar todo e-mail para um modelo
 * custa dinheiro, demora, e erra em casos que um `if` acerta sempre.
 * ------------------------------------------------------------------ */

const REMETENTES_DE_SISTEMA = [
  "mailer-daemon", "postmaster", "no-reply", "noreply", "nao-responda",
  "naoresponda", "notification", "notifications",
];

const MARCAS_DE_REJEICAO = [
  "delivery status notification", "undelivered mail", "mail delivery",
  "returned to sender", "endereço não encontrado", "address not found",
  "delivery has failed", "não foi entregue",
];

const PEDIDOS_DE_SAIDA = [
  "descadastr", "cancelar inscri", "remover meu", "remova meu", "sair da lista",
  "não quero receber", "nao quero receber", "pare de enviar", "parem de enviar",
  "unsubscribe", "opt-out", "opt out",
];

const SINAIS_DE_ORCAMENTO = [
  "orçamento", "orcamento", "cotação", "cotacao", "preço", "preco", "quanto custa",
  "valor do", "valores", "disponibilidade", "tem em estoque", "gostaria de comprar",
  "proposta comercial",
];

const SINAIS_DE_FORNECEDOR = [
  "representante", "distribuidor", "tabela de preços", "tabela de precos",
  "somos fabricante", "parceria comercial", "revenda", "catálogo de produtos",
];

function normalizar(v: string): string {
  return String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function contem(texto: string, lista: string[]): boolean {
  const t = normalizar(texto);
  return lista.some((termo) => t.includes(normalizar(termo)));
}

/**
 * Telefone brasileiro no corpo do e-mail.
 *
 * Exige DDD porque é o DDD que permite ligar ou mandar WhatsApp — número
 * de 8 ou 9 dígitos solto vira lead que ninguém consegue contatar. E o
 * recorte de 10 ou 11 dígitos evita capturar CNPJ, CEP e número de nota,
 * que é o que uma regex frouxa traz junto.
 */
export function acharTelefone(texto: string): string | null {
  const candidatos = String(texto || "").match(/\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g) || [];
  for (const bruto of candidatos) {
    const digitos = bruto.replace(/\D/g, "");
    if (digitos.length !== 10 && digitos.length !== 11) continue;
    const ddd = Number(digitos.slice(0, 2));
    if (ddd < 11 || ddd > 99) continue;
    // Celular no Brasil começa com 9 depois do DDD; fixo começa de 2 a 5.
    const primeiro = digitos[2];
    if (digitos.length === 11 && primeiro !== "9") continue;
    if (digitos.length === 10 && !"2345".includes(primeiro)) continue;
    return digitos;
  }
  return null;
}

/**
 * Uma mensagem escrita por uma pessoa, e não disparada para uma lista.
 *
 * Mala direta é reconhecida pelo cabeçalho (`List-Unsubscribe`), que é o
 * sinal que o próprio protocolo dá. Quando o cabeçalho não vem, sobra o
 * tamanho: newsletter é longa, cliente pedindo para sair escreve três linhas.
 */
const TAMANHO_DE_GENTE = 900;

export function pareceEscritoPorGente(email: EmailRecebido): boolean {
  if (email.mala) return false;
  const de = normalizar(email.remetente);
  if (REMETENTES_DE_SISTEMA.some((m) => de.includes(m))) return false;
  return String(email.corpo || "").length <= TAMANHO_DE_GENTE;
}

/**
 * Alguém está pedindo para sair, ou é só o rodapé de uma newsletter?
 *
 * A diferença está em ONDE a frase aparece. Quem quer sair diz isso no
 * assunto ou nas primeiras linhas; newsletter põe "descadastrar" no pé da
 * página, depois de todo o anúncio. Medido na caixa real: mesmo com o
 * remetente e o tamanho já filtrados, um disparo curto de marketing ainda
 * entrava como descadastro só por ter a palavra no fim.
 */
const COMECO_DA_MENSAGEM = 300;

export function pedeParaSair(email: EmailRecebido): boolean {
  if (contem(email.assunto || "", PEDIDOS_DE_SAIDA)) return true;
  const comeco = String(email.corpo || "").slice(0, COMECO_DA_MENSAGEM);
  return contem(comeco, PEDIDOS_DE_SAIDA);
}

/**
 * A classificação que sai só de regra. `null` quer dizer "não sei por
 * regra" — aí, e só aí, vale perguntar ao modelo.
 *
 * A ORDEM IMPORTA, e foi corrigida com a caixa real na mão: na primeira
 * leitura de verdade, seis newsletters (Hostinger, Asaas, V4, TikTok,
 * Netshoes) entraram como "descadastro" e foram parar na lista de supressão,
 * só porque têm "não quer mais receber" no rodapé — como toda newsletter
 * tem. Suprimir um fornecedor da loja por causa do rodapé dele é o oposto
 * do que a lista serve.
 *
 * Então: mala direta é decidida ANTES de qualquer outra coisa, e pedido de
 * saída e pedido de orçamento só valem quando alguém escreveu de próprio
 * punho.
 */
export function classificarPorRegra(email: EmailRecebido): Classificacao | null {
  const de = normalizar(email.remetente);
  const cabeca = `${email.assunto} ${email.corpo}`;

  // Devolução de e-mail vem de mailer-daemon e precisa ser vista mesmo sendo
  // automática: é ela que mede a taxa de rejeição da prospecção.
  if (contem(cabeca, MARCAS_DE_REJEICAO) || de.includes("mailer-daemon") || de.includes("postmaster")) {
    return "rejeicao";
  }

  const deGente = pareceEscritoPorGente(email);

  // Mala direta e robô nunca pedem para sair nem pedem orçamento.
  if (!deGente) return "informativo";

  if (pedeParaSair(email)) return "descadastro";
  if (contem(cabeca, SINAIS_DE_FORNECEDOR)) return "fornecedor";
  if (contem(cabeca, SINAIS_DE_ORCAMENTO)) return "orcamento";
  return null;
}

const PASTAS: Record<Classificacao, string> = {
  orcamento: "Orcamentos",
  suporte: "Suporte",
  fornecedor: "Fornecedores",
  financeiro: "Financeiro",
  rejeicao: "Rejeicoes",
  descadastro: "Descadastros",
  informativo: "Informativos",
  outro: "A-triar",
};

export function pastaDe(c: Classificacao): string {
  return PASTAS[c] || PASTAS.outro;
}

/* ------------------------------------------------------------------ *
 * Idempotência e supressão
 * ------------------------------------------------------------------ */

/** Este e-mail já foi tratado? A pergunta que impede a resposta em dobro. */
export async function jaTratado(messageId: string): Promise<boolean> {
  if (!messageId) return false;
  const { data } = await supabaseAdmin
    .from("livia_emails")
    .select("message_id")
    .eq("message_id", messageId)
    .maybeSingle();
  return Boolean(data);
}

export async function registrar(email: EmailRecebido, d: Decisao): Promise<void> {
  await supabaseAdmin.from("livia_emails").upsert({
    message_id: email.messageId,
    remetente: email.remetente,
    assunto: email.assunto?.slice(0, 500) || null,
    recebido_em: email.recebidoEm || null,
    classificacao: d.classificacao,
    acao: d.acao,
    rascunho: d.acao === "rascunho" ? d.resposta || null : null,
    lead_para: d.leadPara || null,
  });
}

export async function estaSuprimido(email: string): Promise<boolean> {
  const alvo = normalizar(email).trim();
  if (!alvo) return true; // sem endereço não se manda nada
  const { data } = await supabaseAdmin
    .from("livia_supressao")
    .select("email")
    .eq("email", alvo)
    .maybeSingle();
  return Boolean(data);
}

export async function suprimir(email: string, motivo: string, origem?: string): Promise<void> {
  const alvo = normalizar(email).trim();
  if (!alvo) return;
  await supabaseAdmin
    .from("livia_supressao")
    .upsert({ email: alvo, motivo, origem: origem || null }, { onConflict: "email" });
}

/* ------------------------------------------------------------------ *
 * Rampa de aquecimento
 *
 * A prospecção fria sai da caixa que a loja usa para falar com cliente.
 * Volume alto de uma vez num endereço que nunca mandou em massa é o
 * caminho curto para o Gmail passar a entregar TUDO no spam — inclusive
 * a resposta de orçamento de quem está comprando.
 *
 * Os degraus são conservadores de propósito: o teto do Gmail comum é da
 * ordem de 500/dia, e chegar perto dele não traz venda nenhuma a mais
 * que 80 bem escolhidos trazem.
 * ------------------------------------------------------------------ */

export const DEGRAUS_DA_RAMPA = [
  { ateODia: 3, teto: 10 },
  { ateODia: 7, teto: 20 },
  { ateODia: 14, teto: 40 },
  { ateODia: 21, teto: 60 },
];
export const TETO_MAXIMO = 80;

/** O teto de hoje, dado quantos dias a prospecção já roda. */
export function tetoNoDia(diasRodando: number): number {
  const dia = Math.max(0, Math.floor(diasRodando));
  for (const degrau of DEGRAUS_DA_RAMPA) {
    if (dia <= degrau.ateODia) return degrau.teto;
  }
  return TETO_MAXIMO;
}

export interface EstadoDaProspeccao {
  diasRodando: number;
  teto: number;
  enviadosHoje: number;
  restam: number;
  rejeicoes7d: number;
  enviados7d: number;
  taxaDeRejeicao: number;
  alarme: boolean;
  motivoDoAlarme: string | null;
}

/**
 * Onde a prospecção está hoje — tudo medido, nada estimado.
 *
 * O alarme de rejeição existe porque é o primeiro sinal de que a
 * reputação está caindo, e é o único que aparece antes do prejuízo. 5%
 * é o patamar em que provedor grande já começa a tratar o remetente
 * diferente.
 */
export async function estadoDaProspeccao(): Promise<EstadoDaProspeccao> {
  const agora = new Date();
  const inicioDoDia = new Date(agora);
  inicioDoDia.setUTCHours(0, 0, 0, 0);
  const seteDias = new Date(agora.getTime() - 7 * 86_400_000).toISOString();

  const [primeiro, hoje, semana] = await Promise.all([
    supabaseAdmin.from("livia_prospeccao").select("enviado_em")
      .order("enviado_em", { ascending: true }).limit(1),
    supabaseAdmin.from("livia_prospeccao").select("id", { count: "exact", head: true })
      .gte("enviado_em", inicioDoDia.toISOString()),
    supabaseAdmin.from("livia_prospeccao").select("status")
      .gte("enviado_em", seteDias),
  ]);

  const primeiroEnvio = primeiro.data?.[0]?.enviado_em;
  const diasRodando = primeiroEnvio
    ? Math.floor((agora.getTime() - new Date(primeiroEnvio).getTime()) / 86_400_000)
    : 0;

  const teto = tetoNoDia(diasRodando);
  const enviadosHoje = hoje.count || 0;
  const linhas = semana.data || [];
  const enviados7d = linhas.length;
  const rejeicoes7d = linhas.filter((l) => l.status === "rejeitado").length;
  const taxaDeRejeicao = enviados7d ? rejeicoes7d / enviados7d : 0;

  // Só alarma com amostra: 1 rejeição em 3 envios é 33% e não quer dizer nada.
  const amostraSuficiente = enviados7d >= 20;
  const alarme = amostraSuficiente && taxaDeRejeicao > 0.05;

  return {
    diasRodando, teto, enviadosHoje,
    restam: Math.max(0, teto - enviadosHoje),
    rejeicoes7d, enviados7d, taxaDeRejeicao,
    alarme,
    motivoDoAlarme: alarme
      ? `${(taxaDeRejeicao * 100).toFixed(1)}% de rejeição em ${enviados7d} envios nos últimos 7 dias`
      : null,
  };
}

/**
 * Pode mandar mais um e-mail frio agora?
 *
 * Para tudo quando o alarme dispara. Continuar disparando com a
 * rejeição alta é o que transforma "reputação arranhada" em "a caixa da
 * loja caiu no spam".
 */
export async function podeProspectar(): Promise<{ pode: boolean; motivo: string }> {
  const e = await estadoDaProspeccao();
  if (e.alarme) return { pode: false, motivo: `parado pelo alarme: ${e.motivoDoAlarme}` };
  if (e.restam <= 0) return { pode: false, motivo: `teto do dia atingido (${e.teto})` };
  return { pode: true, motivo: `${e.restam} de ${e.teto} restando hoje` };
}

/* ------------------------------------------------------------------ *
 * A decisão
 * ------------------------------------------------------------------ */

/** Palavras curtas e genéricas não servem para procurar no catálogo. */
const RUIDO = new Set([
  "bom", "dia", "boa", "tarde", "noite", "gostaria", "saber", "sobre", "para",
  "com", "que", "uma", "meu", "minha", "voces", "vocês", "loja", "obrigado",
  "obrigada", "favor", "quanto", "custa", "preco", "preço", "valor", "orcamento",
  "orçamento", "tem", "vcs", "por", "num", "esse", "essa", "isso", "aqui",
]);

/** Termos do e-mail que valem uma busca no catálogo. */
export function termosDeBusca(texto: string, maximo = 4): string[] {
  const vistos = new Set<string>();
  const termos: string[] = [];
  for (const palavra of normalizar(texto).split(/[^a-z0-9]+/)) {
    if (palavra.length < 4 || RUIDO.has(palavra) || vistos.has(palavra)) continue;
    vistos.add(palavra);
    termos.push(palavra);
    if (termos.length >= maximo) break;
  }
  return termos;
}

export interface ItemDeCatalogo {
  nome: string;
  preco: string;
  slug?: string;
}

/**
 * O rascunho de resposta a um pedido de orçamento.
 *
 * REGRA DURA: preço só entra aqui vindo do catálogo. Nenhum número é
 * escrito de cabeça. Orçamento inventado, respondido em nome da loja,
 * vira ou prejuízo (vende abaixo do custo) ou cliente irritado na porta
 * (o preço do e-mail não era o preço). Quando o catálogo não acha nada,
 * a resposta pede o modelo e promete um humano — que é honesto e
 * continua sendo uma resposta em minutos, não em dois dias.
 */
export function rascunhoDeOrcamento(
  email: EmailRecebido,
  achados: ItemDeCatalogo[]
): string {
  const primeiroNome = (email.nome || email.remetente.split("@")[0] || "")
    .trim().split(/\s+/)[0];
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";

  const linhas = [saudacao, "", "Obrigado pelo contato com a Balão da Informática Castelo."];

  if (achados.length) {
    linhas.push("", "Isto é o que temos aqui hoje:", "");
    for (const item of achados.slice(0, 5)) {
      linhas.push(`• ${item.nome} — ${item.preco}`);
    }
    linhas.push(
      "",
      "Os valores são os da nossa vitrine e podem mudar; confirmo na hora do fechamento.",
      "Se algum destes serve, me diga qual que eu já separo."
    );
  } else {
    linhas.push(
      "",
      "Para fechar o orçamento certo, me confirma o modelo exato (ou a configuração que você precisa) e a quantidade?",
      "Com isso eu volto com o valor e o prazo."
    );
  }

  linhas.push(
    "",
    "Estamos na Av. Anchieta 789, no Cambuí, em Campinas — dá para ver o equipamento ligado antes de pagar e levar na hora.",
    "",
    "Atenciosamente,",
    "*LIV.IA* • assistente digital da Balão da Informática Castelo",
    "balaocastelo@gmail.com · www.balao.info"
  );

  return linhas.join("\n");
}

export interface OpcoesDaDecisao {
  /** "rascunho" (padrão) guarda o texto para o Thiago soltar; "automatico" manda. */
  modo?: "rascunho" | "automatico";
  /** Busca no catálogo. Injetada para o teste não precisar de banco. */
  buscarNoCatalogo?: (termos: string[]) => Promise<ItemDeCatalogo[]>;
}

/**
 * O que fazer com um e-mail que chegou.
 *
 * Não escreve no banco e não manda nada: devolve a decisão. Quem grava e
 * quem executa é a rota — assim esta função inteira é testável sem rede.
 */
export async function decidir(
  email: EmailRecebido,
  opcoes: OpcoesDaDecisao = {}
): Promise<Decisao> {
  const classificacao = classificarPorRegra(email) ?? "outro";
  const pasta = pastaDe(classificacao);

  if (classificacao === "descadastro") {
    return {
      classificacao, pasta, acao: "suprimir", leadPara: null, telefone: null,
      motivo: "pediu para sair — entra na supressão e nunca mais recebe",
    };
  }

  if (classificacao === "rejeicao" || classificacao === "informativo") {
    return {
      classificacao, pasta, acao: "arquivar", leadPara: null, telefone: null,
      motivo: "mensagem de sistema: arquiva e não responde",
    };
  }

  if (classificacao === "orcamento") {
    const termos = termosDeBusca(`${email.assunto} ${email.corpo}`);
    let achados: ItemDeCatalogo[] = [];
    if (opcoes.buscarNoCatalogo && termos.length) {
      try {
        achados = await opcoes.buscarNoCatalogo(termos);
      } catch {
        // Catálogo fora do ar não impede a resposta; só tira os preços dela.
        achados = [];
      }
    }
    const telefone = acharTelefone(email.corpo);
    return {
      classificacao, pasta,
      acao: opcoes.modo === "automatico" ? "responder" : "rascunho",
      resposta: rascunhoDeOrcamento(email, achados),
      // Telefone no e-mail é o atalho para a venda: a JUL.IA continua no
      // WhatsApp, que responde muito mais rápido que e-mail.
      leadPara: telefone ? "julia" : null,
      telefone,
      motivo: achados.length
        ? `${achados.length} item(ns) do catálogo entraram na resposta`
        : "catálogo não achou o item; a resposta pede o modelo",
    };
  }

  // Suporte, fornecedor, financeiro e o que não se encaixou: arquiva na
  // pasta certa e deixa para gente. Responder o que não se entendeu é
  // pior do que não responder.
  return {
    classificacao, pasta, acao: "arquivar", leadPara: null, telefone: null,
    motivo: "fora do que a LIV.IA responde sozinha: arquiva para um humano ver",
  };
}

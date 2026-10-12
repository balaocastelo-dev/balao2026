// ============================================================
// Seminovos: onde ficam o estoque da vitrine e os leads.
//
// Tudo fora do MySQL da Hostinger (cota de 500 conexões por hora; quando
// estoura, o site pausa o banco). Usa a mesma "gaveta" da Arena e do PDV:
// Vercel Blob privado em produção, pasta nos testes, memória sem nada.
//
//   seminovos/estoque          a lista de aparelhos (um documento só)
//   seminovos/leads-AAAA-MM    os leads do mês
//   fotos/seminovo-…           as fotos (arquivos, não JSON)
//
// A tabela antiga `used_notebooks` (MySQL) nunca teve aparelho cadastrado e
// não tinha tela de cadastro; foi aposentada (ver app/api/seminovos/route.ts).
// ============================================================

import { randomBytes } from "crypto";
import { atualizar, gravarArquivo, ler, lerArquivo } from "@/lib/arena/gaveta";
import {
  INTERESSES,
  type Grau,
  type Interesse,
  type LeadSeminovo,
  type Seminovo,
  type Situacao,
  type StatusDoLead,
} from "./tipos";

const CHAVE_ESTOQUE = "seminovos/estoque";
const chaveDosLeads = (d: Date) => `seminovos/leads-${d.toISOString().slice(0, 7)}`;

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const textoLongo = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
/** Aceita 2499.9, "2.499,90", "2499,90" e "2499.90" (ponto com até 2 casas é decimal). */
const numero = (v: unknown) => {
  const t = String(v ?? "").replace(/[R$\s]/g, "");
  const n =
    typeof v === "number"
      ? v
      : t.includes(",")
        ? Number(t.replace(/\./g, "").replace(",", "."))
        : /^\d+\.\d{1,2}$/.test(t)
          ? Number(t)
          : Number(t.replace(/\./g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};
const novoId = () => `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;

// ---------------------------------------------------------------- estoque

export async function lerEstoque(): Promise<Seminovo[]> {
  const { dados } = await ler<Seminovo[]>(CHAVE_ESTOQUE);
  return Array.isArray(dados) ? dados : [];
}

/** O que a página mostra: disponíveis primeiro (destaques na frente), depois reservados. Vendido não aparece. */
export function paraVitrine(estoque: Seminovo[]): Seminovo[] {
  const peso = (s: Seminovo) => (s.situacao === "disponivel" ? 0 : 1) * 10 + (s.destaque ? 0 : 1);
  return estoque
    .filter((s) => s.situacao !== "vendido")
    .sort((a, b) => peso(a) - peso(b) || b.criadoEm.localeCompare(a.criadoEm));
}

export type DadosDoSeminovo = Partial<Omit<Seminovo, "criadoEm" | "atualizadoEm">>;

/** Limpa o que veio do painel. Devolve o erro em português, para mostrar na tela. */
export function validarSeminovo(d: DadosDoSeminovo): { ok: true; dados: Omit<Seminovo, "id" | "criadoEm" | "atualizadoEm"> } | { ok: false; erro: string } {
  const marca = texto(d.marca, 40);
  const modelo = texto(d.modelo, 80);
  const processador = texto(d.processador, 80);
  const memoria = texto(d.memoria, 40);
  const armazenamento = texto(d.armazenamento, 40);
  const tela = texto(d.tela, 60);
  const precoVista = numero(d.precoVista);
  if (!marca) return { ok: false, erro: "Falta a marca." };
  if (!modelo) return { ok: false, erro: "Falta o modelo." };
  if (!processador) return { ok: false, erro: "Falta o processador." };
  if (!memoria) return { ok: false, erro: "Falta a memória." };
  if (!armazenamento) return { ok: false, erro: "Falta o armazenamento." };
  if (!precoVista) return { ok: false, erro: "Falta o preço à vista." };
  const precoCartao = numero(d.precoCartao);
  if (precoCartao && precoCartao < precoVista) return { ok: false, erro: "O preço no cartão está menor que o à vista." };
  const parcelas = Math.round(numero(d.parcelas));
  const garantia = Math.round(numero(d.garantiaMeses));
  const situacoes: Situacao[] = ["disponivel", "reservado", "vendido"];
  const fotos = (Array.isArray(d.fotos) ? d.fotos : []).filter((f): f is string => typeof f === "string" && /^fotos\/seminovo-[a-z0-9-]+\.(jpg|webp|png)$/.test(f)).slice(0, 8);
  return {
    ok: true,
    dados: {
      marca,
      modelo,
      processador,
      memoria,
      armazenamento,
      tela,
      placaDeVideo: texto(d.placaDeVideo, 60) || undefined,
      bateria: texto(d.bateria, 40) || undefined,
      sistema: texto(d.sistema, 40) || undefined,
      grau: (d.grau === "B" ? "B" : "A") as Grau,
      garantiaMeses: garantia > 0 && garantia <= 24 ? garantia : 6,
      precoVista,
      precoCartao: precoCartao || undefined,
      parcelas: parcelas >= 2 && parcelas <= 18 ? parcelas : undefined,
      observacoes: textoLongo(d.observacoes, 500) || undefined,
      destaque: Boolean(d.destaque),
      fotos,
      situacao: situacoes.includes(d.situacao as Situacao) ? (d.situacao as Situacao) : "disponivel",
    },
  };
}

export async function salvarSeminovo(d: DadosDoSeminovo): Promise<Seminovo> {
  const v = validarSeminovo(d);
  if (!v.ok) throw new Error(v.erro);
  const agora = new Date().toISOString();
  let salvo: Seminovo | null = null;
  await atualizar<Seminovo[]>(CHAVE_ESTOQUE, () => [], (lista) => {
    const i = d.id ? lista.findIndex((s) => s.id === d.id) : -1;
    if (i >= 0) {
      salvo = { ...lista[i], ...v.dados, atualizadoEm: agora };
      lista[i] = salvo;
    } else {
      salvo = { id: novoId(), ...v.dados, criadoEm: agora, atualizadoEm: agora };
      lista.unshift(salvo);
    }
    return lista;
  });
  return salvo!;
}

export async function mudarSituacao(id: string, situacao: Situacao) {
  await atualizar<Seminovo[]>(CHAVE_ESTOQUE, () => [], (lista) => {
    const s = lista.find((x) => x.id === id);
    if (!s || s.situacao === situacao) return undefined;
    s.situacao = situacao;
    s.atualizadoEm = new Date().toISOString();
    return lista;
  });
}

export async function apagarSeminovo(id: string) {
  await atualizar<Seminovo[]>(CHAVE_ESTOQUE, () => [], (lista) => {
    const resto = lista.filter((s) => s.id !== id);
    return resto.length === lista.length ? undefined : resto;
  });
}

// ---------------------------------------------------------------- fotos

const TIPOS_DE_FOTO: Record<string, string> = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };
export const FOTO_MAXIMA = 3 * 1024 * 1024;

export async function guardarFoto(corpo: Buffer, tipo: string): Promise<string> {
  const ext = TIPOS_DE_FOTO[tipo];
  if (!ext) throw new Error("A foto tem de ser JPG, WEBP ou PNG.");
  if (corpo.length > FOTO_MAXIMA) throw new Error("Foto grande demais (máximo 3 MB depois de reduzida).");
  const chave = `fotos/seminovo-${novoId()}.${ext}`;
  await gravarArquivo(chave, corpo, tipo);
  return chave;
}

export async function lerFoto(nome: string) {
  if (!/^seminovo-[a-z0-9-]+\.(jpg|webp|png)$/.test(nome)) return null;
  return lerArquivo(`fotos/${nome}`);
}

/** Endereço público da foto (a chave muda a cada envio, então pode guardar para sempre). */
export const urlDaFoto = (chave: string) => `/api/seminovos/foto/${chave.replace(/^fotos\//, "")}`;

// ---------------------------------------------------------------- leads

export function soDigitos(v: unknown) {
  return typeof v === "string" ? v.replace(/\D/g, "") : "";
}

export type EntradaDeLead = Partial<Omit<LeadSeminovo, "id" | "criadoEm" | "status" | "nota">>;

export function validarLead(e: EntradaDeLead): { ok: true; lead: Omit<LeadSeminovo, "id" | "criadoEm" | "status"> } | { ok: false; erro: string } {
  const nome = texto(e.nome, 80);
  let whatsapp = soDigitos(e.whatsapp);
  if (whatsapp.startsWith("55") && whatsapp.length >= 12) whatsapp = whatsapp.slice(2);
  const email = texto(e.email, 120);
  if (nome.length < 2) return { ok: false, erro: "Diga seu nome." };
  if (whatsapp.length < 10 || whatsapp.length > 11) return { ok: false, erro: "WhatsApp com DDD, por favor (ex.: 19 98765-4321)." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, erro: "E-mail inválido (ou deixe em branco)." };
  const interesse: Interesse = e.interesse && e.interesse in INTERESSES ? e.interesse : "comprar";
  const utm =
    e.origem?.utm && typeof e.origem.utm === "object"
      ? Object.fromEntries(
          Object.entries(e.origem.utm)
            .filter(([k, v]) => /^utm_[a-z]+$/.test(k) && typeof v === "string")
            .slice(0, 6)
            .map(([k, v]) => [k, texto(v, 80)]),
        )
      : undefined;
  return {
    ok: true,
    lead: {
      nome,
      whatsapp,
      email: email || undefined,
      interesse,
      uso: texto(e.uso, 40) || undefined,
      orcamento: texto(e.orcamento, 40) || undefined,
      preferencias: textoLongo(e.preferencias, 600) || undefined,
      aparelhoId: texto(e.aparelhoId, 40) || undefined,
      aparelhoNome: texto(e.aparelhoNome, 120) || undefined,
      origem: {
        pagina: texto(e.origem?.pagina, 120) || "/seminovos",
        bloco: texto(e.origem?.bloco, 40) || undefined,
        utm: utm && Object.keys(utm).length ? utm : undefined,
        referrer: texto(e.origem?.referrer, 200) || undefined,
      },
    },
  };
}

export async function guardarLead(lead: Omit<LeadSeminovo, "id" | "criadoEm" | "status">): Promise<LeadSeminovo> {
  const agora = new Date();
  const novo: LeadSeminovo = { id: novoId(), criadoEm: agora.toISOString(), status: "novo", ...lead };
  await atualizar<LeadSeminovo[]>(chaveDosLeads(agora), () => [], (lista) => {
    // O mesmo número pedindo de novo em 10 minutos é o mesmo lead (duplo clique, volta do WhatsApp).
    const repetido = lista.find(
      (l) => l.whatsapp === novo.whatsapp && agora.getTime() - Date.parse(l.criadoEm) < 10 * 60 * 1000 && l.aparelhoId === novo.aparelhoId,
    );
    if (repetido) return undefined;
    lista.unshift(novo);
    return lista.slice(0, 5000);
  });
  return novo;
}

/** Leads deste mês e dos anteriores (até `meses`), mais novos primeiro. */
export async function lerLeads(meses = 3): Promise<LeadSeminovo[]> {
  const hoje = new Date();
  const chaves = Array.from({ length: meses }, (_, i) => chaveDosLeads(new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - i, 15))));
  const listas = await Promise.all(chaves.map((c) => ler<LeadSeminovo[]>(c).then((r) => r.dados ?? []).catch(() => [])));
  return listas.flat().sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function marcarLead(id: string, criadoEm: string, status: StatusDoLead, nota?: string) {
  const quando = new Date(criadoEm);
  if (Number.isNaN(quando.getTime())) throw new Error("Lead sem data");
  await atualizar<LeadSeminovo[]>(chaveDosLeads(quando), () => [], (lista) => {
    const l = lista.find((x) => x.id === id);
    if (!l) return undefined;
    l.status = status;
    if (nota !== undefined) l.nota = textoLongo(nota, 500) || undefined;
    return lista;
  });
}

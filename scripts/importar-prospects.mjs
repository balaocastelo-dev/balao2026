#!/usr/bin/env node
/**
 * Importa uma agenda de contatos para a tabela `prospects`.
 *
 * Uso:
 *   node scripts/importar-prospects.mjs <arquivo> --origem agenda-2026 [--segmento b2c] [--gravar]
 *
 * Sem `--gravar` ele só analisa e mostra o que faria. Isso é de propósito:
 * uma agenda de 10 mil linhas costuma ter lixo, duplicata e número quebrado,
 * e descobrir isso depois de gravar é muito mais caro do que antes.
 *
 * Formatos: .csv / .txt (qualquer separador), .vcf (vCard), .json.
 * Se nada for reconhecido, cai para varredura bruta de telefones no texto —
 * export de agenda vem em formato imprevisível, e é melhor aproveitar o que
 * der do que recusar o arquivo inteiro.
 */

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const arquivo = args.find((a) => !a.startsWith("--"));
const opt = (nome, padrao = null) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : padrao;
};
const gravar = args.includes("--gravar");
const origem = opt("origem", "agenda");
const segmentoPadrao = opt("segmento", null);

if (!arquivo) {
  console.error("uso: node scripts/importar-prospects.mjs <arquivo> --origem <nome> [--segmento b2b|b2c] [--gravar]");
  process.exit(1);
}

/* ---------------------------------------------------------------- *
 * Telefone
 * ---------------------------------------------------------------- */

/**
 * Mesma regra do site (lib/captura.ts), repetida aqui porque este script roda
 * fora do Next e não deve arrastar o app inteiro para importar um CSV.
 *
 * Descarta o que não dá para usar: número inválido gravado é lead morto
 * ocupando lugar, e o vendedor perde tempo tentando falar.
 */
function normalizarWhatsApp(bruto) {
  let d = String(bruto || "").replace(/\D/g, "");
  if (!d) return null;

  // Excesso de zeros de discagem internacional (0055..., 00...).
  d = d.replace(/^0+/, "");

  if (d.length === 10 || d.length === 11) {
    const ddd = Number(d.slice(0, 2));
    if (ddd < 11 || ddd > 99) return null;
    return `55${d}`;
  }
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) {
    const ddd = Number(d.slice(2, 4));
    if (ddd < 11 || ddd > 99) return null;
    return d;
  }
  return null;
}

/** Celular brasileiro tem 9 na frente do número; fixo não recebe WhatsApp. */
function ehCelular(e164) {
  const local = e164.slice(4); // tira 55 + DDD
  return local.length === 9 && local.startsWith("9");
}

/* ---------------------------------------------------------------- *
 * Leitura
 * ---------------------------------------------------------------- */

function lerVCard(texto) {
  const out = [];
  for (const bloco of texto.split(/BEGIN:VCARD/i).slice(1)) {
    const nome = (bloco.match(/^FN[^:]*:(.+)$/im) || [])[1]?.trim() || null;
    const org = (bloco.match(/^ORG[^:]*:(.+)$/im) || [])[1]?.trim() || null;
    const email = (bloco.match(/^EMAIL[^:]*:(.+)$/im) || [])[1]?.trim() || null;
    for (const m of bloco.matchAll(/^TEL[^:]*:(.+)$/gim)) {
      out.push({ nome, empresa: org, email, telefone: m[1].trim() });
    }
  }
  return out;
}

function separador(linha) {
  for (const s of [";", "\t", ",", "|"]) if (linha.split(s).length > 1) return s;
  return ",";
}

function lerTabular(texto) {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (!linhas.length) return [];
  const sep = separador(linhas[0]);
  const cab = linhas[0].split(sep).map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ""));

  const acha = (...termos) => cab.findIndex((c) => termos.some((t) => c.includes(t)));
  const iTel = acha("whats", "telefone", "celular", "fone", "phone", "numero", "número", "contato");
  const iNome = acha("nome", "name", "cliente", "contato ");
  const iEmail = acha("email", "e-mail");
  const iEmpresa = acha("empresa", "company", "razao", "razão");

  // Sem cabeçalho reconhecível: trata tudo como dado e procura telefone em
  // qualquer coluna. Agenda exportada raramente tem cabeçalho bonito.
  const temCabecalho = iTel >= 0 || iNome >= 0;
  const corpo = temCabecalho ? linhas.slice(1) : linhas;

  return corpo.map((l) => {
    const col = l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (temCabecalho && iTel >= 0) {
      return {
        telefone: col[iTel],
        nome: iNome >= 0 ? col[iNome] : null,
        email: iEmail >= 0 ? col[iEmail] : null,
        empresa: iEmpresa >= 0 ? col[iEmpresa] : null,
      };
    }
    const tel = col.find((c) => normalizarWhatsApp(c));
    const nome = col.find((c) => c !== tel && /[a-zA-ZÀ-ú]{3}/.test(c));
    return { telefone: tel, nome: nome || null, email: null, empresa: null };
  });
}

function lerBruto(texto) {
  // Última tentativa: qualquer sequência que pareça telefone no texto inteiro.
  const achados = texto.match(/(?:\+?55\s*)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/g) || [];
  return achados.map((t) => ({ telefone: t, nome: null, email: null, empresa: null }));
}

const texto = fs.readFileSync(arquivo, "utf8");
let brutos;
if (/BEGIN:VCARD/i.test(texto)) brutos = lerVCard(texto);
else if (texto.trimStart().startsWith("[") || texto.trimStart().startsWith("{")) {
  const j = JSON.parse(texto);
  const lista = Array.isArray(j) ? j : j.contatos || j.leads || j.data || [];
  brutos = lista.map((o) => ({
    telefone: o.whatsapp || o.telefone || o.celular || o.phone || o.numero,
    nome: o.nome || o.name || null,
    email: o.email || null,
    empresa: o.empresa || o.company || null,
  }));
} else brutos = lerTabular(texto);

if (!brutos.some((b) => normalizarWhatsApp(b.telefone))) brutos = lerBruto(texto);

/* ---------------------------------------------------------------- *
 * Normalização e deduplicação
 * ---------------------------------------------------------------- */

const porNumero = new Map();
let invalidos = 0, fixos = 0, duplicadosNoArquivo = 0;

for (const b of brutos) {
  const e164 = normalizarWhatsApp(b.telefone);
  if (!e164) { invalidos++; continue; }
  if (!ehCelular(e164)) { fixos++; continue; }

  if (porNumero.has(e164)) {
    duplicadosNoArquivo++;
    // Mantém a linha com mais informação: agenda repete o mesmo número com
    // nome preenchido numa entrada e vazio noutra.
    const atual = porNumero.get(e164);
    if (!atual.nome && b.nome) atual.nome = String(b.nome).trim();
    if (!atual.email && b.email) atual.email = String(b.email).trim();
    if (!atual.empresa && b.empresa) atual.empresa = String(b.empresa).trim();
    continue;
  }

  porNumero.set(e164, {
    whatsapp: e164,
    nome: b.nome ? String(b.nome).trim().slice(0, 120) : null,
    email: b.email ? String(b.email).trim().slice(0, 200) : null,
    empresa: b.empresa ? String(b.empresa).trim().slice(0, 160) : null,
    origem,
    segmento: segmentoPadrao,
    status: "novo",
  });
}

const unicos = [...porNumero.values()];

console.log(`arquivo          : ${arquivo}`);
console.log(`linhas lidas     : ${brutos.length}`);
console.log(`telefones inválidos: ${invalidos}`);
console.log(`fixos (sem WhatsApp): ${fixos}`);
console.log(`duplicados no arquivo: ${duplicadosNoArquivo}`);
console.log(`únicos aproveitáveis : ${unicos.length}`);
console.log(`com nome         : ${unicos.filter((u) => u.nome).length}`);
console.log(`com e-mail       : ${unicos.filter((u) => u.email).length}`);
console.log();
console.log("amostra:");
for (const u of unicos.slice(0, 5)) console.log(`  ${u.whatsapp}  ${u.nome || "(sem nome)"}`);

if (!gravar) {
  console.log("\n[simulação] nada foi gravado. Rode de novo com --gravar para valer.");
  process.exit(0);
}

/* ---------------------------------------------------------------- *
 * Gravação
 * ---------------------------------------------------------------- */

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !chave) {
  console.error("faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente");
  process.exit(1);
}
const sb = createClient(url, chave, { auth: { persistSession: false } });

let gravados = 0, jaExistiam = 0;
for (let i = 0; i < unicos.length; i += 500) {
  const lote = unicos.slice(i, i + 500);
  // ignoreDuplicates: quem já está na base mantém status e histórico. Uma
  // reimportação não pode ressuscitar como "novo" alguém já contatado, nem
  // apagar um opt-out.
  const { error, count } = await sb
    .from("prospects")
    .upsert(lote, { onConflict: "whatsapp", ignoreDuplicates: true, count: "exact" });
  if (error) { console.error("lote", i, error.message); continue; }
  gravados += count ?? 0;
  jaExistiam += lote.length - (count ?? 0);
  process.stdout.write(`\r  gravados ${gravados}/${unicos.length}`);
}
console.log(`\n\nnovos gravados : ${gravados}`);
console.log(`já existiam    : ${jaExistiam}`);

/**
 * Conserta nomes de prospect com acento quebrado.
 *
 * O export de agenda que veio pelo Telegram (contatos.vcf) foi gravado em
 * UTF-8 e lido como CP850 em algum ponto antes de chegar aqui: "Márcia" virou
 * "M├írcia", "José" virou "Jos├®". O caminho de volta é exato — reencoda em
 * CP850 e lê como UTF-8 — então isto não adivinha nome nenhum, só desfaz a
 * conversão errada. Linha que não voltar limpa fica como está.
 *
 * Por que importa: o Beto e a Carla cumprimentam pelo primeiro nome
 * ({nome} na mensagem). "Oi M├írcia!" numa mensagem fria é pior do que não
 * mandar mensagem nenhuma.
 *
 * O export do Google veio correto; por isso só as linhas de origem
 * 'agenda-2026' entram aqui.
 *
 * Roda seco por padrão:
 *   node scripts/corrigir-nomes-prospects.mjs           (mostra o que faria)
 *   node scripts/corrigir-nomes-prospects.mjs --gravar  (aplica)
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(
  env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);
const gravar = process.argv.includes("--gravar");

// CP850, posições 0x80–0xFF. É esta, não a CP437: as duas só divergem em
// alguns pontos, e um deles é o 0xA9 — que em CP850 é "®", o byte de
// continuação de "é". Com a tabela errada, todo "Jos├®" ficaria sem conserto.
const CP850_ALTOS =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ";

function paraBytes(texto) {
  const saida = [];
  for (const ch of texto) {
    const cod = ch.codePointAt(0);
    if (cod < 0x80) { saida.push(cod); continue; }
    const i = CP850_ALTOS.indexOf(ch);
    if (i < 0) return null; // caractere fora da CP850: não é mojibake desta origem
    saida.push(0x80 + i);
  }
  return Uint8Array.from(saida);
}

/**
 * Tira o lixo que sobra depois do conserto.
 *
 * Emoji são 3 ou 4 bytes em UTF-8; lidos como CP850 viram sequências como
 * "­ƒî╗" e "ÔØñ´©Å", que a reversão acima não recupera (o intervalo não fecha
 * de volta). Como não dá para saber qual emoji era, some — e é o certo:
 * o campo é usado para chamar a pessoa pelo nome numa mensagem.
 */
function limparRestos(texto) {
  return texto
    .replace(/(\u00AD[^\x00-\x7F]{0,3}|\u00D4[^\x00-\x7F]{1,2}|\u00B4\u00A9\u00C5)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Desfaz UTF-8 lido como CP850. Devolve null se não for reversível. */
export function desmojibakar(texto) {
  const bytes = paraBytes(texto);
  if (!bytes) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(bytes));
  } catch {
    return null;
  }
}

const { data, error } = await db
  .from("prospects")
  .select("id, nome")
  .or("nome.like.%├%,nome.like.%\u00AD%,nome.like.%\u00D4%");
if (error) { console.error(error.message); process.exit(1); }

const correcoes = [];
let irrecuperaveis = 0;
for (const linha of data) {
  const revertido = desmojibakar(linha.nome);
  const novo = limparRestos(revertido || linha.nome);
  if (!novo || novo === linha.nome) { irrecuperaveis++; continue; }
  correcoes.push({ id: linha.id, antes: linha.nome, nome: novo });
}

console.log(`linhas com acento quebrado : ${data.length}`);
console.log(`revertidas                 : ${correcoes.length}`);
console.log(`sem conserto               : ${irrecuperaveis}`);
console.log("\namostra:");
for (const c of correcoes.slice(0, 10)) console.log(`  ${c.antes}\n    -> ${c.nome}`);

if (!gravar) { console.log("\n(seco — use --gravar para aplicar)"); process.exit(0); }

let ok = 0;
for (const c of correcoes) {
  const { error: e } = await db.from("prospects").update({ nome: c.nome }).eq("id", c.id);
  if (e) console.error(`  falhou ${c.id}: ${e.message}`);
  else ok++;
}
console.log(`\ngravadas: ${ok}`);

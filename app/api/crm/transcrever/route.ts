import { NextResponse } from "next/server";
import { ticketDaSessao, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Áudio do WhatsApp -> texto, com o Whisper da Groq.
//
// O painel pede a transcrição de uma mensagem pelo id; esta rota baixa o
// áudio do servidor da loja (com o ingresso de quem pediu), manda para a
// Groq e devolve o texto. Quem guarda o resultado é o servidor da VPS, para
// o mesmo áudio não ser transcrito duas vezes.
const LIMITE_BYTES = 24 * 1024 * 1024; // a Groq aceita até 25 MB
const MODELO = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo";

export async function POST(request: Request) {
  const sessao = await ticketDaSessao();
  if (!sessao) return NextResponse.json({ ok: false, erro: "Entre no painel primeiro." }, { status: 401 });

  const chave = process.env.GROQ_API_KEY;
  if (!chave) return NextResponse.json({ ok: false, erro: "GROQ_API_KEY não configurada na Vercel." }, { status: 500 });

  const corpo = await request.json().catch(() => null);
  const id = String(corpo?.id || "").trim();
  if (!id || !/^[A-Za-z0-9_-]{6,80}$/.test(id)) {
    return NextResponse.json({ ok: false, erro: "Mensagem inválida." }, { status: 400 });
  }

  try {
    const audio = await fetch(`${urlDoServidorWhatsApp()}/midia/${encodeURIComponent(id)}`, {
      headers: { authorization: `Bearer ${sessao.ticket}` },
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!audio.ok) throw new Error(`não consegui baixar o áudio (${audio.status})`);

    const tipo = audio.headers.get("content-type") || "audio/ogg";
    if (!tipo.startsWith("audio/") && !tipo.startsWith("video/")) throw new Error("esta mensagem não é áudio");
    const bytes = await audio.arrayBuffer();
    if (bytes.byteLength > LIMITE_BYTES) throw new Error("áudio grande demais para transcrever (máx. 24 MB)");

    const extensao = tipo.includes("ogg") ? "ogg" : tipo.includes("mpeg") ? "mp3" : tipo.includes("mp4") ? "m4a" : "ogg";
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: tipo.split(";")[0] }), `audio.${extensao}`);
    form.append("model", MODELO);
    form.append("language", "pt");
    form.append("response_format", "json");
    form.append("temperature", "0");

    const groq = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { authorization: `Bearer ${chave}` },
      body: form,
      signal: AbortSignal.timeout(45000),
    });
    const resposta = await groq.json().catch(() => ({}));
    if (!groq.ok) throw new Error(resposta?.error?.message || `Groq respondeu ${groq.status}`);

    const texto = String(resposta?.text || "").trim();
    return NextResponse.json({ ok: true, texto: texto || "(áudio sem fala reconhecível)" });
  } catch (erro) {
    return NextResponse.json({ ok: false, erro: (erro as Error).message }, { status: 502 });
  }
}

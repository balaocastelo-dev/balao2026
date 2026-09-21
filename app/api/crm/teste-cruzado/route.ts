import { isPainelAuthenticated } from "@/lib/painel-auth";
import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";
import { getCachedProducts } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Teste cruzado do WhatsApp, de verdade: a linha da loja manda texto, foto,
// vídeo, áudio de voz, PDF e um produto do catálogo para a linha de teste, e
// a linha de teste confirma o que chegou (e se a mídia baixa). Depois a
// linha de teste responde e o painel precisa receber. O áudio recebido é
// transcrito pela Groq para conferir a transcrição.
//
// Abra logado no painel: www.balao.info/api/crm/teste-cruzado

type Linha = {
  caso: string;
  enviado: boolean;
  chegou: boolean;
  midiaOk?: boolean | null;
  detalhe?: string | null;
  ms?: number | null;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function pagina(corpo: string, atualizarEmS?: number) {
  return new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${atualizarEmS ? `<meta http-equiv="refresh" content="${atualizarEmS}">` : ""}
<title>Teste cruzado do WhatsApp</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px;background:#f6f7f6;color:#1d2521}
main{max-width:760px;margin:auto}h1{font-size:22px;margin:0 0 4px}.sub{color:#5b6660;margin:0 0 20px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden}
td,th{padding:10px 12px;border-bottom:1px solid #e6e9e7;text-align:left;vertical-align:top}th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#5b6660}
.ok{color:#0a6e3d;font-weight:600}.falha{color:#b3261e;font-weight:600}.caixa{background:#fff;border-radius:10px;padding:16px;margin:16px 0}
a.botao{display:inline-block;background:#0a6e3d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600}
img.qr{width:260px;height:260px;image-rendering:pixelated}code{background:#eef1ef;padding:1px 5px;border-radius:4px}
</style></head><body><main>${corpo}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );
}

async function vps(caminho: string, init: RequestInit = {}) {
  const ticket = ticketDeServico();
  if (!ticket) throw new Error("PAINEL_PASSWORD não configurada na Vercel");
  const res = await fetch(`${urlDoServidorWhatsApp()}${caminho}`, {
    ...init,
    headers: { authorization: `Bearer ${ticket}`, "content-type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  return res;
}

async function transcrever(id: string): Promise<string> {
  const chave = process.env.GROQ_API_KEY;
  if (!chave) return "GROQ_API_KEY não configurada";
  const audio = await vps(`/api/diagnostico/midia-teste/${encodeURIComponent(id)}`);
  if (!audio.ok) return `não consegui baixar o áudio (${audio.status})`;
  const tipo = audio.headers.get("content-type") || "audio/ogg";
  const form = new FormData();
  form.append("file", new Blob([await audio.arrayBuffer()], { type: tipo.split(";")[0] }), "audio.ogg");
  form.append("model", process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo");
  form.append("language", "pt");
  const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${chave}` },
    body: form,
    signal: AbortSignal.timeout(30000),
  });
  const j = await r.json().catch(() => ({}));
  return r.ok ? String(j?.text || "").trim() : `Groq recusou: ${j?.error?.message || r.status}`;
}

export async function GET(request: Request) {
  if (!(await isPainelAuthenticated())) {
    return pagina(`<h1>Teste cruzado do WhatsApp</h1><p>Entre primeiro no <a href="/crm">/crm</a> e abra este endereço de novo.</p>`);
  }
  const url = new URL(request.url);

  try {
    const estadoLoja = await vps("/api/crm/status").then((r) => r.json());
    if (!estadoLoja?.connected) {
      return pagina(
        `<h1>Teste cruzado do WhatsApp</h1><p class="falha">A linha da loja não está conectada.</p><p>Abra o <a href="/crm">/crm</a> e leia o QR Code com o celular da loja. Esta página atualiza sozinha.</p>`,
        15
      );
    }

    const linha = await vps("/api/diagnostico/linha-teste", { method: "POST" }).then((r) => r.json());
    if (linha?.estado !== "conectado") {
      return pagina(
        `<h1>Conectar a linha de teste</h1>
<p class="sub">Use o celular que vai <b>receber</b> as mensagens de teste (não o da loja).</p>
<div class="caixa">${linha?.qrCode ? `<img class="qr" src="${esc(linha.qrCode)}" alt="QR Code">` : "<p>Gerando QR Code…</p>"}
<p>No celular: WhatsApp → <b>Aparelhos conectados</b> → <b>Conectar um aparelho</b> → aponte para o código.</p></div>
<p class="sub">A página atualiza a cada 20 segundos. ${linha?.erro ? esc(linha.erro) : ""}</p>`,
        20
      );
    }

    if (url.searchParams.get("acao") === "iniciar") {
      let produtoId = url.searchParams.get("produto");
      if (!produtoId) {
        const produtos = await getCachedProducts().catch(() => []);
        produtoId = String(produtos.find((p) => p.image && p.price)?.id || "");
      }
      await vps("/api/diagnostico/cruzado", { method: "POST", body: JSON.stringify({ produtoId: produtoId || undefined }) });
      return Response.redirect(new URL("/api/crm/teste-cruzado", url).toString(), 303);
    }

    const exec = await vps("/api/diagnostico/cruzado").then((r) => r.json());
    const cabecalho = `<h1>Teste cruzado do WhatsApp</h1><p class="sub">Loja → linha de teste <code>${esc(linha.numero)}</code>, e de volta.</p>`;

    if (exec?.rodando) {
      const s = Math.round((Date.now() - exec.inicio) / 1000);
      return pagina(`${cabecalho}<div class="caixa">Rodando há ${s} s… (leva de 1 a 3 minutos)</div>`, 5);
    }
    if (!exec?.resultado && !exec?.erro) {
      return pagina(`${cabecalho}<p><a class="botao" href="?acao=iniciar">Rodar o teste agora</a></p>`);
    }
    if (exec.erro) {
      return pagina(`${cabecalho}<p class="falha">O teste parou: ${esc(exec.erro)}</p><p><a class="botao" href="?acao=iniciar">Rodar de novo</a></p>`);
    }

    const r = exec.resultado;
    const linhas: Linha[] = r.resultado || [];
    const passou = linhas.filter((l) => l.chegou && l.midiaOk !== false).length;
    let transcricao = "";
    if (r.audioRecebidoId) transcricao = await transcrever(r.audioRecebidoId).catch((e) => `falhou: ${e.message}`);

    const tabela = linhas
      .map(
        (l) => `<tr><td>${esc(l.caso)}</td>
<td class="${l.enviado ? "ok" : "falha"}">${l.enviado ? "sim" : "não"}</td>
<td class="${l.chegou ? "ok" : "falha"}">${l.chegou ? `sim${l.ms ? ` (${(l.ms / 1000).toFixed(1)} s)` : ""}` : "não"}</td>
<td class="${l.midiaOk === false ? "falha" : l.midiaOk ? "ok" : ""}">${l.midiaOk == null ? "—" : l.midiaOk ? "baixou" : "falhou"}</td>
<td>${esc(l.detalhe || "")}</td></tr>`
      )
      .join("");

    return pagina(`${cabecalho}
<div class="caixa"><b>${passou} de ${linhas.length}</b> casos passaram · código <code>${esc(r.tag)}</code> · terminou ${new Date(exec.fim).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</div>
<div style="overflow-x:auto"><table><thead><tr><th>Caso</th><th>Enviado</th><th>Chegou</th><th>Mídia</th><th>Detalhe</th></tr></thead><tbody>${tabela}</tbody></table></div>
<div class="caixa"><b>Transcrição do áudio recebido:</b><br>${transcricao ? esc(transcricao) : "—"}<br><span class="sub">Texto gravado: “Olá, aqui é o teste da loja Balão da Informática. Quero saber o preço do notebook.”</span></div>
<p><a class="botao" href="?acao=iniciar">Rodar de novo</a></p>`);
  } catch (erro) {
    return pagina(`<h1>Teste cruzado do WhatsApp</h1><p class="falha">Não consegui falar com o servidor do WhatsApp: ${esc((erro as Error).message)}</p>`, 20);
  }
}

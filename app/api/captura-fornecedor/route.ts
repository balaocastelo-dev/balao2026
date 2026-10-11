// ============================================================
// Recebe a captura do catálogo de um fornecedor da Kyte, feita no navegador
// da loja (public/captura-fornecedor.js), e entrega ao painel.
//
// Por que existe: o catálogo da Kyte recusa servidores, então quem lê é o
// navegador, na página do fornecedor. Dali, o único jeito de levar os dados
// ao site sem pedir senha de novo é um formulário: o navegador vai para cá
// (POST, com os produtos), e esta resposta guarda os produtos no
// sessionStorage da aba e segue para /painel/precos/receber — já dentro do
// painel, com a sessão de sempre.
//
// Esta rota NÃO grava nada no banco. Nada é importado sem o Thiago (ou a
// tarefa diária, logada no painel) apertar "Importar" na tela de recebimento.
// Só aceita formulário vindo de um catálogo da Kyte (cabeçalho Origin).
// ============================================================

export const dynamic = "force-dynamic";

const ORIGEM_KYTE = /^https:\/\/([a-z0-9-]{2,63}\.(?:catalog\.)?kyte\.site)$/;
const TAMANHO_MAXIMO = 6 * 1024 * 1024;

function pagina(status: number, corpo: string) {
  return new Response(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Balão — recebendo catálogo</title></head><body style="font-family:system-ui;padding:2rem">${corpo}</body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" },
  });
}

export async function POST(request: Request) {
  const origem = request.headers.get("origin") || "";
  const host = origem.match(ORIGEM_KYTE)?.[1];
  if (!host) return pagina(403, "<p>Este endereço só recebe catálogos de fornecedores da Kyte.</p>");

  const tamanho = Number(request.headers.get("content-length") || 0);
  if (tamanho > TAMANHO_MAXIMO) return pagina(413, "<p>Catálogo grande demais para uma vez só.</p>");

  let dados: { host?: unknown; loja?: unknown; produtos?: unknown; capturadoEm?: unknown };
  try {
    const formulario = await request.formData();
    dados = JSON.parse(String(formulario.get("dados") || "{}"));
  } catch {
    return pagina(400, "<p>Não consegui ler o catálogo enviado.</p>");
  }
  if (!Array.isArray(dados.produtos) || dados.produtos.length === 0 || dados.produtos.length > 5000) {
    return pagina(400, "<p>O catálogo veio sem produtos.</p>");
  }

  const captura = {
    host, // o endereço vem do cabeçalho do navegador, não do que a página escreveu
    loja: String(dados.loja || "").slice(0, 120),
    capturadoEm: new Date().toISOString(),
    produtos: dados.produtos,
  };
  // JSON dentro de <script>: escapa o que poderia fechar a tag.
  const json = JSON.stringify(JSON.stringify(captura))
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
  return pagina(
    200,
    `<p>Recebendo o catálogo de ${host}…</p><script>try{sessionStorage.setItem("balao-captura",${json});location.replace("/painel/precos/receber");}catch(e){document.body.innerHTML="<p>Não consegui guardar o catálogo nesta aba: "+String(e)+"</p>";}</script>`
  );
}

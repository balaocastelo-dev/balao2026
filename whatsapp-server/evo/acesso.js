// Quem pode falar com este servidor.
//
// Antes, qualquer pessoa na internet que abrisse um socket aqui recebia todas
// as conversas da loja e podia mandar mensagem em nome dela. Agora toda
// conexao precisa de um "ingresso" (ticket) emitido pelo site para quem ja
// entrou no /crm ou na pagina pessoal do vendedor.
//
// O ingresso e assinado pelo site com um segredo que so existe na Vercel. Esta
// VPS nao guarda segredo nenhum: pergunta ao site se o ingresso vale e guarda a
// resposta ate ele vencer. Assim nao ha senha nova para configurar aqui, e
// quem invadir a VPS nao consegue fabricar ingressos.

function lerValidade(ticket) {
  try {
    const [, corpo] = String(ticket).split(".");
    const json = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    return Number(json.exp) || 0;
  } catch {
    return 0;
  }
}

function criarAcesso({ urlDoSite, buscar = fetch, registrar = console.log, agora = () => Date.now() }) {
  const base = String(urlDoSite).replace(/\/$/, "");
  const validos = new Map(); // ticket -> { papel, vendedor, exp }
  const recusados = new Map(); // ticket -> ate quando nao perguntar de novo
  const emVoo = new Map();

  function limpar() {
    const t = agora();
    for (const [k, v] of validos) if (v.exp * 1000 < t) validos.delete(k);
    for (const [k, ate] of recusados) if (ate < t) recusados.delete(k);
  }
  setInterval(limpar, 10 * 60_000).unref?.();

  async function perguntarAoSite(ticket) {
    const resposta = await buscar(`${base}/api/painel/socket-ticket/verificar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticket }),
      signal: AbortSignal.timeout(10_000),
    });
    if (resposta.status === 401 || resposta.status === 403) return null;
    if (!resposta.ok) throw new Error(`site respondeu ${resposta.status}`);
    const json = await resposta.json();
    return json?.ok ? { papel: json.papel, vendedor: json.vendedor || null, exp: Number(json.exp) } : null;
  }

  /** Devolve { papel, vendedor } ou null. Nunca lança. */
  async function verificar(ticket) {
    const t = String(ticket || "").trim();
    if (!t || t.length > 2000 || !t.startsWith("v1.")) return null;

    const exp = lerValidade(t);
    if (!exp || exp * 1000 < agora()) return null;

    const guardado = validos.get(t);
    if (guardado) return guardado;
    if ((recusados.get(t) || 0) > agora()) return null;

    if (!emVoo.has(t)) {
      emVoo.set(
        t,
        perguntarAoSite(t)
          .then((r) => {
            if (r && r.exp * 1000 > agora()) validos.set(t, r);
            else recusados.set(t, agora() + 60_000);
            return r;
          })
          .catch((erro) => {
            registrar("[acesso] Nao consegui confirmar o ingresso com o site:", erro.message);
            return null;
          })
          .finally(() => emVoo.delete(t))
      );
    }
    return emVoo.get(t);
  }

  function ticketDaRequisicao(req) {
    const cabecalho = String(req.headers?.authorization || "");
    if (cabecalho.toLowerCase().startsWith("bearer ")) return cabecalho.slice(7).trim();
    return String(req.query?.t || req.headers?.["x-balao-ticket"] || "").trim();
  }

  /** Middleware do Express. `papeis` restringe (ex.: so "admin"). */
  function exigir(papeis = null) {
    return async (req, res, next) => {
      const quem = await verificar(ticketDaRequisicao(req));
      if (!quem) return res.status(401).json({ ok: false, erro: "Acesso negado. Entre pelo painel do site." });
      if (papeis && !papeis.includes(quem.papel)) {
        return res.status(403).json({ ok: false, erro: "Seu acesso não permite esta ação." });
      }
      req.quem = quem;
      next();
    };
  }

  return { verificar, exigir, ticketDaRequisicao };
}

module.exports = { criarAcesso, lerValidade };

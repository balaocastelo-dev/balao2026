"use client";

// Mandar produto, preço e link do site por e-mail, direto da conversa.
//
// Complementa o WhatsApp: orçamento formal para empresa aprovar, cliente que
// pede "me manda por e-mail", registro com foto, preço e link que não se perde.
// Quem monta e manda é o site (app/api/crm/email/enviar); aqui é só a tela.
// O preço que aparece é o do site; o vendedor pode dar preço especial à vista,
// e o site recusa abaixo do custo.

import { useEffect, useMemo, useRef, useState } from "react";
import { emailsNoTexto, validarEmail, validarLinkDoSite } from "@/lib/crm/email-validacao";
import { parsePriceToNumber } from "@/lib/utils";

export type ProdutoParaEmail = { id: string; nome: string; preco: number; imagem?: string | null };

type Linha = ProdutoParaEmail & { precoTexto: string; quantidade: number };

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  chat: { id: string; nome: string; numero?: string | null } | null;
  /** Produtos escolhidos no catálogo do painel (📧 em cada card). */
  produtosIniciais: ProdutoParaEmail[];
  /** Texto da conversa aberta: o CRM sugere o e-mail que o cliente digitou. */
  textosDaConversa: string[];
  vendedorNome?: string | null;
  /** Chamada ao servidor da VPS com o ingresso (ficha do cliente). */
  fetchServidor: (caminho: string, init?: RequestInit) => Promise<Response>;
  aoEnviar: (r: { para: string; envioId: string }) => void;
  avisar: (texto: string) => void;
};

const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// "399,90", "1.149,70", "R$ 399,90" -> número (0 quando não dá para ler).
const lerValor = (t: string) => parsePriceToNumber(t);

export default function EnviarPorEmail({
  aberto,
  aoFechar,
  chat,
  produtosIniciais,
  textosDaConversa,
  vendedorNome,
  fetchServidor,
  aoEnviar,
  avisar,
}: Props) {
  const [para, setPara] = useState("");
  const [emailDaFicha, setEmailDaFicha] = useState<string | null>(null);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitulo, setLinkTitulo] = useState("");
  const [busca, setBusca] = useState("");
  const [achados, setAchados] = useState<ProdutoParaEmail[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [previa, setPrevia] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"previa" | "enviar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const abriuPara = useRef<string | null>(null);

  const sugestoes = useMemo(() => emailsNoTexto(textosDaConversa).slice(0, 4), [textosDaConversa]);

  // Ao abrir para uma conversa: produtos escolhidos, e-mail da ficha (ou o que o cliente digitou).
  useEffect(() => {
    if (!aberto || !chat) return;
    if (abriuPara.current !== chat.id) {
      abriuPara.current = chat.id;
      setPara("");
      setEmailDaFicha(null);
      setAssunto("");
      setMensagem("");
      setLinkUrl("");
      setLinkTitulo("");
      setPrevia(null);
      setErro(null);
      fetchServidor(`/api/comando/contatos/${encodeURIComponent(chat.id)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const e = j?.contato?.email || null;
          setEmailDaFicha(e);
          setPara((atual) => atual || e || "");
        })
        .catch(() => {});
    }
    setLinhas((atuais) => {
      const porId = new Map(atuais.map((l) => [l.id, l]));
      for (const p of produtosIniciais) {
        if (!porId.has(p.id)) porId.set(p.id, { ...p, precoTexto: p.preco.toFixed(2).replace(".", ","), quantidade: 1 });
      }
      return [...porId.values()];
    });
  }, [aberto, chat, produtosIniciais, fetchServidor]);

  useEffect(() => {
    if (!para && !emailDaFicha && sugestoes.length) setPara(sugestoes[0]);
  }, [sugestoes, para, emailDaFicha]);

  // Busca no catálogo do site (a mesma rota do catálogo do painel).
  useEffect(() => {
    const termo = busca.trim();
    if (termo.length < 2) {
      setAchados([]);
      return;
    }
    const t = setTimeout(() => {
      setBuscando(true);
      fetch(`/api/products?${new URLSearchParams({ search: termo, limit: "6", page: "1" })}`)
        .then((r) => r.json())
        .then((d) => {
          const rows = Array.isArray(d) ? d : Array.isArray(d?.products) ? d.products : [];
          setAchados(
            rows.slice(0, 6).map((p: Record<string, unknown>) => ({
              id: String(p.id),
              nome: String(p.name || "Produto"),
              preco: lerValor(String(p.price ?? "")),
              imagem: (p.image as string) || null,
            }))
          );
        })
        .catch(() => setAchados([]))
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  if (!aberto || !chat) return null;

  const adicionar = (p: ProdutoParaEmail) => {
    setLinhas((atuais) =>
      atuais.some((l) => l.id === p.id) ? atuais : [...atuais, { ...p, precoTexto: p.preco.toFixed(2).replace(".", ","), quantidade: 1 }]
    );
    setBusca("");
    setAchados([]);
    setPrevia(null);
  };
  const mudar = (id: string, campo: Partial<Linha>) => {
    setLinhas((atuais) => atuais.map((l) => (l.id === id ? { ...l, ...campo } : l)));
    setPrevia(null);
  };

  const linkValido = linkUrl.trim() ? validarLinkDoSite(linkUrl) : null;
  const total = linhas.reduce((s, l) => s + (lerValor(l.precoTexto) || 0) * l.quantidade, 0);

  const corpo = (comPrevia: boolean) => ({
    previa: comPrevia,
    para: para.trim(),
    chatId: chat.id,
    nomeCliente: chat.nome,
    vendedorNome: vendedorNome || "",
    assunto,
    mensagem,
    itens: linhas.map((l) => {
      const v = lerValor(l.precoTexto);
      // Preço igual ao do site não vai: assim o site usa o dele (e o cartão/parcelado batem).
      return { id: l.id, quantidade: l.quantidade, preco: v > 0 && Math.abs(v - l.preco) >= 0.01 ? v : null };
    }),
    links: linkValido ? [{ titulo: linkTitulo.trim() || "Ver no site", url: linkUrl.trim() }] : [],
  });

  const chamar = async (comPrevia: boolean) => {
    setErro(null);
    if (!comPrevia && !validarEmail(para)) {
      setErro("Confira o e-mail do cliente.");
      return;
    }
    if (linkUrl.trim() && !linkValido) {
      setErro("O link extra precisa ser do site (balao.info).");
      return;
    }
    setOcupado(comPrevia ? "previa" : "enviar");
    try {
      const r = await fetch("/api/crm/email/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo(comPrevia)),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.erro || `o site respondeu ${r.status}`);
      if (comPrevia) {
        setPrevia(String(j.html || ""));
      } else {
        avisar(`📧 E-mail enviado para ${para.trim()}${j.registrado ? "" : " (o registro na ficha fica para quando o servidor responder)"}.`);
        aoEnviar({ para: para.trim(), envioId: j.envioId });
        setLinhas([]);
        abriuPara.current = null;
        aoFechar();
      }
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Enviar por e-mail">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-[#e3e3e3] px-4 py-3">
          <h3 className="font-bold text-sm text-[#202124]">📧 Enviar por e-mail — {chat.nome}</h3>
          <button onClick={aoFechar} className="text-[#5f6368] hover:text-[#202124] text-lg leading-none cursor-pointer" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#202124]">
              Para
              <input
                type="email"
                value={para}
                onChange={(e) => setPara(e.target.value)}
                placeholder="email@do-cliente.com"
                className="mt-1 w-full p-2 border border-[#e3e3e3] rounded-lg text-xs font-normal"
              />
            </label>
            {sugestoes.filter((s) => s !== para.trim().toLowerCase()).length > 0 && (
              <div className="flex flex-wrap gap-1 -mt-1">
                <span className="text-[11px] text-[#5f6368]">Digitado na conversa:</span>
                {sugestoes
                  .filter((s) => s !== para.trim().toLowerCase())
                  .map((s) => (
                    <button key={s} onClick={() => setPara(s)} className="text-[11px] bg-[#f0f2f5] hover:bg-[#e7f6ec] px-2 py-0.5 rounded-full cursor-pointer">
                      {s}
                    </button>
                  ))}
              </div>
            )}

            <label className="block text-xs font-semibold text-[#202124]">
              Assunto <span className="font-normal text-[#5f6368]">(opcional)</span>
              <input
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder={linhas.length === 1 ? `${linhas[0].nome} — orçamento da Balão` : "Orçamento — Balão da Informática"}
                className="mt-1 w-full p-2 border border-[#e3e3e3] rounded-lg text-xs font-normal"
              />
            </label>

            <label className="block text-xs font-semibold text-[#202124]">
              Mensagem
              <textarea
                rows={4}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Separei as opções que conversamos. Os preços abaixo foram conferidos no site hoje."
                className="mt-1 w-full p-2 border border-[#e3e3e3] rounded-lg text-xs font-normal"
              />
            </label>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#202124]">
                Link do site <span className="font-normal text-[#5f6368]">(opcional)</span>
              </div>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.balao.info/pcgamer"
                className={`w-full p-2 border rounded-lg text-xs ${linkUrl.trim() && !linkValido ? "border-red-400" : "border-[#e3e3e3]"}`}
              />
              {linkUrl.trim() && (
                <input
                  value={linkTitulo}
                  onChange={(e) => setLinkTitulo(e.target.value)}
                  placeholder="Texto do link (ex.: PCs gamer montados na loja)"
                  className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#202124]">Produtos</div>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto no site para incluir…"
              className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
            />
            {(buscando || achados.length > 0) && (
              <div className="border border-[#e3e3e3] rounded-lg divide-y divide-[#f0f2f5] max-h-48 overflow-y-auto">
                {buscando && <div className="p-2 text-[11px] text-[#5f6368]">Buscando…</div>}
                {achados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => adicionar(p)}
                    className="w-full text-left p-2 hover:bg-[#f7f8fa] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="flex-1 text-[11px] line-clamp-2">{p.nome}</span>
                    <span className="text-[11px] font-bold text-[#0a6e3d] whitespace-nowrap">{reais(p.preco)}</span>
                    <span className="text-[#0f9d58] font-bold">＋</span>
                  </button>
                ))}
              </div>
            )}

            {linhas.length === 0 ? (
              <p className="text-[11px] text-[#5f6368] bg-[#f7f8fa] rounded-lg p-3">
                Nenhum produto ainda. Busque acima ou use o 📧 nos cards do catálogo, à direita.
              </p>
            ) : (
              <ul className="space-y-2">
                {linhas.map((l) => {
                  const v = lerValor(l.precoTexto);
                  const especial = v > 0 && v < l.preco - 0.009;
                  return (
                    <li key={l.id} className="border border-[#e3e3e3] rounded-lg p-2 flex gap-2 items-start">
                      {l.imagem ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={l.imagem} alt="" className="w-12 h-12 object-contain rounded bg-[#f7f8fa]" />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold line-clamp-2">{l.nome}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-[10px] text-[#5f6368]">
                            Qtd
                            <input
                              type="number"
                              min={1}
                              value={l.quantidade}
                              onChange={(e) => mudar(l.id, { quantidade: Math.max(1, Number(e.target.value) || 1) })}
                              className="ml-1 w-12 p-1 border border-[#e3e3e3] rounded text-[11px]"
                            />
                          </label>
                          <label className="text-[10px] text-[#5f6368]">
                            À vista R$
                            <input
                              value={l.precoTexto}
                              onChange={(e) => mudar(l.id, { precoTexto: e.target.value })}
                              className="ml-1 w-20 p-1 border border-[#e3e3e3] rounded text-[11px]"
                            />
                          </label>
                        </div>
                        <div className="text-[10px] text-[#5f6368] mt-0.5">
                          Site: {reais(l.preco)}
                          {especial ? <span className="text-[#b45309] font-semibold"> · preço especial</span> : null}
                        </div>
                      </div>
                      <button
                        onClick={() => setLinhas((a) => a.filter((x) => x.id !== l.id))}
                        className="text-[#5f6368] hover:text-red-600 text-xs cursor-pointer"
                        aria-label={`Tirar ${l.nome}`}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {linhas.length > 0 && (
              <div className="text-right text-xs">
                Total à vista: <b className="text-[#0a6e3d]">{reais(total)}</b>
              </div>
            )}
          </div>

          {previa && (
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-[#202124] mb-1">Prévia (como o cliente vai ver)</div>
              <iframe title="Prévia do e-mail" srcDoc={previa} sandbox="" className="w-full h-96 border border-[#e3e3e3] rounded-lg bg-white" />
            </div>
          )}
        </div>

        <div className="border-t border-[#e3e3e3] px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
          <p className="text-[11px] text-[#5f6368]">
            Sai pelo Gmail da loja (balaocastelo@gmail.com). A resposta do cliente chega lá, e a loja recebe uma cópia.
          </p>
          {erro && <p className="w-full text-xs text-red-600 font-semibold">⛔ {erro}</p>}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => chamar(true)}
              disabled={ocupado !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#e3e3e3] bg-white hover:bg-[#f0f2f5] disabled:opacity-60 cursor-pointer"
            >
              {ocupado === "previa" ? "Montando…" : "👁 Ver prévia"}
            </button>
            <button
              onClick={() => chamar(false)}
              disabled={ocupado !== null || !validarEmail(para)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f9d58] hover:bg-[#0a6e3d] text-white disabled:opacity-60 cursor-pointer"
            >
              {ocupado === "enviar" ? "Enviando…" : "📧 Enviar e-mail"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

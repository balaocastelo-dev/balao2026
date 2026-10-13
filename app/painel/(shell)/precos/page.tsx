"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ExternalLink, Image as Imagem, Layers, Loader2, Percent, Plus, RefreshCw, Trash2 } from "lucide-react";
import { descreverRegra, type RegraDeMargem } from "@/lib/precos/margem";
import MargemPorCategoria from "@/components/painel/MargemPorCategoria";
import RegraEscalonada from "@/components/painel/RegraEscalonada";
import FavoritoDoBalao from "@/components/painel/FavoritoDoBalao";
import ProdutosBloqueados from "@/components/painel/ProdutosBloqueados";

/** Catálogo da Kyte (fornecedor local): <loja>.kyte.site ou <loja>.catalog.kyte.site. */
const LINK_KYTE = /^(?:https?:\/\/)?([a-z0-9-]{2,63}\.(?:catalog\.)?kyte\.site)(?:\/|$)/i;
/** Catálogo da TOB Distribuição (representante): o servidor lê sozinho. */
const LINK_TOB = /^(?:https?:\/\/)?catalogotob\.tobdistribuicao\.com\.br\/c\/([a-z0-9_-]{2,60})/i;
/** Fontes que chegam por importação do navegador (Kyte); as outras o servidor lê. */
const SITES_POR_IMPORTACAO = ["techsupri", "kyte"];

interface Fonte {
  id: string;
  nome: string;
  url: string;
  caminho: string;
  so_loja: boolean;
  margem: number;
  ativa: boolean;
  intervalo_min: number;
  preco_min: number | null;
  preco_max: number | null;
  passo_pagina: number;
  passo_total_pag: number | null;
  ultima_coleta_em: string | null;
  ultimo_status: string | null;
  ultimo_erro: string | null;
  ultimo_removidos: number | null;
  produtos?: number;
  retidos?: number;
  site?: string;
  regra_margem?: RegraDeMargem | null;
  pronta_entrega?: boolean;
  margens_categoria?: Record<string, number> | null;
  marca_dagua?: boolean | null;
  fornecedor?: string | null;
}

interface Situacao {
  produtos: number;
  comFonte: number;
  semFonte: number;
  reserva: number | null;
}

interface Carga {
  coletadoEm: string;
  fontes: { nome: string; itens: number; margem: number; so_loja: boolean }[];
}

interface Previa {
  trilha: string;
  anunciado: number | null;
  totalDePaginas: number;
  vendedores: string[];
  amostra: { nome: string; vendedor: string | null; origemPix: number; origemCartao: number; vendaPix: number; vendaCartao: number; oferta: string | null }[];
}

interface Retido {
  id: string;
  nome: string;
  fonte_id: string;
  origem_pix: number;
  retido_pix: number;
  retido_desde: string;
  source_url: string | null;
}

const reais = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function haQuanto(iso: string | null) {
  if (!iso) return "nunca";
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  return h < 48 ? `há ${h} h` : `há ${Math.round(h / 24)} dias`;
}

interface Passo {
  estado: string;
  pagina: number;
  totalDePaginas: number | null;
  novos: number;
  retidos: number;
  removidos: number;
  mensagem: string | null;
}

async function chamar<T = unknown>(url: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { "content-type": "application/json", ...(opcoes?.headers || {}) },
    cache: "no-store",
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok || dados?.ok === false) {
    throw new Error(dados?.erro || dados?.error || `O servidor respondeu ${resposta.status}`);
  }
  return dados as T;
}

const ROTULO_DO_STATUS: Record<string, { texto: string; classe: string }> = {
  ok: { texto: "Em dia", classe: "bg-green-50 text-green-800 border-green-200" },
  suspeita: { texto: "Leitura incompleta", classe: "bg-amber-50 text-amber-800 border-amber-200" },
  bloqueado: { texto: "Bloqueada pela fonte", classe: "bg-red-50 text-red-800 border-red-200" },
  erro: { texto: "Falhou", classe: "bg-red-50 text-red-800 border-red-200" },
};

export default function PrecosPage() {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [carga, setCarga] = useState<Carga | null>(null);
  const [retidos, setRetidos] = useState<Retido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const [margens, setMargens] = useState<Record<string, string>>({});
  const [ocupada, setOcupada] = useState<Record<string, string>>({});
  const [removendo, setRemovendo] = useState<string | null>(null);

  const [novoLink, setNovoLink] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaMargem, setNovaMargem] = useState("33");
  const [novoSoLoja, setNovoSoLoja] = useState(true);
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [testando, setTestando] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);

  const [categoriasAbertas, setCategoriasAbertas] = useState<Record<string, boolean>>({});
  const [novoProntaEntrega, setNovoProntaEntrega] = useState(true);
  const [cadastradoKyte, setCadastradoKyte] = useState<Fonte | null>(null);
  const representanteTob = novoLink.trim().match(LINK_TOB)?.[1]?.toLowerCase() || null;
  const hostKyte = novoLink.trim().match(LINK_KYTE)?.[1]?.toLowerCase() || (representanteTob ? "catalogotob.tobdistribuicao.com.br" : null);

  const [palavra, setPalavra] = useState("");
  const [trocando, setTrocando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [lista, troca, seguros] = await Promise.all([
        chamar<{ fontes: Fonte[]; troca: Situacao }>("/api/precos/fontes"),
        chamar<{ situacao: Situacao; carga: Carga }>("/api/precos/troca"),
        chamar<{ retidos: Retido[] }>("/api/precos/retidos"),
      ]);
      setFontes(lista.fontes);
      setSituacao(troca.situacao);
      setCarga(troca.carga);
      setRetidos(seguros.retidos);
      setMargens(Object.fromEntries(lista.fontes.map((f) => [f.id, String(f.margem)])));
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const marcar = (id: string, texto: string | null) =>
    setOcupada((atual) => {
      const copia = { ...atual };
      if (texto) copia[id] = texto;
      else delete copia[id];
      return copia;
    });

  async function salvarMargem(fonte: Fonte) {
    const valor = Number(String(margens[fonte.id] ?? "").replace(",", "."));
    if (!Number.isFinite(valor) || valor < 0 || valor > 500) {
      setAviso({ tipo: "erro", texto: "A margem precisa ser um número entre 0 e 500." });
      return;
    }
    marcar(fonte.id, "Recalculando preços…");
    try {
      const r = await chamar<{ reprecificados: number }>(`/api/precos/fontes/${fonte.id}`, {
        method: "PATCH",
        body: JSON.stringify({ margem: valor }),
      });
      setAviso({ tipo: "ok", texto: `${fonte.nome}: margem em ${valor}%. ${r.reprecificados} produtos com preço novo no site e no CRM.` });
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      marcar(fonte.id, null);
    }
  }

  async function alterar(fonte: Fonte, mudanca: Record<string, unknown>, texto: string) {
    marcar(fonte.id, "Salvando…");
    try {
      await chamar(`/api/precos/fontes/${fonte.id}`, { method: "PATCH", body: JSON.stringify(mudanca) });
      setAviso({ tipo: "ok", texto });
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      marcar(fonte.id, null);
    }
  }

  async function alterarMargem(fonte: Fonte, mudanca: Record<string, unknown>, texto: string) {
    marcar(fonte.id, "Recalculando preços…");
    try {
      const r = await chamar<{ reprecificados: number }>(`/api/precos/fontes/${fonte.id}`, { method: "PATCH", body: JSON.stringify(mudanca) });
      setAviso({ tipo: "ok", texto: `${fonte.nome}: ${texto} ${r.reprecificados} produtos com preço novo.` });
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      marcar(fonte.id, null);
    }
  }

  async function lerAgora(fonte: Fonte) {
    marcar(fonte.id, "Lendo a fonte…");
    try {
      // Cada chamada lê algumas páginas; repete até a passada terminar.
      for (let volta = 0; volta < 40; volta++) {
        const { passo } = await chamar<{ passo: Passo }>(`/api/precos/fontes/${fonte.id}/ler`, { method: "POST" });
        if (passo.estado === "em_andamento") {
          marcar(fonte.id, `Lendo página ${passo.pagina}${passo.totalDePaginas ? ` de ${passo.totalDePaginas}` : ""}…`);
          continue;
        }
        if (passo.estado === "concluida") {
          setAviso({ tipo: "ok", texto: `${fonte.nome}: leitura concluída. ${passo.novos} novos, ${passo.removidos} saíram, ${passo.retidos} com queda retida.` });
        } else {
          setAviso({ tipo: "erro", texto: `${fonte.nome}: ${passo.mensagem || passo.estado}` });
        }
        break;
      }
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      marcar(fonte.id, null);
    }
  }

  async function remover(fonte: Fonte) {
    marcar(fonte.id, "Removendo…");
    try {
      const r = await chamar<{ produtosRemovidos: number }>(`/api/precos/fontes/${fonte.id}`, { method: "DELETE" });
      setAviso({ tipo: "ok", texto: `${fonte.nome} removida, com ${r.produtosRemovidos} produtos.` });
      setRemovendo(null);
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      marcar(fonte.id, null);
    }
  }

  async function testar() {
    setTestando(true);
    setPrevia(null);
    try {
      const r = await chamar<Previa>("/api/precos/testar", {
        method: "POST",
        body: JSON.stringify({ url: novoLink, so_loja: novoSoLoja, margem: Number(novaMargem.replace(",", ".")) }),
      });
      setPrevia(r);
      if (!novoNome.trim()) setNovoNome(r.trilha.split("/").pop() || "");
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setTestando(false);
    }
  }

  async function cadastrar() {
    setCadastrando(true);
    try {
      const r = await chamar<{ fonte: Fonte }>("/api/precos/fontes", {
        method: "POST",
        body: JSON.stringify({ url: novoLink, nome: novoNome, so_loja: novoSoLoja, margem: Number(novaMargem.replace(",", ".")) }),
      });
      setAviso({ tipo: "ok", texto: `${r.fonte.nome} cadastrada. Lendo os produtos agora…` });
      setNovoLink("");
      setNovoNome("");
      setPrevia(null);
      await carregar();
      await lerAgora(r.fonte);
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setCadastrando(false);
    }
  }

  async function cadastrarFornecedor() {
    setCadastrando(true);
    try {
      const r = await chamar<{ fonte: Fonte }>("/api/precos/fornecedores", {
        method: "POST",
        body: JSON.stringify({ url: novoLink, nome: novoNome, margem: Number(novaMargem.replace(",", ".")), pronta_entrega: novoProntaEntrega }),
      });
      setNovoLink("");
      setNovoNome("");
      if (r.fonte.site && !SITES_POR_IMPORTACAO.includes(r.fonte.site)) {
        // TOB: o servidor lê o catálogo sozinho; já traz os produtos.
        setAviso({ tipo: "ok", texto: `${r.fonte.nome} cadastrado com ${r.fonte.margem}% de margem. Lendo os produtos agora…` });
        await carregar();
        await lerAgora(r.fonte);
        return;
      }
      setAviso({ tipo: "ok", texto: `${r.fonte.nome} cadastrado com ${r.fonte.margem}% de margem. Agora traga os produtos: abra o catálogo e clique no favorito "Enviar ao Balão".` });
      setCadastradoKyte(r.fonte);
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setCadastrando(false);
    }
  }

  async function trocar() {
    setTrocando(true);
    try {
      const r = await chamar<{ produtos: number; antes: number; fontes: number }>("/api/precos/troca", {
        method: "POST",
        body: JSON.stringify({ confirmar: "TROCAR" }),
      });
      setAviso({ tipo: "ok", texto: `Catálogo trocado: saíram ${r.antes} produtos antigos, entraram ${r.produtos} em ${r.fontes} fontes.` });
      setPalavra("");
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setTrocando(false);
    }
  }

  async function aceitarQuedas(fonteId: string, ids?: string[]) {
    try {
      const r = await chamar<{ aceitos: number }>("/api/precos/retidos", {
        method: "POST",
        body: JSON.stringify({ fonte_id: fonteId, ids }),
      });
      setAviso({ tipo: "ok", texto: `${r.aceitos} preço(s) novo(s) aceito(s).` });
      await carregar();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: (erro as Error).message });
    }
  }

  const trocaPendente = !!situacao && situacao.comFonte === 0;
  const nomeDaFonte = (id: string) => fontes.find((f) => f.id === id)?.nome || "—";

  return (
    <div className="animate-in fade-in duration-300 space-y-8 text-gray-800">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Percent className="text-[#E60012]" />
          Preços por Fonte
        </h2>
        <p className="mt-1 text-sm text-gray-600 max-w-3xl">
          Cada fonte é uma categoria de outro site. O preço do Balão é o preço de lá mais a margem que você define aqui, à
          vista e no cartão. Mudou a margem, o site e o CRM mudam na hora.
        </p>
      </div>

      {aviso && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${aviso.tipo === "ok" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}
        >
          {aviso.tipo === "ok" ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} className="text-xs font-semibold underline">
            Fechar
          </button>
        </div>
      )}

      {carregando && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Carregando…
        </p>
      )}

      {trocaPendente && carga && (
        <section className="rounded-lg border-2 border-[#E60012] bg-red-50/40 p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Trocar o catálogo antigo pelo das fontes</h3>
            <p className="mt-1 text-sm text-gray-700 max-w-3xl">
              Hoje o site tem {situacao!.produtos.toLocaleString("pt-BR")} produtos do catálogo antigo. A troca apaga todos e grava,
              no mesmo passo, {carga.fontes.reduce((s, f) => s + f.itens, 0).toLocaleString("pt-BR")} produtos lidos na KaBuM!{" "}
              {haQuanto(carga.coletadoEm)}. Uma cópia do catálogo antigo fica guardada no banco, e a loja não fica vazia em nenhum momento.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[420px] text-sm text-gray-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-1 pr-6">Fonte</th>
                  <th className="py-1 pr-6">Filtro</th>
                  <th className="py-1 pr-6 text-right">Entram</th>
                  <th className="py-1 text-right">Margem</th>
                </tr>
              </thead>
              <tbody>
                {carga.fontes.map((f) => (
                  <tr key={f.nome} className="border-t border-red-100">
                    <td className="py-1 pr-6 font-medium text-gray-800">{f.nome}</td>
                    <td className="py-1 pr-6 text-gray-600">{f.so_loja ? "Só KaBuM!" : "Todos os vendedores"}</td>
                    <td className="py-1 pr-6 text-right tabular-nums">{f.itens.toLocaleString("pt-BR")}</td>
                    <td className="py-1 text-right tabular-nums">{f.margem}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-gray-700">
              <span className="block mb-1">
                Para confirmar, digite <strong>TROCAR</strong>
              </span>
              <input
                id="troca-palavra"
                value={palavra}
                onChange={(e) => setPalavra(e.target.value)}
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase text-gray-900"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              onClick={trocar}
              disabled={palavra.trim().toUpperCase() !== "TROCAR" || trocando}
              className="inline-flex items-center gap-2 rounded-md bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {trocando && <Loader2 size={16} className="animate-spin" />}
              {trocando ? "Trocando…" : "Trocar o catálogo"}
            </button>
          </div>
        </section>
      )}

      {!trocaPendente && situacao && (
        <p className="text-sm text-gray-600">
          {situacao.comFonte.toLocaleString("pt-BR")} produtos no site vêm das fontes abaixo
          {situacao.semFonte > 0 ? ` e ${situacao.semFonte.toLocaleString("pt-BR")} foram cadastrados à mão` : ""}.
          {situacao.reserva != null ? ` A cópia do catálogo antigo (${situacao.reserva.toLocaleString("pt-BR")} produtos) segue guardada no banco.` : ""}
        </p>
      )}

      {fontes.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Fontes</h3>
          <div className="space-y-3">
            {fontes.map((f) => {
              const status = f.passo_pagina > 0
                ? { texto: `Lendo (página ${f.passo_pagina}${f.passo_total_pag ? ` de ${f.passo_total_pag}` : ""})`, classe: "bg-blue-50 text-blue-800 border-blue-200" }
                : ROTULO_DO_STATUS[f.ultimo_status || ""] || { texto: "Aguardando a primeira leitura", classe: "bg-gray-50 text-gray-700 border-gray-200" };
              const mexeu = String(f.margem) !== String(margens[f.id] ?? "").replace(",", ".");
              const porImportacao = !!f.site && SITES_POR_IMPORTACAO.includes(f.site);
              return (
                <article key={f.id} className={`rounded-lg border p-4 ${f.ativa ? "border-gray-200" : "border-dashed border-gray-300 bg-gray-50"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900">{f.nome}</h4>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${status.classe}`}>{status.texto}</span>
                        {!f.ativa && <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-600">Pausada</span>}
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-xs text-gray-500 hover:text-[#E60012]">
                        {f.url.replace("https://", "")} <ExternalLink size={12} />
                      </a>
                      <p className="mt-2 text-sm text-gray-600">
                        {(f.produtos ?? 0).toLocaleString("pt-BR")} produtos · lida {haQuanto(f.ultima_coleta_em)} · relê a cada {f.intervalo_min} min
                        {f.preco_max != null ? ` · só até ${reais(f.preco_max)} na fonte` : ""}
                        {f.retidos ? ` · ${f.retidos} com queda retida` : ""}
                      </p>
                      {f.pronta_entrega && (
                        <p className="mt-1 text-xs font-semibold text-emerald-700">Produtos com a faixa PRONTA ENTREGA na foto.</p>
                      )}
                      {porImportacao && (
                        <p className="mt-1 max-w-2xl text-xs text-gray-600">
                          Este fornecedor bloqueia leitura automática por servidor. Os preços são atualizados por importação, feita pelo
                          navegador da loja: abra o catálogo e clique no favorito &quot;Enviar ao Balão&quot;.
                        </p>
                      )}
                      {porImportacao && (
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <Imagem size={13} />
                          {f.marca_dagua === true
                            ? "Fotos do fornecedor têm a marca dele: o site usa fotos achadas na internet."
                            : f.marca_dagua === false
                              ? "Fotos do fornecedor são limpas: o site usa as fotos dele."
                              : "Fotos: conferidas na primeira importação (se têm marca d'água ou não)."}
                          {f.marca_dagua != null && (
                            <button
                              type="button"
                              disabled={!!ocupada[f.id]}
                              onClick={() =>
                                alterar(
                                  f,
                                  { marca_dagua: !f.marca_dagua },
                                  f.marca_dagua
                                    ? `${f.nome}: as fotos do fornecedor passam a ser usadas nos produtos novos.`
                                    : `${f.nome}: as fotos do fornecedor não serão mais usadas nos produtos novos.`
                                )
                              }
                              className="font-semibold text-gray-700 underline"
                            >
                              {f.marca_dagua ? "Usar as fotos dele" : "Não usar as fotos dele"}
                            </button>
                          )}
                        </p>
                      )}
                      {f.ultimo_erro && <p className="mt-1 text-xs text-red-700">{f.ultimo_erro}</p>}
                    </div>

                    {f.regra_margem ? (
                      <div className="max-w-xs space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                        <span className="block font-semibold text-gray-600">Margem escalonada</span>
                        <span className="block">{descreverRegra(f.regra_margem)}</span>
                        <RegraEscalonada margem={f.margem} regra={f.regra_margem} ocupada={!!ocupada[f.id]} onSalvar={(m, t) => alterarMargem(f, m, t)} />
                      </div>
                    ) : (
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-xs font-semibold text-gray-600">
                        <span className="block mb-1">Margem (%)</span>
                        <span className="flex gap-2">
                          <input
                            id={`margem-${f.id}`}
                            inputMode="decimal"
                            value={margens[f.id] ?? ""}
                            onChange={(e) => setMargens((m) => ({ ...m, [f.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && salvarMargem(f)}
                            className="w-20 rounded-md border border-gray-300 bg-white px-2 py-2 text-right text-sm font-bold tabular-nums text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => salvarMargem(f)}
                            disabled={!mexeu || !!ocupada[f.id]}
                            className="rounded-md bg-[#E60012] px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Aplicar
                          </button>
                        </span>
                      </label>
                      {porImportacao && (
                        <RegraEscalonada margem={f.margem} regra={null} ocupada={!!ocupada[f.id]} onSalvar={(m, t) => alterarMargem(f, m, t)} />
                      )}
                    </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                    {!porImportacao && (<>
                    <label className="inline-flex items-center gap-2 text-gray-700">
                      <input
                        id={`so-loja-${f.id}`}
                        type="checkbox"
                        checked={f.so_loja}
                        disabled={!!ocupada[f.id]}
                        onChange={(e) =>
                          alterar(f, { so_loja: e.target.checked }, `${f.nome}: ${e.target.checked ? "só produtos vendidos e entregues pela KaBuM!" : "todos os vendedores"}. Vale a partir da próxima leitura.`)
                        }
                      />
                      Só vendido e entregue pela KaBuM!
                    </label>
                    <label className="inline-flex items-center gap-2 text-gray-700">
                      <input
                        id={`ativa-${f.id}`}
                        type="checkbox"
                        checked={f.ativa}
                        disabled={!!ocupada[f.id]}
                        onChange={(e) => alterar(f, { ativa: e.target.checked }, `${f.nome}: atualização ${e.target.checked ? "ligada" : "pausada"}.`)}
                      />
                      Atualizar sozinha
                    </label>
                    </>)}

                    <span className="ml-auto flex flex-wrap items-center gap-2">
                      {ocupada[f.id] && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Loader2 size={14} className="animate-spin" /> {ocupada[f.id]}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCategoriasAbertas((a) => ({ ...a, [f.id]: !a[f.id] }))}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Layers size={14} /> Margem por categoria
                        {f.margens_categoria && Object.keys(f.margens_categoria).length > 0 ? ` (${Object.keys(f.margens_categoria).length})` : ""}
                      </button>
                      {porImportacao && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <ExternalLink size={14} /> Abrir catálogo
                        </a>
                      )}
                      {!porImportacao && (
                      <button
                        type="button"
                        onClick={() => lerAgora(f)}
                        disabled={!!ocupada[f.id]}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <RefreshCw size={14} /> Ler agora
                      </button>
                      )}
                      {removendo === f.id ? (
                        <>
                          <button type="button" onClick={() => remover(f)} className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-bold text-white">
                            Remover fonte e {(f.produtos ?? 0).toLocaleString("pt-BR")} produtos
                          </button>
                          <button type="button" onClick={() => setRemovendo(null)} className="text-sm text-gray-600 underline">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRemovendo(f.id)}
                          disabled={!!ocupada[f.id]}
                          aria-label={`Remover ${f.nome}`}
                          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:border-red-300 hover:text-red-700 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                  </div>
                  {categoriasAbertas[f.id] && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <MargemPorCategoria
                        fonteId={f.id}
                        margensAtuais={f.margens_categoria}
                        onSalvo={(texto) => {
                          setAviso({ tipo: "ok", texto: `${f.nome}: ${texto}` });
                          carregar();
                        }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <ProdutosBloqueados />

      {retidos.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="text-sm font-bold text-gray-900">Quedas de preço seguradas ({retidos.length})</h3>
          <p className="mt-1 text-sm text-gray-700 max-w-3xl">
            A fonte baixou estes produtos em mais da metade de uma leitura para a outra. O site segue com o preço anterior até você
            aceitar, ou até a queda se confirmar por 24 horas.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm text-gray-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-1 pr-4">Produto</th>
                  <th className="py-1 pr-4">Fonte</th>
                  <th className="py-1 pr-4 text-right">Era</th>
                  <th className="py-1 pr-4 text-right">Agora</th>
                  <th className="py-1" />
                </tr>
              </thead>
              <tbody>
                {retidos.map((r) => (
                  <tr key={r.id} className="border-t border-amber-100">
                    <td className="py-1.5 pr-4">
                      {r.source_url ? (
                        <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {r.nome}
                        </a>
                      ) : (
                        r.nome
                      )}
                    </td>
                    <td className="py-1.5 pr-4 text-gray-600">{nomeDaFonte(r.fonte_id)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{reais(r.origem_pix)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums font-semibold">{reais(r.retido_pix)}</td>
                    <td className="py-1.5 text-right">
                      <button type="button" onClick={() => aceitarQuedas(r.fonte_id, [r.id])} className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-gray-50">
                        Aceitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-gray-200 p-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <Plus size={18} className="text-[#E60012]" /> Nova fonte
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Cole o link de uma categoria da KaBuM!, do catálogo de um fornecedor na Kyte (ex.: robsonatacado.catalog.kyte.site) ou do
          catálogo da TOB Distribuição. O
          painel reconhece o fornecedor pelo link.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_200px_110px]">
          <label className="text-xs font-semibold text-gray-600">
            <span className="block mb-1">{hostKyte ? "Link do catálogo do fornecedor" : "Link da categoria"}</span>
            <input
              id="nova-fonte-link"
              value={novoLink}
              onChange={(e) => {
                setNovoLink(e.target.value);
                setPrevia(null);
              }}
              placeholder="https://www.kabum.com.br/perifericos/teclado-gamer"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900"
            />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            <span className="block mb-1">Nome no painel</span>
            <input id="nova-fonte-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder={hostKyte ? "Nome do fornecedor" : "Teclados"} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900" />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            <span className="block mb-1">Margem (%)</span>
            <input id="nova-fonte-margem" inputMode="decimal" value={novaMargem} onChange={(e) => setNovaMargem(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-right text-sm font-bold tabular-nums text-gray-900" />
          </label>
        </div>

        {hostKyte ? (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {representanteTob ? `Fornecedor TOB Distribuição · representante ${representanteTob}` : `Fornecedor na Kyte · ${hostKyte}`}
              </span>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input id="nova-fonte-pronta" type="checkbox" checked={novoProntaEntrega} onChange={(e) => setNovoProntaEntrega(e.target.checked)} />
                Fornecedor local: faixa PRONTA ENTREGA nas fotos
              </label>
              <button
                type="button"
                onClick={cadastrarFornecedor}
                disabled={cadastrando}
                className="ml-auto inline-flex items-center gap-2 rounded-md bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {cadastrando && <Loader2 size={14} className="animate-spin" />} Cadastrar fornecedor
              </button>
            </div>
            {representanteTob ? (
              <p className="text-xs text-gray-600">
                O site lê o catálogo da TOB sozinho, uma vez por dia (e quando você clicar em &quot;Ler agora&quot;). Ao cadastrar, os
                produtos já entram. Depois ajuste a margem de cada categoria em &quot;Margem por categoria&quot;.
              </p>
            ) : (
            <p className="text-xs text-gray-600">
              A Kyte não deixa servidor ler o catálogo. Depois de cadastrar, abra o catálogo no Chrome e clique no favorito &quot;Enviar
              ao Balão&quot;: os produtos chegam aqui para você confirmar. As fotos são conferidas sozinhas (com marca d&apos;água do
              fornecedor, o site busca outra na internet).
            </p>
            )}
          </div>
        ) : (
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              id="nova-fonte-so-loja"
              type="checkbox"
              checked={novoSoLoja}
              onChange={(e) => {
                setNovoSoLoja(e.target.checked);
                setPrevia(null);
              }}
            />
            Só vendido e entregue pela KaBuM!
          </label>
          <span className="ml-auto flex gap-2">
            <button type="button" onClick={testar} disabled={!novoLink.trim() || testando} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
              {testando && <Loader2 size={14} className="animate-spin" />} Testar link
            </button>
            <button type="button" onClick={cadastrar} disabled={!novoLink.trim() || cadastrando} className="inline-flex items-center gap-2 rounded-md bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40">
              {cadastrando && <Loader2 size={14} className="animate-spin" />} Cadastrar e ler
            </button>
          </span>
        </div>
        )}

        {cadastradoKyte && (
          <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
            {cadastradoKyte.nome} cadastrado.{" "}
            <a href={cadastradoKyte.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Abrir o catálogo dele
            </a>{" "}
            e clicar no favorito &quot;Enviar ao Balão&quot;.
          </p>
        )}

        <div className="mt-4">
          <FavoritoDoBalao />
        </div>

        {previa && (
          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-700">
              <strong>{previa.trilha || "Categoria"}</strong>: {previa.anunciado?.toLocaleString("pt-BR") ?? "?"} produtos anunciados em{" "}
              {previa.totalDePaginas} página(s). Vendedores na primeira página: {previa.vendedores.join(", ")}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm text-gray-800">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-1 pr-4">Produto</th>
                    <th className="py-1 pr-4 text-right">KaBuM! à vista</th>
                    <th className="py-1 pr-4 text-right">KaBuM! cartão</th>
                    <th className="py-1 pr-4 text-right">Seu à vista</th>
                    <th className="py-1 text-right">Seu cartão</th>
                  </tr>
                </thead>
                <tbody>
                  {previa.amostra.map((a, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-1.5 pr-4">
                        {a.nome}
                        {a.oferta && <span className="ml-2 rounded border border-amber-300 px-1 text-[10px] font-bold uppercase text-amber-700">oferta</span>}
                      </td>
                      <td className="py-1.5 pr-4 text-right tabular-nums">{reais(a.origemPix)}</td>
                      <td className="py-1.5 pr-4 text-right tabular-nums">{reais(a.origemCartao)}</td>
                      <td className="py-1.5 pr-4 text-right tabular-nums font-bold">{reais(a.vendaPix)}</td>
                      <td className="py-1.5 text-right tabular-nums font-bold">{reais(a.vendaCartao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

// Recebe o catálogo que o navegador leu na página do fornecedor (Kyte) e,
// com a confirmação do Thiago, importa para o site. Ver
// public/captura-fornecedor.js e app/api/captura-fornecedor/route.ts.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Loader2, PackageCheck } from "lucide-react";

interface ProdutoRecebido {
  id: string;
  name: string;
  salePrice: number | null;
  salePromotionalPrice: number | null;
  category?: { name?: string | null };
  active?: boolean;
  image?: string | null;
}

interface Captura {
  host: string;
  loja: string;
  capturadoEm: string;
  produtos: ProdutoRecebido[];
}

interface FonteResumo {
  id: string;
  nome: string;
  margem: number;
  regra_margem?: unknown;
  marca_dagua?: boolean | null;
  pronta_entrega?: boolean;
}

interface Resultado {
  recebidos: number;
  gravados: number;
  novos: number;
  retidos: number;
  recusados: number;
  removidos: number;
  suspeita: boolean;
  concluida: boolean;
  fotosAchadas: number;
  bloqueados?: number;
  inicio: string;
}

const LOTE = 200;
const reais = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

async function chamar<T>(url: string, opcoes?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...opcoes, headers: { "content-type": "application/json" }, cache: "no-store" });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok || dados?.ok === false) throw new Error(dados?.erro || dados?.error || `O servidor respondeu ${r.status}`);
  return dados as T;
}

export default function ReceberCatalogoPage() {
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [fonte, setFonte] = useState<FonteResumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [margem, setMargem] = useState("66");
  const [prontaEntrega, setProntaEntrega] = useState(true);
  const [andamento, setAndamento] = useState<string | null>(null);
  const [total, setTotal] = useState<Omit<Resultado, "inicio" | "concluida" | "suspeita"> & { suspeita: boolean } | null>(null);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const bruto = sessionStorage.getItem("balao-captura");
        if (!bruto) {
          setErro("Nenhum catálogo esperando aqui. Abra o catálogo do fornecedor e clique no favorito \"Enviar ao Balão\".");
          return;
        }
        const c = JSON.parse(bruto) as Captura;
        setCaptura(c);
        setNome(c.loja || "");
        const r = await chamar<{ fonte: FonteResumo | null; margemPadrao: number }>(`/api/precos/fornecedores?host=${encodeURIComponent(c.host)}`);
        setFonte(r.fonte);
        if (r.margemPadrao) setMargem(String(r.margemPadrao));
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const resumo = useMemo(() => {
    if (!captura) return null;
    const ativos = captura.produtos.filter((p) => p.active !== false && Number(p.salePromotionalPrice || p.salePrice) > 0);
    const categorias = new Set(captura.produtos.map((p) => p.category?.name || "").filter(Boolean));
    const comFoto = captura.produtos.filter((p) => p.image).length;
    return { ativos: ativos.length, categorias: categorias.size, comFoto, amostra: ativos.slice(0, 8) };
  }, [captura]);

  async function importar() {
    if (!captura) return;
    setErro(null);
    try {
      let alvo = fonte;
      if (!alvo) {
        setAndamento("Cadastrando o fornecedor…");
        const valor = Number(margem.replace(",", "."));
        const r = await chamar<{ fonte: FonteResumo }>("/api/precos/fornecedores", {
          method: "POST",
          body: JSON.stringify({ url: `https://${captura.host}/`, nome, margem: valor, pronta_entrega: prontaEntrega }),
        });
        alvo = r.fonte;
        setFonte(alvo);
      }
      let inicio: string | null = null;
      const soma = { recebidos: 0, gravados: 0, novos: 0, retidos: 0, recusados: 0, removidos: 0, fotosAchadas: 0, bloqueados: 0, suspeita: false };
      const lotes = Math.ceil(captura.produtos.length / LOTE);
      for (let i = 0; i < lotes; i++) {
        setAndamento(`Importando: lote ${i + 1} de ${lotes}…`);
        const lote = captura.produtos.slice(i * LOTE, (i + 1) * LOTE);
        let resposta: { resultado: Resultado; fonte: FonteResumo } | null = null;
        for (let tentativa = 0; tentativa < 2 && !resposta; tentativa++) {
          try {
            resposta = await chamar<{ resultado: Resultado; fonte: FonteResumo }>("/api/precos/importar", {
              method: "POST",
              body: JSON.stringify({ fonte_id: alvo.id, produtos: lote, inicio, final: i === lotes - 1 }),
            });
          } catch (e) {
            if (tentativa === 1) throw new Error(`O lote ${i + 1} falhou duas vezes (${(e as Error).message}). Parei sem fechar a passada: nada foi removido do site.`);
          }
        }
        const r: Resultado = resposta!.resultado;
        inicio = r.inicio;
        setFonte(resposta!.fonte);
        for (const k of ["recebidos", "gravados", "novos", "retidos", "recusados", "removidos", "fotosAchadas", "bloqueados"] as const) soma[k] += r[k] || 0;
        soma.suspeita = soma.suspeita || r.suspeita;
      }
      setTotal(soma);
      setFim(true);
      setAndamento(null);
      sessionStorage.removeItem("balao-captura");
    } catch (e) {
      setErro((e as Error).message);
      setAndamento(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-6 text-gray-800">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <PackageCheck className="text-[#E60012]" /> Receber catálogo de fornecedor
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          O catálogo foi lido no seu navegador, na página do fornecedor. Confira e importe: o preço do site é o do fornecedor mais a
          margem, e produto que saiu do fornecedor sai do site.
        </p>
      </div>

      {carregando && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Carregando…
        </p>
      )}

      {erro && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" /> <span>{erro}</span>
        </div>
      )}

      {captura && resumo && !fim && (
        <section className="space-y-4 rounded-lg border border-gray-200 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">{captura.loja || captura.host}</h3>
            <p className="text-xs text-gray-500">{captura.host}</p>
            <p className="mt-2 text-sm text-gray-700">
              <strong>{captura.produtos.length.toLocaleString("pt-BR")}</strong> produtos lidos, {resumo.ativos.toLocaleString("pt-BR")} à venda, em{" "}
              {resumo.categorias} categorias do fornecedor. {resumo.comFoto.toLocaleString("pt-BR")} com foto.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-1 pr-4">Produto (amostra)</th>
                  <th className="py-1 pr-4">Categoria no fornecedor</th>
                  <th className="py-1 text-right">Preço dele</th>
                </tr>
              </thead>
              <tbody>
                {resumo.amostra.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="py-1.5 pr-4">{p.name}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{p.category?.name || "—"}</td>
                    <td className="py-1.5 text-right tabular-nums">{reais(Number(p.salePromotionalPrice || p.salePrice))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fonte ? (
            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              Fornecedor já cadastrado como <strong>{fonte.nome}</strong>. A margem gravada no painel continua valendo; esta importação
              só atualiza preços de origem, produtos novos e os que saíram.
            </p>
          ) : (
            <div className="grid gap-4 rounded-md bg-amber-50/60 p-4 md:grid-cols-[1fr_140px]">
              <p className="text-sm text-gray-800 md:col-span-2">
                <strong>Fornecedor novo.</strong> Ele entra com a margem abaixo para tudo; depois você ajusta por categoria em Preços por
                fonte.
              </p>
              <label className="text-xs font-semibold text-gray-600">
                <span className="mb-1 block">Nome do fornecedor</span>
                <input
                  id="receber-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                <span className="mb-1 block">Margem (%)</span>
                <input
                  id="receber-margem"
                  inputMode="decimal"
                  value={margem}
                  onChange={(e) => setMargem(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-right text-sm font-bold tabular-nums text-gray-900"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                <input id="receber-pronta" type="checkbox" checked={prontaEntrega} onChange={(e) => setProntaEntrega(e.target.checked)} />
                Fornecedor local: produtos com a faixa PRONTA ENTREGA
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="importar-captura"
              type="button"
              onClick={importar}
              disabled={!!andamento || (!fonte && !nome.trim())}
              className="inline-flex items-center gap-2 rounded-md bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
            >
              {andamento && <Loader2 size={16} className="animate-spin" />}
              {fonte ? `Importar ${captura.produtos.length.toLocaleString("pt-BR")} produtos` : "Cadastrar fornecedor e importar"}
            </button>
            {andamento && <span className="text-sm text-gray-600">{andamento}</span>}
          </div>
        </section>
      )}

      {fim && total && (
        <section id="resultado-captura" data-estado="fim" className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
          <p className="flex items-center gap-2 font-bold">
            <CheckCircle size={18} /> {fonte?.nome}: importação concluída.
          </p>
          <p>
            {total.gravados.toLocaleString("pt-BR")} produtos no site · {total.novos} novos · {total.removidos} saíram · {total.retidos} quedas
            de preço seguradas · {total.recusados} fora (indisponíveis ou sem preço)
            {total.bloqueados ? ` · ${total.bloqueados} bloqueados por você (não voltaram)` : ""}.
          </p>
          {fonte?.marca_dagua === false && <p>As fotos deste fornecedor não têm marca d&apos;água: o site usa as fotos dele.</p>}
          {fonte?.marca_dagua === true && (
            <p>As fotos deste fornecedor têm a marca dele: o site procura foto na internet ({total.fotosAchadas} achadas agora).</p>
          )}
          {total.suspeita && <p className="font-semibold text-amber-800">A leitura veio menor que a metade do que havia: nada foi removido.</p>}
          <p>
            <Link href="/painel/precos" className="font-semibold underline">
              Ver em Preços por fonte e ajustar a margem por categoria
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}

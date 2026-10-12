"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, ImagePlus, Laptop, Loader2, MessageCircle, Pencil, Plus, Star, Trash2, Users, X } from "lucide-react";
import { apagarAparelho, carregarPainel, marcarStatusDoLead, salvarAparelho, trocarSituacao, type SeminovoDoPainel } from "./acoes";
import {
  INTERESSES,
  STATUS_DO_LEAD,
  nomeDoAparelho,
  rotuloDoOrcamento,
  rotuloDoUso,
  type LeadSeminovo,
  type Situacao,
  type StatusDoLead,
} from "@/lib/seminovos/tipos";

const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fone = (d: string) => d.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");

const SITUACOES: Record<Situacao, string> = { disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido" };

// ---------------------------------------------------------------- foto

/** Reduz a foto do celular (até 1600 px, JPEG) antes de mandar: sobe rápido e a página carrega rápido. */
async function reduzir(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const lado = 1600;
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Não consegui ler a foto"))), "image/jpeg", 0.85));
}

async function enviarFoto(arquivo: File): Promise<{ chave: string; url: string }> {
  const corpo = new FormData();
  corpo.append("foto", await reduzir(arquivo), "foto.jpg");
  const r = await fetch("/api/seminovos/foto", { method: "POST", body: corpo });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || "A foto não subiu");
  return j;
}

// ---------------------------------------------------------------- formulário

type Rascunho = {
  id?: string;
  marca: string;
  modelo: string;
  processador: string;
  memoria: string;
  armazenamento: string;
  tela: string;
  placaDeVideo: string;
  bateria: string;
  sistema: string;
  grau: "A" | "B";
  garantiaMeses: string;
  precoVista: string;
  precoCartao: string;
  parcelas: string;
  observacoes: string;
  destaque: boolean;
  situacao: Situacao;
  fotos: { chave: string; url: string }[];
};

const VAZIO: Rascunho = {
  marca: "",
  modelo: "",
  processador: "",
  memoria: "",
  armazenamento: "",
  tela: "",
  placaDeVideo: "",
  bateria: "",
  sistema: "Windows 11 Pro",
  grau: "A",
  garantiaMeses: "6",
  precoVista: "",
  precoCartao: "",
  parcelas: "",
  observacoes: "",
  destaque: false,
  situacao: "disponivel",
  fotos: [],
};

const deAparelho = (s: SeminovoDoPainel): Rascunho => ({
  id: s.id,
  marca: s.marca,
  modelo: s.modelo,
  processador: s.processador,
  memoria: s.memoria,
  armazenamento: s.armazenamento,
  tela: s.tela,
  placaDeVideo: s.placaDeVideo ?? "",
  bateria: s.bateria ?? "",
  sistema: s.sistema ?? "",
  grau: s.grau,
  garantiaMeses: String(s.garantiaMeses),
  precoVista: String(s.precoVista).replace(".", ","),
  precoCartao: s.precoCartao ? String(s.precoCartao).replace(".", ",") : "",
  parcelas: s.parcelas ? String(s.parcelas) : "",
  observacoes: s.observacoes ?? "",
  destaque: Boolean(s.destaque),
  situacao: s.situacao,
  fotos: s.fotos.map((chave, i) => ({ chave, url: s.urls[i] })),
});

const campo = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#E60012] focus:outline-none focus:ring-2 focus:ring-[#E60012]/20";

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-700">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-[11px] text-gray-500">{dica}</span>}
    </label>
  );
}

function Formulario({ inicial, aoFechar, aoSalvar }: { inicial: Rascunho; aoFechar: () => void; aoSalvar: () => void }) {
  const [r, setR] = useState<Rascunho>(inicial);
  const [subindo, setSubindo] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const mudar = <K extends keyof Rascunho>(k: K, v: Rascunho[K]) => setR((x) => ({ ...x, [k]: v }));

  async function adicionarFotos(lista: FileList | null) {
    if (!lista?.length) return;
    setErro("");
    const arquivos = Array.from(lista).slice(0, 8 - r.fotos.length);
    setSubindo((n) => n + arquivos.length);
    for (const a of arquivos) {
      try {
        const f = await enviarFoto(a);
        setR((x) => ({ ...x, fotos: [...x.fotos, f].slice(0, 8) }));
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setSubindo((n) => n - 1);
      }
    }
  }

  async function salvar() {
    setSalvando(true);
    setErro("");
    const res = await salvarAparelho({
      id: r.id,
      marca: r.marca,
      modelo: r.modelo,
      processador: r.processador,
      memoria: r.memoria,
      armazenamento: r.armazenamento,
      tela: r.tela,
      placaDeVideo: r.placaDeVideo,
      bateria: r.bateria,
      sistema: r.sistema,
      grau: r.grau,
      garantiaMeses: Number(r.garantiaMeses) || 6,
      precoVista: r.precoVista as unknown as number,
      precoCartao: r.precoCartao as unknown as number,
      parcelas: Number(r.parcelas) || undefined,
      observacoes: r.observacoes,
      destaque: r.destaque,
      situacao: r.situacao,
      fotos: r.fotos.map((f) => f.chave),
    });
    setSalvando(false);
    if (!res.ok) return setErro(res.erro);
    aoSalvar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-0 sm:p-6" onClick={aoFechar}>
      <div className="w-full max-w-3xl rounded-none bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">{r.id ? "Editar aparelho" : "Cadastrar aparelho"}</h3>
          <button type="button" onClick={aoFechar} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5">
          <span className="mb-1 block text-xs font-bold text-gray-700">Fotos (a primeira é a capa)</span>
          <p className="mb-2 text-[11px] text-gray-500">Foto do próprio aparelho, tirada na loja: tampa, aberto com a tela ligada, teclado e laterais. Até 8.</p>
          <div className="flex flex-wrap gap-2">
            {r.fotos.map((f, i) => (
              <div key={f.chave} className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="h-full w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-[#E60012] px-1.5 text-[10px] font-bold text-white">Capa</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => mudar("fotos", [f, ...r.fotos.filter((x) => x.chave !== f.chave)])}
                    className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[10px] font-bold text-gray-800"
                  >
                    Tornar capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => mudar("fotos", r.fotos.filter((x) => x.chave !== f.chave))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 hover:text-red-600"
                  aria-label="Tirar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {r.fotos.length < 8 && (
              <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-[#E60012] hover:text-[#E60012]">
                {subindo ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                {subindo ? `Subindo ${subindo}…` : "Adicionar fotos"}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => adicionarFotos(e.target.files).then(() => (e.target.value = ""))} />
              </label>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Marca">
            <input className={campo} list="marcas-seminovo" value={r.marca} onChange={(e) => mudar("marca", e.target.value)} placeholder="Lenovo" />
            <datalist id="marcas-seminovo">
              {["Lenovo", "Dell", "HP", "Apple", "Acer", "Asus", "Samsung", "Positivo"].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Campo>
          <Campo rotulo="Modelo">
            <input className={campo} value={r.modelo} onChange={(e) => mudar("modelo", e.target.value)} placeholder="ThinkPad T14 Gen 2" />
          </Campo>
          <Campo rotulo="Processador">
            <input className={campo} value={r.processador} onChange={(e) => mudar("processador", e.target.value)} placeholder="Intel Core i5-1145G7 (11ª geração)" />
          </Campo>
          <Campo rotulo="Memória">
            <input className={campo} value={r.memoria} onChange={(e) => mudar("memoria", e.target.value)} placeholder="16 GB DDR4" />
          </Campo>
          <Campo rotulo="Armazenamento">
            <input className={campo} value={r.armazenamento} onChange={(e) => mudar("armazenamento", e.target.value)} placeholder="SSD NVMe 512 GB" />
          </Campo>
          <Campo rotulo="Tela">
            <input className={campo} value={r.tela} onChange={(e) => mudar("tela", e.target.value)} placeholder='14" Full HD IPS' />
          </Campo>
          <Campo rotulo="Placa de vídeo (se tiver dedicada)">
            <input className={campo} value={r.placaDeVideo} onChange={(e) => mudar("placaDeVideo", e.target.value)} placeholder="NVIDIA MX450 2 GB" />
          </Campo>
          <Campo rotulo="Bateria" dica="Como foi medida: saúde (%) ou autonomia">
            <input className={campo} value={r.bateria} onChange={(e) => mudar("bateria", e.target.value)} placeholder="saúde 89%" />
          </Campo>
          <Campo rotulo="Sistema">
            <input className={campo} value={r.sistema} onChange={(e) => mudar("sistema", e.target.value)} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Grau">
              <select className={campo} value={r.grau} onChange={(e) => mudar("grau", e.target.value as "A" | "B")}>
                <option value="A">A — impecável</option>
                <option value="B">B — marcas de uso</option>
              </select>
            </Campo>
            <Campo rotulo="Garantia (meses)">
              <input className={campo} inputMode="numeric" value={r.garantiaMeses} onChange={(e) => mudar("garantiaMeses", e.target.value.replace(/\D/g, ""))} />
            </Campo>
          </div>
          <Campo rotulo="Preço à vista (R$)">
            <input className={campo} inputMode="decimal" value={r.precoVista} onChange={(e) => mudar("precoVista", e.target.value)} placeholder="2.499,00" />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Preço no cartão (R$)" dica="Vazio = só à vista">
              <input className={campo} inputMode="decimal" value={r.precoCartao} onChange={(e) => mudar("precoCartao", e.target.value)} placeholder="2.799,00" />
            </Campo>
            <Campo rotulo="Parcelas sem juros">
              <input className={campo} inputMode="numeric" value={r.parcelas} onChange={(e) => mudar("parcelas", e.target.value.replace(/\D/g, ""))} placeholder="10" />
            </Campo>
          </div>
          <div className="sm:col-span-2">
            <Campo rotulo="Observações para o cliente" dica="Detalhe estético, peça trocada, o que acompanha (carregador original, caixa…)">
              <textarea className={`${campo} min-h-[72px]`} value={r.observacoes} onChange={(e) => mudar("observacoes", e.target.value)} maxLength={500} />
            </Campo>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <input type="checkbox" checked={r.destaque} onChange={(e) => mudar("destaque", e.target.checked)} className="h-4 w-4 accent-[#E60012]" />
            Escolha da loja (aparece primeiro)
          </label>
          <Campo rotulo="Situação">
            <select className={campo} value={r.situacao} onChange={(e) => mudar("situacao", e.target.value as Situacao)}>
              {Object.entries(SITUACOES).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{erro}</p>}
        {!r.fotos.length && <p className="mt-4 text-xs text-amber-700">Sem foto o aparelho aparece com o aviso &quot;foto a caminho&quot;. Com foto, vende muito mais.</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={aoFechar} className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100">
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando || subindo > 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E60012] px-5 py-2.5 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
          >
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            {r.id ? "Salvar" : "Pôr na vitrine"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- leads

function LinhaDeLead({ l, aoMudar }: { l: LeadSeminovo; aoMudar: (status: StatusDoLead, nota?: string) => void }) {
  const [nota, setNota] = useState(l.nota ?? "");
  return (
    <tr className={l.status === "novo" ? "bg-red-50/40" : ""}>
      <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-gray-500">{quando(l.criadoEm)}</td>
      <td className="px-3 py-3 align-top">
        <p className="font-bold text-gray-900">{l.nome}</p>
        <a href={`https://wa.me/55${l.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline">
          <MessageCircle className="h-3.5 w-3.5" />
          {fone(l.whatsapp)}
        </a>
        {l.email && <p className="text-xs text-gray-500">{l.email}</p>}
      </td>
      <td className="px-3 py-3 align-top text-sm text-gray-800">
        <p className="font-semibold">{INTERESSES[l.interesse]}</p>
        {l.aparelhoNome && <p className="text-gray-600">{l.aparelhoNome}</p>}
        <p className="text-xs text-gray-500">{[rotuloDoUso(l.uso), rotuloDoOrcamento(l.orcamento)].filter(Boolean).join(" · ")}</p>
        {l.preferencias && <p className="mt-1 max-w-sm text-xs text-gray-600">{l.preferencias}</p>}
        <p className="mt-1 text-[11px] text-gray-400">
          {[l.origem.bloco && `bloco: ${l.origem.bloco}`, l.origem.utm && Object.values(l.origem.utm).join("/"), l.origem.referrer].filter(Boolean).join(" · ")}
        </p>
      </td>
      <td className="px-3 py-3 align-top">
        <select className={`${campo} w-36`} value={l.status} onChange={(e) => aoMudar(e.target.value as StatusDoLead, nota)}>
          {Object.entries(STATUS_DO_LEAD).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <input
          className={`${campo} mt-2 w-36 text-xs`}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={() => nota !== (l.nota ?? "") && aoMudar(l.status, nota)}
          placeholder="Nota"
        />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------- painel

export default function PainelSeminovos() {
  const [aba, setAba] = useState<"aparelhos" | "leads">("aparelhos");
  const [estoque, setEstoque] = useState<SeminovoDoPainel[]>([]);
  const [leads, setLeads] = useState<LeadSeminovo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<Rascunho | null>(null);
  const [filtro, setFiltro] = useState<StatusDoLead | "todos">("todos");

  const recarregar = useCallback(async () => {
    const r = await carregarPainel();
    setCarregando(false);
    if (!r.ok) return setErro(r.erro);
    setErro("");
    setEstoque(r.dados!.estoque);
    setLeads(r.dados!.leads);
  }, []);

  useEffect(() => {
    // Primeira leitura ao abrir a tela (o estado muda depois da resposta do servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [recarregar]);

  const novos = leads.filter((l) => l.status === "novo").length;
  const leadsFiltrados = useMemo(() => (filtro === "todos" ? leads : leads.filter((l) => l.status === filtro)), [leads, filtro]);
  const naVitrine = estoque.filter((s) => s.situacao !== "vendido").length;

  async function situacao(id: string, s: Situacao) {
    setEstoque((l) => l.map((x) => (x.id === id ? { ...x, situacao: s } : x)));
    const r = await trocarSituacao(id, s);
    if (!r.ok) setErro(r.erro);
  }

  async function apagar(s: SeminovoDoPainel) {
    if (!confirm(`Apagar ${nomeDoAparelho(s)}? Se ele foi vendido, prefira marcar "Vendido".`)) return;
    const r = await apagarAparelho(s.id);
    if (!r.ok) return setErro(r.erro);
    recarregar();
  }

  async function mudarLead(l: LeadSeminovo, status: StatusDoLead, nota?: string) {
    setLeads((lista) => lista.map((x) => (x.id === l.id ? { ...x, status, nota } : x)));
    const r = await marcarStatusDoLead(l.id, l.criadoEm, status, nota);
    if (!r.ok) setErro(r.erro);
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Laptop className="text-[#E60012]" />
            Seminovos
          </h2>
          <p className="text-sm text-gray-500">
            {naVitrine} na vitrine. Os leads da página caem aqui, no e-mail da loja e no WhatsApp.{" "}
            <a href="/seminovos" target="_blank" className="inline-flex items-center gap-1 font-semibold text-[#E60012] hover:underline">
              Ver a página <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditando({ ...VAZIO })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E60012] px-4 py-2.5 text-sm font-black text-white hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          Cadastrar aparelho
        </button>
      </div>

      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {(
          [
            ["aparelhos", `Aparelhos (${estoque.length})`, Laptop],
            ["leads", `Leads${novos ? ` · ${novos} novos` : ""}`, Users],
          ] as const
        ).map(([k, t, Icone]) => (
          <button
            key={k}
            type="button"
            onClick={() => setAba(k)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold ${aba === k ? "border-[#E60012] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            <Icone className="h-4 w-4" />
            {t}
          </button>
        ))}
      </div>

      {erro && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{erro}</p>}
      {carregando && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      {!carregando && aba === "aparelhos" && (
        <>
          {!estoque.length ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center">
              <p className="font-bold text-gray-800">Nenhum seminovo cadastrado</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Enquanto estiver vazio, a página mostra a lista de espera. Cadastre o primeiro aparelho com as fotos do celular e ele aparece lá em
                segundos.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {estoque.map((s) => (
                <li key={s.id} className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${s.situacao === "vendido" ? "opacity-60" : ""}`}>
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {s.urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.urls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs font-bold text-amber-700">Sem foto</span>
                    )}
                    {s.destaque && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-[#E60012] px-2 py-0.5 text-[11px] font-bold text-white">
                        <Star className="h-3 w-3" /> Escolha da loja
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900">{nomeDoAparelho(s)}</p>
                    <p className="text-xs text-gray-500">{[s.processador, s.memoria, s.armazenamento].join(" · ")}</p>
                    <p className="mt-2 font-black text-gray-900">{reais(s.precoVista)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <select className={`${campo} flex-1`} value={s.situacao} onChange={(e) => situacao(s.id, e.target.value as Situacao)}>
                        {Object.entries(SITUACOES).map(([v, t]) => (
                          <option key={v} value={v}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setEditando(deAparelho(s))} className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => apagar(s)} className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:border-red-300 hover:text-red-600" aria-label="Apagar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!carregando && aba === "leads" && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {(["todos", "novo", "atendido", "vendido", "perdido"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${filtro === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {f === "todos" ? `Todos (${leads.length})` : `${STATUS_DO_LEAD[f]} (${leads.filter((l) => l.status === f).length})`}
              </button>
            ))}
          </div>
          {!leadsFiltrados.length ? (
            <p className="rounded-xl bg-gray-50 p-6 text-sm text-gray-500">Nenhum lead aqui ainda (mostra os últimos três meses).</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-gray-50 text-xs font-bold text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Quando</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Pedido</th>
                    <th className="px-3 py-2">Andamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leadsFiltrados.map((l) => (
                    <LinhaDeLead key={l.id} l={l} aoMudar={(status, nota) => mudarLead(l, status, nota)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editando && (
        <Formulario
          inicial={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            recarregar();
          }}
        />
      )}
    </div>
  );
}

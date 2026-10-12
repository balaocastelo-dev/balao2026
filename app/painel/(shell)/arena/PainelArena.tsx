"use client";

// ============================================================
// Painel da Arena (/painel/arena): a corrida de vendas do telão.
// Abas: Corrida · Pilotos · Metas · Pontuação · Pedidos e orçamentos ·
// Prêmio · Conexão com o Bling. Os dados vêm do Bling pelo vigia do PC.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle, Download, ExternalLink, Flag, Gift, KeyRound, Loader2, Monitor, Plus, RefreshCw,
  RotateCcw, Save, Target, Trophy, Upload, Users, Zap, Rocket, MessageCircle, Send, Power,
} from "lucide-react";
import { Kart } from "@/components/arena/Kart";
import { janela } from "@/lib/arena/periodos";
import type { Lancamento, ModeloDeKart, Piloto, PlacarDoPeriodo, AjustesDaCorrida, Premio, AjustesDoTurbo, AjustesDoWhatsApp, JanelaDoTurbo } from "@/lib/arena/tipos";
import { descreverJanela, proximoTurbo, turboAgora } from "@/lib/arena/turbo";
import type { RegrasDePontos } from "@/lib/arena/pontos";
import {
  ajustarLancamentoAcao, apagarManualAcao, carregarPainel, criarPilotosDoBlingAcao, gerarChaveAcao, lancarManualAcao,
  lerAnuncioAirbnbAcao, listarLancamentosAcao, pedirVarreduraAcao, recalcularAcao, removerPilotoAcao, salvarCorridaAcao,
  salvarMetasAcao, salvarPilotoAcao, salvarPremioAcao, salvarRegrasAcao, salvarTurboAcao, turboAgoraAcao,
  salvarWhatsAppAcao, listarGruposAcao, testarWhatsAppAcao, pedidoDoVigiaAcao, aprovarVigiaAcao, recusarVigiaAcao,
} from "./acoes";

type Dados = NonNullable<Extract<Awaited<ReturnType<typeof carregarPainel>>, { ok: true }>["dados"]>;
type PilotoDoPainel = Dados["pilotos"][number];
type Aba = "corrida" | "pilotos" | "metas" | "pontos" | "turbo" | "pedidos" | "premio" | "avisos" | "bling";

const ABAS: { id: Aba; nome: string; icone: React.ReactNode }[] = [
  { id: "corrida", nome: "Corrida", icone: <Flag size={16} /> },
  { id: "pilotos", nome: "Pilotos", icone: <Users size={16} /> },
  { id: "metas", nome: "Metas", icone: <Target size={16} /> },
  { id: "pontos", nome: "Pontuação", icone: <Zap size={16} /> },
  { id: "turbo", nome: "Hora do turbo", icone: <Rocket size={16} /> },
  { id: "pedidos", nome: "Pedidos e orçamentos", icone: <CheckCircle size={16} /> },
  { id: "premio", nome: "Prêmio", icone: <Gift size={16} /> },
  { id: "avisos", nome: "Avisos no WhatsApp", icone: <MessageCircle size={16} /> },
  { id: "bling", nome: "Conexão com o Bling", icone: <KeyRound size={16} /> },
];

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBr = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
function haQuanto(iso: string | null) {
  if (!iso) return "nunca";
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  return h < 48 ? `há ${h} h` : `há ${Math.round(h / 24)} dias`;
}

const campo = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E60012]/40";
const rotulo = "block text-xs font-semibold text-gray-600 mb-1";
const botao = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold disabled:opacity-50";
const botaoPrimario = `${botao} bg-[#E60012] text-white hover:bg-[#c80010]`;
const botaoSecundario = `${botao} border border-gray-300 text-gray-700 hover:bg-gray-50`;
const cartao = "rounded-lg border border-gray-200 bg-white p-5";

/** Reduz a foto no navegador (192 px, JPEG) para caber no banco. */
async function reduzirFoto(arquivo: File): Promise<string> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => erro(new Error("Não consegui abrir a imagem."));
      i.src = url;
    });
    const lado = Math.min(img.width, img.height);
    const c = document.createElement("canvas");
    c.width = c.height = 192;
    c.getContext("2d")!.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 192, 192);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Aviso({ tipo, children }: { tipo: "ok" | "erro" | "info"; children: React.ReactNode }) {
  const cor = tipo === "ok" ? "border-green-200 bg-green-50 text-green-800" : tipo === "erro" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800";
  return <div className={`rounded-md border px-3 py-2 text-sm ${cor}`}>{children}</div>;
}

// ------------------------------------------------------------------ placar

function TabelaDoPlacar({ placar }: { placar: PlacarDoPeriodo }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-sm text-gray-800">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-1 pr-3">Pos.</th>
            <th className="py-1 pr-3">Piloto</th>
            <th className="py-1 pr-3 w-[38%]">Rumo à meta</th>
            <th className="py-1 pr-3 text-right">Pontos</th>
            <th className="py-1 pr-3 text-right">Vendas</th>
            <th className="py-1 pr-3 text-right">Orçam.</th>
            <th className="py-1 text-right">Licenças</th>
          </tr>
        </thead>
        <tbody>
          {placar.linhas.map((l) => (
            <tr key={l.piloto.id} className="border-t border-gray-100">
              <td className="py-2 pr-3 font-bold">{l.posicao}º</td>
              <td className="py-2 pr-3">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: l.piloto.cor }} />
                  {l.piloto.apelido || l.piloto.nome}
                  {l.chegou && <span title="Bateu a meta">🏁</span>}
                </span>
              </td>
              <td className="py-2 pr-3">
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, l.progresso * 100)}%`, background: l.piloto.cor }} />
                </div>
                <div className="mt-0.5 text-xs text-gray-500 tabular-nums">
                  {Math.round(l.progresso * 100)}% de {Math.round(l.meta)} pts
                </div>
              </td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold">{Math.round(l.pontos)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{l.vendas}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{l.orcamentos}</td>
              <td className="py-2 text-right tabular-nums">{l.licencas}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {placar.linhas.length === 0 && <p className="py-4 text-sm text-gray-500">Nenhum piloto ativo. Cadastre na aba Pilotos.</p>}
    </div>
  );
}

function AbaCorrida({ d, salvar }: { d: Dados; salvar: (c: AjustesDaCorrida) => Promise<void> }) {
  const [c, setC] = useState(d.corrida);
  const [salvando, setSalvando] = useState(false);
  return (
    <div className="space-y-5">
      {[d.placarSemana, d.placarMes].map((p) => (
        <section key={p.periodo} className={cartao}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">{p.periodo === "semana" ? "Corrida da semana" : "Corrida do mês"}</h2>
            <span className="text-sm text-gray-600">{p.rotulo}</span>
          </div>
          <div className="mt-2 mb-4 text-sm text-gray-700">
            Equipe: <b className="tabular-nums">{Math.round(p.equipe.pontos)}</b> de <b className="tabular-nums">{Math.round(p.equipe.meta)}</b> pts ({Math.round(p.equipe.progresso * 100)}%)
          </div>
          <TabelaDoPlacar placar={p} />
        </section>
      ))}

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Telão</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={rotulo}>Nome da corrida</span>
            <input className={campo} value={c.titulo} maxLength={80} onChange={(e) => setC({ ...c, titulo: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>O que o telão mostra</span>
            <select className={campo} value={c.periodoTelao} onChange={(e) => setC({ ...c, periodoTelao: e.target.value as AjustesDaCorrida["periodoTelao"] })}>
              <option value="alternar">Semana e mês, alternando a cada 45 s</option>
              <option value="semana">Só a corrida da semana</option>
              <option value="mes">Só a corrida do mês</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={c.som} onChange={(e) => setC({ ...c, som: e.target.checked })} />
            Som no telão (motor, moedas e fanfarra)
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={botaoPrimario}
            disabled={salvando}
            onClick={async () => {
              setSalvando(true);
              await salvar(c);
              setSalvando(false);
            }}
          >
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar telão
          </button>
          <a className={botaoSecundario} href="/arena" target="_blank" rel="noreferrer">
            <Monitor size={16} /> Abrir o telão
          </a>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ pilotos

function EditorDePiloto({
  inicial, d, onSalvar, onCancelar,
}: {
  inicial: PilotoDoPainel | null;
  d: Dados;
  onSalvar: (id: string | null, p: Partial<Piloto>) => Promise<boolean>;
  onCancelar: () => void;
}) {
  const [p, setP] = useState<Partial<Piloto>>(
    inicial ?? { nome: "", apelido: "", cor: d.cores[d.pilotos.length % d.cores.length], kart: d.karts[d.pilotos.length % d.karts.length] as ModeloDeKart, numero: d.pilotos.length + 1, ativo: true }
  );
  const [salvando, setSalvando] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const ligados = new Map(d.pilotos.filter((x) => x.blingVendedorId && x.id !== inicial?.id).map((x) => [x.blingVendedorId!, x.nome]));
  const fotoPrevia = p.foto ?? null;

  return (
    <div className="rounded-lg border-2 border-[#E60012]/30 bg-white p-5">
      <div className="flex flex-wrap items-start gap-6">
        <div className="rounded-lg bg-sky-100 p-3">
          <Kart modelo={(p.kart as ModeloDeKart) || "classico"} cor={p.cor || "#E60012"} nome={p.apelido || p.nome || "?"} numero={p.numero || 1} foto={fotoPrevia} largura={220} girando />
        </div>
        <div className="grid flex-1 min-w-[260px] gap-3 sm:grid-cols-2">
          <label>
            <span className={rotulo}>Nome</span>
            <input className={campo} value={p.nome ?? ""} onChange={(e) => setP({ ...p, nome: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Nome no telão</span>
            <input className={campo} value={p.apelido ?? ""} placeholder="Ex.: Brendon" onChange={(e) => setP({ ...p, apelido: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Vendedor no Bling</span>
            <select className={campo} value={p.blingVendedorId ?? ""} onChange={(e) => setP({ ...p, blingVendedorId: e.target.value || null })}>
              <option value="">— sem ligação (só pontos à mão) —</option>
              {d.vendedoresBling.map((v) => (
                <option key={v.id} value={v.id} disabled={ligados.has(v.id)}>
                  {v.nome || v.id}
                  {ligados.has(v.id) ? ` (já é de ${ligados.get(v.id)})` : ""}
                </option>
              ))}
              {d.semPiloto
                .filter((s) => !d.vendedoresBling.some((v) => v.id === s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>Vendedor {s.id} ({s.documentos} documentos)</option>
                ))}
              {p.blingVendedorId && !d.vendedoresBling.some((v) => v.id === p.blingVendedorId) && !d.semPiloto.some((s) => s.id === p.blingVendedorId) && (
                <option value={p.blingVendedorId}>Vendedor {p.blingVendedorId}</option>
              )}
            </select>
          </label>
          <label>
            <span className={rotulo}>Número do kart</span>
            <input className={campo} type="number" min={1} max={99} value={p.numero ?? ""} onChange={(e) => setP({ ...p, numero: Number(e.target.value) })} />
          </label>
          <div>
            <span className={rotulo}>Modelo do kart</span>
            <div className="flex flex-wrap gap-1.5">
              {d.karts.map((k) => (
                <button key={k} type="button" onClick={() => setP({ ...p, kart: k as ModeloDeKart })} className={`rounded-md border px-2 py-1 text-xs capitalize ${p.kart === k ? "border-[#E60012] bg-red-50 font-semibold" : "border-gray-300"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={rotulo}>Cor</span>
            <div className="flex flex-wrap gap-1.5">
              {d.cores.map((c) => (
                <button key={c} type="button" aria-label={`Cor ${c}`} onClick={() => setP({ ...p, cor: c })} className={`h-7 w-7 rounded-full border-2 ${p.cor === c ? "border-gray-900 ring-2 ring-offset-1 ring-gray-400" : "border-white"}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className={rotulo}>Foto do rosto (vai no capacete)</span>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`${botaoSecundario} cursor-pointer`}>
                <Upload size={16} /> Escolher foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setErroFoto(null);
                      setP({ ...p, foto: await reduzirFoto(f) });
                    } catch (err) {
                      setErroFoto((err as Error).message);
                    }
                  }}
                />
              </label>
              <input className={`${campo} flex-1 min-w-[200px]`} placeholder="ou cole o link de uma foto (https://…)" value={p.foto && !p.foto.startsWith("data:") ? p.foto : ""} onChange={(e) => setP({ ...p, foto: e.target.value || null })} />
              {p.foto && <button type="button" className={botaoSecundario} onClick={() => setP({ ...p, foto: null })}>Tirar foto</button>}
            </div>
            {erroFoto && <p className="mt-1 text-xs text-red-700">{erroFoto}</p>}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={p.ativo !== false} onChange={(e) => setP({ ...p, ativo: e.target.checked })} />
            Correndo (desmarque para tirar da pista sem apagar)
          </label>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className={botaoPrimario}
          disabled={salvando || !p.nome?.trim()}
          onClick={async () => {
            setSalvando(true);
            const ok = await onSalvar(inicial?.id ?? null, p);
            setSalvando(false);
            if (ok) onCancelar();
          }}
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar piloto
        </button>
        <button className={botaoSecundario} onClick={onCancelar}>Cancelar</button>
      </div>
    </div>
  );
}

function AbaPilotos({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [editando, setEditando] = useState<PilotoDoPainel | "novo" | null>(null);
  const [criando, setCriando] = useState(false);
  const nomeBling = new Map(d.vendedoresBling.map((v) => [v.id, v.nome]));
  const faltam = [...d.vendedoresBling.map((v) => v.id), ...d.semPiloto.map((s) => s.id)].filter(
    (id, i, arr) => arr.indexOf(id) === i && !d.pilotos.some((p) => p.blingVendedorId === id)
  );

  const salvar = async (id: string | null, p: Partial<Piloto>) => {
    const r = await salvarPilotoAcao(id, {
      nome: p.nome ?? "", apelido: p.apelido, foto: p.foto, cor: p.cor, kart: p.kart, numero: p.numero,
      blingVendedorId: p.blingVendedorId, metaSemana: p.metaSemana, metaMes: p.metaMes, ativo: p.ativo,
    });
    if (!r.ok) {
      avisar("erro", r.erro);
      return false;
    }
    avisar("ok", "Piloto salvo. O telão atualiza em até 20 segundos.");
    await recarregar();
    return true;
  };

  return (
    <div className="space-y-4">
      {faltam.length > 0 && (
        <Aviso tipo="info">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {faltam.length} vendedor{faltam.length > 1 ? "es" : ""} do Bling ainda sem kart: {faltam.map((id) => nomeBling.get(id) || id).join(", ")}.
            </span>
            <button
              className={botaoPrimario}
              disabled={criando}
              onClick={async () => {
                setCriando(true);
                const r = await criarPilotosDoBlingAcao();
                setCriando(false);
                if (!r.ok) return avisar("erro", r.erro);
                avisar("ok", `${r.dados} piloto(s) criados. Confira nome, foto e quem corre.`);
                await recarregar();
              }}
            >
              {criando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Criar os karts deles
            </button>
          </div>
        </Aviso>
      )}

      {editando && <EditorDePiloto inicial={editando === "novo" ? null : editando} d={d} onSalvar={salvar} onCancelar={() => setEditando(null)} />}

      {!editando && (
        <button className={botaoPrimario} onClick={() => setEditando("novo")}>
          <Plus size={16} /> Novo piloto
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {d.pilotos.map((p) => (
          <div key={p.id} className={`${cartao} flex items-center gap-4 ${p.ativo ? "" : "opacity-60"}`}>
            <Kart modelo={p.kart} cor={p.cor} nome={p.apelido || p.nome} numero={p.numero} foto={p.fotoTelao} largura={120} />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-gray-900 truncate">{p.apelido || p.nome}</div>
              <div className="text-xs text-gray-500 truncate">{p.nome}</div>
              <a href={`/arena/${p.slug}`} target="_blank" rel="noreferrer" className="mt-0.5 block text-xs text-blue-700 hover:underline truncate">
                balao.info/arena/{p.slug}
              </a>
              <div className="mt-1 text-xs text-gray-600">
                {p.blingVendedorId ? `Bling: ${nomeBling.get(p.blingVendedorId) || p.blingVendedorId}` : "Sem vendedor do Bling"}
                {!p.ativo && " · fora da pista"}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="text-xs font-semibold text-[#E60012] hover:underline" onClick={() => setEditando(p)}>Editar</button>
                <button
                  className="text-xs font-semibold text-gray-500 hover:underline"
                  onClick={async () => {
                    if (!confirm(`Apagar ${p.nome}? Os pontos do Bling continuam guardados e voltam se você ligar o vendedor a outro piloto.`)) return;
                    const r = await removerPilotoAcao(p.id);
                    if (!r.ok) return avisar("erro", r.erro);
                    await recarregar();
                  }}
                >
                  Apagar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ metas

function AbaMetas({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [metas, setMetas] = useState(() => Object.fromEntries(d.pilotos.map((p) => [p.id, { s: p.metaSemana ?? "", m: p.metaMes ?? "" }])) as Record<string, { s: number | ""; m: number | "" }>);
  const [c, setC] = useState(d.corrida);
  const [salvando, setSalvando] = useState(false);
  const ativos = d.pilotos.filter((p) => p.ativo);
  const soma = (k: "s" | "m") => ativos.reduce((t, p) => t + (Number(metas[p.id]?.[k]) || (k === "s" ? c.metaPadraoSemana : c.metaPadraoMes)), 0);

  const usarSugestoes = () =>
    setMetas((atual) => {
      const novo = { ...atual };
      for (const p of d.pilotos) {
        const s = d.sugestoes[p.id];
        novo[p.id] = { s: s?.semana ?? atual[p.id]?.s ?? "", m: s?.mes ?? atual[p.id]?.m ?? "" };
      }
      return novo;
    });

  return (
    <div className="space-y-5">
      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Meta de cada piloto</h2>
        <p className="mt-1 text-sm text-gray-700 max-w-3xl">
          A linha de chegada de cada um é a própria meta. A sugestão é a média dos pontos das últimas 4 semanas (ou 3 meses) com 15% a mais.
          Em branco, vale a meta padrão.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[620px] w-full text-sm text-gray-800">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-1 pr-3">Piloto</th>
                <th className="py-1 pr-3">Meta da semana</th>
                <th className="py-1 pr-3">Sugestão</th>
                <th className="py-1 pr-3">Meta do mês</th>
                <th className="py-1">Sugestão</th>
              </tr>
            </thead>
            <tbody>
              {d.pilotos.map((p) => (
                <tr key={p.id} className={`border-t border-gray-100 ${p.ativo ? "" : "opacity-50"}`}>
                  <td className="py-2 pr-3 font-semibold">{p.apelido || p.nome}</td>
                  <td className="py-2 pr-3">
                    <input className={`${campo} w-28`} type="number" min={0} placeholder={String(c.metaPadraoSemana)} value={metas[p.id]?.s ?? ""} onChange={(e) => setMetas({ ...metas, [p.id]: { ...metas[p.id], s: e.target.value === "" ? "" : Number(e.target.value) } })} />
                  </td>
                  <td className="py-2 pr-3 text-gray-500 tabular-nums">{d.sugestoes[p.id]?.semana ?? "sem histórico"}</td>
                  <td className="py-2 pr-3">
                    <input className={`${campo} w-28`} type="number" min={0} placeholder={String(c.metaPadraoMes)} value={metas[p.id]?.m ?? ""} onChange={(e) => setMetas({ ...metas, [p.id]: { ...metas[p.id], m: e.target.value === "" ? "" : Number(e.target.value) } })} />
                  </td>
                  <td className="py-2 text-gray-500 tabular-nums">{d.sugestoes[p.id]?.mes ?? "sem histórico"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className={`${botaoSecundario} mt-3`} onClick={usarSugestoes}>
          <Target size={16} /> Usar as sugestões
        </button>
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Meta da equipe e meta padrão</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className={rotulo}>Meta da equipe na semana</span>
            <input className={campo} type="number" min={0} value={c.metaGlobalSemana || ""} placeholder={`soma: ${soma("s")}`} onChange={(e) => setC({ ...c, metaGlobalSemana: Number(e.target.value) || 0 })} />
          </label>
          <label>
            <span className={rotulo}>Meta da equipe no mês</span>
            <input className={campo} type="number" min={0} value={c.metaGlobalMes || ""} placeholder={`soma: ${soma("m")}`} onChange={(e) => setC({ ...c, metaGlobalMes: Number(e.target.value) || 0 })} />
          </label>
          <label>
            <span className={rotulo}>Meta padrão (semana)</span>
            <input className={campo} type="number" min={1} value={c.metaPadraoSemana} onChange={(e) => setC({ ...c, metaPadraoSemana: Number(e.target.value) || 1 })} />
          </label>
          <label>
            <span className={rotulo}>Meta padrão (mês)</span>
            <input className={campo} type="number" min={1} value={c.metaPadraoMes} onChange={(e) => setC({ ...c, metaPadraoMes: Number(e.target.value) || 1 })} />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">Meta da equipe em branco = soma das metas dos pilotos que estão correndo.</p>
      </section>

      <button
        className={botaoPrimario}
        disabled={salvando}
        onClick={async () => {
          setSalvando(true);
          const r1 = await salvarMetasAcao(d.pilotos.map((p) => ({ id: p.id, metaSemana: metas[p.id]?.s === "" ? null : Number(metas[p.id]?.s), metaMes: metas[p.id]?.m === "" ? null : Number(metas[p.id]?.m) })));
          const r2 = await salvarCorridaAcao(c);
          setSalvando(false);
          if (!r1.ok) return avisar("erro", r1.erro);
          if (!r2.ok) return avisar("erro", r2.erro);
          avisar("ok", "Metas salvas.");
          await recarregar();
        }}
      >
        {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar metas
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ pontuação

function AbaPontos({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [r, setR] = useState<RegrasDePontos>(d.regras);
  const [palavras, setPalavras] = useState(d.regras.licencaPalavras.join(", "));
  const [excluir, setExcluir] = useState(d.regras.licencaExcluir.join(", "));
  const [salvando, setSalvando] = useState(false);
  const n = (k: keyof RegrasDePontos, label: string, ajuda?: string) => (
    <label>
      <span className={rotulo}>{label}</span>
      <input className={campo} type="number" min={0} value={r[k] as number} onChange={(e) => setR({ ...r, [k]: Number(e.target.value) || 0 })} />
      {ajuda && <span className="mt-1 block text-xs text-gray-500">{ajuda}</span>}
    </label>
  );
  const exemplo = r.venda + r.licencaBonus + (r.ticketFaixa > 0 ? Math.floor(3500 / r.ticketFaixa) * r.ticketPontos : 0) + r.conversaoBonus;

  return (
    <div className="space-y-5">
      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Quanto vale cada coisa</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {n("venda", "Venda (pedido no Bling)")}
          {n("orcamento", "Orçamento (proposta comercial)")}
          {n("licencaBonus", "Bônus por licença Windows/Office", "Por unidade vendida.")}
          {n("conversaoBonus", "Bônus: orçamento que virou venda", "Mesmo cliente com orçamento antes da venda.")}
          {n("conversaoDias", "Janela da conversão (dias)")}
          {n("orcamentoMinimo", "Orçamento mínimo (R$)", "Abaixo disso o orçamento não pontua.")}
          {n("ticketFaixa", "Bônus do ticket: a cada R$", "0 desliga.")}
          {n("ticketPontos", "…vale quantos pontos")}
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={r.umOrcamentoPorClienteDia} onChange={(e) => setR({ ...r, umOrcamentoPorClienteDia: e.target.checked })} />
          Mesmo vendedor, mesmo cliente, mesmo dia: só o primeiro orçamento pontua
        </label>
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          Exemplo: venda de R$ 3.500 com uma licença do Windows, para um cliente que tinha orçamento, vale <b>{exemplo} pts</b>. Venda cancelada no Bling perde os pontos sozinha.
        </div>
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Como reconhecer a licença</h2>
        <p className="mt-1 text-sm text-gray-700 max-w-3xl">
          Um item do pedido é licença quando o nome tem uma das palavras abaixo e nenhuma das palavras de exclusão (para notebook com Windows e cadeira Office não contarem).
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={rotulo}>Tem uma destas (separe por vírgula)</span>
            <textarea className={campo} rows={3} value={palavras} onChange={(e) => setPalavras(e.target.value)} />
          </label>
          <label>
            <span className={rotulo}>E nenhuma destas</span>
            <textarea className={campo} rows={3} value={excluir} onChange={(e) => setExcluir(e.target.value)} />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          className={botaoPrimario}
          disabled={salvando}
          onClick={async () => {
            setSalvando(true);
            const res = await salvarRegrasAcao({
              ...r,
              licencaPalavras: palavras.split(",").map((s) => s.trim()).filter(Boolean),
              licencaExcluir: excluir.split(",").map((s) => s.replace(/^\s+/, "")).filter((s) => s.trim()),
            });
            setSalvando(false);
            if (!res.ok) return avisar("erro", res.erro);
            avisar("ok", `Regras salvas. ${res.dados} lançamento(s) recalculados com as regras novas.`);
            await recarregar();
          }}
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar e recalcular
        </button>
        <button
          className={botaoSecundario}
          onClick={() => {
            setR(d.regrasPadrao);
            setPalavras(d.regrasPadrao.licencaPalavras.join(", "));
            setExcluir(d.regrasPadrao.licencaExcluir.join(", "));
          }}
        >
          <RotateCcw size={16} /> Voltar ao padrão
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ pedidos e orçamentos

const STATUS: Record<string, { nome: string; cor: string }> = {
  valido: { nome: "Conta", cor: "bg-green-100 text-green-800" },
  cancelado: { nome: "Cancelado", cor: "bg-gray-200 text-gray-700" },
  pendente: { nome: "Em digitação", cor: "bg-yellow-100 text-yellow-800" },
  ignorado: { nome: "Não pontua", cor: "bg-orange-100 text-orange-800" },
  anulado: { nome: "Anulado", cor: "bg-red-100 text-red-800" },
};

function AbaPedidos({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const mes = useMemo(() => janela("mes"), []);
  const [f, setF] = useState({ inicio: mes.inicio, fim: mes.fim, tipo: "", status: "", busca: "" });
  const [lista, setLista] = useState<Lancamento[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [manual, setManual] = useState({ piloto: d.pilotos[0]?.id ?? "", pontos: "", motivo: "" });
  const porBling = new Map(d.pilotos.filter((p) => p.blingVendedorId).map((p) => [p.blingVendedorId!, p]));
  const porId = new Map(d.pilotos.map((p) => [p.id, p]));
  const nomeBling = new Map(d.vendedoresBling.map((v) => [v.id, v.nome]));

  const buscar = useCallback(async () => {
    setCarregando(true);
    const r = await listarLancamentosAcao({ ...f, limite: 500 });
    setCarregando(false);
    if (!r.ok) return avisar("erro", r.erro);
    setLista(r.dados ?? []);
  }, [f, avisar]);
  useEffect(() => {
    void buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quem = (l: Lancamento) => {
    const p = l.pilotoId ? porId.get(l.pilotoId) : l.blingVendedorId ? porBling.get(l.blingVendedorId) : undefined;
    if (p) return p.apelido || p.nome;
    if (l.blingVendedorId) return `${nomeBling.get(l.blingVendedorId) || l.blingVendedorId} (sem kart)`;
    return "Sem vendedor no Bling";
  };

  const totais = useMemo(() => {
    const v = (lista ?? []).filter((l) => l.status === "valido");
    return { pontos: v.reduce((t, l) => t + l.pontos, 0), vendas: v.filter((l) => l.tipo === "venda").length, orcamentos: v.filter((l) => l.tipo === "orcamento").length };
  }, [lista]);

  return (
    <div className="space-y-5">
      <section className={cartao}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label>
            <span className={rotulo}>De</span>
            <input className={campo} type="date" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Até</span>
            <input className={campo} type="date" value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Tipo</span>
            <select className={campo} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="venda">Vendas</option>
              <option value="orcamento">Orçamentos</option>
              <option value="manual">Pontos à mão</option>
            </select>
          </label>
          <label>
            <span className={rotulo}>Situação</span>
            <select className={campo} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              <option value="">Todas</option>
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.nome}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={rotulo}>Buscar (nº, cliente, motivo)</span>
            <input className={campo} value={f.busca} onChange={(e) => setF({ ...f, busca: e.target.value })} onKeyDown={(e) => e.key === "Enter" && void buscar()} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button className={botaoPrimario} onClick={() => void buscar()} disabled={carregando}>
            {carregando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Buscar
          </button>
          {lista && (
            <span className="text-sm text-gray-600">
              {lista.length} lançamentos · contam {totais.vendas} vendas, {totais.orcamentos} orçamentos, {Math.round(totais.pontos)} pts
            </span>
          )}
        </div>
      </section>

      <section className={`${cartao} overflow-x-auto`}>
        <table className="min-w-[900px] w-full text-sm text-gray-800">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-1 pr-3">Data</th>
              <th className="py-1 pr-3">Documento</th>
              <th className="py-1 pr-3">Piloto</th>
              <th className="py-1 pr-3">Cliente</th>
              <th className="py-1 pr-3 text-right">Total</th>
              <th className="py-1 pr-3 text-right">Pontos</th>
              <th className="py-1 pr-3">Situação</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {(lista ?? []).map((l) => {
              const st = STATUS[l.status] ?? STATUS.valido;
              const det = l.detalhe;
              const partes = det ? [det.base && `base ${det.base}`, det.licencas && `licença ${det.licencas}`, det.ticket && `ticket ${det.ticket}`, det.conversao && `conversão ${det.conversao}`, det.turbo && `turbo ${det.turbo}`].filter(Boolean).join(" + ") : "";
              return (
                <tr key={l.id} className="border-t border-gray-100 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{dataBr(l.data)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {l.tipo === "venda" ? `Pedido ${l.numero}` : l.tipo === "orcamento" ? `Orçamento ${l.numero}` : "Pontos à mão"}
                    {l.licencas > 0 && <span className="ml-1 rounded bg-yellow-100 px-1.5 text-xs font-semibold text-yellow-800">{l.licencas} licença{l.licencas > 1 ? "s" : ""}</span>}
                    {l.turbo > 1 && <span className="ml-1 rounded bg-orange-100 px-1.5 text-xs font-semibold text-orange-800">turbo {l.turbo}x</span>}
                  </td>
                  <td className="py-2 pr-3">{quem(l)}</td>
                  <td className="py-2 pr-3 max-w-[200px] truncate" title={l.contatoNome ?? ""}>{l.contatoNome ?? (l.tipo === "manual" ? l.motivo : "—")}</td>
                  <td className="py-2 pr-3 text-right tabular-nums whitespace-nowrap">{l.tipo === "manual" ? "—" : reais(l.total)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums font-semibold" title={partes}>
                    {Math.round(l.pontos * 10) / 10}
                    {l.pontosManual != null && <span className="ml-1 text-xs font-normal text-gray-500">(à mão)</span>}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${st.cor}`}>{st.nome}</span>
                    {l.motivo && l.tipo !== "manual" && <div className="mt-0.5 text-xs text-gray-500">{l.motivo}</div>}
                  </td>
                  <td className="py-2 whitespace-nowrap text-right">
                    {l.origem === "manual" ? (
                      <button
                        className="text-xs font-semibold text-gray-500 hover:underline"
                        onClick={async () => {
                          if (!confirm("Apagar este lançamento à mão?")) return;
                          const r = await apagarManualAcao(l.id, l.data);
                          if (!r.ok) return avisar("erro", r.erro);
                          await buscar();
                          await recarregar();
                        }}
                      >
                        Apagar
                      </button>
                    ) : (
                      <span className="inline-flex gap-3">
                        <button
                          className="text-xs font-semibold text-gray-600 hover:underline"
                          onClick={async () => {
                            const v = prompt("Pontos deste documento (vazio = voltar à regra):", l.pontosManual != null ? String(l.pontosManual) : "");
                            if (v === null) return;
                            const r = await ajustarLancamentoAcao(l.id, { pontosManual: v.trim() === "" ? null : Number(v.replace(",", ".")), data: l.data });
                            if (!r.ok) return avisar("erro", r.erro);
                            await buscar();
                            await recarregar();
                          }}
                        >
                          Mudar pontos
                        </button>
                        <button
                          className={`text-xs font-semibold hover:underline ${l.anuladoManual ? "text-green-700" : "text-[#E60012]"}`}
                          onClick={async () => {
                            const r = await ajustarLancamentoAcao(l.id, { anular: !l.anuladoManual, data: l.data });
                            if (!r.ok) return avisar("erro", r.erro);
                            await buscar();
                            await recarregar();
                          }}
                        >
                          {l.anuladoManual ? "Reativar" : "Anular"}
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista && lista.length === 0 && <p className="py-4 text-sm text-gray-500">Nada nesse período. Se o vigia ainda não foi instalado, veja a aba Conexão com o Bling.</p>}
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Lançar pontos à mão</h2>
        <p className="mt-1 text-sm text-gray-700">Bônus por um atendimento caprichado, desafio do dia, ou penalidade (número negativo). Aparece no telão como bônus.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_2fr_auto] items-end">
          <label>
            <span className={rotulo}>Piloto</span>
            <select className={campo} value={manual.piloto} onChange={(e) => setManual({ ...manual, piloto: e.target.value })}>
              {d.pilotos.map((p) => (
                <option key={p.id} value={p.id}>{p.apelido || p.nome}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={rotulo}>Pontos</span>
            <input className={campo} type="number" value={manual.pontos} onChange={(e) => setManual({ ...manual, pontos: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Motivo</span>
            <input className={campo} value={manual.motivo} maxLength={300} placeholder="Ex.: avaliação 5 estrelas no Google" onChange={(e) => setManual({ ...manual, motivo: e.target.value })} />
          </label>
          <button
            className={botaoPrimario}
            disabled={!manual.piloto || !manual.pontos || !manual.motivo.trim()}
            onClick={async () => {
              const r = await lancarManualAcao(manual.piloto, Number(manual.pontos), manual.motivo);
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", "Pontos lançados.");
              setManual({ ...manual, pontos: "", motivo: "" });
              await buscar();
              await recarregar();
            }}
          >
            <Plus size={16} /> Lançar
          </button>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ prêmio

function AbaPremio({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [p, setP] = useState<Premio>(d.premio);
  const [lendo, setLendo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const placar = p.periodo === "semana" ? d.placarSemana : d.placarMes;
  const falta = Math.max(0, Math.ceil(placar.equipe.meta - placar.equipe.pontos));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Viagem da equipe</h2>
        <p className="mt-1 text-sm text-gray-700">A foto do anúncio fica num outdoor depois da linha de chegada, com quanto falta para a equipe ganhar.</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={rotulo}>Link do anúncio no Airbnb</span>
            <div className="flex gap-2">
              <input className={campo} placeholder="https://www.airbnb.com.br/rooms/…" value={p.link} onChange={(e) => setP({ ...p, link: e.target.value })} />
              <button
                className={botaoSecundario}
                disabled={lendo || !p.link}
                onClick={async () => {
                  setLendo(true);
                  const r = await lerAnuncioAirbnbAcao(p.link);
                  setLendo(false);
                  if (!r.ok) return avisar("erro", r.erro);
                  const a = r.dados!;
                  setP((x) => ({ ...x, link: a.link, titulo: x.titulo || a.titulo, imagem: a.imagem || x.imagem, descricao: x.descricao || a.descricao }));
                  avisar("ok", a.imagem ? "Anúncio lido: confira o título e a foto." : "Li o título, mas não a foto. Cole o link da foto abaixo.");
                }}
              >
                {lendo ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Ler anúncio
              </button>
            </div>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={rotulo}>Título no telão</span>
              <input className={campo} maxLength={120} placeholder="Ex.: Casa na praia em Ubatuba" value={p.titulo} onChange={(e) => setP({ ...p, titulo: e.target.value })} />
            </label>
            <label>
              <span className={rotulo}>Lugar</span>
              <input className={campo} maxLength={120} placeholder="Ex.: Ubatuba, SP" value={p.local} onChange={(e) => setP({ ...p, local: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className={rotulo}>Foto (link https)</span>
            <input className={campo} value={p.imagem} placeholder="Preenchida pelo “Ler anúncio”, ou cole o link da foto" onChange={(e) => setP({ ...p, imagem: e.target.value })} />
          </label>
          <label className="block">
            <span className={rotulo}>Regras do prêmio (para você; não aparece no telão)</span>
            <textarea className={campo} rows={2} maxLength={400} value={p.descricao} onChange={(e) => setP({ ...p, descricao: e.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={rotulo}>A viagem é da meta da equipe</span>
              <select className={campo} value={p.periodo} onChange={(e) => setP({ ...p, periodo: e.target.value as Premio["periodo"] })}>
                <option value="mes">do mês</option>
                <option value="semana">da semana</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 sm:mt-6">
              <input type="checkbox" checked={p.ativo} onChange={(e) => setP({ ...p, ativo: e.target.checked })} />
              Mostrar o prêmio no telão
            </label>
          </div>
          <button
            className={botaoPrimario}
            disabled={salvando}
            onClick={async () => {
              setSalvando(true);
              const r = await salvarPremioAcao(p);
              setSalvando(false);
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", "Prêmio salvo.");
              await recarregar();
            }}
          >
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar prêmio
          </button>
        </div>
      </section>

      <aside>
        <div className="overflow-hidden rounded-xl border-4 border-[#1A1440] bg-[#1A1440] text-white shadow-[0_8px_0_rgba(26,20,64,.35)]">
          <div className="aspect-[5/3] bg-gradient-to-br from-yellow-300 to-orange-400">
            {p.imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imagem} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-6xl">🏆</div>
            )}
          </div>
          <div className="p-4">
            <div className="text-xl font-black">{p.titulo || p.local || "Viagem da equipe"}</div>
            <div className="mt-1 text-sm text-yellow-300 font-bold">
              {falta > 0 ? `Faltam ${falta} pts da equipe ${p.periodo === "mes" ? "no mês" : "na semana"}` : "Meta batida!"}
            </div>
            {p.link && (
              <a href={p.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 hover:underline">
                Ver anúncio <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Prévia do outdoor do telão.</p>
      </aside>
    </div>
  );
}

// ------------------------------------------------------------------ hora do turbo

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const horaBr = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const diaHoraBr = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function AbaTurbo({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [t, setT] = useState<AjustesDoTurbo>(d.turbo);
  const [nova, setNova] = useState<JanelaDoTurbo>({ dias: [1, 2, 3, 4, 5], das: "14:00", ate: "16:00" });
  const [minutos, setMinutos] = useState(60);
  const [ocupado, setOcupado] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setAgora(Date.now()), 15000);
    return () => clearInterval(i);
  }, []);
  const ativo = turboAgora(d.turbo, new Date(agora));
  const proximo = proximoTurbo(d.turbo, new Date(agora));

  const salvar = async (x: AjustesDoTurbo) => {
    setOcupado(true);
    const r = await salvarTurboAcao(x);
    setOcupado(false);
    if (!r.ok) return avisar("erro", r.erro);
    setT(r.dados!);
    avisar("ok", "Hora do turbo salva.");
    await recarregar();
  };

  return (
    <div className="space-y-5">
      <section className={`${cartao} ${ativo.ativo ? "border-yellow-400 bg-yellow-50" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{ativo.ativo ? `⚡ Turbo ligado: ${ativo.multiplicador}x até ${horaBr(ativo.ate!)}` : "Turbo desligado agora"}</h2>
            <p className="mt-1 text-sm text-gray-700">
              {ativo.ativo
                ? "Toda venda e orçamento que chegar do Bling agora vale mais. O telão mostra a faixa dourada."
                : proximo
                  ? `Próximo turbo: ${diaHoraBr(proximo.inicio)}, ${proximo.multiplicador}x.`
                  : "Nenhum horário fixo cadastrado."}
            </p>
          </div>
          {d.turbo.manualAte && Date.parse(d.turbo.manualAte) > agora && (
            <button
              className={botaoSecundario}
              disabled={ocupado}
              onClick={async () => {
                setOcupado(true);
                const r = await turboAgoraAcao(0, 1);
                setOcupado(false);
                if (!r.ok) return avisar("erro", r.erro);
                avisar("ok", "Turbo desligado.");
                await recarregar();
              }}
            >
              <Power size={16} /> Desligar agora
            </button>
          )}
        </div>
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Ligar agora</h2>
        <p className="mt-1 text-sm text-gray-700">Para um dia parado: liga o turbo na hora, por um tempo. Se os avisos do WhatsApp estiverem ligados, a equipe recebe a chamada.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label>
            <span className={rotulo}>Por quanto tempo</span>
            <select className={campo} value={minutos} onChange={(e) => setMinutos(Number(e.target.value))}>
              {[30, 60, 90, 120, 180, 240].map((m) => (
                <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} h`}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={rotulo}>Pontos</span>
            <select className={campo} value={t.manualMultiplicador} onChange={(e) => setT({ ...t, manualMultiplicador: Number(e.target.value) })}>
              {[1.5, 2, 3].map((m) => (
                <option key={m} value={m}>{m}x</option>
              ))}
            </select>
          </label>
          <button
            className={botaoPrimario}
            disabled={ocupado}
            onClick={async () => {
              setOcupado(true);
              const r = await turboAgoraAcao(minutos, t.manualMultiplicador);
              setOcupado(false);
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", "Turbo ligado. O telão mostra em até 20 segundos.");
              await recarregar();
            }}
          >
            <Rocket size={16} /> Ligar turbo agora
          </button>
        </div>
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Horários fixos</h2>
        <p className="mt-1 text-sm text-gray-700 max-w-3xl">
          Escolha os horários fracos da loja. Vale a hora em que o documento chega à Arena (o Bling não guarda a hora do pedido): o vigia olha a cada 2 minutos, e o que chega até 5 minutos depois do fim ainda ganha o turbo.
        </p>
        {t.janelas.length > 0 ? (
          <ul className="mt-3 divide-y divide-gray-100 text-sm text-gray-800">
            {t.janelas.map((j, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span>{descreverJanela(j)}</span>
                <button className="text-xs font-semibold text-gray-500 hover:underline" onClick={() => void salvar({ ...t, janelas: t.janelas.filter((_, k) => k !== i) })}>
                  Tirar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Nenhum horário fixo.</p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-end">
          <div>
            <span className={rotulo}>Dias</span>
            <div className="flex flex-wrap gap-1.5">
              {DIAS.map((nome, i) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setNova({ ...nova, dias: nova.dias.includes(i) ? nova.dias.filter((x) => x !== i) : [...nova.dias, i].sort() })}
                  className={`rounded-md border px-2 py-1 text-xs ${nova.dias.includes(i) ? "border-[#E60012] bg-red-50 font-semibold" : "border-gray-300"}`}
                  aria-pressed={nova.dias.includes(i)}
                >
                  {nome}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className={rotulo}>Das</span>
            <input className={campo} type="time" value={nova.das} onChange={(e) => setNova({ ...nova, das: e.target.value })} />
          </label>
          <label>
            <span className={rotulo}>Até</span>
            <input className={campo} type="time" value={nova.ate} onChange={(e) => setNova({ ...nova, ate: e.target.value })} />
          </label>
          <button className={botaoSecundario} disabled={ocupado || !nova.dias.length || nova.ate <= nova.das} onClick={() => void salvar({ ...t, janelas: [...t.janelas, nova] })}>
            <Plus size={16} /> Pôr horário
          </button>
        </div>
        <label className="mt-4 block max-w-xs">
          <span className={rotulo}>Nos horários fixos, os pontos valem</span>
          <select className={campo} value={t.multiplicador} onChange={(e) => void salvar({ ...t, multiplicador: Number(e.target.value) })}>
            {[1.5, 2, 3].map((m) => (
              <option key={m} value={m}>{m}x</option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ avisos no WhatsApp

function AbaAvisos({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [w, setW] = useState<AjustesDoWhatsApp>(d.whatsapp);
  const [grupos, setGrupos] = useState<{ id: string; nome: string; participantes: number | null }[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erroGrupos, setErroGrupos] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const ehGrupo = w.destino.endsWith("@g.us");

  const buscarGrupos = async () => {
    setBuscando(true);
    const r = await listarGruposAcao();
    setBuscando(false);
    if (!r.ok) {
      setErroGrupos(r.erro);
      return;
    }
    setErroGrupos(null);
    setGrupos(r.dados ?? []);
  };

  const caixa = (k: "meta" | "equipe" | "lideranca" | "turbo", texto: string) => (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={w[k]} onChange={(e) => setW({ ...w, [k]: e.target.checked })} />
      {texto}
    </label>
  );

  return (
    <div className="space-y-5">
      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Para onde vão os avisos</h2>
        <p className="mt-1 text-sm text-gray-700 max-w-3xl">
          Saem pela linha da loja, para um grupo da equipe (a loja precisa estar no grupo) ou para um número. Não entram no CRM e nunca vão para cliente.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <button className={botaoSecundario} disabled={buscando} onClick={() => void buscarGrupos()}>
            {buscando ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />} Buscar os grupos da loja
          </button>
          {grupos && (
            <select
              className={`${campo} max-w-md`}
              value={ehGrupo ? w.destino : ""}
              onChange={(e) => {
                const g = grupos.find((x) => x.id === e.target.value);
                setW({ ...w, destino: e.target.value, nomeDestino: g?.nome ?? "" });
              }}
            >
              <option value="">— escolha o grupo —</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                  {g.participantes ? ` (${g.participantes})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        {erroGrupos && <p className="mt-2 text-sm text-red-700">{erroGrupos}</p>}
        <label className="mt-4 block max-w-sm">
          <span className={rotulo}>…ou um número (com DDD)</span>
          <input
            className={campo}
            inputMode="tel"
            placeholder="19 99999-9999"
            value={ehGrupo ? "" : w.destino}
            onChange={(e) => {
              const dig = e.target.value.replace(/\D/g, "");
              setW({ ...w, destino: dig.length === 10 || dig.length === 11 ? `55${dig}` : dig, nomeDestino: "" });
            }}
          />
        </label>
        {w.destino && <p className="mt-2 text-sm text-gray-600">Destino: <b>{w.nomeDestino || w.destino}</b></p>}
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">O que avisar</h2>
        <div className="mt-3 space-y-2">
          {caixa("meta", "🏁 Quando alguém cruza a linha de chegada (bate a meta da semana ou do mês)")}
          {caixa("equipe", "🏆 Quando a equipe bate a meta (e a viagem, se houver prêmio)")}
          {caixa("turbo", "⚡ Quando começa a hora do turbo")}
          {caixa("lideranca", "🥇 Quando muda o líder da semana (no máximo uma vez por dia para cada um)")}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <input type="checkbox" checked={w.ativo} onChange={(e) => setW({ ...w, ativo: e.target.checked })} />
          Avisos ligados
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={botaoPrimario}
            disabled={salvando || (w.ativo && !w.destino)}
            onClick={async () => {
              setSalvando(true);
              const r = await salvarWhatsAppAcao(w);
              setSalvando(false);
              if (!r.ok) return avisar("erro", r.erro);
              setW(r.dados!);
              avisar("ok", r.dados!.ativo ? "Avisos ligados." : "Avisos salvos (desligados).");
              await recarregar();
            }}
          >
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar avisos
          </button>
          <button
            className={botaoSecundario}
            disabled={testando || !w.destino}
            onClick={async () => {
              if (!confirm(`Mandar uma mensagem de teste para ${w.nomeDestino || w.destino}?`)) return;
              setTestando(true);
              const r = await testarWhatsAppAcao(w.destino);
              setTestando(false);
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", "Mensagem de teste enviada.");
            }}
          >
            {testando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Mandar teste
          </button>
        </div>
        {d.avisos?.ultimoErro && <p className="mt-3 text-sm text-red-700">Último aviso falhou: {d.avisos.ultimoErro}</p>}
        {d.avisos?.ultimoEnvio && !d.avisos.ultimoErro && <p className="mt-3 text-sm text-gray-600">Último aviso enviado {haQuanto(d.avisos.ultimoEnvio)}.</p>}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ Bling

/** Pedido de pareamento do vigia: aparece sozinho enquanto o instalador espera no PC. */
function PedidoDoVigia({ recarregar, avisar }: { recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [pedido, setPedido] = useState<{ id: string; codigo: string; maquina: string; criadoEm: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    let vivo = true;
    const olhar = async () => {
      const r = await pedidoDoVigiaAcao();
      if (vivo && r.ok) setPedido(r.dados ?? null);
    };
    void olhar();
    const t = setInterval(olhar, 4000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);
  if (!pedido) return null;
  return (
    <section className="rounded-lg border-2 border-[#E60012] bg-red-50 p-5">
      <h2 className="text-lg font-bold text-gray-900">O computador {pedido.maquina} quer ligar o vigia</h2>
      <p className="mt-1 text-sm text-gray-700">
        Confira se o código no computador é <b className="text-2xl tracking-widest">{pedido.codigo}</b>. Aprovar gera uma chave nova só para ele (a anterior para de valer).
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className={botaoPrimario}
          disabled={ocupado}
          onClick={async () => {
            setOcupado(true);
            const r = await aprovarVigiaAcao(pedido.id, pedido.codigo);
            setOcupado(false);
            if (!r.ok) return avisar("erro", r.erro);
            setPedido(null);
            avisar("ok", `Vigia de ${pedido.maquina} aprovado. Ele pega a chave em segundos.`);
            await recarregar();
          }}
        >
          {ocupado ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Aprovar
        </button>
        <button
          className={botaoSecundario}
          disabled={ocupado}
          onClick={async () => {
            await recusarVigiaAcao();
            setPedido(null);
          }}
        >
          Não reconheço
        </button>
      </div>
    </section>
  );
}

function AbaBling({ d, recarregar, avisar }: { d: Dados; recarregar: () => Promise<void>; avisar: (t: "ok" | "erro", m: string) => void }) {
  const [chave, setChave] = useState<string | null>(null);
  const [desde, setDesde] = useState(janela("mes").inicio);
  const v = d.vigia;
  const ligados = new Map(d.pilotos.filter((p) => p.blingVendedorId).map((p) => [p.blingVendedorId!, p.apelido || p.nome]));

  return (
    <div className="space-y-5">
      <PedidoDoVigia recarregar={recarregar} avisar={avisar} />
      <section className={cartao}>
        <div className="flex items-center gap-3">
          {v.online ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-orange-500" />}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{v.online ? "Bling ligado" : v.ultimaVez ? "O vigia parou de falar" : "Vigia ainda não instalado"}</h2>
            <p className="text-sm text-gray-600">
              Última conversa {haQuanto(v.ultimaVez)}
              {v.maquina && ` · computador ${v.maquina}`}
              {v.versao && ` · versão ${v.versao}`}
              {v.ultimaVez && ` · ${v.ultimoLote} documento(s) na última volta`}
            </p>
            {v.ultimoErro && <p className="mt-1 text-sm text-red-700">Último erro no PC: {v.ultimoErro}</p>}
          </div>
        </div>
        <div className="mt-4">
          {d.gaveta.tipo === "blob" || d.gaveta.tipo === "pasta" ? (
            <Aviso tipo="ok">A Arena guarda tudo no Blob da Vercel: não depende do banco da loja.{d.gaveta.importacaoPendente ? " (Ainda tentando trazer os pilotos do banco antigo.)" : ""}</Aviso>
          ) : (
            <Aviso tipo="erro">
              A Arena está guardando no banco da loja (reserva) e para quando a cota de conexões estoura. Crie o Blob na Vercel: projeto balao2026 → Storage → Create → Blob (Private, São Paulo) → Connect. Ela copia tudo sozinha.
            </Aviso>
          )}
        </div>
        <p className="mt-4 text-sm text-gray-700 max-w-3xl">
          O token do Bling só existe no seu PC (quem renova é a sentinela do Bionic), então quem busca as vendas e os orçamentos é o vigia, a cada 2 minutos,
          e entrega aqui. Pedido cancelado no Bling perde os pontos sozinho.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Instalar ou trocar a chave do vigia</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>No PC com o Bling (onde roda a sentinela do Bionic), rode o instalador abaixo. Ele mostra um código e espera.</li>
          <li>
            No PowerShell do PC da loja: <code className="rounded bg-gray-100 px-1">git -C $HOME\balao2026 pull</code> e depois{" "}
            <code className="rounded bg-gray-100 px-1">& $HOME\balao2026\scripts\arena-vigia\instalar.ps1</code>
          </li>
          <li>Aparece aqui em cima “O computador … quer ligar o vigia” com o mesmo código: clique em Aprovar. O instalador recebe a chave e cria a tarefa “Arena Vigia”. A primeira volta traz os últimos 3 meses.</li>
          <li>Sem acesso a este painel no PC? “Gerar chave do vigia” baixa a chave em arquivo; o instalador também lê dos Downloads.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={botaoPrimario}
            onClick={async () => {
              if (v.temChave && !confirm("Gerar chave nova? O vigia instalado para até você rodar o instalar.ps1 de novo.")) return;
              const r = await gerarChaveAcao();
              if (!r.ok) return avisar("erro", r.erro);
              const k = r.dados!;
              setChave(k);
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([k], { type: "text/plain" }));
              a.download = "arena-vigia-chave.txt";
              a.click();
              URL.revokeObjectURL(a.href);
              await recarregar();
            }}
          >
            <KeyRound size={16} /> Gerar chave do vigia
          </button>
        </div>
        {chave && (
          <div className="mt-3">
            <Aviso tipo="info">Chave baixada. Ela não aparece de novo depois que você sair desta tela.</Aviso>
          </div>
        )}
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Buscar de novo no Bling</h2>
        <p className="mt-1 text-sm text-gray-700">O vigia relê tudo desde a data na próxima volta (até 2 minutos). Use se um pedido antigo mudou de vendedor no Bling.</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label>
            <span className={rotulo}>Desde</span>
            <input className={campo} type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <button
            className={botaoSecundario}
            onClick={async () => {
              const r = await pedirVarreduraAcao(desde);
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", "Pedido anotado. O vigia busca na próxima volta.");
              await recarregar();
            }}
          >
            <RefreshCw size={16} /> Buscar desde essa data
          </button>
          <button
            className={botaoSecundario}
            onClick={async () => {
              const r = await recalcularAcao();
              if (!r.ok) return avisar("erro", r.erro);
              avisar("ok", `${r.dados} lançamento(s) recalculados.`);
              await recarregar();
            }}
          >
            <RotateCcw size={16} /> Recalcular pontos
          </button>
        </div>
        {v.varrerDesde && <p className="mt-2 text-sm text-gray-600">Aguardando o vigia buscar desde {dataBr(v.varrerDesde)}.</p>}
      </section>

      <section className={cartao}>
        <h2 className="text-lg font-bold text-gray-900">Vendedores do Bling</h2>
        {d.vendedoresBling.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">A lista chega na primeira volta do vigia.</p>
        ) : (
          <table className="mt-3 w-full text-sm text-gray-800">
            <tbody>
              {d.vendedoresBling.map((x) => (
                <tr key={x.id} className="border-t border-gray-100">
                  <td className="py-1.5 pr-3">{x.nome}</td>
                  <td className="py-1.5 pr-3 text-gray-500 tabular-nums">{x.id}</td>
                  <td className="py-1.5">{ligados.has(x.id) ? `kart de ${ligados.get(x.id)}` : <span className="text-orange-700">sem kart</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ página

export default function PainelArena() {
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("corrida");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const recarregar = useCallback(async () => {
    const r = await carregarPainel();
    if (!r.ok) return setErro(r.erro);
    setErro(null);
    setD(r.dados!);
  }, []);
  useEffect(() => {
    let vivo = true;
    carregarPainel().then((r) => {
      if (!vivo) return;
      if (!r.ok) return setErro(r.erro);
      setD(r.dados!);
    });
    return () => {
      vivo = false;
    };
  }, []);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);
  const avisar = useCallback((tipo: "ok" | "erro", texto: string) => setAviso({ tipo, texto }), []);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
              <Trophy className="text-[#E60012]" /> Arena de vendas
            </h1>
            <p className="text-sm text-gray-600">A corrida do telão: vendas e orçamentos do Bling viram pontos, e cada um corre até a própria meta.</p>
          </div>
          <a className={botaoSecundario} href="/arena" target="_blank" rel="noreferrer">
            <Monitor size={16} /> Abrir o telão
          </a>
        </header>

        {d && (d.gaveta.tipo === "banco" || d.gaveta.tipo === "memoria") && (
          <div className="mt-4">
            <Aviso tipo="erro">
              A Arena ainda depende do banco da loja. Para ela não cair junto quando a cota estoura, crie o Blob na Vercel (projeto balao2026 → Storage → Create → Blob, Private, São Paulo → Connect).{" "}
              <button className="font-semibold underline" onClick={() => setAba("bling")}>Ver detalhes</button>
            </Aviso>
          </div>
        )}
        {d && !d.vigia.online && (
          <div className="mt-4">
            <Aviso tipo="info">
              {d.vigia.ultimaVez ? `O vigia do Bling não fala com o site ${haQuanto(d.vigia.ultimaVez)}.` : "O Bling ainda não está ligado à Arena."}{" "}
              <button className="font-semibold underline" onClick={() => setAba("bling")}>Ver como ligar</button>
            </Aviso>
          </div>
        )}

        <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-gray-200" aria-label="Áreas da Arena">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${aba === a.id ? "border-[#E60012] text-[#E60012]" : "border-transparent text-gray-600 hover:text-gray-900"}`}
              aria-current={aba === a.id ? "page" : undefined}
            >
              {a.icone} {a.nome}
            </button>
          ))}
        </nav>

        {aviso && (
          <div className="mt-4">
            <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
          </div>
        )}

        <div className="mt-5">
          {erro && (
            <Aviso tipo="erro">
              {erro} <button className="ml-2 font-semibold underline" onClick={() => void recarregar()}>Tentar de novo</button>
            </Aviso>
          )}
          {!d && !erro && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" size={18} /> Carregando a Arena…
            </div>
          )}
          {d && aba === "corrida" && (
            <AbaCorrida
              d={d}
              salvar={async (c) => {
                const r = await salvarCorridaAcao(c);
                if (!r.ok) return avisar("erro", r.erro);
                avisar("ok", "Telão salvo.");
                await recarregar();
              }}
            />
          )}
          {d && aba === "pilotos" && <AbaPilotos d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "metas" && <AbaMetas key={JSON.stringify(d.corrida)} d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "pontos" && <AbaPontos d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "pedidos" && <AbaPedidos d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "premio" && <AbaPremio d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "turbo" && <AbaTurbo d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "avisos" && <AbaAvisos d={d} recarregar={recarregar} avisar={avisar} />}
          {d && aba === "bling" && <AbaBling d={d} recarregar={recarregar} avisar={avisar} />}
        </div>

        {d && aba === "corrida" && d.hall.some((h) => h.campeao) && (
          <section className={`${cartao} mt-5`}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Trophy size={18} className="text-[#E60012]" /> Hall da fama
            </h2>
            <ul className="mt-3 divide-y divide-gray-100 text-sm text-gray-800">
              {d.hall.filter((h) => h.campeao).map((h) => (
                <li key={h.rotulo} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-gray-600">{h.rotulo}</span>
                  <span>
                    <b>{h.campeao}</b> ({Math.round(h.pontos)} pts)
                    {h.chegaram.length > 0 && <span className="text-gray-500"> · cruzaram a linha: {h.chegaram.join(", ")}</span>}
                    {h.equipe.progresso >= 1 && <span className="ml-1 font-semibold text-green-700">· equipe bateu a meta</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

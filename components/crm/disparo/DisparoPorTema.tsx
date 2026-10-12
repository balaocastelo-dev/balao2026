"use client";

// Disparo por tema de conversa (aba "Disparo" do atendimento).
//
// A tela só escolhe e acompanha. Quem decide quem recebe, quando e quantos
// por dia é o servidor da VPS (whatsapp-server/crm/campanha.js): a lista sai
// do banco — não das conversas que por acaso estão carregadas aqui —, e o
// envio respeita seg a sáb das 9h às 18h, até 100 por dia, 40 a 120 s entre
// mensagens e o SAIR de cada cliente, conferido de novo antes de cada envio.
// Ver docs/disparo-por-tema.md.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FetchServidor = (caminho: string, init?: RequestInit) => Promise<Response>;

export type TemaDisparo = { chave: string; nome: string; contatos: number; recentes: number };
export type EtiquetaDisparo = { nome: string; cor: string; usos?: number };

export type PreviaDisparo = {
  total: number;
  amostra: { chatId: string; nome: string; primeiroNome: string | null; temas: string[] }[];
  teto: number;
  diasDeEnvio: number;
  exemplo: string | null;
};

export type CampanhaDisparo = {
  id: number;
  nome: string;
  texto: string;
  estado: "enviando" | "pausada" | "concluida" | "cancelada";
  filtro: { temasNomes: string[]; etiquetas: string[]; contatosEscolhidos: number | null };
  criadaPor: string | null;
  criadaEm: string;
  fim: string | null;
  total: number;
  enviados: number;
  falhas: number;
  pulados: number;
  pendentes: number;
};

export type SituacaoDisparo = {
  ligado: boolean;
  motivo: string;
  proximoPassoEm: string | null;
  janelaAberta: boolean;
  proximaAbertura: string;
  enviadosHoje: number;
  teto: number;
  conectado: boolean;
};

type Props = {
  /** Chamada ao servidor da VPS com o ingresso do painel. */
  fetchServidor: FetchServidor;
  avisar: (texto: string) => void;
  /** Etiquetas da tela de atendimento (por nome), além das cadastradas na loja. */
  etiquetasDaTela?: EtiquetaDisparo[];
  /** Muda quando o servidor avisa progresso de campanha (socket whatsapp:campanha). */
  sinal?: number;
};

const TEXTO_PADRAO =
  "Olá, {nome}! Tudo bem? Aqui é da Balão da Informática Castelo, em Campinas.\n\n" +
  "Separamos novidades e condições especiais pensando no que você conversou com a gente. Quer que eu te mande as opções?\n\n" +
  "É só responder aqui ou chamar: {whatsapp}";

const PERIODOS = [
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "3 meses" },
  { dias: 180, rotulo: "6 meses" },
  { dias: 365, rotulo: "1 ano" },
  { dias: 730, rotulo: "2 anos" },
];

const ROTULO_ESTADO: Record<CampanhaDisparo["estado"], { texto: string; classe: string }> = {
  enviando: { texto: "Enviando", classe: "bg-[#e7f6ec] text-[#0a6e3d]" },
  pausada: { texto: "Pausada", classe: "bg-[#fff4e5] text-[#b45309]" },
  concluida: { texto: "Concluída", classe: "bg-[#f0f2f5] text-[#5f6368]" },
  cancelada: { texto: "Cancelada", classe: "bg-[#fdecea] text-[#c5221f]" },
};

const numero = (n: number) => n.toLocaleString("pt-BR");
const quandoEmSP = (iso: string | null | undefined, comDia = true) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    ...(comDia ? { weekday: "short" as const, day: "2-digit" as const, month: "2-digit" as const } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DisparoPorTema({ fetchServidor, avisar, etiquetasDaTela = [], sinal = 0 }: Props) {
  const [temasDisponiveis, setTemasDisponiveis] = useState<TemaDisparo[]>([]);
  const [etiquetasDaLoja, setEtiquetasDaLoja] = useState<EtiquetaDisparo[]>([]);
  const [temas, setTemas] = useState<string[]>([]);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [dias, setDias] = useState(365);
  const [texto, setTexto] = useState(TEXTO_PADRAO);
  const [nome, setNome] = useState("");
  // A prévia (e a confirmação) valem para o filtro e o texto de quando foram
  // pedidas: mudou qualquer um dos dois, somem sozinhas.
  const [previaGuardada, setPreviaGuardada] = useState<{ chave: string; dados: PreviaDisparo } | null>(null);
  const [confirmandoChave, setConfirmandoChave] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"previa" | "teste" | "criar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [campanhas, setCampanhas] = useState<CampanhaDisparo[]>([]);
  const [situacao, setSituacao] = useState<SituacaoDisparo | null>(null);
  const [cancelarId, setCancelarId] = useState<number | null>(null);
  const [mudando, setMudando] = useState<number | null>(null);
  const campoTexto = useRef<HTMLTextAreaElement | null>(null);

  const chamar = useCallback(
    async <T,>(caminho: string, init: RequestInit = {}): Promise<T> => {
      const r = await fetchServidor(caminho, init);
      const j = await r.json().catch(() => ({}));
      if (r.status === 404) {
        throw new Error("O servidor da loja ainda não recebeu esta atualização. Rode o deploy na VPS e recarregue a página.");
      }
      if (!r.ok || j?.ok === false) throw new Error(j?.erro || `O servidor respondeu ${r.status}`);
      return j as T;
    },
    [fetchServidor]
  );

  const carregarCampanhas = useCallback(async () => {
    try {
      const j = await chamar<{ itens: CampanhaDisparo[]; laco: SituacaoDisparo }>("/api/comando/campanhas");
      setCampanhas(Array.isArray(j.itens) ? j.itens : []);
      setSituacao(j.laco || null);
    } catch {
      /* servidor sem o módulo: a lista fica vazia e o erro aparece ao agir */
    }
  }, [chamar]);

  useEffect(() => {
    chamar<{ itens: TemaDisparo[] }>("/api/comando/segmentos")
      .then((j) => setTemasDisponiveis(Array.isArray(j.itens) ? j.itens : []))
      .catch((e: Error) => setErro(e.message));
    chamar<{ itens: EtiquetaDisparo[] }>("/api/comando/etiquetas")
      .then((j) => setEtiquetasDaLoja(Array.isArray(j.itens) ? j.itens : []))
      .catch(() => {});
  }, [chamar]);

  // Progresso: o servidor avisa pelo socket (sinal) e, por garantia, a lista
  // é relida de tempos em tempos enquanto houver campanha andando.
  useEffect(() => {
    carregarCampanhas();
  }, [carregarCampanhas, sinal]);
  const algumaAndando = campanhas.some((c) => c.estado === "enviando");
  useEffect(() => {
    if (!algumaAndando) return;
    const t = setInterval(carregarCampanhas, 30_000);
    return () => clearInterval(t);
  }, [algumaAndando, carregarCampanhas]);

  // Etiquetas da loja e da tela, por nome (a mesma etiqueta não aparece duas vezes).
  const todasEtiquetas = useMemo(() => {
    const porNome = new Map<string, EtiquetaDisparo>();
    for (const e of [...etiquetasDaLoja, ...etiquetasDaTela]) {
      const chave = String(e?.nome || "").trim().toLowerCase();
      if (chave && !porNome.has(chave)) porNome.set(chave, e);
    }
    return [...porNome.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [etiquetasDaLoja, etiquetasDaTela]);

  const filtro = useMemo(() => ({ temas, etiquetas, conversouNosUltimosDias: dias }), [temas, etiquetas, dias]);
  const temFiltro = temas.length > 0 || etiquetas.length > 0;
  const chaveAtual = JSON.stringify({ filtro, texto });
  const previa = previaGuardada?.chave === chaveAtual ? previaGuardada.dados : null;
  const confirmando = confirmandoChave === chaveAtual;

  const alternar = (lista: string[], valor: string) =>
    lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];

  const inserirVariavel = (variavel: string) => {
    const campo = campoTexto.current;
    if (!campo) return setTexto((t) => `${t}${variavel}`);
    const ini = campo.selectionStart ?? texto.length;
    const fim = campo.selectionEnd ?? texto.length;
    const novo = texto.slice(0, ini) + variavel + texto.slice(fim);
    setTexto(novo);
    requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(ini + variavel.length, ini + variavel.length);
    });
  };

  const json = (corpo: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(corpo) });

  const buscarPrevia = async () => {
    const chave = chaveAtual;
    const p = await chamar<PreviaDisparo>("/api/comando/campanhas/previa", json({ filtro, texto }));
    setPreviaGuardada({ chave, dados: p });
    return p;
  };

  const verPrevia = async () => {
    setErro(null);
    setOcupado("previa");
    try {
      await buscarPrevia();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  const enviarTeste = async () => {
    setErro(null);
    setOcupado("teste");
    try {
      const r = await chamar<{ enviados: number; resultado: { numero: string; ok: boolean; erro?: string }[] }>(
        "/api/comando/campanhas/teste",
        json({ texto })
      );
      const falhas = (r.resultado || []).filter((x) => !x.ok);
      avisar(
        falhas.length
          ? `Teste: ${r.enviados} enviado(s), ${falhas.length} com erro (${falhas[0].erro || "sem detalhe"}).`
          : `Teste enviado para os seus ${r.enviados} números. Confira no celular.`
      );
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  const pedirConfirmacao = async () => {
    setErro(null);
    setOcupado("previa");
    try {
      const p = previa || (await buscarPrevia());
      if (!p.total) {
        setErro("Nenhum contato com esse filtro. Escolha outro tema ou aumente o período.");
        return;
      }
      setConfirmandoChave(chaveAtual);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  const iniciar = async () => {
    setErro(null);
    setOcupado("criar");
    try {
      const r = await chamar<{ campanha: CampanhaDisparo }>(
        "/api/comando/campanhas",
        json({ nome: nome.trim() || undefined, texto, filtro })
      );
      avisar(`📢 Campanha "${r.campanha.nome}" criada: ${numero(r.campanha.total)} contato(s) na fila.`);
      setConfirmandoChave(null);
      setPreviaGuardada(null);
      setNome("");
      await carregarCampanhas();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  };

  const mudar = async (id: number, acao: "pausar" | "retomar" | "cancelar") => {
    setErro(null);
    setMudando(id);
    try {
      await chamar(`/api/comando/campanhas/${id}/${acao}`, { method: "POST" });
      setCancelarId(null);
      await carregarCampanhas();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setMudando(null);
    }
  };

  const linhaDaSituacao = (() => {
    if (!situacao) return null;
    const hoje = `Hoje: ${numero(situacao.enviadosHoje)} de ${numero(situacao.teto)}`;
    if (!situacao.conectado) return `${hoje} · WhatsApp desconectado: o envio espera a conexão voltar.`;
    if (!situacao.janelaAberta) return `${hoje} · Fora do horário: volta ${quandoEmSP(situacao.proximaAbertura)}.`;
    if (situacao.enviadosHoje >= situacao.teto) return `${hoje} · Teto do dia atingido: volta no próximo dia útil às 9h.`;
    if (algumaAndando && situacao.proximoPassoEm) return `${hoje} · Próximo envio por volta de ${quandoEmSP(situacao.proximoPassoEm, false)}.`;
    return hoje;
  })();

  return (
    <div className="space-y-3">
      <div className="bg-[#fff4e5] border border-[#ffcc80] rounded-xl p-2.5 text-[11px] text-[#e65100] leading-snug">
        ⚠️ <b>Envio cadenciado e LGPD:</b> seg a sáb, das 9h às 18h, até 100 por dia, de 40 a 120 s entre
        mensagens. Quem pediu SAIR, bloqueados, grupos e quem recebeu campanha nos últimos 7 dias ficam de fora
        sozinhos.
      </div>

      {/* Temas */}
      <div>
        <div className="text-xs font-bold text-[#202124] mb-1">Tema da conversa</div>
        {temasDisponiveis.length === 0 ? (
          <p className="text-[11px] text-[#5f6368]">Carregando temas…</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {temasDisponiveis.map((t) => {
              const ligado = temas.includes(t.chave);
              return (
                <button
                  key={t.chave}
                  type="button"
                  aria-pressed={ligado}
                  onClick={() => setTemas((l) => alternar(l, t.chave))}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    ligado
                      ? "border-[#0f9d58] bg-[#e7f6ec] text-[#0a6e3d]"
                      : "border-[#e3e3e3] bg-white text-[#202124] hover:border-[#0f9d58]"
                  }`}
                >
                  {t.nome} <span className="tabular-nums text-[#5f6368] font-normal">· {numero(t.contatos)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Etiquetas (opcional) */}
      {todasEtiquetas.length > 0 && (
        <div>
          <div className="text-xs font-bold text-[#202124] mb-1">
            Etiquetas <span className="font-normal text-[#5f6368]">(opcional — junto com o tema, precisa ter as duas coisas)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {todasEtiquetas.map((e) => {
              const ligada = etiquetas.includes(e.nome);
              return (
                <button
                  key={e.nome}
                  type="button"
                  aria-pressed={ligada}
                  onClick={() => setEtiquetas((l) => alternar(l, e.nome))}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    ligada ? "border-[#0f9d58] bg-[#e7f6ec] text-[#0a6e3d]" : "border-[#e3e3e3] bg-white text-[#202124] hover:border-[#0f9d58]"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: e.cor || "#5f6368" }} />
                  {e.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="flex items-center justify-between gap-2 text-xs font-bold text-[#202124]">
        Conversou com a loja nos últimos
        <select
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          className="p-1.5 border border-[#e3e3e3] rounded-lg text-xs font-normal bg-white"
        >
          {PERIODOS.map((p) => (
            <option key={p.dias} value={p.dias}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </label>

      {/* Texto */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="disparo-texto" className="text-xs font-bold text-[#202124]">
            Mensagem
          </label>
          <div className="flex gap-1">
            {["{nome}", "{whatsapp}"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => inserirVariavel(v)}
                className="cursor-pointer rounded-md bg-[#f0f2f5] hover:bg-[#e7f6ec] px-1.5 py-0.5 text-[10px] font-mono text-[#0a6e3d]"
              >
                + {v}
              </button>
            ))}
          </div>
        </div>
        <textarea
          id="disparo-texto"
          ref={campoTexto}
          rows={6}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full p-2 border border-[#e3e3e3] rounded-xl text-xs bg-white outline-none focus:border-[#0f9d58]"
        />
        <p className="text-[10px] text-[#5f6368] leading-snug">
          {"{nome}"} vira o primeiro nome do cliente (sem nome, sai do texto). {"{whatsapp}"} vira o link da loja. A
          linha &ldquo;Para não receber mais, responda SAIR.&rdquo; entra sozinha no fim.
        </p>
      </div>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da campanha (opcional)"
        maxLength={80}
        className="w-full p-2 border border-[#e3e3e3] rounded-xl text-xs bg-white outline-none focus:border-[#0f9d58]"
      />

      {erro && <p className="text-xs text-red-600 font-semibold">⛔ {erro}</p>}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={verPrevia}
          disabled={!temFiltro || ocupado !== null}
          className="py-2 rounded-xl text-xs font-bold border border-[#e3e3e3] bg-white hover:bg-[#f0f2f5] disabled:opacity-50 cursor-pointer"
        >
          {ocupado === "previa" ? "Contando…" : "👁 Ver prévia"}
        </button>
        <button
          type="button"
          onClick={enviarTeste}
          disabled={!texto.trim() || ocupado !== null}
          className="py-2 rounded-xl text-xs font-bold border border-[#e3e3e3] bg-white hover:bg-[#f0f2f5] disabled:opacity-50 cursor-pointer"
        >
          {ocupado === "teste" ? "Enviando…" : "📱 Enviar teste para meus números"}
        </button>
      </div>

      {previa && (
        <div className="rounded-xl border border-[#e3e3e3] bg-[#f7f8fa] p-2.5 space-y-2" aria-label="Prévia do disparo">
          <div className="text-xs text-[#202124]">
            <b className="text-base tabular-nums text-[#0a6e3d]">{numero(previa.total)}</b> contato(s) recebem
            {previa.total > 0 && (
              <span className="text-[#5f6368]">
                {" "}
                · ~{previa.diasDeEnvio} dia(s) de envio no teto de {previa.teto}/dia
              </span>
            )}
          </div>
          {previa.amostra.length > 0 && (
            <ul className="space-y-1">
              {previa.amostra.map((a) => (
                <li key={a.chatId} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-semibold text-[#202124]">{a.nome}</span>
                  <span className="truncate text-[#5f6368]">{a.temas.join(", ")}</span>
                </li>
              ))}
            </ul>
          )}
          {previa.exemplo && (
            <div>
              <div className="text-[10px] font-bold text-[#5f6368] mb-0.5">
                Como chega{previa.amostra[0]?.primeiroNome ? ` para ${previa.amostra[0].primeiroNome}` : ""}:
              </div>
              <p className="whitespace-pre-wrap rounded-lg bg-[#dcf8c6] p-2 text-[11px] text-[#202124]">{previa.exemplo}</p>
            </div>
          )}
        </div>
      )}

      {confirmando && previa ? (
        <div className="rounded-xl border border-[#0f9d58] bg-[#e7f6ec] p-2.5 space-y-2" role="alertdialog" aria-label="Confirmar campanha">
          <p className="text-xs text-[#202124] leading-snug">
            Vai para <b>{numero(previa.total)}</b> contato(s). No teto de {previa.teto} por dia (seg a sáb, 9h às 18h),
            leva cerca de <b>{previa.diasDeEnvio} dia(s) de envio</b>. Pode pausar ou cancelar a qualquer momento.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmandoChave(null)}
              disabled={ocupado !== null}
              className="flex-1 py-2 rounded-xl text-xs font-bold border border-[#e3e3e3] bg-white hover:bg-[#f0f2f5] cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={iniciar}
              disabled={ocupado !== null}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#0f9d58] hover:bg-[#0a6e3d] text-white disabled:opacity-50 cursor-pointer"
            >
              {ocupado === "criar" ? "Criando…" : "Confirmar e iniciar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pedirConfirmacao}
          disabled={!temFiltro || !texto.trim() || ocupado !== null}
          className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          📢 Iniciar campanha
        </button>
      )}

      {/* Campanhas */}
      <div className="pt-1 border-t border-[#e3e3e3] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#202124]">Campanhas</div>
          <button type="button" onClick={carregarCampanhas} className="text-[11px] text-[#0a6e3d] hover:underline cursor-pointer">
            Atualizar
          </button>
        </div>
        {linhaDaSituacao && <p className="text-[11px] text-[#5f6368]">{linhaDaSituacao}</p>}
        {campanhas.length === 0 ? (
          <p className="text-[11px] text-[#5f6368]">Nenhuma campanha ainda.</p>
        ) : (
          <ul className="space-y-2">
            {campanhas.map((c) => {
              const feitos = c.enviados + c.falhas + c.pulados;
              const pct = c.total ? Math.round((feitos / c.total) * 100) : 0;
              const rotulo = ROTULO_ESTADO[c.estado] || ROTULO_ESTADO.concluida;
              const podeCancelar = c.estado === "enviando" || c.estado === "pausada";
              return (
                <li key={c.id} className="rounded-xl border border-[#e3e3e3] bg-white p-2.5 space-y-1.5" aria-label={`Campanha ${c.nome}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#202124] truncate" title={c.texto}>
                        {c.nome}
                      </div>
                      <div className="text-[10px] text-[#5f6368]">
                        {quandoEmSP(c.criadaEm)}
                        {c.criadaPor ? ` · ${c.criadaPor}` : ""}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${rotulo.classe}`}>{rotulo.texto}</span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full bg-[#f0f2f5] overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={c.total}
                    aria-valuenow={feitos}
                    aria-label={`${feitos} de ${c.total}`}
                  >
                    <div className="h-full bg-[#0f9d58] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-[#5f6368] tabular-nums">
                    <b className="text-[#202124]">{numero(c.enviados)}</b> de {numero(c.total)} enviadas
                    {c.pulados ? ` · ${numero(c.pulados)} pulada(s)` : ""}
                    {c.falhas ? ` · ${numero(c.falhas)} com erro` : ""}
                    {c.estado === "enviando" || c.estado === "pausada" ? ` · ${numero(c.pendentes)} na fila` : ""}
                  </div>
                  {(c.estado === "enviando" || c.estado === "pausada") && (
                    <div className="flex gap-1.5">
                      {c.estado === "enviando" ? (
                        <button
                          type="button"
                          onClick={() => mudar(c.id, "pausar")}
                          disabled={mudando === c.id}
                          className="flex-1 py-1 rounded-lg text-[11px] font-bold border border-[#e3e3e3] bg-white hover:bg-[#f0f2f5] disabled:opacity-50 cursor-pointer"
                        >
                          ⏸ Pausar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => mudar(c.id, "retomar")}
                          disabled={mudando === c.id}
                          className="flex-1 py-1 rounded-lg text-[11px] font-bold border border-[#0f9d58] text-[#0a6e3d] bg-white hover:bg-[#e7f6ec] disabled:opacity-50 cursor-pointer"
                        >
                          ▶ Retomar
                        </button>
                      )}
                      {podeCancelar &&
                        (cancelarId === c.id ? (
                          <button
                            type="button"
                            onClick={() => mudar(c.id, "cancelar")}
                            disabled={mudando === c.id}
                            className="flex-1 py-1 rounded-lg text-[11px] font-bold bg-[#c5221f] text-white hover:bg-[#a50e0e] disabled:opacity-50 cursor-pointer"
                          >
                            Confirmar cancelamento
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCancelarId(c.id)}
                            className="flex-1 py-1 rounded-lg text-[11px] font-bold border border-[#e3e3e3] text-[#c5221f] bg-white hover:bg-[#fdecea] cursor-pointer"
                          >
                            ✕ Cancelar
                          </button>
                        ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

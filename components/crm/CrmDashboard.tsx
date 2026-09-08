"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  GraficoDeAnel,
  GraficoDeBarras,
  GraficoDeLinhas,
  GraficoPorHora,
  NumeroAnimado,
  PontoSerie,
} from "./Graficos";

// ============================================================
// Dashboard da administração (/crm).
//
// Tudo aqui vem do whatsapp-server pelo mesmo socket que o atendimento usa —
// os números são os do servidor, recalculados a cada 20 segundos e a cada
// alteração. Nada é estimado no navegador: se um valor está errado na tela,
// o lugar de olhar é `whatsapp-server/metricas.js`.
// ============================================================

interface VendedorMetrica {
  id: string;
  nome: string;
  slug: string;
  cargo: string;
  ativo: boolean;
  protegido: boolean;
  comissaoPercentual: number;
  meta: number;
  conversas: number;
  conversasAtivas7d: number;
  conversasSemResposta: number;
  mensagensEnviadas: number;
  mensagensHoje: number;
  mensagensSemana: number;
  vendas: number;
  faturamento: number;
  faturamentoMes: number;
  comissao: number;
  ticketMedio: number;
  progressoMeta: number | null;
}

interface Metricas {
  geradoEm: number;
  clientes: {
    total: number;
    novosHoje: number;
    novos7d: number;
    ativos24h: number;
    ativos7d: number;
    semResposta: number;
    semRespostaAtribuidas: number;
    semDono: number;
    naoLidas: number;
  };
  mensagens: {
    total: number;
    recebidas: number;
    enviadas: number;
    recebidasHoje: number;
    enviadasHoje: number;
    respostaPorMensagem: number;
  };
  vendas: {
    quantidade: number;
    faturamento: number;
    faturamentoMes: number;
    faturamentoHoje: number;
    comissaoTotal: number;
    ticketMedio: number;
  };
  serie: PontoSerie[];
  porHora: { hora: number; recebidas: number; enviadas: number }[];
  vendedores: VendedorMetrica[];
  funil: { id: string; nome: string; cor: string; total: number }[];
}

interface Venda {
  id: string;
  vendedorId: string;
  cliente: string;
  produto: string;
  valor: number;
  comissaoPercentual: number;
  data: number;
  observacao?: string;
}

interface VendedorCadastro {
  id: string;
  nome: string;
  slug: string;
  cargo: string;
  comissaoPercentual: number;
  meta: number;
  ativo: boolean;
  protegido: boolean;
  temAcessoProprio: boolean;
}

/**
 * Endereço de página a partir do nome, igual ao que o servidor faz.
 *
 * Precisa bater: a senha do vendedor é derivada do slug, então divergir aqui
 * geraria um acesso que nunca abre.
 */
export function montarSlug(texto: string) {
  return String(texto || "")
    .normalize("NFD")
    // Faixa das marcas de acento (U+0300–U+036F), que o NFD acabou de separar.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Token de sessão do vendedor — sha256 de slug + senha.
 *
 * A senha NUNCA sai do navegador: o servidor guarda e compara só o token.
 * Tem que ser idêntico ao `buildToken()` de lib/vendedor-auth.ts, senão o
 * vendedor cadastrado aqui não consegue entrar na página dele.
 */
async function calcularToken(slug: string, senha: string) {
  const dados = new TextEncoder().encode(`${slug}:${senha}:balao-vendedor`);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const dinheiro = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CrmDashboard() {
  const serverUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

  const socketRef = useRef<Socket | null>(null);
  const [conectado, setConectado] = useState(false);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendedores, setVendedores] = useState<VendedorCadastro[]>([]);
  const [aba, setAba] = useState<"visao" | "equipe" | "comissoes">("visao");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const mostrarAviso = useCallback((tipo: "ok" | "erro", texto: string) => {
    setAviso({ tipo, texto });
    window.setTimeout(() => setAviso(null), 6000);
  }, []);

  useEffect(() => {
    const socket = io(serverUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConectado(true);
      socket.emit("panel:bootstrap");
    });
    socket.on("disconnect", () => setConectado(false));
    socket.on("whatsapp:metricas", (m: Metricas) => setMetricas(m));
    socket.on("whatsapp:vendas", (v: Venda[]) => setVendas(Array.isArray(v) ? v : []));
    socket.on("whatsapp:vendedores", (v: VendedorCadastro[]) =>
      setVendedores(Array.isArray(v) ? v : [])
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  const vendedoresPorId = useMemo(
    () => new Map(vendedores.map((v) => [v.id, v])),
    [vendedores]
  );

  const atualizadoEm = metricas
    ? new Date(metricas.geradoEm).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    // Rolagem própria: o /crm é uma tela de trabalho que ocupa o viewport
    // inteiro (`overflow-hidden` no LayoutWrapper), então o painel precisa
    // rolar por dentro — senão a metade de baixo fica inalcançável.
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white lg:text-3xl">Painel da loja</h1>
            <p className="mt-1 text-sm text-slate-400">
              Balão da Informática Castelo · números do atendimento em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold ${
                conectado
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  conectado ? "animate-pulse bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {conectado ? "Ao vivo" : "Reconectando…"}
            </span>
            <span className="text-slate-500">Atualizado às {atualizadoEm}</span>
          </div>
        </header>

        {aviso && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              aviso.tipo === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        <nav className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(
            [
              ["visao", "Visão geral"],
              ["equipe", "Vendedores"],
              ["comissoes", "Vendas e comissão"],
            ] as const
          ).map(([id, rotulo]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                aba === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </nav>

        {!metricas ? (
          <CarregandoPainel conectado={conectado} servidor={serverUrl} />
        ) : aba === "visao" ? (
          <VisaoGeral metricas={metricas} />
        ) : aba === "equipe" ? (
          <AbaEquipe
            metricas={metricas}
            vendedores={vendedores}
            socket={socketRef.current}
            avisar={mostrarAviso}
          />
        ) : (
          <AbaComissoes
            metricas={metricas}
            vendas={vendas}
            vendedoresPorId={vendedoresPorId}
            socket={socketRef.current}
            avisar={mostrarAviso}
          />
        )}
      </div>
    </div>
  );
}

function CarregandoPainel({ conectado, servidor }: { conectado: boolean; servidor: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-sky-400" />
      <p className="text-sm text-slate-300">
        {conectado ? "Calculando os números…" : "Procurando o servidor de atendimento…"}
      </p>
      {!conectado && (
        // Diz onde ele está tentando falar: quase sempre o problema é o
        // servidor fora do ar ou o endereço errado na variável de ambiente.
        <p className="mt-2 font-mono text-xs text-slate-500">{servidor}</p>
      )}
    </div>
  );
}

// ---------- Visão geral ----------

function VisaoGeral({ metricas }: { metricas: Metricas }) {
  const { clientes, mensagens, vendas, serie, porHora, funil, vendedores } = metricas;

  const rankingFaturamento = vendedores
    .filter((v) => v.faturamento > 0)
    .map((v) => ({ id: v.id, nome: v.nome, total: v.faturamento, cor: "#34d399" }));

  const rankingAtendimento = vendedores
    .filter((v) => v.mensagensEnviadas > 0)
    .sort((a, b) => b.mensagensEnviadas - a.mensagensEnviadas)
    .map((v) => ({ id: v.id, nome: v.nome, total: v.mensagensEnviadas, cor: "#38bdf8" }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao
          rotulo="Clientes na caixa"
          valor={clientes.total}
          detalhe={`${clientes.ativos24h} com movimento hoje`}
          cor="sky"
        />
        <Cartao
          rotulo="Esperando resposta"
          valor={clientes.semResposta}
          detalhe={
            clientes.semResposta > 0
              ? "última mensagem é do cliente"
              : "ninguém na fila — tudo respondido"
          }
          cor={clientes.semResposta > 0 ? "amber" : "emerald"}
        />
        <Cartao
          rotulo="Clientes novos hoje"
          valor={clientes.novosHoje}
          detalhe={`${clientes.novos7d} nos últimos 7 dias`}
          cor="violet"
        />
        <Cartao
          rotulo="Faturamento no mês"
          valor={vendas.faturamentoMes}
          formato="dinheiro"
          detalhe={`${vendas.quantidade} venda(s) lançada(s) no total`}
          cor="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Painel titulo="Conversas por dia" className="lg:col-span-2">
          <GraficoDeLinhas serie={serie} />
        </Painel>

        <Painel titulo="Funil de vendas">
          <GraficoDeAnel
            itens={funil}
            centroRotulo="clientes no funil"
            centroValor={funil.reduce((s, f) => s + f.total, 0)}
          />
        </Painel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Painel titulo="Movimento por hora (24h)">
          <GraficoPorHora dados={porHora} />
        </Painel>

        <Painel titulo="Faturamento por vendedor">
          <GraficoDeBarras itens={rankingFaturamento} formato="dinheiro" />
        </Painel>

        <Painel titulo="Mensagens enviadas por vendedor">
          <GraficoDeBarras itens={rankingAtendimento} />
        </Painel>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao rotulo="Mensagens recebidas" valor={mensagens.recebidas} detalhe={`${mensagens.recebidasHoje} hoje`} cor="sky" />
        <Cartao rotulo="Mensagens enviadas" valor={mensagens.enviadas} detalhe={`${mensagens.enviadasHoje} hoje`} cor="emerald" />
        <Cartao
          rotulo="Respostas por mensagem"
          valor={mensagens.respostaPorMensagem}
          formato="decimal"
          detalhe={
            mensagens.respostaPorMensagem < 1
              ? "entra mais do que sai"
              : "a equipe está acompanhando"
          }
          cor={mensagens.respostaPorMensagem < 1 ? "amber" : "emerald"}
        />
        <Cartao
          rotulo="Ticket médio"
          valor={vendas.ticketMedio}
          formato="dinheiro"
          detalhe="por venda lançada"
          cor="violet"
        />
      </div>

      <p className="text-xs text-slate-500">
        Os números de conversa vêm do que o servidor já carregou do WhatsApp — o histórico entra aos
        poucos, então &ldquo;clientes novos&rdquo; pode aumentar quando um pedaço antigo chega.
        Faturamento e comissão vêm das vendas lançadas na aba ao lado.
      </p>
    </div>
  );
}

function Cartao({
  rotulo,
  valor,
  detalhe,
  formato = "inteiro",
  cor = "sky",
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
  formato?: "inteiro" | "dinheiro" | "decimal";
  cor?: "sky" | "emerald" | "amber" | "violet";
}) {
  const cores = {
    sky: "from-sky-500/15 text-sky-300",
    emerald: "from-emerald-500/15 text-emerald-300",
    amber: "from-amber-500/15 text-amber-300",
    violet: "from-violet-500/15 text-violet-300",
  }[cor];

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br to-transparent p-4 ${cores.split(" ")[0]}`}
    >
      <div className="text-xs uppercase tracking-wider text-slate-400">{rotulo}</div>
      <div className={`mt-1.5 text-2xl font-bold lg:text-3xl ${cores.split(" ")[1]}`}>
        <NumeroAnimado valor={valor} formato={formato} />
      </div>
      {detalhe && <div className="mt-1 text-xs text-slate-400">{detalhe}</div>}
    </div>
  );
}

function Painel({
  titulo,
  children,
  className,
  acao,
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
  acao?: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className || ""}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

// ---------- Vendedores ----------

const FORMULARIO_VAZIO = {
  id: "",
  nome: "",
  cargo: "Vendas",
  comissaoPercentual: "3",
  meta: "",
  senha: "",
  ativo: true,
};

function AbaEquipe({
  metricas,
  vendedores,
  socket,
  avisar,
}: {
  metricas: Metricas;
  vendedores: VendedorCadastro[];
  socket: Socket | null;
  avisar: (tipo: "ok" | "erro", texto: string) => void;
}) {
  const [form, setForm] = useState(FORMULARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(form.id);
  const slugPrevisto = montarSlug(form.nome);

  const editar = (v: VendedorMetrica) => {
    setForm({
      id: v.id,
      nome: v.nome,
      cargo: v.cargo || "Vendas",
      comissaoPercentual: String(v.comissaoPercentual ?? 0),
      meta: v.meta ? String(v.meta) : "",
      senha: "",
      ativo: v.ativo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const salvar = async () => {
    if (!socket) return avisar("erro", "Sem conexão com o servidor de atendimento.");
    if (!form.nome.trim()) return avisar("erro", "Informe o nome do vendedor.");
    if (!editando && !form.senha) return avisar("erro", "Defina a senha de acesso do vendedor.");
    if (form.senha && form.senha.length < 6) {
      return avisar("erro", "A senha precisa ter pelo menos 6 caracteres.");
    }

    setSalvando(true);
    try {
      // A senha vira token aqui e o servidor só recebe o token — a senha em si
      // não trafega nem é gravada em lugar nenhum.
      const tokenSessao = form.senha ? await calcularToken(slugPrevisto, form.senha) : null;

      socket.emit(
        "panel:salvar-vendedor",
        {
          id: form.id || null,
          nome: form.nome.trim(),
          slug: slugPrevisto,
          cargo: form.cargo.trim(),
          comissaoPercentual: Number(form.comissaoPercentual) || 0,
          meta: Number(form.meta) || 0,
          ativo: form.ativo,
          tokenSessao,
        },
        (res: { ok?: boolean; erro?: string; slug?: string }) => {
          setSalvando(false);
          if (!res?.ok) return avisar("erro", res?.erro || "Não consegui salvar.");
          avisar(
            "ok",
            editando
              ? `${form.nome} atualizado.`
              : `${form.nome} cadastrado. A página de acesso é www.balao.info/equipe/${res.slug}`
          );
          setForm(FORMULARIO_VAZIO);
        }
      );
    } catch {
      setSalvando(false);
      avisar("erro", "Não consegui preparar a senha neste navegador.");
    }
  };

  const remover = (v: VendedorMetrica) => {
    if (!socket) return;
    if (v.protegido) {
      return avisar(
        "erro",
        `${v.nome} entra pela página fixa do site. Para tirar o acesso, remova o registro em lib/vendedores.ts e publique.`
      );
    }
    if (
      !window.confirm(
        `Remover ${v.nome}? O funil pessoal dele é apagado. As vendas já lançadas continuam no histórico de comissão.`
      )
    ) {
      return;
    }
    socket.emit("panel:remove-vendedor", { id: v.id });
    avisar("ok", `${v.nome} removido.`);
  };

  const cadastroPorId = new Map(vendedores.map((v) => [v.id, v]));

  return (
    <div className="flex flex-col gap-4">
      <Painel titulo={editando ? `Editando ${form.nome}` : "Cadastrar vendedor"}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Campo rotulo="Nome">
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex.: Ana Paula"
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Cargo">
            <input
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Comissão (%)">
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.comissaoPercentual}
              onChange={(e) => setForm({ ...form, comissaoPercentual: e.target.value })}
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Meta mensal (R$) — opcional">
            <input
              type="number"
              min={0}
              step="100"
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
              placeholder="Sem meta"
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo={editando ? "Nova senha (deixe vazio para manter)" : "Senha de acesso"}>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className={estiloInput}
              autoComplete="new-password"
            />
          </Campo>
          <Campo rotulo="Situação">
            <label className="flex h-[38px] items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                className="h-4 w-4 accent-emerald-500"
              />
              Pode entrar e atender
            </label>
          </Campo>
        </div>

        {form.nome && (
          <p className="mt-3 text-xs text-slate-400">
            Página de acesso:{" "}
            <span className="font-mono text-sky-300">www.balao.info/equipe/{slugPrevisto}</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={salvar} disabled={salvando} className={estiloBotaoPrimario}>
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar vendedor"}
          </button>
          {editando && (
            <button onClick={() => setForm(FORMULARIO_VAZIO)} className={estiloBotaoNeutro}>
              Cancelar
            </button>
          )}
        </div>
      </Painel>

      <Painel titulo="Equipe e desempenho">
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3">Vendedor</th>
                <th className="pb-2 pr-3 text-right">Clientes</th>
                <th className="pb-2 pr-3 text-right">Esperando</th>
                <th className="pb-2 pr-3 text-right">Enviadas (7d)</th>
                <th className="pb-2 pr-3 text-right">Vendas</th>
                <th className="pb-2 pr-3 text-right">Faturamento</th>
                <th className="pb-2 pr-3 text-right">Comissão</th>
                <th className="pb-2 pr-3">Meta do mês</th>
                <th className="pb-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {metricas.vendedores.map((v) => {
                const cadastro = cadastroPorId.get(v.id);
                return (
                  <tr key={v.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{v.nome}</span>
                        {!v.ativo && (
                          <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                            desativado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {v.cargo || "Vendas"} ·{" "}
                        <span className="font-mono">
                          /{cadastro?.temAcessoProprio ? `equipe/${v.slug}` : v.slug}
                        </span>
                        {" · "}
                        {v.comissaoPercentual}% de comissão
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{v.conversas}</td>
                    <td
                      className={`py-2.5 pr-3 text-right tabular-nums ${
                        v.conversasSemResposta > 0 ? "font-semibold text-amber-300" : "text-slate-400"
                      }`}
                    >
                      {v.conversasSemResposta}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{v.mensagensSemana}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{v.vendas}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-emerald-300">
                      {dinheiro(v.faturamento)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-sky-300">
                      {dinheiro(v.comissao)}
                    </td>
                    <td className="py-2.5 pr-3">
                      {v.progressoMeta === null ? (
                        <span className="text-xs text-slate-600">sem meta</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-[width] duration-700"
                              style={{ width: `${Math.min(100, v.progressoMeta)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-slate-400">
                            {v.progressoMeta}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => editar(v)} className={estiloBotaoMini}>
                        Editar
                      </button>
                      {!v.protegido && (
                        <button
                          onClick={() => remover(v)}
                          className={`${estiloBotaoMini} ml-1 text-red-300 hover:bg-red-500/15`}
                        >
                          Remover
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!metricas.vendedores.length && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-slate-500">
                    Nenhum vendedor cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Os vendedores da equipe fixa (Thiago, Marcos, Julia, Gabriel, Wendell, Brendon) entram
          pela página própria — <span className="font-mono">/nome</span> — e a senha deles fica em
          variável de ambiente. Aqui dá para ajustar comissão e meta; a senha se troca na
          hospedagem. Quem for cadastrado nesta tela entra por{" "}
          <span className="font-mono">/equipe/nome</span>.
        </p>
      </Painel>
    </div>
  );
}

// ---------- Vendas e comissão ----------

function AbaComissoes({
  metricas,
  vendas,
  vendedoresPorId,
  socket,
  avisar,
}: {
  metricas: Metricas;
  vendas: Venda[];
  vendedoresPorId: Map<string, VendedorCadastro>;
  socket: Socket | null;
  avisar: (tipo: "ok" | "erro", texto: string) => void;
}) {
  const [form, setForm] = useState({
    vendedorId: "",
    cliente: "",
    produto: "",
    valor: "",
    observacao: "",
  });

  const lancar = () => {
    if (!socket) return avisar("erro", "Sem conexão com o servidor de atendimento.");
    const valor = Number(String(form.valor).replace(",", "."));
    if (!form.vendedorId) return avisar("erro", "Escolha o vendedor.");
    if (!Number.isFinite(valor) || valor <= 0) return avisar("erro", "Informe um valor válido.");

    socket.emit(
      "panel:registrar-venda",
      { ...form, valor },
      (res: { ok?: boolean; erro?: string }) => {
        if (!res?.ok) return avisar("erro", res?.erro || "Não consegui lançar a venda.");
        avisar("ok", "Venda lançada.");
        setForm({ vendedorId: form.vendedorId, cliente: "", produto: "", valor: "", observacao: "" });
      }
    );
  };

  const remover = (venda: Venda) => {
    if (!socket) return;
    if (!window.confirm(`Remover a venda de ${dinheiro(venda.valor)}? Isso altera a comissão apurada.`)) {
      return;
    }
    socket.emit("panel:remover-venda", { id: venda.id });
  };

  const ordenadas = [...vendas].sort((a, b) => b.data - a.data);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao rotulo="Faturamento total" valor={metricas.vendas.faturamento} formato="dinheiro" cor="emerald" />
        <Cartao rotulo="Últimos 30 dias" valor={metricas.vendas.faturamentoMes} formato="dinheiro" cor="sky" />
        <Cartao rotulo="Comissão apurada" valor={metricas.vendas.comissaoTotal} formato="dinheiro" cor="violet" />
        <Cartao
          rotulo="Vendas lançadas"
          valor={metricas.vendas.quantidade}
          detalhe={`ticket médio ${dinheiro(metricas.vendas.ticketMedio)}`}
          cor="amber"
        />
      </div>

      <Painel titulo="Lançar venda">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Campo rotulo="Vendedor">
            <select
              value={form.vendedorId}
              onChange={(e) => setForm({ ...form, vendedorId: e.target.value })}
              className={estiloInput}
            >
              <option value="">Escolha…</option>
              {metricas.vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} ({v.comissaoPercentual}%)
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Cliente">
            <input
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Produto">
            <input
              value={form.produto}
              onChange={(e) => setForm({ ...form, produto: e.target.value })}
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Valor (R$)">
            <input
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="0,00"
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Observação">
            <input
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              className={estiloInput}
            />
          </Campo>
        </div>
        <button onClick={lancar} className={`${estiloBotaoPrimario} mt-4`}>
          Lançar venda
        </button>
        <p className="mt-2 text-xs text-slate-500">
          A comissão é gravada com o percentual do vendedor no dia da venda. Mudar a comissão dele
          depois não altera o que já foi apurado.
        </p>
      </Painel>

      <Painel titulo={`Vendas lançadas (${ordenadas.length})`}>
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3">Data</th>
                <th className="pb-2 pr-3">Vendedor</th>
                <th className="pb-2 pr-3">Cliente</th>
                <th className="pb-2 pr-3">Produto</th>
                <th className="pb-2 pr-3 text-right">Valor</th>
                <th className="pb-2 pr-3 text-right">Comissão</th>
                <th className="pb-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((venda) => {
                const vendedor = vendedoresPorId.get(venda.vendedorId);
                const comissao = (venda.valor * (venda.comissaoPercentual || 0)) / 100;
                return (
                  <tr key={venda.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 pr-3 text-slate-400">
                      {new Date(venda.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-white">
                      {/* Vendedor removido some do cadastro, mas a venda dele
                          continua no histórico — comissão apurada não se apaga. */}
                      {vendedor?.nome || <span className="text-slate-500">vendedor removido</span>}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-300">{venda.cliente || "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-300">{venda.produto || "—"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-emerald-300">
                      {dinheiro(venda.valor)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-sky-300">
                      {dinheiro(comissao)}{" "}
                      <span className="text-xs text-slate-500">({venda.comissaoPercentual}%)</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => remover(venda)}
                        className={`${estiloBotaoMini} text-red-300 hover:bg-red-500/15`}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!ordenadas.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    Nenhuma venda lançada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Painel>
    </div>
  );
}

// ---------- pedaços de interface ----------

const estiloInput =
  "w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500/60";

const estiloBotaoPrimario =
  "rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50";

const estiloBotaoNeutro =
  "rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5";

const estiloBotaoMini =
  "rounded px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{rotulo}</span>
      {children}
    </label>
  );
}

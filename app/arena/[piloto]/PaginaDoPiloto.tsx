"use client";

// ============================================================
// A corrida de um vendedor (ou técnico), no celular dele: posição, quanto
// falta em reais para a linha de chegada (a parte dele na meta), quanto por
// dia, a meta da equipe com a viagem e as últimas jogadas.
// ============================================================

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Kart, TINTA } from "@/components/arena/Kart";
import type { EstadoDoTelao, JogadaPublica, LinhaDoPlacar } from "@/lib/arena/tipos";
import "./piloto.css";

const INTERVALO_MS = 30_000;
const rs = (n: number) => `R$ ${Math.round(Number(n) || 0).toLocaleString("pt-BR")}`;
const dataCurta = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const nomeDe = (l: LinhaDoPlacar) => l.piloto.apelido || l.piloto.nome.split(" ")[0];

function relogio(ate: string, agora: number) {
  const ms = Math.max(0, Date.parse(ate) - agora);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${String(m).padStart(2, "0")}min`;
}

function Jogada({ j }: { j: JogadaPublica }) {
  const titulo = j.tipo === "venda" ? "Venda" : j.tipo === "os" ? "Ordem de serviço" : j.tipo === "orcamento" ? "Orçamento" : j.valor >= 0 ? "Lançado à mão" : "Ajuste";
  const icone = j.tipo === "venda" ? (j.licencas > 0 ? "⚡" : "💰") : j.tipo === "os" ? "🔧" : j.tipo === "orcamento" ? "📝" : "⭐";
  return (
    <li className="ap-jogada">
      <span className="ap-jogada-icone" aria-hidden>{icone}</span>
      <span className="ap-jogada-texto">
        <b>{titulo}</b>
        <span className="ap-jogada-data">{dataCurta(j.data)}</span>
        {j.licencas > 0 && <span className="ap-selo ouro">{plural(j.licencas, "licença", "licenças")}</span>}
      </span>
      <span className="ap-jogada-pontos">{j.tipo === "orcamento" ? "—" : `${j.valor > 0 ? "+" : ""}${rs(j.valor)}`}</span>
    </li>
  );
}

export default function PaginaDoPiloto({ slug, inicial }: { slug: string; inicial: EstadoDoTelao | null }) {
  const [estado, setEstado] = useState(inicial);
  const [periodo, setPeriodo] = useState<"semana" | "mes">("semana");
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    let vivo = true;
    const buscar = async () => {
      try {
        const r = await fetch("/api/arena/estado", { cache: "no-store" });
        if (r.ok && vivo) setEstado((await r.json()) as EstadoDoTelao);
      } catch {
        /* sem internet: fica o último */
      }
    };
    void buscar(); // a página pode ter saído de uma cópia de até 90 s
    const t = setInterval(buscar, INTERVALO_MS);
    const r = setInterval(() => setAgora(Date.now()), 30_000);
    return () => {
      vivo = false;
      clearInterval(t);
      clearInterval(r);
    };
  }, []);

  const placar = estado?.[periodo] ?? null;
  const linha = placar?.linhas.find((l) => l.piloto.slug === slug) ?? null;

  // O que falta, em coisas concretas: por dia até o fim, e em vendas (ou OS)
  // do tamanho das que ele já fez.
  const conselho = useMemo(() => {
    if (!placar || !linha || linha.chegou) return [];
    const faltam = Math.max(0, linha.meta - linha.valor);
    const dias = Math.max(1, Math.ceil((Date.parse(placar.terminaEm) - agora) / 86_400_000));
    const op: string[] = [];
    if (dias > 1) op.push(`${rs(Math.ceil(faltam / dias))} por dia até o fim ${placar.periodo === "semana" ? "da semana" : "do mês"}`);
    const tecnico = linha.piloto.funcao === "tecnico";
    const feitos = tecnico ? linha.os : linha.vendas;
    const valorFeito = tecnico ? linha.valorOS : linha.valorVendas;
    if (feitos > 0 && valorFeito > 0) {
      const medio = valorFeito / feitos;
      op.push(`${plural(Math.ceil(faltam / medio), tecnico ? "OS" : "venda", tecnico ? "OS" : "vendas")} do seu valor médio (${rs(medio)})`);
    }
    return op;
  }, [placar, linha, agora]);

  if (!estado) {
    return (
      <main className="ap-fundo">
        <div className="ap-coluna">
          <section className="ap-cartao">
            <h1 className="ap-titulo">A Arena está fora do ar agora</h1>
            <p>Tente de novo em alguns minutos.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!linha || !placar) {
    const todos = estado.semana.linhas;
    return (
      <main className="ap-fundo">
        <div className="ap-coluna">
          <section className="ap-cartao">
            <h1 className="ap-titulo">Qual é você?</h1>
            <p>Não achei esse piloto. Escolha o seu:</p>
            <ul className="ap-lista-pilotos">
              {todos.map((l) => (
                <li key={l.piloto.id}>
                  <Link href={`/arena/${l.piloto.slug}`}>
                    <span className="ap-bolinha" style={{ background: l.piloto.cor }} />
                    {nomeDe(l)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="ap-link" href="/arena">Ver o telão da corrida</Link>
          </section>
        </div>
      </main>
    );
  }

  const p = linha.piloto;
  const faltam = Math.max(0, Math.ceil(linha.meta - linha.valor));
  const frente = placar.linhas.find((l) => l.posicao === linha.posicao - 1) ?? null;
  const tras = placar.linhas.find((l) => l.posicao === linha.posicao + 1) ?? null;
  const jogadas = estado.jogadasPorPiloto?.[p.id] ?? [];
  const premio = estado.premio;
  const equipe = estado[premio?.periodo ?? periodo].equipe;
  const faltaEquipe = Math.max(0, Math.ceil(equipe.meta - equipe.valor));
  const progresso = Math.min(1, linha.progresso);

  return (
    <main className="ap-fundo">
      <div className="ap-coluna">
        <header className="ap-topo">
          <div className="ap-kart" style={{ ["--cor" as string]: p.cor }}>
            <Kart modelo={p.kart} cor={p.cor} nome={nomeDe(linha)} numero={p.numero} foto={p.foto} largura={200} girando />
          </div>
          <div>
            <h1 className="ap-nome">{nomeDe(linha)}</h1>
            <p className="ap-sub">Kart nº {p.numero} · {estado.titulo}</p>
          </div>
        </header>

        <div className="ap-abas" role="tablist" aria-label="Período da corrida">
          {(["semana", "mes"] as const).map((x) => (
            <button key={x} role="tab" aria-selected={periodo === x} className={periodo === x ? "ativa" : ""} onClick={() => setPeriodo(x)}>
              {x === "semana" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>

        <section className={`ap-cartao ap-corrida ${linha.chegou ? "chegou" : ""}`}>
          <div className="ap-posicao">
            <span className="ap-posicao-num">{linha.posicao}</span>
            <span className="ap-posicao-o">º lugar</span>
            <span className="ap-posicao-de">de {placar.linhas.length}</span>
          </div>
          {linha.chegou ? (
            <p className="ap-grande">🏁 Você cruzou a linha de chegada!</p>
          ) : (
            <p className="ap-grande">
              Faltam <b>{rs(faltam)}</b> para a linha de chegada
            </p>
          )}
          <div className="ap-pista" aria-hidden>
            <div className="ap-pista-cheia" style={{ width: `${progresso * 100}%`, background: p.cor }} />
            <div className="ap-pista-xadrez" />
          </div>
          <p className="ap-numeros">
            {rs(linha.valor)} de {rs(linha.meta)}
            {linha.vendas > 0 || p.funcao !== "tecnico" ? ` · ${plural(linha.vendas, "venda", "vendas")}` : ""}
            {linha.os > 0 || p.funcao === "tecnico" ? ` · ${linha.os} OS` : ""}
            {linha.licencas > 0 ? ` · ${plural(linha.licencas, "licença", "licenças")}` : ""}
            {linha.orcamentos > 0 ? ` · ${plural(linha.orcamentos, "orçamento", "orçamentos")}` : ""}
          </p>
          <p className="ap-relogio">{placar.rotulo} · termina em {relogio(placar.terminaEm, agora)}</p>
          {(frente || tras) && (
            <p className="ap-vizinhos">
              {frente && <>Logo à frente: <b>{nomeDe(frente)}</b> ({Math.round(frente.progresso * 100)}% da meta). </>}
              {tras && <>Logo atrás: <b>{nomeDe(tras)}</b> ({Math.round(tras.progresso * 100)}%).</>}
            </p>
          )}
        </section>

        {conselho.length > 0 && (
          <section className="ap-cartao">
            <h2 className="ap-titulo">Para cruzar a linha</h2>
            <ul className="ap-conselhos">
              {conselho.map((c, i) => (
                <li key={c}>
                  {i > 0 && <span className="ap-ou">ou</span>}
                  {c}
                </li>
              ))}
            </ul>
            <p className="ap-miudo">
              Conta o valor de cada venda no Bling{p.funcao === "tecnico" ? " e de cada OS (mão de obra + peças)" : ""}. A meta da equipe é dividida entre vendedores e técnicos.
            </p>
          </section>
        )}

        <section className="ap-cartao ap-equipe">
          {premio?.imagem && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={premio.imagem} alt="" referrerPolicy="no-referrer" className="ap-premio-foto" />
          )}
          <h2 className="ap-titulo">{premio ? premio.titulo || premio.local || "Viagem da equipe" : "Meta da equipe"}</h2>
          <div className="ap-pista pequena" aria-hidden>
            <div className="ap-pista-cheia" style={{ width: `${Math.min(100, equipe.progresso * 100)}%`, background: "#FFB800" }} />
          </div>
          <p className="ap-numeros">
            {equipe.progresso >= 1
              ? "A equipe bateu a meta!"
              : `Faltam ${rs(faltaEquipe)} da equipe ${premio ? (premio.periodo === "mes" ? "no mês" : "na semana") : periodo === "mes" ? "no mês" : "na semana"}${premio ? " para a viagem" : ""}.`}
          </p>
        </section>

        <section className="ap-cartao">
          <h2 className="ap-titulo">Suas últimas jogadas</h2>
          {jogadas.length ? (
            <ul className="ap-jogadas">
              {jogadas.map((j) => (
                <Jogada key={j.id} j={j} />
              ))}
            </ul>
          ) : (
            <p>Nenhuma jogada nos últimos 30 dias. A primeira venda já põe o kart na pista.</p>
          )}
        </section>

        <Link className="ap-link" href="/arena" style={{ color: TINTA }}>
          Ver o telão da corrida
        </Link>
      </div>
    </main>
  );
}

"use client";

// ============================================================
// A corrida de um vendedor, no celular dele: posição, quanto falta para a
// linha de chegada (a meta dele), o que fazer para chegar lá, a hora do
// turbo, a meta da equipe com a viagem e as últimas jogadas.
// ============================================================

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Kart, TINTA } from "@/components/arena/Kart";
import type { EstadoDoTelao, JogadaPublica, LinhaDoPlacar } from "@/lib/arena/tipos";
import { proximoTurbo, turboAgora } from "@/lib/arena/turbo";
import "./piloto.css";

const INTERVALO_MS = 30_000;
const hora = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const diaHora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
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
  const titulo = j.tipo === "venda" ? "Venda" : j.tipo === "orcamento" ? "Orçamento" : j.pontos >= 0 ? "Bônus" : "Ajuste";
  const icone = j.tipo === "venda" ? (j.licencas > 0 ? "⚡" : "💰") : j.tipo === "orcamento" ? "📝" : "⭐";
  return (
    <li className="ap-jogada">
      <span className="ap-jogada-icone" aria-hidden>{icone}</span>
      <span className="ap-jogada-texto">
        <b>{titulo}</b>
        <span className="ap-jogada-data">{dataCurta(j.data)}</span>
        {j.licencas > 0 && <span className="ap-selo ouro">{plural(j.licencas, "licença", "licenças")}</span>}
        {j.conversao && <span className="ap-selo azul">orçamento virou venda</span>}
        {j.turbo > 1 && <span className="ap-selo turbo">turbo {j.turbo}x</span>}
      </span>
      <span className="ap-jogada-pontos">{j.pontos > 0 ? "+" : ""}{Math.round(j.pontos * 10) / 10}</span>
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

  const conselho = useMemo(() => {
    if (!estado || !linha || linha.chegou) return [];
    const faltam = Math.max(0, linha.meta - linha.pontos);
    const t = turboAgora(estado.turbo, new Date(agora));
    const m = t.ativo ? t.multiplicador : 1;
    const r = estado.regras;
    const op: string[] = [];
    if (r.venda + r.licencaBonus > 0) op.push(`${plural(Math.ceil(faltam / ((r.venda + r.licencaBonus) * m)), "venda", "vendas")} com licença do Windows ou do Office`);
    if (r.venda > 0) op.push(plural(Math.ceil(faltam / (r.venda * m)), "venda", "vendas"));
    if (r.orcamento > 0 && Math.ceil(faltam / (r.orcamento * m)) <= 40) op.push(plural(Math.ceil(faltam / (r.orcamento * m)), "orçamento", "orçamentos"));
    return op;
  }, [estado, linha, agora]);

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
  const faltam = Math.max(0, Math.ceil(linha.meta - linha.pontos));
  const frente = placar.linhas.find((l) => l.posicao === linha.posicao - 1) ?? null;
  const tras = placar.linhas.find((l) => l.posicao === linha.posicao + 1) ?? null;
  const turbo = turboAgora(estado.turbo, new Date(agora));
  const proximo = !turbo.ativo ? proximoTurbo(estado.turbo, new Date(agora)) : null;
  const jogadas = estado.jogadasPorPiloto?.[p.id] ?? [];
  const premio = estado.premio;
  const equipe = estado[premio?.periodo ?? periodo].equipe;
  const faltaEquipe = Math.max(0, Math.ceil(equipe.meta - equipe.pontos));
  const progresso = Math.min(1, linha.progresso);

  return (
    <main className="ap-fundo">
      <div className="ap-coluna">
        <header className="ap-topo">
          <div className="ap-kart" style={{ ["--cor" as string]: p.cor }}>
            <Kart modelo={p.kart} cor={p.cor} nome={nomeDe(linha)} numero={p.numero} foto={p.foto} largura={200} girando turbo={turbo.ativo ? "dourado" : null} />
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
              Faltam <b>{faltam} pts</b> para a linha de chegada
            </p>
          )}
          <div className="ap-pista" aria-hidden>
            <div className="ap-pista-cheia" style={{ width: `${progresso * 100}%`, background: p.cor }} />
            <div className="ap-pista-xadrez" />
          </div>
          <p className="ap-numeros">
            {Math.round(linha.pontos)} de {Math.round(linha.meta)} pts · {plural(linha.vendas, "venda", "vendas")} · {plural(linha.orcamentos, "orçamento", "orçamentos")}
            {linha.licencas > 0 ? ` · ${plural(linha.licencas, "licença", "licenças")}` : ""}
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
            <h2 className="ap-titulo">Para cruzar a linha{turbo.ativo ? ", com o turbo" : ""}</h2>
            <ul className="ap-conselhos">
              {conselho.map((c, i) => (
                <li key={c}>
                  {i > 0 && <span className="ap-ou">ou</span>}
                  {c}
                </li>
              ))}
            </ul>
            <p className="ap-miudo">
              Venda vale {estado.regras.venda} pts, orçamento {estado.regras.orcamento}, licença +{estado.regras.licencaBonus}
              {estado.regras.conversaoBonus > 0 ? `, orçamento que vira venda +${estado.regras.conversaoBonus}` : ""}
              {estado.regras.ticketFaixa > 0 ? `, e +${estado.regras.ticketPontos} a cada R$ ${estado.regras.ticketFaixa}` : ""}.
            </p>
          </section>
        )}

        {(turbo.ativo || proximo) && (
          <section className={`ap-cartao ap-turbo ${turbo.ativo ? "ligado" : ""}`}>
            {turbo.ativo ? (
              <p>
                ⚡ <b>Hora do turbo!</b> Pontos em {turbo.multiplicador}x até as {hora(turbo.ate!)}.
              </p>
            ) : (
              <p>
                ⚡ Próxima hora do turbo: <b>{diaHora(proximo!.inicio)}</b>, pontos em {proximo!.multiplicador}x.
              </p>
            )}
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
              : `Faltam ${faltaEquipe} pts da equipe ${premio ? (premio.periodo === "mes" ? "no mês" : "na semana") : periodo === "mes" ? "no mês" : "na semana"}${premio ? " para a viagem" : ""}.`}
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

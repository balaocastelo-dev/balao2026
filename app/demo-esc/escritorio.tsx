"use client";

import { useEffect, useRef, useState } from "react";
import { EQUIPE, nomeDoAgente } from "@/demo-esc/equipe";
import { criarMotor } from "@/demo-esc/mundo";
import { criarEstado, criarSimulacao, fotografar, type FotoEscritorio, type Simulacao } from "@/demo-esc/simulacao";
import { COR_STATUS, ROTULO_STATUS, type EstadoEscritorio } from "@/demo-esc/tipos";
import estilos from "./estilos.module.css";

const numeros = new Intl.NumberFormat("pt-BR");

function Estrela() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ffd84a"
        stroke="#5c3b22"
        strokeWidth="1.6"
        d="M12 2.2 14.8 8.5 21.6 9.1 16.5 13.7 18.1 20.5 12 16.9 5.9 20.5 7.5 13.7 2.4 9.1 9.2 8.5Z"
      />
    </svg>
  );
}

function Moeda() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#ffcf4d" stroke="#5c3b22" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#a87412" strokeWidth="1.6" />
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5c3b22">
        B
      </text>
    </svg>
  );
}

function Pessoas() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.1" fill="#7ec8ff" stroke="#5c3b22" strokeWidth="1.6" />
      <circle cx="15.5" cy="9" r="2.4" fill="#ffd84a" stroke="#5c3b22" strokeWidth="1.6" />
      <path d="M3.8 18.5c.6-3 2.8-4.6 5.2-4.6s4.6 1.6 5.2 4.6" fill="#7ec8ff" stroke="#5c3b22" strokeWidth="1.6" />
      <path d="M13.2 18.5c.4-2.2 1.8-3.4 3.4-3.4 1.5 0 2.8 1 3.3 3.4" fill="#ffd84a" stroke="#5c3b22" strokeWidth="1.6" />
    </svg>
  );
}

export default function Escritorio({ fonte }: { fonte: string }) {
  const estadoRef = useRef<EstadoEscritorio | null>(null);
  const simRef = useRef<Simulacao | null>(null);
  if (estadoRef.current === null) {
    const inicial = criarEstado();
    estadoRef.current = inicial;
    simRef.current = criarSimulacao(inicial);
  }
  const [foto, setFoto] = useState<FotoEscritorio>(() => fotografar(estadoRef.current as EstadoEscritorio));
  const visto = useRef(foto.revisao);
  const [pronta, setPronta] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [cheia, setCheia] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camadaRef = useRef<HTMLDivElement>(null);
  const reduzidoRef = useRef(false);
  const apiRef = useRef<{
    avancar: (dt: number, agora: number) => void;
    publicar: () => void;
    selecionar: (id: string | null) => void;
  }>({
    avancar() {},
    publicar() {},
    selecionar() {},
  });

  const publicar = () => {
    const atual = estadoRef.current;
    if (!atual || atual.revisao === visto.current) return;
    visto.current = atual.revisao;
    setFoto(fotografar(atual));
  };

  const selecionar = (id: string | null) => {
    const atual = estadoRef.current;
    if (!atual) return;
    const proximo = id !== null && atual.selecionadoId === id ? null : id;
    if (proximo === atual.selecionadoId) return;
    atual.selecionadoId = proximo;
    atual.revisao += 1;
    publicar();
  };

  apiRef.current.avancar = (dt, agora) => simRef.current?.avancar(dt, agora);
  apiRef.current.publicar = publicar;
  apiRef.current.selecionar = selecionar;

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      reduzidoRef.current = consulta.matches;
    };
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    const aoMudar = () => setCheia(document.fullscreenElement === raizRef.current);
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  useEffect(() => {
    let vivo = true;
    const consultar = async () => {
      try {
        const resposta = await fetch("/demo-esc/api/status", { cache: "no-store" });
        if (!resposta.ok) throw new Error("status");
        const json: unknown = await resposta.json();
        if (!vivo) return;
        const sim = simRef.current;
        const atual = estadoRef.current;
        if (!sim || !atual) return;
        const entrou = sim.aplicarFeed(json, Date.now());
        if (!entrou && atual.modo === "ao_vivo") sim.retomar(Date.now());
        apiRef.current.publicar();
      } catch {
        if (!vivo) return;
        if (estadoRef.current?.modo === "ao_vivo") {
          simRef.current?.retomar(Date.now());
          apiRef.current.publicar();
        }
      }
    };
    void consultar();
    const relogio = window.setInterval(() => void consultar(), 10000);
    return () => {
      vivo = false;
      window.clearInterval(relogio);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const camada = camadaRef.current;
    if (!canvas || !camada) return;
    let vivo = true;
    let motorAssumiu = false;
    let ultimo = performance.now();
    let quadro = 0;
    let destruirMotor = () => {};

    const reserva = (agora: number) => {
      if (!vivo || motorAssumiu) return;
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      apiRef.current.avancar(dt, agora);
      apiRef.current.publicar();
      quadro = window.requestAnimationFrame(reserva);
    };
    quadro = window.requestAnimationFrame(reserva);

    void criarMotor({
      canvas,
      camada,
      classes: {
        etiqueta: estilos.etiqueta,
        nome: estilos.nome,
        papel: estilos.papel,
        linha: estilos.linha,
        ponto: estilos.ponto,
        balao: estilos.balao,
      },
      obterEstado: () => estadoRef.current as EstadoEscritorio,
      aoClicar: (id) => apiRef.current.selecionar(id),
      aoQuadro: (dt, agora) => {
        motorAssumiu = true;
        apiRef.current.avancar(dt, agora);
        apiRef.current.publicar();
      },
      movimentoReduzido: () => reduzidoRef.current,
    })
      .then((motor) => {
        if (!vivo) {
          motor.destruir();
          return;
        }
        destruirMotor = () => motor.destruir();
        setPronta(true);
      })
      .catch((erro: unknown) => {
        if (!vivo) return;
        const codigo = erro instanceof Error ? erro.message : "";
        setFalha(
          codigo === "sem-webgl"
            ? "Este navegador não abriu o escritório em 3D. A equipe continua na lista ao lado."
            : "Não consegui carregar o escritório agora. Verifique a conexão e atualize a página.",
        );
      });

    return () => {
      vivo = false;
      window.cancelAnimationFrame(quadro);
      destruirMotor();
    };
  }, []);

  async function alternarTelaCheia() {
    const raiz = raizRef.current;
    if (!raiz) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await raiz.requestFullscreen();
    } catch {
      /* o navegador recusou a tela cheia */
    }
  }

  const selecionado = foto.agentes.find((agente) => agente.id === foto.selecionadoId) ?? null;
  const ficha = selecionado ? EQUIPE.find((agente) => agente.id === selecionado.id) : undefined;
  const recadosDoSelecionado = selecionado
    ? foto.eventos.filter((evento) => evento.de === selecionado.id || evento.para === selecionado.id).slice(0, 5)
    : [];

  return (
    <div ref={raizRef} className={`${fonte} ${estilos.pagina}`}>
      <header className={estilos.topo}>
        <div className={estilos.marca}>
          <h1>Equipe Digital Balão</h1>
          <p>Balão da Informática · Campinas</p>
        </div>
        <span className={estilos.medalha} title="Agentes ativos">
          <Pessoas />
          <span>
            <strong>{numeros.format(foto.ativos)}</strong>
            <small>ativos</small>
          </span>
        </span>
        <span className={estilos.medalha} title="Tarefas concluídas">
          <Estrela />
          <span>
            <strong>{numeros.format(foto.tarefas)}</strong>
            <small>tarefas</small>
          </span>
        </span>
        <span className={estilos.medalha} title="Conversas hoje">
          <Moeda />
          <span>
            <strong>{numeros.format(foto.conversas)}</strong>
            <small>conversas</small>
          </span>
        </span>
        <span className={foto.modo === "ao_vivo" ? `${estilos.selo} ${estilos.seloVivo}` : estilos.selo}>
          {foto.modo === "ao_vivo" ? "Ao vivo" : "Modo demonstração"}
        </span>
        <button type="button" className={estilos.botao} onClick={() => void alternarTelaCheia()}>
          {cheia ? "Sair da tela cheia" : "Tela cheia"}
        </button>
      </header>

      <div className={estilos.corpo}>
        <div className={estilos.palco}>
          <canvas ref={canvasRef} className={estilos.tela} aria-label="Escritório tridimensional da Equipe Digital Balão" />
          <div ref={camadaRef} className={estilos.camada} />
          {!pronta && !falha ? <p className={estilos.aviso}>Abrindo o escritório…</p> : null}
          {falha ? <p className={estilos.aviso}>{falha}</p> : null}
          {selecionado && ficha ? (
            <article className={estilos.cartao} aria-label={`Ficha de ${ficha.nome}`}>
              <div className={estilos.cartaoCabeca}>
                <span className={estilos.emoji} aria-hidden="true">
                  {ficha.emoji}
                </span>
                <div>
                  <h2>{ficha.nome}</h2>
                  <p className={estilos.papelCard}>{ficha.papel}</p>
                </div>
                <button type="button" className={estilos.fechar} onClick={() => selecionar(null)} aria-label="Fechar ficha">
                  ×
                </button>
              </div>
              <p className={estilos.statusLinha}>
                <i className={estilos.ponto} style={{ background: COR_STATUS[selecionado.status] }} />
                {ROTULO_STATUS[selecionado.status]}
                {selecionado.falandoCom ? ` com ${nomeDoAgente(selecionado.falandoCom)}` : ""}
              </p>
              <p className={estilos.tarefaAtual}>
                <strong>Tarefa atual: </strong>
                {selecionado.tarefa}
              </p>
              {selecionado.whatsappConectado ? <p className={estilos.zap}>WhatsApp conectado</p> : null}
              <h3>Recados recentes</h3>
              {recadosDoSelecionado.length === 0 ? <p className={estilos.vazio}>Sem recados ainda.</p> : null}
              {recadosDoSelecionado.map((evento) => (
                <p key={`${evento.em}-${evento.de}-${evento.texto}`} className={estilos.recado}>
                  <small>
                    {evento.hora} · {nomeDoAgente(evento.de)}
                  </small>
                  {evento.texto}
                </p>
              ))}
            </article>
          ) : null}
        </div>

        <aside className={estilos.painel}>
          <div className={estilos.lista}>
            <div className={estilos.painelCabeca}>
              <h2>Conversas ao vivo</h2>
            </div>
            {foto.eventos.length === 0 ? <p className={estilos.vazio}>A equipe ainda não trocou recados agora.</p> : null}
            {foto.eventos.map((evento) => (
              <article key={`${evento.em}-${evento.de}-${evento.para}-${evento.texto}`} className={estilos.recado}>
                <small>
                  {evento.hora} · {nomeDoAgente(evento.de)} → {nomeDoAgente(evento.para)}
                </small>
                {evento.texto}
              </article>
            ))}
            <div className={estilos.painelCabeca}>
              <h2>Tarefas em andamento</h2>
            </div>
            {foto.agentes
              .filter((agente) => agente.status !== "em_breve")
              .map((agente) => (
                <button
                  key={agente.id}
                  type="button"
                  className={estilos.tarefa}
                  data-ativa={foto.selecionadoId === agente.id ? "sim" : "nao"}
                  onClick={() => selecionar(agente.id)}
                >
                  <i className={estilos.ponto} style={{ background: COR_STATUS[agente.status] }} />
                  <span>
                    <small>
                      {EQUIPE.find((item) => item.id === agente.id)?.nome} · {ROTULO_STATUS[agente.status]}
                    </small>
                    {agente.tarefa}
                  </span>
                </button>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

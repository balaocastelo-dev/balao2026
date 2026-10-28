import { ROTEIROS, ROTEIROS_GENERICOS, type Roteiro } from "./dialogos";
import { EQUIPE, nomeDoAgente } from "./equipe";
import { feedEstaFresco, normalizarFeed } from "./feed";
import type { AgenteCena, EstadoEscritorio, EventoConversa, Lugar } from "./tipos";

type Fase =
  | { tipo: "livre" }
  | {
      tipo: "conversa";
      roteiro: Roteiro;
      papel: "de" | "para";
      indice: number;
      proxima: number;
      encerrar: boolean;
    };

type Interno = {
  fase: Fase;
  trabalhando: boolean;
  proximaTroca: number;
  cursorTarefa: number;
};

function hash(id: string) {
  let h = 0;
  for (const letra of id) h = (h * 33 + letra.charCodeAt(0)) >>> 0;
  return h;
}

function formatarHora(ms: number) {
  return new Date(ms).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function preencher(texto: string, de: string, para: string) {
  return texto.replaceAll("{de}", de).replaceAll("{para}", para);
}

const SEMENTE_MS = Date.parse("2026-10-28T14:10:00-03:00");

function semente(minutos: number, de: string, para: string, texto: string): EventoConversa {
  const em = SEMENTE_MS + minutos * 60 * 1000;
  return { em, hora: formatarHora(em), de, para, texto };
}

/** Estado inicial idêntico no servidor e no navegador: nada de Math.random aqui. */
export function criarEstado(): EstadoEscritorio {
  const agentes: AgenteCena[] = EQUIPE.map((agente) => {
    const breve = agente.status === "em_breve";
    const ocioso = !breve && hash(agente.id) % 7 === 0;
    return {
      id: agente.id,
      status: breve ? "em_breve" : ocioso ? "ocioso" : "trabalhando",
      tarefa: breve
        ? "Chegando em breve"
        : ocioso
          ? "Disponível para a equipe"
          : agente.tarefas[hash(agente.id) % agente.tarefas.length],
      ultimaFala: "",
      falandoCom: null,
      whatsappConectado: false,
      lugar: "mesa",
    };
  });

  return {
    modo: "demonstracao",
    agentes,
    eventos: [
      semente(0, "futrico", "thiaguito", "Thiaguito, o cliente do e-mail confirmou que busca hoje no fim da tarde."),
      semente(6, "wendell", "dinherildo", "Dinherildo, deixei a ordem do notebook pronta pra você faturar."),
      semente(11, "malaquias", "joao", "João, quando o vídeo da campanha sair do forno me chama que eu encaixo na pauta."),
      semente(18, "herrera", "malaquias", "Malaquias, o anúncio da bancada foi o que mais gerou conversa ontem."),
    ],
    conversas: 18,
    tarefasConcluidas: 46,
    revisao: 1,
    selecionadoId: null,
  };
}

export type Simulacao = {
  avancar: (dt: number, agora: number) => void;
  aplicarFeed: (bruto: unknown, agora: number) => boolean;
  retomar: (agora: number) => void;
};

export function criarSimulacao(estado: EstadoEscritorio): Simulacao {
  const internos = new Map<string, Interno>();
  for (const agente of EQUIPE) {
    const cena = estado.agentes.find((item) => item.id === agente.id);
    internos.set(agente.id, {
      fase: { tipo: "livre" },
      trabalhando: cena?.status === "trabalhando",
      proximaTroca: 0,
      cursorTarefa: hash(agente.id) % Math.max(1, agente.tarefas.length),
    });
  }

  let iniciou = false;
  let proximaConversa = 0;
  let cafeId: string | null = null;
  let cafeAte = 0;
  let proximoCafe = 0;
  let ultimoRoteiro = "";
  let acumuladoTarefa = 0;
  let primeira = true;
  let assinaturaFeed = "";
  let mudancasTarefa = 0;
  const tarefaVista = new Map<string, string>();

  function achar(id: string) {
    return estado.agentes.find((agente) => agente.id === id);
  }

  function cadastro(id: string) {
    return EQUIPE.find((agente) => agente.id === id);
  }

  function proximaTarefa(id: string) {
    const agente = cadastro(id);
    const interno = internos.get(id);
    if (!agente || !interno || agente.tarefas.length === 0) return "Seguindo com a fila";
    interno.cursorTarefa = (interno.cursorTarefa + 1) % agente.tarefas.length;
    return agente.tarefas[interno.cursorTarefa];
  }

  function livres() {
    return estado.agentes.filter((agente) => {
      if (cadastro(agente.id)?.status === "em_breve") return false;
      if (agente.status === "em_breve") return false;
      if (agente.id === cafeId) return false;
      return internos.get(agente.id)?.fase.tipo === "livre";
    });
  }

  function conversasAbertas() {
    let n = 0;
    for (const interno of internos.values()) {
      if (interno.fase.tipo === "conversa" && interno.fase.papel === "de") n += 1;
    }
    return n;
  }

  function soltar(id: string, agora: number) {
    const agente = achar(id);
    const interno = internos.get(id);
    if (!agente || !interno) return;
    interno.fase = { tipo: "livre" };
    interno.trabalhando = true;
    interno.proximaTroca = agora + 9000 + (hash(id) % 4000);
    if (agente.id === cafeId) return;
    agente.lugar = "mesa";
    agente.status = "trabalhando";
    agente.falandoCom = null;
    agente.ultimaFala = "";
    agente.tarefa = proximaTarefa(id);
  }

  function encerrar(roteiro: Roteiro, agora: number) {
    soltar(roteiro.de, agora);
    soltar(roteiro.para, agora);
    estado.tarefasConcluidas += 1;
    estado.revisao += 1;
  }

  function comecar(roteiro: Roteiro, agora: number, local: "visita" | "reuniao") {
    const de = achar(roteiro.de);
    const para = achar(roteiro.para);
    const internoDe = internos.get(roteiro.de);
    const internoPara = internos.get(roteiro.para);
    if (!de || !para || !internoDe || !internoPara) return;

    const lugarDe: Lugar = local === "reuniao" ? "reuniao" : "visita";
    const lugarPara: Lugar = local === "reuniao" ? "reuniao" : "mesa";
    const status = local === "reuniao" ? "em_reuniao" : "em_conversa";

    de.status = status;
    de.lugar = lugarDe;
    de.falandoCom = roteiro.para;
    de.tarefa = roteiro.tarefaDe;
    de.ultimaFala = "";

    para.status = status;
    para.lugar = lugarPara;
    para.falandoCom = roteiro.de;
    para.tarefa = roteiro.tarefaPara;
    para.ultimaFala = "";

    const faseBase = {
      tipo: "conversa" as const,
      roteiro,
      indice: 0,
      proxima: agora + 1300,
      encerrar: false,
    };
    internoDe.fase = { ...faseBase, papel: "de" };
    internoPara.fase = { ...faseBase, papel: "para" };
    estado.conversas += 1;
    ultimoRoteiro = roteiro.id;
    estado.revisao += 1;
  }

  function tentarConversa(agora: number) {
    if (conversasAbertas() >= 2) return;
    const disponiveis = new Set(livres().map((agente) => agente.id));
    if (disponiveis.size < 2) return;

    let escolhido: Roteiro | null = null;
    if (primeira) {
      primeira = false;
      const abertura = ROTEIROS.find((roteiro) => roteiro.id === "campanha-video");
      if (abertura && disponiveis.has(abertura.de) && disponiveis.has(abertura.para)) {
        escolhido = abertura;
      }
    }
    if (!escolhido) {
      const candidatos = ROTEIROS.filter(
        (roteiro) =>
          roteiro.id !== ultimoRoteiro && disponiveis.has(roteiro.de) && disponiveis.has(roteiro.para),
      );
      if (candidatos.length > 0) {
        escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
      }
    }
    if (!escolhido) {
      const ids = [...disponiveis];
      const deId = ids[Math.floor(Math.random() * ids.length)];
      const resto = ids.filter((id) => id !== deId);
      const paraId = resto[Math.floor(Math.random() * resto.length)];
      const molde = ROTEIROS_GENERICOS[Math.floor(Math.random() * ROTEIROS_GENERICOS.length)];
      const nomeDe = nomeDoAgente(deId);
      const nomePara = nomeDoAgente(paraId);
      escolhido = {
        id: `generico-${deId}-${paraId}-${agora}`,
        de: deId,
        para: paraId,
        tarefaDe: molde.tarefaDe,
        tarefaPara: molde.tarefaPara,
        falas: molde.falas.map((fala) => ({
          quem: fala.quem,
          texto: preencher(fala.texto, nomeDe, nomePara),
        })),
      };
    }

    const abertura = escolhido.id === "campanha-video" && estado.conversas === 18;
    const naMesa = abertura || Math.random() >= 0.42;
    comecar(escolhido, agora, naMesa ? "visita" : "reuniao");
  }

  function falar(interno: Extract<Fase, { tipo: "conversa" }>, agora: number) {
    const { roteiro } = interno;
    if (interno.encerrar) {
      encerrar(roteiro, agora);
      return;
    }
    const fala = roteiro.falas[interno.indice];
    if (!fala) {
      encerrar(roteiro, agora);
      return;
    }
    const falanteId = fala.quem === "de" ? roteiro.de : roteiro.para;
    const ouvinteId = fala.quem === "de" ? roteiro.para : roteiro.de;
    const falante = achar(falanteId);
    const ouvinte = achar(ouvinteId);
    if (falante) falante.ultimaFala = fala.texto;
    if (ouvinte) ouvinte.ultimaFala = "";
    estado.eventos.unshift({
      em: agora,
      hora: formatarHora(agora),
      de: falanteId,
      para: ouvinteId,
      texto: fala.texto,
    });
    if (estado.eventos.length > 40) estado.eventos.length = 40;

    const proximoIndice = interno.indice + 1;
    const acabou = proximoIndice >= roteiro.falas.length;
    const proxima = agora + (acabou ? 2800 : 3200);
    for (const id of [roteiro.de, roteiro.para]) {
      const lado = internos.get(id);
      if (lado?.fase.tipo !== "conversa") continue;
      lado.fase.indice = proximoIndice;
      lado.fase.proxima = proxima;
      lado.fase.encerrar = acabou;
    }
    estado.revisao += 1;
  }

  function avancar(dt: number, agora: number) {
    if (estado.modo !== "demonstracao") return;
    if (!iniciou) {
      iniciou = true;
      proximaConversa = agora + 1200;
      proximoCafe = agora + 9000;
      for (const [id, interno] of internos) {
        interno.proximaTroca = agora + 5000 + (hash(id) % 7000);
      }
    }

    acumuladoTarefa += dt;
    if (acumuladoTarefa >= 10) {
      acumuladoTarefa -= 10;
      estado.tarefasConcluidas += 1;
      estado.revisao += 1;
    }

    if (cafeId && agora >= cafeAte) {
      const agente = achar(cafeId);
      cafeId = null;
      proximoCafe = agora + 12000 + Math.random() * 8000;
      if (agente && internos.get(agente.id)?.fase.tipo === "livre") {
        agente.lugar = "mesa";
        agente.status = "trabalhando";
        agente.tarefa = proximaTarefa(agente.id);
        agente.ultimaFala = "";
        estado.revisao += 1;
      }
    } else if (!cafeId && agora >= proximoCafe) {
      const opcoes = livres();
      if (opcoes.length > 0) {
        const agente = opcoes[Math.floor(Math.random() * opcoes.length)];
        cafeId = agente.id;
        cafeAte = agora + 7500;
        agente.lugar = "cafe";
        agente.status = "ocioso";
        agente.tarefa = "Pegando um café";
        agente.falandoCom = null;
        agente.ultimaFala = "";
        estado.revisao += 1;
      } else {
        proximoCafe = agora + 4000;
      }
    }

    for (const interno of internos.values()) {
      if (interno.fase.tipo !== "conversa" || interno.fase.papel !== "de") continue;
      if (agora < interno.fase.proxima) continue;
      falar(interno.fase, agora);
    }

    for (const agente of estado.agentes) {
      if (cadastro(agente.id)?.status === "em_breve") continue;
      const interno = internos.get(agente.id);
      if (!interno || interno.fase.tipo !== "livre") continue;
      if (agente.id === cafeId) continue;
      if (agora < interno.proximaTroca) continue;
      if (interno.trabalhando) {
        interno.trabalhando = false;
        agente.status = "ocioso";
        agente.lugar = "mesa";
        agente.tarefa = "Disponível para a equipe";
        agente.ultimaFala = "";
        agente.falandoCom = null;
        interno.proximaTroca = agora + 4000 + Math.random() * 2500;
      } else {
        interno.trabalhando = true;
        agente.status = "trabalhando";
        agente.lugar = "mesa";
        agente.tarefa = proximaTarefa(agente.id);
        interno.proximaTroca = agora + 8000 + Math.random() * 7000;
      }
      estado.revisao += 1;
    }

    if (agora >= proximaConversa) {
      tentarConversa(agora);
      proximaConversa = agora + 6500 + Math.random() * 4500;
    }
  }

  function lugarDoFeed(agente: AgenteCena): Lugar {
    if (agente.status === "em_reuniao") return "reuniao";
    if (agente.status === "em_conversa" && agente.falandoCom) {
      const parceiro = achar(agente.falandoCom);
      const reciproco =
        parceiro &&
        (parceiro.falandoCom === agente.id || parceiro.status === "em_conversa" || parceiro.status === "em_reuniao");
      if (reciproco && agente.falandoCom) {
        return agente.id > agente.falandoCom ? "visita" : "mesa";
      }
      return "visita";
    }
    return "mesa";
  }

  function aplicarFeed(bruto: unknown, agora: number) {
    const feed = normalizarFeed(bruto);
    if (!feed || !feedEstaFresco(feed.updatedAt, agora)) return false;
    const assinatura = JSON.stringify(feed);
    if (assinatura === assinaturaFeed && estado.modo === "ao_vivo") return true;
    assinaturaFeed = assinatura;

    const porFeed = new Map(feed.agents.map((agente) => [agente.id, agente]));
    for (const agente of estado.agentes) {
      const catalogo = cadastro(agente.id);
      if (catalogo?.status === "em_breve") {
        agente.status = "em_breve";
        agente.lugar = "mesa";
        agente.tarefa = "Chegando em breve";
        agente.ultimaFala = "";
        agente.falandoCom = null;
        agente.whatsappConectado = false;
        continue;
      }
      const remoto = porFeed.get(agente.id);
      if (!remoto) {
        agente.status = "ocioso";
        agente.lugar = "mesa";
        agente.tarefa = "Sem sinal no momento";
        agente.ultimaFala = "";
        agente.falandoCom = null;
        agente.whatsappConectado = false;
        continue;
      }
      const anterior = tarefaVista.get(agente.id);
      if (anterior && remoto.currentTask && anterior !== remoto.currentTask) {
        mudancasTarefa += 1;
      }
      tarefaVista.set(agente.id, remoto.currentTask);
      agente.status = remoto.status === "em_breve" ? "ocioso" : remoto.status;
      agente.tarefa = remoto.currentTask || "Na fila";
      agente.ultimaFala = remoto.lastMessage;
      agente.falandoCom = remoto.talkingTo;
      agente.whatsappConectado = remoto.whatsappConnected;
    }
    for (const agente of estado.agentes) {
      if (cadastro(agente.id)?.status === "em_breve") continue;
      agente.lugar = lugarDoFeed(agente);
    }

    estado.eventos = feed.events
      .map((evento) => {
        const em = Date.parse(evento.at);
        return {
          em,
          hora: formatarHora(em),
          de: evento.from,
          para: evento.to,
          texto: evento.text,
        };
      })
      .sort((a, b) => b.em - a.em)
      .slice(0, 40);

    estado.modo = "ao_vivo";
    estado.conversas = feed.events.length;
    estado.tarefasConcluidas = feed.events.length + mudancasTarefa;
    for (const interno of internos.values()) interno.fase = { tipo: "livre" };
    cafeId = null;
    estado.revisao += 1;
    return true;
  }

  function retomar(agora: number) {
    if (estado.modo !== "demonstracao") {
      estado.modo = "demonstracao";
      assinaturaFeed = "";
      cafeId = null;
      for (const agente of estado.agentes) {
        if (cadastro(agente.id)?.status === "em_breve") continue;
        soltar(agente.id, agora);
      }
      proximaConversa = agora + 1500;
      proximoCafe = agora + 8000;
      iniciou = true;
      estado.revisao += 1;
    }
  }

  return { avancar, aplicarFeed, retomar };
}

export function fotografar(estado: EstadoEscritorio) {
  const ativos = estado.agentes.filter((agente) => agente.status !== "em_breve").length;
  return {
    modo: estado.modo,
    conversas: estado.conversas,
    tarefas: estado.tarefasConcluidas,
    ativos,
    selecionadoId: estado.selecionadoId,
    revisao: estado.revisao,
    eventos: estado.eventos.slice(0, 30),
    agentes: estado.agentes.map((agente) => ({ ...agente })),
  };
}

export type FotoEscritorio = ReturnType<typeof fotografar>;

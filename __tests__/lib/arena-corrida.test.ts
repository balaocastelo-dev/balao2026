// @vitest-environment node
import { describe, it, expect } from "vitest";
import { contarLicencas, ehLicenca, normalizarRegras, pontuar, REGRAS_PADRAO, type DocumentoDoBling } from "@/lib/arena/pontos";
import { pontuarLote } from "@/lib/arena/lote";
import { janela, hojeNaLoja, segundaDaSemana, mesAnterior, semanaAnterior } from "@/lib/arena/periodos";
import { montarPlacar, sugerirMeta } from "@/lib/arena/placar";
import { lerDocumento } from "@/lib/arena/entrada";
import { CORRIDA_PADRAO, type Lancamento, type Piloto } from "@/lib/arena/tipos";

const R = REGRAS_PADRAO;

function doc(p: Partial<DocumentoDoBling>): DocumentoDoBling {
  return {
    tipo: "venda",
    blingId: "1",
    numero: "1",
    data: "2026-10-12",
    vendedorBlingId: "15596536241",
    contatoId: "100",
    contatoNome: "Cliente",
    total: 300,
    situacaoId: 6,
    situacao: null,
    itens: [],
    ...p,
  };
}

describe("licença do Windows/Office", () => {
  it("reconhece a licença como o Bling escreve", () => {
    expect(ehLicenca("LICENÇA MICROSOFT WINDOWS 11 PRO ORIGINAL E VITALICIO", R)).toBe(true);
    expect(ehLicenca("Microsoft Office 2021 Professional Plus", R)).toBe(true);
    expect(ehLicenca("Microsoft 365 Personal 12 meses", R)).toBe(true);
  });
  it("não conta máquina que vem com Windows nem cadeira Office", () => {
    expect(ehLicenca("NOTEBOOK LENOVO I5 16GB WINDOWS 11", R)).toBe(false);
    expect(ehLicenca("Cadeira Office Ergonômica", R)).toBe(false);
    expect(ehLicenca("PC Office i3 8GB", R)).toBe(false);
    expect(ehLicenca("ROTEADOR TPLINK 300MBPS", R)).toBe(false);
  });
  it("soma a quantidade de cada item", () => {
    expect(contarLicencas([{ descricao: "Licença Windows 11 Pro", quantidade: 3, valor: 349 }], R)).toBe(3);
  });
});

describe("pontos de cada documento", () => {
  it("venda: base + turbo do ticket + licença", () => {
    const p = pontuar(doc({ total: 1200, itens: [{ descricao: "LICENÇA WINDOWS 11 PRO", quantidade: 1, valor: 349 }] }), R);
    expect(p.status).toBe("valido");
    expect(p.detalhe).toEqual({ base: 10, licencas: 15, turbo: 2, conversao: 0 });
    expect(p.pontos).toBe(27);
  });
  it("venda cancelada ou estornada não pontua; em digitação espera", () => {
    expect(pontuar(doc({ situacaoId: 12 }), R).status).toBe("cancelado");
    expect(pontuar(doc({ situacaoId: 32598 }), R).pontos).toBe(0);
    expect(pontuar(doc({ situacaoId: 21 }), R).status).toBe("pendente");
  });
  it("orçamento abaixo do mínimo não pontua", () => {
    expect(pontuar(doc({ tipo: "orcamento", total: 25 }), R).status).toBe("ignorado");
    expect(pontuar(doc({ tipo: "orcamento", total: 2610 }), R).pontos).toBe(2);
  });
  it("regras do painel não aceitam número negativo", () => {
    const r = normalizarRegras({ venda: -5, orcamento: "4", licencaPalavras: "windows, office" });
    expect(r.venda).toBe(10);
    expect(r.orcamento).toBe(4);
    expect(r.licencaPalavras).toEqual(["windows", "office"]);
  });
});

describe("lote: conversão e orçamento repetido", () => {
  it("venda para quem recebeu orçamento ganha o bônus de conversão", () => {
    const res = pontuarLote(
      [doc({ tipo: "orcamento", blingId: "50", data: "2026-10-01", total: 2000 }), doc({ blingId: "60", data: "2026-10-12", total: 300 })],
      [],
      R
    );
    expect(res.get("venda:60")!.detalhe.conversao).toBe(5);
  });
  it("orçamento de fora da janela não vale conversão", () => {
    const res = pontuarLote([doc({ blingId: "60", data: "2026-10-12" })], [
      { blingId: "1", contatoId: "100", vendedorBlingId: "x", data: "2026-08-01", total: 500, status: "valido" },
    ], R);
    expect(res.get("venda:60")!.detalhe.conversao).toBe(0);
  });
  it("dois orçamentos do mesmo vendedor para o mesmo cliente no dia: só o primeiro", () => {
    const res = pontuarLote(
      [doc({ tipo: "orcamento", blingId: "71", total: 500 }), doc({ tipo: "orcamento", blingId: "70", total: 900 })],
      [],
      R
    );
    expect(res.get("orcamento:70")!.status).toBe("valido");
    expect(res.get("orcamento:71")!.status).toBe("ignorado");
  });
  it("orçamento ignorado por valor não conta como conversão", () => {
    const res = pontuarLote([doc({ tipo: "orcamento", blingId: "80", total: 25 }), doc({ blingId: "81" })], [], R);
    expect(res.get("venda:81")!.detalhe.conversao).toBe(0);
  });
});

describe("semana e mês no relógio da loja", () => {
  it("23h de domingo em Campinas ainda é domingo", () => {
    expect(hojeNaLoja(new Date("2026-10-19T01:30:00Z"))).toBe("2026-10-18");
  });
  it("a semana vai de segunda a domingo e acaba à meia-noite da loja", () => {
    const j = janela("semana", new Date("2026-10-12T12:00:00Z"));
    expect(j.inicio).toBe("2026-10-12");
    expect(j.fim).toBe("2026-10-18");
    expect(j.terminaEm).toBe("2026-10-19T03:00:00.000Z");
    expect(segundaDaSemana("2026-10-18")).toBe("2026-10-12");
  });
  it("o mês acaba no último dia", () => {
    const j = janela("mes", new Date("2026-02-10T12:00:00Z"));
    expect(j.fim).toBe("2026-02-28");
    expect(j.rotulo).toBe("Fevereiro de 2026");
    expect(mesAnterior(1, new Date("2026-01-10T12:00:00Z")).inicio).toBe("2025-12-01");
    expect(semanaAnterior(1, new Date("2026-10-12T12:00:00Z")).inicio).toBe("2026-10-05");
  });
});

function piloto(id: string, p: Partial<Piloto> = {}): Piloto {
  return { id, nome: id, apelido: null, foto: null, cor: "#E60012", kart: "classico", numero: 1, blingVendedorId: `b${id}`, metaSemana: null, metaMes: null, ativo: true, ...p };
}
function lanc(p: Partial<Lancamento>): Lancamento {
  return {
    id: Math.random().toString(), tipo: "venda", origem: "bling", blingId: "1", numero: "1", blingVendedorId: null, pilotoId: null,
    contatoId: null, contatoNome: null, data: "2026-10-13", registradoEm: "", historico: false, total: 0, situacaoId: 6, situacao: null,
    itens: [], licencas: 0, pontos: 10, detalhe: null, status: "valido", motivo: null, anuladoManual: false, pontosManual: null, ...p,
  };
}

describe("placar", () => {
  const j = janela("semana", new Date("2026-10-14T12:00:00Z"));
  it("a linha de chegada é a meta de cada um", () => {
    const pilotos = [piloto("ana", { metaSemana: 20 }), piloto("beto", { metaSemana: 100 })];
    const placar = montarPlacar(pilotos, [
      lanc({ blingVendedorId: "bana", pontos: 20 }),
      lanc({ blingVendedorId: "bbeto", pontos: 50 }),
      lanc({ blingVendedorId: "bbeto", pontos: 500, status: "cancelado" }),
      lanc({ blingVendedorId: "bbeto", pontos: 500, data: "2026-10-01" }),
    ], j, CORRIDA_PADRAO);
    expect(placar.linhas[0].piloto.id).toBe("ana");
    expect(placar.linhas[0].chegou).toBe(true);
    expect(placar.linhas[1].pontos).toBe(50);
    expect(placar.equipe.meta).toBe(120);
    expect(placar.equipe.pontos).toBe(70);
  });
  it("lançamento manual entra pelo id do piloto; piloto inativo fica de fora", () => {
    const placar = montarPlacar([piloto("ana"), piloto("zé", { ativo: false })], [
      lanc({ tipo: "manual", origem: "manual", pilotoId: "ana", pontos: 7 }),
      lanc({ blingVendedorId: "bzé", pontos: 99 }),
    ], j, CORRIDA_PADRAO);
    expect(placar.linhas).toHaveLength(1);
    expect(placar.linhas[0].pontos).toBe(7);
    expect(placar.linhas[0].meta).toBe(CORRIDA_PADRAO.metaPadraoSemana);
  });
  it("meta sugerida: média com 15% a mais, de 5 em 5", () => {
    expect(sugerirMeta([40, 60, 50, 50])).toBe(60);
    expect(sugerirMeta([0, 0])).toBeNull();
  });
});

describe("entrada do vigia", () => {
  it("recusa documento sem id, tipo ou data", () => {
    expect(lerDocumento({ tipo: "venda", blingId: "", data: "2026-10-10" })).toBeNull();
    expect(lerDocumento({ tipo: "x", blingId: "1", data: "2026-10-10" })).toBeNull();
    expect(lerDocumento({ tipo: "venda", blingId: "1", data: "10/10/2026" })).toBeNull();
  });
  it("vendedor 0 do Bling vira 'sem vendedor'", () => {
    expect(lerDocumento({ tipo: "venda", blingId: "27096789495", data: "2026-10-10", vendedorBlingId: 0 })!.vendedorBlingId).toBeNull();
  });
});

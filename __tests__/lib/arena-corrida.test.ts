// @vitest-environment node
import { describe, it, expect } from "vitest";
import { ehLicenca, licencasDa, normalizarRegras, valorar, reais, REGRAS_PADRAO, type DocumentoDoBling } from "@/lib/arena/valores";
import { janela, hojeNaLoja, segundaDaSemana, mesAnterior, semanaAnterior } from "@/lib/arena/periodos";
import { dividirMetas, montarPlacar, sugerirMeta } from "@/lib/arena/placar";
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
  it("soma unidades e reais (valor do Bling é unitário)", () => {
    expect(licencasDa([{ descricao: "Licença Windows 11 Pro", quantidade: 3, valor: 349 }, { descricao: "Mouse", quantidade: 1, valor: 50 }], R)).toEqual({ unidades: 3, valor: 1047 });
  });
});

describe("quanto cada documento vale (em reais)", () => {
  it("venda: o total do pedido; a licença vem separada, sem contar duas vezes", () => {
    const v = valorar(doc({ total: 1200, itens: [{ descricao: "LICENÇA WINDOWS 11 PRO", quantidade: 1, valor: 349 }] }), R);
    expect(v.status).toBe("valido");
    expect(v.valor).toBe(1200);
    expect(v.licencas).toBe(1);
    expect(v.valorLicencas).toBe(349);
  });
  it("venda cancelada ou estornada vale zero; em digitação espera", () => {
    expect(valorar(doc({ situacaoId: 12 }), R).status).toBe("cancelado");
    expect(valorar(doc({ situacaoId: 32598 }), R).valor).toBe(0);
    expect(valorar(doc({ situacaoId: 21 }), R).status).toBe("pendente");
  });
  it("orçamento aparece, mas não soma valor", () => {
    const v = valorar(doc({ tipo: "orcamento", total: 2610 }), R);
    expect(v.status).toBe("valido");
    expect(v.valor).toBe(0);
  });
  it("centavos ficam certos", () => {
    expect(valorar(doc({ total: 1234.565 }), R).valor).toBe(1234.57);
  });
  it("regras do painel: só as palavras da licença", () => {
    const r = normalizarRegras({ venda: 10, licencaPalavras: "windows, office" });
    expect(r).toEqual({ licencaPalavras: ["windows", "office"], licencaExcluir: R.licencaExcluir });
  });
  it("reais no formato da loja", () => {
    expect(reais(63000).replace(/\s/g, " ")).toBe("R$ 63.000");
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
  return { id, slug: id, nome: id, apelido: null, foto: null, cor: "#E60012", kart: "classico", numero: 1, blingVendedorId: `b${id}`, funcao: "vendedor", metaSemana: null, metaMes: null, ativo: true, ...p };
}
function lanc(p: Partial<Lancamento>): Lancamento {
  return {
    id: Math.random().toString(), tipo: "venda", origem: "bling", blingId: "1", numero: "1", blingVendedorId: null, pilotoId: null,
    contatoId: null, contatoNome: null, data: "2026-10-13", registradoEm: "", historico: false, total: 0, situacaoId: 6, situacao: null,
    itens: [], licencas: 0, valorLicencas: 0, valor: 1000, status: "valido", motivo: null, anuladoManual: false, valorManual: null, ...p,
  };
}

describe("metas em reais, divididas entre vendedores e técnicos", () => {
  it("R$ 63 mil na semana e R$ 250 mil no mês, em partes iguais", () => {
    const pilotos = [piloto("ana"), piloto("beto"), piloto("caio", { funcao: "tecnico" })];
    const s = dividirMetas(pilotos, "semana", CORRIDA_PADRAO);
    const m = dividirMetas(pilotos, "mes", CORRIDA_PADRAO);
    expect(s.get("ana")!.meta).toBe(21000);
    expect(s.get("caio")!.meta).toBe(21000);
    expect(m.get("beto")!.meta).toBe(83340); // 250.000 / 3, de 10 em 10 para cima
  });
  it("quem tem meta própria fica com ela; o resto é redividido; inativo não conta", () => {
    const pilotos = [piloto("ana", { metaSemana: 33000 }), piloto("beto"), piloto("caio", { funcao: "tecnico" }), piloto("zé", { ativo: false })];
    const s = dividirMetas(pilotos, "semana", CORRIDA_PADRAO);
    expect(s.get("ana")).toEqual({ meta: 33000, propria: true });
    expect(s.get("beto")).toEqual({ meta: 15000, propria: false });
    expect(s.has("zé")).toBe(false);
  });
});

describe("placar em reais", () => {
  const j = janela("semana", new Date("2026-10-14T12:00:00Z"));
  it("soma vendas e OS; cancelado e fora da semana não entram; equipe usa a meta global", () => {
    const pilotos = [piloto("ana"), piloto("caio", { funcao: "tecnico", blingVendedorId: null })];
    const placar = montarPlacar(pilotos, [
      lanc({ blingVendedorId: "bana", valor: 30000, licencas: 2, valorLicencas: 698 }),
      lanc({ blingVendedorId: "bana", valor: 500, status: "cancelado" }),
      lanc({ blingVendedorId: "bana", valor: 9000, data: "2026-10-01" }),
      lanc({ blingVendedorId: "bana", tipo: "orcamento", valor: 0 }),
      lanc({ tipo: "os", origem: "assistencia", pilotoId: "caio", valor: 450 }),
      lanc({ tipo: "os", origem: "assistencia", pilotoId: null, valor: 999 }), // OS sem técnico: não conta
    ], j, CORRIDA_PADRAO);
    const ana = placar.linhas.find((l) => l.piloto.id === "ana")!;
    const caio = placar.linhas.find((l) => l.piloto.id === "caio")!;
    expect(ana).toMatchObject({ valor: 30000, vendas: 1, valorVendas: 30000, orcamentos: 1, licencas: 2, valorLicencas: 698, meta: 31500, chegou: false });
    expect(caio).toMatchObject({ valor: 450, os: 1, valorOS: 450 });
    expect(placar.linhas[0].piloto.id).toBe("ana");
    expect(placar.equipe).toMatchObject({ valor: 30450, meta: 63000 });
  });
  it("lançamento à mão entra pelo id do piloto (negativo desconta)", () => {
    const placar = montarPlacar([piloto("ana")], [
      lanc({ blingVendedorId: "bana", valor: 2000 }),
      lanc({ tipo: "manual", origem: "manual", pilotoId: "ana", valor: -300 }),
    ], j, CORRIDA_PADRAO);
    expect(placar.linhas[0].valor).toBe(1700);
  });
  it("meta sugerida: média com 15% a mais, de 500 em 500", () => {
    expect(sugerirMeta([20000, 22000, 18000, 20000])).toBe(23000);
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

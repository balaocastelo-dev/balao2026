// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Entregas por motoboy (99), modo simulado (12/10/2026): regras de valor e
// região, cotação, corrida de mentira, avisos e o tradutor do webhook.

const enviados: { destino: string; texto: string }[] = [];
vi.mock("@/lib/arena/whatsapp", () => ({
  enviarAviso: vi.fn(async (destino: string, texto: string) => {
    enviados.push({ destino, texto });
  }),
  listarGrupos: vi.fn(async () => []),
}));
vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async () => {
      throw new Error("as entregas não podem tocar o MySQL");
    }),
  },
  isTursoActive: () => false,
}));

import { _gavetaDeTeste } from "@/lib/arena/gaveta";
import { cotacaoSimulada, motivoParaRecusar, podeMudar, situacaoDaParceira } from "@/lib/entregas/regras";
import {
  avancarSimulada,
  cancelarEntrega,
  chamarMotoboy,
  cotarEntrega,
  destinoDoWhatsApp,
  listarEntregas,
  mudarSituacao,
  textoParaOCliente,
} from "@/lib/entregas/registro";

const pedido = (extra: Record<string, unknown> = {}) => ({
  pedidoId: "pedido-123456789",
  cliente: { nome: "Maria Souza", whatsapp: "(19) 99999-0000" },
  destino: { cep: "13025-000", rua: "Rua Teste", numero: "10", cidade: "Campinas", uf: "SP" },
  valorDosProdutos: 189.9,
  ...extra,
});

beforeEach(() => {
  _gavetaDeTeste();
  enviados.length = 0;
  delete process.env.ENTREGA99_TOKEN;
  delete process.env.ENTREGA_AVISO_INTERNO;
  delete process.env.ENTREGA99_AVISAR_CLIENTE;
  // Sem rede nos testes: a BrasilAPI "não acha" coordenada.
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
});

describe("regras da 99", () => {
  it("recusa acima de R$ 500 e fora da região", () => {
    expect(motivoParaRecusar({ cep: "13025000", valorDosProdutos: 499, veiculo: "moto", distanciaKm: 5 })).toBeNull();
    expect(motivoParaRecusar({ cep: "13025000", valorDosProdutos: 3200, veiculo: "moto", distanciaKm: 5 })).toMatch(/R\$ 500/);
    expect(motivoParaRecusar({ cep: "01310100", valorDosProdutos: 100, veiculo: "moto", distanciaKm: null })).toMatch(/Campinas/);
    expect(motivoParaRecusar({ cep: "13025000", valorDosProdutos: 100, veiculo: "moto", distanciaKm: 40 })).toMatch(/25 km/);
  });

  it("cotação simulada respeita o mínimo e marca distância estimada", () => {
    const perto = cotacaoSimulada("moto", 0.5);
    expect(perto.preco).toBe(9);
    const sem = cotacaoSimulada("moto", null);
    expect(sem.distanciaEstimada).toBe(true);
    expect(sem.modo).toBe("simulado");
  });

  it("situação não anda para trás nem sai de corrida encerrada", () => {
    expect(podeMudar("coletada", "a_caminho_da_loja")).toBe(false);
    expect(podeMudar("solicitada", "coletada")).toBe(true);
    expect(podeMudar("entregue", "cancelada")).toBe(false);
  });

  it("traduz os nomes prováveis de situação da 99", () => {
    expect(situacaoDaParceira("DELIVERED")).toBe("entregue");
    expect(situacaoDaParceira("picked_up")).toBe("coletada");
    expect(situacaoDaParceira("driver_accepted")).toBe("a_caminho_da_loja");
    expect(situacaoDaParceira("canceled")).toBe("cancelada");
    expect(situacaoDaParceira("algo_novo")).toBeNull();
  });

  it("número de WhatsApp ganha o 55", () => {
    expect(destinoDoWhatsApp("(19) 98751-0267")).toBe("5519987510267");
    expect(destinoDoWhatsApp("123")).toBeNull();
  });
});

describe("corridas simuladas", () => {
  it("cota pedido pequeno e recusa notebook caro", async () => {
    const ok = await cotarEntrega({ destino: pedido().destino, valorDosProdutos: 189.9 });
    expect(ok.disponivel).toBe(true);
    const caro = await cotarEntrega({ destino: pedido().destino, valorDosProdutos: 4500 });
    expect(caro.disponivel).toBe(false);
  });

  it("chama, avança até entregue e não chama duas vezes", async () => {
    const e = await chamarMotoboy(pedido());
    expect(e.modo).toBe("simulado");
    expect(e.idNaParceira).toMatch(/^sim_/);
    await expect(chamarMotoboy(pedido())).rejects.toThrow(/já tem motoboy/);

    await avancarSimulada(e.id);
    await avancarSimulada(e.id);
    const fim = await avancarSimulada(e.id);
    expect(fim.situacao).toBe("entregue");
    expect(fim.historico.map((h) => h.situacao)).toEqual(["solicitada", "a_caminho_da_loja", "coletada", "entregue"]);
    await expect(avancarSimulada(e.id)).rejects.toThrow(/terminou/);
  });

  it("webhook repetido não duplica o histórico", async () => {
    const e = await chamarMotoboy(pedido());
    expect((await mudarSituacao(e.idNaParceira, "coletada")).mudou).toBe(true);
    expect((await mudarSituacao(e.idNaParceira, "coletada")).mudou).toBe(false);
    const [salva] = await listarEntregas();
    expect(salva.historico).toHaveLength(2);
  });

  it("cancela e deixa chamar de novo", async () => {
    const e = await chamarMotoboy(pedido());
    const c = await cancelarEntrega(e.id);
    expect(c.situacao).toBe("cancelada");
    const outra = await chamarMotoboy(pedido());
    expect(outra.id).not.toBe(e.id);
  });

  it("no simulado avisa só a loja, nunca o cliente", async () => {
    process.env.ENTREGA_AVISO_INTERNO = "19987510267";
    process.env.ENTREGA99_AVISAR_CLIENTE = "1";
    const e = await chamarMotoboy(pedido());
    await avancarSimulada(e.id);
    expect(enviados.length).toBe(2);
    expect(enviados.every((m) => m.destino === "5519987510267")).toBe(true);
    expect(enviados[0].texto).toMatch(/SIMULADO/);
  });

  it("texto do cliente traz o código quando sai para entrega", async () => {
    const e = await chamarMotoboy(pedido());
    const texto = textoParaOCliente({ ...e, situacao: "coletada" });
    expect(texto).toContain(e.codigoDeVerificacao!);
    expect(texto).toContain("balao.info");
  });

  it("com token e sem o código real, recusa em vez de cobrar errado", async () => {
    process.env.ENTREGA99_TOKEN = "qualquer";
    const r = await cotarEntrega({ destino: pedido().destino, valorDosProdutos: 100 });
    expect(r.disponivel).toBe(false);
    await expect(chamarMotoboy(pedido())).rejects.toThrow(/documentação/);
  });
});

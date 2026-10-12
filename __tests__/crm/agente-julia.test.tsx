import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Agente from "@/components/crm/comando/Agente";
import SeloDoAgente from "@/components/crm/agente/SeloDoAgente";
import type { EstadoDoAgente, PonteComando } from "@/components/crm/comando/tipos";

afterEach(cleanup);

function estado(mais: Partial<EstadoDoAgente> = {}): EstadoDoAgente {
  return {
    config: { modo: "desligado", publico: "teste", vendaAutomatica: true, ligadoEm: null },
    numerosDeTeste: ["5519984515960", "5519987510267"],
    trabalhador: {
      online: true,
      ultimaBatida: Date.now() - 4000,
      info: { modelo: "qwen3:14b", modeloNaPlaca: true, esperando: null, catalogo: { produtos: 4854, atualizadoEm: null } },
    },
    hoje: { resposta: 7, orcamento: 2, venda: 1, transferencia: 3 },
    fila: 0,
    pensando: [],
    sugestoes: [],
    conversas: [
      { chatId: "5519911112222@c.us", nome: "Maria", numero: "5519911112222", situacao: "ativo", ate: null, motivo: null },
      { chatId: "5519933334444@c.us", nome: "Carlos", numero: "5519933334444", situacao: "humano", ate: Date.now() + 1e6, motivo: "vendedor respondeu pelo celular" },
    ],
    recentes: [{ tipo: "venda", em: Date.now() - 60_000, nome: "Maria", texto: "pedido nº 24800 · R$ 3.499,00" }],
    ...mais,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- respostas livres do servidor falso
function ponteFalsa(responder: (caminho: string, init?: RequestInit) => any) {
  const chamadas: { caminho: string; metodo: string; corpo: unknown }[] = [];
  const ponte: PonteComando = {
    chamar: vi.fn(async (caminho: string, init: RequestInit = {}) => {
      chamadas.push({ caminho, metodo: init.method || "GET", corpo: init.body ? JSON.parse(String(init.body)) : null });
      return responder(caminho, init);
    }) as PonteComando["chamar"],
    abrirConversa: vi.fn(),
  };
  return { ponte, chamadas };
}

describe("Centro de Comando — JUL.IA", () => {
  it("mostra o PC no ar, o modo e os números de hoje", async () => {
    const { ponte } = ponteFalsa(() => ({ ok: true, agente: estado() }));
    render(<Agente ponte={ponte} />);
    expect(await screen.findByText("No ar")).toBeTruthy();
    expect(screen.getByText(/Modelo qwen3:14b \(carregado na placa\)/)).toBeTruthy();
    expect(screen.getByText(/4\.854 produtos do site/)).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Desligada" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Vendas").parentElement?.textContent).toContain("1");
    expect(screen.getByText("pedido nº 24800 · R$ 3.499,00")).toBeTruthy();
  });

  it("PC fora do ar avisa que os vendedores seguem atendendo", async () => {
    const { ponte } = ponteFalsa(() => ({ ok: true, agente: estado({ trabalhador: { online: false, ultimaBatida: null, info: null } }) }));
    render(<Agente ponte={ponte} />);
    expect(await screen.findByText("Fora do ar")).toBeTruthy();
    expect(screen.getByText(/ficam para os vendedores/)).toBeTruthy();
  });

  it("liga no automático pelo PUT e pede confirmação para clientes de verdade", async () => {
    const { ponte, chamadas } = ponteFalsa(() => ({ ok: true, agente: estado(), config: {} }));
    render(<Agente ponte={ponte} />);
    fireEvent.click(await screen.findByRole("radio", { name: "Automático" }));
    await waitFor(() => expect(chamadas.some((c) => c.metodo === "PUT")).toBe(true));
    expect(chamadas.find((c) => c.metodo === "PUT")?.corpo).toEqual({ modo: "automatico" });

    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("checkbox", { name: /Só os números de teste/ }));
    expect(confirmar).toHaveBeenCalled();
    expect(chamadas.filter((c) => c.metodo === "PUT")).toHaveLength(1);
    confirmar.mockRestore();
  });

  it("pausa e devolve conversas", async () => {
    const { ponte, chamadas } = ponteFalsa(() => ({ ok: true, agente: estado() }));
    render(<Agente ponte={ponte} />);
    fireEvent.click(await screen.findByRole("button", { name: "Pausar" }));
    fireEvent.click(screen.getByRole("button", { name: "Devolver à JUL.IA" }));
    await waitFor(() =>
      expect(chamadas.map((c) => c.caminho)).toEqual(
        expect.arrayContaining([
          "/api/comando/agente/conversas/5519911112222%40c.us/pausar",
          "/api/comando/agente/conversas/5519933334444%40c.us/retomar",
        ])
      )
    );
  });

  it("servidor sem a atualização: mostra o erro em vez de quebrar", async () => {
    const ponte: PonteComando = {
      chamar: vi.fn(async () => {
        throw new Error("O servidor da loja ainda não recebeu esta atualização.");
      }) as PonteComando["chamar"],
    };
    render(<Agente ponte={ponte} />);
    expect(await screen.findByText(/ainda não recebeu esta atualização/)).toBeTruthy();
  });
});

describe("Selo da JUL.IA na conversa", () => {
  const conversa = (mais = {}) => ({ modo: "automatico", pode: true, motivo: null, situacao: "ativo", ate: null, respondida: true, ...mais });

  it("desligada: não aparece", async () => {
    const { ponte } = ponteFalsa(() => ({ ok: true, conversa: conversa({ modo: "desligado" }), sugestoes: [] }));
    const { container } = render(<SeloDoAgente ponte={ponte} chatId="1@c.us" />);
    await waitFor(() => expect(ponte.chamar).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("atendendo: oferece pausar", async () => {
    const { ponte, chamadas } = ponteFalsa(() => ({ ok: true, conversa: conversa(), sugestoes: [] }));
    render(<SeloDoAgente ponte={ponte} chatId="1@c.us" />);
    fireEvent.click(await screen.findByText("🤖 JUL.IA atendendo"));
    fireEvent.click(screen.getByRole("button", { name: "Pausar nesta conversa" }));
    await waitFor(() => expect(chamadas.some((c) => c.caminho.endsWith("/pausar") && c.metodo === "POST")).toBe(true));
  });

  it("vendedor respondeu: mostra o motivo e devolve", async () => {
    const { ponte, chamadas } = ponteFalsa(() => ({
      ok: true,
      conversa: conversa({ situacao: "humano", motivo: "vendedor respondeu", pode: false }),
      sugestoes: [],
    }));
    render(<SeloDoAgente ponte={ponte} chatId="1@c.us" />);
    fireEvent.click(await screen.findByText(/JUL\.IA fora: vendedor respondeu/));
    fireEvent.click(screen.getByRole("button", { name: "Devolver à JUL.IA" }));
    await waitFor(() => expect(chamadas.some((c) => c.caminho.endsWith("/retomar"))).toBe(true));
  });

  it("copiloto: a sugestão abre sozinha e o vendedor envia", async () => {
    const { ponte, chamadas } = ponteFalsa(() => ({
      ok: true,
      conversa: conversa({ modo: "copiloto" }),
      sugestoes: [{ id: "s1", chatId: "1@c.us", nome: "Maria", criadaEm: Date.now(), respostas: [{ tipo: "texto", texto: "Tenho sim! Para que uso?" }, { tipo: "produto", produtoId: "101" }] }],
    }));
    render(<SeloDoAgente ponte={ponte} chatId="1@c.us" produtoNome={() => "Notebook Teste"} />);
    expect(await screen.findByText("Tenho sim! Para que uso?")).toBeTruthy();
    expect(screen.getByText(/Notebook Teste \(foto, preço e link\)/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(chamadas.some((c) => c.caminho === "/api/comando/agente/sugestoes/s1/enviar")).toBe(true));
  });

  it("servidor sem o agente: o selo some sem erro", async () => {
    const ponte: PonteComando = { chamar: vi.fn(async () => Promise.reject(new Error("404"))) as PonteComando["chamar"] };
    const { container } = render(<SeloDoAgente ponte={ponte} chatId="1@c.us" />);
    await waitFor(() => expect(ponte.chamar).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import DisparoPorTema, { type CampanhaDisparo } from "@/components/crm/disparo/DisparoPorTema";

// Servidor da VPS de mentira: responde as rotas do disparo e anota o que recebeu.
function servidorFalso({ campanhas = [] as CampanhaDisparo[], status404 = false } = {}) {
  const chamadas: { caminho: string; metodo: string; corpo: any }[] = [];
  let lista = [...campanhas];
  const resposta = (corpo: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json" } }));
  const fetchServidor = vi.fn((caminho: string, init: RequestInit = {}) => {
    const metodo = init.method || "GET";
    const corpo = init.body ? JSON.parse(String(init.body)) : null;
    chamadas.push({ caminho, metodo, corpo });
    if (status404 && caminho.startsWith("/api/comando/campanhas")) return resposta({ ok: false }, 404);
    if (caminho === "/api/comando/segmentos") {
      return resposta({
        ok: true,
        itens: [
          { chave: "notebook", nome: "Notebook", contatos: 312, recentes: 40 },
          { chave: "pc_gamer", nome: "PC Gamer", contatos: 120, recentes: 10 },
          { chave: "rede", nome: "Rede e Internet", contatos: 0, recentes: 0 },
        ],
      });
    }
    if (caminho === "/api/comando/etiquetas") {
      return resposta({ ok: true, itens: [{ id: "etq-vip", nome: "VIP", cor: "#000", usos: 3 }] });
    }
    if (caminho === "/api/comando/campanhas" && metodo === "GET") {
      return resposta({
        ok: true,
        itens: lista,
        laco: {
          ligado: true,
          motivo: "fora do horário",
          proximoPassoEm: null,
          janelaAberta: false,
          proximaAbertura: "2026-10-12T12:00:00.000Z",
          enviadosHoje: 37,
          teto: 100,
          conectado: true,
        },
      });
    }
    if (caminho === "/api/comando/campanhas/previa") {
      return resposta({
        ok: true,
        total: 237,
        teto: 100,
        diasDeEnvio: 3,
        exemplo: "Olá, Maria! Tudo bem?\n\nPara não receber mais, responda SAIR.",
        amostra: [
          { chatId: "5500000000101@c.us", nome: "Maria Souza", primeiroNome: "Maria", temas: ["Notebook"] },
          { chatId: "5500000000102@c.us", nome: "Carlos", primeiroNome: "Carlos", temas: ["PC Gamer", "Notebook"] },
        ],
      });
    }
    if (caminho === "/api/comando/campanhas/teste") {
      return resposta({ ok: true, enviados: 2, resultado: [{ numero: "5519987510267", ok: true }, { numero: "5519984515960", ok: true }] });
    }
    if (caminho === "/api/comando/campanhas" && metodo === "POST") {
      const nova = campanha({ id: 9, nome: "Notebook — 12/10", total: 237, pendentes: 237 });
      lista = [nova, ...lista];
      return resposta({ ok: true, campanha: nova });
    }
    const acao = caminho.match(/^\/api\/comando\/campanhas\/(\d+)\/(pausar|retomar|cancelar)$/);
    if (acao) {
      const para = { pausar: "pausada", retomar: "enviando", cancelar: "cancelada" }[acao[2]] as CampanhaDisparo["estado"];
      lista = lista.map((c) => (c.id === Number(acao[1]) ? { ...c, estado: para } : c));
      return resposta({ ok: true, campanha: lista.find((c) => c.id === Number(acao[1])) });
    }
    return resposta({ ok: false, erro: "rota desconhecida" }, 500);
  });
  return { fetchServidor, chamadas };
}

function campanha(extra: Partial<CampanhaDisparo> = {}): CampanhaDisparo {
  return {
    id: 1,
    nome: "PC Gamer — 05/10",
    texto: "Olá, {nome}!",
    estado: "enviando",
    filtro: { temasNomes: ["PC Gamer"], etiquetas: [], contatosEscolhidos: null },
    criadaPor: "Thiago",
    criadaEm: "2026-10-05T13:00:00.000Z",
    fim: null,
    total: 120,
    enviados: 40,
    falhas: 1,
    pulados: 3,
    pendentes: 76,
    ...extra,
  };
}

afterEach(cleanup);

describe("DisparoPorTema", () => {
  it("mostra os temas com a contagem e as etiquetas da loja e da tela, sem repetir", async () => {
    const { fetchServidor } = servidorFalso();
    render(
      <DisparoPorTema
        fetchServidor={fetchServidor}
        avisar={() => {}}
        etiquetasDaTela={[{ nome: "vip", cor: "#111" }, { nome: "Orçamento", cor: "#222" }]}
      />
    );
    expect(await screen.findByRole("button", { name: /Notebook · 312/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /PC Gamer · 120/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "VIP" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Orçamento" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "vip" })).toBeNull();
    // Sem tema nem etiqueta, não dá para pedir prévia nem iniciar.
    expect((screen.getByRole("button", { name: /Ver prévia/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /Iniciar campanha/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("prévia manda o filtro ao servidor e mostra total, amostra e como chega", async () => {
    const { fetchServidor, chamadas } = servidorFalso();
    render(<DisparoPorTema fetchServidor={fetchServidor} avisar={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /Notebook · 312/ }));
    fireEvent.click(screen.getByRole("button", { name: /PC Gamer · 120/ }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: /Ver prévia/ }));

    const caixa = await screen.findByLabelText("Prévia do disparo");
    expect(within(caixa).getByText("237")).toBeTruthy();
    expect(within(caixa).getByText(/3 dia\(s\) de envio no teto de 100\/dia/)).toBeTruthy();
    expect(within(caixa).getByText("Maria Souza")).toBeTruthy();
    expect(within(caixa).getByText(/Como chega para Maria/)).toBeTruthy();

    const pedido = chamadas.find((c) => c.caminho === "/api/comando/campanhas/previa")!;
    expect(pedido.metodo).toBe("POST");
    expect(pedido.corpo.filtro).toEqual({ temas: ["notebook", "pc_gamer"], etiquetas: [], conversouNosUltimosDias: 90 });
    expect(pedido.corpo.texto).toContain("{nome}");

    // Mudou o texto, a prévia some (ela valia para o texto antigo).
    fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Oi {nome}" } });
    expect(screen.queryByLabelText("Prévia do disparo")).toBeNull();
  });

  it("iniciar pede confirmação com o total e os dias, e só então cria a campanha", async () => {
    const { fetchServidor, chamadas } = servidorFalso();
    const avisar = vi.fn();
    render(<DisparoPorTema fetchServidor={fetchServidor} avisar={avisar} />);
    fireEvent.click(await screen.findByRole("button", { name: /Notebook · 312/ }));
    fireEvent.click(screen.getByRole("button", { name: /Iniciar campanha/ }));

    const confirmacao = await screen.findByRole("alertdialog", { name: "Confirmar campanha" });
    expect(confirmacao.textContent).toMatch(/Vai para 237 contato\(s\)/);
    expect(confirmacao.textContent).toMatch(/cerca de 3 dia\(s\) de envio/);
    expect(chamadas.some((c) => c.caminho === "/api/comando/campanhas" && c.metodo === "POST")).toBe(false);

    fireEvent.click(within(confirmacao).getByRole("button", { name: "Confirmar e iniciar" }));
    await waitFor(() => expect(avisar).toHaveBeenCalledWith(expect.stringMatching(/criada: 237 contato/)));
    const criar = chamadas.find((c) => c.caminho === "/api/comando/campanhas" && c.metodo === "POST")!;
    expect(criar.corpo.filtro.temas).toEqual(["notebook"]);
    expect(await screen.findByLabelText("Campanha Notebook — 12/10")).toBeTruthy();
  });

  it("enviar teste chama a rota de teste (só os números da loja, decididos no servidor)", async () => {
    const { fetchServidor, chamadas } = servidorFalso();
    const avisar = vi.fn();
    render(<DisparoPorTema fetchServidor={fetchServidor} avisar={avisar} />);
    fireEvent.click(await screen.findByRole("button", { name: /Enviar teste para meus números/ }));
    await waitFor(() => expect(avisar).toHaveBeenCalledWith(expect.stringMatching(/seus 2 números/)));
    const teste = chamadas.find((c) => c.caminho === "/api/comando/campanhas/teste")!;
    expect(Object.keys(teste.corpo)).toEqual(["texto"]);
  });

  it("lista campanhas com progresso, situação do laço e pausar/retomar/cancelar", async () => {
    const { fetchServidor, chamadas } = servidorFalso({
      campanhas: [campanha(), campanha({ id: 2, nome: "Antiga", estado: "concluida", enviados: 50, total: 50, falhas: 0, pulados: 0, pendentes: 0 })],
    });
    render(<DisparoPorTema fetchServidor={fetchServidor} avisar={() => {}} />);
    const card = await screen.findByLabelText("Campanha PC Gamer — 05/10");
    expect(within(card).getByRole("progressbar").getAttribute("aria-valuenow")).toBe("44");
    expect(card.textContent).toMatch(/40 de 120 enviadas · 3 pulada\(s\) · 1 com erro · 76 na fila/);
    expect(screen.getByText(/Hoje: 37 de 100 · Fora do horário: volta/)).toBeTruthy();
    // Concluída não tem botões.
    expect(within(screen.getByLabelText("Campanha Antiga")).queryByRole("button")).toBeNull();

    fireEvent.click(within(card).getByRole("button", { name: /Pausar/ }));
    await waitFor(() => expect(within(screen.getByLabelText("Campanha PC Gamer — 05/10")).getByText("Pausada")).toBeTruthy());
    expect(chamadas.some((c) => c.caminho === "/api/comando/campanhas/1/pausar" && c.metodo === "POST")).toBe(true);

    const pausada = screen.getByLabelText("Campanha PC Gamer — 05/10");
    fireEvent.click(within(pausada).getByRole("button", { name: /Cancelar/ }));
    expect(chamadas.some((c) => c.caminho.endsWith("/cancelar"))).toBe(false); // pede confirmação antes
    fireEvent.click(within(pausada).getByRole("button", { name: "Confirmar cancelamento" }));
    await waitFor(() => expect(chamadas.some((c) => c.caminho === "/api/comando/campanhas/1/cancelar")).toBe(true));
  });

  it("servidor sem a atualização: avisa que falta o deploy da VPS", async () => {
    const { fetchServidor } = servidorFalso({ status404: true });
    render(<DisparoPorTema fetchServidor={fetchServidor} avisar={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /Notebook · 312/ }));
    fireEvent.click(screen.getByRole("button", { name: /Ver prévia/ }));
    expect(await screen.findByText(/Rode o deploy na VPS/)).toBeTruthy();
  });
});

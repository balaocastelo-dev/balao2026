import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AvisoApagada,
  BarraDeEnvio,
  CorpoDaMensagem,
  LinhaDeLigacao,
  Reacoes,
  TrechoCitado,
  aplicarMudanca,
  extrasDaMensagem,
  maiorSeq,
  maisAntiga,
} from "@/components/crm/mensagem-extras";
import { enviarPorUpload } from "@/components/crm/upload-midia";
import type { CrmMensagem } from "@/types/crm";

const base: CrmMensagem = { id: "M1", chatId: "5500000000101@c.us", from: "x", body: "tem fonte?", direction: "in", timestamp: 1000 };

describe("juntar o que o servidor manda", () => {
  it("extrasDaMensagem só traz o que veio (não apaga o que a tela tinha)", () => {
    expect(extrasDaMensagem({ id: "M1", body: "oi" })).toEqual({});
    expect(
      extrasDaMensagem({ seq: 7, reacoes: [{ emoji: "👍", de: "cliente" }], apagada: true, editadaEm: 5, citada: { id: "Q", trecho: "t" }, ligacao: { estado: "perdida" } })
    ).toEqual({ seq: 7, reacoes: [{ emoji: "👍", de: "cliente" }], apagada: true, editadaEm: 5, citada: { id: "Q", trecho: "t" }, ligacao: { estado: "perdida" } });
  });

  it("aplicarMudanca troca só a mensagem certa e devolve o mesmo array quando ela não está na tela", () => {
    const lista = [base, { ...base, id: "M2" }];
    expect(aplicarMudanca(lista, { id: "NAO", patch: { apagada: true } })).toBe(lista);
    const nova = aplicarMudanca(lista, { id: "M2", patch: { body: "editado", editadaEm: 9 } });
    expect(nova).not.toBe(lista);
    expect(nova[1]).toMatchObject({ id: "M2", body: "editado", editadaEm: 9 });
    expect(nova[0]).toBe(lista[0]);
  });

  it("maiorSeq e maisAntiga", () => {
    expect(maiorSeq(5, undefined, 3, 9, "12", NaN)).toBe(9);
    expect(maisAntiga([{ timestamp: 30 }, { timestamp: 10 }, { timestamp: 20 }])).toBe(10);
    expect(maisAntiga([])).toBeNull();
  });
});

describe("desenho do balão", () => {
  it("apagada pelo cliente mostra o aviso (o texto fica guardado no servidor)", () => {
    render(<AvisoApagada m={{ ...base, apagada: true }} />);
    expect(screen.getByText(/Mensagem apagada pelo cliente/)).toBeTruthy();
  });

  it("editada aparece embaixo do texto", () => {
    render(<CorpoDaMensagem m={{ ...base, body: "tem fonte de 750W?", editadaEm: Date.now() }} />);
    expect(screen.getByText("tem fonte de 750W?")).toBeTruthy();
    expect(screen.getByText("editada")).toBeTruthy();
  });

  it("reações, citação, ligação e barra de envio", () => {
    render(
      <>
        <Reacoes m={{ ...base, reacoes: [{ emoji: "👍", de: "cliente" }, { emoji: "❤️", de: "loja" }] }} />
        <TrechoCitado m={{ ...base, citada: { id: "M0", trecho: "temos sim", deMim: true } }} />
        <LinhaDeLigacao m={{ ...base, body: "", ligacao: { estado: "perdida", video: false } }} />
        <BarraDeEnvio valor={42} />
      </>
    );
    expect(screen.getByTitle("Reação do cliente").textContent).toBe("👍");
    expect(screen.getByTitle("Reação da loja").textContent).toBe("❤️");
    expect(screen.getByText("temos sim")).toBeTruthy();
    expect(screen.getByText("Loja")).toBeTruthy();
    expect(screen.getByText(/Ligação de voz · perdida/)).toBeTruthy();
    expect(screen.getByTitle("Enviando… 42%")).toBeTruthy();
  });

  it("sem extras, nada a desenhar", () => {
    const { container } = render(
      <>
        <Reacoes m={base} />
        <TrechoCitado m={base} />
        <LinhaDeLigacao m={base} />
        <BarraDeEnvio valor={100} />
      </>
    );
    expect(container.innerHTML).toBe("");
  });
});

// XMLHttpRequest de mentira: o teste decide o que acontece.
function xhrFalso() {
  const x = {
    enviado: null as FormData | null,
    cabecalhos: {} as Record<string, string>,
    status: 0,
    responseText: "",
    timeout: 0,
    upload: { onprogress: null as null | ((e: { lengthComputable: boolean; loaded: number; total: number }) => void), onload: null as null | (() => void) },
    onload: null as null | (() => void),
    onerror: null as null | (() => void),
    ontimeout: null as null | (() => void),
    open: () => {},
    setRequestHeader(k: string, v: string) {
      x.cabecalhos[k] = v;
    },
    send(f: FormData) {
      x.enviado = f;
    },
  };
  return x;
}

describe("upload direto com reserva segura", () => {
  const arquivo = new Blob([new Uint8Array(10)], { type: "image/jpeg" });

  it("sucesso: devolve o id e chega a 100%", async () => {
    const x = xhrFalso();
    const progresso: number[] = [];
    const p = enviarPorUpload({ url: "/u", ticket: "v1.t", campos: { chatId: "c", tempId: "t1", vazio: null }, arquivo, nome: "f.jpg", aoProgresso: (v) => progresso.push(v), criarXhr: () => x as never });
    x.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
    x.upload.onload?.();
    x.status = 200;
    x.responseText = JSON.stringify({ ok: true, msgId: "ABC" });
    x.onload?.();
    const r = await p;
    expect(r).toMatchObject({ ok: true, msgId: "ABC", usarReserva: false });
    expect(progresso).toEqual([50, 100]);
    expect(x.cabecalhos.Authorization).toBe("Bearer v1.t");
    expect(x.enviado?.get("chatId")).toBe("c");
    expect(x.enviado?.has("vazio")).toBe(false);
    expect((x.enviado?.get("arquivo") as File).name).toBe("f.jpg");
  });

  it("servidor sem a rota (404): pode usar o caminho antigo", async () => {
    const x = xhrFalso();
    const p = enviarPorUpload({ url: "/u", ticket: "t", campos: {}, arquivo, nome: "f", criarXhr: () => x as never });
    x.status = 404;
    x.onload?.();
    expect(await p).toMatchObject({ ok: false, usarReserva: true });
  });

  it("caiu antes de subir tudo: reserva; caiu depois: NÃO (podia duplicar)", async () => {
    const a = xhrFalso();
    const pa = enviarPorUpload({ url: "/u", ticket: "t", campos: {}, arquivo, nome: "f", criarXhr: () => a as never });
    a.onerror?.();
    expect(await pa).toMatchObject({ ok: false, usarReserva: true });

    const b = xhrFalso();
    const pb = enviarPorUpload({ url: "/u", ticket: "t", campos: {}, arquivo, nome: "f", criarXhr: () => b as never });
    b.upload.onload?.();
    b.onerror?.();
    expect(await pb).toMatchObject({ ok: false, usarReserva: false });
  });

  it("recusa do WhatsApp (422) não manda de novo pelo socket", async () => {
    const x = xhrFalso();
    const p = enviarPorUpload({ url: "/u", ticket: "t", campos: {}, arquivo, nome: "f", criarXhr: () => x as never });
    x.upload.onload?.();
    x.status = 422;
    x.responseText = JSON.stringify({ ok: false, erro: "número inválido" });
    x.onload?.();
    expect(await p).toMatchObject({ ok: false, erro: "número inválido", usarReserva: false });
  });
});

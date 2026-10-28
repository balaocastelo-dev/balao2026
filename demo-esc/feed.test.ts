import { describe, expect, it } from "vitest";
import { feedEstaFresco, normalizarFeed, resolverId } from "./feed";

describe("feed do escritório digital", () => {
  it("resolve o nome da equipe para o id", () => {
    expect(resolverId("João")).toBe("joao");
    expect(resolverId("thiaguito")).toBe("thiaguito");
    expect(resolverId("")).toBeNull();
  });

  it("rejeita corpo que não é o contrato", () => {
    expect(normalizarFeed(null)).toBeNull();
    expect(normalizarFeed({ agents: [] })).toBeNull();
    expect(normalizarFeed({ updatedAt: "não-é-data", agents: [] })).toBeNull();
  });

  it("completa tarefa, fala e whatsapp ausentes", () => {
    const feed = normalizarFeed({
      updatedAt: "2026-10-28T15:00:00.000Z",
      agents: [{ id: "João", name: "", status: "qualquer", talkingTo: "Malaquias" }],
      events: [
        { at: "2026-10-28T15:00:00.000Z", from: "Malaquias", to: "João", text: "Fecha o vídeo?" },
        { at: "data-ruim", from: "joao", to: "malaquias", text: "ignora" },
      ],
    });
    expect(feed?.agents[0]).toMatchObject({
      id: "joao",
      name: "João",
      status: "ocioso",
      currentTask: "",
      lastMessage: "",
      talkingTo: "malaquias",
      whatsappConnected: false,
    });
    expect(feed?.events).toHaveLength(1);
    expect(feed?.events[0]).toMatchObject({ from: "malaquias", to: "joao", text: "Fecha o vídeo?" });
  });

  it("considera fresco só dentro de cinco minutos", () => {
    const agora = Date.parse("2026-10-28T15:00:00.000Z");
    expect(feedEstaFresco("2026-10-28T14:56:00.000Z", agora)).toBe(true);
    expect(feedEstaFresco("2026-10-28T14:50:00.000Z", agora)).toBe(false);
    expect(feedEstaFresco("2026-10-28T15:01:00.000Z", agora)).toBe(true);
    expect(feedEstaFresco("não", agora)).toBe(false);
  });
});

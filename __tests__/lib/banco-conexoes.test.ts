import { describe, it, expect } from "vitest";
import { deveTentarDeNovo, IDLE_MS } from "@/lib/turso";
import { readFileSync } from "fs";

describe("conexão com o banco (cota de 500 conexões/hora)", () => {
  it("conexão parada fica aberta minutos, não 20 segundos", () => {
    expect(IDLE_MS).toBeGreaterThanOrEqual(5 * 60_000);
  });

  it("guarda paradas todas as conexões que abre (senão a limpeza do mysql2 destrói e reabre a cada visita)", () => {
    const fonte = readFileSync("lib/turso.ts", "utf8");
    const limite = Number(fonte.match(/connectionLimit:\s*(\d+)/)?.[1]);
    const maxIdle = Number(fonte.match(/maxIdle:\s*(\d+)/)?.[1]);
    expect(limite).toBeGreaterThan(0);
    expect(maxIdle).toBe(limite);
  });

  it("conexão morta antes de enviar: sempre tenta de novo", () => {
    const e = new Error("Can't add new command when connection is in closed state");
    expect(deveTentarDeNovo(e, "UPDATE orders SET x = 1")).toBe(true);
  });

  it("conexão caída: só repete leitura, nunca gravação", () => {
    const e = Object.assign(new Error("Connection lost: The server closed the connection."), { code: "PROTOCOL_CONNECTION_LOST" });
    expect(deveTentarDeNovo(e, "SELECT * FROM products")).toBe(true);
    expect(deveTentarDeNovo(e, "INSERT INTO orders VALUES (1)")).toBe(false);
  });

  it("cota estourada ou erro de SQL: não repete", () => {
    expect(deveTentarDeNovo(new Error("User x has exceeded the 'max_connections_per_hour' resource"), "SELECT 1")).toBe(false);
    expect(deveTentarDeNovo(Object.assign(new Error("syntax"), { code: "ER_PARSE_ERROR" }), "SELECT 1")).toBe(false);
  });
});

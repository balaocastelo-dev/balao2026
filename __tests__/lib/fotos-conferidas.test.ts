import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import lista from "@/data/fotos-conferidas.json";
import ilustrativas from "@/data/fotos-ilustrativas.json";
import { comFotoConferida, fotoConferida } from "@/lib/precos/fotos-conferidas";

describe("fotos conferidas guardadas no site", () => {
  it("a lista tem exatamente os arquivos da pasta public/fotos-produtos", () => {
    const arquivos = fs
      .readdirSync(path.join(process.cwd(), "public/fotos-produtos"))
      .filter((n) => n.endsWith(".webp"))
      .map((n) => n.replace(/\.webp$/, ""))
      .sort();
    expect([...(lista as string[])].sort()).toEqual(arquivos);
  });

  it("produto com foto conferida volta com ela, mesmo que a fonte mande outra", () => {
    const codigo = (lista as string[])[0];
    const item = comFotoConferida({ codigo, foto: "https://images.kabum.com.br/x.jpg", fotos: ["https://images.kabum.com.br/x.jpg"] });
    expect(item.foto).toBe(`https://www.balao.info/fotos-produtos/${encodeURIComponent(codigo)}.webp`);
    expect(item.fotos).toEqual([item.foto]);
  });

  it("produto sem foto conferida fica como a fonte mandou", () => {
    const item = { codigo: "nao-existe-123", foto: "", fotos: [] as string[] };
    expect(comFotoConferida(item)).toBe(item);
    expect(fotoConferida("nao-existe-123")).toBe("");
  });

  it("os 11 que perderam a foto em 12/10 → 18/10 estão na lista", () => {
    for (const id of ["ts-1772817607229-X5mQX", "ts-1669819119959-X5mQX", "1008715", "694702", "951736"]) {
      expect(fotoConferida(id)).not.toBe("");
    }
  });

  it("toda ilustrativa tem arquivo na pasta e sai com o aviso #ilustrativa", () => {
    for (const id of ilustrativas as string[]) {
      expect((lista as string[]).includes(id)).toBe(true);
      expect(fotoConferida(id).endsWith("#ilustrativa")).toBe(true);
    }
  });
});

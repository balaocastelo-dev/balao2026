// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// A gaveta no Vercel Blob, com um Blob de mentira que respeita as mesmas
// regras do de verdade: privado, "allowOverwrite" e "ifMatch" (etag).

const loja = new Map<string, { corpo: Buffer; etag: string; tipo: string }>();
let n = 0;

vi.mock("@vercel/blob", () => {
  class BlobError extends Error {}
  class BlobPreconditionFailedError extends BlobError {}
  return {
    BlobError,
    BlobPreconditionFailedError,
    get: vi.fn(async (caminho: string, o: { access: string }) => {
      if (o.access !== "private") throw new Error("a Arena só usa Blob privado");
      const x = loja.get(caminho);
      if (!x) return null;
      return { statusCode: 200, stream: new Response(new Uint8Array(x.corpo)).body, blob: { etag: x.etag, contentType: x.tipo } };
    }),
    put: vi.fn(async (caminho: string, corpo: string | Buffer, o: { access: string; allowOverwrite?: boolean; ifMatch?: string; contentType?: string; addRandomSuffix?: boolean }) => {
      if (o.access !== "private" || o.addRandomSuffix) throw new Error("opções erradas");
      const atual = loja.get(caminho);
      if (atual && !o.allowOverwrite) throw new BlobError("Vercel Blob: This blob already exists, use `allowOverwrite: true` if you want to overwrite it.");
      if (o.ifMatch && atual?.etag !== o.ifMatch) throw new BlobPreconditionFailedError("precondition");
      const etag = `"e${++n}"`;
      loja.set(caminho, { corpo: Buffer.from(corpo), etag, tipo: o.contentType ?? "application/octet-stream" });
      return { etag, pathname: caminho };
    }),
  };
});
vi.mock("@/lib/arena/whatsapp", () => ({ enviarAviso: vi.fn(), listarGrupos: vi.fn() }));

import { atualizar, ConflitoDeVersao, gravar, ler, lerArquivo, tipoDaGaveta } from "@/lib/arena/gaveta";
import { gravarDocumentos, lancamentosEntre, salvarPiloto, lerConfig } from "@/lib/arena/dados";
import { hojeNaLoja } from "@/lib/arena/periodos";

beforeEach(() => {
  loja.clear();
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_teste";
  delete process.env.MYSQL_HOST;
});

describe("gaveta no Vercel Blob", () => {
  it("usa o Blob quando a variável existe", () => {
    expect(tipoDaGaveta()).toBe("blob");
  });

  it("usa o Blob ligado pelo painel da Vercel (só BLOB_STORE_ID, login OIDC)", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    process.env.BLOB_STORE_ID = "store_teste";
    expect(tipoDaGaveta()).toBe("blob");
    delete process.env.BLOB_STORE_ID;
  });

  it("guarda em arena/<chave>.json e respeita a versão", async () => {
    const v1 = await gravar("config", { a: 1 }, null);
    expect(loja.has("arena/config.json")).toBe(true);
    await expect(gravar("config", { a: 2 }, null)).rejects.toBeInstanceOf(ConflitoDeVersao);
    await gravar("config", { a: 2 }, v1);
    await expect(gravar("config", { a: 3 }, v1)).rejects.toBeInstanceOf(ConflitoDeVersao);
    expect((await ler<{ a: number }>("config")).dados).toEqual({ a: 2 });
    const r = await atualizar<{ a: number }>("config", () => ({ a: 0 }), (d) => ({ a: d.a + 10 }));
    expect(r.a).toBe(12);
  });

  it("vigia → Blob → corrida, e a foto vira arquivo privado", async () => {
    const png = "data:image/png;base64," + Buffer.from("rosto").toString("base64");
    const id = await salvarPiloto(null, { nome: "Gabriel", blingVendedorId: "222", foto: png });
    const hoje = hojeNaLoja();
    await gravarDocumentos([
      { tipo: "venda", blingId: "9", numero: "9", data: hoje, vendedorBlingId: "222", contatoId: "1", contatoNome: "X", total: 100, situacaoId: 6, situacao: null, itens: [] },
    ]);
    expect(loja.has(`arena/lanc-${hoje.slice(0, 7)}.json`)).toBe(true);
    expect((await lancamentosEntre(hoje, hoje))[0].pontos).toBe(10);
    const foto = (await lerConfig()).pilotos.find((p) => p.id === id)!.foto!;
    const arq = await lerArquivo(foto.slice("gaveta:".length));
    expect(arq?.corpo.toString()).toBe("rosto");
  });
});

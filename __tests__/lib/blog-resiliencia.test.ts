import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// O /blog ficou EM BRANCO de 11/09 a 18/09 porque a Groq aposentou o modelo
// `llama-3.3-70b-versatile`: o 404 subiu da geração de post e derrubou a
// página inteira. Estes testes travam a regra que faltava — provedor de IA
// fora do ar tira o POST, nunca a PÁGINA.

vi.mock("groq-sdk", () => ({
  default: class {
    chat = {
      completions: {
        create: async () => {
          throw Object.assign(
            new Error('404 {"error":{"message":"The model `x` does not exist"}}'),
            { status: 404 }
          );
        },
      },
    };
  },
}));

describe("blog — falha de IA não derruba a página", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GROQ_API_KEY = "chave-de-teste";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("modelo inexistente devolve post sem IA em vez de lançar", async () => {
    const { generateBlogPostFromRss } = await import("../../lib/blog-ai");
    const post = await generateBlogPostFromRss(
      { title: "Notebook novo da marca X", url: "https://exemplo.com/n", summary: "Resumo do lançamento." },
      { slug: "notebook-novo", publishedAtIso: new Date().toISOString(), url: "https://exemplo.com/n" }
    );
    // O importante não é o conteúdo: é ter voltado alguma coisa.
    expect(post).toBeTruthy();
    expect(post.title).toBeTruthy();
  });
});

import { describe, it, expect } from "vitest";
import {
  acharTelefone, classificarPorRegra, decidir, pastaDe,
  rascunhoDeOrcamento, termosDeBusca, tetoNoDia, TETO_MAXIMO,
} from "../../lib/livia";

// O que importa travar aqui é o que só aparece com e-mail de verdade
// chegando: responder duas vezes, responder quem pediu para sair, e
// escrever preço que ninguém conferiu.

const base = {
  messageId: "<1@teste>",
  remetente: "cliente@exemplo.com",
  nome: "Marcos Pereira",
  assunto: "",
  corpo: "",
};

describe("LIV.IA — classificação por regra", () => {
  it("reconhece pedido de orçamento", () => {
    expect(classificarPorRegra({ ...base, assunto: "Orçamento de notebook", corpo: "" }))
      .toBe("orcamento");
    expect(classificarPorRegra({ ...base, assunto: "Dúvida", corpo: "quanto custa o monitor?" }))
      .toBe("orcamento");
  });

  it("descadastro vence orçamento na mesma mensagem", () => {
    // Quem pede para sair pede para sair, mesmo falando de preço junto.
    // Errar para o lado de responder é mandar e-mail para quem disse não.
    const c = classificarPorRegra({
      ...base,
      assunto: "Preço do teclado",
      corpo: "Me remova da lista, não quero receber mais nada.",
    });
    expect(c).toBe("descadastro");
  });

  it("separa devolução de e-mail de mensagem automática comum", () => {
    expect(classificarPorRegra({
      ...base, remetente: "mailer-daemon@googlemail.com",
      assunto: "Delivery Status Notification (Failure)", corpo: "address not found",
    })).toBe("rejeicao");
    expect(classificarPorRegra({
      ...base, remetente: "no-reply@banco.com.br", assunto: "Seu extrato", corpo: "",
    })).toBe("informativo");
  });

  it("fornecedor não é cliente", () => {
    expect(classificarPorRegra({
      ...base, assunto: "Parceria comercial", corpo: "Somos distribuidor e temos tabela de preços",
    })).toBe("fornecedor");
  });

  it("newsletter com rodapé de descadastro NÃO é pedido de descadastro", () => {
    // Aconteceu de verdade na primeira leitura da caixa: Hostinger, Asaas,
    // V4, TikTok e Netshoes entraram como "descadastro" e foram para a lista
    // de supressão só por causa do rodapé. Suprimir fornecedor da loja é o
    // oposto do que a lista serve.
    const nl = {
      ...base,
      remetente: "team@emails.hostinger.com",
      assunto: "Registre seu domínio grátis",
      corpo: "Promoção da semana. " + "conteúdo ".repeat(200) +
             "Se não quer receber mais, clique aqui para descadastrar.",
      mala: true,
    };
    expect(classificarPorRegra(nl)).toBe("informativo");
  });

  it("cliente escrevendo duas linhas pedindo para sair ainda é descadastro", () => {
    const pessoa = {
      ...base,
      remetente: "cliente@exemplo.com",
      assunto: "",
      corpo: "Por favor me remova da lista, não quero receber mais.",
    };
    expect(classificarPorRegra(pessoa)).toBe("descadastro");
  });

  it("confirmação de pedido de marketplace não é pedido de orçamento", () => {
    // Um "Pedido 8214918533896062: pedido confirmado" da AliExpress virou
    // orçamento e gerou rascunho de resposta para um robô.
    const robo = {
      ...base,
      remetente: "transaction@notice.aliexpress.com",
      assunto: "Pedido 8214918533896062: pedido confirmado",
      corpo: "Valor total do pedido: R$ 120,00. " + "detalhes ".repeat(200),
      mala: true,
    };
    expect(classificarPorRegra(robo)).toBe("informativo");
  });

  it("devolução de e-mail continua sendo lida, mesmo sendo automática", () => {
    // É ela que mede a taxa de rejeição da prospecção.
    expect(classificarPorRegra({
      ...base, remetente: "mailer-daemon@googlemail.com",
      assunto: "Delivery Status Notification (Failure)",
      corpo: "address not found", mala: true,
    })).toBe("rejeicao");
  });

  it("devolve null quando não dá para saber por regra", () => {
    expect(classificarPorRegra({ ...base, assunto: "Oi", corpo: "tudo bem?" })).toBeNull();
  });

  it("cada classificação tem pasta", () => {
    expect(pastaDe("orcamento")).toBe("Orcamentos");
    expect(pastaDe("outro")).toBe("A-triar");
  });
});

describe("LIV.IA — telefone no corpo", () => {
  it("acha celular e fixo com DDD", () => {
    expect(acharTelefone("me liga no (19) 98751-0267")).toBe("19987510267");
    expect(acharTelefone("fone 19 3231-4000")).toBe("1932314000");
  });

  it("não confunde CNPJ, CEP e número de nota com telefone", () => {
    expect(acharTelefone("CNPJ 12.345.678/0001-90")).toBeNull();
    expect(acharTelefone("CEP 13024-110")).toBeNull();
    expect(acharTelefone("nota 021619/04")).toBeNull();
  });

  it("recusa número sem DDD — lead que ninguém consegue contatar", () => {
    expect(acharTelefone("98751-0267")).toBeNull();
  });
});

describe("LIV.IA — rascunho de orçamento", () => {
  it("não escreve preço nenhum quando o catálogo não achou nada", () => {
    // A regra dura: número de preço só entra vindo do catálogo.
    const texto = rascunhoDeOrcamento({ ...base, assunto: "Preço do SSD", corpo: "" }, []);
    expect(texto).not.toMatch(/R\$/);
    expect(texto).toContain("modelo exato");
    expect(texto).toContain("Marcos");
  });

  it("usa o preço do catálogo, tal como veio", () => {
    const texto = rascunhoDeOrcamento(
      { ...base, assunto: "SSD 1TB", corpo: "" },
      [{ nome: "SSD Kingston 1TB", preco: "R$ 389,90" }]
    );
    expect(texto).toContain("SSD Kingston 1TB — R$ 389,90");
    expect(texto).toContain("podem mudar");
  });

  it("assina como LIV.IA, que é o que avisa o cliente que não é gente", () => {
    expect(rascunhoDeOrcamento(base, [])).toContain("LIV.IA");
  });
});

describe("LIV.IA — termos de busca", () => {
  it("descarta saudação e palavra genérica", () => {
    const t = termosDeBusca("Bom dia, gostaria de saber o preço do notebook Lenovo");
    expect(t).toContain("notebook");
    expect(t).toContain("lenovo");
    expect(t).not.toContain("gostaria");
    expect(t).not.toContain("preco");
  });
});

describe("LIV.IA — decisão", () => {
  it("orçamento com telefone vira lead da JUL.IA", async () => {
    const d = await decidir({
      ...base, assunto: "Orçamento", corpo: "Quero um SSD. Meu zap é (19) 98765-4321",
    });
    expect(d.acao).toBe("rascunho");
    expect(d.leadPara).toBe("julia");
    expect(d.telefone).toBe("19987654321");
  });

  it("nasce como rascunho, não como resposta enviada", async () => {
    // Orçamento errado respondido em nome da loja não se desfaz.
    const d = await decidir({ ...base, assunto: "Cotação de monitor", corpo: "" });
    expect(d.acao).toBe("rascunho");
    const auto = await decidir({ ...base, assunto: "Cotação de monitor", corpo: "" },
      { modo: "automatico" });
    expect(auto.acao).toBe("responder");
  });

  it("catálogo fora do ar não impede a resposta, só tira os preços", async () => {
    const d = await decidir(
      { ...base, assunto: "Orçamento de teclado", corpo: "" },
      { buscarNoCatalogo: async () => { throw new Error("banco fora"); } }
    );
    expect(d.acao).toBe("rascunho");
    expect(d.resposta).not.toMatch(/R\$/);
  });

  it("quem pede para sair é suprimido, nunca respondido", async () => {
    const d = await decidir({ ...base, assunto: "", corpo: "unsubscribe" });
    expect(d.acao).toBe("suprimir");
    expect(d.resposta).toBeUndefined();
  });

  it("suporte e fornecedor ficam para gente", async () => {
    const d = await decidir({ ...base, assunto: "Somos fabricante", corpo: "revenda" });
    expect(d.acao).toBe("arquivar");
    expect(d.pasta).toBe("Fornecedores");
  });
});

describe("LIV.IA — rampa de aquecimento", () => {
  it("começa baixo e sobe por degraus", () => {
    expect(tetoNoDia(0)).toBe(10);
    expect(tetoNoDia(3)).toBe(10);
    expect(tetoNoDia(4)).toBe(20);
    expect(tetoNoDia(10)).toBe(40);
    expect(tetoNoDia(20)).toBe(60);
  });

  it("para de subir no teto máximo", () => {
    expect(tetoNoDia(60)).toBe(TETO_MAXIMO);
    expect(tetoNoDia(3650)).toBe(TETO_MAXIMO);
  });
});

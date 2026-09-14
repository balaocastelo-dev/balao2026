#!/usr/bin/env node
/**
 * Servidor MCP do Bling da Balão.
 *
 * Serve para conversar com o ERP: "quanto vendemos ontem", "quem está
 * devendo", "acha o cliente desse telefone". Roda no computador do Thiago e
 * é falado pelo Claude Desktop.
 *
 * NÃO fala com o Bling direto — fala com o site (www.balao.info), que já tem
 * o token, o refresh e o limite de 3 req/s num lugar só. Dois clientes com
 * credencial própria girariam o refresh_token um por cima do outro (o Bling
 * mata o token anterior a cada renovação) e a conexão cairia sozinha. Além
 * disso: o que fica guardado aqui é um token de máquina revogável, não a
 * credencial do ERP inteiro.
 *
 * Doze ferramentas: dez de leitura e duas de escrita (criar contato e emitir
 * pedido de venda). As duas de escrita exigem `confirmar: true`, que o
 * servidor só manda quando a ferramenta é chamada com confirmacao=true — o
 * passo entre "acho que ele quer um pedido" e "emiti um pedido" tem que ser
 * explícito, porque quem está do outro lado é um modelo de linguagem
 * interpretando uma conversa.
 *
 * Configuração (claude_desktop_config.json):
 *
 *   "balao-bling": {
 *     "command": "node",
 *     "args": ["C:\\caminho\\para\\mcp-bling\\servidor.mjs"],
 *     "env": { "BALAO_URL": "https://www.balao.info", "BETO_TOKEN": "..." }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE = (process.env.BALAO_URL || "https://www.balao.info").replace(/\/$/, "");
const TOKEN = (process.env.BETO_TOKEN || "").trim();

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function diasAtras(n) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

async function escrever(corpo) {
  if (!TOKEN) return { erro: "BETO_TOKEN não configurado neste servidor MCP." };
  try {
    const resposta = await fetch(`${BASE}/api/bling/acao`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(60_000),
    });
    if (resposta.status === 401) return { erro: "Token recusado pelo site." };
    return await resposta.json();
  } catch (erro) {
    return { erro: `Não consegui falar com o site: ${erro.message}` };
  }
}

async function consultar(parametros) {
  if (!TOKEN) {
    return { erro: "BETO_TOKEN não configurado neste servidor MCP." };
  }
  const busca = new URLSearchParams(
    Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  try {
    const resposta = await fetch(`${BASE}/api/bling/consulta?${busca}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(60_000),
    });
    if (resposta.status === 401) return { erro: "Token recusado pelo site." };
    if (!resposta.ok) return { erro: `Site respondeu ${resposta.status}.` };
    return await resposta.json();
  } catch (erro) {
    return { erro: `Não consegui falar com o site: ${erro.message}` };
  }
}

const FERRAMENTAS = [
  {
    name: "bling_estado",
    description:
      "Diz se o Bling está conectado ao site e quando o token expira. Use isto primeiro quando outra ferramenta devolver erro de conexão.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "bling_vendas_do_dia",
    description:
      "Fechamento de um dia: faturamento, número de pedidos, clientes, ticket médio, quebra por vendedor e os maiores pedidos. Sem data, usa hoje.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "AAAA-MM-DD. Padrão: hoje." },
      },
    },
  },
  {
    name: "bling_pedidos",
    description:
      "Lista pedidos de venda num intervalo de datas, com cliente, valor e situação. Sem datas, usa os últimos 7 dias.",
    inputSchema: {
      type: "object",
      properties: {
        de: { type: "string", description: "AAAA-MM-DD" },
        ate: { type: "string", description: "AAAA-MM-DD" },
      },
    },
  },
  {
    name: "bling_contas_a_receber",
    description:
      "Contas a receber num intervalo de vencimento — quem está devendo e quanto. Sem datas, usa os últimos 90 dias até hoje (ou seja, o que já venceu).",
    inputSchema: {
      type: "object",
      properties: {
        de: { type: "string", description: "AAAA-MM-DD (vencimento inicial)" },
        ate: { type: "string", description: "AAAA-MM-DD (vencimento final)" },
      },
    },
  },
  {
    name: "bling_buscar_cliente",
    description: "Procura clientes pelo nome ou parte dele.",
    inputSchema: {
      type: "object",
      properties: { busca: { type: "string", description: "Nome ou parte do nome" } },
      required: ["busca"],
    },
  },
  {
    name: "bling_compras_do_cliente",
    description:
      "Histórico de pedidos de um cliente. Use o id que vem de bling_buscar_cliente ou bling_cliente_por_telefone. Sem datas, olha os últimos 365 dias.",
    inputSchema: {
      type: "object",
      properties: {
        contatoId: { type: "string" },
        de: { type: "string", description: "AAAA-MM-DD" },
        ate: { type: "string", description: "AAAA-MM-DD" },
      },
      required: ["contatoId"],
    },
  },
  {
    name: "bling_produtos",
    description:
      "Procura produtos no Bling por nome ou código, com preço e saldo em estoque.",
    inputSchema: {
      type: "object",
      properties: {
        busca: { type: "string", description: "Nome ou parte do nome" },
        codigo: { type: "string", description: "Código do produto" },
      },
    },
  },
  {
    name: "bling_situacoes_de_pedido",
    description:
      "Lista os códigos de situação de pedido de venda (em aberto, atendido, cancelado...). Use antes de interpretar o campo situacao de um pedido — lá vem um id, não um nome.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "bling_nota_do_pedido",
    description: "Nota fiscal emitida para um pedido de venda, quando existe.",
    inputSchema: {
      type: "object",
      properties: { pedidoId: { type: "string" } },
      required: ["pedidoId"],
    },
  },
  {
    name: "bling_criar_contato",
    description:
      "Cria um cliente no Bling. ESCRITA: confirme com o Thiago antes e chame com confirmacao=true.",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string" },
        telefone: { type: "string" },
        email: { type: "string" },
        documento: { type: "string", description: "CPF ou CNPJ" },
        confirmacao: {
          type: "boolean",
          description: "true só depois de o Thiago confirmar em palavras.",
        },
      },
      required: ["nome", "confirmacao"],
    },
  },
  {
    name: "bling_emitir_pedido",
    description:
      "Emite um pedido de venda no Bling. ESCRITA no faturamento da loja: confirme item, quantidade e valor com o Thiago e só então chame com confirmacao=true.",
    inputSchema: {
      type: "object",
      properties: {
        contatoId: { type: "string", description: "id do cliente no Bling" },
        itens: {
          type: "array",
          description: "Cada item precisa de descricao, quantidade > 0 e valor > 0.",
          items: {
            type: "object",
            properties: {
              produtoId: { type: "string" },
              descricao: { type: "string" },
              quantidade: { type: "number" },
              valor: { type: "number" },
            },
            required: ["descricao", "quantidade", "valor"],
          },
        },
        observacoes: { type: "string" },
        confirmacao: {
          type: "boolean",
          description: "true só depois de o Thiago confirmar em palavras.",
        },
      },
      required: ["contatoId", "itens", "confirmacao"],
    },
  },
  {
    name: "bling_cliente_por_telefone",
    description:
      "Acha o cliente dono de um telefone. Compara só os dígitos finais, porque o cadastro varia entre com e sem DDD.",
    inputSchema: {
      type: "object",
      properties: { telefone: { type: "string" } },
      required: ["telefone"],
    },
  },
];

const servidor = new Server(
  { name: "balao-bling", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

servidor.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: FERRAMENTAS }));

servidor.setRequestHandler(CallToolRequestSchema, async (pedido) => {
  const { name, arguments: args = {} } = pedido.params;

  let resultado;
  switch (name) {
    case "bling_estado":
      resultado = await consultar({ recurso: "estado" });
      break;
    case "bling_vendas_do_dia":
      resultado = await consultar({ recurso: "resumo-dia", data: args.data });
      break;
    case "bling_pedidos":
      resultado = await consultar({
        recurso: "pedidos",
        de: args.de || diasAtras(7),
        ate: args.ate || hoje(),
      });
      break;
    case "bling_contas_a_receber":
      resultado = await consultar({
        recurso: "contas",
        de: args.de || diasAtras(90),
        ate: args.ate || hoje(),
      });
      break;
    case "bling_buscar_cliente":
      resultado = await consultar({ recurso: "contatos", busca: args.busca });
      break;
    case "bling_cliente_por_telefone":
      resultado = await consultar({ recurso: "contato-telefone", telefone: args.telefone });
      break;
    case "bling_compras_do_cliente":
      resultado = await consultar({
        recurso: "pedidos-do-cliente",
        contatoId: args.contatoId,
        de: args.de || diasAtras(365),
        ate: args.ate || hoje(),
      });
      break;
    case "bling_produtos":
      resultado = await consultar({
        recurso: "produtos",
        busca: args.busca,
        codigo: args.codigo,
      });
      break;
    case "bling_situacoes_de_pedido":
      resultado = await consultar({ recurso: "situacoes" });
      break;
    case "bling_nota_do_pedido":
      resultado = await consultar({ recurso: "nota", pedidoId: args.pedidoId });
      break;
    case "bling_criar_contato":
      resultado = args.confirmacao
        ? await escrever({
            acao: "criar-contato",
            confirmar: true,
            nome: args.nome,
            telefone: args.telefone,
            email: args.email,
            documento: args.documento,
          })
        : { erro: "Não criei nada. Confirme com o Thiago e chame de novo com confirmacao=true." };
      break;
    case "bling_emitir_pedido":
      resultado = args.confirmacao
        ? await escrever({
            acao: "criar-pedido",
            confirmar: true,
            contatoId: args.contatoId,
            itens: args.itens,
            observacoes: args.observacoes,
          })
        : { erro: "Não emiti nada. Leia os itens e os valores para o Thiago, espere ele confirmar, e chame de novo com confirmacao=true." };
      break;
    default:
      resultado = { erro: `ferramenta desconhecida: ${name}` };
  }

  // Erro volta como conteúdo normal, não como exceção: o modelo precisa
  // conseguir ler "o Bling não está conectado" e contar isso ao Thiago, em
  // vez de receber uma falha de protocolo e não saber o que aconteceu.
  return {
    content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }],
    isError: Boolean(resultado?.erro),
  };
});

await servidor.connect(new StdioServerTransport());

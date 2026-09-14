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
 * Só leitura. Emitir pedido é escrita no faturamento da loja; isso não entra
 * por um servidor de consulta que roda num desktop.
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

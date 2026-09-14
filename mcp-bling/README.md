# MCP do Bling — Balão

Consultar o ERP conversando: "quanto vendemos ontem", "quem está devendo",
"acha o cliente desse telefone".

## Instalar

```
cd mcp-bling
npm install
```

## Ligar no Claude Desktop

No `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "balao-bling": {
      "command": "node",
      "args": ["C:\\Users\\user\\Documents\\balao2026\\mcp-bling\\servidor.mjs"],
      "env": {
        "BALAO_URL": "https://www.balao.info",
        "BETO_TOKEN": "o mesmo BETO_TOKEN do site"
      }
    }
  }
}
```

## Por que ele não fala com o Bling direto

O token do Bling, o refresh e o limite de 3 requisições por segundo vivem num
lugar só: `lib/bling.ts`, no site. Cada refresh do Bling invalida o
refresh_token anterior — dois clientes renovando por conta própria derrubariam
a conexão um do outro, e o erro só apareceria depois de horas.

E tem o lado prático: o que fica guardado no desktop é um token de máquina que
dá para revogar trocando uma variável de ambiente. A credencial do ERP não sai
do servidor.

## Só leitura

Emitir pedido é escrita no faturamento da loja. Não entra por um servidor de
consulta rodando num desktop.

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

## As 12 ferramentas

Leitura (10): estado da conexão, vendas do dia, pedidos por período, compras de
um cliente, contas a receber, buscar cliente por nome, cliente por telefone,
produtos com preço e estoque, situações de pedido, nota fiscal de um pedido.

Escrita (2): criar contato e emitir pedido de venda.

## A trava das duas de escrita

As duas exigem `confirmacao=true`, e sem isso o servidor devolve uma recusa
pedindo para confirmar com o Thiago primeiro. O site exige a mesma coisa
(`confirmar: true`) na sua ponta, em rota separada da consulta.

Parece redundante e não é. Quem chama estas ferramentas é um modelo lendo uma
conversa, e o passo entre "acho que ele quer um pedido" e "emiti um pedido"
precisa ser explícito. A validação de item (quantidade > 0, valor > 0) também
roda antes de sair daqui: item a R$ 0,00 entra no Bling como pedido válido e
alguém só descobre no fechamento do mês.

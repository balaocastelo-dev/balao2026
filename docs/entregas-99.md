# Entregas por motoboy (99Entrega)

Pedido do Thiago em 12/10/2026: chamar motoboy da 99 a partir do site para entregar os pedidos.

## Situação

- **Modo simulado** (agora): a API da 99 só é liberada para conta **99 Empresas**, com token pedido por e-mail.
  Rascunho do e-mail para `api-suporte@99app.com` deixado no Gmail da loja em 12/10 (falta o Thiago enviar).
- Sem token, o módulo funciona inteiro com cotação estimada e corridas de teste. Nada sai para a 99 e nenhum
  cliente recebe mensagem. A opção de motoboy fica **escondida no carrinho**.

## Limite da 99 que pesa para a loja

Item de até **R$ 500** (moto e carro), caber no baú da moto (35 × 40 × 30 cm, até 10 kg). Notebook, placa de
vídeo, monitor e PC ficam de fora. A pergunta sobre limite maior para a 99 Empresas está no e-mail.
Para mudar: `LIMITE_DE_VALOR` em `lib/entregas/regras.ts`.

## Onde está

| O quê | Onde |
|---|---|
| Tipos | `lib/entregas/tipos.ts` |
| Regras (valor, região até 25 km, CEP 13xxx, tabela simulada, situações) | `lib/entregas/regras.ts` |
| Conversa com a 99 (simulado / real) | `lib/entregas/provedor-99.ts` |
| Caderno das corridas e avisos no WhatsApp | `lib/entregas/registro.ts` (guarda na gaveta da Arena: Vercel Blob, fora do MySQL) |
| Tela | `/painel/entregas` (menu Vendas → Entregas por motoboy) |
| Cotação do carrinho (pública) | `POST /api/entregas/cotar` |
| Painel (com senha) | `GET/POST /api/entregas/painel` — ações `cotar`, `chamar`, `cancelar`, `avancar` (só simulado) |
| Aviso da 99 | `POST /api/entregas/webhook` (exige segredo) |
| Testes | `__tests__/lib/entregas.test.ts` |

## Variáveis na Vercel

| Variável | Para quê |
|---|---|
| `ENTREGA99_TOKEN` | Liga o modo real. **Não cadastrar antes de escrever o código real** (dá erro de propósito). |
| `ENTREGA99_NO_CARRINHO=1` | Mostra "Motoboy 99 (hoje)" no carrinho. Só vale com o modo real. |
| `ENTREGA99_WEBHOOK_SEGREDO` | Segredo do webhook; vai no cabeçalho `x-balao-segredo` ou em `?segredo=`. |
| `ENTREGA_AVISO_INTERNO` | Número (com DDD) ou grupo da loja que recebe aviso de cada corrida. |
| `ENTREGA99_AVISAR_CLIENTE=1` | Avisa o cliente no WhatsApp. Só no modo real. |

## Quando o token chegar

1. Ler a documentação da 99 e preencher `provedorReal` em `lib/entregas/provedor-99.ts` (cotar, criar, cancelar).
2. Ajustar o webhook (`app/api/entregas/webhook/route.ts`) e o tradutor `situacaoDaParceira` aos nomes reais.
3. Cadastrar `ENTREGA99_TOKEN` e `ENTREGA99_WEBHOOK_SEGREDO` na Vercel; registrar na 99 a URL
   `https://www.balao.info/api/entregas/webhook?segredo=…`.
4. Testar uma corrida real pelo painel com pedido do próprio Thiago.
5. Só então ligar `ENTREGA99_NO_CARRINHO=1` e `ENTREGA99_AVISAR_CLIENTE=1`.

## Depois

- Um MCP próprio em cima dessas funções, para a JUL.IA cotar/chamar motoboy pelo CRM.
- Um segundo provedor (outra empresa de entrega com seguro maior) para os produtos acima de R$ 500.

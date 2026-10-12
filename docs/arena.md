# Arena de vendas

Corrida de vendas que passa na TV da loja (`www.balao.info/arena`), administrada em `/painel/arena`.
Refeita em 12/10/2026 a pedido do Thiago: ligada ao Bling, com cara de jogo de kart.

**Desde 12/10 (15h) tudo é em reais, não em pontos.** Pedido do Thiago: "venda conta como valor, licença
como valor, cada ordem de serviço conta como valor"; meta global de **R$ 250.000 no mês e R$ 63.000 na
semana**, dividida entre vendedores e técnicos. A hora do turbo saiu (multiplicar dinheiro não faz sentido).

**Desde 12/10 à tarde a Arena não usa o MySQL.** O banco da Hostinger tem cota de 500 conexões por hora e,
quando estoura, para o site inteiro (aconteceu às 8h56 de 12/10). A Arena guarda tudo na "gaveta"
(`lib/arena/gaveta.ts`): **Vercel Blob privado** quando existe `BLOB_STORE_ID` (Blob ligado pelo painel da Vercel, login OIDC — é o caso desde 12/10) ou `BLOB_READ_WRITE_TOKEN`;
sem ela, cai na reserva (tabela `arena_ajustes` do MySQL, chaves `g:…`) com cache mais longo. Quando o Blob é
criado, a Arena copia sozinha o que estava na reserva (`lib/arena/migracao.ts`).

Para criar o Blob (a Vercel não deixa o Claude criar): projeto balao2026 → Storage → Create → Blob, nome
`balao-arena`, Private, São Paulo (gru1) → Connect ao projeto. Depois, um redeploy.

## Como funciona

```
Bling ──(vigia no PC, a cada 2 min)──▶ POST /api/arena/bling ──▶ gaveta: lanc-AAAA-MM
Fechamento da assistência ──(cada OS salva/apagada)──▶ /api/weekly/orders ──▶ gaveta: lanc-AAAA-MM
                                                                     │
        /painel/arena (pilotos, metas, regras, prêmio, avisos) ──▶ gaveta: config
                                                                     ▼
                                    corrida recalculada ──▶ gaveta: telao ──▶ WhatsApp (avisos)
                                                                     │
              GET /api/arena/estado (CDN 10 s) ──▶ /arena (telão) e /arena/<piloto> (celular)
```

- **Vigia** (`scripts/arena-vigia/`): roda no PC porque o token do Bling só existe lá (a sentinela do Bionic
  renova; o vigia só lê). Lista pedidos de venda e propostas comerciais, abre o detalhe do que é novo ou mudou
  (vendedor e itens só vêm no detalhe) e entrega ao site com a chave do vigia. Ver o LEIA-ME da pasta.
- **Chave do vigia**: por pareamento (o instalador mostra um código, o painel aprova) ou gerada no painel. A
  gaveta guarda só o resumo (sha256).
- **Valores** (`lib/arena/valores.ts`): calculados no site. Refazer (aba Conexão → "Refazer os valores", ou
  salvar as palavras da licença) refaz tudo o que já entrou.
- **Placar** (`lib/arena/placar.ts`): semana (segunda a domingo) e mês, no relógio de Campinas. A meta da equipe
  é dividida em partes iguais entre os pilotos ativos (vendedores e técnicos); quem tem meta própria fica com
  ela e o resto é redividido (`dividirMetas`, de 10 em 10 reais para cima). A linha de chegada de cada piloto é
  a meta dele; a posição é o quanto da própria meta já fez.
- **Telão** (`app/arena/Telao.tsx`): palco de 1920 × 1080 escalado para a tela. Mostra os valores em reais (o
  endereço é público); nunca o nome do cliente.

## O que conta (em reais)

| | conta |
|---|---|
| Venda (pedido de venda no Bling) | o total do pedido, para o vendedor do pedido |
| Licença Windows/Office | já está dentro da venda; o placar mostra à parte quantas e quanto (sem somar duas vezes) |
| Ordem de serviço (Fechamento da assistência) | mão de obra + peças, para o técnico da OS |
| Orçamento (proposta comercial) | aparece no placar (quantos), vale R$ 0 |
| Lançado à mão no painel | o valor digitado (negativo desconta) |
| Venda cancelada/estornada no Bling (situações 12, 32597, 32598) | sai (R$ 0) |
| Em digitação (21) | espera |

Licença = item cujo nome tem "windows", "office", "microsoft 365"… e nenhuma palavra de exclusão
(notebook, computador, pc, cadeira, mesa…). As duas listas ficam na aba Como conta. O valor do item no Bling é
unitário (valor × quantidade).

## Ordens de serviço (técnicos)

- O piloto tem **função**: vendedor ou técnico. Técnicos aparecem no Fechamento da assistência
  (`GET /api/weekly/tecnicos`), que passou a pedir o técnico de cada OS (coluna `weekly_orders.tecnico_id`,
  criada na primeira gravação).
- Salvar uma OS no Fechamento grava `os:<id>` na gaveta (`registrarOS`); apagar tira (`apagarOS`). "Zerar a
  semana" do Fechamento **não** tira nada da Arena. Se a Arena falhar, a OS é salva do mesmo jeito.
- OS sem técnico fica guardada sem contar; o técnico pode ser escolhido na aba Vendas e OS do painel (e não se
  perde se a OS vier de novo sem técnico).
- "Trazer as OS do Fechamento" (aba Como conta) copia as OS que já estavam lançadas (`lib/arena/assistencia.ts`).

## De pontos para reais (12/10, 15h)

A configuração passou para a versão 3. Ao ler a versão 2 (`migrarParaReais` em `lib/arena/dados.ts`): as metas
dos pilotos (que eram em pontos) são apagadas, a meta da equipe vira R$ 63 mil / R$ 250 mil, o turbo sai, e os
lançamentos guardados são refeitos em reais (venda = total; pontos lançados à mão viram "anulado", porque pontos
não viram dinheiro). O telão guardado em pontos é descartado e refeito.

## A gaveta (documentos JSON)

| documento | o que guarda |
|---|---|
| `config` | versão 3: pilotos (com `slug` e `funcao`), palavras da licença, metas em reais, prêmio, avisos do WhatsApp, vendedores do Bling, resumo da chave do vigia, varredura pedida |
| `lanc-AAAA-MM` | do mês: vendas e orçamentos do Bling (`venda:<id>`, `orcamento:<id>`), OS do Fechamento (`os:<id>`) e lançados à mão (`manual:<uuid>`) |
| `telao` | a corrida já calculada (o telão só lê isto) |
| `vigia` | última conversa do vigia (gravada de 10 em 10 min quando nada muda) |
| `avisos` | o que já foi avisado no WhatsApp (cada aviso sai uma vez) |
| `fotos/<…>` | fotos dos pilotos (192 px), servidas por `/api/arena/foto/<id>` |

Toda gravação é condicional à versão lida (etag do Blob): vigia e painel ao mesmo tempo não se atropelam.
Anular ou trocar o valor no painel nunca é desfeito pelo Bling nem pelo Fechamento.

As tabelas `arena_vendedores`, `arena_lancamentos`, `arena_vendas`, `arena_config` e `arena_eventos_midia` ficaram
no MySQL só como histórico (a primeira configuração da gaveta copia pilotos e chave de lá).
`app/arena/actions.ts` e `/api/arena/vendedores` continuam porque o caixa (PDV) e os indicadores leem
`arena_vendedores`.

## Telão

- Semáforo de largada ao abrir; karts andam até a própria meta; quem bate a meta cruza a linha e estaciona
  depois da chegada com a bandeirada.
- Outdoor com a viagem do Airbnb depois da linha de chegada, com "faltam R$ X" da meta da equipe.
- Faixas: venda, "Turbo dourado" (venda com licença), OS entregue, lançamento à mão, "Ultrapassagem".
- Festa de tela cheia quando alguém bate a meta e quando a equipe bate a meta.
- Semana e mês alternando a cada 45 s (ou fixo, no painel). Som sintetizado (precisa de um clique em "Ligar
  som" na TV). Tela cheia, cursor some sozinho, tela não apaga (Wake Lock).
- Karts e personagens são desenhos originais: nada da Nintendo.

## Avisos no WhatsApp (12/10)

Pela linha da loja, para um grupo da equipe (escolhido na lista dos grupos da loja) ou um número. Avisa quando
alguém cruza a linha, quando a equipe bate a meta (com a viagem) e, se ligado, troca de líder da semana
(valores em reais). Os avisos saem pelas rotas `/api/arena/grupos` e `/api/arena/aviso` do servidor do
WhatsApp (`whatsapp-server/servidor.js`), que **precisam do deploy da VPS** (`deploy-evo.ps1`). Não entram no
CRM, só aceitam grupo ou número brasileiro e têm freio de 30 por hora. Comparação em `lib/arena/avisos.ts`.

## Página de cada piloto (12/10)

`www.balao.info/arena/<nome>` (o endereço aparece no cartão do piloto no painel). Feita para o celular:
posição, quanto falta em reais para a linha de chegada, "para cruzar a linha: R$ X por dia até o fim da semana
ou N vendas (ou OS) do seu valor médio", quem está logo à frente e atrás, a meta da equipe com a viagem e as
últimas jogadas. Pública como o telão: sem nome de cliente.

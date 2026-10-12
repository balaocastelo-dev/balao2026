# Arena de vendas

Corrida de vendas que passa na TV da loja (`www.balao.info/arena`), administrada em `/painel/arena`.
Refeita em 12/10/2026 a pedido do Thiago: ligada ao Bling, com cara de jogo de kart.

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
                                                                     │
        /painel/arena (pilotos, regras, metas, prêmio, turbo, avisos) ──▶ gaveta: config
                                                                     ▼
                                    corrida recalculada ──▶ gaveta: telao ──▶ WhatsApp (avisos)
                                                                     │
              GET /api/arena/estado (CDN 10 s) ──▶ /arena (telão) e /arena/<piloto> (celular)
```

- **Vigia** (`scripts/arena-vigia/`): roda no PC porque o token do Bling só existe lá (a sentinela do Bionic
  renova; o vigia só lê). Lista pedidos de venda e propostas comerciais, abre o detalhe do que é novo ou mudou
  (vendedor e itens só vêm no detalhe) e entrega ao site com a chave do vigia. Ver o LEIA-ME da pasta.
- **Chave do vigia**: gerada no painel (aba Conexão com o Bling). O banco guarda só o resumo (sha256).
- **Pontos** (`lib/arena/pontos.ts`, `lib/arena/lote.ts`): calculados no site, com as regras do painel.
  Mudar as regras recalcula tudo o que já entrou.
- **Placar** (`lib/arena/placar.ts`): semana (segunda a domingo) e mês, no relógio de Campinas. A linha de chegada
  de cada piloto é a meta dele; a posição é o quanto da própria meta já fez.
- **Telão** (`app/arena/Telao.tsx`): palco de 1920 × 1080 escalado para a tela. Público: não mostra nome de
  cliente nem valor em reais.

## Regras de pontos (padrão, editáveis)

| | pontos |
|---|---|
| Venda (pedido de venda no Bling) | 10 |
| Orçamento (proposta comercial) | 2 — só a partir de R$ 100, e um por cliente/vendedor/dia |
| Licença Windows/Office na venda | +15 por unidade |
| Orçamento que virou venda (mesmo cliente, até 30 dias antes) | +5 |
| Turbo do ticket | +1 a cada R$ 500 |
| Venda cancelada/estornada no Bling (situações 12, 32597, 32598) | perde os pontos |
| Em digitação (21) | espera |

Licença = item cujo nome tem "windows", "office", "microsoft 365"… e nenhuma palavra de exclusão
(notebook, computador, pc, cadeira, mesa…). As duas listas ficam na aba Pontuação.

## A gaveta (documentos JSON)

| documento | o que guarda |
|---|---|
| `config` | pilotos (com `slug` da página), regras, metas, prêmio, turbo, avisos do WhatsApp, vendedores do Bling, resumo da chave do vigia, varredura pedida |
| `lanc-AAAA-MM` | vendas e orçamentos do Bling do mês (`venda:<id>`, `orcamento:<id>`) e pontos à mão (`manual:<uuid>`) |
| `telao` | a corrida já calculada (o telão só lê isto) |
| `vigia` | última conversa do vigia (gravada de 10 em 10 min quando nada muda) |
| `avisos` | o que já foi avisado no WhatsApp (cada aviso sai uma vez) |
| `fotos/<…>` | fotos dos pilotos (192 px), servidas por `/api/arena/foto/<id>` |

Toda gravação é condicional à versão lida (etag do Blob): vigia e painel ao mesmo tempo não se atropelam.
Anular ou trocar pontos no painel nunca é desfeito pelo Bling.

As tabelas `arena_vendedores`, `arena_lancamentos`, `arena_vendas`, `arena_config` e `arena_eventos_midia` ficaram
no MySQL só como histórico (a primeira configuração da gaveta copia pilotos, chave e pontos à mão de lá).
`app/arena/actions.ts` e `/api/arena/vendedores` continuam porque o caixa (PDV) e os indicadores leem
`arena_vendedores`.

## Telão

- Semáforo de largada ao abrir; karts andam até a própria meta; quem bate a meta cruza a linha e estaciona
  depois da chegada com a bandeirada.
- Outdoor com a viagem do Airbnb depois da linha de chegada, com "faltam X pts" da meta da equipe.
- Faixas: venda, "Turbo dourado" (licença), "Orçamento virou venda", bônus à mão, "Ultrapassagem".
- Festa de tela cheia quando alguém bate a meta e quando a equipe bate a meta.
- Semana e mês alternando a cada 45 s (ou fixo, no painel). Som sintetizado (precisa de um clique em "Ligar
  som" na TV). Tela cheia, cursor some sozinho, tela não apaga (Wake Lock).
- Karts e personagens são desenhos originais: nada da Nintendo.

## Hora do turbo (12/10)

Pontos multiplicados (1,5x, 2x ou 3x) em horários fixos (ex.: seg a sex, 14h–16h) ou ligados na hora pelo
painel ("Ligar turbo agora" por 30 min a 4 h). O Bling não guarda a hora do pedido, então vale a hora em que o
documento chega à Arena (o vigia passa a cada 2 min; quem chega até 5 min depois do fim ainda ganha). O
multiplicador fica congelado no lançamento: desligar depois não tira pontos. Carga histórica nunca ganha.
Lógica em `lib/arena/turbo.ts`. O telão mostra a faixa dourada e "Hora do turbo às 14:00" até 3 h antes.

## Avisos no WhatsApp (12/10)

Pela linha da loja, para um grupo da equipe (escolhido na lista dos grupos da loja) ou um número. Avisa quando
alguém cruza a linha, quando a equipe bate a meta (com a viagem), quando começa a hora do turbo e, se ligado,
troca de líder da semana. Os avisos saem pelas rotas `/api/arena/grupos` e `/api/arena/aviso` do servidor do
WhatsApp (`whatsapp-server/servidor.js`), que **precisam do deploy da VPS** (`deploy-evo.ps1`). Não entram no
CRM, só aceitam grupo ou número brasileiro e têm freio de 30 por hora. Comparação em `lib/arena/avisos.ts`.

## Página de cada piloto (12/10)

`www.balao.info/arena/<nome>` (o endereço aparece no cartão do piloto no painel). Feita para o celular:
posição, quanto falta para a linha de chegada, "para cruzar a linha: 2 vendas com licença ou 3 vendas ou 15
orçamentos" (com o turbo, se estiver ligado), quem está logo à frente e atrás, a meta da equipe com a viagem e
as últimas jogadas. Pública como o telão: sem cliente e sem reais.

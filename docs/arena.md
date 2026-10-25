# Arena de vendas

Corrida de vendas que passa na TV da loja (`www.balao.info/arena`), administrada em `/painel/arena`.
Refeita em 12/10/2026 a pedido do Thiago, com cara de jogo de kart.

**Desde 25/10/2026 as vendas vêm do MEU BLING (`www.balao.info/sistema`), não mais do Bling.** Pedido do
Thiago: "desconecta de vez o Bling e conecta de vez o MEU BLING". O próprio site lê as vendas no sistema a cada
5 minutos; o vigia do PC (`scripts/arena-vigia`) foi desligado e não volta (`POST /api/arena/bling` responde
410). As vendas que vieram do Bling até 24/10 continuam guardadas e contando como histórico.

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
MEU BLING (/sistema) ◀──GET /vendas, /vendedores, /vendas/:id── lib/arena/sistema.ts ──▶ gaveta: lanc-AAAA-MM
                     (agendador /api/cron/arena-sistema a cada 5 min, ou "Ler agora" no painel)
Fechamento da assistência ──(cada OS salva/apagada)──▶ /api/weekly/orders ──▶ gaveta: lanc-AAAA-MM
                                                                     │
        /painel/arena (pilotos, metas, regras, prêmio, avisos) ──▶ gaveta: config
                                                                     ▼
                                    corrida recalculada ──▶ gaveta: telao ──▶ WhatsApp (avisos)
                                                                     │
              GET /api/arena/estado (CDN 10 s) ──▶ /arena (telão) e /arena/<piloto> (celular)
```

- **Leitura do MEU BLING** (`lib/arena/sistema.ts`, `sincronizarArena`): pelo mesmo caminho do PDV
  (`lib/pdv/sistema.ts` → `chamarSistema`, chave `MEU_BLING_CHAVE` na Vercel). Cada volta lê **hoje e ontem**;
  a primeira volta do dia lê **desde o começo do mês**; "Buscar desde" no painel (`config.varrerDesde`) lê
  desde a data pedida e limpa o pedido quando termina.
  - `GET /vendas?de=AAAA-MM-DD&ate=AAAA-MM-DD` (até 92 dias por pedido). Enquanto o MEU BLING ainda não tiver
    essa forma (responde 400), a leitura cai para dia a dia (`?dia=`) e tenta a forma nova de novo de hora em
    hora. No dia a dia, hoje e ontem vêm sempre; o resto, do mais antigo para o mais novo, e o que não couber
    numa volta continua na próxima (`continuarDe`).
  - A lista não traz os itens: as **licenças** saem do detalhe `GET /vendas/:id`, só das vendas novas, mudadas
    ou ainda sem itens, no máximo 15 por volta (o resto fica para as próximas). A venda entra no placar na hora,
    mesmo antes dos itens.
  - Cada venda vira `venda:mb<id>` (origem `sistema`), com o vendedor do sistema em `sistemaVendedorId`.
    Cancelada no sistema (`situacao.cancelamento`) → R$ 0, "Cancelado no sistema".
  - Os pedidos antigos foram migrados do Bling para o sistema com o **mesmo número**: se a Arena já tem o
    pedido do Bling com esse número, a venda do sistema fica "ignorada" (não conta duas vezes).
  - A primeira leitura de todas entra como histórico (o telão não comemora o mês inteiro de uma vez).
  - O resultado de cada volta fica em `sincronia-sistema` (aparece no painel: última leitura, quantas vendas,
    último erro). Só grava de 10 em 10 minutos quando nada muda.
- **Pilotos e vendedores**: o piloto tem `sistemaVendedorId` (vendedor do MEU BLING) e continua com o
  `blingVendedorId` (só para o histórico). Quem é dono da venda: `pilotoId` → `sistemaVendedorId` →
  `blingVendedorId` (`pilotoDoLancamento` em `lib/arena/placar.ts`).
  **Ligação automática**: vendedor do sistema sem piloto é ligado ao piloto de mesmo nome (sem acento e sem
  maiúscula; senão o primeiro nome, se só houver um piloto e um vendedor com ele). Ligação feita (ou desfeita) à
  mão no painel nunca é trocada (`sistemaLigadoPor: "manual"`).
- **Agendador**: `vercel.json` → `/api/cron/arena-sistema` a cada 5 minutos. Mesma porta do `/api/cron/precos`
  (user-agent `vercel-cron/…`, `CRON_SECRET` se existir, ou sessão do painel). Nenhuma variável nova.
- **Valores** (`lib/arena/valores.ts`): calculados no site. Refazer (aba Ligação → "Refazer os valores", ou
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
| Venda (pedido de venda no MEU BLING) | o total do pedido, para o vendedor do pedido |
| Licença Windows/Office | já está dentro da venda; o placar mostra à parte quantas e quanto (sem somar duas vezes) |
| Ordem de serviço (Fechamento da assistência) | mão de obra + peças, para o técnico da OS |
| Orçamento (proposta comercial do Bling, só no histórico) | aparece no placar (quantos), vale R$ 0 |
| Lançado à mão no painel | o valor digitado (negativo desconta) |
| Venda cancelada no MEU BLING (situação de cancelamento) | sai (R$ 0) |
| Histórico do Bling: cancelada/estornada (12, 32597, 32598) | sai (R$ 0); em digitação (21) espera |
| Pedido migrado do Bling para o sistema (mesmo número de um pedido do Bling já na Arena) | não conta de novo |

Licença = item cujo nome tem "windows", "office", "microsoft 365"… e nenhuma palavra de exclusão
(notebook, computador, pc, cadeira, mesa…). As duas listas ficam na aba Como conta. O valor do item é unitário
(valor × quantidade).

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
| `config` | versão 3: pilotos (com `slug`, `funcao`, `sistemaVendedorId`, `sistemaLigadoPor` e o antigo `blingVendedorId`), palavras da licença, metas em reais, prêmio, avisos do WhatsApp, vendedores do sistema (`vendedoresSistema`) e do Bling (histórico), resumo da chave do PC da loja, varredura pedida |
| `lanc-AAAA-MM` | do mês: vendas do MEU BLING (`venda:mb<id>`), vendas e orçamentos do Bling até 24/10 (`venda:<id>`, `orcamento:<id>`), OS do Fechamento (`os:<id>`) e lançados à mão (`manual:<uuid>`) |
| `telao` | a corrida já calculada (o telão só lê isto) |
| `sincronia-sistema` | a última leitura do MEU BLING (quando, período, quantas vendas, último erro, varredura do mês, dia a dia) |
| `vigia` | última conversa do vigia (parado desde 25/10/2026; só histórico) |
| `avisos` | o que já foi avisado no WhatsApp (cada aviso sai uma vez) |
| `fotos/<…>` | fotos dos pilotos (192 px), servidas por `/api/arena/foto/<id>` |

Toda gravação é condicional à versão lida (etag do Blob): a leitura do sistema e o painel ao mesmo tempo não se atropelam.
Anular ou trocar o valor no painel nunca é desfeito pela leitura do sistema nem pelo Fechamento.

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

## Chave do PC da loja e rotas do PC (25/10/2026)

A antiga chave do vigia virou a **chave do PC da loja**: o vigia não roda mais, mas o PC (JUL.IA, relatórios
do Telegram) usa a mesma chave para falar com o MEU BLING pelo site, sem receber chave nova. No site fica só o
resumo (`config.chaveHash`); o pareamento (`/api/arena/vigia/parear`) e o "Gerar chave do PC da loja" do painel
continuam. Rotas (todas com `Authorization: Bearer <chave do PC>`; 401 se não conferir):

| rota | o que faz |
|---|---|
| `GET /api/pc/sistema/status` | `{ ok: true, sistema: { ligado, motivo } }` |
| `GET /api/pc/sistema/vendas?de=&ate=` | vendas do período (até 92 dias) e `totais: { quantidade, valor, canceladas, porVendedor }` — sem as canceladas, "Sem vendedor" quando não tem, do maior valor para o menor |
| `POST /api/pc/sistema/documentos` | repassa o corpo para `POST /agente/documentos` do sistema; devolve `{ documento: {id, numero, tipo, total, situacao}, criada }` (201 criado, 200 repetido). Erro do sistema volta com `{ erro }` e o mesmo status; sistema fora → 503 |

Código: `lib/pc/porta.ts`, `app/api/pc/sistema/*`, totais em `lib/arena/sistema.ts` (`totaisDasVendas`).
Testes: `__tests__/lib/arena-sistema.test.ts`.

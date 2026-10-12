# Arena de vendas

Corrida de vendas que passa na TV da loja (`www.balao.info/arena`), administrada em `/painel/arena`.
Refeita em 12/10/2026 a pedido do Thiago: ligada ao Bling, com cara de jogo de kart.

## Como funciona

```
Bling ──(vigia no PC, a cada 2 min)──▶ POST /api/arena/bling ──▶ arena_lancamentos (MySQL)
                                                                     │
                     /painel/arena (regras, metas, prêmio) ──────────┤
                                                                     ▼
                                  GET /api/arena/estado (cache 30 s) ──▶ /arena (telão)
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

## Tabelas

- `arena_vendedores` — os pilotos (tabela antiga; ganhou `bling_vendedor_id`, `apelido`, `cor`, `kart`,
  `numero`, `meta_semana`, `meta_mes`, `ativo`). A foto pode ser link ou a imagem reduzida (192 px) no próprio
  banco, servida por `/api/arena/foto/[id]`.
- `arena_lancamentos` — um por documento do Bling (`venda:<id>`, `orcamento:<id>`) e os pontos à mão
  (`manual:<uuid>`). Anular ou trocar pontos no painel nunca é desfeito pelo Bling.
- `arena_ajustes` — chave/valor: `regras`, `corrida`, `premio`, `vigia`, `vigia_chave`, `bling_vendedores`,
  `varrer_desde`.

A estrutura é criada na primeira chamada (`garantirEstrutura`), como em `lib/precos/banco.ts`.

As tabelas antigas `arena_vendas`, `arena_config` e `arena_eventos_midia` ficaram no banco, sem uso pela tela
nova (os GIFs de comemoração deram lugar às animações próprias). `app/arena/actions.ts` continua porque o caixa
(PDV) e os indicadores leem `arena_vendedores`.

## Telão

- Semáforo de largada ao abrir; karts andam até a própria meta; quem bate a meta cruza a linha e estaciona
  depois da chegada com a bandeirada.
- Outdoor com a viagem do Airbnb depois da linha de chegada, com "faltam X pts" da meta da equipe.
- Faixas: venda, "Turbo dourado" (licença), "Orçamento virou venda", bônus à mão, "Ultrapassagem".
- Festa de tela cheia quando alguém bate a meta e quando a equipe bate a meta.
- Semana e mês alternando a cada 45 s (ou fixo, no painel). Som sintetizado (precisa de um clique em "Ligar
  som" na TV). Tela cheia, cursor some sozinho, tela não apaga (Wake Lock).
- Karts e personagens são desenhos originais: nada da Nintendo.

## Ideias para depois

- Aviso no grupo do WhatsApp quando alguém cruza a linha (precisa da VPS).
- "Hora do turbo": pontos em dobro num horário fraco, ligada no painel.
- Página de cada vendedor mostrando quanto falta para a linha de chegada.

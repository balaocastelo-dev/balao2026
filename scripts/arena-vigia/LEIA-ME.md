# Vigia da Arena

> **Desligado desde 25/10/2026 — não instalar de novo.** A loja saiu do Bling: a Arena lê as vendas direto do
> MEU BLING pelo site (`lib/arena/sistema.ts`, agendador `/api/cron/arena-sistema`, ver `docs/arena.md`), e
> `POST /api/arena/bling` responde 410. A chave do vigia continua valendo como **chave do PC da loja**
> (rotas `/api/pc/sistema/*`); para trocar só a chave, sem criar a tarefa, use `python vigia.py --parear`.
> O texto abaixo fica só como histórico.

Leva as vendas e os orçamentos do Bling para a corrida de vendas do site
(`www.balao.info/arena`, administrada em `/painel/arena`).

| | |
|---|---|
| Onde roda | PC do Thiago, tarefa `\BalaoFabrica\Arena Vigia`, a cada 2 minutos |
| O que lê | Bling v3: `pedidos/vendas`, `propostas-comerciais` e `vendedores` (só leitura) |
| Token do Bling | o mesmo da sentinela do Bionic (`07-Scripts\bling-oauth\bling_tokens.json`). **Nunca renova** |
| Para onde manda | `POST https://www.balao.info/api/arena/bling`, com a chave do vigia |
| Chave do vigia | gerada no painel (Conexão com o Bling); fica em `%USERPROFILE%\.balao-arena\chave.txt` |
| Registro | `%USERPROFILE%\balao-arena-vigia\dados\vigia.log` |

## Instalar ou atualizar

1. No PowerShell do PC com o Bling (o da sentinela do Bionic):

```powershell
git -C $HOME\balao2026 pull
& $HOME\balao2026\scripts\arena-vigia\instalar.ps1
```

2. O instalador mostra um código de 4 números e espera. Em `/painel/arena` → **Conexão com o Bling** aparece
   "O computador … quer ligar o vigia" com o mesmo código: **Aprovar**. A chave vai direto do site para o vigia
   (pareamento, versão 1.2). Para trocar a chave depois: `instalar.ps1 -Parear`.

## Cada volta

- lista os pedidos e as propostas dos últimos 3 dias;
- de hora em hora, dos últimos 40 dias (pega cancelamento de pedido antigo);
- na primeira vez, dos últimos 3 meses (o hall da fama precisa);
- abre o detalhe só do que é novo ou mudou — é no detalhe que vêm o vendedor e os itens;
- o site pontua (as regras ficam no painel) e o telão atualiza em até 20 s.

Desde a versão 1.3 o vigia também leva ao **PDV** (`www.balao.info/pdv`) o `access_token` do Bling, quando ele
muda ou quando o site pede (`POST /api/pdv/bling/acesso`). Só o access_token — o refresh_token nunca sai do PC
e o vigia continua sem renovar nada. Ver `docs/pdv.md`.

Se o site estiver fora do ar, o vigia guarda o que trouxe do Bling e manda na volta seguinte (versão 1.1).

O painel pode pedir uma varredura desde uma data (botão "Buscar de novo no Bling"): o vigia lê o
pedido na volta seguinte.

## Comandos

```powershell
cd $HOME\balao-arena-vigia
py -3 vigia.py --conferir            # confere Bling e site, não grava
py -3 vigia.py --desde 2026-09-01    # varre desde uma data
py -3 -m unittest discover -s testes # testes (sem Bling nem site de verdade)
```

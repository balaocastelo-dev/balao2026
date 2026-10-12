# PDV — o caixa do balcão (`www.balao.info/pdv`)

Refeito em 12/10/2026 a pedido do Thiago: moderno, leve, com foto do produto, sincronizado com o Bling
nos dois sentidos, nota fiscal pelo caixa e comprovante em 80 mm ou A4.

## Regras dele

- **Produtos: só os do site** (mesmos preços da vitrine, à vista e no cartão). Nada do cadastro do Bling.
- **Do Bling vêm: vendedores, vendas e nota fiscal.**
- Venda feita no caixa entra no Bling na hora; venda lançada direto no Bling aparece no caixa (lista "Hoje").
- Ao finalizar, escolher o papel: **cupom 80 mm** (térmica) ou **folha A4**.

## Quem entra

Senha do dia do balcão (a mesma do `/controle` e do `/fechamento`) ou a sessão do painel. Até 12/10 o `/pdv`
abria sem senha nenhuma.

## Como o site fala com o Bling

O token do Bling mora no PC (`07-Scripts\bling-oauth\bling_tokens.json`) e **só a sentinela do Bionic renova**
(cada renovação invalida o refresh_token dos outros). Por isso:

1. O **vigia da Arena** (PC, a cada 2 min, versão 1.3) lê o `access_token` e, quando ele muda — ou quando o site
   pede (`pdvPrecisaAcesso` na conversa do vigia) — entrega em `POST /api/pdv/bling/acesso`, com a mesma chave
   do vigia. **Só o access_token** (vale 6 h); o refresh_token nunca sai do PC.
2. O site guarda cifrado (AES-256-GCM, chave derivada da `PAINEL_PASSWORD`) na gaveta da Arena
   (Vercel Blob privado, `pdv/acesso`). Fora do MySQL.
3. Com 401 do Bling, o site marca o token como recusado e espera o próximo (a sentinela renova ao vencer;
   o vigia traz em até 2 min). Nesse intervalo a venda **fica gravada** como "Aguardando o Bling" e segue
   sozinha quando o acesso volta.

## O caminho de uma venda

`POST /api/pdv/vendas` → grava em `pdv/dia-AAAA-MM-DD` (Blob) → contato no Bling (acha pelo CPF/CNPJ, cria se
não existir, completa o endereço para a nota; sem CPF usa "Consumidor final") → pedido de venda (itens com
código `SITE-<id do produto>`, desconto em reais, uma parcela por forma de pagamento, vendedor) → se pedida,
NF-e (modelo 55, a que a loja usa): `gerar-nfe` → `enviar` → espera a Sefaz até ~10 s.

Cada passo é gravado na hora; uma volta interrompida continua de onde parou. Antes de recriar um pedido numa
nova tentativa, procura pedido do mesmo cliente e valor no dia (não duplica). Fila em `pdv/pendentes`; segue
quando o vigia entrega acesso novo e, no máximo uma vez por minuto, quando o caixa lê a lista do dia.

Situação do pedido criado: a padrão da conta (Em aberto, 6), como as outras vendas da loja — a Arena conta.

## Telas

- Catálogo (busca do site em cache de 2 min, cai na cópia do catálogo se o MySQL estiver sem cota) e a
  **fita**: o carrinho desenhado como o cupom. Tabela à vista/cartão (crédito no pagamento puxa a do cartão),
  preço editável por item, desconto em R$ ou %, item avulso.
- Fechar: Pix (QR com valor, CNPJ da loja), dinheiro com troco, crédito com parcelas, débito, boleto, divisão em
  duas formas; cliente com busca no Bling pelo CPF/CNPJ e CEP pelo ViaCEP; caixa "Emitir nota fiscal".
- Depois de finalizar: passos (gravada → pedido nº → NF-e nº), impressão 80 mm/A4, DANFE do Bling.
- "Hoje": vendas do caixa + do Bling, com situação, nota e vendedor; reimprimir; emitir nota depois; tentar de novo.

## Arquivos

`lib/pdv/` (tipos, contas, acesso, bling, vendas, produtos, sessão), `app/api/pdv/`, `app/pdv/`,
`scripts/arena-vigia/vigia.py` (entrega do acesso), testes em `__tests__/lib/pdv.test.ts` e
`scripts/arena-vigia/testes/`.

## Para a nota sair certa

Os itens vão ao Bling pelo nome e pelo código `SITE-<id>`; o NCM da nota sai do que o Bling tiver para o item
(cadastro do produto ou padrão da natureza de operação). As notas da loja já saem assim hoje (há notas com
`0000.00.00`). Conferir a primeira nota emitida pelo caixa e, se preciso, o NCM padrão com o contador.

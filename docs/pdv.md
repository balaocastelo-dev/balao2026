# PDV — o caixa do balcão (`www.balao.info/pdv`)

Refeito em 12/10/2026 a pedido do Thiago: moderno, leve, com foto do produto, nota fiscal pelo caixa e
comprovante em 80 mm ou A4. **Desde 22/10/2026 as vendas vão para o `/sistema` (MEU BLING, o ERP próprio da
loja) e não mais para o Bling** — no mesmo dia em que a loja passou a usar o MEU BLING no dia a dia.

## Regras dele

- **Produtos: só os do site** (mesmos preços da vitrine, à vista e no cartão).
- **Do /sistema vêm: vendedores, clientes, as vendas do dia e a nota fiscal.** Os produtos do /sistema também são os
  do site (sincronizados a cada 30 min, com foto e o selo de pronta entrega — ver o doc do MEU BLING).
- Venda feita no caixa entra no /sistema na hora; venda lançada direto no /sistema aparece no caixa (lista "Hoje").
- Ao finalizar, escolher o papel: **cupom 80 mm** (térmica) ou **folha A4**.

## Quem entra

Senha do dia do balcão (a mesma do `/controle` e do `/fechamento`) ou a sessão do painel.

## Como o site fala com o /sistema

- `lib/pdv/sistema.ts` chama a porta do site no MEU BLING (`/api/v1/integracoes/site/*`, repositório
  `balaocastelo-dev/meu-bling`, `apps/api/src/modules/site/routes.ts`) direto na VPS, com uma chave.
- Variáveis na Vercel: **`MEU_BLING_CHAVE`** (a mesma `SITE_CHAVE_INTEGRACAO` do `/etc/meu-bling.env`; o
  `scripts\deploy-vps.ps1` do MEU BLING copia para a área de transferência e abre a Vercel) e, opcional,
  `MEU_BLING_URL` (padrão `https://srv1963897.hstgr.cloud/sistema`).
- Sem a chave, com a VPS fora ou com o sistema reiniciando: a venda **fica gravada** no site como "Aguardando o
  sistema" e segue sozinha (no máximo uma vez por minuto, quando o caixa lê a lista do dia) ou no "Tentar de novo".
- A lista de vendedores fica guardada na gaveta (`pdv/vendedores-sistema`) para o caixa abrir mesmo com o sistema fora.

## O caminho de uma venda

`POST /api/pdv/vendas` → grava em `pdv/dia-AAAA-MM-DD` (Blob) → `POST /integracoes/site/vendas` no /sistema: o
cliente é achado pelo CPF/CNPJ (ou celular; sem nada, "Consumidor Final") e criado se não existir, com o código IBGE
pelo CEP; os itens vão pelo id do produto no site (item avulso vira linha livre); uma parcela por forma de pagamento;
vendedor do /sistema; origem Balcão. A venda entra **Fechada** (lança estoque, contas e comissão).
O /sistema **não duplica**: a venda leva o id do PDV e repetir a chamada devolve a mesma venda.

Nota pedida: `POST /integracoes/site/vendas/:id/nfe` gera e transmite a NF-e (modelo 55). Se falta algo (IE, NCM,
endereço…), o /sistema devolve a lista do que falta e o balcão mostra; a venda continua feita. "Emitir nota desta
venda" depois manda os dados do cliente junto (ele passa a ser o cliente da venda no /sistema).

O QR do cupom abre o DANFE em PDF por `GET /api/pdv/danfe/<nota>?t=<assinatura>`: sem senha, mas cada link só abre a
própria nota (assinatura HMAC com a chave do /sistema).

Vendas gravadas antes de 22/10 (campo `bling`) continuam aparecendo: as que chegaram ao Bling ficam como "No Bling
(antes do sistema)" e não vão de novo; as que nunca chegaram seguem para o /sistema.

## Telas

- Catálogo (busca do site em cache de 2 min, cai na cópia do catálogo se o MySQL estiver sem cota) e a
  **fita**: o carrinho desenhado como o cupom. Tabela à vista/cartão (crédito no pagamento puxa a do cartão),
  preço editável por item, desconto em R$ ou %, item avulso.
- Fechar: Pix (QR com valor, CNPJ da loja), dinheiro com troco, crédito com parcelas, débito, boleto, divisão em
  duas formas; cliente com busca no /sistema pelo CPF/CNPJ e CEP pelo ViaCEP; caixa "Emitir nota fiscal".
- Depois de finalizar: passos (gravada → venda nº no sistema → NF-e nº), impressão 80 mm/A4, DANFE.
- "Hoje": vendas do caixa + as lançadas no /sistema, com situação, nota e vendedor; reimprimir; emitir nota depois;
  tentar de novo.
- Selo no alto: "Sistema ligado" / "Sistema fora: vendas ficam guardadas".

## O Bling saiu (25/10/2026)

`lib/pdv/acesso.ts` e `POST /api/pdv/bling/acesso` (o vigia do PC entregava o access_token do Bling) foram
apagados: o PDV manda para o /sistema desde 22/10 e a **Arena** passou a ler as vendas direto do MEU BLING em
25/10 (ver `docs/arena.md`). O site não guarda mais nenhum acesso ao Bling.

## Arquivos

`lib/pdv/` (tipos, contas, sistema, vendas, produtos, sessão), `app/api/pdv/`, `app/pdv/`,
testes em `__tests__/lib/pdv.test.ts`.

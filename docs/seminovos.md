# Seminovos — página que capta lead e o painel que a alimenta (12/10/2026)

Pedido do Thiago: transformar `www.balao.info/seminovos` num ímã de leads — bonita, rápida, com produto de verdade e
foto de verdade, bem preenchida e fácil de achar no Google e nas IAs.

## O que estava errado

- **Não havia nenhum seminovo cadastrado no site.** A "vitrine" buscava a palavra "notebook" no catálogo e mostrava
  cabo de força, fonte e suporte de notebook.
- A página carregava o catálogo inteiro (7 mil produtos) a cada visita: lenta e gastando a cota do MySQL.
- A tabela `used_notebooks` (MySQL) e as rotas `/api/seminovos` existiam, mas nenhuma tela usava; ficaram vazias.

## Como ficou

### Página `/seminovos` (estática, refeita a cada 5 min ou na hora em que o painel muda)
1. Topo com a promessa e o **formulário de pedido** (nome, WhatsApp, uso, orçamento) e o "laudo de bancada".
2. **Na loja agora**: só aparelhos cadastrados no painel, com as fotos tiradas na loja (regra da foto exata).
   Botão "Reservar este" (ou "Avise se ele voltar", quando reservado). Sem aparelho cadastrado, o bloco vira
   **lista de espera**, com os modelos que mais chegam (sem foto e sem preço).
3. **Qual seminovo é para você?** — três perguntas viram uma configuração recomendada, que vai junto no pedido.
4. Comparativo seminovo corporativo × notebook novo de entrada; o que a bancada confere (33 itens);
   por que comprar na loja; guia por uso; consignação (vender o usado); resumo + 12 perguntas frequentes.
5. Dados estruturados: loja, breadcrumb, FAQ, página e, quando há estoque, a lista de produtos com
   `UsedCondition`. `public/llms.txt` ganhou a seção de seminovos.
6. No celular, barra fixa "Receber opções" + WhatsApp depois que o formulário do topo sai da tela.

### Todo formulário da página
- Abre o WhatsApp da loja com o pedido escrito (`lib/seminovos/whatsapp.ts`).
- Guarda o lead em `/painel/seminovos` (aba Leads) — fora do MySQL, na gaveta da Arena (Vercel Blob privado),
  chave `seminovos/leads-AAAA-MM`.
- Manda e-mail para a loja (`ADMIN_EMAIL` ou balaocastelo@gmail.com), assunto "Lead seminovo: …".
- Rota: `POST /api/seminovos/lead` (pública no `proxy.ts`; campo isca + tempo mínimo + limite por IP contra robô).

### Painel `/painel/seminovos` (menu Produtos e preços > Seminovos)
- **Aparelhos**: cadastrar com fotos do celular (o navegador reduz para 1600 px antes de subir; até 8, a primeira
  é a capa), editar, marcar Disponível / Reservado / Vendido, apagar. Vendido some da página.
- **Leads**: lista dos últimos 3 meses, link direto para o WhatsApp do cliente, andamento (Novo, Atendido,
  Comprou, Não comprou) e nota.
- Estoque em `seminovos/estoque`, fotos em `fotos/seminovo-…` na mesma gaveta; servidas por
  `/api/seminovos/foto/<nome>` com cache de um ano.
- `GET /api/seminovos` devolve os seminovos à venda em JSON (para a JUL.IA / CRM usarem).

## A conferir pelo Thiago
- A lista dos 33 itens da bancada e os textos de garantia, nota fiscal e entrega no mesmo dia vieram da página
  antiga e dos diferenciais que ele ditou; se algum item não é feito na loja, tirar de `app/seminovos/page.tsx`.
- Cadastrar os aparelhos que estão na loja: é isso que transforma a lista de espera em vitrine.

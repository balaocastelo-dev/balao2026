# Painel — a administração em um lugar só

`www.balao.info/painel` é a única entrada da administração do Balão. Uma senha
(`PAINEL_PASSWORD`, na hospedagem) abre tudo; a sessão dura 12 horas por
navegador.

## O que tem dentro

| Grupo | Áreas |
|---|---|
| Vendas | Indicadores, Pedidos do site, Fechamento da assistência, Caixa (PDV)* |
| Produtos e preços | Produtos, Categorias, Preços por fonte, Importação em massa, Cupons |
| CRM e atendimento | Atendimento no WhatsApp, Números do atendimento, Clientes, Respostas e etiquetas |
| Equipe | Vendedores, Usuários e acessos, Arena de vendas |
| Site e conteúdo | Carrossel, Blocos da home, Barra de avisos, Páginas de vitrine, Gerador de páginas, Mapa do site |
| Assistência técnica | Estoque de peças, Retirada de peças*, Senha de retirada* |
| Sistema | Assistente de IA, Teste de imagens |

\* Telas de balcão: têm endereço e senha próprios e abrem em outra aba (ver
"As três portas").

## Como é montado

- `lib/painel/menu.ts` — **o mapa do painel**. O menu lateral, a tela de Início
  e a busca leem daqui. É a única lista do que existe.
- `app/painel/layout.tsx` — a porta: sem a senha, mostra a tela de entrada,
  qualquer que seja o endereço pedido.
- `app/painel/(shell)/` — as áreas que aparecem com o menu ao lado.
- `app/painel/(telacheia)/` — as áreas que usam o monitor inteiro (o
  atendimento do WhatsApp). Passam pela mesma porta, sem o menu; a volta ao
  painel fica no topo da tela.
- `components/painel/PainelShell.tsx` — a moldura (menu, gaveta do celular,
  busca, sair).
- `proxy.ts` — a tranca. Área de dentro do painel sem senha nem chega a ser
  montada: vai para `/painel?voltar=<área>` e volta para a área depois da senha.

### Acrescentar uma área

1. Crie `app/painel/(shell)/<pasta>/page.tsx`.
2. Acrescente o item no grupo certo de `lib/painel/menu.ts` (endereço, nome,
   uma linha de descrição, ícone, palavras de busca e a moldura: `folha` para
   conteúdo sobre folha branca, `livre` para tela que já traz o próprio fundo).
3. Rode `npm test`. O teste `__tests__/lib/painel-menu.test.ts` reprova item
   sem página e página fora do menu.

## Endereços antigos

Continuam valendo e levam para dentro do painel
(`lib/painel/enderecos-antigos.ts`, aplicado pelo `next.config.ts`):

| Antes | Agora |
|---|---|
| `/admin`, `/admin/<tela>` | `/painel`, `/painel/<tela>` |
| `/crm` | `/painel/crm` |
| `/arena/admin` | `/painel/arena` |
| `/dashboard` | `/painel/indicadores` |
| `/gerador` | `/painel/gerador` |
| `/funcoes` | `/painel/mapa` |

## As três portas

O sistema continua tendo três jeitos de entrar, cada um para um público:

| Porta | Quem usa | Abre |
|---|---|---|
| Senha do painel | Quem administra a loja | O `/painel` inteiro |
| Senha de cada vendedor | Vendedores | Só a página pessoal de atendimento (`/brendon`, `/julia`…) |
| Senha do dia | Técnicos da assistência | `/fechamento` e `/controle/admin` |

Quem já entrou no painel abre o fechamento e o estoque de peças pelo menu, sem
digitar a senha do dia. O contrário não vale: a senha do dia não abre o painel.

A tela **Usuários e acessos** mostra essa mesma tabela para quem administra, com
a situação de cada senha (definida ou não) — nunca a senha.

## O que passou a pedir senha junto com esta mudança

Estavam abertos na internet, para quem tivesse o endereço:

- **`/arena/admin`** e as ações por trás dela (lançar venda, apagar vendedor,
  zerar a temporada). Hoje é `/painel/arena`, e cada ação confere a sessão do
  painel dentro do próprio código (`app/arena/actions.ts`). O telão, `/arena`,
  continua sem login.
- **`/api/orders`** — a lista de todos os pedidos, com nome, e-mail, WhatsApp,
  endereço e CPF dos clientes — e `PATCH`/`DELETE` em `/api/orders/<id>`
  (mudar situação, que dispara e-mail ao cliente, e apagar pedido).
  `/api/orders/status`, que a página de "obrigado" consulta, segue pública.
- **`/dashboard`** e `/api/dashboard/metrics` — faturamento, pedidos e vendas
  por vendedor. Hoje é `/painel/indicadores`.
- **`/gerador`** — hoje `/painel/gerador`.

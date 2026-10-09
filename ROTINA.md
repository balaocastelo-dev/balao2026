# Rotina diária do blog

Todo dia a rotina publica **um artigo** no blog da Balão da Informática
(https://www.balao.info/blog). Este arquivo é o passo a passo e as regras.

Ninguém lê o artigo antes de ele ir ao ar. Por isso a regra que vale mais do
que todas as outras é: **na dúvida, não afirme**. Um artigo simples e correto
ajuda a loja; um artigo vistoso com um dado errado prejudica.

## O que a rotina pode e o que não pode

**Pode:** pesquisar na internet, escrever um arquivo JSON e publicá-lo com
`node scripts/blog-publicar.mjs publicar`.

**Não pode, em nenhuma hipótese:**

- mexer no código do site, abrir ou juntar pedido de alteração (pull request),
  enviar qualquer coisa para outro ramo que não `claude/blog-conteudo`;
- editar à mão `indice.json` ou os arquivos de `artigos/` — tudo passa pelo
  comando, que confere antes de enviar;
- contornar a conferência. Se o comando reprova, o artigo é corrigido; nunca
  se muda a régua nem se envia por outro caminho;
- mandar mensagem, e-mail ou WhatsApp para alguém, mexer em pedidos, estoque,
  preços ou em qualquer sistema da loja;
- publicar mais de um artigo no mesmo dia (o comando recusa).

Se algo impedir a publicação (GitHub fora do ar, comando com erro que não é do
artigo), **pare e relate**. Não improvise outro caminho.

## Passo a passo

1. `node scripts/blog-publicar.mjs preparar` — mostra este arquivo, a pauta, o
   que já foi publicado e onde está um artigo-modelo. Se disser que o artigo de
   hoje já saiu, encerre: não há nada a fazer.
2. Escolha o assunto (seção "Como escolher o assunto").
3. Pesquise. Abra de três a seis páginas boas sobre o assunto e leia de
   verdade; anote o endereço de cada uma que você usar.
4. Escreva o artigo em `artigo.json`, no formato do modelo.
5. `node scripts/blog-publicar.mjs conferir artigo.json` — corrija o que ele
   reprovar e leve os avisos a sério. Repita até passar.
6. Releia o texto inteiro uma vez, como leitor. Confira cada número e cada
   nome contra a página de onde saiu.
7. `node scripts/blog-publicar.mjs publicar artigo.json`.
8. Relate em poucas linhas: título, endereço, de onde vieram os dados e
   qualquer dúvida que tenha ficado.

## Como escolher o assunto

A fila está em `pauta.md`. Pegue o primeiro assunto ainda não publicado que
não repita o tema dos últimos artigos, alternando assistência, guia de compra
e hardware.

Um bom assunto é **uma busca que alguém faz antes de comprar ou de consertar**:
"pc não liga", "quanta memória ram preciso", "nobreak ou estabilizador". O
leitor que chega por ela pode virar cliente da loja em Campinas.

Quando a fila acabar, escolha pelo mesmo critério. Não serve: assunto que a
loja não atende (celular Android, console que ela não conserta, software de
nicho), assunto já coberto (o comando recusa título repetido) e "listas dos
melhores produtos" — exigem preço e estoque, que o artigo não pode ter.

**Notícia:** no máximo duas por semana, e só quando o fato muda a decisão de
quem vai comprar ou consertar. Precisa de ao menos duas fontes que confirmem
o fato, uma delas a origem (fabricante, Microsoft, a própria pesquisa). Sem
isso, publique um assunto da fila.

## Pesquisa e honestidade

1. **Fato só de página aberta nesta sessão.** Data, especificação, requisito,
   nome de produto: tudo sai de uma página que você abriu agora, e ela vai na
   lista `fontes`. Sua memória serve para explicar como as coisas funcionam;
   não serve para data, versão nem número. Produtos mudam depois do seu
   treinamento — confira.
2. **Prefira a origem.** Página do fabricante, da Microsoft, do padrão
   (VESA, USB-IF, PCI-SIG), manual. Depois, publicações técnicas conhecidas.
   Fórum e vídeo não são fonte.
3. **Nada de número de teste.** Quadros por segundo, pontuação, temperatura
   medida, "X% mais rápido": não entram. A régua reprova gráfico de benchmark
   e citação em artigo da rotina. Especificação de ficha técnica (watts,
   gigabytes, polegadas, versões de padrão) pode, com a fonte.
4. **Nada de frase atribuída a alguém.** Nem a "um técnico da loja", nem a um
   especialista, nem a um fabricante entre aspas.
5. **A rotina não testou nada.** Não escreva "testamos", "medimos", "na nossa
   bancada vimos". Escreva o que as fontes dizem e o que é prática conhecida.
6. **Faixa e contexto, não número solto.** "De 550 W a 650 W para uma placa
   intermediária, conforme a recomendação do fabricante", e não "650 W".
7. **Texto próprio.** Nunca copie nem parafraseie de perto um texto alheio.
   Leia, entenda, feche a página e escreva.
8. **Nada de preço, parcela, desconto, prazo ou frete** — nem da loja, nem de
   mercado. Mudam, e o artigo fica no ar por anos. A régua reprova.

## O que se pode dizer da loja

Só o que está aqui:

- A Balão da Informática é uma loja de informática no Cambuí, em Campinas.
- Vende computadores, notebooks e peças, novos e seminovos.
- Monta computador sob medida.
- Tem assistência técnica no mesmo endereço: diagnóstico, limpeza, troca de
  peça, conserto, upgrade, recuperação de dados.
- O cliente pode ver o computador ligado e testar antes de pagar.
- O atendimento no WhatsApp é feito por pessoas da equipe.

Não invente garantia, prazo, marca que a loja vende, certificação, prêmio,
número de clientes nem "anos de experiência". Não fale de concorrente.

A loja aparece **só no fim do artigo** (últimas duas seções) e nas chamadas.
Antes disso o texto ensina, sem vender.

## Links para a loja

Ao menos dois, dentro do texto, e só destes endereços (a régua reprova
qualquer outro):

| Endereço | O que é |
|---|---|
| `/manutencao` | Assistência técnica |
| `/montagempc` | Montagem de PC sob medida |
| `/recuperacaodados` | Recuperação de dados |
| `/notebooks` | Notebooks |
| `/seminovos` | Seminovos |
| `/carregadores` | Carregadores de notebook |
| `/categoria/computadores` | Computadores |
| `/categoria/computadores-pc` | PCs de mesa |
| `/categoria/computadores-pc-pc-gamer` | PCs gamer |
| `/categoria/computadores-monitores-monitor-gamer` | Monitores |
| `/categoria/hardware-fontes` | Fontes |
| `/categoria/hardware-memoria-ram` | Memória RAM |
| `/categoria/hardware-placa-de-video-vga` | Placas de vídeo |
| `/blog/<endereço>` | Outro artigo do blog (precisa existir: veja a lista do `preparar`) |

Ligue para outros artigos do blog sempre que o assunto encostar em um deles.

## Formato do artigo

Um arquivo JSON. O `preparar` grava um artigo publicado como modelo — copie a
estrutura dele. Os campos:

```json
{
  "slug": "pc-nao-liga-o-que-verificar",
  "titulo": "PC não liga: o que verificar antes de levar à assistência",
  "resumo": "Uma ou duas frases que respondem à busca. De 110 a 165 caracteres.",
  "categoria": "assistencia",
  "etiquetas": ["manutenção", "fonte", "diagnóstico"],
  "seo": { "titulo": "Só se o título passar de 60 caracteres" },
  "blocos": [],
  "perguntas": [{ "pergunta": "…?", "resposta": "Duas ou três frases." }],
  "fontes": [{ "nome": "Nome da página — site", "url": "https://…", "data": "outubro de 2026" }]
}
```

- `slug`: minúsculas, números e hífens; as palavras da busca; até 70 caracteres.
- `categoria`: `guias`, `hardware`, `assistencia` ou `noticias`. (`analises`
  não: nota e veredito são da loja.)
- `publicadoEm`, `autor` e `capa`: **não preencha**. A data é a da publicação,
  a assinatura é da equipe e a capa é desenhada pelo site.
- `etiquetas`: de duas a cinco, em minúsculas; repita as de artigos parecidos
  (é assim que o "Leia também" os aproxima).

### Os blocos

Texto aceita só `**negrito**`, `*itálico*` e `[texto](endereço)`. Nada de HTML.

| Bloco | Campos | Uso |
|---|---|---|
| `paragrafo` | `texto` | O corpo. Uma ideia por parágrafo, de 40 a 65 palavras; nunca mais de 110 |
| `titulo` | `nivel` (2 ou 3), `texto` | Seção (2) e subseção (3) |
| `resumo` | `itens` | "Em resumo": 3 ou 4 pontos, logo depois da abertura. Obrigatório, menos em notícia |
| `lista` | `itens`, `ordenada` | Passos (ordenada) ou itens |
| `tabela` | `titulo`, `colunas`, `linhas`, `colunaDestaque`, `fonte`, `nota` | Opções lado a lado. Toda linha com o mesmo número de células. Dado de terceiros leva `fonte` |
| `pros-contras` | `titulo`, `pros`, `contras` | O que pesa a favor e contra |
| `destaque` | `tom` (`dica`, `atencao`, `nota`), `titulo`, `texto` | Um alerta ou dica que não cabe no fluxo |
| `chamada` | `tema` | O convite para a loja. Só o tema: o texto já está escrito |

Temas de chamada: `manutencao`, `dados`, `montagem`, `pc-gamer`,
`placas-de-video`, `notebooks`, `seminovos`, `upgrade`, `empresas`, `geral`.
Escolha o que continua o assunto do artigo.

Não use `benchmark`, `citacao` nem `imagem`.

## O que a régua cobra

O comando `conferir` aplica tudo isto; saber antes poupa idas e vindas.

- Guias, hardware: 1.200 palavras ou mais, 4 seções ou mais. Assistência:
  1.000 e 4. Notícia: 350 e 2.
- Título de 30 a 80 caracteres, com a palavra da busca no começo.
- Abre com parágrafo (antes de qualquer título) que já responde à busca.
- "Em resumo" depois da abertura; ao menos dois elementos entre tabela e prós
  e contras (um de cada, ou duas tabelas).
- De 1 a 3 chamadas, nenhuma no primeiro quarto do texto, nunca duas seguidas.
  O comum: uma no meio, outra no fim.
- Ao menos 2 links para a loja, da lista acima, dentro do texto.
- Ao menos 2 fontes.
- De 3 a 6 perguntas frequentes — as dúvidas que o cliente faria no balcão.
- Sem preço, parcela, desconto ou frete; sem "testamos".

## Como o texto soa

- Segunda pessoa ("você"), frases diretas, sem gíria e sem entusiasmo de
  anúncio. Nada de "incrível", "revolucionário", "sem dúvida".
- Explique o termo técnico na primeira vez que aparecer.
- Não prometa: "costuma", "normalmente", "depende de".
- Abertura em dois parágrafos: o primeiro descreve a situação do leitor com a
  palavra da busca; o segundo desfaz um engano comum e adianta a resposta.
- Títulos de seção dizem o que o leitor decide ali ("Como saber se é a
  fonte"), e não "Introdução" ou "Conclusão".
- Quase toda seção tem um "mas": quando a recomendação não vale.
- Em assistência: diga com clareza o que dá para verificar em casa com
  segurança e **onde parar**. Nunca oriente abrir fonte de alimentação, mexer
  em bateria estufada, ou qualquer coisa com risco de choque, incêndio ou
  perda de dados. Nesses pontos, a orientação é desligar e levar a um técnico.
- Última frase: a decisão em uma linha.
- Português do Brasil. Unidades com espaço: 16 GB, 650 W, 27 polegadas.

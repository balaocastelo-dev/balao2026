# Rotina diária do blog

O blog da Balão da Informática (https://www.balao.info/blog) publica **três
vezes por dia**, e cada execução da rotina faz **uma** dessas publicações — a
tarefa que chamou você diz qual:

| Hora | Tipo | O que é |
|---|---|---|
| manhã | **Artigo principal** | Guia de compra, conserto, hardware, IA ou Apple. O texto longo, que responde a uma busca do Google |
| meio-dia | **Notícia** | Um fato recente de tecnologia e o que ele muda para quem vai comprar ou consertar |
| fim da tarde | **Dica** | Uma pergunta, uma resposta direta. Curta. Leva o roteiro do vídeo que o Thiago grava com o avatar |

Este arquivo é o passo a passo e as regras dos três.

**Você escreve na véspera.** As três execuções rodam de noite (por volta das
19h) e agendam o artigo para o dia seguinte com `publicar --amanha`: o
principal aparece às 6h, a notícia às 12h e a dica às 18h. Nesse intervalo o
computador da loja faz a foto de capa. **Nenhum artigo aparece no site sem a
foto** (regra do Thiago, 16/10/2026): se ela atrasar, o artigo espera.

Ninguém lê o artigo antes de ele ir ao ar. Por isso a regra que vale mais do
que todas as outras é: **na dúvida, não afirme**. Um artigo simples e correto
ajuda a loja; um artigo vistoso com um dado errado prejudica.

## O que a rotina pode e o que não pode

**Pode:** pesquisar na internet, escrever um arquivo JSON (que descreve a
foto de capa) e publicar com `node scripts/blog-publicar.mjs publicar --amanha`.

**Não pode, em nenhuma hipótese:**

- mexer no código do site, abrir ou juntar pedido de alteração (pull request),
  enviar qualquer coisa para outro ramo que não `claude/blog-conteudo`;
- editar à mão `indice.json` ou os arquivos de `artigos/` — tudo passa pelo
  comando, que confere antes de enviar;
- contornar a conferência. Se o comando reprova, o artigo é corrigido; nunca
  se muda a régua nem se envia por outro caminho;
- mandar mensagem, e-mail ou WhatsApp para alguém, mexer em pedidos, estoque,
  preços ou em qualquer sistema da loja;
- publicar duas vezes o mesmo tipo no mesmo dia (o comando recusa).

Se algo impedir a publicação (GitHub fora do ar, comando com erro que não é do
artigo), **pare e relate**. Não improvise outro caminho.

## Passo a passo

1. `node scripts/blog-publicar.mjs preparar --amanha` — mostra este arquivo,
   a pauta, o que já foi publicado, o que já há para amanhã e onde está um
   modelo de cada tipo. Se a linha **"Amanhã"** do seu tipo disser JÁ AGENDADO,
   encerre: não há nada a fazer.
2. Escolha o assunto (seção "Como escolher o assunto").
3. Pesquise. Abra de três a seis páginas boas sobre o assunto e leia de
   verdade; anote o endereço de cada uma que você usar.
4. Escreva o artigo em `artigo.json`, no formato do modelo.
5. `node scripts/blog-publicar.mjs conferir artigo.json` — corrija o que ele
   reprovar e leve os avisos a sério. Repita até passar.
6. Releia o texto inteiro uma vez, como leitor. Confira cada número e cada
   nome contra a página de onde saiu.
7. Descreva a foto de capa no artigo (seção "A foto de capa"). **Você não
   gera imagem nenhuma**: a foto é feita depois, no computador da loja.
8. `node scripts/blog-publicar.mjs publicar artigo.json --amanha`.
9. Relate em poucas linhas: título, endereço, de onde vieram os dados, a foto
   que você pediu e qualquer dúvida que tenha ficado.

## Os três tipos

### Artigo principal (manhã)

É o que este arquivo descreve por padrão: 1.200 palavras ou mais (1.000 em
assistência), quatro seções ou mais, "Em resumo", tabela, prós e contras,
perguntas frequentes. Categorias: `guias`, `hardware`, `assistencia`, `ia` ou
`apple`. Alterne: não publique a mesma categoria dois dias seguidos.

### Notícia (meio-dia)

`"categoria": "noticias"`. De 350 a 700 palavras, duas seções ou mais.

- **O fato tem de ser dos últimos sete dias** e confirmado por ao menos duas
  fontes abertas nesta sessão, uma delas a origem (o fabricante, a Microsoft,
  a Apple, a própria pesquisa ou comunicado). Rumor, vazamento e "segundo
  fontes" não são notícia para este blog.
- Assuntos: lançamento de processador, placa de vídeo, Mac, iPhone ou iPad;
  mudança no Windows, no macOS ou no iOS; fim de suporte; falha de segurança
  que pede atualização; novidade de IA que muda o que um computador comum
  consegue fazer. Nada de política, fofoca de empresa, bolsa ou processo.
- Estrutura: abre contando o fato em um parágrafo, com a data. Primeira
  seção: o que foi anunciado, com o que a fonte diz e nada além. Segunda
  seção, obrigatória: **"O que isso muda para você"** — para quem vai comprar,
  para quem já tem, para quem pode esperar.
- Diga o que ainda não se sabe (preço no Brasil, data de chegada) em vez de
  supor. Não escreva preço em reais nem em dólar.
- Tom neutro: não torça por marca nem fale mal de nenhuma.
- **Se não houver notícia que cumpra tudo isso, não publique.** Encerre com
  `NÃO PUBLICADO: sem notícia confirmada por duas fontes hoje`. Notícia fraca
  ou errada custa mais do que um meio-dia sem publicação.

### Dica (fim da tarde)

`"formato": "dica"`, em `guias`, `hardware`, `assistencia`, `ia` ou `apple`.
De 450 a 950 palavras, duas seções ou mais.

- Uma pergunta só, que o cliente faz no balcão: "como saber se o SSD está
  morrendo", "posso deixar o notebook na tomada o tempo todo", "o que é esse
  barulho no computador". O título é a pergunta ou a resposta dela.
- Abre respondendo. Depois: "Em resumo", o passo a passo ou a comparação
  (lista, tabela ou prós e contras — ao menos um), e quando a dica não vale.
- Não é um guia encolhido: se o assunto pede mais de 950 palavras, ele é
  artigo principal — deixe para a manhã.
- **Leva o roteiro do vídeo** (seção "O roteiro do vídeo").

## Como escolher o assunto

A fila está em `pauta.md`, separada por tipo. Pegue o primeiro assunto do seu
tipo ainda não publicado que não repita o tema dos últimos artigos.

Um bom assunto é **uma busca que alguém faz antes de comprar ou de consertar**:
"pc não liga", "quanta memória ram preciso", "nobreak ou estabilizador". O
leitor que chega por ela pode virar cliente da loja em Campinas.

Quando a fila acabar, escolha pelo mesmo critério. Não serve: assunto que a
loja não atende (celular Android, console que ela não conserta, software de
nicho), assunto já coberto (o comando recusa título repetido) e "listas dos
melhores produtos" — exigem preço e estoque, que o artigo não pode ter.

Em **IA** e **Apple**, o cuidado é dobrado: produto, versão e recurso mudam
todo mês, e o que você lembra do treinamento provavelmente já mudou. Nada de
nome de modelo, versão, recurso ou data sem a página aberta nesta sessão.

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

## A foto de capa

Todo artigo novo sai com uma foto de capa: uma fotografia ou imagem simulada
do assunto, e não um desenho ou gráfico.

**Quem faz a foto é o computador da loja**, na placa de vídeo de lá, e não
você. Você escreve o pedido; o comando `publicar --amanha` agenda o artigo e
deixa o pedido numa fila; de noite (22h e 5h30) o computador gera a foto, um
modelo de visão confere (marca, texto, rosto, deformação, cena errada) e a
foto entra no artigo sozinha. **O site só mostra o artigo depois que a foto
chegou.** Se a sua cena for reprovada três vezes, o computador usa uma cena
de reserva simples (peças numa bancada ou uma mesa de trabalho). Não use
ferramenta de imagem nenhuma (nem Figma, nem outra) e não baixe foto de lugar
nenhum.

**O que vai no artigo:**

```json
"capa": {
  "alt": "Gabinete aberto sobre uma bancada, com o monitor apagado ao lado",
  "pedido": "A mid-tower desktop computer case with the side panel removed, lying on a clean wooden workbench, showing the motherboard and cables. A switched-off monitor stands beside it, slightly out of focus. A small screwdriver on the bench. Soft daylight from a window on the left."
}
```

- `alt`: em português, 12 caracteres ou mais — o que a foto mostra. É o texto
  que o leitor cego ouve e o que o conferente usa para dizer se a cena é a certa.
- `pedido`: **em inglês**, de 60 a 900 caracteres — o que o gerador de imagem
  recebe. Descreva uma cena só, concreta: os objetos, onde estão, o ângulo, a
  luz. De três a cinco frases.

**Como escrever um bom pedido.** O gerador erra quando o pedido é vago ou
pede o impossível:

- A cena que o artigo trata: o equipamento, a bancada, a mesa de trabalho.
  Poucos objetos, bem descritos. Nada de conceito abstrato.
- **Telas apagadas ou de lado.** Tela ligada vira texto embaralhado, e texto
  reprova a foto. Se a tela precisa aparecer ligada, peça "abstract blurred
  shapes on screen".
- **Teclado longe, de lado ou desfocado**: tecla de perto vira letra torta.
- **Sem pessoas.** Rosto reprova, e mão costuma sair deformada.
- Equipamento genérico ("a generic laptop"): não escreva marca nem nome de
  produto no pedido — escrever a marca faz o logotipo aparecer. Em assunto de
  Apple, peça o aparelho de costas ou em ângulo que não mostre o símbolo.
- **Notebook fino e prateado sai com cara de MacBook** e a foto é reprovada
  pela marca (foi o motivo de quase todas as reprovações até 16/10). Fora do
  assunto Apple, prefira cena sem notebook (gabinete, peças, bancada) ou peça
  "a black plastic laptop with a thick bezel", fechado ou de lado.
- Em assunto de IA: um computador comum em uso, nada de robô nem de cérebro
  luminoso.
- Nada de fachada, interior ou funcionário "da Balão": a imagem não pode
  passar por foto da loja.
- Nada que oriente errado (por exemplo, alguém abrindo uma fonte de
  alimentação).

O "sem texto, sem logotipo, sem marca-d'água, sem rosto" o computador
acrescenta sozinho a todo pedido; não precisa repetir.

**Toda publicação tem foto: não existe mais `--sem-capa`.** Se o assunto é
difícil de mostrar, descreva uma cena simples e honesta do ambiente — a
bancada com peças, um gabinete aberto, uma mesa de trabalho.

## O que se pode dizer da loja

Só o que está aqui:

- A Balão da Informática é uma loja de informática no Cambuí, em Campinas.
- Vende computadores, notebooks e peças, novos e seminovos.
- Monta computador sob medida.
- Tem assistência técnica no mesmo endereço: diagnóstico, limpeza, troca de
  peça, conserto, upgrade, recuperação de dados.
- A assistência também atende aparelhos Apple (iPhone, iPad e Mac).
- Tem uma seleção de computadores para rodar IA localmente.
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
| `/reparoapple` | Assistência de iPhone, iPad e Mac |
| `/ia-local` | Computadores para rodar IA local |
| `/premium` | Computadores e workstations de maior desempenho |
| `/pcgamer` | PC gamer |
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
  "formato": "dica",
  "capa": { "alt": "O que a foto de capa mostra, em uma frase", "pedido": "The scene, in English, for the image generator…" },
  "seo": { "titulo": "Só se o título passar de 60 caracteres" },
  "roteiro": { "fala": "…", "titulo": "…", "destaques": ["…", "…"], "legenda": "…", "hashtags": ["…"] },
  "blocos": [],
  "perguntas": [{ "pergunta": "…?", "resposta": "Duas ou três frases." }],
  "fontes": [{ "nome": "Nome da página — site", "url": "https://…", "data": "outubro de 2026" }]
}
```

- `slug`: minúsculas, números e hífens; as palavras da busca; até 70 caracteres.
- `categoria`: `guias`, `hardware`, `assistencia`, `ia`, `apple` ou
  `noticias`. (`analises` não: nota e veredito são da loja.)
- `formato` e `roteiro`: **só na dica**. Nos outros dois tipos, não existem.
- `publicadoEm` e `autor`: **não preencha**. A data é a da publicação e a
  assinatura é da equipe.
- `capa`: os campos `alt` e `pedido` (seção "A foto de capa"). Se copiar a
  estrutura do modelo, apague o `src`, a `largura` e a `altura` que vierem
  nele: o endereço da foto quem preenche é o comando, depois.
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
`placas-de-video`, `notebooks`, `seminovos`, `upgrade`, `empresas`, `apple`
(assistência de iPhone, iPad e Mac), `ia-local` (máquinas para rodar IA) e
`geral`. Escolha o que continua o assunto do artigo.

Não use `benchmark`, `citacao` nem `imagem`: a única imagem do artigo é a capa.

## O roteiro do vídeo (só na dica)

A dica vira um vídeo curto com o avatar do Thiago, com a voz dele. Quem grava
é a fábrica de conteúdo, no computador da loja; o vídeo só vai ao Facebook e
ao Instagram depois que o Thiago aprova no Telegram. Você escreve o roteiro:

```json
"roteiro": {
  "fala": "Seu notebook demora para ligar e trava com poucas abas abertas? Antes de pensar em trocar, olhe duas coisas. …",
  "titulo": "Notebook lento tem jeito",
  "destaques": ["Trocar o disco por SSD", "Mais memória RAM", "Limpeza interna"],
  "legenda": "Notebook lento nem sempre pede um novo. Veja as duas trocas que mais resolvem. A dica completa está no blog.",
  "hashtags": ["notebook", "upgrade", "ssd", "informatica", "campinas"]
}
```

- `fala`: de **45 a 85 palavras** (cerca de meio minuto). É o Thiago, dono da
  loja, dando a dica com as palavras dele: primeira pessoa quando couber,
  frases curtas, do jeito que se fala no balcão. **Comece direto no assunto**
  — a fábrica acrescenta sozinha a saudação ("Fala pessoal! Aqui é o Thiago do
  Balão da Informática.") e o convite final para ler a dica no blog.
- A fala é lida por voz sintética. Por isso: sem parênteses, barras, siglas
  soletradas difíceis nem código de peça; números só os pequenos e do jeito
  que se fala ("dezesseis giga", "i cinco"); **nunca número de três dígitos ou
  mais** ("quinhentos e doze giga" vira "bastante espaço").
- É o rosto do Thiago dizendo: só o que o artigo sustenta. Nada de preço,
  promoção, promessa ("garanto", "com certeza") nem "testamos".
- `titulo`: até 40 caracteres. `destaques`: de 2 a 4, até 32 caracteres cada
  — é o que aparece escrito na tela, e pode ter número e sigla.
- `legenda`: de 40 a 320 caracteres, sem preço, convidando a ler a dica
  completa no blog. `hashtags`: de 4 a 8, só letras e números, sem `#`.

## O que a régua cobra

O comando `conferir` aplica tudo isto; saber antes poupa idas e vindas.

- Guias, hardware, IA, Apple: 1.200 palavras ou mais, 4 seções ou mais.
  Assistência: 1.000 e 4. Notícia: 350 e 2. Dica: de 450 a 950 palavras, 2
  seções ou mais, com ao menos uma lista, tabela ou prós e contras, e com o
  roteiro do vídeo.
- Título de 30 a 80 caracteres, com a palavra da busca no começo.
- Abre com parágrafo (antes de qualquer título) que já responde à busca.
- "Em resumo" depois da abertura (menos em notícia); no artigo principal, ao
  menos dois elementos entre tabela e prós e contras (um de cada, ou duas
  tabelas).
- De 1 a 3 chamadas, nenhuma no primeiro quarto do texto, nunca duas seguidas.
  O comum: uma no meio, outra no fim.
- Ao menos 2 links para a loja, da lista acima, dentro do texto.
- Ao menos 2 fontes.
- De 3 a 6 perguntas frequentes no artigo principal (2 ou 3 na dica) — as
  dúvidas que o cliente faria no balcão.
- Sem preço, parcela, desconto ou frete; sem "testamos".
- Foto de capa descrita no artigo (`alt` e `pedido`): o `publicar` recusa
  artigo sem a descrição.

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

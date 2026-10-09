# Padrão editorial do blog

Este documento descreve como um artigo do blog é escrito. Ele tem duas partes:
o que foi medido nos artigos de referência do Soro, e o que o padrão novo
acrescenta por cima. As regras que podem ser conferidas por máquina estão em
`lib/blog/regua.ts` — é o mesmo padrão, em forma de código.

## 1. O que os artigos do Soro fazem (medido)

Medição dos 18 artigos publicados entre 18 de setembro e 9 de outubro de 2026.

| Medida | Valor |
|---|---|
| Tamanho | 1.390 palavras em média (de 1.244 a 1.509) |
| Título | 38 a 54 caracteres; a palavra da busca vem no começo |
| Resumo (descrição no Google) | 136 a 158 caracteres |
| Seções (títulos de nível 2) | 3 a 8; o comum é 6 |
| Subtítulos (nível 3) | 0 a 8; o comum é 2 |
| Parágrafos | 22 a 28 por artigo, com 53 palavras em média (quase todos entre 41 e 65) |
| Links para páginas da loja | até 3 por artigo, para serviço ou categoria |
| Primeira menção à loja | perto dos 80% do texto |
| Tabelas, gráficos, imagens no texto, citações, perguntas frequentes | nenhum, em nenhum dos 18 |
| Listas | em 2 dos 18 |

### A estrutura que se repete

1. **Abertura em dois parágrafos.** O primeiro descreve a situação do leitor
   usando a palavra da busca. O segundo desfaz um engano comum e adianta a
   resposta ("É comum escolher a fonte olhando só os watts. Esse é um ponto de
   partida, mas…").
2. **Seções com título de decisão.** Os títulos dizem o que o leitor vai
   resolver ali: "Como calcular a potência certa", "Quando trocar a fonte",
   "Novo ou seminovo: compare o conjunto, não só o preço". Um em cada cinco é
   uma pergunta. Um ou dois repetem a palavra da busca.
3. **Parágrafos de uma ideia.** Cada um abre com a afirmação, explica e fecha
   com a consequência prática. Raramente passam de 65 palavras.
4. **Números de referência, sempre com faixa e contexto.** "550 W a 650 W para
   uma RTX 4060", "16 GB como ponto de partida", nunca um número solto.
5. **O contraponto.** Quase toda seção tem um "mas": quando a recomendação não
   vale, o que ela não resolve, o erro de exagerar.
6. **A loja só no fim.** O ângulo local — Campinas, ver a máquina ligada antes
   de pagar, assistência no mesmo endereço — aparece nas duas últimas seções.
   Antes disso o texto ensina, sem vender.
7. **Última frase: a decisão em uma linha.** "Escolha pelo conjunto de
   qualidade, potência e conectores…"

### O tom

- Segunda pessoa ("você"), frases diretas, sem gíria e sem entusiasmo de
  anúncio.
- Explica o termo técnico na primeira vez que usa.
- Não promete: usa "costuma", "normalmente", "depende de".
- Não fala mal de concorrente nem de marca.

### Onde eles ficam devendo

É aqui que o padrão novo ganha deles:

- São **só texto**: nenhuma tabela para comparar, nenhum número com fonte,
  nenhuma lista de prós e contras. Quem quer a resposta rápida precisa ler tudo.
- **Não citam fonte nenhuma.** Os números são razoáveis, mas o leitor não tem
  como conferir — e o Google valoriza quem mostra de onde tirou o dado.
- **Links quebrados.** Vários apontavam para categorias que mudaram de endereço
  quando o catálogo foi trocado. O importador agora corrige isso.
- Oito deles citam "5% no PIX e até 12 vezes sem juros"; o site diz 10% e 10
  vezes. Texto com condição comercial envelhece mal — por isso o padrão novo
  não põe preço nem percentual em artigo.

## 2. O padrão novo

Tudo o que está acima continua valendo como piso. Por cima disso, um artigo
escrito aqui tem:

| Elemento | Para que serve | Regra |
|---|---|---|
| **Em resumo** | A resposta em 3 ou 4 pontos, logo depois da abertura | Obrigatório (menos em notícia) |
| **Tabela comparativa** | Opções lado a lado; a coluna recomendada fica marcada | Ao menos dois elementos de apoio por artigo, entre tabela, gráfico, prós e contras e citação |
| **Gráfico de benchmark** | Número medido, em barras, com a diferença calculada | Só com fonte e link; sem fonte, o artigo é reprovado |
| **Prós e contras** | O que pesa a favor e contra, sem enfeite | Obrigatório em análise |
| **Citação** | Uma frase de quem testou ou fabricou | Frase real, com autor e publicação de origem |
| **Destaque** | Uma dica, um alerta ou uma nota que não cabe no fluxo | Livre |
| **Chamadas** | O convite para a loja, no assunto do texto | De 1 a 3; nunca no primeiro quarto do artigo; nunca duas seguidas |
| **Veredito** | Nota, para quem serve e a conclusão | Obrigatório em análise; a nota é a média dos critérios |
| **Perguntas frequentes** | As dúvidas de balcão, respondidas em duas ou três frases | De 3 a 6 |
| **Fontes e método** | De onde veio cada dado | Obrigatório quando há dado de terceiros; em análise, dizer se o teste é próprio ou publicado |

### Tamanhos

| Categoria | Mínimo de palavras | Mínimo de seções |
|---|---|---|
| Guias, Hardware, Análises | 1.200 | 4 |
| Assistência | 1.000 | 4 |
| Notícias | 350 | 2 |

Título de 30 a 80 caracteres (até 60 no título para o Google). Descrição de 110
a 165. Nenhum parágrafo acima de 110 palavras.

### Regras de honestidade

Valem mais do que qualquer regra de formato:

1. **Número só com origem.** Se não há teste publicado ou medição da bancada,
   o número não entra.
2. **Citação só de quem disse.** Nada de frase inventada atribuída a "um
   especialista" ou a um técnico da loja. Para citar a bancada, alguém da
   bancada precisa ter dito.
3. **Análise diz como foi feita.** Teste próprio ou comparação de testes
   publicados — o leitor tem de saber qual dos dois.
4. **A loja só afirma o que faz.** Ver o computador ligado, testar antes de
   pagar, assistência no mesmo endereço, atendimento humano no WhatsApp. Preço,
   prazo e desconto ficam fora do artigo.
5. **Notícia é texto próprio.** Conta o fato em poucas linhas, cita e linka a
   fonte, e gasta o resto do espaço no que isso muda para quem vai comprar.
   Nunca copia o texto de outro site.

### Chamadas: o que separa artigo de panfleto

A chamada continua o assunto do texto. Quem lê sobre notebook que esquenta
recebe a assistência técnica; quem compara placas de vídeo recebe as placas. Os
temas prontos estão em `lib/blog/chamadas.ts`. A melhor chamada é uma pergunta
que o leitor faria no balcão: "Mande a lista dos seus jogos".

## 3. Roteiro para escrever (ou para pedir a uma IA)

1. **Busca:** qual frase a pessoa digita no Google? Ela vai no título e na
   primeira frase.
2. **Resposta curta:** em duas linhas, qual é a resposta? Ela vai no segundo
   parágrafo e no "Em resumo".
3. **Dados:** que número sustenta a resposta, e quem mediu? Sem isso, o artigo
   é guia, não análise.
4. **Seções:** de cinco a sete decisões que o leitor precisa tomar, na ordem em
   que aparecem na vida real.
5. **Contraponto:** em que caso a recomendação não vale?
6. **Loja:** qual serviço ou categoria resolve o problema deste artigo? Uma
   chamada no meio, outra no fim.
7. **Perguntas:** o que o cliente pergunta no WhatsApp sobre isso?
8. `npm run blog:novo`, preencher, `npm run blog:conferir`.

O artigo `content/blog/artigos/rtx-5060-ti-8gb-ou-16gb.ts` é o modelo
completo: usa todos os elementos acima.

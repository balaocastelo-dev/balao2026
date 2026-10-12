# Publicação diária automática

Três vezes por dia uma tarefa agendada escreve e publica no blog. Ninguém
precisa fazer nada.

| Hora | Tarefa agendada | O que publica |
|---|---|---|
| 05:54 | Blog Balão - artigo do dia | Guia de compra, conserto, hardware, IA ou Apple: o artigo longo, que traz busca do Google |
| 11:54 | Blog Balão - notícia do dia | Notícia curta de tecnologia, com duas fontes e "o que isso muda para você" |
| 17:54 | Blog Balão - dica do dia | Dica rápida (450 a 950 palavras), com o **roteiro do vídeo** |

O comando de publicar aceita uma publicação de cada tipo por dia; o tipo sai
do próprio artigo (categoria `noticias` é notícia, `"formato": "dica"` é dica,
o resto é o artigo principal).

## O vídeo da dica

A dica leva um campo `roteiro` (fala, título, destaques, legenda, hashtags).
A fábrica de conteúdo, no computador da loja, transforma esse roteiro em
Reels com o avatar do Thiago (`balao-content-factory\publisher\video_dica.py`,
segunda, quarta e sexta às 04:15, depois do vídeo do dia), manda a prévia no
Telegram dele às 07:30 e só publica no Facebook e no Instagram, às 15:00,
depois do OK. A legenda do Facebook leva o link do artigo. O blog em si não
passa pelo Telegram.

O script lê este ramo de conteúdo direto do GitHub e pega a dica mais nova
(até quatro dias) que ainda não virou vídeo; confere o roteiro de novo antes
de gravar. Os detalhes da fábrica estão no doc `claude/fabrica-de-conteudo-11-10.md`
do Projeto "Balao.info" e na nota `11-Claude\Fabrica-de-Conteudo.md` do cérebro.

A régua confere o roteiro como confere o texto: de 45 a 85 palavras de fala,
sem preço, sem promessa, sem número que a voz sintética lê mal.

## A foto de capa

A foto é feita **no computador da loja, na placa de vídeo local** — não
depende de serviço de imagem pago (até 11/10/2026 era o gerador do Figma, que
parou no meio do dia por limite de créditos).

1. A rotina, na nuvem, só **descreve** a foto no artigo:
   `"capa": { "alt": "o que a foto mostra", "pedido": "a cena, em inglês, para o gerador" }`.
2. O `publicar` põe o artigo no ar com a capa desenhada pelo site e grava o
   pedido na fila `capas/pendentes.json`, no ramo de conteúdo.
3. No computador, `balao-content-factory\publisher\capa_blog.py` (a fonte
   fica em `scripts/fabrica/capa_blog.py`) lê a fila, espera a placa ficar
   livre, gera a foto com o Flux no ComfyUI (1600 × 900, cerca de um minuto) e
   mostra a um modelo de visão do Ollama (`qwen2.5vl:7b`), que **lista** o
   texto, a marca, o rosto e o defeito que encontrar. Qualquer item listado,
   ou cena diferente da pedida, reprova. Até três tentativas por rodada.
4. Aprovada, a foto é presa ao artigo com
   `node scripts/blog-publicar.mjs capa <endereço> foto.jpg` (confere tamanho
   e proporção, grava em `capas/` e tira o pedido da fila), num clone do
   repositório só para isso (`balao-content-factory\_blog_repo`). O envio usa
   o login do GitHub já guardado no Windows.
5. Dois dias sem foto boa: o pedido sai da fila (`capa <endereço> --desistir`)
   e o artigo fica com a capa desenhada.

Enquanto o computador estiver desligado, os artigos saem normalmente, com a
capa desenhada; as fotos são feitas quando ele voltar.

**Instalado e testado em 11/10/2026.** Tarefa do Windows `\BalaoFabrica\Capa
do blog`, todo dia às 06h20, 09h20, 12h20, 15h20, 18h20 e 21h20 (instalador:
`scripts/fabrica/instalar_tarefa_capa.ps1`). Com a fila vazia, sai na hora.
Registro em `logs\capa_blog.log`; fotos em `data\capas_blog\`.

Cuidados que o programa toma, porque a placa de vídeo é uma só:

- **A URA tem prioridade.** Não começa com ligação em andamento e, se entrar
  uma no meio, derruba o ComfyUI na hora; a foto fica para a rodada seguinte.
- Não roda junto com o vídeo do dia, o vídeo da dica nem outro render, e
  confere se há memória livre na placa (15 GB) antes de começar.
- Também cede a placa à JUL.IA (vendedora do WhatsApp; sinal em
  `balao-agente\dados\placa-julia.txt`, regra do Thiago de 12/10/2026), aos
  vídeos da Pauta e às fotos de corpo inteiro (`video_pauta.py`,
  `corpo_inteiro.py`, `kontext_corpo.py`), e nunca fecha um ComfyUI que outro
  programa esteja usando.
- O texto do Flux roda na CPU e o Flux sai da placa antes de o modelo de visão
  entrar: com tudo junto a memória transborda e a geração fica ~100 vezes mais
  lenta, sem dar erro.
- Fora da categoria Apple, o pedido ganha um reforço para o notebook não sair
  com cara de MacBook (o Flux desenha "notebook prateado" assim).

À mão, no computador (pasta `publisher`):

- `python capa_blog.py --ver` — mostra a fila;
- `python capa_blog.py --sem-publicar` — gera e confere, sem prender ao artigo;
- `python capa_blog.py --teste saida.jpg "pedido em inglês"` — foto avulsa;
- `python capa_blog.py --conferir foto.jpg "a cena"` — só o modelo de visão.

Para pedir a foto de um artigo que saiu sem ela, ou trocar uma foto ruim:
`node scripts/blog-publicar.mjs capa <endereço> --pedir --alt "…" --pedido "…"`
(com `--trocar` se o artigo já tiver foto).

Limite conhecido: quem aprova a foto é um modelo de visão pequeno. Nos testes
ele pegou texto pequeno, etiqueta borrada, rosto e imagem errada, mas ninguém
humano olha a foto antes de ela ir ao ar.

## Como funciona

1. A tarefa agendada abre uma sessão do Claude.
2. Ela lê as regras, a pauta e o que já foi publicado
   (`node scripts/blog-publicar.mjs preparar`).
3. Escolhe o próximo assunto da pauta, pesquisa em fontes abertas e escreve o
   artigo em um arquivo JSON.
4. O comando `publicar` confere o artigo (formato e régua editorial). Se
   passa, grava no ramo `claude/blog-conteudo` e envia ao GitHub.
5. O site lê esse ramo a cada 15 minutos. Em até uma hora o artigo está em
   `www.balao.info/blog`, na vitrine do topo e na lista.

Publicar um artigo **não refaz o site**, não toca no ramo principal e não usa
o banco de dados: é só um arquivo novo num ramo à parte.

## Onde ficam as regras

No próprio ramo de conteúdo, para poderem ser ajustadas sem publicar o site:

- [`ROTINA.md`](https://github.com/balaocastelo-dev/balao2026/blob/claude/blog-conteudo/ROTINA.md) — o passo a passo e as regras de escrita;
- [`pauta.md`](https://github.com/balaocastelo-dev/balao2026/blob/claude/blog-conteudo/pauta.md) — a fila de assuntos.

## O que protege a loja

Ninguém revisa o artigo antes de ele ir ao ar. Por isso o artigo da rotina
pode menos do que um artigo escrito e revisado aqui, e quem garante isso é o
código (`lib/blog/regua.ts`), não a boa vontade de quem escreve:

| O artigo da rotina… | Por quê |
|---|---|
| não leva preço, parcela, desconto nem frete | Mudam; o texto fica no ar por anos |
| não leva gráfico de benchmark nem citação | Número de teste e frase de terceiros só com revisão |
| não dá nota nem veredito (nada de categoria Análises) | Nota é opinião da loja |
| só usa as chamadas já escritas | Não inventa promessa em nome da loja |
| só aponta para páginas da loja de uma lista conferida | Link quebrado é o erro mais comum de texto automático |
| precisa de ao menos duas fontes | Fato sem origem não entra |
| não afirma "testamos" | A rotina não testou nada |
| não traz imagem de fora | Imagem tem dono; a capa é a foto gerada no computador da loja e enviada pelo comando (`capa`) |

O site aplica as mesmas conferências **de novo** na hora de mostrar. Um
arquivo colocado no ramo por outro caminho, se não passar, não aparece.

O que nenhuma régua garante é que todo fato esteja certo. As regras reduzem o
risco (fato só de página aberta, fontes listadas no fim de cada artigo), mas
vale ler um artigo de vez em quando.

## Comandos

```bash
node scripts/blog-publicar.mjs preparar               # regras, pauta e o que já saiu
node scripts/blog-publicar.mjs listar                 # só o que já saiu
node scripts/blog-publicar.mjs conferir artigo.json   # confere, sem publicar
node scripts/blog-publicar.mjs publicar artigo.json   # confere e publica
node scripts/blog-publicar.mjs pendentes              # fotos de capa que faltam gerar (JSON)
node scripts/blog-publicar.mjs capa <endereço> foto.jpg   # prende a foto a um artigo publicado
node scripts/blog-publicar.mjs capa <endereço> --pedir --alt "…" --pedido "…"   # pede a foto de um artigo sem foto
node scripts/blog-publicar.mjs retirar <endereço>     # tira um artigo do ar
```

Não precisam de `npm install`: só do Node 22.18 ou mais novo e do git.

- `--atualizar` troca o texto de um artigo já publicado (mantém a data).
- `--forcar` publica um segundo artigo no mesmo dia, ou um título parecido com
  outro já publicado.

## Parar, pausar, tirar do ar

- **Pausar a publicação:** desligar a tarefa agendada "Blog Balão - artigo do
  dia" (em Tarefas agendadas, no Claude). Os artigos já publicados continuam.
- **Tirar um artigo do ar:** `retirar <endereço>`. Some em até uma hora.
- **Tirar todos de uma vez, sem apagar:** definir `BLOG_DIARIO=false` nas
  variáveis da Vercel e publicar o site.

## Limites conhecidos

- A página principal envia a lista inteira de artigos ao navegador (é o que
  deixa a busca instantânea). Com um artigo por dia, vale paginar no servidor
  quando a lista passar de uns 400 artigos.
- Se o GitHub estiver fora do ar quando o site for refazer uma página, ela
  continua com a versão anterior até a próxima tentativa.

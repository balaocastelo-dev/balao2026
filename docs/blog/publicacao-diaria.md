# Publicação diária automática

Todo dia, perto das 6 da manhã, uma tarefa agendada escreve e publica um
artigo novo no blog. Ninguém precisa fazer nada.

## Como funciona

1. A tarefa agendada ("Blog Balão - artigo do dia") abre uma sessão do Claude.
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
| não traz imagem de fora | Imagem tem dono; a capa é desenhada pelo site |

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

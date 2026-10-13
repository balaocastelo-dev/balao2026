# Páginas de captação (12/10/2026)

Pedido do Thiago: reformular 22 páginas (21 ficaram neste molde) do site para que cada uma seja um ímã de leads — bonita, rápida,
com produtos com foto, bem preenchida, com palavras-chave para o Google e para as IAs, e que leve a
pessoa a chamar no WhatsApp. Cada página é única.

## As páginas

`/manutencao`, `/recuperacaodados`, `/reparoapple`, `/telaiphone`, `/wendell/apple`, `/assistenciagames`,
`/montagempc`, `/pcgamer`, `/pcgamer3d`, `/notebooks`, `/carregadores`, `/tonner`, `/microsoft`,
`/consignacao`, `/sistemas`, `/promocao`, `/envio-e-entrega`, `/trocas-e-devolucoes`, `/como-comprar`,
`/sobre-a-empresa`, `/sobre-nos`.

A `/servicos-e-ofertas` estava no pedido, mas outra conversa a refez no mesmo dia (PR #60, com formulário
próprio em `lib/servicos-e-ofertas/`); ficou a versão dela. O mesmo vale para `/especialidades` (PR #59) e
`/seminovos` (PR #61), que não estavam nesta lista.

## Como funciona

- **Conteúdo:** um arquivo por página em `lib/landing/paginas/<slug>.ts` (tipo em `lib/landing/tipos.ts`).
  Texto, SEO, perguntas, assistente de orçamento, seções e regras da vitrine ficam ali. Para mudar texto,
  mexa só nesse arquivo.
- **Montador:** `components/landing/PaginaDeCaptacao.tsx`. Ordem fixa: topo → faixa de prova → seções da
  página → artigos do blog → perguntas → "Também resolvemos" → fecho com endereço. Barra de WhatsApp fixa
  no celular.
- **Topo (o efeito 3D):** `components/landing/PalcoDoTopo.tsx`. A foto do serviço fica num plano em
  perspectiva que deita conforme a rolagem; no computador, produtos da vitrine da página flutuam em
  profundidades diferentes. Com "reduzir movimento" ligado, nada se mexe.
- **Assistente de orçamento:** `components/landing/AssistenteDeOrcamento.tsx`. Duas ou três perguntas com
  botões; a mensagem do WhatsApp sai escrita com as respostas (modelo, defeito, uso...). Cada resposta e
  cada clique vão para o registro de eventos (`/api/track-event`, `whatsapp_click` e `assistente_resposta`).
- **Botão flutuante do WhatsApp:** nas páginas de captação ele leva a mensagem da página (não a genérica).
  No celular é substituído pela barra fixa.
- **Vitrine:** `lib/landing/vitrine.ts`. Cada fileira diz em que categoria o produto está (ou como o nome
  começa) e o que fica de fora. Só entra produto com foto, disponível, sem repetir nome e variando a marca.
  Acabou a busca por palavra solta (era assim que a página de toner mostrava notebook HP).
  O banco recebe uma consulta enxuta (`getCandidatosPorOrigens`) e o cache guarda só as fileiras prontas
  (`getCachedFileirasDaPagina`), com a cópia do catálogo como reserva.
- **Links entre páginas e com o blog (padrão Soro):** `lib/landing/rede.ts`. "Também resolvemos" junta as
  páginas pedidas no arquivo e as que dividem temas; "Antes de decidir, leia" acha os artigos do blog pelo
  assunto (etiquetas, título, endereço). No sentido contrário, as chamadas dos artigos (`lib/blog/chamadas.ts`)
  ganharam os temas carregadores, licenças, impressão e games, que levam para `/carregadores`, `/microsoft`,
  `/tonner` e `/assistenciagames`.
- **Velocidade:** as páginas saem prontas do servidor e são refeitas a cada 5 minutos (`revalidate = 300`),
  em vez de consultar o banco a cada visita. Antes, quase todas carregavam o catálogo inteiro (12 MB) por visita.
  O cabeçalho do site lia a URL direto e fazia as páginas estáticas saírem vazias do servidor; a leitura foi
  isolada num componente dentro de `Suspense` (`components/Header.tsx`), o que vale para o site inteiro.
- **IA:** `/llms.txt` agora é gerado (`app/llms.txt/route.ts`) com todas as páginas, os contatos e as três
  primeiras perguntas de cada uma. O começo é o texto que estava em `public/llms.txt`.
- **Fotos do topo:** `public/images/landing/v2/<slug>.jpg`, geradas na placa de vídeo do computador da loja
  com o mesmo motor da capa do blog (Flux no ComfyUI + conferência do Ollama: sem texto, marca nem rosto).
  Script: `C:\Users\user\balao-content-factory\data\heros_landing\gerar_heros.py` (pedidos em `pedidos.json`).

## Régua

`__tests__/lib/landing-paginas.test.ts`: título, descrição, perguntas, imagens existentes, links válidos e
frases proibidas (prazo fixo, "garantia de 1 ano", "certificado", "sem robô", preço no texto...).
Para ver o que cada vitrine mostra com o catálogo de hoje:

```
ESPELHO=/caminho/espelho.json npx vitest run __tests__/lib/landing-paginas.test.ts
```

(o espelho é o JSON de `https://srv1963897.hstgr.cloud/api/crm/catalogo`).

## O que saiu das páginas antigas

Promessas sem base escritas por IA: prazos ("em até 3 horas", "24h"), "garantia de 1 ano", "técnicos
certificados", "uma das maiores redes do Brasil", "Inscrição Estadual 000.000.000.000", e-mail errado
(sac@balaodainformatica.com.br), depoimentos inventados da página Apple, laboratório de sala limpa na
recuperação de dados, percentuais e prazos da consignação, preços no texto.

## Para conferir com o Thiago

- A página `/wendell/apple` diz que a Balão não é assistência autorizada Apple.
- A recuperação de dados não diz se o trabalho é feito na loja ou num parceiro.
- Troca de compra feita no balcão sem defeito: o texto diz "combinada com a loja".
- O carrinho (`lib/shipping.ts`) ainda mostra "Entrega Flash (Campinas) — Até 24h" com um cálculo simulado,
  o que contradiz a página de entrega.
- Os 7 gabinetes do catálogo estão sem foto; quando tiverem, dá para voltar a fileira de gabinetes da `/montagempc`.

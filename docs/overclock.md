# Página de vendas do Overclock (`/overclock`)

**www.balao.info/overclock** vende o Overclock, o sistema da loja empacotado como white label para outras
lojas de informática. `/whitelabel` redireciona para lá (301, em `next.config.ts`).

## Onde está

- `app/overclock/page.tsx` — a página (estática). Identidade própria: grafite, laranja e verde,
  fontes Archivo (títulos) e Lexend (texto). Fica fora do layout da loja (sem menu, rodapé e botão de
  WhatsApp da loja): ver `isPaginaDeVendas` em `components/LayoutWrapper.tsx`.
- `app/overclock/_dados/oferta.ts` — preços, o que está incluído, links de WhatsApp e os números do caso
  Google Ads. **Preço muda aqui** (a página, o JSON-LD e a calculadora leem daqui).
- `app/overclock/_dados/conteudo.ts` — textos: dores, 15 passos da instalação, funcionalidades,
  ficha técnica, tabela "quanto custa manter" (preços conferidos em 15/out/2026) e perguntas frequentes.
- `app/overclock/_dados/calculo.ts` — a conta da calculadora (testada em
  `__tests__/lib/overclock-pagina.test.ts`).
- `app/overclock/opengraph-image.tsx` — a capa ao compartilhar o link.

## Vídeos

Preencha a lista `VIDEOS` em `app/overclock/_dados/videos.ts`. Lista vazia = seção "em breve" com o botão
de demonstração ao vivo.

- YouTube: `{ tipo: "comercial", titulo: "...", youtube: "https://youtu.be/XXXXXXXXXXX" }`
- Arquivo: coloque o `.mp4` em `public/overclock/videos/` e use
  `{ tipo: "demonstracao", titulo: "...", arquivo: "/overclock/videos/demo.mp4", capa: "/overclock/videos/demo.jpg" }`

O `tipo: "demonstracao"` aparece grande, em cima; os comerciais em grade embaixo.

## PDF da apresentação

Coloque o arquivo em `public/overclock/overclock-apresentacao.pdf`. O botão "Baixar apresentação em PDF"
aparece sozinho no próximo deploy (a página confere se o arquivo existe na hora do build).

## Regras do texto

- Números do caso Google Ads: só os de `CASO_GOOGLE_ADS` (faturas da loja). Nada de "R$ 500 por dia".
- Sempre o aviso "Resultados da loja Balão da Informática; cada loja tem seu resultado."
- Sem depoimento inventado, sem número de clientes, sem promessa de faturamento.
- "Sem Google" quer dizer sem **pagar** o Google: o orgânico vem da busca, de graça.

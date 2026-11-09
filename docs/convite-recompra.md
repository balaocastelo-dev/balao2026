# Convite de recompra (`/convite`)

Página que o Balão envia por e-mail aos clientes antigos para voltarem a comprar.
Endereço: `www.balao.info/convite` (rewrite em `next.config.ts` para `/convite/index.html`).

- Arquivos em `public/convite/`: `index.html`, `convite.mp3` (narração do Thiago, ~33 s, voz clonada local) e `img/`.
- A página é **gerada**, não editada à mão: `C:\Users\user\Documents\08-Arquivos-Hermes\bling-clientes\convite\gera_convite.py`
  (lê `selecao.json` com os 9 produtos). Os caminhos são absolutos (`/convite/...`) porque a página responde em `/convite`, sem barra.
- Não mostra preço (`MOSTRAR_PRECO = False`) até existir um cupom real; o texto fala em "condições exclusivas" via WhatsApp (19) 98751-0267.
- Tem `noindex`: só abre por quem recebe o link.
- Os links dos produtos levam `utm_campaign=recompra-2026-11` para medir a campanha.
- Fila de envio e envio por lotes de 200: mesma pasta (`fila-envio.csv`, `envia_lote.py`).

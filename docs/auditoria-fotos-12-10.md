# Auditoria de fotos — 12/10/2026

Pedido do Thiago: "tem air cooler saindo com foto de water cooler de 360mm… garanta que as imagens são as corretas
de acordo com o nome do produto."

## O caso

**Cooler para Processador Redragon Effect CC2000** (TechSupri, air cooler de 120 mm) estava com a foto do
**Water Cooler Redragon Effect CCW-3017 360mm**. A foto vinha da busca de "foto parecida" (ilustrativa): mesma
marca, mesma linha "Effect", e a regra aceitava.

## Como foi conferido

Todas as 7.040 fotos do catálogo foram vistas, em folhas de contato, por nome × foto:

| Origem | Produtos | Como |
|---|---|---|
| TechSupri (foto de outro site) | 663 | lado a lado com a **foto da própria TechSupri** (a verdade) |
| Robson Atacado e Domarkim (foto do fornecedor) | 1.293 | nome × foto |
| KaBuM! (foto do próprio anúncio) | 4.990 | nome × foto, incluindo os PCs de lojistas |

## O que estava errado

- **TechSupri:** só 271 das 663 fotos eram do produto exato. 392 eram de outra marca (Furukawa no cabo Exbom,
  Elgin na pilha Mox, Hrebos no carregador Kaidi), outro modelo (KD 305 × KD 330M), outra metragem ou quantidade
  (cartela de 4 no lugar de 2), conector invertido, outra plataforma (Switch × Switch 2) ou outro produto
  (capa com foto de controle, adesivo com foto de pasta térmica, air cooler com water cooler).
- **Robson/Domarkim:** 59 fotos do próprio fornecedor com outro produto (chip com só o logo da operadora,
  calculadora Kenko no lugar da Maxmidia, cabo Tipo-C no lugar do Lightning, fonte 45 W no lugar de 67,5 W…).
- **KaBuM!, produtos da loja:** 14 (notebook Acer de outra cor, kit de ventoinhas com foto de 1, jogo de Switch 1
  no anúncio de Switch 2, edição Deluxe no lugar da comum, placa-mãe WiFi no lugar da sem WiFi…).
- **KaBuM!, PCs de lojistas:** 200 com foto que contradiz o anúncio (etiqueta GTX 1650 em PC de GTX 1050,
  GT 740 em PC de GT 730, GeForce RTX em PC de Radeon ou de vídeo integrado, gabinete vazio, só o monitor,
  monitor de outra polegada).

A lista inteira (produto, foto, motivo) está em `data/auditoria-fotos-2026-10-12.json` (665 itens).

## O que mudou no código

- `lib/precos/conflitos-de-foto.ts` — `conflitoDeDetalhe(nome, anúncio)`: recusa a foto quando tipo, marca,
  modelo da mesma linha, medida (m, mm, W, mAh, V, ml, lumens), capacidade (GB/TB), quantidade, versão
  (Pro, Mini, Edge, 4K…), plataforma, cor ou conectores se contradizem; water cooler × air cooler é conflito.
- `lib/precos/fotos.ts` — `semelhanca` usa o conflito e passa a **exigir código de modelo** em comum (sem
  código, sem foto automática). Foto **ilustrativa desligada** (`ILUSTRATIVA_DESLIGADA`); `--ilustrativas`
  do `scripts/techsupri-carga.ts` agora recusa, e `--reconferir` tira toda ilustrativa.
- `lib/precos/fotos-recusadas.ts` + tabela `fotos_recusadas` — foto reprovada não volta: a gravação das fontes
  (`banco.ts → gravarPagina`) e a busca de foto (`importacao.ts → completarFotos`) pulam a foto recusada daquele
  produto. Se a principal foi recusada, o item entra sem foto (a galeria não é promovida sem conferência).
- `app/api/precos/fotos-recusadas` (sessão do painel):
  - `GET` lista; `POST { itens: [{ id, foto?, motivo?, nova? }] }` recusa (e põe a `nova`, se vier, ou "sem foto");
  - `POST { auditoria: "2026-10-12", inicio, quantidade }` aplica a lista guardada, em partes;
  - `DELETE { id, foto }` desfaz.

## Regra que fica

A foto é a do produto exato — mesma marca, modelo, variante, medida, cor e quantidade — ou nenhuma.
"Parecida" não serve. Melhor "sem foto" do que foto errada.

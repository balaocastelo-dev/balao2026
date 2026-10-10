# Página Premium e categoria IA local

Duas páginas que leem o catálogo e se montam sozinhas. Nenhuma delas tem cadastro próprio.

| Endereço | O que mostra |
|---|---|
| `/premium` | Os 24 desktops mais caros da loja (o mais caro em destaque, os outros 23 em lista), os 4 notebooks mais caros e a entrada para a categoria de IA local. |
| `/ia-local` | Todas as máquinas do catálogo que atendem ao critério de IA local, com recorte por memória, ordem de preço e paginação. `/categoria/ia-local` redireciona para cá. |

## De onde vêm os produtos

De `products`, pelas categorias `Computadores/PC` (desktops, iMac, mini PC) e `Computadores/Notebooks`. A leitura é `getCachedVitrinePremium()` em `lib/cache.ts`: uma consulta ao banco a cada cinco minutos, no máximo, dividida pelas duas páginas, com a cópia do catálogo como reserva quando o banco não responde. Mudança de preço ou de catálogo pelo painel derruba esse cache na hora (etiqueta `products`).

Fica de fora o produto sem preço e o marcado como indisponível.

**O preço é sempre o do catálogo.** A página antiga multiplicava o preço por 0,5 e escrevia "50% OFF". Não há conta de preço nestas páginas.

## A ficha vem do título

Os computadores chegam pelo espelhamento sem ficha técnica; tudo o que se sabe está no título do vendedor de origem. `lib/catalogo/ficha.ts` lê o título e devolve processador, placa de vídeo, memória da placa (VRAM), RAM e armazenamento. É conservador: na dúvida, o campo fica vazio.

- Memória da placa: vale a tabela do fabricante (`VRAM_DESKTOP` e `VRAM_NOTEBOOK`). Modelo com mais de uma versão (RTX 5060 Ti de 8 ou 16 GB) fica com a menor para a regra, a não ser que o título diga a maior — e, enquanto o título não disser, a página mostra a placa sem o número.
- Placa nova no mercado: acrescentar uma linha na tabela. Placa fora da tabela aparece com o nome, sem memória, e não entra em IA local.
- Mini PC, "tudo em um" e máquina com processador de notebook (final H, HX, HS, U) usam a tabela de notebook: a placa de mesmo nome tem menos memória.
- Armazenamento: "NVMe" só quando o título diz NVMe ou PCIe; "M.2" sozinho vira "SSD M.2"; capacidade sem palavra nenhuma aparece só com o tamanho.
- O nome de vitrine ("Ryzen 7 9800X3D com RTX 5070 Ti") também sai daí. O nome completo continua na página do produto.

## Quem entra em IA local

A regra está em `lib/catalogo/ia-local.ts` e aparece escrita para o cliente em `/ia-local`:

- placa **NVIDIA GeForce RTX com 12 GB ou mais** de memória de vídeo **e 32 GB ou mais de RAM**; ou
- **Apple com chip M e 24 GB ou mais** de memória unificada.

Faixas: 12 GB, 16 GB, 24 GB ou mais, e Apple. Para mudar o critério, mexer nas três constantes do topo do arquivo (`VRAM_MINIMA`, `RAM_MINIMA`, `MEMORIA_UNIFICADA_MINIMA`). Os textos de "o que cabe" em cada faixa estão em `NIVEIS`, no mesmo arquivo.

O produto não muda de categoria no cadastro: continua em Computadores e aparece em IA local por atender à regra. Sai sozinho quando deixa de atender ou some da fonte de preços.

## Testes

`npx vitest run __tests__/lib/catalogo-vitrine-premium.test.ts` — 49 casos, quase todos com títulos reais do catálogo de 10/10/2026.

## Visual

Estilos em `components/premium/premium.css` (tudo com prefixo `.prm`), fonte Archivo carregada só nessas duas páginas (`components/premium/fonte.ts`). As páginas alternam faixas escuras e brancas: sobre branco, as fotos do catálogo (que têm fundo branco) ficam soltas, sem moldura.

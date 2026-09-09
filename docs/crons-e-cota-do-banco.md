# Crons e a cota de conexões do banco

## O problema que isso resolve

O banco MySQL da Hostinger permite **500 conexões por hora** para o usuário do
site. Estourada a cota, o banco recusa **tudo** — e o catálogo aparece vazio no
site e no CRM até a hora virar. O sintoma é o catálogo "sumir às vezes".

Para saber se é esse o caso:

```bash
curl -s https://www.balao.info/api/health
```

Se o campo `banco.erro` mencionar `max_connections_per_hour`, é a cota.

## O que estava queimando a cota

Os três crons rodavam **a cada minuto** (`* * * * *`):

```
/api/cron/blog-rss         * * * * *
/api/cron/blog-product     * * * * *
/api/cron/blog-balao-item  * * * * *
```

São 180 execuções por hora — **4.320 por dia** — cada uma abrindo conexão com
o banco, sem nenhum visitante no site. Isso sozinho consumia a cota. Como
blog, também tentaria publicar 1.440 posts por dia.

## Como está agora

| Cron | Agenda | Quando roda |
| --- | --- | --- |
| `blog-rss` | `0 */6 * * *` | A cada 6 horas |
| `blog-product` | `20 9 * * *` | Uma vez por dia, 9h20 |
| `blog-balao-item` | `40 15 * * *` | Uma vez por dia, 15h40 |

De 4.320 execuções diárias para 6.

## ⚠️ O `vercel.json` não aceita comentários

Já quebrou um build: a Vercel valida o arquivo contra um schema fechado e
recusa qualquer propriedade fora dele.

```
Error: Invalid vercel.json - `crons[0]` should NOT have additional
property `_comentario`. Please remove it.
```

Dentro de cada cron só podem existir `path` e `schedule`. Explicação vai
para este documento, não para o JSON.

## A outra fonte de consumo

30 páginas com `force-dynamic` liam o banco a cada visita — incluindo
`getProducts()`, que carrega os 4.155 produtos com specs e descrição.

Elas usam as funções de `lib/cache.ts` (`getCachedProducts`,
`getCachedProductsByKeywords`, `getCachedCategories`), com 2 a 5 minutos de
cache. As páginas continuam dinâmicas; o que mudou é de onde vem o dado.

**Ao criar página nova que lista produtos, use as funções de `lib/cache.ts`,
não as de `lib/db.ts`.** As de `db` ficam para rotas de API e para o admin,
que precisam do dado fresco.

## Quando o preço muda

Toda alteração de produto (individual, em lote ou importação) chama
`invalidarCacheProdutos()`. É isso que faz o site e o CRM mostrarem o novo
valor na hora, em vez de esperar o cache expirar.

Ao criar uma rota nova que altere produto, chame essa função depois de salvar.

## Nenhuma página lê o banco direto

Depois da segunda vez que a cota estourou, ficou claro que a correção anterior
tinha deixado de fora justamente as páginas mais visitadas: a **home**, a
**página de produto** e a de **categoria** ainda chamavam `lib/db` a cada
visita. Um robô de busca varrendo os 4.155 produtos queimava a cota sozinho.

Hoje **nenhuma** `page.tsx` importa de `lib/db`. Para conferir:

```bash
grep -rln 'from "@/lib/db"' app --include=page.tsx
```

A saída precisa ser vazia. Se aparecer alguma página aí, ela é candidata a
derrubar o catálogo no próximo pico de acesso.

## O CRM também consome a cota

Seis vendedores com o painel aberto recarregam `/api/categories` e
`/api/products` o tempo todo. As duas rotas passam pelo cache; ao criar rota
nova que o painel consulte, usar `lib/cache.ts` também.

## Espelho do catálogo na VPS

Mesmo sem nenhuma página lendo o banco direto, a cota pode estourar por outro
motivo (importação, admin, cron novo). Para o catálogo não sumir da tela nessa
hora, a VPS guarda uma cópia.

Como funciona:

- A VPS busca `​https://www.balao.info/api/products?origem=banco` ao subir e
  a cada 30 minutos, e grava em `catalogo.json` no volume.
- `origem=banco` lê o banco **direto**, sem cache e sem a cópia. Sem isso o
  espelho se alimentaria de si mesmo: num dia de cota estourada o site
  responderia com a própria cópia, e a VPS gravaria dado velho carimbado com
  data nova.
- Toda alteração de produto chama `invalidarCacheProdutos()`, que avisa a VPS
  na hora — a cópia não fica meia hora com preço velho.
- **Catálogo vazio nunca sobrescreve a cópia boa.** Quando a cota estoura, o
  site responde `[]` em vez de erro; gravar isso apagaria justamente a cópia
  que existe para esse momento.

No site, toda leitura de produto passa por `comEspelho()` em `lib/cache.ts`:
consulta o banco e, se vier vazio, serve a cópia. **É rede de segurança, não a
fonte** — o caminho normal continua sendo o banco.

⚠️ Os filtros do espelho (`lib/catalogo-espelho.ts`) repetem em JavaScript o que
o SQL de `lib/db.ts` faz. Ao mudar uma consulta lá, mudar aqui também — senão,
no dia em que o banco cair, o site mostra uma seleção diferente da de sempre.

Para conferir o estado da cópia:

```bash
curl -s https://srv1963897.hstgr.cloud/api/crm/catalogo/estado
```

## Se voltar a estourar

1. Confirme pelo `/api/health` que é a cota mesmo.
2. Veja se algum cron novo entrou com agenda curta.
3. Procure página ou rota nova lendo de `lib/db` direto em vez do cache.
4. Não adianta reiniciar nada: a cota é por hora e zera sozinha na virada.

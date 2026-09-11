# Auditoria do site — setembro/2026

Levantamento das 51 páginas públicas, medido em produção (não estimado).
Cada item diz **o que foi medido**, **por que importa** e **o que fazer**.

Método: busca de cada rota em `https://www.balao.info`, extraindo status, título,
descrição, canonical, `<h1>`, dados estruturados, peso e tempo de resposta.
O script está em `scripts/auditar-site.mjs`.

---

## Resumo

| | |
| --- | --- |
| Páginas auditadas | 51 |
| Respondendo 200 | 51 (nenhuma página morta) |
| **Sem conteúdo no HTML servido** | **24** |
| Com dados estruturados | 51 (todas) |
| Sem canonical | 11 |
| Com título genérico repetido | 10 |

---

## 🔴 Crítico

### 1. Vinte e quatro páginas chegam vazias ao Google

**Medido:** `/sobre-nos`, `/como-comprar`, `/trocas-e-devolucoes`,
`/envio-e-entrega`, `/seguranca-e-privacidade`, `/fale-conosco`, `/livros`,
`/blog`, `/cart`, as sete páginas `/wendell/apple/*` e outras entregam de 10 a 15
palavras de HTML e **nenhum `<h1>`**. O conteúdo existe, mas só aparece depois
que o JavaScript roda.

**A causa** está no HTML servido:

```html
<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>
```

O `Sidebar` usa `useSearchParams()`, e o `LayoutWrapper` o renderiza **no mesmo
`<Suspense>` que envolve o conteúdo da página**. Em página estática os parâmetros
de busca não existem na hora da geração, então o Next desiste do servidor e joga
a árvore inteira — inclusive a página — para o navegador.

Por isso só as páginas **estáticas** quebram: nas dinâmicas (`/`, `/pcgamer`,
`/notebooks`, `/manutencao`) os parâmetros são conhecidos e o HTML sai completo.

**Por que importa:** o Google até executa JavaScript, mas indexa mais devagar e
com menos confiança. Pior: pré-visualização de link no WhatsApp, no Facebook e a
maioria das ferramentas de SEO **não executam JavaScript** — para elas, essas 24
páginas são páginas em branco.

**Correção:** `<Suspense>` próprio em volta do `Sidebar`, para que só ele caia
para o navegador, e não o conteúdo junto.

> Isto explica a contradição do relatório anterior, em que um analista disse que
> as páginas institucionais estavam vazias e outro disse que estavam completas.
> Os dois estavam certos: depende de executar JavaScript ou não.

### 2. A cota do banco continua vazando

**Medido:** `/api/health` responde
`max_connections_per_hour (current value: 500)` — agora.

Depois de tirar todas as páginas do caminho do banco, sobraram dois consumidores
públicos sem cache:

- **`/api/search`** — a caixa de busca do site, lendo o banco direto a cada
  pesquisa de cada visitante;
- **`app/sitemap.ts`** — e ele **estoura em erro 500** quando o banco recusa, em
  vez de degradar.

**Correção:** cache na busca e sitemap que nunca devolve 500.

### 3. `/fechamento` perdeu o histórico na migração do banco

**Medido:** as tabelas `weekly_orders` e `weekly_expenses` estão vazias no MySQL.

**Os dados existem.** Estão em
`C:\Users\user\Documents\Backup-Supabase-ptqqvezawobgnheesgvh\02-Dados\public\`:

| Arquivo | Registros |
| --- | --- |
| `weekly_orders.json` | **276 ordens de serviço** |
| `weekly_expenses.json` | **24 despesas** |

Período de **12/01/2026 a 06/08/2026**, somando **R$ 154.851,78** em serviços.
As colunas do backup batem exatamente com as da tabela atual.

**Correção:** importação pelo próprio site, numa tela protegida pela senha do
painel — assim nenhuma senha de banco precisa trocar de mãos.

### 4. `/politica-de-privacidade` → 404

O conteúdo existe em `/seguranca-e-privacidade`. É página que as pessoas linkam e
que a LGPD exige estar acessível. **Correção:** redirecionamento permanente.

### 5. Sitemap em erro 500

Consequência do item 2, mas com efeito próprio: sitemap que falha repetidamente
faz o Google reduzir o ritmo de descoberta. Produto novo demora a aparecer.

---

## 🟠 Importante

### 6. Dez páginas com o mesmo título

`/arena`, `/cart`, `/fechamento`, `/gerador`, `/livros`, `/promocao/pagina`,
`/roleta`, `/thank-you`, `/unsubscribe`, `/vitrine` — todas com
`Balão da Informática | Loja de Informática em Campinas`.

No resultado do Google, dez páginas iguais competem entre si.

### 7. Onze páginas sem canonical

As mesmas dez, mais `/funcoes`. Sem canonical, endereços com parâmetro
(`?utm_source=...`) podem ser tratados como páginas diferentes.

### 8. Categorias com título genérico

Toda `/categoria/*` responde `Categoria | Balão da Informática`. Deveria trazer o
nome da categoria.

### 9. Facebook apontando para a página errada

`lib/config.ts` aponta para `facebook.com/balaodainformatica` (nacional).
O correto é `https://www.facebook.com/Balaocastelo/`.

---

## 🟡 Melhorias

### 10. Nenhuma captura de contato

Não existe formulário de contato, newsletter ou isca no site inteiro. Quem entra
e sai sem comprar some para sempre.

Os livros em `/livros` são entregues sem pedir nada em troca — é a troca mais
natural que existe: nome + WhatsApp pelo download.

### 11. Páginas pesadas

`/microsoft` (232 KB), `/wendell/apple` (228 KB), `/reparoapple` (206 KB),
`/assistenciagames` (204 KB) de HTML. Não é urgente, mas pesa no celular.

### 12. Tempo de resposta

`/promocao` 1.083 ms e `/` 987 ms são os mais lentos. Aceitável, não ótimo.

---

## O que o relatório anterior errou

Registrado para não repetirmos investigação à toa:

| Afirmação | O que a medição mostra |
| --- | --- |
| "Faltam dados estruturados (schema.org)" | **Todas as 51 páginas têm.** |
| "Título duplicado em quase todo o site" | A home tem título limpo. Não confere. |
| "`/wernell/apple` → 404" | Erro de digitação do próprio robô. `/wendell/apple` responde 200. |
| "`/categoria/pcgamer` é página morta" | Responde **200**. Está vazia porque o banco recusa conexão. |
| "Template de categoria quebrado" | Não há defeito no template. É a cota do banco. |
| "Notas: Performance 3,5 / SEO 6,0" | Não houve medição por trás desses números. |

O relatório acertou em pontos reais — a captura de contato, o 404 da política de
privacidade, o Facebook errado. Mas atribuiu a uma falha de código o que era uma
indisponibilidade do banco, e isso levaria a consertar o lugar errado.

---

## Ordem de execução

1. Suspense no `Sidebar` — devolve o HTML de 24 páginas *(maior ganho isolado)*
2. Cache na busca + sitemap resiliente — fecha o vazamento da cota
3. Restaurar o histórico do `/fechamento`
4. Redirecionamento da política de privacidade + Facebook correto
5. Títulos e canonical das dez páginas + títulos das categorias
6. Captura de contato nos livros

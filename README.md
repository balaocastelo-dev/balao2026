# Projeto Balão 2026 - E-commerce

Este projeto é um e-commerce desenvolvido com Next.js, Tailwind CSS e TypeScript, simulando o site do "Balão da Informática".

## Funcionalidades

- **Catálogo de Produtos**: Listagem com filtro por categorias e busca.
- **Página de Detalhes**: Visualização do produto com opção de compartilhamento e pré-visualização (OG Tags).
- **Painel Administrativo**:
  - Acesso secreto: Clique 5 vezes no logo (a senha é definida na variável de ambiente `PAINEL_PASSWORD` — nunca versionar no repositório).
  - Importação em Massa: Cole o texto com URLs de imagens, nomes e preços para popular o site.
- **Responsividade**: Layout adaptado para Mobile e Desktop.

## Configuração e Instalação

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Execute o projeto localmente:**
    ```bash
    npm run dev
    ```
    Acesse http://localhost:3000

3.  **Deploy na Vercel:**
    - Crie um repositório no GitHub.
    - Faça o push do código:
      ```bash
      git add .
      git commit -m "Initial commit"
      git remote add origin https://github.com/balaocastelo-dev/balao2026.git
      git push -u origin main
      ```
    - Acesse a Vercel e importe o repositório.

## Estrutura do Projeto

- `/app`: Páginas e rotas da aplicação (App Router).
- `/components`: Componentes reutilizáveis (Header, Sidebar, ProductCard).
- `/lib`: Utilitários e lógica de banco de dados (JSON local).
- `/data`: Armazenamento local dos produtos (`products.json`).

## Painel (www.balao.info/painel)

Toda a administração mora em `/painel`, atrás de uma senha só: vendas, produtos
e preços, CRM, equipe, Arena, conteúdo do site e assistência. Os endereços de
antes (`/admin`, `/crm`, `/arena/admin`, `/dashboard`, `/gerador`, `/funcoes`)
continuam valendo e levam para dentro dele. Como funciona e como acrescentar
uma área: **[docs/painel.md](docs/painel.md)**.

## Importação de Produtos

No painel administrativo, use o formato de texto padrão (exemplo copiado de sites) contendo URL da imagem, Nome e Preço. O sistema extrairá automaticamente os dados.

## Atendimento no WhatsApp (equipe de vendas)

A equipe atende por **um número só** — (19) 98751-0267 — com **um QR Code só** e
**um login por pessoa**.

- `www.balao.info/brendon` — página pessoal do vendedor; ele entra com a senha
  dele, no computador dele. Caixa compartilhada da loja, kanban pessoal,
  assinatura própria, filtro "Meus" e botão de assumir atendimento.
- `www.balao.info/painel/crm` — administração: conecta o QR Code, cadastra
  vendedor, vê a caixa inteira. É uma área do painel, protegida pela senha
  dele (`PAINEL_PASSWORD`). O endereço antigo, `/crm`, leva para lá.
- `www.balao.info/whatsapp` — painel simples (QR + chat), mesma senha do painel.

O cadastro de vendedores fica em `lib/vendedores.ts` (site) e
`whatsapp-server/vendedores-fixos.json` (servidor). Como adicionar gente nova,
trocar senha e tirar acesso: **[docs/acesso-vendedores.md](docs/acesso-vendedores.md)**.

## Blog (www.balao.info/blog)

- Rotas públicas: `/blog`, `/blog/[slug]`, `/blog/categoria/[categoria]`, `/blog/rss.xml`
- De onde vêm os artigos: os escritos neste repositório (`content/blog/artigos`) e os do Soro, que entram sozinhos de hora em hora (com cópia de reserva em `content/blog/soro`)
- Artigo novo: `npm run blog:novo -- "Título" --categoria guias`, escrever, `npm run blog:conferir`
- SEO: dados estruturados (BlogPosting, Review, FAQPage), Open Graph, sitemap e RSS saem do próprio artigo
- Como funciona e como publicar: **[docs/blog/README.md](docs/blog/README.md)**. O padrão de escrita: **[docs/blog/padrao-editorial.md](docs/blog/padrao-editorial.md)**

### Variáveis de ambiente (mínimo)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_API_KEY` (para geração com IA)
- `CRON_SECRET` (opcional, proteção extra para chamadas manuais; Vercel Cron usa `x-vercel-cron`)

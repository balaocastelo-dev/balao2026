# Projeto Balão 2026 - E-commerce

Este projeto é um e-commerce desenvolvido com Next.js, Tailwind CSS e TypeScript, simulando o site do "Balão da Informática".

## Funcionalidades

- **Catálogo de Produtos**: Listagem com filtro por categorias e busca.
- **Página de Detalhes**: Visualização do produto com opção de compartilhamento e pré-visualização (OG Tags).
- **Painel Administrativo**:
  - Acesso secreto: Clique 5 vezes no logo ou digite `56676009` na busca.
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

## Importação de Produtos

No painel administrativo, use o formato de texto padrão (exemplo copiado de sites) contendo URL da imagem, Nome e Preço. O sistema extrairá automaticamente os dados.

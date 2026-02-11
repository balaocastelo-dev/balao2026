# Projeto Balão 2026 - E-commerce

Este projeto é um e-commerce desenvolvido com Next.js, Tailwind CSS e TypeScript, simulando o site do "Balão da Informática".

## Funcionalidades

- **Catálogo de Produtos**: Listagem com filtro por categorias e busca.
- **Página de Detalhes**: Visualização do produto com opção de compartilhamento e pré-visualização (OG Tags).
- **Painel Administrativo**:
  - Acesso via `/admin/login`.
  - **Acesso Automático**: Usuários logados com `balaocastelo@gmail.com` têm acesso direto.
  - **Senha Dinâmica**: Outros usuários devem usar a senha do dia: `56676009` + data (ddmmyyyy).
  - Importação em Massa: Cole o texto com URLs de imagens, nomes e preços para popular o site.
  - **Gerenciamento de Temas Visuais**:
    - Acesso via `/admin/temas`.
    - Permite alterar a aparência global do site com persistência em tempo real.
    - **Temas Disponíveis**:
      - Padrão do Sistema (Clean).
      - Padrões Geométricos (5 variações CSS).
      - **Carnaval Animado**: Partículas interativas com mouse e sons de festa (opcionais).
      - **Matrix Rain**: Animação Canvas de chuva de código.
      - **Mídia Personalizada**: Upload de imagens (com compressão automática WebP) e vídeos de até 50MB.
    - **Acessibilidade**:
      - Modo de Alto Contraste (filtro global e overlay).
      - Controles de opacidade e blur para mídias personalizadas.
      - Toggle de som para temas animados.
- **Minha Conta**:
  - Histórico de pedidos com filtros (status, data, número) e paginação.
  - Carteira de Cupons ("Meus Cupons") com validação e adição de novos códigos.
- **Carrinho**:
  - Aplicação de cupons com validação em tempo real.
  - Notificações (Toasts) sobre cupons disponíveis.
- **Responsividade**: Layout adaptado para Mobile e Desktop.

## Configuração e Instalação

### Configuração do Banco de Dados (Temas e Cupons)
Se encontrar erros como "Could not find the table...", execute o seguinte SQL no Supabase ou acesse `/admin/temas` e clique em "Reparar Banco de Dados".

```sql
-- Exemplo parcial (ver supabase/migrations/20260211_fix_and_setup_themes.sql para completo)
CREATE TABLE IF NOT EXISTS public.site_settings (...);
```

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
- `/lib`: Utilitários e lógica de banco de dados (Supabase).
- `/data`: Armazenamento local dos produtos (`products.json`).

## API e Integração

### Pedidos (`/api/user/orders`)

Retorna os pedidos do usuário autenticado.

**Método**: `GET`

**Parâmetros de Query**:
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 20)
- `status`: Filtrar por status (ex: 'pending', 'paid')
- `search`: Buscar por número do pedido
- `startDate`: Data inicial (ISO)
- `endDate`: Data final (ISO)

**Exemplo de Resposta**:
```json
{
  "orders": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Cupons (`/api/user/coupons`)

Gerencia os cupons na carteira do usuário.

#### Listar Cupons
**Método**: `GET`
**Resposta**: Lista de cupons associados ao usuário.

#### Adicionar Cupom
**Método**: `POST`
**Body**:
```json
{
  "code": "DESCONTO10"
}
```
**Resposta Sucesso**:
```json
{
  "success": true,
  "message": "Cupom adicionado com sucesso!"
}
```

## Importação de Produtos

No painel administrativo, use o formato de texto padrão (exemplo copiado de sites) contendo URL da imagem, Nome e Preço. O sistema extrairá automaticamente os dados.

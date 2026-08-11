
# Implementação de Autenticação

Este documento descreve a arquitetura de autenticação do sistema Balão da Informática.

## Tecnologias

- **Supabase Auth**: Gerenciamento de usuários, sessões e providers (Email/Password, Google).
- **Next.js Middleware**: Proteção de rotas no servidor.
- **Next.js Server Actions / Client SDK**: Interação com API de auth.

## Estrutura de Arquivos

- `app/login/page.tsx`: Página de Login e Registro.
- `app/forgot-password/page.tsx`: Página de recuperação de senha.
- `app/auth/callback/route.ts`: Callback para OAuth (Google) e confirmação de email.
- `lib/supabase/middleware.ts`: Lógica de proteção de rotas.
- `middleware.ts`: Entry point do middleware do Next.js.
- `lib/supabase/client.ts`: Cliente Supabase para componentes Client-Side.
- `lib/supabase/server.ts`: Cliente Supabase para Server Components/Actions.

## Rotas Protegidas

O middleware intercepta requisições e verifica a sessão do usuário.

- **Admin**: `/admin/*` (Redireciona para `/admin/login`)
- **Usuário**: `/checkout`, `/fechamento`, `/meus-pedidos`, `/conta` (Redireciona para `/login`)

## Funcionalidades

### 1. Login com Email e Senha
- Validação de formato de email.
- Feedback visual (Loading, Toast).
- Redirecionamento após sucesso.

### 2. Login com Google (OAuth)
- Integração via `signInWithOAuth`.
- Redirecionamento automático.
- Tratamento de erros (ex: provider não habilitado).

### 3. Recuperação de Senha
- Envio de email com link de reset (`resetPasswordForEmail`).
- Página dedicada para solicitação.

### 4. Persistência de Sessão
- Supabase gerencia automaticamente tokens (JWT) em cookies seguros.
- Middleware atualiza a sessão a cada requisição para evitar expiração prematura.

## Testes

Testes de integração podem ser encontrados em `__tests__/auth.test.ts` (mock).

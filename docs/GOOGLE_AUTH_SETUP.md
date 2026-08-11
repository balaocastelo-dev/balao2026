
# Configuração de Autenticação com Google (OAuth 2.0)

Este projeto utiliza Supabase Auth para gerenciar autenticação, incluindo login social com Google.

## Pré-requisitos

1. Conta no [Google Cloud Platform](https://console.cloud.google.com/).
2. Projeto Supabase configurado.

## Passo a Passo

### 1. Configurar Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto ou selecione um existente.
3. Vá para **APIs e Serviços** > **Tela de permissão OAuth**.
   - Selecione **Externo**.
   - Preencha as informações obrigatórias (Nome do App, Email de suporte, etc.).
   - Em **Domínios autorizados**, adicione o domínio do seu Supabase (ex: `seu-projeto.supabase.co`).
   - Salve e continue.
4. Vá para **Credenciais** > **Criar Credenciais** > **ID do cliente OAuth**.
   - Tipo de aplicativo: **Aplicativo da Web**.
   - **Origens JavaScript autorizadas**:
     - `http://localhost:3000` (para desenvolvimento)
     - `https://seu-dominio.com` (para produção)
   - **URIs de redirecionamento autorizados**:
     - `https://<seu-projeto-id>.supabase.co/auth/v1/callback`
5. Copie o **ID do cliente** e a **Chave secreta do cliente**.

### 2. Configurar Supabase

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com/dashboard).
2. Vá para **Authentication** > **Providers**.
3. Selecione **Google**.
4. Ative a opção **Enable Google**.
5. Cole o **Client ID** e **Client Secret** obtidos no passo anterior.
6. Salve as alterações.

### 3. Variáveis de Ambiente

Certifique-se de que seu arquivo `.env.local` tenha as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Fluxo de Login

O botão "Entrar com Google" na página de login aciona a função `signInWithOAuth`:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
});
```

O Supabase redireciona o usuário para o Google, e após o login, retorna para `/auth/callback`, que troca o código por uma sessão.

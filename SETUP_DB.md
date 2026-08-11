# Configuração do Banco de Dados (Supabase)

Para que o sistema de categorias funcione corretamente, é necessário criar a tabela `categories` e popular os dados iniciais no seu banco de dados Supabase.

Como o sistema não tem permissão para criar tabelas automaticamente, você precisa executar o script SQL manualmente.

## Passo a Passo

1.  Acesse o painel do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  No menu lateral esquerdo, clique em **SQL Editor**.
3.  Clique em **New Query** (Nova Consulta).
4.  Copie TODO o conteúdo do arquivo `supabase/categories.sql` deste projeto.
    *   Você pode encontrar este arquivo na pasta `supabase` do código fonte.
5.  Cole o código no editor SQL do Supabase.
6.  Clique no botão **Run** (Executar).

## O que isso fará?

*   Criará a tabela `categories`.
*   Configurará as permissões de segurança (RLS).
*   Inserirá automaticamente todas as categorias e subcategorias padrão (Computadores, Apple, Games, etc.).

Após fazer isso, recarregue o site e as categorias aparecerão no menu lateral e no painel administrativo.

## Solução de Problemas

Se você ver um erro como "Could not find the table 'public.categories'", significa que este passo não foi realizado.

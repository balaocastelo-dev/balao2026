-- Tabela de Produtos
create table products (
  id text primary key,
  name text not null,
  price text not null,
  image text not null,
  category text,
  slug text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security) é recomendado, mas para este teste rápido vamos deixar público para leitura e escrita (apenas se não houver auth configurado, caso contrário precisa de policies)
-- Para produção, configure policies corretas!

-- Exemplo de Policy para permitir leitura pública:
-- create policy "Public Access" on products for select using (true);
-- Exemplo de Policy para permitir escrita pública (CUIDADO!):
-- create policy "Public Insert" on products for insert with check (true);

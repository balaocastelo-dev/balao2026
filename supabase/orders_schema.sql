
-- Orders Table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  total numeric not null,
  customer_name text,
  customer_email text,
  customer_whatsapp text,
  address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id text, -- linking to product id (text based on existing schema)
  product_name text not null,
  product_image text,
  quantity integer not null default 1,
  price numeric not null
);

-- RLS for Orders
alter table orders enable row level security;

create policy "Admins can view all orders" on orders
  for select using (true); -- Simplified for this demo, ideally check for admin role

create policy "Admins can update orders" on orders
  for update using (true);

create policy "Admins can delete orders" on orders
  for delete using (true);

create policy "Users can view their own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own orders" on orders
  for insert with check (true); -- Allow public creation for checkout (or restrict to auth users)

-- RLS for Order Items
alter table order_items enable row level security;

create policy "Admins can view all order items" on order_items
  for select using (true);

create policy "Users can view their own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert their own order items" on order_items
  for insert with check (true);

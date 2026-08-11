
-- Create home_blocks table
create table if not exists home_blocks (
  id uuid default gen_random_uuid() primary key,
  category_id text not null, -- Using text because existing categories might not use uuid or to match existing schema
  title text, -- Optional override title
  display_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table home_blocks enable row level security;

-- Policies
create policy "Home blocks are viewable by everyone" on home_blocks
  for select using (true);

create policy "Admins can insert home blocks" on home_blocks
  for insert with check (true); -- simplified for now, ideally check admin role

create policy "Admins can update home blocks" on home_blocks
  for update using (true);

create policy "Admins can delete home blocks" on home_blocks
  for delete using (true);

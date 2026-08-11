
create table if not exists unsubscribed_emails (
  email text primary key,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table unsubscribed_emails enable row level security;

create policy "Enable read access for all users" on unsubscribed_emails for select using (true);
create policy "Enable insert access for all users" on unsubscribed_emails for insert with check (true);

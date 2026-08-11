-- Create table for carousel images
create table carousel_images (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  title text,
  display_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table carousel_images enable row level security;

-- Create policy to allow public read access
create policy "Public carousel images are viewable by everyone"
  on carousel_images for select
  using ( true );

-- Create policy to allow authenticated users (or service role) to insert/update/delete
-- For this simple app without auth, we might want to allow anon for now if we rely on client-side keys for admin,
-- or rely on the server-side operations using service role if we had one.
-- Since we are using the same anon key for everything in this project (as per user setup),
-- we will allow all operations for anon for simplicity, similar to products table (implicitly).
create policy "Enable all operations for anon"
  on carousel_images for all
  using ( true )
  with check ( true );

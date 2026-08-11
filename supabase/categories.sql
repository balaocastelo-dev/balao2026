-- Create categories table
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    slug text not null unique,
    parent_id uuid references public.categories(id) on delete cascade,
    display_order integer default 0,
    icon text,
    active boolean default true
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
create policy "Public can view active categories"
    on public.categories
    for select
    using (true);

create policy "Authenticated users can manage categories"
    on public.categories
    for all
    using (auth.role() = 'authenticated');

-- Function to insert category safely (idempotent-ish)
create or replace function insert_category(cat_name text, cat_slug text, parent_slug text default null, cat_icon text default null, cat_order integer default 0)
returns uuid as $$
declare
    pid uuid;
    cid uuid;
begin
    -- Find parent id if slug provided
    if parent_slug is not null then
        select id into pid from public.categories where slug = parent_slug limit 1;
    end if;

    -- Insert or get existing
    insert into public.categories (name, slug, parent_id, icon, display_order)
    values (cat_name, cat_slug, pid, cat_icon, cat_order)
    on conflict (slug) do update set 
        name = excluded.name,
        parent_id = excluded.parent_id,
        icon = excluded.icon,
        display_order = excluded.display_order
    returning id into cid;

    return cid;
end;
$$ language plpgsql;

-- Seed Data (Hierarchy)
do $$
declare
    root_id uuid;
    l2_id uuid;
begin
    -- 1. Todos os Produtos
    perform insert_category('Todos os Produtos', 'todos-os-produtos', null, 'List', 0);

    -- 2. Computadores & Informática
    root_id := insert_category('Computadores & Informática', 'computadores-informatica', null, 'Monitor', 1);
        -- Computadores
        l2_id := insert_category('Computadores', 'computadores', 'computadores-informatica', null, 0);
            perform insert_category('PC Gamer', 'pc-gamer', 'computadores', null, 0);
            perform insert_category('PC Office', 'pc-office', 'computadores', null, 1);
            perform insert_category('PC All-in-One', 'pc-all-in-one', 'computadores', null, 2);
            perform insert_category('PC Workstation', 'pc-workstation', 'computadores', null, 3);
            perform insert_category('Mini PC', 'mini-pc', 'computadores', null, 4);
            perform insert_category('PC Montado', 'pc-montado', 'computadores', null, 5);
            perform insert_category('PC Sob Medida', 'pc-sob-medida', 'computadores', null, 6);
        
        -- Notebooks
        l2_id := insert_category('Notebooks', 'notebooks', 'computadores-informatica', null, 1);
            perform insert_category('Notebook Gamer', 'notebook-gamer', 'notebooks', null, 0);
            perform insert_category('Notebook Empresarial', 'notebook-empresarial', 'notebooks', null, 1);
            perform insert_category('Notebook Estudantil', 'notebook-estudantil', 'notebooks', null, 2);
            perform insert_category('MacBook', 'macbook-laptop', 'notebooks', null, 3);
            perform insert_category('Chromebook', 'chromebook', 'notebooks', null, 4);

        -- Componentes de Hardware
        l2_id := insert_category('Componentes de Hardware', 'hardware', 'computadores-informatica', null, 2);
            perform insert_category('Placa de Vídeo (GPU)', 'placa-de-video', 'hardware', null, 0);
            perform insert_category('Processadores (CPU)', 'processadores', 'hardware', null, 1);
            perform insert_category('Placa-mãe', 'placa-mae', 'hardware', null, 2);
            perform insert_category('Memória RAM', 'memoria-ram', 'hardware', null, 3);
            perform insert_category('SSD', 'ssd', 'hardware', null, 4);
            perform insert_category('HD', 'hd', 'hardware', null, 5);
            perform insert_category('Fonte de Alimentação', 'fontes', 'hardware', null, 6);
            perform insert_category('Gabinete', 'gabinete', 'hardware', null, 7);
            perform insert_category('Cooler / Water Cooler', 'coolers', 'hardware', null, 8);
            perform insert_category('Pasta Térmica', 'pasta-termica', 'hardware', null, 9);
            perform insert_category('Placas de Expansão', 'placas-expansao', 'hardware', null, 10);

    -- 3. Monitores & Displays
    root_id := insert_category('Monitores & Displays', 'monitores-displays', null, 'Monitor', 2);
        perform insert_category('Monitor Gamer', 'monitor-gamer', 'monitores-displays', null, 0);
        perform insert_category('Monitor Profissional', 'monitor-profissional', 'monitores-displays', null, 1);
        perform insert_category('Monitor Curvo', 'monitor-curvo', 'monitores-displays', null, 2);
        perform insert_category('Monitor Ultrawide', 'monitor-ultrawide', 'monitores-displays', null, 3);
        perform insert_category('Monitor 4K / 8K', 'monitor-4k-8k', 'monitores-displays', null, 4);
        perform insert_category('Suporte para Monitor', 'suporte-monitor', 'monitores-displays', null, 5);

    -- 4. Apple
    root_id := insert_category('Apple', 'apple', null, 'Apple', 3);
        perform insert_category('MacBook', 'apple-macbook', 'apple', null, 0);
        perform insert_category('iMac', 'apple-imac', 'apple', null, 1);
        perform insert_category('Mac Mini', 'apple-mac-mini', 'apple', null, 2);
        perform insert_category('iPad', 'apple-ipad', 'apple', null, 3);
        perform insert_category('iPhone', 'apple-iphone', 'apple', null, 4);
        perform insert_category('Apple Watch', 'apple-watch', 'apple', null, 5);
        perform insert_category('AirPods', 'apple-airpods', 'apple', null, 6);
        perform insert_category('Acessórios Apple', 'apple-acessorios', 'apple', null, 7);

    -- 5. Games & Consoles
    root_id := insert_category('Games & Consoles', 'games-consoles', null, 'Gamepad', 4);
        perform insert_category('Consoles', 'consoles', 'games-consoles', null, 0);
        perform insert_category('Jogos', 'jogos', 'games-consoles', null, 1);
        perform insert_category('Controles', 'controles', 'games-consoles', null, 2);
        perform insert_category('Headsets Gamer', 'headsets-gamer', 'games-consoles', null, 3);
        perform insert_category('Cadeiras Gamer', 'cadeiras-gamer', 'games-consoles', null, 4);
        perform insert_category('Volantes e Simuladores', 'volantes', 'games-consoles', null, 5);
        perform insert_category('Acessórios Gamer', 'acessorios-gamer', 'games-consoles', null, 6);

    -- 6. Smartphones & Tablets
    root_id := insert_category('Smartphones & Tablets', 'smartphones-tablets', null, 'Smartphone', 5);
        perform insert_category('Smartphones Android', 'smartphones-android', 'smartphones-tablets', null, 0);
        perform insert_category('Smartphones iOS', 'smartphones-ios', 'smartphones-tablets', null, 1);
        perform insert_category('Tablets', 'tablets', 'smartphones-tablets', null, 2);
        perform insert_category('Capas e Películas', 'capas-peliculas', 'smartphones-tablets', null, 3);
        perform insert_category('Carregadores', 'carregadores-celular', 'smartphones-tablets', null, 4);
        perform insert_category('Power Banks', 'power-banks', 'smartphones-tablets', null, 5);
        perform insert_category('Smartwatches', 'smartwatches', 'smartphones-tablets', null, 6);
        perform insert_category('Pulseiras Inteligentes', 'smartbands', 'smartphones-tablets', null, 7);

    -- 7. Áudio
    root_id := insert_category('Áudio', 'audio', null, 'Speaker', 6);
        l2_id := insert_category('Fones de Ouvido', 'fones-ouvido', 'audio', null, 0);
            perform insert_category('Com Fio', 'fones-com-fio', 'fones-ouvido', null, 0);
            perform insert_category('Bluetooth', 'fones-bluetooth', 'fones-ouvido', null, 1);
            perform insert_category('Gamer', 'fones-gamer', 'fones-ouvido', null, 2);
        perform insert_category('Caixas de Som', 'caixas-som', 'audio', null, 1);
        perform insert_category('Soundbar', 'soundbar', 'audio', null, 2);
        perform insert_category('Home Theater', 'home-theater', 'audio', null, 3);
        perform insert_category('Microfones', 'microfones', 'audio', null, 4);
        perform insert_category('Equipamentos de Áudio Profissional', 'audio-profissional', 'audio', null, 5);

    -- 8. TV & Vídeo
    root_id := insert_category('TV & Vídeo', 'tv-video', null, 'Tv', 7);
        perform insert_category('Smart TV', 'smart-tv', 'tv-video', null, 0);
        perform insert_category('TV 4K / 8K', 'tv-4k-8k', 'tv-video', null, 1);
        perform insert_category('TV Gamer', 'tv-gamer', 'tv-video', null, 2);
        perform insert_category('Projetores', 'projetores', 'tv-video', null, 3);
        perform insert_category('Telas de Projeção', 'telas-projecao', 'tv-video', null, 4);
        perform insert_category('Suportes para TV', 'suportes-tv', 'tv-video', null, 5);
        perform insert_category('Streaming Devices', 'streaming-devices', 'tv-video', null, 6);

    -- 9. Rede & Conectividade
    root_id := insert_category('Rede & Conectividade', 'rede-conectividade', null, 'Wifi', 8);
        perform insert_category('Roteadores', 'roteadores', 'rede-conectividade', null, 0);
        perform insert_category('Modems', 'modems', 'rede-conectividade', null, 1);
        perform insert_category('Repetidores de Sinal', 'repetidores', 'rede-conectividade', null, 2);
        perform insert_category('Access Point', 'access-point', 'rede-conectividade', null, 3);
        perform insert_category('Switches', 'switches', 'rede-conectividade', null, 4);
        perform insert_category('Cabos de Rede', 'cabos-rede', 'rede-conectividade', null, 5);
        perform insert_category('Adaptadores Wi-Fi / Bluetooth', 'adaptadores-rede', 'rede-conectividade', null, 6);

    -- 10. Impressão & Digitalização
    root_id := insert_category('Impressão & Digitalização', 'impressao', null, 'Printer', 9);
        l2_id := insert_category('Impressoras', 'impressoras', 'impressao', null, 0);
            perform insert_category('Jato de Tinta', 'impressora-jato', 'impressoras', null, 0);
            perform insert_category('Laser', 'impressora-laser', 'impressoras', null, 1);
            perform insert_category('Tanque de Tinta', 'impressora-tanque', 'impressoras', null, 2);
            perform insert_category('Multifuncionais', 'multifuncionais', 'impressoras', null, 3);
        perform insert_category('Scanners', 'scanners', 'impressao', null, 1);
        perform insert_category('Cartuchos e Toners', 'cartuchos-toners', 'impressao', null, 2);
        perform insert_category('Papel Fotográfico', 'papel-fotografico', 'impressao', null, 3);

    -- 11. Casa Inteligente
    root_id := insert_category('Casa Inteligente (Smart Home)', 'casa-inteligente', null, 'Home', 10);
        perform insert_category('Assistentes Virtuais', 'assistentes-virtuais', 'casa-inteligente', null, 0);
        perform insert_category('Lâmpadas Inteligentes', 'lampadas-inteligentes', 'casa-inteligente', null, 1);
        perform insert_category('Tomadas Inteligentes', 'tomadas-inteligentes', 'casa-inteligente', null, 2);
        perform insert_category('Fechaduras Digitais', 'fechaduras-digitais', 'casa-inteligente', null, 3);
        perform insert_category('Câmeras de Segurança', 'cameras-seguranca', 'casa-inteligente', null, 4);
        perform insert_category('Sensores', 'sensores-smart', 'casa-inteligente', null, 5);
        perform insert_category('Automação Residencial', 'automacao', 'casa-inteligente', null, 6);

    -- 12. Acessórios
    root_id := insert_category('Acessórios', 'acessorios', null, 'Plug', 11);
        perform insert_category('Teclados', 'teclados', 'acessorios', null, 0);
        perform insert_category('Mouses', 'mouses', 'acessorios', null, 1);
        perform insert_category('Mousepads', 'mousepads', 'acessorios', null, 2);
        perform insert_category('Webcams', 'webcams', 'acessorios', null, 3);
        perform insert_category('Hubs USB', 'hubs-usb', 'acessorios', null, 4);
        perform insert_category('Adaptadores', 'adaptadores', 'acessorios', null, 5);
        perform insert_category('Cabos', 'cabos', 'acessorios', null, 6);
        perform insert_category('Carregadores', 'carregadores-acessorios', 'acessorios', null, 7);
        perform insert_category('Suportes e Bases', 'suportes-bases', 'acessorios', null, 8);

    -- 13. Armazenamento
    root_id := insert_category('Armazenamento', 'armazenamento', null, 'HardDrive', 12);
        perform insert_category('HD Externo', 'hd-externo', 'armazenamento', null, 0);
        perform insert_category('SSD Externo', 'ssd-externo', 'armazenamento', null, 1);
        perform insert_category('Pen Drives', 'pen-drives', 'armazenamento', null, 2);
        perform insert_category('Cartões de Memória', 'cartoes-memoria', 'armazenamento', null, 3);
        perform insert_category('NAS', 'nas', 'armazenamento', null, 4);

    -- 14. Escritório & Ergonomia
    root_id := insert_category('Escritório & Ergonomia', 'escritorio', null, 'Briefcase', 13);
        perform insert_category('Cadeiras', 'cadeiras-escritorio', 'escritorio', null, 0);
        perform insert_category('Mesas', 'mesas', 'escritorio', null, 1);
        perform insert_category('Suportes Ergonômicos', 'suportes-ergonomicos', 'escritorio', null, 2);
        perform insert_category('Iluminação', 'iluminacao-escritorio', 'escritorio', null, 3);

    -- 15. Segurança & Energia
    root_id := insert_category('Segurança & Energia', 'seguranca-energia', null, 'Shield', 14);
        perform insert_category('Nobreaks', 'nobreaks', 'seguranca-energia', null, 0);
        perform insert_category('Estabilizadores', 'estabilizadores', 'seguranca-energia', null, 1);
        perform insert_category('Filtros de Linha', 'filtros-linha', 'seguranca-energia', null, 2);
        perform insert_category('Cofres Digitais', 'cofres', 'seguranca-energia', null, 3);
        perform insert_category('Câmeras e DVR/NVR', 'cameras-dvr', 'seguranca-energia', null, 4);

end;
$$;

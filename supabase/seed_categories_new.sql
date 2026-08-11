-- Script para redefinir a estrutura de categorias (ATUALIZADO - RESTAURAÇÃO)
-- Copie e cole este conteúdo no Editor SQL do Supabase

-- 1. Limpar categorias existentes (CUIDADO: Isso removerá todas as categorias!)
DELETE FROM public.categories;

-- 2. Garantir que a função auxiliar existe
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

-- 3. Inserir nova hierarquia
DO $$
DECLARE
    root_id uuid;
BEGIN
    -- 1. Computadores (Monitor)
    perform insert_category('Computadores', 'computadores', null, 'Monitor', 10);
        perform insert_category('PC Gamer', 'pc-gamer', 'computadores', 'Gamepad2', 0);
        perform insert_category('PC Corporativo / Escritório', 'pc-corporativo', 'computadores', 'Briefcase', 1);
        perform insert_category('Workstation', 'workstation', 'computadores', 'Server', 2);
        perform insert_category('All‑in‑One', 'all-in-one', 'computadores', 'Monitor', 3);
        perform insert_category('Mini PC', 'mini-pc', 'computadores', 'Box', 4);

    -- 2. Notebooks (Laptop)
    perform insert_category('Notebooks', 'notebooks', null, 'Laptop', 20);
        perform insert_category('Notebook Gamer', 'notebook-gamer', 'notebooks', 'Gamepad2', 0);
        perform insert_category('Notebook Profissional', 'notebook-profissional', 'notebooks', 'Briefcase', 1);
        perform insert_category('Notebook Estudante', 'notebook-estudante', 'notebooks', 'Book', 2);
        perform insert_category('Ultrabook', 'ultrabook', 'notebooks', 'Feather', 3);
        perform insert_category('MacBook', 'macbook-notebooks', 'notebooks', 'Laptop', 4);

    -- 3. Hardware (Cpu)
    perform insert_category('Hardware', 'hardware', null, 'Cpu', 30);
        perform insert_category('Processadores (CPU)', 'processadores', 'hardware', 'Cpu', 0);
        perform insert_category('Placas de Vídeo (GPU)', 'placas-de-video', 'hardware', 'Aperture', 1);
        perform insert_category('Placas‑Mãe', 'placas-mae', 'hardware', 'CircuitBoard', 2);
        perform insert_category('Memória RAM', 'memoria-ram', 'hardware', 'MemoryStick', 3);
        perform insert_category('SSD / HD / NVMe', 'ssd-hd-nvme', 'hardware', 'HardDrive', 4);
        perform insert_category('Fontes de Alimentação', 'fontes-alimentacao', 'hardware', 'Zap', 5);
        perform insert_category('Gabinetes', 'gabinetes', 'hardware', 'Box', 6);
        perform insert_category('Coolers e Water Cooler', 'coolers', 'hardware', 'Fan', 7);
        perform insert_category('Placas de Rede / Som', 'placas-rede-som', 'hardware', 'Network', 8);

    -- 4. Smartphones (Smartphone)
    perform insert_category('Smartphones', 'smartphones', null, 'Smartphone', 40);
        perform insert_category('Smartphones Android', 'smartphones-android', 'smartphones', 'Smartphone', 0);
        perform insert_category('iPhone', 'iphone-smartphones', 'smartphones', 'Smartphone', 1);
        perform insert_category('Smartphones Gamer', 'smartphones-gamer', 'smartphones', 'Gamepad2', 2);
        perform insert_category('Capas e Películas', 'capas-peliculas', 'smartphones', 'Shield', 3);
        perform insert_category('Carregadores e Cabos', 'carregadores-cabos-smartphones', 'smartphones', 'Zap', 4);
        perform insert_category('Suportes e Power Banks', 'suportes-power-banks', 'smartphones', 'Battery', 5);

    -- 5. Monitores (Monitor)
    perform insert_category('Monitores', 'monitores', null, 'Monitor', 50);
        perform insert_category('Monitor Gamer', 'monitor-gamer', 'monitores', 'Gamepad2', 0);
        perform insert_category('Monitor Curvo', 'monitor-curvo', 'monitores', 'Monitor', 1);
        perform insert_category('Monitor Profissional', 'monitor-profissional', 'monitores', 'Briefcase', 2);
        perform insert_category('Monitor Ultrawide', 'monitor-ultrawide', 'monitores', 'Monitor', 3);
        perform insert_category('Monitor 4K', 'monitor-4k', 'monitores', 'Monitor', 4);
        perform insert_category('Suportes para Monitor', 'suportes-monitor', 'monitores', 'Move', 5);

    -- 6. Periféricos (Keyboard)
    perform insert_category('Periféricos', 'perifericos', null, 'Keyboard', 60);
        perform insert_category('Teclados Gamer e Mecânicos', 'teclados-gamer-mecanicos', 'perifericos', 'Keyboard', 0);
        perform insert_category('Mouses Gamer', 'mouses-gamer', 'perifericos', 'Mouse', 1);
        perform insert_category('Headsets e Fones', 'headsets-fones', 'perifericos', 'Headphones', 2);
        perform insert_category('Mousepads', 'mousepads', 'perifericos', 'Square', 3);
        perform insert_category('Controles / Joysticks', 'controles-joysticks', 'perifericos', 'Gamepad', 4);
        perform insert_category('Volantes e Simuladores', 'volantes-simuladores', 'perifericos', 'Disc', 5);
        perform insert_category('Webcams', 'webcams', 'perifericos', 'Camera', 6);
        perform insert_category('Microfones', 'microfones', 'perifericos', 'Mic', 7);

    -- 7. Acessórios (Plug)
    perform insert_category('Acessórios', 'acessorios', null, 'Plug', 70);
        perform insert_category('Cabos (HDMI, DisplayPort, USB, Áudio)', 'cabos-diversos', 'acessorios', 'Cable', 0);
        perform insert_category('Adaptadores e Conversores', 'adaptadores-conversores', 'acessorios', 'RefreshCcw', 1);
        perform insert_category('Hubs USB', 'hubs-usb', 'acessorios', 'Usb', 2);
        perform insert_category('Bases para Notebook', 'bases-notebook', 'acessorios', 'Laptop', 3);
        perform insert_category('Suportes para Headset', 'suportes-headset', 'acessorios', 'Headphones', 4);
        perform insert_category('Mochilas e Cases', 'mochilas-cases', 'acessorios', 'Backpack', 5);
        perform insert_category('Iluminação RGB', 'iluminacao-rgb', 'acessorios', 'Lightbulb', 6);
        perform insert_category('Filtros de Linha e Estabilizadores', 'filtros-estabilizadores', 'acessorios', 'Zap', 7);

    -- 8. Segurança (Lock)
    perform insert_category('Segurança', 'seguranca', null, 'Lock', 80);
        perform insert_category('Câmeras de Segurança (IP / Wi‑Fi)', 'cameras-seguranca', 'seguranca', 'Video', 0);
        perform insert_category('Kits CFTV', 'kits-cftv', 'seguranca', 'Video', 1);
        perform insert_category('DVR e NVR', 'dvr-nvr', 'seguranca', 'HardDrive', 2);
        perform insert_category('Alarmes Residenciais', 'alarmes-residenciais', 'seguranca', 'Bell', 3);
        perform insert_category('Sensores de Movimento', 'sensores-movimento', 'seguranca', 'Radio', 4);
        perform insert_category('Fechaduras Eletrônicas', 'fechaduras-eletronicas', 'seguranca', 'Lock', 5);
        perform insert_category('Vídeo Porteiros', 'video-porteiros', 'seguranca', 'Video', 6);

    -- 9. Automação (Home)
    perform insert_category('Automação', 'automacao', null, 'Home', 90);
        perform insert_category('Casa Inteligente', 'casa-inteligente', 'automacao', 'Home', 0);
        perform insert_category('Tomadas Inteligentes', 'tomadas-inteligentes', 'automacao', 'Power', 1);
        perform insert_category('Interruptores Inteligentes', 'interruptores-inteligentes', 'automacao', 'ToggleLeft', 2);
        perform insert_category('Lâmpadas e Fitas LED Smart', 'lampadas-fitas-led', 'automacao', 'Lightbulb', 3);
        perform insert_category('Sensores Inteligentes', 'sensores-inteligentes', 'automacao', 'Radio', 4);
        perform insert_category('Assistentes Virtuais', 'assistentes-virtuais', 'automacao', 'Mic', 5);
        perform insert_category('Centrais de Automação', 'centrais-automacao', 'automacao', 'Server', 6);

    -- 10. Geek (Ghost)
    perform insert_category('Geek', 'geek', null, 'Ghost', 100);
        perform insert_category('Action Figures', 'action-figures', 'geek', 'User', 0);
        perform insert_category('Colecionáveis', 'colecionaveis', 'geek', 'Star', 1);
        perform insert_category('Funko Pop', 'funko-pop', 'geek', 'Smile', 2);
        perform insert_category('Camisetas e Vestuário', 'camisetas-vestuario', 'geek', 'Shirt', 3);
        perform insert_category('Canecas e Copos', 'canecas-copos', 'geek', 'Coffee', 4);
        perform insert_category('Decoração Geek', 'decoracao-geek', 'geek', 'Image', 5);
        perform insert_category('Brinquedos Temáticos', 'brinquedos-tematicos', 'geek', 'Gift', 6);

    -- 11. Licenças (Key)
    perform insert_category('Licenças', 'licencas', null, 'Key', 110);
        perform insert_category('Windows', 'windows', 'licencas', 'Monitor', 0);
        perform insert_category('Microsoft Office', 'microsoft-office', 'licencas', 'FileText', 1);
        perform insert_category('Antivírus', 'antivirus', 'licencas', 'Shield', 2);
        perform insert_category('Softwares de Design', 'softwares-design', 'licencas', 'PenTool', 3);
        perform insert_category('Softwares de Edição', 'softwares-edicao', 'licencas', 'Video', 4);

    -- 12. Escritório (Armchair)
    perform insert_category('Escritório', 'escritorio', null, 'Armchair', 120);
        perform insert_category('Cadeiras Gamer', 'cadeiras-gamer', 'escritorio', 'Armchair', 0);
        perform insert_category('Cadeiras Ergonômicas', 'cadeiras-ergonomicas', 'escritorio', 'Armchair', 1);
        perform insert_category('Mesas Gamer', 'mesas-gamer', 'escritorio', 'Table', 2);
        perform insert_category('Mesas para Escritório', 'mesas-escritorio', 'escritorio', 'Table', 3);
        perform insert_category('Suportes Ergonômicos', 'suportes-ergonomicos', 'escritorio', 'Move', 4);
        perform insert_category('Organizadores', 'organizadores', 'escritorio', 'Box', 5);

    -- 13. Games (Gamepad)
    perform insert_category('Games', 'games', null, 'Gamepad', 130);
        perform insert_category('Jogos para PC', 'jogos-pc', 'games', 'Monitor', 0);
        perform insert_category('Jogos para PlayStation', 'jogos-playstation', 'games', 'Gamepad', 1);
        perform insert_category('Jogos para Xbox', 'jogos-xbox', 'games', 'Gamepad', 2);
        perform insert_category('Jogos para Nintendo', 'jogos-nintendo', 'games', 'Gamepad', 3);
        perform insert_category('Consoles', 'consoles', 'games', 'Tv', 4);
        perform insert_category('Controles', 'controles-games', 'games', 'Gamepad2', 5);
        perform insert_category('Assinaturas', 'assinaturas', 'games', 'CreditCard', 6);
        perform insert_category('Gift Cards', 'gift-cards', 'games', 'Gift', 7);

    -- 14. Apple (Apple)
    perform insert_category('Apple', 'apple', null, 'Apple', 140);
        perform insert_category('MacBook', 'macbook-apple', 'apple', 'Laptop', 0);
        perform insert_category('iMac', 'imac', 'apple', 'Monitor', 1);
        perform insert_category('Mac Mini', 'mac-mini', 'apple', 'Box', 2);
        perform insert_category('iPad', 'ipad', 'apple', 'Tablet', 3);
        perform insert_category('iPhone', 'iphone', 'apple', 'Smartphone', 4);
        perform insert_category('Apple Watch', 'apple-watch', 'apple', 'Watch', 5);
        perform insert_category('AirPods', 'airpods', 'apple', 'Headphones', 6);
        perform insert_category('Acessórios Apple', 'acessorios-apple', 'apple', 'Plug', 7);

    -- 15. Impressão (Printer)
    perform insert_category('Impressão', 'impressao', null, 'Printer', 150);
        perform insert_category('Impressoras Jato de Tinta', 'impressoras-jato-tinta', 'impressao', 'Printer', 0);
        perform insert_category('Impressoras Laser', 'impressoras-laser', 'impressao', 'Printer', 1);
        perform insert_category('Multifuncionais', 'multifuncionais', 'impressao', 'Copy', 2);
        perform insert_category('Cartuchos de Tinta', 'cartuchos-tinta', 'impressao', 'Droplet', 3);
        perform insert_category('Toners', 'toners', 'impressao', 'Cylinder', 4);
        perform insert_category('Papel Fotográfico', 'papel-fotografico', 'impressao', 'Image', 5);
        perform insert_category('Etiquetas', 'etiquetas', 'impressao', 'Tag', 6);
        perform insert_category('Scanners', 'scanners', 'impressao', 'Scan', 7);

END $$;

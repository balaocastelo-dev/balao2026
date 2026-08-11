
-- Enable Realtime for Arena tables
BEGIN;

  -- Ensure the publication exists (it usually does by default in Supabase)
  -- If not, create it: CREATE PUBLICATION supabase_realtime;

  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE arena_vendedores;
  ALTER PUBLICATION supabase_realtime ADD TABLE arena_config;
  ALTER PUBLICATION supabase_realtime ADD TABLE arena_eventos_midia;

COMMIT;

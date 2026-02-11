-- Create user_coupons table
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'available', -- 'available', 'used', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_user_coupon UNIQUE(user_id, coupon_id)
);

-- RLS for user_coupons
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_coupons' AND policyname = 'Users can view their own coupons'
    ) THEN
        CREATE POLICY "Users can view their own coupons" ON public.user_coupons
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_coupons' AND policyname = 'Users can insert their own coupons'
    ) THEN
        CREATE POLICY "Users can insert their own coupons" ON public.user_coupons
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create site_settings table for global theme management
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_theme TEXT DEFAULT 'default',
  theme_preferences JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT single_row CHECK (id = 1)
);

-- RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON public.site_settings
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admin update access'
    ) THEN
        CREATE POLICY "Admin update access" ON public.site_settings
            FOR UPDATE USING (
               auth.jwt() ->> 'email' = 'balaocastelo@gmail.com' OR
               (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'service_role' OR
               (auth.jwt() ->> 'role') = 'service_role'
            ) WITH CHECK (
               auth.jwt() ->> 'email' = 'balaocastelo@gmail.com' OR
               (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'service_role' OR
               (auth.jwt() ->> 'role') = 'service_role'
            );
    END IF;
    
     IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admin insert access'
    ) THEN
        CREATE POLICY "Admin insert access" ON public.site_settings
            FOR INSERT WITH CHECK (
               auth.jwt() ->> 'email' = 'balaocastelo@gmail.com' OR
               (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'service_role' OR
               (auth.jwt() ->> 'role') = 'service_role'
            );
    END IF;
END
$$;

-- Initialize default settings
INSERT INTO public.site_settings (id, active_theme, theme_preferences)
VALUES (1, 'default', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

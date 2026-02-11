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

-- RLS
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupons" ON public.user_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coupons" ON public.user_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON public.user_coupons(user_id);

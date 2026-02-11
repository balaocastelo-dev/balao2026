import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
            CREATE TABLE IF NOT EXISTS user_coupons (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
                coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
                status TEXT DEFAULT 'available',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                used_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(user_id, coupon_id)
            );

            ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'user_coupons' AND policyname = 'Users can view their own coupons'
                ) THEN
                    CREATE POLICY "Users can view their own coupons" ON user_coupons
                        FOR SELECT USING (auth.uid() = user_id);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'user_coupons' AND policyname = 'Users can insert their own coupons'
                ) THEN
                    CREATE POLICY "Users can insert their own coupons" ON user_coupons
                        FOR INSERT WITH CHECK (auth.uid() = user_id);
                END IF;
            END
            $$;
        `
    });

    // If RPC exec_sql is not available (it usually isn't by default), we might fail here.
    // In that case, we can't create tables dynamically via client unless we have direct SQL access.
    // Assuming the environment might not have exec_sql.
    
    // Alternative: Just return the SQL for the user to run, or try to use the raw SQL if the client supports it (it doesn't usually).
    
    if (error) {
        return NextResponse.json({ error: error.message, note: "If exec_sql is not enabled, please run the SQL manually." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

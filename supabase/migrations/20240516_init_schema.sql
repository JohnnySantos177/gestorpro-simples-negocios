
-- Create subscribers table to track user-stripe connection
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table to track active subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create checkout_sessions table to track checkout sessions
CREATE TABLE public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table for system-wide configurations
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Insert default subscription price
INSERT INTO public.settings (key, value, description) 
VALUES ('subscription_price', '5999', 'Default subscription price in cents (R$59.99)');

-- Setup RLS for all tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS for subscribers: Users can only view their own subscription info
CREATE POLICY "users_can_view_own_subscriber_info" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id);

-- RLS for subscriptions: Users can only view their own subscription
CREATE POLICY "users_can_view_own_subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS for checkout_sessions: Users can only view their own sessions
CREATE POLICY "users_can_view_own_checkout_sessions" ON public.checkout_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS for settings: All authenticated users can view settings
CREATE POLICY "authenticated_users_can_view_settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Enable RLS on existing data tables to ensure user isolation
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name NOT IN ('subscribers', 'subscriptions', 'checkout_sessions', 'settings')
    AND table_type = 'BASE TABLE'
  LOOP
    -- Enable RLS for all tables
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
    
    -- Create policy for selecting own data
    BEGIN
      EXECUTE format('
        CREATE POLICY "users_can_select_own_data" ON public.%I
        FOR SELECT USING (auth.uid() = user_id);
      ', table_name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create select policy for %: %', table_name, SQLERRM;
    END;
    
    -- Create policy for inserting own data
    BEGIN
      EXECUTE format('
        CREATE POLICY "users_can_insert_own_data" ON public.%I
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      ', table_name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create insert policy for %: %', table_name, SQLERRM;
    END;
    
    -- Create policy for updating own data
    BEGIN
      EXECUTE format('
        CREATE POLICY "users_can_update_own_data" ON public.%I
        FOR UPDATE USING (auth.uid() = user_id);
      ', table_name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create update policy for %: %', table_name, SQLERRM;
    END;
    
    -- Create policy for deleting own data
    BEGIN
      EXECUTE format('
        CREATE POLICY "users_can_delete_own_data" ON public.%I
        FOR DELETE USING (auth.uid() = user_id);
      ', table_name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create delete policy for %: %', table_name, SQLERRM;
    END;
  END LOOP;
END$$;

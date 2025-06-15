
-- Create table to track processed webhooks and prevent replay attacks
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON public.webhook_events(payment_id);

-- Add RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events
  FOR ALL USING (auth.role() = 'service_role');

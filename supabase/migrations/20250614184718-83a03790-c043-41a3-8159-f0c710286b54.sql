
-- Add mercado_pago_customer_id column to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN mercado_pago_customer_id TEXT;

-- Update the subscriptions table to include mercado_pago_subscription_id
ALTER TABLE public.subscriptions 
ADD COLUMN mercado_pago_subscription_id TEXT;

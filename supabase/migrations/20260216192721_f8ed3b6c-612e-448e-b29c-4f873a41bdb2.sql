
-- Add city, categories, status to push_subscriptions
ALTER TABLE public.push_subscriptions 
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create push_logs table
CREATE TABLE IF NOT EXISTS public.push_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid REFERENCES public.push_notifications(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.push_subscriptions(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent',
  error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;

-- push_logs: only admin can read
CREATE POLICY "Admins can read push_logs" ON public.push_logs
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- push_logs: service role inserts (edge functions)
CREATE POLICY "Service can insert push_logs" ON public.push_logs
  FOR INSERT WITH CHECK (true);

-- push_subscriptions: allow anon insert (for non-logged users)
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

-- push_subscriptions: users can update their own by endpoint
CREATE POLICY "Users can update own subscription" ON public.push_subscriptions
  FOR UPDATE USING (
    user_id = auth.uid() OR user_id IS NULL
  );

-- push_subscriptions: users can read their own
CREATE POLICY "Users can read own subscription" ON public.push_subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Admin can read all subscriptions
CREATE POLICY "Admins can read all subscriptions" ON public.push_subscriptions
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- Enable RLS on push_subscriptions if not already
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

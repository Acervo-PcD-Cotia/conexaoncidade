-- Tabela para gerenciar hosts autorizados do Live Studio
CREATE TABLE public.broadcast_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.broadcast_channels(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- Enable RLS
ALTER TABLE public.broadcast_hosts ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins and admins can manage hosts
CREATE POLICY "Admins can manage broadcast hosts"
ON public.broadcast_hosts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin')
  )
);

-- Policy: Users can view their own host status
CREATE POLICY "Users can view their own host status"
ON public.broadcast_hosts FOR SELECT
USING (user_id = auth.uid());

-- Add index for faster queries
CREATE INDEX idx_broadcast_hosts_user_id ON public.broadcast_hosts(user_id);
CREATE INDEX idx_broadcast_hosts_channel_id ON public.broadcast_hosts(channel_id);
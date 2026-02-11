
-- Create system_logs table for centralized logging
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo TEXT NOT NULL,
  erro TEXT NOT NULL,
  usuario_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
CREATE POLICY "Admins can read system logs"
  ON public.system_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Any authenticated user can insert logs (for error reporting)
CREATE POLICY "Authenticated users can insert logs"
  ON public.system_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Index for querying by module and time
CREATE INDEX idx_system_logs_modulo_created ON public.system_logs (modulo, created_at DESC);
CREATE INDEX idx_system_logs_created ON public.system_logs (created_at DESC);

-- Criar canal de Web Rádio "Conexão FM"
INSERT INTO broadcast_channels (name, slug, type, description, is_active)
VALUES (
  'Conexão FM',
  'conexao-fm',
  'radio',
  'Web Rádio 24 horas com músicas, notícias e entretenimento de Cotia e região',
  true
);

-- Criar bucket para arquivos de áudio da playlist (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('broadcast-audio', 'broadcast-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para upload de áudio
CREATE POLICY "Admins can upload broadcast audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'broadcast-audio');

CREATE POLICY "Admins can update broadcast audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'broadcast-audio');

CREATE POLICY "Admins can delete broadcast audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'broadcast-audio');

CREATE POLICY "Anyone can view broadcast audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'broadcast-audio');

-- Adicionar colunas extras para Auto DJ na tabela broadcast_playlist_items
ALTER TABLE broadcast_playlist_items
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS bpm INTEGER,
ADD COLUMN IF NOT EXISTS played_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_played_at TIMESTAMPTZ;

-- Criar tabela para configurações do Auto DJ por canal
CREATE TABLE IF NOT EXISTS broadcast_autodj_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES broadcast_channels(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  shuffle_mode BOOLEAN DEFAULT false,
  crossfade_seconds INTEGER DEFAULT 3,
  fallback_enabled BOOLEAN DEFAULT true,
  volume_level INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id)
);

-- Habilitar RLS
ALTER TABLE broadcast_autodj_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para broadcast_autodj_settings
CREATE POLICY "Anyone can view autodj settings"
ON broadcast_autodj_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage autodj settings"
ON broadcast_autodj_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar configuração padrão para o canal de rádio
INSERT INTO broadcast_autodj_settings (channel_id, is_enabled, shuffle_mode, crossfade_seconds)
SELECT id, true, true, 3
FROM broadcast_channels
WHERE slug = 'conexao-fm';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_autodj_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_autodj_settings_timestamp
BEFORE UPDATE ON broadcast_autodj_settings
FOR EACH ROW
EXECUTE FUNCTION update_autodj_settings_updated_at();
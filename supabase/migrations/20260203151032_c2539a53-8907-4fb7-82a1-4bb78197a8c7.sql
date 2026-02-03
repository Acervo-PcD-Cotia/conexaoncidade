-- Criar bucket publico para anuncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ads',
  'ads',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politica: qualquer usuario autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload ads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ads');

-- Politica: leitura publica
CREATE POLICY "Public read access for ads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ads');

-- Politica: autores podem deletar suas proprias imagens
CREATE POLICY "Users can delete own ads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ads');
-- 1. Tabela de fotos de locais
CREATE TABLE public.community_location_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.community_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_location_photos_location ON public.community_location_photos(location_id);
CREATE INDEX idx_location_photos_user ON public.community_location_photos(user_id);

ALTER TABLE public.community_location_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved photos or own photos" ON public.community_location_photos
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can upload photos" ON public.community_location_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.community_location_photos
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all photos" ON public.community_location_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- 2. Preferências de email no profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications JSONB DEFAULT '{"favorite_updates": true}';

-- 3. Política para admins atualizarem locais (verificação)
DROP POLICY IF EXISTS "Admins can update locations" ON public.community_locations;
CREATE POLICY "Admins can update locations" ON public.community_locations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- 4. Criar bucket para fotos de locais
INSERT INTO storage.buckets (id, name, public) 
VALUES ('location-photos', 'location-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de storage para fotos de locais
CREATE POLICY "Anyone can view location photos" ON storage.objects
FOR SELECT USING (bucket_id = 'location-photos');

CREATE POLICY "Authenticated users can upload location photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'location-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own location photos" ON storage.objects
FOR DELETE USING (bucket_id = 'location-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
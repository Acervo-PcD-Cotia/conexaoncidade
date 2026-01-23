-- Make storage buckets private for security
UPDATE storage.buckets SET public = false WHERE id = 'podcast-audio';
UPDATE storage.buckets SET public = false WHERE id = 'studio-branding';

-- Create RLS policies for authenticated access to podcast-audio bucket
CREATE POLICY "Authenticated users can upload podcast audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'podcast-audio');

CREATE POLICY "Authenticated users can read podcast audio"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'podcast-audio');

CREATE POLICY "Authenticated users can delete podcast audio"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'podcast-audio');

-- Create RLS policies for authenticated access to studio-branding bucket
CREATE POLICY "Authenticated users can upload studio branding"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'studio-branding');

CREATE POLICY "Authenticated users can read studio branding"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'studio-branding');

CREATE POLICY "Authenticated users can delete studio branding"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'studio-branding');
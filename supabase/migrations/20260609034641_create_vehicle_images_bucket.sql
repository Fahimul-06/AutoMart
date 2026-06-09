-- Create vehicle-images storage bucket (public so images are viewable by anyone)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Admin can upload vehicle images
CREATE POLICY "Admin can upload vehicle images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can delete vehicle images
CREATE POLICY "Admin can delete vehicle images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can view vehicle images (public bucket)
CREATE POLICY "Anyone can view vehicle images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Anon can view vehicle images" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'vehicle-images');
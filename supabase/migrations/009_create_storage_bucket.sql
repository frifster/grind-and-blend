-- Create the storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to menu images
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-images' );

-- Policy to allow authenticated users (admin/manager) to upload images
CREATE POLICY "Staff can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'manager')
  )
);

-- Policy to allow authenticated users (admin/manager) to update images
CREATE POLICY "Staff can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'manager')
  )
);

-- Policy to allow authenticated users (admin/manager) to delete images
CREATE POLICY "Staff can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'manager')
  )
);

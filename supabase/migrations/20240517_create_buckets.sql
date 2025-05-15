
-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the avatars bucket
CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload their own avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to update their own avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-covers', 'business-covers', true);

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for business covers bucket
CREATE POLICY "Business covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-covers');

CREATE POLICY "Business owners can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-covers' 
  AND EXISTS (
    SELECT 1 FROM businesses 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-covers' 
  AND EXISTS (
    SELECT 1 FROM businesses 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-covers' 
  AND EXISTS (
    SELECT 1 FROM businesses 
    WHERE owner_id = auth.uid()
  )
);
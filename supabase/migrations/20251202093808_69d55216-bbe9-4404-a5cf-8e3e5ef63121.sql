-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for review images
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Clients can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can update their review images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'review-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can delete their review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'review-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image_url column to reviews table if it doesn't exist
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image_url text;

-- Function to calculate average rating for a business
CREATE OR REPLACE FUNCTION public.get_business_average_rating(business_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM public.reviews
  WHERE business_id = business_uuid;
$$;
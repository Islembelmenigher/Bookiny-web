-- Create portfolio_images table
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio images
CREATE POLICY "Anyone can view portfolio images"
ON public.portfolio_images
FOR SELECT
USING (true);

-- Business owners can manage their portfolio images
CREATE POLICY "Business owners can manage portfolio images"
ON public.portfolio_images
FOR ALL
USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);

-- Storage policies for portfolio images
CREATE POLICY "Anyone can view portfolio images storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Business owners can upload portfolio images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can delete portfolio images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'portfolio-images' AND auth.uid() IS NOT NULL);
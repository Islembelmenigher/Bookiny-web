-- Add preferred location columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_wilaya text,
ADD COLUMN IF NOT EXISTS preferred_city text;
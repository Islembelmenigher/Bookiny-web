-- Add language_preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'fr', 'ar'));
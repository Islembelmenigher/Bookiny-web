-- Create new enum type with desired values
CREATE TYPE business_category_new AS ENUM (
  'barber_men',
  'barber_women', 
  'nail_salon',
  'doctor',
  'dentist'
);

-- First convert column to text to allow updates
ALTER TABLE businesses 
  ALTER COLUMN category TYPE text;

-- Update existing businesses to map to closest new category
UPDATE businesses SET category = 'barber_men' WHERE category IN ('barbershop', 'salon');
UPDATE businesses SET category = 'barber_women' WHERE category IN ('spa', 'beauty', 'wellness');
UPDATE businesses SET category = 'nail_salon' WHERE category IN ('nail_salon', 'massage');
UPDATE businesses SET category = 'doctor' WHERE category IN ('fitness', 'tattoo');
UPDATE businesses SET category = 'dentist' WHERE category = 'other';

-- Default any remaining to barber_men
UPDATE businesses SET category = 'barber_men' WHERE category NOT IN ('barber_men', 'barber_women', 'nail_salon', 'doctor', 'dentist');

-- Convert to new enum
ALTER TABLE businesses 
  ALTER COLUMN category TYPE business_category_new 
  USING category::business_category_new;

-- Drop old enum and rename new one
DROP TYPE business_category;
ALTER TYPE business_category_new RENAME TO business_category;

-- Create function to check business count limit
CREATE OR REPLACE FUNCTION public.check_business_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO business_count
  FROM businesses
  WHERE owner_id = NEW.owner_id;
  
  IF business_count >= 3 THEN
    RAISE EXCEPTION 'You can only create up to 3 businesses';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the limit
CREATE TRIGGER enforce_business_limit
  BEFORE INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_business_limit();
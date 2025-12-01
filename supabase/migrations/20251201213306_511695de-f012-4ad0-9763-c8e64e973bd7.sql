-- Create enum for app roles (separate from user_role)
CREATE TYPE public.app_role AS ENUM ('owner', 'staff');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, business_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_business_role(_user_id UUID, _business_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND business_id = _business_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view roles for their business"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can insert staff roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  role = 'staff' AND
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete staff roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Automatically create owner role when business is created
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, business_id, role)
  VALUES (NEW.owner_id, NEW.id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business();

-- Update bookings RLS to allow staff access
CREATE POLICY "Staff can view bookings for their business"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.has_business_role(auth.uid(), business_id, 'staff')
);

CREATE POLICY "Staff can update bookings for their business"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  public.has_business_role(auth.uid(), business_id, 'staff')
);

-- Update services RLS to allow staff to view
CREATE POLICY "Staff can view services for their business"
ON public.services
FOR SELECT
TO authenticated
USING (
  public.has_business_role(auth.uid(), business_id, 'staff')
);

-- Update staff RLS to allow staff members to view
CREATE POLICY "Staff can view staff for their business"
ON public.staff
FOR SELECT
TO authenticated
USING (
  public.has_business_role(auth.uid(), business_id, 'staff')
);

-- Update business_hours RLS
CREATE POLICY "Staff can view hours for their business"
ON public.business_hours
FOR SELECT
TO authenticated
USING (
  public.has_business_role(auth.uid(), business_id, 'staff')
);
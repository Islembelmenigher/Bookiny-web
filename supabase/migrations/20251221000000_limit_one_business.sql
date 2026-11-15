-- Add unique constraint to owner_id to ensure each user can only own one business
ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_id_key UNIQUE (owner_id);

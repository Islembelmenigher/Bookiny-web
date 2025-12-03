-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Allow system to create notifications (via service role in triggers)
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to send booking notifications
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name text;
  v_service_name text;
  v_staff_name text;
  v_client_name text;
  v_owner_id uuid;
  v_staff_profile_id uuid;
BEGIN
  -- Get related data
  SELECT b.name, b.owner_id INTO v_business_name, v_owner_id
  FROM businesses b WHERE b.id = NEW.business_id;
  
  SELECT s.name INTO v_service_name
  FROM services s WHERE s.id = NEW.service_id;
  
  SELECT st.name, st.profile_id INTO v_staff_name, v_staff_profile_id
  FROM staff st WHERE st.id = NEW.staff_id;
  
  SELECT p.full_name INTO v_client_name
  FROM profiles p WHERE p.id = NEW.client_id;
  
  -- Notify business owner
  INSERT INTO notifications (user_id, title, message, type, booking_id)
  VALUES (
    v_owner_id,
    'New Booking',
    format('New booking: %s booked %s with %s on %s at %s', 
      v_client_name, v_service_name, v_staff_name, NEW.booking_date, NEW.start_time),
    'booking_created',
    NEW.id
  );
  
  -- Notify assigned staff if they have a profile
  IF v_staff_profile_id IS NOT NULL AND v_staff_profile_id != v_owner_id THEN
    INSERT INTO notifications (user_id, title, message, type, booking_id)
    VALUES (
      v_staff_profile_id,
      'New Booking Assigned',
      format('You have a new booking: %s for %s on %s at %s', 
        v_client_name, v_service_name, NEW.booking_date, NEW.start_time),
      'booking_created',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to notify on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name text;
  v_service_name text;
BEGIN
  -- Only trigger if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  SELECT b.name INTO v_business_name
  FROM businesses b WHERE b.id = NEW.business_id;
  
  SELECT s.name INTO v_service_name
  FROM services s WHERE s.id = NEW.service_id;
  
  -- Notify client when booking is confirmed
  IF NEW.status = 'confirmed' THEN
    INSERT INTO notifications (user_id, title, message, type, booking_id)
    VALUES (
      NEW.client_id,
      'Booking Confirmed',
      format('Your booking for %s at %s on %s has been confirmed', 
        v_service_name, v_business_name, NEW.booking_date),
      'booking_confirmed',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to notify on booking reschedule
CREATE OR REPLACE FUNCTION public.notify_booking_rescheduled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name text;
  v_service_name text;
  v_owner_id uuid;
  v_staff_profile_id uuid;
BEGIN
  -- Only trigger if date or time changed
  IF OLD.booking_date = NEW.booking_date AND OLD.start_time = NEW.start_time THEN
    RETURN NEW;
  END IF;
  
  SELECT b.name, b.owner_id INTO v_business_name, v_owner_id
  FROM businesses b WHERE b.id = NEW.business_id;
  
  SELECT s.name INTO v_service_name
  FROM services s WHERE s.id = NEW.service_id;
  
  SELECT st.profile_id INTO v_staff_profile_id
  FROM staff st WHERE st.id = NEW.staff_id;
  
  -- Notify client about reschedule
  INSERT INTO notifications (user_id, title, message, type, booking_id)
  VALUES (
    NEW.client_id,
    'Booking Rescheduled',
    format('Your booking for %s has been rescheduled to %s at %s', 
      v_service_name, NEW.booking_date, NEW.start_time),
    'booking_rescheduled',
    NEW.id
  );
  
  -- Also notify owner and staff
  INSERT INTO notifications (user_id, title, message, type, booking_id)
  VALUES (
    v_owner_id,
    'Booking Rescheduled',
    format('Booking for %s rescheduled to %s at %s', 
      v_service_name, NEW.booking_date, NEW.start_time),
    'booking_rescheduled',
    NEW.id
  );
  
  IF v_staff_profile_id IS NOT NULL AND v_staff_profile_id != v_owner_id THEN
    INSERT INTO notifications (user_id, title, message, type, booking_id)
    VALUES (
      v_staff_profile_id,
      'Booking Rescheduled',
      format('Booking for %s rescheduled to %s at %s', 
        v_service_name, NEW.booking_date, NEW.start_time),
      'booking_rescheduled',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_created();

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_status_change();

CREATE TRIGGER on_booking_rescheduled
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_rescheduled();
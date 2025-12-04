-- Create trigger for booking overlap validation (if not exists)
DROP TRIGGER IF EXISTS check_booking_overlap_trigger ON bookings;

CREATE TRIGGER check_booking_overlap_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_overlap();
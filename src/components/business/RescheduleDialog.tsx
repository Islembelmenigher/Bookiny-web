import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface RescheduleDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
}

export function RescheduleDialog({ booking, open, onOpenChange, onRescheduled }: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open && booking) {
      setSelectedDate(undefined);
      setSelectedTime('');
      setExistingBookings([]);
      setLoading(true);
      
      // Fetch service duration if not available in booking
      const fetchServiceAndHours = async () => {
        try {
          // Fetch business hours
          const { data: hoursData } = await supabase
            .from('business_hours')
            .select('*')
            .eq('business_id', booking.business_id);
          
          setBusinessHours(hoursData || []);
          
          // Get service duration - check if it's already in the booking object
          let duration = 30;
          if (booking.services?.duration_minutes) {
            duration = booking.services.duration_minutes;
          } else if (booking.service_id) {
            const { data: serviceData } = await supabase
              .from('services')
              .select('duration_minutes')
              .eq('id', booking.service_id)
              .single();
            
            if (serviceData?.duration_minutes) {
              duration = serviceData.duration_minutes;
            }
          }
          setServiceDuration(duration);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchServiceAndHours();
    } else {
      // Reset when closing
      setSelectedDate(undefined);
      setSelectedTime('');
      setBusinessHours([]);
      setExistingBookings([]);
      setServiceDuration(30);
    }
  }, [open, booking]);

  // Fetch existing bookings when date changes
  useEffect(() => {
    if (selectedDate && booking?.business_id && open) {
      const fetchExistingBookings = async () => {
        const { data } = await supabase
          .from('bookings')
          .select('start_time, end_time, staff_id')
          .eq('business_id', booking.business_id)
          .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
          .neq('id', booking.id)
          .in('status', ['pending', 'confirmed']);
        
        setExistingBookings(data || []);
      };
      
      fetchExistingBookings();
    }
  }, [selectedDate, booking?.business_id, booking?.id, open]);

  const calculateEndTime = useCallback((startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }, []);

  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  const isSlotReserved = useCallback((slotTime: string): boolean => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + serviceDuration;
    
    return existingBookings.some(b => {
      const bookingStart = timeToMinutes(b.start_time);
      const bookingEnd = timeToMinutes(b.end_time);
      
      // Check if the slot overlaps with an existing booking
      // A slot is reserved if: slotStart < bookingEnd AND slotEnd > bookingStart
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }, [existingBookings, serviceDuration, timeToMinutes]);

  const getTimeSlots = useCallback(() => {
    if (!selectedDate || businessHours.length === 0) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek);

    if (!dayHours || dayHours.is_closed) return [];

    const slots: { time: string; status: 'available' | 'reserved' }[] = [];
    const startMinutes = timeToMinutes(dayHours.start_time);
    const endMinutes = timeToMinutes(dayHours.end_time);

    // Generate slots only within business hours
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      
      // Check if this slot's end time would exceed business hours
      const slotEndMinutes = minutes + serviceDuration;
      if (slotEndMinutes > endMinutes) continue;
      
      const reserved = isSlotReserved(time);
      slots.push({
        time,
        status: reserved ? 'reserved' : 'available',
      });
    }

    return slots;
  }, [selectedDate, businessHours, serviceDuration, timeToMinutes, isSlotReserved]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !booking?.id) {
      toast.error('Please select a new date and time');
      return;
    }

    setSaving(true);
    try {
      const newEndTime = calculateEndTime(selectedTime, serviceDuration);
      const newDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Double-check for conflicts before updating
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('business_id', booking.business_id)
        .eq('booking_date', newDate)
        .neq('id', booking.id)
        .in('status', ['pending', 'confirmed'])
        .lt('start_time', newEndTime)
        .gt('end_time', selectedTime);
      
      if (conflicts && conflicts.length > 0) {
        toast.error('This time slot has just been booked. Please select another time.');
        // Refresh bookings to show updated availability
        const { data } = await supabase
          .from('bookings')
          .select('start_time, end_time, staff_id')
          .eq('business_id', booking.business_id)
          .eq('booking_date', newDate)
          .neq('id', booking.id)
          .in('status', ['pending', 'confirmed']);
        
        setExistingBookings(data || []);
        setSelectedTime('');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: newDate,
          start_time: selectedTime,
          end_time: newEndTime,
        })
        .eq('id', booking.id);

      if (error) {
        console.error('Reschedule error:', error);
        if (error.message?.includes('overlap')) {
          toast.error('This time slot is no longer available. Please select another time.');
        } else {
          toast.error('Failed to reschedule booking. Please try again.');
        }
        return;
      }

      toast.success('Booking rescheduled successfully');
      onRescheduled();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Reschedule error:', error);
      toast.error('Failed to reschedule booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const slots = getTimeSlots();

  // Don't render dialog content if no booking
  if (!booking) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Select New Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="font-semibold mb-3">Select New Time</h3>
                <div className="flex gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500" />
                    <span>Reserved</span>
                  </div>
                </div>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Business is closed on this day.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {slots.map(({ time, status }) => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        disabled={status === 'reserved'}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          ${selectedTime === time ? 'ring-2 ring-primary' : ''}
                          ${status === 'available' ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20' : ''}
                          ${status === 'reserved' ? 'bg-red-500/10 border-red-500 text-muted-foreground cursor-not-allowed' : ''}
                        `}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleReschedule}
              disabled={!selectedDate || !selectedTime || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Reschedule
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

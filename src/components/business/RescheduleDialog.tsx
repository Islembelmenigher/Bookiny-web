import { useState, useEffect } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && booking) {
      setSelectedDate(undefined);
      setSelectedTime('');
      setExistingBookings([]);
      fetchBusinessHours();
    }
  }, [open, booking]);

  useEffect(() => {
    if (selectedDate && booking && open) {
      fetchExistingBookings();
    }
  }, [selectedDate, booking, open]);

  const fetchBusinessHours = async () => {
    if (!booking?.business_id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', booking.business_id);
      setBusinessHours(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingBookings = async () => {
    if (!selectedDate || !booking?.business_id) return;
    
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time, staff_id')
      .eq('business_id', booking.business_id)
      .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
      .neq('id', booking.id)
      .in('status', ['pending', 'confirmed']);
    
    setExistingBookings(data || []);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const isSlotReserved = (time: string) => {
    const duration = booking.services?.duration_minutes || 30;
    const endTime = calculateEndTime(time, duration);
    
    return existingBookings.some(b => {
      const bookingStart = b.start_time;
      const bookingEnd = b.end_time;
      return (time < bookingEnd && endTime > bookingStart);
    });
  };

  const getTimeSlots = () => {
    if (!selectedDate || businessHours.length === 0) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek);

    if (!dayHours || dayHours.is_closed) return [];

    const slots: { time: string; status: 'available' | 'reserved' | 'outside' }[] = [];
    const [startHour, startMin] = dayHours.start_time.split(':').map(Number);
    const [endHour, endMin] = dayHours.end_time.split(':').map(Number);

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const isWithinHours = 
          (h > startHour || (h === startHour && m >= startMin)) &&
          (h < endHour || (h === endHour && m < endMin));

        if (!isWithinHours) continue;

        const reserved = isSlotReserved(time);
        slots.push({
          time,
          status: reserved ? 'reserved' : 'available',
        });
      }
    }

    return slots;
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a new date and time');
      return;
    }

    setSaving(true);
    try {
      const duration = booking.services?.duration_minutes || 30;
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          end_time: calculateEndTime(selectedTime, duration),
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast.success('Booking rescheduled successfully');
      onRescheduled();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to reschedule booking');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const slots = getTimeSlots();

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
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
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

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Clock, Save } from 'lucide-react';

interface StaffScheduleManagerProps {
  businessId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function StaffScheduleManager({ businessId }: StaffScheduleManagerProps) {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffSchedule();
  }, [businessId, user]);

  const fetchStaffSchedule = async () => {
    try {
      // Fetch business hours first
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId);

      const hoursMap: Record<number, any> = {};
      hoursData?.forEach((hour) => {
        hoursMap[hour.day_of_week] = hour;
      });
      setBusinessHours(hoursMap);

      // Get staff record for current user
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('business_id', businessId)
        .eq('profile_id', user?.id)
        .single();

      if (staffError || !staffData) {
        toast.error('Staff record not found');
        return;
      }

      setStaffId(staffData.id);

      // Fetch existing schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('staff_hours')
        .select('*')
        .eq('staff_id', staffData.id)
        .order('day_of_week');

      if (scheduleError) throw scheduleError;

      // Initialize schedule for all days
      const fullSchedule = DAYS.map((_, index) => {
        const existing = scheduleData?.find(s => s.day_of_week === index);
        const businessHour = hoursMap[index];
        return existing || {
          day_of_week: index,
          start_time: businessHour?.start_time || '09:00',
          end_time: businessHour?.end_time || '17:00',
          is_available: false,
          staff_id: staffData.id,
        };
      });

      setSchedule(fullSchedule);
    } catch (error: any) {
      console.error('Failed to load schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!staffId) return;

    // Validate staff schedules against business hours
    for (const day of schedule) {
      if (day.is_available) {
        const businessHour = businessHours[day.day_of_week];
        if (!businessHour || businessHour.is_closed) {
          toast.error(`Cannot set availability for ${DAYS[day.day_of_week]} - business is closed`);
          return;
        }
        
        if (day.start_time < businessHour.start_time || day.end_time > businessHour.end_time) {
          toast.error(`${DAYS[day.day_of_week]} hours must be within business hours (${businessHour.start_time} - ${businessHour.end_time})`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      // Delete existing schedule
      await supabase.from('staff_hours').delete().eq('staff_id', staffId);

      // Insert new schedule (only for available days)
      const scheduleToInsert = schedule
        .filter(day => day.is_available)
        .map(day => ({
          staff_id: staffId,
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
          is_available: true,
        }));

      if (scheduleToInsert.length > 0) {
        const { error } = await supabase.from('staff_hours').insert(scheduleToInsert);
        if (error) throw error;
      }

      toast.success('Schedule saved successfully');
      fetchStaffSchedule();
    } catch (error: any) {
      toast.error('Failed to save schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (index: number, field: string, value: any) => {
    setSchedule(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ));
  };

  if (loading && schedule.length === 0) {
    return <div className="animate-pulse">Loading schedule...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Schedule
        </CardTitle>
        <CardDescription>
          Set your availability for this business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((day, index) => {
          const businessHour = businessHours[index];
          const isBusinessClosed = !businessHour || businessHour.is_closed;
          
          return (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{DAYS[index]}</Label>
                  {isBusinessClosed && (
                    <p className="text-xs text-muted-foreground">Business closed</p>
                  )}
                  {!isBusinessClosed && (
                    <p className="text-xs text-muted-foreground">
                      Business hours: {businessHour.start_time} - {businessHour.end_time}
                    </p>
                  )}
                </div>
                <Switch
                  checked={day.is_available}
                  disabled={isBusinessClosed}
                  onCheckedChange={(checked) => updateDay(index, 'is_available', checked)}
                />
              </div>
              {day.is_available && !isBusinessClosed && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value={day.start_time}
                      min={businessHour?.start_time}
                      max={businessHour?.end_time}
                      onChange={(e) => updateDay(index, 'start_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Time</Label>
                    <Input
                      type="time"
                      value={day.end_time}
                      min={businessHour?.start_time}
                      max={businessHour?.end_time}
                      onChange={(e) => updateDay(index, 'end_time', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <Button onClick={handleSaveSchedule} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}

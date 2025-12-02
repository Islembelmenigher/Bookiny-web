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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffSchedule();
  }, [businessId, user]);

  const fetchStaffSchedule = async () => {
    try {
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
        return existing || {
          day_of_week: index,
          start_time: '09:00',
          end_time: '17:00',
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

    try {
      setLoading(true);

      // Delete existing schedule
      await supabase.from('staff_hours').delete().eq('staff_id', staffId);

      // Insert new schedule (only for available days)
      const scheduleToInsert = schedule
        .filter(day => day.is_available)
        .map(({ id, ...day }) => ({
          ...day,
          staff_id: staffId,
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
        {schedule.map((day, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">{DAYS[index]}</Label>
              <Switch
                checked={day.is_available}
                onCheckedChange={(checked) => updateDay(index, 'is_available', checked)}
              />
            </div>
            {day.is_available && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <Input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => updateDay(index, 'start_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">End Time</Label>
                  <Input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => updateDay(index, 'end_time', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        <Button onClick={handleSaveSchedule} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}

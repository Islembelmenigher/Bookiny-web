import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HoursManagerProps {
  businessId: string;
}

const getDAYS = (t: any) => [
  { value: 0, label: t('days.sunday') },
  { value: 1, label: t('days.monday') },
  { value: 2, label: t('days.tuesday') },
  { value: 3, label: t('days.wednesday') },
  { value: 4, label: t('days.thursday') },
  { value: 5, label: t('days.friday') },
  { value: 6, label: t('days.saturday') },
];

export function HoursManager({ businessId }: HoursManagerProps) {
  const { t } = useTranslation();
  const [hours, setHours] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const DAYS = getDAYS(t);

  useEffect(() => {
    fetchHours();
  }, [businessId]);

  const fetchHours = async () => {
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId);

      if (error) throw error;

      const hoursMap: Record<number, any> = {};
      data?.forEach((hour) => {
        hoursMap[hour.day_of_week] = hour;
      });

      setHours(hoursMap);
    } catch (error: any) {
      toast.error(t('hours.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];

      for (const day of DAYS) {
        const dayData = hours[day.value] || {
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '17:00',
          is_closed: true,
        };

        if (hours[day.value]?.id) {
          updates.push(
            supabase
              .from('business_hours')
              .update({
                start_time: dayData.start_time,
                end_time: dayData.end_time,
                is_closed: dayData.is_closed,
              })
              .eq('id', dayData.id)
          );
        } else if (!dayData.is_closed) {
          updates.push(
            supabase.from('business_hours').insert({
              business_id: businessId,
              day_of_week: day.value,
              start_time: dayData.start_time,
              end_time: dayData.end_time,
              is_closed: false,
            })
          );
        }
      }

      await Promise.all(updates);
      toast.success(t('hours.updateSuccess'));
      fetchHours();
    } catch (error: any) {
      toast.error(t('hours.updateError'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (dayValue: number, field: string, value: any) => {
    setHours((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        day_of_week: dayValue,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{t('common.loading')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('hours.title')}</CardTitle>
            <CardDescription>{t('hours.subtitle')}</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('hours.saving') : t('hours.save')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayData = hours[day.value] || {
              day_of_week: day.value,
              start_time: '09:00',
              end_time: '17:00',
              is_closed: true,
            };

            return (
              <div
                key={day.value}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="w-32 font-semibold">{day.label}</div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={!dayData.is_closed}
                    onCheckedChange={(checked) =>
                      updateDay(day.value, 'is_closed', !checked)
                    }
                  />
                  <Label className="text-sm">{t('hours.open')}</Label>
                </div>

                {!dayData.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={dayData.start_time}
                        onChange={(e) =>
                          updateDay(day.value, 'start_time', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-muted-foreground">{t('hours.to')}</span>
                      <Input
                        type="time"
                        value={dayData.end_time}
                        onChange={(e) =>
                          updateDay(day.value, 'end_time', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  </>
                )}

                {dayData.is_closed && (
                  <span className="text-muted-foreground text-sm">{t('hours.closed')}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

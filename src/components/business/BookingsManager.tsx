import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, User, Check, X, RefreshCw, Phone, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { RescheduleDialog } from './RescheduleDialog';
import { formatDZD } from '@/lib/algeria';

interface BookingsManagerProps {
  businessId: string;
}

export function BookingsManager({ businessId }: BookingsManagerProps) {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'no_show'>('all');
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, [businessId, filter]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          services (name, price, duration_minutes),
          staff (name),
          profiles (full_name, phone)
        `)
        .eq('business_id', businessId)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(t(`bookings.${status}`));
      fetchBookings();
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      cancelled: 'bg-red-500',
      completed: 'bg-blue-500',
      no_show: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{t('common.loading')}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t('dashboard.bookings')}</CardTitle>
              <CardDescription>{t('dashboard.manageAppointments')}</CardDescription>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')} {t('dashboard.bookings')}</SelectItem>
                <SelectItem value="pending">{t('bookings.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('bookings.confirmed')}</SelectItem>
                <SelectItem value="cancelled">{t('bookings.cancelled')}</SelectItem>
                <SelectItem value="no_show">{t('bookings.noShow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noResults')}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.services?.name}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {t(`bookings.${booking.status}`)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{booking.profiles?.full_name}</span>
                      </div>
                      {booking.profiles?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{booking.profiles.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{booking.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{formatDZD(booking.services?.price || 0)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-primary font-medium">
                      {t('bookings.performedBy')}: {booking.staff?.name || t('bookings.notAssigned')}
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        {t('bookings.notes')}: {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRescheduleBooking(booking)}
                        >
                          <RefreshCw className="h-4 w-4 me-1" />
                          {t('bookings.reschedule')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 hover:text-gray-700"
                          onClick={() => updateBookingStatus(booking.id, 'no_show')}
                        >
                          <UserX className="h-4 w-4 me-1" />
                          {t('bookings.markNoShow')}
                        </Button>
                      </>
                    )}

                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        >
                          <Check className="h-4 w-4 me-1" />
                          {t('common.confirm')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <X className="h-4 w-4 me-1" />
                          {t('common.cancel')}
                        </Button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        <Check className="h-4 w-4 me-1" />
                        {t('bookings.complete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RescheduleDialog
        booking={rescheduleBooking}
        open={!!rescheduleBooking}
        onOpenChange={(open) => !open && setRescheduleBooking(null)}
        onRescheduled={fetchBookings}
      />
    </>
  );
}

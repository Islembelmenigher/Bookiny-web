import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, CheckCircle, TrendingUp } from 'lucide-react';
import { formatDZD } from '@/lib/algeria';
import { useTranslation } from 'react-i18next';

interface StaffAnalyticsProps {
  businessId: string;
}

interface StaffBookingStats {
  staffId: string;
  staffName: string;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export function StaffAnalytics({ businessId }: StaffAnalyticsProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [staffStats, setStaffStats] = useState<StaffBookingStats[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [staffBookings, setStaffBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchStaffStats();
  }, [businessId]);

  useEffect(() => {
    if (selectedStaff !== 'all') {
      fetchStaffBookings(selectedStaff);
    } else {
      fetchAllStaffBookings();
    }
  }, [selectedStaff, staffStats]);

  const fetchStaffStats = async () => {
    try {
      // Get all staff members
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Get all bookings for this business
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('staff_id, status')
        .eq('business_id', businessId);

      if (bookingsError) throw bookingsError;

      // Calculate stats for each staff member
      const stats: StaffBookingStats[] = (staffData || []).map(staff => {
        const staffBookings = bookingsData?.filter(b => b.staff_id === staff.id) || [];
        return {
          staffId: staff.id,
          staffName: staff.name,
          totalBookings: staffBookings.length,
          completedBookings: staffBookings.filter(b => b.status === 'completed').length,
          pendingBookings: staffBookings.filter(b => b.status === 'pending').length,
          confirmedBookings: staffBookings.filter(b => b.status === 'confirmed').length,
        };
      });

      // Sort by completed bookings
      stats.sort((a, b) => b.completedBookings - a.completedBookings);
      setStaffStats(stats);
    } catch (error: any) {
      toast.error(t('staffAnalytics.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffBookings = async (staffId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (name, price),
          profiles (full_name),
          staff (name)
        `)
        .eq('business_id', businessId)
        .eq('staff_id', staffId)
        .order('booking_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStaffBookings(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchAllStaffBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (name, price),
          profiles (full_name),
          staff (name)
        `)
        .eq('business_id', businessId)
        .order('booking_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStaffBookings(data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Staff Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('staffAnalytics.staffPerformance')}
          </CardTitle>
          <CardDescription>{t('staffAnalytics.staffPerformanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {staffStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t('staffAnalytics.noStaffFound')}
            </p>
          ) : (
            <div className="space-y-3">
              {staffStats.map((stat, index) => (
                <div
                  key={stat.staffId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{stat.staffName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg text-green-600">{stat.completedBookings}</p>
                      <p className="text-xs text-muted-foreground">{t('staffAnalytics.completed')}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-blue-600">{stat.confirmedBookings}</p>
                      <p className="text-xs text-muted-foreground">{t('staffAnalytics.confirmed')}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-yellow-600">{stat.pendingBookings}</p>
                      <p className="text-xs text-muted-foreground">{t('staffAnalytics.pending')}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{stat.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">{t('staffAnalytics.total')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Bookings by Staff */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t('staffAnalytics.bookingsByStaff')}
              </CardTitle>
              <CardDescription>{t('staffAnalytics.bookingsByStaffDesc')}</CardDescription>
            </div>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('staffAnalytics.selectStaff')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('staffAnalytics.allStaff')}</SelectItem>
                {staffStats.map(stat => (
                  <SelectItem key={stat.staffId} value={stat.staffId}>
                    {stat.staffName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {staffBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {selectedStaff === 'all' ? t('staffAnalytics.noBookingsFound') : t('staffAnalytics.noBookingsFoundStaff')}
            </p>
          ) : (
            <div className="space-y-3">
              {staffBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{booking.services?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.profiles?.full_name} · {formatDZD(booking.services?.price || 0)}
                    </p>
                    {selectedStaff === 'all' && booking.staff?.name && (
                      <p className="text-xs text-primary">{t('staffAnalytics.staffLabel')} {booking.staff.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{booking.booking_date}</p>
                    <p className="text-sm text-muted-foreground">{booking.start_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

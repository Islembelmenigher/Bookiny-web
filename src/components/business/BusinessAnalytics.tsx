import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrendingUp, Calendar, DollarSign, Users, Clock, UserX, BarChart3, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, subDays, subHours } from 'date-fns';
import { formatDZD } from '@/lib/algeria';

interface BusinessAnalyticsProps {
  businessId: string;
  stats: {
    totalBookings: number;
    todayBookings: number;
    totalRevenue: number;
    activeServices: number;
  };
}

interface StaffPerformance {
  staffId: string;
  staffName: string;
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
  revenueAllTime: number;
  noShowCount: number;
  totalBookings: number;
  noShowRate: number;
}

export function BusinessAnalytics({ businessId, stats }: BusinessAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    // Basic Analytics
    bookings24h: 0,
    bookings7d: 0,
    noShow24h: 0,
    noShow7d: 0,
    revenue24h: 0,
    revenue7d: 0,
    // Advanced Analytics
    noShow30d: 0,
    revenue30d: 0,
    revenueAllTime: 0,
    // Existing
    topServices: [] as any[],
    recentBookings: [] as any[],
  });
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, [businessId]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const last24h = subHours(now, 24);
      const last7d = subDays(now, 7);
      const last30d = subDays(now, 30);

      // Fetch all bookings for the business
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, services(name, price), staff(id, name)')
        .eq('business_id', businessId);

      const bookings = allBookings || [];

      // Basic Analytics - Bookings
      const bookings24h = bookings.filter(b => new Date(b.created_at) >= last24h).length;
      const bookings7d = bookings.filter(b => new Date(b.created_at) >= last7d).length;

      // Basic Analytics - No Shows
      const noShow24h = bookings.filter(b => b.status === 'no_show' && new Date(b.created_at) >= last24h).length;
      const noShow7d = bookings.filter(b => b.status === 'no_show' && new Date(b.created_at) >= last7d).length;

      // Basic Analytics - Revenue (only completed bookings)
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const revenue24h = completedBookings
        .filter(b => new Date(b.created_at) >= last24h)
        .reduce((sum, b) => sum + (b.services?.price || 0), 0);
      const revenue7d = completedBookings
        .filter(b => new Date(b.created_at) >= last7d)
        .reduce((sum, b) => sum + (b.services?.price || 0), 0);

      // Advanced Analytics
      const noShow30d = bookings.filter(b => b.status === 'no_show' && new Date(b.created_at) >= last30d).length;
      const revenue30d = completedBookings
        .filter(b => new Date(b.created_at) >= last30d)
        .reduce((sum, b) => sum + (b.services?.price || 0), 0);
      const revenueAllTime = completedBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);

      // Staff Performance
      const staffMap = new Map<string, StaffPerformance>();
      bookings.forEach(booking => {
        const staffId = booking.staff_id;
        const staffName = booking.staff?.name || 'Unknown';
        
        if (!staffMap.has(staffId)) {
          staffMap.set(staffId, {
            staffId,
            staffName,
            revenue24h: 0,
            revenue7d: 0,
            revenue30d: 0,
            revenueAllTime: 0,
            noShowCount: 0,
            totalBookings: 0,
            noShowRate: 0,
          });
        }

        const staff = staffMap.get(staffId)!;
        staff.totalBookings++;

        if (booking.status === 'no_show') {
          staff.noShowCount++;
        }

        if (booking.status === 'completed') {
          const price = booking.services?.price || 0;
          if (new Date(booking.created_at) >= last24h) staff.revenue24h += price;
          if (new Date(booking.created_at) >= last7d) staff.revenue7d += price;
          if (new Date(booking.created_at) >= last30d) staff.revenue30d += price;
          staff.revenueAllTime += price;
        }
      });

      // Calculate no-show rates
      staffMap.forEach(staff => {
        staff.noShowRate = staff.totalBookings > 0 
          ? Math.round((staff.noShowCount / staff.totalBookings) * 100) 
          : 0;
      });

      setStaffPerformance(Array.from(staffMap.values()).sort((a, b) => b.revenueAllTime - a.revenueAllTime));

      // Top services (most booked)
      const serviceCounts: Record<string, any> = {};
      bookings.forEach((booking) => {
        const serviceId = booking.service_id;
        if (!serviceCounts[serviceId]) {
          serviceCounts[serviceId] = {
            name: booking.services?.name,
            count: 0,
            price: booking.services?.price,
          };
        }
        serviceCounts[serviceId].count++;
      });

      const topServices = Object.values(serviceCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // Recent bookings
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`*, services (name), profiles (full_name)`)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);

      setAnalytics({
        bookings24h,
        bookings7d,
        noShow24h,
        noShow7d,
        revenue24h,
        revenue7d,
        noShow30d,
        revenue30d,
        revenueAllTime,
        topServices,
        recentBookings: recentBookings || [],
      });
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{t('analytics.loading')}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Basic Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('analytics.basicAnalytics')}</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bookings 24h */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.last24Hours')}</p>
                  <p className="text-3xl font-bold text-primary">{analytics.bookings24h}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.newBookings')}</p>
                </div>
                <Clock className="h-10 w-10 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          {/* Bookings 7d */}
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.last7Days')}</p>
                  <p className="text-3xl font-bold text-accent-foreground">{analytics.bookings7d}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.newBookings')}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-accent/60" />
              </div>
            </CardContent>
          </Card>

          {/* No Shows 24h */}
          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.noShows24h')}</p>
                  <p className="text-3xl font-bold text-destructive">{analytics.noShow24h}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.missedAppointments')}</p>
                </div>
                <UserX className="h-10 w-10 text-destructive/60" />
              </div>
            </CardContent>
          </Card>

          {/* No Shows 7d */}
          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.noShows7d')}</p>
                  <p className="text-3xl font-bold text-destructive">{analytics.noShow7d}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.missedAppointments')}</p>
                </div>
                <UserX className="h-10 w-10 text-destructive/60" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue 24h */}
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.revenue24h')}</p>
                  <p className="text-2xl font-bold text-green-600">{formatDZD(analytics.revenue24h)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.fromCompleted')}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/60" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue 7d */}
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.revenue7d')}</p>
                  <p className="text-2xl font-bold text-green-600">{formatDZD(analytics.revenue7d)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.fromCompleted')}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">{t('analytics.advancedAnalytics')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* No Shows 30d */}
          <Card className="border-destructive/20 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.noShowLast30Days')}</p>
                  <p className="text-3xl font-bold text-destructive">{analytics.noShow30d}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.missedAppointments')}</p>
                </div>
                <UserX className="h-10 w-10 text-destructive/60" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue 30d */}
          <Card className="border-green-500/20 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.revenue30d')}</p>
                  <p className="text-2xl font-bold text-green-600">{formatDZD(analytics.revenue30d)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.fromCompleted')}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/60" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue All Time */}
          <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('analytics.totalRevenueAllTime')}</p>
                  <p className="text-2xl font-bold text-primary">{formatDZD(analytics.revenueAllTime)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('analytics.allTime')}</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance */}
        {staffPerformance.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>{t('analytics.staffPerformance')}</CardTitle>
              </div>
              <CardDescription>{t('analytics.staffPerformanceDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.staffMember')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.revenue24hShort')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.revenue7dShort')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.revenue30dShort')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.revenueAllTimeShort')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.noShowsCount')}</th>
                      <th className="text-end py-3 px-2 text-sm font-medium text-muted-foreground">{t('analytics.noShowRate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((staff) => (
                      <tr key={staff.staffId} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{staff.staffName}</span>
                          </div>
                        </td>
                        <td className="text-end py-3 px-2 text-sm">{formatDZD(staff.revenue24h)}</td>
                        <td className="text-end py-3 px-2 text-sm">{formatDZD(staff.revenue7d)}</td>
                        <td className="text-end py-3 px-2 text-sm">{formatDZD(staff.revenue30d)}</td>
                        <td className="text-end py-3 px-2 text-sm font-semibold text-green-600">{formatDZD(staff.revenueAllTime)}</td>
                        <td className="text-end py-3 px-2">
                          <span className={`text-sm ${staff.noShowCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {staff.noShowCount}
                          </span>
                        </td>
                        <td className="text-end py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            staff.noShowRate >= 20 
                              ? 'bg-destructive/10 text-destructive' 
                              : staff.noShowRate >= 10 
                                ? 'bg-yellow-500/10 text-yellow-600' 
                                : 'bg-green-500/10 text-green-600'
                          }`}>
                            {staff.noShowRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.topServices')}</CardTitle>
          <CardDescription>{t('analytics.mostBookedServices')}</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t('analytics.noBookingData')}
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topServices.map((service: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatDZD(service.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{service.count}</p>
                    <p className="text-xs text-muted-foreground">{t('analytics.bookings')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.recentBookings')}</CardTitle>
          <CardDescription>{t('analytics.latestActivity')}</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t('analytics.noRecentBookings')}
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{booking.services?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.profiles?.full_name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                    <p>{booking.start_time}</p>
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

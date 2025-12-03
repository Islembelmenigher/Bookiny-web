import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrendingUp, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
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

export function BusinessAnalytics({ businessId, stats }: BusinessAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    last24Hours: 0,
    last7Days: 0,
    last30Days: 0,
    topServices: [] as any[],
    recentBookings: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [businessId]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const last24h = subDays(now, 1);
      const last7d = subDays(now, 7);
      const last30d = subDays(now, 30);

      // Bookings in last 24 hours
      const { count: count24h } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('created_at', last24h.toISOString());

      // Bookings in last 7 days
      const { count: count7d } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('created_at', last7d.toISOString());

      // Bookings in last 30 days
      const { count: count30d } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('created_at', last30d.toISOString());

      // Top services (most booked)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('service_id, services(name, price)')
        .eq('business_id', businessId);

      const serviceCounts: Record<string, any> = {};
      bookingsData?.forEach((booking) => {
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
        .select(`
          *,
          services (name),
          profiles (full_name)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);

      setAnalytics({
        last24Hours: count24h || 0,
        last7Days: count7d || 0,
        last30Days: count30d || 0,
        topServices,
        recentBookings: recentBookings || [],
      });
    } catch (error: any) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time-based Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last 24 Hours</p>
                <p className="text-3xl font-bold">{analytics.last24Hours}</p>
                <p className="text-xs text-muted-foreground mt-1">new bookings</p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
                <p className="text-3xl font-bold">{analytics.last7Days}</p>
                <p className="text-xs text-muted-foreground mt-1">new bookings</p>
              </div>
              <TrendingUp className="h-10 w-10 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                <p className="text-3xl font-bold">{analytics.last30Days}</p>
                <p className="text-xs text-muted-foreground mt-1">new bookings</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
          <CardDescription>Most booked services</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No booking data available yet
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
                    <p className="text-xs text-muted-foreground">bookings</p>
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
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent bookings
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

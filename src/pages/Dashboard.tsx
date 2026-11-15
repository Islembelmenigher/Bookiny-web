import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, X, Building2, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DemoDataSeeder } from '@/components/DemoDataSeeder';
import { RescheduleDialog } from '@/components/business/RescheduleDialog';
import { formatDZD } from '@/lib/algeria';

const MAX_BUSINESSES = 1;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [staffBusinesses, setStaffBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, bookingsRes, businessesRes, staffRolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase
          .from('bookings')
          .select(`
            *,
            businesses (name, city),
            services (name, price, duration_minutes),
            staff (name)
          `)
          .eq('client_id', user?.id)
          .order('booking_date', { ascending: false }),
        supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user?.id),
        supabase
          .from('user_roles')
          .select(`
            business_id,
            businesses (*)
          `)
          .eq('user_id', user?.id)
          .eq('role', 'staff'),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (businessesRes.data) setBusinesses(businessesRes.data);
      if (staffRolesRes.data) {
        const staffBiz = staffRolesRes.data
          .map((role: any) => role.businesses)
          .filter(Boolean);
        setStaffBusinesses(staffBiz);
      }
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(t('bookings.cancelSuccess'));
      fetchData();
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
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const isBusinessOwner = profile?.role === 'business_owner';
  const canCreateMoreBusinesses = businesses.length < MAX_BUSINESSES;
  const hasReachedLimit = businesses.length >= MAX_BUSINESSES;

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">{t('auth.welcomeBack')}, {profile?.full_name || 'User'}</p>
            </div>
            <div className="flex gap-2">
              {isBusinessOwner && businesses.length === 0 && (
                <>
                  <DemoDataSeeder />
                  <Button asChild>
                    <Link to="/business/new">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('dashboard.addBusiness')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">{t('nav.myBookings')}</TabsTrigger>
              {isBusinessOwner && <TabsTrigger value="businesses">{t('nav.myBusiness')}</TabsTrigger>}
              {staffBusinesses.length > 0 && <TabsTrigger value="staff">{t('dashboard.staffAccess')}</TabsTrigger>}
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('dashboard.noBookingsTitle')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('dashboard.noBookingsDesc')}
                    </p>
                    <Button asChild>
                      <Link to="/search">{t('dashboard.browseServices')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{booking.services?.name}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{booking.businesses?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.businesses?.city}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{booking.start_time} ({booking.services?.duration_minutes} min)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{formatDZD(booking.services?.price || 0)}</span>
                              </div>
                              <div className="text-primary font-medium">
                                {t('business.performedBy')}: {booking.staff?.name || t('bookings.notAssigned')}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRescheduleBooking(booking)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t('bookings.reschedule')}
                              </Button>
                            )}
                            {booking.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                {t('common.cancel')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {isBusinessOwner && (
              <TabsContent value="businesses" className="space-y-4">

                {businesses.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('dashboard.noBusinessesTitle')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {t('dashboard.noBusinessesDesc')}
                      </p>
                      <Button asChild>
                        <Link to="/business/new">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('dashboard.addBusiness')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>

                    <div className="grid md:grid-cols-2 gap-4">
                      {businesses.map((business) => (
                        <Card key={business.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{business.name}</h3>
                                <Badge variant="secondary">{business.category.replace('_', ' ')}</Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{business.city}, {business.state}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link to={`/business/${business.id}`}>{t('common.view')}</Link>
                              </Button>
                              <Button size="sm" asChild className="flex-1">
                                <Link to={`/business/${business.id}/manage`}>{t('dashboard.manage')}</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            )}

            {staffBusinesses.length > 0 && (
              <TabsContent value="staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.staffAccessTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {t('dashboard.staffAccessDesc')}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {staffBusinesses.map((business) => (
                        <Card key={business.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{business.name}</h3>
                                <Badge variant="secondary">{business.category.replace('_', ' ')}</Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{business.city}, {business.state}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button size="sm" asChild className="w-full">
                                <Link to={`/business/${business.id}/manage`}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  {t('dashboard.openDashboard')}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <RescheduleDialog
        booking={rescheduleBooking}
        open={!!rescheduleBooking}
        onOpenChange={(open) => !open && setRescheduleBooking(null)}
        onRescheduled={fetchData}
      />
    </Layout>
  );
}
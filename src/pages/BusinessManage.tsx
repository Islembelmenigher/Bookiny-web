import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import { ServicesManager } from '@/components/business/ServicesManager';
import { StaffManager } from '@/components/business/StaffManager';
import { HoursManager } from '@/components/business/HoursManager';
import { BookingsManager } from '@/components/business/BookingsManager';
import { BusinessAnalytics } from '@/components/business/BusinessAnalytics';
import { StaffInviteManager } from '@/components/business/StaffInviteManager';
import { BusinessCoverUpload } from '@/components/business/BusinessCoverUpload';

export default function BusinessManage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
  });

  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) throw businessError;

      if (businessData.owner_id !== user?.id) {
        toast.error('You do not have permission to manage this business');
        navigate('/dashboard');
        return;
      }

      setBusiness(businessData);

      // Fetch statistics
      const today = new Date().toISOString().split('T')[0];
      
      const [totalBookingsRes, todayBookingsRes, servicesRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('business_id', id),
        supabase
          .from('bookings')
          .select('*', { count: 'exact' })
          .eq('business_id', id)
          .gte('booking_date', today)
          .lte('booking_date', today),
        supabase
          .from('services')
          .select('*', { count: 'exact' })
          .eq('business_id', id)
          .eq('is_active', true),
      ]);

      setStats({
        totalBookings: totalBookingsRes.count || 0,
        todayBookings: todayBookingsRes.count || 0,
        totalRevenue: 0, // Calculate from bookings if needed
        activeServices: servicesRes.count || 0,
      });
    } catch (error: any) {
      toast.error('Failed to load business data');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  if (!business) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Business not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
            <p className="text-muted-foreground">Manage your business and bookings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Bookings</p>
                    <p className="text-2xl font-bold">{stats.todayBookings}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Services</p>
                    <p className="text-2xl font-bold">{stats.activeServices}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="hours">Hours</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <BookingsManager businessId={id!} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesManager businessId={id!} />
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <StaffInviteManager businessId={id!} />
              <StaffManager businessId={id!} />
            </TabsContent>

            <TabsContent value="hours">
              <HoursManager businessId={id!} />
            </TabsContent>

            <TabsContent value="analytics">
              <BusinessAnalytics businessId={id!} stats={stats} />
            </TabsContent>

            <TabsContent value="settings">
              <BusinessCoverUpload 
                businessId={id!} 
                currentCoverUrl={business?.cover_image_url}
                onUploadSuccess={(url) => setBusiness({ ...business, cover_image_url: url })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

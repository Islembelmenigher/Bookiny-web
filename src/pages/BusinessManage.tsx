import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Users, Trash2 } from 'lucide-react';
import { ServicesManager } from '@/components/business/ServicesManager';
import { StaffManager } from '@/components/business/StaffManager';
import { HoursManager } from '@/components/business/HoursManager';
import { BookingsManager } from '@/components/business/BookingsManager';
import { BusinessAnalytics } from '@/components/business/BusinessAnalytics';
import { StaffInviteManager } from '@/components/business/StaffInviteManager';
import { BusinessCoverUpload } from '@/components/business/BusinessCoverUpload';
import { StaffScheduleManager } from '@/components/business/StaffScheduleManager';
import { StaffServicesManager } from '@/components/business/StaffServicesManager';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function BusinessManage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'staff' | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    totalServices: 0,
    totalStaff: 0,
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
      setBusiness(businessData);

      // Check if user is owner or staff
      if (businessData.owner_id === user?.id) {
        setUserRole('owner');
      } else {
        // Check if user is staff for this business
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('business_id', id)
          .eq('role', 'staff')
          .maybeSingle();

        if (roleData) {
          setUserRole('staff');
        } else {
          toast.error('You do not have permission to access this business');
          navigate('/dashboard');
          return;
        }
      }

      // Fetch basic statistics
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id);

      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id)
        .eq('is_active', true);

      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', id)
        .eq('is_active', true);

      setStats({
        totalBookings: bookingsCount || 0,
        totalServices: servicesCount || 0,
        totalStaff: staffCount || 0,
        todayBookings: 0,
        totalRevenue: 0,
        activeServices: servicesCount || 0,
      });
    } catch (error: any) {
      toast.error('Failed to load business data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Business deleted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
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
            <TabsList className={`grid w-full ${userRole === 'staff' ? 'grid-cols-3' : 'grid-cols-6'}`}>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              {userRole === 'staff' && <TabsTrigger value="my-schedule">My Schedule</TabsTrigger>}
              {userRole === 'staff' && <TabsTrigger value="my-services">My Services</TabsTrigger>}
              {userRole === 'owner' && <TabsTrigger value="services">Services</TabsTrigger>}
              {userRole === 'owner' && <TabsTrigger value="staff">Staff</TabsTrigger>}
              {userRole === 'owner' && <TabsTrigger value="hours">Hours</TabsTrigger>}
              {userRole === 'owner' && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
              {userRole === 'owner' && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="bookings">
              <BookingsManager businessId={id!} />
            </TabsContent>

            {userRole === 'staff' && (
              <>
                <TabsContent value="my-schedule">
                  <StaffScheduleManager businessId={id!} />
                </TabsContent>

                <TabsContent value="my-services">
                  <StaffServicesManager businessId={id!} />
                </TabsContent>
              </>
            )}

            {userRole === 'owner' && (
              <>
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

                <TabsContent value="settings" className="space-y-6">
                  <BusinessCoverUpload 
                    businessId={id!} 
                    currentCoverUrl={business?.cover_image_url}
                    onUploadSuccess={(url) => setBusiness({ ...business, cover_image_url: url })}
                  />
                  
                  {/* Danger Zone */}
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>
                        Irreversible actions that will permanently delete your business
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Business
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your business
                              and remove all associated data including:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>All bookings</li>
                                <li>All services</li>
                                <li>All staff members</li>
                                <li>Business hours and schedules</li>
                                <li>Reviews and ratings</li>
                                <li>All images and files</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteBusiness}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Business
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Briefcase, Save } from 'lucide-react';
import { formatDZD } from '@/lib/algeria';

interface StaffServicesManagerProps {
  businessId: string;
}

export function StaffServicesManager({ businessId }: StaffServicesManagerProps) {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicesData();
  }, [businessId, user]);

  const fetchServicesData = async () => {
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

      // Fetch all services for this business
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (servicesError) throw servicesError;
      setAllServices(servicesData || []);

      // Fetch staff's current services
      const { data: staffServicesData, error: staffServicesError } = await supabase
        .from('staff_services')
        .select('service_id')
        .eq('staff_id', staffData.id);

      if (staffServicesError) throw staffServicesError;

      const serviceIds = new Set(staffServicesData?.map(ss => ss.service_id) || []);
      setSelectedServices(serviceIds);
    } catch (error: any) {
      console.error('Failed to load services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleSaveServices = async () => {
    if (!staffId) return;

    try {
      setLoading(true);

      // Delete existing service assignments
      await supabase.from('staff_services').delete().eq('staff_id', staffId);

      // Insert new service assignments
      if (selectedServices.size > 0) {
        const servicesToInsert = Array.from(selectedServices).map(serviceId => ({
          staff_id: staffId,
          service_id: serviceId,
        }));

        const { error } = await supabase.from('staff_services').insert(servicesToInsert);
        if (error) throw error;
      }

      toast.success('Services updated successfully');
    } catch (error: any) {
      toast.error('Failed to update services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && allServices.length === 0) {
    return <div className="animate-pulse">Loading services...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          My Services
        </CardTitle>
        <CardDescription>
          Select the services you provide for this business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allServices.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No services available. Ask the business owner to add services first.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {allServices.map(service => (
                <div key={service.id} className="flex items-start space-x-3 border rounded-lg p-3">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.has(service.id)}
                    onCheckedChange={() => handleToggleService(service.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={service.id}
                      className="text-base font-medium cursor-pointer"
                    >
                      {service.name}
                    </Label>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{formatDZD(service.price)}</span>
                      <span>{service.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveServices} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Services
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

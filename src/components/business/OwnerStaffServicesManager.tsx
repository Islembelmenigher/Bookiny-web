import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Briefcase } from 'lucide-react';
import { formatDZD } from '@/lib/algeria';

interface OwnerStaffServicesManagerProps {
  businessId: string;
  staffId: string;
  staffName: string;
  onClose: () => void;
}

export function OwnerStaffServicesManager({ businessId, staffId, staffName, onClose }: OwnerStaffServicesManagerProps) {
  const [services, setServices] = useState<any[]>([]);
  const [assignedServices, setAssignedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [businessId, staffId]);

  const fetchData = async () => {
    try {
      const [servicesRes, assignedRes] = await Promise.all([
        supabase
          .from('services')
          .select('id, name, price, duration_minutes')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('staff_services')
          .select('service_id')
          .eq('staff_id', staffId),
      ]);

      if (servicesRes.error) throw servicesRes.error;
      setServices(servicesRes.data || []);
      setAssignedServices(assignedRes.data?.map(s => s.service_id) || []);
    } catch (error: any) {
      toast.error('Failed to load services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setAssignedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing assignments
      await supabase
        .from('staff_services')
        .delete()
        .eq('staff_id', staffId);

      // Insert new assignments
      if (assignedServices.length > 0) {
        const { error } = await supabase
          .from('staff_services')
          .insert(
            assignedServices.map(serviceId => ({
              staff_id: staffId,
              service_id: serviceId,
            }))
          );

        if (error) throw error;
      }

      toast.success('Services assigned successfully');
      onClose();
    } catch (error: any) {
      toast.error('Failed to save service assignments');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-4">Loading services...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Assign Services to {staffName}</CardTitle>
            <CardDescription>Select which services this staff member can perform</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No services available. Add services first.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={service.id}
                  checked={assignedServices.includes(service.id)}
                  onCheckedChange={() => handleToggleService(service.id)}
                />
                <label
                  htmlFor={service.id}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDZD(service.price)} · {service.duration_minutes} min
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

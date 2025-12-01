import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';

export function DemoDataSeeder() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const seedDemoData = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setLoading(true);
    try {
      // Create a demo business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: 'Elite Hair Studio',
          description: 'Premium hair salon offering cuts, color, and styling services. Experience luxury and style with our expert stylists.',
          category: 'salon',
          address: '123 Fashion Avenue',
          city: 'New York',
          state: 'NY',
          zip_code: '10001',
          phone: '(555) 123-4567',
          email: 'contact@elitehair.com',
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create demo services
      const services = [
        {
          business_id: business.id,
          name: 'Haircut & Style',
          description: 'Professional haircut with wash and styling',
          duration_minutes: 60,
          price: 75,
        },
        {
          business_id: business.id,
          name: 'Full Color Treatment',
          description: 'Complete hair coloring service',
          duration_minutes: 120,
          price: 150,
        },
        {
          business_id: business.id,
          name: 'Highlights',
          description: 'Partial or full highlights',
          duration_minutes: 90,
          price: 120,
        },
        {
          business_id: business.id,
          name: 'Deep Conditioning',
          description: 'Intensive hair treatment',
          duration_minutes: 45,
          price: 50,
        },
        {
          business_id: business.id,
          name: 'Blowout & Style',
          description: 'Professional blow dry and styling',
          duration_minutes: 45,
          price: 55,
        },
      ];

      const { error: servicesError } = await supabase
        .from('services')
        .insert(services);

      if (servicesError) throw servicesError;

      // Create demo staff
      const staff = [
        {
          business_id: business.id,
          name: 'Sarah Johnson',
          title: 'Senior Stylist',
          bio: '15 years of experience specializing in color and cutting',
        },
        {
          business_id: business.id,
          name: 'Michael Chen',
          title: 'Master Stylist',
          bio: 'Award-winning stylist with expertise in modern cuts',
        },
        {
          business_id: business.id,
          name: 'Emma Rodriguez',
          title: 'Color Specialist',
          bio: 'Certified colorist specializing in balayage and ombre',
        },
      ];

      const { error: staffError } = await supabase
        .from('staff')
        .insert(staff);

      if (staffError) throw staffError;

      // Create business hours
      const hours = [
        { business_id: business.id, day_of_week: 1, start_time: '09:00', end_time: '18:00', is_closed: false },
        { business_id: business.id, day_of_week: 2, start_time: '09:00', end_time: '18:00', is_closed: false },
        { business_id: business.id, day_of_week: 3, start_time: '09:00', end_time: '18:00', is_closed: false },
        { business_id: business.id, day_of_week: 4, start_time: '09:00', end_time: '19:00', is_closed: false },
        { business_id: business.id, day_of_week: 5, start_time: '09:00', end_time: '19:00', is_closed: false },
        { business_id: business.id, day_of_week: 6, start_time: '10:00', end_time: '16:00', is_closed: false },
      ];

      const { error: hoursError } = await supabase
        .from('business_hours')
        .insert(hours);

      if (hoursError) throw hoursError;

      toast.success('Demo business created successfully!');
      setOpen(false);
      
      // Redirect to business management
      window.location.href = `/business/${business.id}/manage`;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create demo data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Demo Business
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Demo Business</DialogTitle>
          <DialogDescription>
            This will create a sample hair salon business with services, staff, and hours pre-configured. Perfect for testing the platform!
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What will be created:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Elite Hair Studio (demo business)</p>
            <p>✓ 5 professional services</p>
            <p>✓ 3 staff members</p>
            <p>✓ Business hours (Mon-Sat)</p>
          </CardContent>
        </Card>
        <Button onClick={seedDemoData} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Demo Business'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, User, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OwnerStaffServicesManager } from './OwnerStaffServicesManager';

interface StaffManagerProps {
  businessId: string;
}

export function StaffManager({ businessId }: StaffManagerProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [servicesStaff, setServicesStaff] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
  });

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error('Failed to load staff');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member?: any) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        title: member.title || '',
        bio: member.bio || '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        title: '',
        bio: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update(formData)
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast.success('Staff member updated successfully');
      } else {
        const { error } = await supabase
          .from('staff')
          .insert({
            ...formData,
            business_id: businessId,
          });

        if (error) throw error;
        toast.success('Staff member added successfully');
      }

      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff member');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      // First get the staff member to check if they have a profile_id
      const staffMember = staff.find(s => s.id === id);
      
      // If staff has a profile_id, remove their role access
      if (staffMember?.profile_id) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', staffMember.profile_id)
          .eq('business_id', businessId)
          .eq('role', 'staff');
      }

      // Then set staff as inactive
      const { error } = await supabase
        .from('staff')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Staff member removed');
      fetchStaff();
    } catch (error: any) {
      toast.error('Failed to remove staff member');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading staff...</div>;
  }

  // If viewing services for a staff member
  if (servicesStaff) {
    return (
      <OwnerStaffServicesManager
        businessId={businessId}
        staffId={servicesStaff.id}
        staffName={servicesStaff.name}
        onClose={() => setServicesStaff(null)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members yet. Add your first team member.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      {!member.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {member.title && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {member.title}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServicesStaff(member)}
                      title="Assign Services"
                    >
                      <Briefcase className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title/Role</Label>
              <Input
                id="title"
                placeholder="Senior Stylist"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Brief bio or description..."
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingStaff ? 'Update' : 'Add'} Staff Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

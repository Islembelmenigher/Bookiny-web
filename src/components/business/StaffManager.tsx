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
import { OwnerStaffServicesManager } from './OwnerStaffServicesManager';
import { useTranslation } from 'react-i18next';

interface StaffManagerProps {
  businessId: string;
}

export function StaffManager({ businessId }: StaffManagerProps) {
  const { t } = useTranslation();
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
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error(t('staff.loadError'));
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
        toast.success(t('staff.updateSuccess'));
      } else {
        const { error } = await supabase
          .from('staff')
          .insert({
            ...formData,
            business_id: businessId,
          });

        if (error) throw error;
        toast.success(t('staff.createSuccess'));
      }

      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || t('staff.saveError'));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('staff.deleteConfirm'))) return;

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
      toast.success(t('staff.deleteSuccess'));
      fetchStaff();
    } catch (error: any) {
      toast.error(t('staff.deleteError'));
      console.error(error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{t('common.loading')}</div>;
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
              <CardTitle>{t('staff.title')}</CardTitle>
              <CardDescription>{t('staff.subtitle')}</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('staff.addStaff')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('staff.noStaff')}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{member.name}</h3>
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
                      title={t('staff.assignServices')}
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
              {editingStaff ? t('staff.editStaff') : t('staff.addStaff')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('staff.fullName')} *</Label>
              <Input
                id="name"
                placeholder={t('staff.placeholderName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t('staff.staffTitle')}</Label>
              <Input
                id="title"
                placeholder={t('staff.placeholderTitle')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('staff.staffBio')}</Label>
              <Textarea
                id="bio"
                placeholder={t('staff.placeholderBio')}
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {editingStaff ? t('staff.editStaff') : t('staff.addStaff')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

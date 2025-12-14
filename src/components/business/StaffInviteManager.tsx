import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Mail, Trash2, Copy } from 'lucide-react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const userIdSchema = z.string().uuid('Invalid User ID format');

interface StaffInviteManagerProps {
  businessId: string;
}

interface StaffRole {
  id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function StaffInviteManager({ businessId }: StaffInviteManagerProps) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);

  useEffect(() => {
    fetchStaffRoles();
  }, [businessId]);

  const fetchStaffRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, profiles(full_name, avatar_url)')
        .eq('business_id', businessId)
        .eq('role', 'staff');

      if (error) throw error;
      setStaffRoles((data as unknown as StaffRole[]) || []);
    } catch (error: unknown) {
      console.error('Failed to load staff roles:', error);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedUserId = userIdSchema.parse(userId);

      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', validatedUserId)
        .single();

      if (profileError || !profileData) {
        toast.error(t('staff.access.userNotFound'));
        return;
      }

      // Add staff role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: validatedUserId,
          business_id: businessId,
          role: 'staff',
        });

      if (roleError) {
        if (roleError.code === '23505') {
          toast.error(t('staff.access.alreadyStaff'));
        } else {
          throw roleError;
        }
        return;
      }

      // Also create a staff entry so they appear on the business page
      const { error: staffError } = await supabase
        .from('staff')
        .insert({
          business_id: businessId,
          profile_id: validatedUserId,
          name: profileData.full_name,
          is_active: true,
        });

      if (staffError) throw staffError;

      toast.success(t('staff.access.addSuccess', { name: profileData.full_name }));
      setUserId('');
      fetchStaffRoles();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(t('staff.access.invalidFormat'));
      } else {
        toast.error(t('staff.access.addError'));
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success(t('staff.access.removeSuccess'));
      fetchStaffRoles();
    } catch (error: any) {
      toast.error(t('staff.access.removeError'));
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {t('staff.access.title')}
        </CardTitle>
        <CardDescription>
          {t('staff.access.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2 text-sm">{t('staff.access.howToTitle')}</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>{t('staff.access.step1')}</li>
            <li>{t('staff.access.step2')}</li>
            <li>{t('staff.access.step3')}</li>
            <li>{t('staff.access.step4')}</li>
          </ol>
        </div>

        <form onSubmit={handleInviteStaff} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">{t('staff.access.label')}</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t('staff.access.placeholder')}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? t('staff.access.buttonLoading') : t('staff.access.button')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('staff.access.helpText')}
            </p>
          </div>
        </form>

        {staffRoles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">{t('staff.access.currentStaff')}</h3>
            <div className="space-y-2">
              {staffRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {role.profiles?.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-medium">{role.profiles?.full_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStaff(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
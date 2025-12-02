import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Mail, Trash2, Copy } from 'lucide-react';
import { z } from 'zod';

const userIdSchema = z.string().uuid('Invalid User ID format');

interface StaffInviteManagerProps {
  businessId: string;
}

export function StaffInviteManager({ businessId }: StaffInviteManagerProps) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffRoles, setStaffRoles] = useState<any[]>([]);

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
      setStaffRoles(data || []);
    } catch (error: any) {
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
        toast.error('User not found. Please verify the User ID.');
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
          toast.error('This user is already a staff member');
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

      toast.success(`${profileData.full_name} added as staff member`);
      setUserId('');
      fetchStaffRoles();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to add staff member');
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

      toast.success('Staff member removed');
      fetchStaffRoles();
    } catch (error: any) {
      toast.error('Failed to remove staff member');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Staff Access Management
        </CardTitle>
        <CardDescription>
          Grant staff members access to manage this business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2 text-sm">How to add staff members:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ask your staff member to create an account (if they haven't)</li>
            <li>Staff member should go to their Profile page</li>
            <li>They'll find their User ID at the top of their profile</li>
            <li>Copy and paste that User ID below to grant them access</li>
          </ol>
        </div>

        <form onSubmit={handleInviteStaff} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Staff User ID</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Staff'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              User ID is a unique identifier found on the staff member's profile page
            </p>
          </div>
        </form>

        {staffRoles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Current Staff Members</h3>
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
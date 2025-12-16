import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { LanguageSelector } from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Invalid email address');

const newPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      // Check for existing recovery session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        // If session exists, we're in recovery mode (Supabase creates session when recovery token is processed)
        setIsRecoveryMode(!!session);
        setCheckingRecovery(false);
      }
    };

    // Set up auth state change listener for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        // Supabase fires this event when recovery token is processed
        setIsRecoveryMode(true);
        setCheckingRecovery(false);
      } else if (event === 'SIGNED_IN' && session) {
        // If user signs in normally, not recovery mode
        setIsRecoveryMode(false);
        setCheckingRecovery(false);
      } else if (event === 'SIGNED_OUT') {
        // If signed out, not recovery mode
        setIsRecoveryMode(false);
        setCheckingRecovery(false);
      } else if (session && checkingRecovery) {
        // If we have a session and still checking, it might be recovery
        setIsRecoveryMode(true);
        setCheckingRecovery(false);
      } else if (!session && checkingRecovery) {
        // No session, not recovery mode
        setIsRecoveryMode(false);
        setCheckingRecovery(false);
      }
    });

    // Initial check
    checkRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(resetPasswordEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setResetPasswordLoading(true);
    const { error } = await resetPassword(resetPasswordEmail);
    setResetPasswordLoading(false);

    if (error) {
      toast.error(error.message || t('errors.somethingWrong'));
    } else {
      toast.success(t('auth.passwordResetEmailSent'));
      setResetPasswordEmail('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = newPasswordSchema.parse(newPasswordData);

      const { error } = await supabase.auth.updateUser({
        password: validatedData.newPassword,
      });

      if (error) throw error;

      toast.success(t('profile.passwordUpdated'));
      setNewPasswordData({ newPassword: '', confirmPassword: '' });
      navigate('/auth?mode=signin');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || t('errors.somethingWrong'));
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking recovery mode
  if (checkingRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="absolute top-4 end-4">
          <LanguageSelector />
        </div>
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form to set new password (when user clicks email link - recovery mode)
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 end-4">
          <LanguageSelector />
        </div>

        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.resetPassword')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('auth.setNewPassword')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  {t('profile.newPassword')}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPasswordData.newPassword}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, newPassword: e.target.value })}
                  placeholder={t('profile.enterNewPassword')}
                  className="h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('auth.passwordMinLength')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('profile.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newPasswordData.confirmPassword}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, confirmPassword: e.target.value })}
                  placeholder={t('profile.confirmNewPassword')}
                  className="h-11"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('profile.updating')}
                  </>
                ) : (
                  t('auth.updatePassword')
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/auth?mode=signin')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('auth.backToSignIn')}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form to request password reset email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 end-4">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.resetPassword')}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t('auth.resetPasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">
                {t('auth.emailAddress')}
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder={t('auth.enterEmail')}
                value={resetPasswordEmail}
                onChange={(e) => setResetPasswordEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={resetPasswordLoading}>
              {resetPasswordLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('auth.sending')}
                </>
              ) : (
                t('auth.sendResetLink')
              )}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/auth?mode=signin')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('auth.backToSignIn')}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

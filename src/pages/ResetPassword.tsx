import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoveryMode = async () => {
      // Check query params for ?type=recovery
      const typeFromQuery = searchParams.get('type');
      const isRecoveryFromQuery = typeFromQuery === 'recovery';

      // Check hash for #access_token=...&type=recovery or just #access_token=...
      const hash = window.location.hash;
      let isRecoveryFromHash = false;
      let hasAccessToken = false;
      let typeFromHash: string | null = null;

      if (hash) {
        try {
          const hashParams = new URLSearchParams(hash.substring(1));
          typeFromHash = hashParams.get('type');
          hasAccessToken = hashParams.has('access_token');
          isRecoveryFromHash = typeFromHash === 'recovery' || hasAccessToken;
        } catch (e) {
          // Fallback: check if hash contains access_token
          hasAccessToken = hash.includes('access_token');
          isRecoveryFromHash = hasAccessToken;
        }
      }

      // Check Supabase session for recovery
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const hasRecoverySession = !!session;

      // Recovery mode detected if:
      // 1. type=recovery in query params (mobile fallback)
      // 2. access_token in hash (desktop)
      // 3. type=recovery in hash (desktop)
      // 4. Valid Supabase session exists (Supabase processes token automatically)
      const isRecovery = isRecoveryFromQuery || isRecoveryFromHash || hasRecoverySession;

      if (mounted) {
        setIsRecoveryMode(isRecovery);
        setTokenError(sessionError !== null && !isRecovery);
        setCheckingRecovery(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setTokenError(false);
        setCheckingRecovery(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Check if this is a recovery session by checking session type
        // Recovery sessions are temporary and allow password updates
        setIsRecoveryMode(true);
        setTokenError(false);
        setCheckingRecovery(false);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
        setTokenError(false);
        setCheckingRecovery(false);
      }
    });

    // Initial check
    checkRecoveryMode();

    // Listen for hash changes (in case Supabase processes hash asynchronously)
    const handleHashChange = () => {
      checkRecoveryMode();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [searchParams]);

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
      setTokenError(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTokenError(false);

    try {
      const validatedData = newPasswordSchema.parse(newPasswordData);

      // Verify we still have a valid session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Invalid or expired recovery token. Please request a new password reset email.');
      }

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
        const errorMessage = error.message || t('errors.somethingWrong');
        toast.error(errorMessage);
        setTokenError(true);
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
            {tokenError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  {t('auth.invalidOrExpiredToken', { defaultValue: 'Invalid or expired recovery token. Please request a new password reset email.' })}
                </p>
              </div>
            )}
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

              {tokenError && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setTokenError(false);
                      setIsRecoveryMode(false);
                      setNewPasswordData({ newPassword: '', confirmPassword: '' });
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('auth.requestNewResetLink', { defaultValue: 'Request a new password reset email' })}
                  </button>
                </div>
              )}

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

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Calendar, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { LanguageSelector } from '@/components/LanguageSelector';
import { validateAlgerianPhone } from '@/lib/algeria';
import { Separator } from '@/components/ui/separator';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
const phoneSchema = z.string().refine(validateAlgerianPhone, 'Phone must be Algerian format (05/06/07XXXXXXXX)');

export default function Auth() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const type = searchParams.get('type') || 'client';
  const [activeTab, setActiveTab] = useState(mode);
  const [accountType, setAccountType] = useState<'client' | 'business_owner'>(type === 'business' ? 'business_owner' : 'client');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '', phone: '' });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signInData.email);
      passwordSchema.parse(signInData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setLoading(false);

    if (error) {
      toast.error(error.message || t('errors.somethingWrong'));
    } else {
      toast.success(t('auth.signInSuccess'));
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signUpData.email);
      passwordSchema.parse(signUpData.password);
      nameSchema.parse(signUpData.fullName);
      phoneSchema.parse(signUpData.phone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName, accountType, signUpData.phone);
    setLoading(false);

    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message || t('errors.somethingWrong'));
      }
    } else {
      toast.success(t('auth.signUpSuccess'));
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    // Store the selected account type before OAuth redirect
    localStorage.setItem('pendingAccountType', accountType);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    
    if (error) {
      toast.error(error.message || t('errors.somethingWrong'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 end-4">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.welcomeBack')}!</CardTitle>
          <CardDescription>
            {t('auth.signInToContinue')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Account Type Selector - Always visible */}
          <div className="space-y-2 mb-4">
            <Label>{t('auth.iAmA')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={accountType === 'client' ? 'default' : 'outline'}
                onClick={() => setAccountType('client')}
                className="w-full"
              >
                {t('auth.client')}
              </Button>
              <Button
                type="button"
                variant={accountType === 'business_owner' ? 'default' : 'outline'}
                onClick={() => setAccountType('business_owner')}
                className="w-full"
              >
                {t('auth.business')}
              </Button>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {t('auth.continueWithGoogle')}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.emailAddress')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('auth.enterEmail')}
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth.enterFullName')}
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">{t('common.phone')} *</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('auth.phoneFormat')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.emailAddress')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.enterEmail')}
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('auth.signingUp')}
                    </>
                  ) : (
                    t('auth.signUp')
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
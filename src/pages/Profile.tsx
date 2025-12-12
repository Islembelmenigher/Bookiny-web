import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Phone, Copy, Upload, Globe, MapPin } from 'lucide-react';
import { z } from 'zod';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';
import { validateAlgerianPhone, WILAYAS, getCommunesByWilaya } from '@/lib/algeria';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().refine((val) => !val || validateAlgerianPhone(val), 'Phone must be Algerian format (05/06/07XXXXXXXX)'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
];

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', phone: '', avatar_url: '' });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());
  const [preferredWilaya, setPreferredWilaya] = useState('');
  const [preferredCity, setPreferredCity] = useState('');
  const [communes, setCommunes] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (preferredWilaya) {
      const wilayaCommunes = getCommunesByWilaya(preferredWilaya);
      setCommunes(wilayaCommunes);
      if (!wilayaCommunes.includes(preferredCity)) {
        setPreferredCity('');
      }
    } else {
      setCommunes([]);
      setPreferredCity('');
    }
  }, [preferredWilaya]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, language_preference, preferred_wilaya, preferred_city')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
        });
        if (data.language_preference) {
          setSelectedLanguage(data.language_preference);
          changeLanguage(data.language_preference);
        }
        if (data.preferred_wilaya) {
          setPreferredWilaya(data.preferred_wilaya);
        }
        if (data.preferred_city) {
          setPreferredCity(data.preferred_city);
        }
      }
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = profileSchema.parse(profile);

      const { error } = await supabase
        .from('profiles')
        .update(validatedData)
        .eq('id', user?.id);

      if (error) throw error;

      toast.success(t('profile.profileUpdated'));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(t('errors.somethingWrong'));
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = passwordSchema.parse(passwords);

      const { error } = await supabase.auth.updateUser({
        password: validatedData.newPassword,
      });

      if (error) throw error;

      toast.success(t('profile.passwordUpdated'));
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(t('errors.somethingWrong'));
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.imageOnly'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success(t('profile.profileUpdated'));
    } catch (error: any) {
      toast.error(error.message || t('errors.somethingWrong'));
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    changeLanguage(langCode);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ language_preference: langCode })
          .eq('id', user.id);

        if (error) throw error;
        toast.success(t('profile.languageUpdated'));
      } catch (error) {
        console.error('Failed to save language preference:', error);
        toast.error(t('errors.somethingWrong'));
      }
    }
  };

  const handleLocationChange = async (wilaya: string, city: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferred_wilaya: wilaya || null, 
          preferred_city: city || null 
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(t('profile.locationUpdated'));
    } catch (error) {
      console.error('Failed to save location preference:', error);
      toast.error(t('errors.somethingWrong'));
    }
  };

  const handleWilayaChange = (value: string) => {
    setPreferredWilaya(value);
    setPreferredCity('');
    handleLocationChange(value, '');
  };

  const handleCityChange = (value: string) => {
    setPreferredCity(value);
    handleLocationChange(preferredWilaya, value);
  };

  const clearLocation = async () => {
    setPreferredWilaya('');
    setPreferredCity('');
    await handleLocationChange('', '');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('common.back')}
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('profile.subtitle')}
            </p>
            {user?.id && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('profile.yourUserId')}:</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    {user.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(user.id);
                      toast.success(t('common.copied'));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('profile.shareWithOwner')}
                </p>
              </div>
            )}
          </div>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('profile.languagePreference')}
              </CardTitle>
              <CardDescription>{t('profile.selectLanguage')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder={t('profile.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Preferred Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('profile.preferredLocation')}
              </CardTitle>
              <CardDescription>{t('profile.preferredLocationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('address.wilaya')}</Label>
                  <Select value={preferredWilaya} onValueChange={handleWilayaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('address.selectWilaya')} />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.code}>
                          {wilaya.code} - {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {communes.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('address.city')}</Label>
                    <Select value={preferredCity} onValueChange={handleCityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('address.selectCity')} />
                      </SelectTrigger>
                      <SelectContent>
                        {communes.map((commune) => (
                          <SelectItem key={commune} value={commune}>
                            {commune}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {(preferredWilaya || preferredCity) && (
                <Button variant="outline" size="sm" onClick={clearLocation}>
                  {t('profile.clearLocation')}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.personalInfo')}
              </CardTitle>
              <CardDescription>{t('profile.updateProfile')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm font-medium hover:underline">
                        <Upload className="h-4 w-4" />
                        {uploading ? t('profile.uploading') : t('profile.uploadPicture')}
                      </div>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('profile.imageFormat')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.emailCannotChange')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('auth.fullName')}</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t('auth.enterFullName')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('common.phone')}</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground ms-3 absolute" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      className="ps-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('auth.phoneFormat')}</p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? t('profile.updating') : t('profile.updateProfile')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.changePassword')}</CardTitle>
              <CardDescription>{t('profile.changePassword')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder={t('profile.enterNewPassword')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder={t('profile.confirmNewPassword')}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? t('profile.updating') : t('profile.changePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

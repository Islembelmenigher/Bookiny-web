import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';
import { z } from 'zod';
import { WILAYAS, getCommunesByWilaya, validateAlgerianPhone } from '@/lib/algeria';

const businessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string(),
  wilaya: z.string().min(1, 'Wilaya is required'),
  city: z.string().min(2, 'City/Commune is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  street_name: z.string().min(2, 'Street name is required'),
  street_number: z.string().optional(),
  phone: z.string().refine(validateAlgerianPhone, 'Phone must be Algerian format (05/06/07XXXXXXXX)'),
  email: z.string().email('Valid email is required'),
});

export default function BusinessCreate() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [communes, setCommunes] = useState<string[]>([]);
  const [businessCount, setBusinessCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'barber_men',
    wilaya: '',
    city: '',
    postal_code: '',
    street_name: '',
    street_number: '',
    phone: '',
    email: '',
    website: '',
  });

  // Check how many businesses the user already owns
  useEffect(() => {
    const checkBusinessCount = async () => {
      if (!user?.id) return;
      
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);
      
      setBusinessCount(count || 0);
      setCheckingLimit(false);
    };
    
    checkBusinessCount();
  }, [user]);

  // Auto-fill phone and email from user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();
      
      setFormData(prev => ({
        ...prev,
        phone: data?.phone || '',
        email: user.email || '',
      }));
    };
    
    fetchUserProfile();
  }, [user]);

  // Update communes when wilaya changes
  useEffect(() => {
    if (formData.wilaya) {
      const wilayaCommunes = getCommunesByWilaya(formData.wilaya);
      setCommunes(wilayaCommunes);
      if (wilayaCommunes.length > 0 && !wilayaCommunes.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setCommunes([]);
    }
  }, [formData.wilaya]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      businessSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      // Build full address from Algerian fields
      const fullAddress = `${formData.street_number ? formData.street_number + ' ' : ''}${formData.street_name}`;
      const wilayaName = WILAYAS.find(w => w.code === formData.wilaya)?.name || formData.wilaya;

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category as any,
          address: fullAddress,
          city: formData.city,
          state: wilayaName,
          zip_code: formData.postal_code,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default business hours (Sun-Thu for Algeria, 9:00 AM - 5:00 PM)
      const defaultHours = [0, 1, 2, 3, 4].map(day => ({
        business_id: data.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_closed: false,
      }));

      await supabase.from('business_hours').insert(defaultHours);

      toast.success(t('common.success'));
      navigate(`/business/${data.id}/manage`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create business');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'barber_men', label: t('categories.barber_men') },
    { value: 'barber_women', label: t('categories.barber_women') },
    { value: 'nail_salon', label: t('categories.nail_salon') },
    // { value: 'doctor', label: t('categories.doctor') }, to be returned after lunching the project in the marked
    // { value: 'dentist', label: t('categories.dentist') },
  ];

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('businessCreate.title')}</h1>
            <p className="text-muted-foreground">
              {t('businessCreate.subtitle')}
            </p>
          </div>

          {checkingLimit ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t('businessCreate.limitReached.checking')}</p>
              </CardContent>
            </Card>
          ) : businessCount >= 3 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{t('businessCreate.limitReached.title')}</h2>
                <p className="text-muted-foreground mb-4">
                  {t('businessCreate.limitReached.description')}
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                   {t('business.backToDashboard')}
                </Button>
              </CardContent>
            </Card>
          ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{t('businessCreate.form.title')}</CardTitle>
                <CardDescription>
                  {t('businessCreate.form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('businessCreate.form.name')} *</Label>
                    <Input
                      id="name"
                      placeholder={t('businessCreate.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t('businessCreate.form.category')} *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('businessCreate.form.descriptionLabel')} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t('businessCreate.form.descriptionPlaceholder')}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Algerian Address Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">{t('address.wilaya')} *</Label>
                    <Select
                      value={formData.wilaya}
                      onValueChange={(value) => setFormData({ ...formData, wilaya: value })}
                    >
                      <SelectTrigger id="wilaya">
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

                  <div className="space-y-2">
                    <Label htmlFor="city">{t('address.city')} *</Label>
                    {communes.length > 0 ? (
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger id="city">
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
                    ) : (
                      <Input
                        id="city"
                        placeholder={t('address.city')}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">{t('address.postalCode')} *</Label>
                    <Input
                      id="postal_code"
                      placeholder="16000"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street_name">{t('address.streetName')} *</Label>
                    <Input
                      id="street_name"
                      placeholder={t('address.streetName')}
                      value={formData.street_name}
                      onChange={(e) => setFormData({ ...formData, street_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street_number">{t('address.streetNumber')}</Label>
                    <Input
                      id="street_number"
                      placeholder="12"
                      value={formData.street_number}
                      onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('common.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t('auth.phoneFormat')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('businessCreate.form.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('businessCreate.form.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t('businessCreate.form.website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder={t('businessCreate.form.websitePlaceholder')}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('businessCreate.form.creating')}
                      </>
                    ) : (
                      t('businessCreate.form.submit')
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

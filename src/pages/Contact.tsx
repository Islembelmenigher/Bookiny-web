import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: data,
      });

      if (error) throw error;

      toast({
        title: t('contact.successTitle'),
        description: t('contact.successMessage'),
      });
      reset();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: t('contact.errorTitle'),
        description: t('contact.errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12 px-4">
        <div className="text-center mb-12">
          <Badge variant="teal" className="mb-4">
            {t('contact.badge')}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{t('contact.emailLabel')}</h3>
                    <p className="text-sm text-muted-foreground">belmenigherislem@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{t('contact.phoneLabel')}</h3>
                    <p className="text-sm text-muted-foreground">+48 516 304 549</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{t('contact.addressLabel')}</h3>
                    <p className="text-sm text-muted-foreground">{t('contact.addressValue')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('contact.formTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.nameLabel')} *</Label>
                    <Input
                      id="name"
                      placeholder={t('contact.namePlaceholder')}
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.emailLabel')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('contact.emailPlaceholder')}
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('contact.phoneLabel')}</Label>
                    <Input
                      id="phone"
                      placeholder={t('contact.phonePlaceholder')}
                      {...register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subjectLabel')} *</Label>
                    <Input
                      id="subject"
                      placeholder={t('contact.subjectPlaceholder')}
                      {...register('subject')}
                      className={errors.subject ? 'border-destructive' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.messageLabel')} *</Label>
                  <Textarea
                    id="message"
                    placeholder={t('contact.messagePlaceholder')}
                    rows={6}
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 me-2" />
                      {t('contact.sendButton')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

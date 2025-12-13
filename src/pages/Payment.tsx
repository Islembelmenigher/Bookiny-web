import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export default function Payment() {
  const { t } = useTranslation();

  const plans = [
    {
      id: 'basic',
      name: t('payment.plans.basic.name'),
      price: 2500,
      period: t('payment.period'),
      description: t('payment.plans.basic.description'),
      features: [
        t('payment.plans.basic.features.bookings'),
        t('payment.plans.basic.features.staff'),
        t('payment.plans.basic.features.analytics'),
        t('payment.plans.basic.features.notifications'),
        t('payment.plans.basic.features.support')
      ],
      popular: false
    },
    {
      id: 'professional',
      name: t('payment.plans.professional.name'),
      price: 5000,
      period: t('payment.period'),
      description: t('payment.plans.professional.description'),
      features: [
        t('payment.plans.professional.features.bookings'),
        t('payment.plans.professional.features.staff'),
        t('payment.plans.professional.features.analytics'),
        t('payment.plans.professional.features.notifications'),
        t('payment.plans.professional.features.support'),
        t('payment.plans.professional.features.branding')
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: t('payment.plans.enterprise.name'),
      price: 10000,
      period: t('payment.period'),
      description: t('payment.plans.enterprise.description'),
      features: [
        t('payment.plans.enterprise.features.everything'),
        t('payment.plans.enterprise.features.staff'),
        t('payment.plans.enterprise.features.api'),
        t('payment.plans.enterprise.features.accountManager'),
        t('payment.plans.enterprise.features.integrations'),
        t('payment.plans.enterprise.features.sla')
      ],
      popular: false
    }
  ];

  const handleSubscribe = (planId: string) => {
    // For now, show a toast - in production, this would integrate with a payment provider
    const paymentUrl = `https://pay.example.com/subscribe?plan=${planId}`;
    window.open(paymentUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('payment.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('payment.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.popular ? 'border-primary shadow-md scale-105' : ''
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {t('payment.mostPopular')}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('payment.subscribe')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* One-time payment section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('payment.lifetimeAccess')}</h3>
                    <p className="text-muted-foreground">
                      {t('payment.lifetimeDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatPrice(50000)}</p>
                    <p className="text-sm text-muted-foreground">{t('payment.oneTimePayment')}</p>
                  </div>
                  <Button size="lg" onClick={() => handleSubscribe('lifetime')}>
                    {t('payment.getLifetime')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>
            {t('payment.needHelp')} <a href="#" className="text-primary hover:underline">{t('payment.contactSales')}</a>
          </p>
          <p className="mt-2 text-sm">
            {t('payment.securePayment')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
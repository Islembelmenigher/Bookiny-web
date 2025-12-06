import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2500,
    period: 'month',
    description: 'Perfect for small businesses just getting started',
    features: [
      'Up to 50 bookings/month',
      '1 staff member',
      'Basic analytics',
      'Email notifications',
      'Standard support'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5000,
    period: 'month',
    description: 'Ideal for growing businesses with more needs',
    features: [
      'Unlimited bookings',
      'Up to 5 staff members',
      'Advanced analytics',
      'SMS & Email notifications',
      'Priority support',
      'Custom branding'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 10000,
    period: 'month',
    description: 'For large businesses with complex requirements',
    features: [
      'Everything in Professional',
      'Unlimited staff members',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    popular: false
  }
];

export default function Payment() {
  const { t } = useTranslation();

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
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the perfect plan for your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-md scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Most Popular
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
                  <span className="text-muted-foreground">/{plan.period}</span>
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
                  Subscribe Now
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
                    <h3 className="text-xl font-bold">Lifetime Access</h3>
                    <p className="text-muted-foreground">
                      Pay once, use forever. Get all Professional features.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatPrice(50000)}</p>
                    <p className="text-sm text-muted-foreground">one-time payment</p>
                  </div>
                  <Button size="lg" onClick={() => handleSubscribe('lifetime')}>
                    Get Lifetime Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>
            Need help choosing? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
          <p className="mt-2 text-sm">
            All payments are secure and encrypted. Cancel anytime.
          </p>
        </div>
      </div>
    </Layout>
  );
}
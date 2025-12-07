import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Calendar, Clock, CheckCircle2, User, 
  Building2, Settings, Users, BarChart3, Bell,
  Star, CreditCard, ImageIcon
} from 'lucide-react';

export default function HowToUse() {
  const { t } = useTranslation();

  const clientSteps = [
    {
      icon: Search,
      title: t('howToUse.client.step1Title'),
      description: t('howToUse.client.step1Desc'),
      screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    },
    {
      icon: Building2,
      title: t('howToUse.client.step2Title'),
      description: t('howToUse.client.step2Desc'),
      screenshot: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
    },
    {
      icon: User,
      title: t('howToUse.client.step3Title'),
      description: t('howToUse.client.step3Desc'),
      screenshot: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop',
    },
    {
      icon: Calendar,
      title: t('howToUse.client.step4Title'),
      description: t('howToUse.client.step4Desc'),
      screenshot: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop',
    },
    {
      icon: CheckCircle2,
      title: t('howToUse.client.step5Title'),
      description: t('howToUse.client.step5Desc'),
      screenshot: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
    },
  ];

  const businessSteps = [
    {
      icon: Building2,
      title: t('howToUse.business.step1Title'),
      description: t('howToUse.business.step1Desc'),
      screenshot: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    },
    {
      icon: Settings,
      title: t('howToUse.business.step2Title'),
      description: t('howToUse.business.step2Desc'),
      screenshot: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
    },
    {
      icon: Users,
      title: t('howToUse.business.step3Title'),
      description: t('howToUse.business.step3Desc'),
      screenshot: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    },
    {
      icon: Clock,
      title: t('howToUse.business.step4Title'),
      description: t('howToUse.business.step4Desc'),
      screenshot: 'https://images.unsplash.com/photo-1508780709619-79562169bc64?w=800&h=500&fit=crop',
    },
    {
      icon: Calendar,
      title: t('howToUse.business.step5Title'),
      description: t('howToUse.business.step5Desc'),
      screenshot: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=500&fit=crop',
    },
    {
      icon: BarChart3,
      title: t('howToUse.business.step6Title'),
      description: t('howToUse.business.step6Desc'),
      screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    },
  ];

  const businessFeatures = [
    { icon: Calendar, title: t('howToUse.features.bookingManagement'), desc: t('howToUse.features.bookingManagementDesc') },
    { icon: Users, title: t('howToUse.features.staffManagement'), desc: t('howToUse.features.staffManagementDesc') },
    { icon: Clock, title: t('howToUse.features.workingHours'), desc: t('howToUse.features.workingHoursDesc') },
    { icon: BarChart3, title: t('howToUse.features.analytics'), desc: t('howToUse.features.analyticsDesc') },
    { icon: Bell, title: t('howToUse.features.notifications'), desc: t('howToUse.features.notificationsDesc') },
    { icon: Star, title: t('howToUse.features.reviews'), desc: t('howToUse.features.reviewsDesc') },
    { icon: ImageIcon, title: t('howToUse.features.portfolio'), desc: t('howToUse.features.portfolioDesc') },
    { icon: CreditCard, title: t('howToUse.features.subscription'), desc: t('howToUse.features.subscriptionDesc') },
  ];

  return (
    <Layout>
      <div className="container py-12 px-4">
        <div className="text-center mb-12">
          <Badge variant="teal" className="mb-4">
            {t('howToUse.badge')}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t('howToUse.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howToUse.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="client" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="client" className="text-base py-3">
              <User className="h-4 w-4 me-2" />
              {t('howToUse.forClients')}
            </TabsTrigger>
            <TabsTrigger value="business" className="text-base py-3">
              <Building2 className="h-4 w-4 me-2" />
              {t('howToUse.forBusiness')}
            </TabsTrigger>
          </TabsList>

          {/* Client Guide */}
          <TabsContent value="client" className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {t('howToUse.clientGuideTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('howToUse.clientGuideSubtitle')}
              </p>
            </div>

            {clientSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {t('howToUse.step')} {index + 1}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <div className="md:w-1/2">
                      <img
                        src={step.screenshot}
                        alt={step.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Business Guide */}
          <TabsContent value="business" className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {t('howToUse.businessGuideTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('howToUse.businessGuideSubtitle')}
              </p>
            </div>

            {/* Feature Overview */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                {t('howToUse.featuresOverview')}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {businessFeatures.map((feature, index) => (
                  <Card key={index} className="p-4 hover:shadow-elegant transition-shadow">
                    <CardContent className="p-0 space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-teal" />
                      </div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Step by Step */}
            {businessSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-teal/10 flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-teal" />
                        </div>
                        <Badge variant="teal" className="text-sm">
                          {t('howToUse.step')} {index + 1}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <div className="md:w-1/2">
                      <img
                        src={step.screenshot}
                        alt={step.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

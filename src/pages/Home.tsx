import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Sparkles, Filter, CalendarCheck, Clock, Shield, Star, Heart, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ALGERIA_WILAYAS } from '@/lib/algeria';
import heroImage from '@/assets/hero-image.jpg';

export default function Home() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  const wilayaData = ALGERIA_WILAYAS.find(w => w.code === selectedWilaya);
  const communes = wilayaData?.communes || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (selectedWilaya) params.set('wilaya', selectedWilaya);
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const categories = [
    { 
      name: t('categories.barber_men'), 
      category: 'barber_men',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.barber_women'), 
      category: 'barber_women',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.nail_salon'), 
      category: 'nail_salon',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.doctor'), 
      category: 'doctor',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.dentist'), 
      category: 'dentist',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop'
    },
  ];

  const clientBenefits = [
    {
      icon: CalendarCheck,
      title: t('home.clientBenefit1Title'),
      description: t('home.clientBenefit1Desc'),
    },
    {
      icon: Clock,
      title: t('home.clientBenefit2Title'),
      description: t('home.clientBenefit2Desc'),
    },
    {
      icon: Star,
      title: t('home.clientBenefit3Title'),
      description: t('home.clientBenefit3Desc'),
    },
    {
      icon: Shield,
      title: t('home.clientBenefit4Title'),
      description: t('home.clientBenefit4Desc'),
    },
  ];

  const bookingSteps = [
    {
      step: '1',
      title: t('home.bookingStep1Title'),
      description: t('home.bookingStep1Desc'),
    },
    {
      step: '2',
      title: t('home.bookingStep2Title'),
      description: t('home.bookingStep2Desc'),
    },
    {
      step: '3',
      title: t('home.bookingStep3Title'),
      description: t('home.bookingStep3Desc'),
    },
    {
      step: '4',
      title: t('home.bookingStep4Title'),
      description: t('home.bookingStep4Desc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        
        <div className="relative z-10 container px-4">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground space-y-6">
            <Badge variant="secondary" className="mb-4 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20">
              <Sparkles className="h-3 w-3 me-1" />
              {t('home.heroTitle')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              {t('home.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto mt-8">
              <div className="flex-1 relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-12 h-14 text-base bg-card shadow-card text-foreground rounded-xl border-0"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="secondary" size="lg" className="h-14 px-5">
                    <Filter className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">{t('search.filterByArea')}</h4>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">{t('address.wilaya')}</Label>
                      <Select value={selectedWilaya || "__all__"} onValueChange={(v) => { setSelectedWilaya(v === "__all__" ? "" : v); setSelectedCity(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('address.selectWilaya')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">{t('common.all')}</SelectItem>
                          {ALGERIA_WILAYAS.map((w) => (
                            <SelectItem key={w.code} value={w.code}>
                              {w.code} - {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedWilaya && communes.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{t('address.city')}</Label>
                        <Select value={selectedCity || "__all__"} onValueChange={(v) => setSelectedCity(v === "__all__" ? "" : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('address.selectCity')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">{t('common.all')}</SelectItem>
                            {communes.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <Button type="submit" variant="accent" size="lg" className="h-14 px-8">
                {t('home.searchButton')}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10 text-foreground">{t('home.popularCategories')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="cursor-pointer overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow border-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[180px]"
                onClick={() => navigate(`/search?category=${cat.category}`)}
              >
                <CardContent className="p-0 relative h-40">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                    <h3 className="font-semibold text-card text-base">{cat.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-card">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12 text-foreground">{t('home.howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-elegant">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t('home.step1Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('home.step1Desc')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-teal mx-auto flex items-center justify-center text-teal-foreground text-2xl font-bold shadow-elegant">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t('home.step2Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('home.step2Desc')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center text-accent-foreground text-2xl font-bold shadow-elegant">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t('home.step3Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('home.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Clients Love Us */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <Badge variant="teal" className="mb-4">
              <Heart className="h-3 w-3 me-1" />
              {t('home.whyClientsLoveUs')}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              {t('home.clientSectionTitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.clientSectionSubtitle')}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {clientBenefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-elegant transition-shadow">
                <CardContent className="p-0 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 mx-auto flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Steps */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-8 text-foreground">
              {t('home.howToBook')}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bookingSteps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="p-5 h-full">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal text-teal-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {step.step}
                        </div>
                        <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground ps-11">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < bookingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Client Images */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden h-48">
              <img 
                src="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop" 
                alt="Client booking appointment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="secondary" className="bg-card/90 text-foreground">
                  <CheckCircle2 className="h-3 w-3 me-1" />
                  {t('home.easyBooking')}
                </Badge>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-48">
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop" 
                alt="Beauty salon service"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="secondary" className="bg-card/90 text-foreground">
                  <Star className="h-3 w-3 me-1" />
                  {t('home.topRated')}
                </Badge>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-48">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop" 
                alt="Hair styling service"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="secondary" className="bg-card/90 text-foreground">
                  <Clock className="h-3 w-3 me-1" />
                  {t('home.saveTime')}
                </Badge>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-48">
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop" 
                alt="Medical consultation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="secondary" className="bg-card/90 text-foreground">
                  <Shield className="h-3 w-3 me-1" />
                  {t('home.verified')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/85 max-w-2xl mx-auto">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-card text-foreground hover:bg-card/90">
              <a href="/search">
                {t('home.findServices')}
                <ChevronRight className="ms-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/20" asChild>
              <a href="/auth?mode=signup&type=business">
                {t('home.listBusiness')}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
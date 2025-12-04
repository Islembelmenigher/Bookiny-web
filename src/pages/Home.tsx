import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Sparkles, Filter } from 'lucide-react';
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
      name: t('categories.salon'), 
      category: 'salon',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.spa'), 
      category: 'spa',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.barbershop'), 
      category: 'barbershop',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.nail_salon'), 
      category: 'nail_salon',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.beauty'), 
      category: 'beauty',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop'
    },
    { 
      name: t('categories.fitness'), 
      category: 'fitness',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="cursor-pointer overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow border-0"
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

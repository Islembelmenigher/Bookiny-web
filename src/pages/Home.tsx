import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import heroImage from '@/assets/hero-image.jpg';

export default function Home() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        </div>
        
        <div className="relative z-10 container px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 me-1" />
              {t('home.heroTitle')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('home.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mt-8">
              <div className="flex-1 relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-12 h-14 text-lg bg-white shadow-elegant text-foreground"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                {t('home.searchButton')}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.popularCategories')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="cursor-pointer overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                onClick={() => navigate(`/search?category=${cat.category}`)}
              >
                <CardContent className="p-0 relative h-40">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                    <h3 className="font-semibold text-white text-lg">{cat.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">{t('home.step1Title')}</h3>
              <p className="text-muted-foreground">
                {t('home.step1Desc')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">{t('home.step2Title')}</h3>
              <p className="text-muted-foreground">
                {t('home.step2Desc')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">{t('home.step3Title')}</h3>
              <p className="text-muted-foreground">
                {t('home.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/search">
                {t('home.findServices')}
                <ChevronRight className="ms-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
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

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBusinesses();
  }, [searchParams]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select(`
          *,
          profiles:owner_id (full_name),
          services (count)
        `)
        .eq('is_active', true);

      const category = searchParams.get('category');
      if (category) {
        query = query.eq('category', category as any);
      }

      const searchTerm = searchParams.get('q');
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
      
      // Fetch ratings for each business
      if (data && data.length > 0) {
        const ratingsMap: Record<string, number> = {};
        for (const business of data) {
          const { data: ratingData } = await supabase.rpc('get_business_average_rating', { business_uuid: business.id });
          ratingsMap[business.id] = ratingData || 0;
        }
        setRatings(ratingsMap);
      }
    } catch (error: any) {
      toast.error(t('errors.somethingWrong'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const categories = [
    { label: 'All', value: '' },
    { label: 'Salon', value: 'salon' },
    { label: 'Spa', value: 'spa' },
    { label: 'Barbershop', value: 'barbershop' },
    { label: 'Nail Salon', value: 'nail_salon' },
    { label: 'Massage', value: 'massage' },
    { label: 'Beauty', value: 'beauty' },
    { label: 'Fitness', value: 'fitness' },
  ];

  const currentCategory = searchParams.get('category') || '';

  return (
    <Layout>
      <div className="container py-8 px-4">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
            <div className="flex-1 relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 h-12 text-foreground"
              />
            </div>
            <Button type="submit" size="lg">{t('common.search')}</Button>
          </form>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={currentCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (cat.value) {
                    setSearchParams({ category: cat.value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">{t('search.noBusinesses')}. {t('search.tryDifferent')}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground">
                Found {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Link key={business.id} to={`/business/${business.id}`}>
                  <Card className="h-full hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: business.cover_image_url
                          ? `url(${business.cover_image_url})`
                          : 'linear-gradient(135deg, hsl(185 84% 45%), hsl(185 84% 60%))',
                      }}
                    ></div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{business.name}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {business.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      {business.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {business.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {business.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{business.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">{ratings[business.id] || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

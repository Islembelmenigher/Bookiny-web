import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Clock, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WILAYAS, getCommunesByWilaya } from '@/lib/algeria';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [filterWilaya, setFilterWilaya] = useState(searchParams.get('wilaya') || '');
  const [filterCity, setFilterCity] = useState(searchParams.get('city') || '');
  const [communes, setCommunes] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [searchParams]);

  useEffect(() => {
    if (filterWilaya) {
      const wilayaCommunes = getCommunesByWilaya(filterWilaya);
      setCommunes(wilayaCommunes);
    } else {
      setCommunes([]);
      setFilterCity('');
    }
  }, [filterWilaya]);

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

      // Filter by wilaya (stored in state field)
      const wilayaParam = searchParams.get('wilaya');
      if (wilayaParam) {
        const wilayaName = WILAYAS.find(w => w.code === wilayaParam)?.name;
        if (wilayaName) {
          query = query.eq('state', wilayaName);
        }
      }

      // Filter by city
      const cityParam = searchParams.get('city');
      if (cityParam) {
        query = query.eq('city', cityParam);
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
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery;
    if (filterWilaya) params.wilaya = filterWilaya;
    if (filterCity) params.city = filterCity;
    setSearchParams(params);
  };

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery;
    if (filterWilaya) params.wilaya = filterWilaya;
    if (filterCity) params.city = filterCity;
    const category = searchParams.get('category');
    if (category) params.category = category;
    setSearchParams(params);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterWilaya('');
    setFilterCity('');
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery;
    const category = searchParams.get('category');
    if (category) params.category = category;
    setSearchParams(params);
    setFilterOpen(false);
  };

  const hasActiveFilters = filterWilaya || filterCity;

  const categories = [
    { label: 'All', value: '' },
    { label: 'Barber for Men', value: 'barber_men' },
    { label: 'Barber for Women', value: 'barber_women' },
    { label: 'Nail Salon', value: 'nail_salon' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Dentist', value: 'dentist' },
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
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="lg" className="relative">
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -end-1 h-3 w-3 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold">{t('search.filterByLocation')}</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('address.wilaya')}</label>
                    <Select value={filterWilaya} onValueChange={setFilterWilaya}>
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
                      <label className="text-sm font-medium">{t('address.city')}</label>
                      <Select value={filterCity} onValueChange={setFilterCity}>
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

                  <div className="flex gap-2">
                    <Button onClick={applyFilters} className="flex-1">
                      {t('search.applyFilters')}
                    </Button>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" size="lg">{t('home.searchButton')}</Button>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex gap-2 justify-center mb-4 flex-wrap">
              {filterWilaya && (
                <Badge variant="secondary" className="gap-1">
                  {WILAYAS.find(w => w.code === filterWilaya)?.name}
                  <button onClick={() => { setFilterWilaya(''); applyFilters(); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterCity && (
                <Badge variant="secondary" className="gap-1">
                  {filterCity}
                  <button onClick={() => { setFilterCity(''); applyFilters(); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

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

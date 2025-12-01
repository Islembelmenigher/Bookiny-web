import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import heroImage from '@/assets/hero-image.jpg';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Hair Salon', icon: '💇', category: 'salon' },
    { name: 'Spa & Massage', icon: '💆', category: 'spa' },
    { name: 'Barbershop', icon: '✂️', category: 'barbershop' },
    { name: 'Nail Salon', icon: '💅', category: 'nail_salon' },
    { name: 'Beauty', icon: '✨', category: 'beauty' },
    { name: 'Fitness', icon: '💪', category: 'fitness' },
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
              <Sparkles className="h-3 w-3 mr-1" />
              Book Local Services Instantly
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Discover & Book
              <br />
              <span className="text-accent">Local Services</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find and book appointments with the best salons, spas, and wellness professionals in your area
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mt-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for services, businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white shadow-elegant"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="cursor-pointer hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate(`/search?category=${cat.category}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold">{cat.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Search & Discover</h3>
              <p className="text-muted-foreground">
                Browse thousands of local businesses and services
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Pick Your Time</h3>
              <p className="text-muted-foreground">
                Select available time slots that fit your schedule
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Confirmed</h3>
              <p className="text-muted-foreground">
                Receive instant confirmation and manage your bookings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of happy customers booking with Booksy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/search">
                Find Services
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <a href="/auth?mode=signup&type=business">
                List Your Business
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
